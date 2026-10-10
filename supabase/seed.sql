insert into assurance.suppliers(id,reference,name,owner,category,country,criticality,personal_data,overseas,insurance_required,state,review_due,annual_spend,currency) values
 ('10000000-0000-0000-0000-000000000001','SUP-01','Harbour Packaging','Casey','Packaging','NZ','high','no','no',true,'active',current_date-7,48000,'NZD'),
 ('10000000-0000-0000-0000-000000000002','SUP-02','Southern Data Services','Ari','Data services','AU','high','yes','yes',false,'active',current_date+20,24000,'AUD'),
 ('10000000-0000-0000-0000-000000000003','SUP-03','Harbour Labels',null,'Packaging','NZ','unknown','unknown','unknown',false,'onboarding',null,null,null),
 ('10000000-0000-0000-0000-000000000004','SUP-04','Coastal Office Supply','Casey','Office','NZ','low','no','no',false,'active',current_date+120,6000,'NZD'),
 ('10000000-0000-0000-0000-000000000005','SUP-05','Archive Freight','Ari','Transport','NZ','medium','no','no',false,'archived',current_date-200,8000,'NZD')
on conflict do nothing;
insert into assurance.evidence(id,supplier_id,kind,evidence_ref,reviewed_on,expires_on,actor,note)
 select ('20000000-0000-0000-0000-00000000000'||n)::uuid,('10000000-0000-0000-0000-00000000000'||supplier)::uuid,kind,'demo://evidence/'||n,current_date-60,current_date+days,'Demo reviewer','Fictional evidence reference, not a verified document'
 from (values (1,1,'identity',300),(2,1,'insurance',-3),(3,2,'identity',300),(4,2,'security',40),(5,4,'identity',300)) v(n,supplier,kind,days)
on conflict do nothing;
insert into assurance.findings(id,supplier_id,title,severity,owner,due_on,actor) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Replace damaged cartons','high','Casey',current_date-4,'Demo reviewer'),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Confirm recovery test evidence','critical','Ari',current_date+5,'Demo reviewer')
on conflict do nothing;
insert into assurance.performance(id,supplier_id,period_end,delivery_score,quality_score,evidence_ref,actor) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',current_date-10,72,91,'demo://scorecard/1','Demo reviewer'),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002',current_date-120,95,96,'demo://scorecard/2','Demo reviewer'),
 ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004',current_date-10,98,99,'demo://scorecard/4','Demo reviewer')
on conflict do nothing;
insert into assurance.reviews(id,supplier_id,supplier_version,due_on,actor,rationale,evidence_ref)
 select '50000000-0000-0000-0000-000000000001',id,version,review_due,'Demo reviewer','Fictional approved office supplier','demo://review/4' from assurance.suppliers where reference='SUP-04'
on conflict do nothing;
insert into assurance.activity(id,supplier_id,action,actor,note) values
 ('60000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','log','Demo reviewer','Asked for updated insurance evidence. No message sent.') on conflict do nothing;
