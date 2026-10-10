create schema assurance;
revoke all on schema assurance from public;

create function assurance.touch() returns trigger language plpgsql as $$
begin new.updated_at = clock_timestamp(); return new; end $$;
create table assurance.suppliers (
 id uuid primary key default gen_random_uuid(),
 reference text not null check (btrim(reference) <> ''),
 name text not null check (btrim(name) <> ''),
 owner text, category text, country text,
 criticality text not null default 'unknown' check (criticality in ('unknown','low','medium','high')),
 personal_data text not null default 'unknown' check (personal_data in ('unknown','yes','no')),
 overseas text not null default 'unknown' check (overseas in ('unknown','yes','no')),
 insurance_required boolean not null default false,
 state text not null default 'onboarding' check (state in ('onboarding','active','suspended','archived')),
 review_due date, annual_spend numeric(16,2) check (annual_spend >= 0),
 currency text check (currency ~ '^[A-Z]{3}$'),
 source_id text unique, source_payload jsonb, source_hash text,
 version integer not null default 1,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 check (annual_spend is null or currency is not null)
);
create unique index supplier_ref on assurance.suppliers(lower(reference));
create function assurance.supplier_touch() returns trigger language plpgsql as $$
begin new.updated_at=clock_timestamp(); new.version=old.version+1; return new; end $$;
create trigger touch before update on assurance.suppliers for each row execute function assurance.supplier_touch();
create table assurance.evidence (
 id uuid primary key default gen_random_uuid(), supplier_id uuid not null references assurance.suppliers,
 kind text not null check (kind in ('identity','insurance','security','overseas')),
 evidence_ref text not null check (btrim(evidence_ref) <> ''),
 reviewed_on date not null, expires_on date not null, actor text not null check (btrim(actor) <> ''),
 note text not null, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 check (expires_on >= reviewed_on)
);
create table assurance.findings (
 id uuid primary key default gen_random_uuid(), supplier_id uuid not null references assurance.suppliers,
 title text not null check (btrim(title) <> ''), severity text not null check (severity in ('low','medium','high','critical')),
 owner text not null check (btrim(owner) <> ''), due_on date not null,
 status text not null default 'open' check (status in ('open','closed')),
 resolution text, closed_on date, actor text not null,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 check ((status='open' and closed_on is null) or (status='closed' and closed_on is not null and btrim(resolution) <> ''))
);
create table assurance.performance (
 id uuid primary key default gen_random_uuid(), supplier_id uuid not null references assurance.suppliers,
 period_end date not null, delivery_score integer not null check (delivery_score between 0 and 100),
 quality_score integer not null check (quality_score between 0 and 100),
 evidence_ref text not null check (btrim(evidence_ref) <> ''), actor text not null,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 unique(supplier_id,period_end)
);
create table assurance.reviews (
 id uuid primary key default gen_random_uuid(), supplier_id uuid not null references assurance.suppliers,
 supplier_version integer not null, due_on date not null, actor text not null,
 rationale text not null check (btrim(rationale) <> ''), evidence_ref text not null check (btrim(evidence_ref) <> ''),
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create table assurance.activity (
 id uuid primary key default gen_random_uuid(), supplier_id uuid references assurance.suppliers,
 action text not null, actor text not null, note text not null,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create table assurance.import_batches (
 id uuid primary key default gen_random_uuid(), file_hash text not null, actor text not null,
 added integer not null, unchanged integer not null,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create function assurance.invalidate_review() returns trigger language plpgsql as $$
begin update assurance.suppliers set updated_at=clock_timestamp() where id=coalesce(new.supplier_id,old.supplier_id); return coalesce(new,old); end $$;
do $$ declare t text; begin
 foreach t in array array['evidence','findings','performance','reviews','activity','import_batches'] loop
  execute format('create trigger touch before update on assurance.%I for each row execute function assurance.touch()',t);
 end loop;
 foreach t in array array['evidence','findings','performance'] loop
  execute format('create trigger invalidate after insert or update or delete on assurance.%I for each row execute function assurance.invalidate_review()',t);
 end loop;
end $$;
create view assurance.latest_evidence as
 select distinct on (supplier_id,kind) * from assurance.evidence order by supplier_id,kind,created_at desc,id;
create view assurance.requirements as
 select s.id supplier_id,s.reference,s.name,s.owner,r.kind,r.basis
 from assurance.suppliers s cross join lateral (values
 ('identity','Local onboarding policy',true),
 ('insurance','Business-specific insurance policy',s.insurance_required),
 ('security','NZ IPP 5 / AU APP 11 evidence review',s.personal_data='yes'),
 ('overseas','NZ IPP 12 / AU APP 8 applicability review',s.personal_data='yes' and s.overseas='yes')
 ) r(kind,basis,required) where r.required and s.state <> 'archived';
create view assurance.evidence_gaps as
 select r.*,e.expires_on,case when e.id is null then 'missing' else 'expired' end reason
 from assurance.requirements r left join assurance.latest_evidence e on e.supplier_id=r.supplier_id and e.kind=r.kind
 where e.id is null or e.expires_on < current_date;
create view assurance.qualification as
 select s.id,s.reference,s.name,s.owner,s.category,s.state,s.criticality,s.review_due,s.version,
 (select count(*)::integer from assurance.evidence_gaps g where g.supplier_id=s.id) evidence_gaps,
 (select count(*)::integer from assurance.findings f where f.supplier_id=s.id and f.status='open' and f.severity='critical') critical_findings,
 case when s.state='archived' then 'archived' when s.state='suspended' then 'suspended'
 when s.owner is null or btrim(s.owner)='' or s.criticality='unknown' or s.personal_data='unknown' or (s.personal_data='yes' and s.overseas='unknown') then 'classify'
 when exists(select 1 from assurance.evidence_gaps g where g.supplier_id=s.id) then 'evidence needed'
 when exists(select 1 from assurance.findings f where f.supplier_id=s.id and f.status='open' and f.severity='critical') then 'critical finding'
 when not exists(select 1 from assurance.reviews r where r.supplier_id=s.id and r.supplier_version=s.version and r.due_on>=current_date) then 'review needed'
 else 'approved' end qualification
 from assurance.suppliers s;
create view assurance.review_queue as
 select reference,name,coalesce(owner,'Unassigned') owner,criticality,qualification,review_due
 from assurance.qualification where state <> 'archived' and (qualification <> 'approved' or review_due <= current_date+30);
create view assurance.scorecards as
 select s.id supplier_id,s.reference,s.name,s.criticality,p.period_end,p.delivery_score,p.quality_score,
 case when p.id is null then 'no scorecard' when p.period_end < current_date-90 then 'stale' when least(p.delivery_score,p.quality_score)<80 then 'below target' else 'within target' end result
 from assurance.suppliers s left join lateral (select * from assurance.performance p where p.supplier_id=s.id order by period_end desc limit 1) p on true
 where s.state <> 'archived';
revoke all on all tables in schema assurance from public;
revoke all on all functions in schema assurance from public;
