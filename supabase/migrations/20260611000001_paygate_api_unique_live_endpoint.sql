with ranked_live_apis as (
  select
    id,
    row_number() over (
      partition by lower(method), lower(upstream_base_url), path
      order by
        case when status = 'active' then 0 else 1 end,
        created_at asc,
        id asc
    ) as duplicate_rank
  from public.apis
  where status in ('pending_setup', 'active')
)
update public.apis
set
  status = 'archived',
  active = false,
  archived_at = coalesce(archived_at, now())
where id in (
  select id
  from ranked_live_apis
  where duplicate_rank > 1
);

create unique index if not exists apis_unique_live_endpoint_idx
on public.apis (lower(method), lower(upstream_base_url), path)
where status in ('pending_setup', 'active');

comment on index public.apis_unique_live_endpoint_idx is
  'Prevents the same live upstream endpoint from being claimed by multiple active/pending PayGate APIs.';
