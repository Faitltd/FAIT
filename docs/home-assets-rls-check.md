# Home Asset Profile RLS Manual Verification

Use this checklist if you do not have an automated Supabase RLS integration test harness.

## Preconditions
- You can connect to the Supabase DB with a service role key.
- You have two users: user_a and user_b.

## Steps
1) Create two users and confirm their UUIDs.
2) Create one home for user_a.
3) Create an asset for user_a's home.
4) Attempt to read user_a's asset as user_b.

## SQL (run as service role)

```sql
-- Replace with real user IDs
select auth.uid();

-- Create a home for user_a
insert into homes (id, owner_id, name, address, city, state, zip_code, home_type)
values (gen_random_uuid(), 'user_a_uuid', 'Main House', '123 Main', 'Austin', 'TX', '78701', 'single_family')
returning id;
```

```sql
-- Create an asset for user_a
insert into assets (home_id, category, display_name)
values ('home_id_from_above', 'HVAC', 'Carrier HVAC')
returning id;
```

## RLS Verification

Use the Supabase SQL editor to set role or use a client session for each user.

As user_b, run:

```sql
select * from assets where id = 'asset_id_from_above';
```

Expected: 0 rows.

As user_b, run:

```sql
select * from asset_documents where asset_id = 'asset_id_from_above';
```

Expected: 0 rows.

As user_a, run the same queries and expect the asset rows to appear.

## Maintenance Engine RLS Checks

As user_b, run:

```sql
select * from maintenance_rules where home_id = 'home_id_from_above';
select * from maintenance_reminders where home_id = 'home_id_from_above';
select * from notification_outbox where home_id = 'home_id_from_above';
```

Expected: 0 rows.

As user_a, run the same queries and expect rows to appear.

## Storage Verification

- Upload an asset document as user_a into bucket `asset_documents` with path
  `${user_a_uuid}/${home_id}/${asset_id}/...`
- As user_b, attempt to read the object. Expect permission denied.
