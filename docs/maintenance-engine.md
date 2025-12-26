# Maintenance Engine v1

This module generates maintenance reminders for Home Asset Profile assets and queues notification intents.

## How reminders are generated

For each home and asset, the engine:
1. Resolves the interval months using rule precedence:
   - asset-specific rule
   - category-specific rule
   - home-level rule
   - asset.service_interval_months
   - default category interval
2. Computes next service due date using the interval override.
3. Creates reminders:
   - due_soon: due date within lead_days
   - overdue: due date older than overdue_grace_days
   - high_risk: asset risk level is high

Deduping rules:
- A unique constraint prevents duplicate reminders for the same home/asset/type/day.
- Completed or dismissed reminders suppress new reminders for 30 days.
- High risk reminders are created at most once per 30 days.

## Scheduler

A manual job script is provided:

```bash
node scripts/generate-maintenance-reminders.js
node scripts/generate-maintenance-reminders.js --date=2025-07-02
```

The script uses `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
Hook this script to cron or your job runner of choice.

## Notification outbox

For each reminder (or snooze reopening), a `notification_outbox` row is queued. Delivery is not implemented; the outbox is a staging table.
Template keys:
- `maintenance_due_soon`
- `maintenance_overdue`
- `maintenance_high_risk`

## Verification checklist

- Run the script and confirm reminders appear under `/portal/homes/:homeId/reminders`.
- Snooze a reminder and rerun the script after the snooze date; it should re-open.
- Confirm outbox rows are created with `status = queued`.
- Verify RLS rules using `docs/home-assets-rls-check.md`.
