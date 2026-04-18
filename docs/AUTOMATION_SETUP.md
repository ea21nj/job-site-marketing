# Critical Path Tracker — Automation Setup Guide

## Overview

This guide covers setting up daily escalation automation for the Critical Path Item Tracker. Escalation rules identify aging items and automatically create notifications.

---

## Prerequisites

- Zite database ID: `ca6e6d64d4e055fd`
- Zite API key (from Zite account settings)
- Node.js 16+ (for running automation script)
- Email service integration (SendGrid, AWS SES, Nodemailer, etc.)

---

## Quick Start

### Option 1: Vercel Cron (Recommended)

If your project is deployed on Vercel, you can use Vercel Crons for scheduled execution.

**Steps:**

1. **Create API endpoint** for escalation trigger:

```javascript
// api/escalations.js (or .ts)
import { runEscalationRules } from '../automation/escalation-trigger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await runEscalationRules();
    res.status(200).json({ success: true, message: 'Escalation rules executed', result });
  } catch (error) {
    console.error('Escalation trigger error:', error);
    res.status(500).json({ error: 'Failed to run escalation rules' });
  }
}
```

2. **Configure cron in vercel.json:**

```json
{
  "crons": [
    {
      "path": "/api/escalations",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Or in **vercel.ts** (TypeScript):

```typescript
import { routes } from '@vercel/config/v1';

export const config = {
  crons: [
    {
      path: '/api/escalations',
      schedule: '0 8 * * *' // Daily at 8:00 AM
    }
  ]
};
```

3. **Set environment variables** in Vercel project settings:

```
ZITE_DB_ID=ca6e6d64d4e055fd
ZITE_API_KEY=<your-zite-api-key>
SEND_NOTIFICATIONS=true
```

4. **Deploy:**

```bash
vercel deploy
```

---

### Option 2: External Scheduler (Make, Zapier, AWS Lambda)

Use a third-party service to trigger the escalation endpoint daily.

#### Make.com Automation

1. Create new scenario in Make
2. Add "HTTP" module → set method to GET
3. URL: `https://your-domain.com/api/escalations`
4. Add Schedule module → set to daily at 8:00 AM
5. Test and activate

#### AWS Lambda + EventBridge

1. Create Lambda function from `automation/escalation-trigger.js`
2. Create EventBridge rule: `cron(0 8 * * ? *)`
3. Target: Lambda function
4. Set environment variables in Lambda configuration

#### GitHub Actions

Create `.github/workflows/escalation.yml`:

```yaml
name: Escalation Rules
on:
  schedule:
    - cron: '0 8 * * *'  # Daily at 8:00 AM UTC

jobs:
  escalate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run escalation rules
        env:
          ZITE_DB_ID: ${{ secrets.ZITE_DB_ID }}
          ZITE_API_KEY: ${{ secrets.ZITE_API_KEY }}
          SEND_NOTIFICATIONS: 'true'
        run: node automation/escalation-trigger.js
```

---

### Option 3: Manual Trigger (Testing / On-Demand)

Run escalation rules manually from command line:

```bash
ZITE_DB_ID=ca6e6d64d4e055fd \
ZITE_API_KEY=<your-api-key> \
SEND_NOTIFICATIONS=false \
node automation/escalation-trigger.js
```

Add `--dry-run` flag to test without creating records:

```bash
node automation/escalation-trigger.js --dry-run
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ZITE_DB_ID` | Yes | - | Critical Path Tracker database ID |
| `ZITE_API_KEY` | Yes | - | Zite API authentication key |
| `ZITE_API_BASE` | No | `https://api.zite.com` | Zite API base URL |
| `SEND_NOTIFICATIONS` | No | `false` | Actually send email notifications |
| `NOTIFICATION_SERVICE` | No | `console` | Email service type: `console`, `sendgrid`, `nodemailer`, `aws-ses` |

### Email Service Integration

Currently, `automation/escalation-trigger.js` includes a placeholder for email sending. Integrate your preferred service:

#### SendGrid

```bash
npm install @sendgrid/mail
```

Update `sendEmail()` function:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(recipient, notificationData) {
  await sgMail.send({
    to: recipient,
    from: process.env.FROM_EMAIL,
    subject: notificationData.Subject,
    text: notificationData.Body,
  });
}
```

#### AWS SES

```bash
npm install aws-sdk
```

Update `sendEmail()` function:

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

async function sendEmail(recipient, notificationData) {
  await ses.sendEmail({
    Source: process.env.FROM_EMAIL,
    Destination: { ToAddresses: [recipient] },
    Message: {
      Subject: { Data: notificationData.Subject },
      Body: { Text: { Data: notificationData.Body } }
    }
  }).promise();
}
```

#### Nodemailer (SMTP)

```bash
npm install nodemailer
```

Update `sendEmail()` function:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail(recipient, notificationData) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: recipient,
    subject: notificationData.Subject,
    text: notificationData.Body
  });
}
```

---

## Testing

### Dry Run (No Database Changes)

```bash
SEND_NOTIFICATIONS=false node automation/escalation-trigger.js
```

Expected output:
```
[2026-04-17T08:00:00Z] Starting escalation rules...
  → Fetching non-resolved items...
  ✓ Found 4 items to evaluate
  Evaluating: Foundation inspection approval pending (Critical, 48h old)
    ✓ Escalated as Age-Based Critical
  ...
✓ Escalation run complete:
  - Escalations created: 3
  - Notifications queued: 3
```

### Verify Results in Zite

After running automation:

1. **Check Escalations table:**
   - Should have 3 new records (one for each aging Critical/High item)
   - Notification Status should be "Pending"

2. **Check Notification Queue table:**
   - Should have 3 new records
   - All should have Status = "Pending"
   - Recipient field should match Follow-up Owner

3. **Check Items table:**
   - No changes to Items (escalations don't modify items)

---

## Troubleshooting

### "Cannot connect to Zite API"
- Verify `ZITE_DB_ID` and `ZITE_API_KEY` are correct
- Check network connectivity
- Verify Zite API is available at `ZITE_API_BASE`

### "No items found"
- Verify Items table has data
- Check Status filter logic (ensures Status != "Resolved")

### "Notifications not sending"
- Verify `SEND_NOTIFICATIONS=true`
- Check email service integration (SendGrid, AWS SES, etc.)
- Verify recipient email addresses are valid
- Check email service logs for failures

### "Duplicate escalations"
- Escalation deduplication should prevent duplicates within 24 hours
- If duplicates occur, check deduplication logic in `hasRecentEscalation()`

---

## Monitoring & Alerting

### Log Monitoring

Set up log aggregation to track escalation runs:

```
# Vercel Logs (via Vercel Dashboard)
# Look for requests to /api/escalations endpoint

# AWS CloudWatch (if using Lambda)
# Check function logs for execution output

# GitHub Actions (if using GH Actions)
# Check workflow run logs
```

### Success Metrics

- ✓ Automation runs daily at 8:00 AM
- ✓ Escalations table grows by expected count (2-5 new records/day)
- ✓ Notification Queue shows "Pending" → "Sent" progression
- ✓ Escalation emails arrive in team members' inboxes

### Alert Conditions

Set up alerts for:
- Automation script fails to run (cron status)
- Email delivery failures (check Notification Queue for "Failed" status)
- Follow-up Owner field is blank (escalation can't notify)

---

## Next Steps

1. **Implement email service integration** — Choose SendGrid, AWS SES, or Nodemailer and update `sendEmail()` function
2. **Deploy to production** — Set up Vercel cron or external scheduler
3. **Monitor first run** — Check Zite tables for correct escalation records
4. **Refine escalation rules** — Adjust hourThreshold values based on team feedback
5. **Add manager escalations** (future) — Escalate to PM if Follow-up Owner doesn't respond within 24h
