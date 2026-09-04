import json
import math
from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageOps, ImageStat


def load_rgb(path: Path, size):
    image = Image.open(path).convert("RGB")
    if image.size != size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    return image


def image_metrics(reference: Image.Image, actual: Image.Image, threshold: int = 12):
    difference = ImageChops.difference(reference, actual)
    stat = ImageStat.Stat(difference)
    mean_abs = sum(stat.mean) / len(stat.mean)
    rms = math.sqrt(sum(value * value for value in stat.rms) / len(stat.rms))
    diff_bbox = difference.getbbox()
    changed_pixels = 0
    diff_pixels = difference.load()
    for y in range(reference.height):
        for x in range(reference.width):
            if max(diff_pixels[x, y]) > threshold:
                changed_pixels += 1

    bbox_area = 0
    if diff_bbox:
        bbox_area = (diff_bbox[2] - diff_bbox[0]) * (diff_bbox[3] - diff_bbox[1])

    total_pixels = reference.width * reference.height
    return {
        "meanAbs": round(mean_abs, 3),
        "meanAbsNormalized": round(mean_abs / 255, 5),
        "rms": round(rms, 3),
        "rmsNormalized": round(rms / 255, 5),
        "changedPixelRatio": round(changed_pixels / total_pixels, 5),
        "changedPixelThreshold": threshold,
        "diffBoundingBox": list(diff_bbox) if diff_bbox else None,
        "diffBoundingBoxAreaRatio": round(bbox_area / total_pixels, 5),
    }


def make_heatmap(reference: Image.Image, actual: Image.Image):
    difference = ImageChops.difference(reference, actual).convert("L")
    difference = ImageEnhance.Contrast(difference).enhance(3.2)
    difference = ImageEnhance.Brightness(difference).enhance(1.35)
    return ImageOps.colorize(difference, black="#070a12", mid="#735cff", white="#ff5d7d")


def labeled_pair(reference: Image.Image, actual: Image.Image):
    label_height = 34
    canvas = Image.new("RGB", (reference.width * 2, reference.height + label_height), "#080a0f")
    canvas.paste(reference, (0, label_height))
    canvas.paste(actual, (reference.width, label_height))
    draw = ImageDraw.Draw(canvas)
    draw.text((18, 10), "REFERENCE", fill="#d7d9e5")
    draw.text((reference.width + 18, 10), "PAYGATE BUILD", fill="#d7d9e5")
    return canvas


def make_contact_sheet(reference: Image.Image, actual: Image.Image, heatmap: Image.Image):
    tile_width = 360
    tile_height = round(tile_width * reference.height / reference.width)
    header_height = 28
    items = [
        ("reference", reference),
        ("build", actual),
        ("overlay", Image.blend(reference, actual, 0.5)),
        ("diff heatmap", heatmap),
    ]
    sheet = Image.new("RGB", (tile_width * len(items), tile_height + header_height), "#080a0f")
    draw = ImageDraw.Draw(sheet)
    for index, (label, image) in enumerate(items):
        x = index * tile_width
        draw.text((x + 10, 8), label.upper(), fill="#d7d9e5")
        sheet.paste(image.resize((tile_width, tile_height), Image.Resampling.LANCZOS), (x, header_height))
    return sheet


def crop_region(image: Image.Image, box):
    x, y, width, height = box
    left = max(0, min(image.width, int(x)))
    top = max(0, min(image.height, int(y)))
    right = max(left, min(image.width, int(x + width)))
    bottom = max(top, min(image.height, int(y + height)))
    return image.crop((left, top, right, bottom))


def make_region_sheet(reference: Image.Image, actual: Image.Image, regions):
    tile_width = 300
    tiles = []
    for region in regions:
        box = region["box"]
        ref_crop = crop_region(reference, box)
        actual_crop = crop_region(actual, box)
        heat_crop = make_heatmap(ref_crop, actual_crop)
        tile_height = max(110, round(tile_width * ref_crop.height / max(1, ref_crop.width)))
        tile = Image.new("RGB", (tile_width * 3, tile_height + 32), "#080a0f")
        draw = ImageDraw.Draw(tile)
        draw.text((8, 8), region["label"], fill="#d7d9e5")
        for index, crop in enumerate((ref_crop, actual_crop, heat_crop)):
            tile.paste(crop.resize((tile_width, tile_height), Image.Resampling.LANCZOS), (index * tile_width, 32))
        tiles.append(tile)

    sheet = Image.new("RGB", (tile_width * 3, sum(tile.height for tile in tiles)), "#080a0f")
    offset = 0
    for tile in tiles:
        sheet.paste(tile, (0, offset))
        offset += tile.height
    return sheet


def frame_motion_metrics(frames):
    energies = []
    for previous, current in zip(frames, frames[1:]):
        previous_gray = previous.convert("L")
        current_gray = current.convert("L")
        difference = ImageChops.difference(previous_gray, current_gray)
        energies.append(ImageStat.Stat(difference).mean[0] / 255)
    if not energies:
        return {"frameCount": len(frames), "energy": []}

    ordered = sorted(energies)
    p95_index = min(len(ordered) - 1, max(0, math.ceil(len(ordered) * 0.95) - 1))
    return {
        "frameCount": len(frames),
        "energy": [round(value, 5) for value in energies],
        "medianEnergy": round(ordered[len(ordered) // 2], 5),
        "p95Energy": round(ordered[p95_index], 5),
        "activeFrameRatio": round(sum(value > 0.001 for value in energies) / len(energies), 5),
        "oracleComparison": "not available: supplied reference is a single static PNG",
    }


def make_motion_sheet(frames):
    if not frames:
        return None
    tile_width = 240
    tile_height = round(tile_width * frames[0].height / frames[0].width)
    columns = min(4, len(frames))
    rows = math.ceil(len(frames) / columns)
    sheet = Image.new("RGB", (columns * tile_width, rows * (tile_height + 24)), "#080a0f")
    draw = ImageDraw.Draw(sheet)
    for index, frame in enumerate(frames):
        x = (index % columns) * tile_width
        y = (index // columns) * (tile_height + 24)
        draw.text((x + 8, y + 6), f"frame {index:02d}", fill="#d7d9e5")
        sheet.paste(frame.resize((tile_width, tile_height), Image.Resampling.LANCZOS), (x, y + 24))
    return sheet


def evaluate_thresholds(report, args):
    thresholds = {
        "maxMeanAbs": args.max_mean_abs,
        "maxChangedPixelRatio": args.max_changed_pixel_ratio,
        "maxRegionMeanAbs": args.max_region_mean_abs,
        "maxRegionChangedPixelRatio": args.max_region_changed_pixel_ratio,
        "minMotionMedian": args.min_motion_median,
        "maxMotionP95": args.max_motion_p95,
    }
    metrics = report["metrics"]
    motion = report["motion"]
    violations = []

    if args.max_mean_abs is not None and metrics["meanAbs"] > args.max_mean_abs:
        violations.append(f"meanAbs {metrics['meanAbs']:.3f} exceeds {args.max_mean_abs:.3f}")
    if args.max_changed_pixel_ratio is not None and metrics["changedPixelRatio"] > args.max_changed_pixel_ratio:
        violations.append(
            f"changedPixelRatio {metrics['changedPixelRatio']:.5f} exceeds {args.max_changed_pixel_ratio:.5f}"
        )

    for region in report["regions"]:
        region_metrics = region["metrics"]
        if args.max_region_mean_abs is not None and region_metrics["meanAbs"] > args.max_region_mean_abs:
            violations.append(
                f"region {region['id']} meanAbs {region_metrics['meanAbs']:.3f} exceeds {args.max_region_mean_abs:.3f}"
            )
        if (
            args.max_region_changed_pixel_ratio is not None
            and region_metrics["changedPixelRatio"] > args.max_region_changed_pixel_ratio
        ):
            violations.append(
                f"region {region['id']} changedPixelRatio {region_metrics['changedPixelRatio']:.5f} "
                f"exceeds {args.max_region_changed_pixel_ratio:.5f}"
            )

    if args.min_motion_median is not None:
        if motion is None:
            violations.append("motion frames are required for the minimum motion threshold")
        elif motion["medianEnergy"] < args.min_motion_median:
            violations.append(
                f"motion median {motion['medianEnergy']:.5f} is below {args.min_motion_median:.5f}"
            )
    if args.max_motion_p95 is not None:
        if motion is None:
            violations.append("motion frames are required for the maximum motion threshold")
        elif motion["p95Energy"] > args.max_motion_p95:
            violations.append(f"motion p95 {motion['p95Energy']:.5f} exceeds {args.max_motion_p95:.5f}")

    return {
        "status": "fail" if violations else "pass",
        "thresholds": thresholds,
        "violations": violations,
        "scope": "Local deterministic Chromium guard; human review remains required for intentional design changes.",
    }


def compare(reference_path: Path, actual_path: Path, output_dir: Path, prefix: str, regions_path: Path | None, frames_dir: Path | None):
    output_dir.mkdir(parents=True, exist_ok=True)
    reference = Image.open(reference_path).convert("RGB")
    actual = load_rgb(actual_path, reference.size)
    metrics = image_metrics(reference, actual)
    heatmap = make_heatmap(reference, actual)

    outputs = {}
    outputs["sideBySide"] = output_dir / f"{prefix}-side-by-side.png"
    outputs["overlay"] = output_dir / f"{prefix}-overlay.png"
    outputs["heatmap"] = output_dir / f"{prefix}-diff-heatmap.png"
    outputs["contactSheet"] = output_dir / f"{prefix}-contact-sheet.png"
    labeled_pair(reference, actual).save(outputs["sideBySide"])
    Image.blend(reference, actual, 0.5).save(outputs["overlay"])
    heatmap.save(outputs["heatmap"])
    make_contact_sheet(reference, actual, heatmap).save(outputs["contactSheet"])

    regions = []
    region_sheet_path = None
    if regions_path and regions_path.exists():
        region_manifest = json.loads(regions_path.read_text(encoding="utf-8"))
        for region in region_manifest.get("regions", []):
            ref_crop = crop_region(reference, region["box"])
            actual_crop = crop_region(actual, region["box"])
            regions.append({
                "id": region["id"],
                "label": region["label"],
                "box": region["box"],
                "note": region.get("note", ""),
                "metrics": image_metrics(ref_crop, actual_crop),
            })
        region_sheet_path = output_dir / f"{prefix}-regions-contact-sheet.png"
        make_region_sheet(reference, actual, region_manifest.get("regions", [])).save(region_sheet_path)
        outputs["regionsContactSheet"] = region_sheet_path

    motion = None
    if frames_dir and frames_dir.exists():
        frame_paths = sorted(frames_dir.glob("*.png"))
        frames = [Image.open(path).convert("RGB") for path in frame_paths]
        motion = frame_motion_metrics(frames)
        motion_sheet = make_motion_sheet(frames)
        if motion_sheet:
            outputs["motionContactSheet"] = output_dir / f"{prefix}-motion-contact-sheet.png"
            motion_sheet.save(outputs["motionContactSheet"])

    report = {
        "reference": str(reference_path),
        "actual": str(actual_path),
        "viewport": {"width": reference.width, "height": reference.height},
        "metrics": metrics,
        "regions": regions,
        "motion": motion,
        "artifacts": {key: str(value) for key, value in outputs.items()},
        "interpretation": "Diagnostic comparison only. The reference is an AI-generated static concept, so image similarity does not prove product correctness or motion parity.",
    }
    report_path = output_dir / f"{prefix}-comparison.json"
    report["artifacts"]["report"] = str(report_path)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def main():
    parser = ArgumentParser(description="Create Lando-style diagnostic evidence for the PayGate landing reference.")
    parser.add_argument("--reference", default="docs/evidence/landing-reference/paygate-reference-dark.png")
    parser.add_argument("--actual", default="docs/evidence/landing-reference/latest/dark-desktop-1491x1055.png")
    parser.add_argument("--output-dir", default="docs/evidence/landing-reference/latest")
    parser.add_argument("--prefix", default="dark-desktop")
    parser.add_argument("--regions", default="docs/evidence/landing-reference/paygate-dark-regions.json")
    parser.add_argument("--frames-dir", default=None)
    parser.add_argument("--max-mean-abs", type=float, default=None)
    parser.add_argument("--max-changed-pixel-ratio", type=float, default=None)
    parser.add_argument("--max-region-mean-abs", type=float, default=None)
    parser.add_argument("--max-region-changed-pixel-ratio", type=float, default=None)
    parser.add_argument("--min-motion-median", type=float, default=None)
    parser.add_argument("--max-motion-p95", type=float, default=None)
    args = parser.parse_args()

    report = compare(
        Path(args.reference),
        Path(args.actual),
        Path(args.output_dir),
        args.prefix,
        Path(args.regions) if args.regions else None,
        Path(args.frames_dir) if args.frames_dir else None,
    )
    acceptance = evaluate_thresholds(report, args)
    report["acceptance"] = acceptance
    Path(report["artifacts"]["report"]).write_text(json.dumps(report, indent=2), encoding="utf-8")
    metrics = report["metrics"]
    print(f"reference={report['reference']}")
    print(f"actual={report['actual']}")
    print(f"mean_abs_diff={metrics['meanAbs']:.3f}")
    print(f"changed_pixel_ratio={metrics['changedPixelRatio']:.3f}")
    if report["motion"]:
        print(f"build_motion_median={report['motion']['medianEnergy']:.5f}")
        print(f"build_motion_p95={report['motion']['p95Energy']:.5f}")
    for key, value in report["artifacts"].items():
        print(f"{key}={value}")
    print(f"acceptance={acceptance['status']}")
    if acceptance["violations"]:
        for violation in acceptance["violations"]:
            print(f"violation={violation}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
