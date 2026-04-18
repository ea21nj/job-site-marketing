# Critical Path Item Tracker

A Zite-based tracking system for managing 100+ RFIs, submittals, change orders, and punch items at scale with automatic escalation and team accountability.

**Live Tracker:** https://build.fillout.com/database/ca6e6d64d4e055fd

---

## Overview

**Purpose:**  
Track critical path items (RFI, submittal, change order, punch) that block project progress. Automatically escalate aging items and route notifications to the right people.

**Key Stats:**
- 100+ concurrent items
- Daily entry flow
- 3 tables: Items, Escalations, Notification Queue
- 3 views: PM Working View, Team Accountability Dashboard, Aging Buckets
- Automated escalation rules (Critical 24h, High 48h, Normal 5d)

---

## Quick Links

| Resource | Purpose |
|----------|---------|
| [Quick Start Guide](docs/TRACKER_QUICKSTART.md) | 1-minute workflows for PMs, team members, admins |
| [Design Spec](docs/superpowers/specs/2026-04-17-critical-path-tracker-design.md) | Complete system architecture & data model |
| [Views Setup](docs/superpowers/specs/critical-path-tracker-views.md) | How to create/configure each view |
| [Automation Rules](docs/superpowers/specs/critical-path-tracker-automation.md) | Escalation logic & business rules |
| [Automation Deployment](docs/AUTOMATION_SETUP.md) | Set up daily escalation runs |

---

## System Architecture

### Database Schema

**Items Table** (Core)
- Title, Item Type (RFI/Submittal/Change Order/Punch)
- Description, Status (Imported/Flagged/In Pursuit/Resolved)
- Responsible Party, Follow-up Owner, PM Urgency (Critical/High/Normal)
- Due Date, Last Activity Date, Next Step
- Procore Ref ID (reference only, no API sync)

**Escalations Table** (Audit Log)
- Links to Items table
- Escalation Type (Manual Flag, Age-Based Critical/High/Normal)
- Triggered Date, Previous/New Urgency, Notified Person
- Notification Status (Pending/Sent/Failed/Acknowledged)
- Reason (why this escalation fired)

**Notification Queue** (Email Tracking)
- Links to Items + Escalations tables
- Recipient, Message Type, Subject, Body
- Status (Pending/Sent/Failed/Bounced)
- Scheduled Send, Actual Send, Delivery Channel

---

## Views & Layers

### 1. PM Working View
**Audience:** Project Manager  
**Purpose:** Fast triage & control

- **Sort:** Urgency (Critical → High → Normal), then age (oldest first)
- **Columns:** Title, Item Type, Responsible Party, Follow-up Owner, Urgency, Activity Date, Next Step, Status
- **Inline Edits:** Follow-up Owner, Next Step, Status, Urgency
- **Filters:** Critical+aging, High+aging presets
- **Expected:** Critical items with oldest activity appear first

### 2. Team Accountability Dashboard
**Audience:** Team members, PM oversight  
**Purpose:** Workload distribution & accountability

- **Group By:** Follow-up Owner
- **Summary Cards:** Total items, # Critical, # High, # aging (48h+)
- **Columns:** Title, Item Type, Status, Urgency, Activity Date, Due Date
- **Expected:** See who's overloaded, who has critical items

### 3. Aging Buckets
**Audience:** Admin, escalation monitoring  
**Purpose:** Identify aging items for escalation

- **Group By:** Activity age (0-24h, 24-48h, 48h+)
- **Columns:** Title, Owner, Urgency, Activity Date
- **Sort Within Groups:** Urgency (Critical first)
- **Expected:** Spot stale items, escalation candidates obvious

---

## Escalation Automation

### Rules (Run Daily at 8:00 AM)

| Urgency | No-Activity Threshold | Action |
|---------|----------------------|--------|
| Critical | 24 hours | Create escalation, queue notification to Follow-up Owner |
| High | 48 hours | Create escalation, queue notification to Follow-up Owner |
| Normal | 5 days (120 hours) | Create escalation, queue notification to Follow-up Owner |

### Smart Routing
- **Send to:** Follow-up Owner (person who can move the item)
- **Never send to:** Responsible Party (original requester)
- **Why:** Escalation should notify the decision-maker, not the requester

### Email Template
```
[ESCALATION] {Item Type}: {Title}

Hi {Follow-up Owner},

This item is aging and needs your action:

Item: {Title}
Type: {Item Type}
Owner: {Responsible Party}
Due: {Due Date}
Last Activity: {Date} ({X hours ago})
Urgency: {Urgency}
Next Step: {Next Step}

Please update status or escalate if blocked.
```

---

## Workflow States

```
Imported
  ↓ (PM assesses, assigns Follow-up Owner)
Flagged
  ↓ (Owner starts work)
In Pursuit
  ↓ (Owner completes work)
Resolved
```

---

## Setup Checklist

### Phase 1: Database & Views ✓
- [x] Create Items, Escalations, Notification Queue tables
- [x] Add 4 test items (RFI, Change Order, Submittal, Punch)
- [x] Create PM Working View
- [x] Create Team Accountability Dashboard
- [x] Create Aging Buckets view

### Phase 2: Automation (Next)
- [ ] Choose automation deployment option (Vercel Cron / Lambda / External scheduler)
- [ ] Set up email service integration (SendGrid / AWS SES / Nodemailer)
- [ ] Configure escalation-trigger.js with your service
- [ ] Test with `SEND_NOTIFICATIONS=false`
- [ ] Deploy to production
- [ ] Monitor first run

### Phase 3: Team Onboarding (Next)
- [ ] Share Quick Start guide with team
- [ ] Train PMs on PM Working View workflow
- [ ] Train team on status updates and escalation responses
- [ ] Review escalation emails weekly

---

## Deployment Options

### Option 1: Vercel Cron (Recommended)

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

Set environment variables:
```
ZITE_DB_ID=ca6e6d64d4e055fd
ZITE_API_KEY=<your-zite-api-key>
SEND_NOTIFICATIONS=true
```

### Option 2: AWS Lambda + EventBridge
See [Automation Setup Guide](docs/AUTOMATION_SETUP.md#aws-lambda)

### Option 3: GitHub Actions
See [Automation Setup Guide](docs/AUTOMATION_SETUP.md#github-actions)

---

## Testing Escalation Rules

With 4 test items in the database:

| Item | Age | Urgency | Expected |
|------|-----|---------|----------|
| Foundation RFI | 2 days | Critical | ✓ Escalate (24h rule) |
| Site Access CO | 2 days | High | ✓ Escalate (48h rule) |
| Concrete Mix | 3 hours | Normal | ✗ No escalation |
| Door Frame | 1.5 days | Critical | ✓ Escalate (24h rule) |

**Expected Results:**
- 3 new Escalation records
- 3 new Notification Queue records (all Pending)

**Run Test:**
```bash
SEND_NOTIFICATIONS=false node automation/escalation-trigger.js
```

---

## Monitoring & Maintenance

### Daily Checks (Admin)
1. Open **Aging Buckets** view
2. Check "48h+ Old" bucket for escalation candidates
3. Review **Escalations** table for new records
4. Check **Notification Queue** for "Failed" status

### Weekly Review
1. How many items were escalated? (should be 2-5/day)
2. Are Follow-up Owners responding to escalations?
3. Do escalation thresholds need adjusting?
4. Are any items stuck (same status for 10+ days)?

### Monthly Optimization
1. Analyze velocity: how many items resolved per week?
2. Review bottlenecks: who has 20+ items?
3. Adjust PM Urgency rules based on actual due dates
4. Consider team reassignments or additional resources

---

## Future Enhancements

- **SMS/Slack Notifications** — Multi-channel escalation alerts
- **Manager Escalations** — If Follow-up Owner doesn't respond in 24h, escalate to PM
- **Bulk Import** — Consume CSV or Procore exports
- **Historical Analytics** — Velocity, escalation trends, resolution time
- **Calendar Integration** — Sync due dates with Outlook/Google Calendar
- **Custom Thresholds** — Per-team or per-item escalation rules
- **Soft Delete** — Archive resolved items after 30 days

---

## Support

**Issues or questions?**
1. Check [Quick Start Guide](docs/TRACKER_QUICKSTART.md) for workflows
2. Review [Design Spec](docs/superpowers/specs/2026-04-17-critical-path-tracker-design.md) for architecture
3. Check [Automation Setup](docs/AUTOMATION_SETUP.md) for deployment help

---

## Database Details

- **Database ID:** `ca6e6d64d4e055fd`
- **Items Table ID:** `tubYoQjcKZD`
- **Escalations Table ID:** `tkmQRyK7J4L`
- **Notification Queue Table ID:** `twxyaSwzdBH`
- **Live URL:** https://build.fillout.com/database/ca6e6d64d4e055fd

---

**Last Updated:** 2026-04-17  
**Status:** Fully Functional (Automation deployment pending)
