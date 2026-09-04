import hashlib
import json
from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


def resize_premultiplied(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    premultiplied = image.convert("RGBA").convert("RGBa")
    return premultiplied.resize(size, Image.Resampling.LANCZOS).convert("RGBA")


def comparison_metrics(reference: Image.Image, candidate: Image.Image) -> dict:
    restored = resize_premultiplied(candidate, reference.size)
    alpha_difference = ImageChops.difference(
        reference.getchannel("A"),
        restored.getchannel("A"),
    )
    total_pixels = reference.width * reference.height

    def changed_pixel_ratio(difference: Image.Image, threshold: int = 4) -> float:
        channels = difference.split()
        changed = channels[0].point(lambda value: 255 if value > threshold else 0)
        for channel in channels[1:]:
            changed = ImageChops.lighter(
                changed,
                channel.point(lambda value: 255 if value > threshold else 0),
            )
        return changed.histogram()[255] / total_pixels

    def composite_difference(background: tuple[int, int, int]) -> dict:
        backdrop = Image.new("RGBA", reference.size, (*background, 255))
        reference_composite = Image.alpha_composite(backdrop, reference).convert("RGB")
        restored_composite = Image.alpha_composite(backdrop, restored).convert("RGB")
        difference = ImageChops.difference(reference_composite, restored_composite)
        return {
            "meanAbsoluteRgb": round(sum(ImageStat.Stat(difference).mean) / 3, 4),
            "changedPixelRatioAbove4": round(changed_pixel_ratio(difference), 6),
            "maxChannelDifference": max(channel.getextrema()[1] for channel in difference.split()),
        }

    alpha_histogram = alpha_difference.histogram()
    return {
        "meanAbsoluteAlpha": round(ImageStat.Stat(alpha_difference).mean[0], 4),
        "changedAlphaPixelRatioAbove4": round(sum(alpha_histogram[5:]) / total_pixels, 6),
        "darkComposite": composite_difference((7, 9, 15)),
        "lightComposite": composite_difference((246, 247, 251)),
    }


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = ArgumentParser(
        description="Upscale a transparent raster without introducing alpha-edge halos."
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--scale", type=int, default=2)
    args = parser.parse_args()

    if args.scale < 2:
        parser.error("--scale must be at least 2")
    if args.input.suffix.lower() != ".png" or args.output.suffix.lower() != ".png":
        parser.error("input and output must be PNG files")

    with Image.open(args.input) as source:
        source.load()
        source = source.convert("RGBA")
        target_size = (source.width * args.scale, source.height * args.scale)
        candidate = resize_premultiplied(source, target_size)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    candidate.save(args.output, format="PNG", optimize=True, compress_level=9)

    alpha = candidate.getchannel("A")
    alpha_histogram = alpha.histogram()
    report = {
        "input": str(args.input),
        "output": str(args.output),
        "sourceSize": list(source.size),
        "outputSize": list(candidate.size),
        "mode": candidate.mode,
        "alphaRange": list(alpha.getextrema()),
        "transparentPixelCount": alpha_histogram[0],
        "comparisonAfterDownsample": comparison_metrics(source, candidate),
        "sha256": sha256(args.output),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
