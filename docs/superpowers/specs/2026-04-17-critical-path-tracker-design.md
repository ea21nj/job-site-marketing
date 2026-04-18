---
name: Critical Path Item Tracker
description: Zite-based dual-view tracking system for 100+ daily RFI/submittal/change order items with smart escalation and team accountability
type: design
date: 2026-04-17
---

# Critical Path Item Tracker — Design Specification

## Overview

A Zite-based tracker for managing high-priority project items (RFIs, submittals, change orders, punch items) at scale (100+ items, daily entry frequency). Dual-audience system: PM working view optimized for fast control and prioritization; team accountability dashboard for workload distribution and aging visibility.

**Key principle:** Procore-free approach. Items enter via manual creation or import. Zite is system of record. Smart escalation via rules (age + urgency) with notifications routed to whoever owns the next action.

## Requirements

### Functional
- **Item creation & tracking:** RFI, submittal, change order, punch item types with full audit trail
- **Workflow states:** Imported → Flagged → In Pursuit → Resolved
- **Urgency system:** Hybrid (user-set or system-suggested based on rules)
- **Escalation automation:** Age-based rules trigger flags and notifications without human intervention
- **Smart routing:** Notifications go to Follow-up Owner (person who can act), not requester
- **Two coordinated views:** PM working view + team accountability dashboard

### Non-Functional
- Scale: 100+ active items
- Frequency: daily steady entry flow
- Audit trail: every escalation logged
- Notifications: full automation stack (emails, status tracking)

## Data Model

### Items Table
Core record for each tracked item.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Item ID | Auto-increment | Yes | Primary key |
| Item Type | Single Select | Yes | RFI / Submittal / Change Order / Punch |
| Description | Long Text | Yes | What is this item, why does it matter |
| Procore Ref ID | Text | No | Original reference for audit (even though no Procore API) |
| Status | Single Select | Yes | Imported / Flagged / In Pursuit / Resolved |
| Responsible Party | Text | Yes | Who originally raised this |
| Follow-up Owner | Single Select | Yes | WHO CAN ACTUALLY MOVE THIS — target for escalation notifications |
| PM Urgency | Single Select | Yes | Critical / High / Normal |
| User Override | Checkbox | No | True if PM manually set urgency (vs. system-suggested) |
| Due Date | Date | No | When does this need to resolve |
| Last Activity Date | Date | Yes | Last time status/step was updated |
| Next Step | Long Text | Yes | What's the concrete next action |
| Created | Timestamp | Yes | Auto-set on creation |
| Updated | Timestamp | Yes | Auto-update on any change |

### Escalations Table
Audit log of all escalations (manual or automated).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Escalation ID | Auto-increment | Yes | Primary key |
| Item ID | Link to Items | Yes | Which item was escalated |
| Escalation Type | Single Select | Yes | Manual Flag / Age-Based Critical / Age-Based High / Age-Based Normal |
| Triggered Date | Timestamp | Yes | When did this escalation fire |
| Previous Urgency | Text | Yes | What urgency was it before |
| New Urgency | Text | Yes | What urgency is it now |
| Notified Person | Text | Yes | Who did we notify (the Follow-up Owner at time of escalation) |
| Notification Status | Single Select | Yes | Pending / Sent / Failed / Acknowledged |
| Reason | Long Text | No | Why this escalation fired (rule applied, etc.) |

### Notification Queue Table
Tracks outbound notifications (emails, reminders) for reliable delivery and audit.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Notification ID | Auto-increment | Yes | Primary key |
| Item ID | Link to Items | Yes | Which item this notification is about |
| Escalation ID | Link to Escalations | No | Link to the escalation that triggered it (if automated) |
| Recipient | Text | Yes | Email or person name (Follow-up Owner) |
| Message Type | Single Select | Yes | Reminder / Escalation / Status Update |
| Subject | Text | Yes | Email subject line |
| Body | Long Text | Yes | Email body or message content |
| Status | Single Select | Yes | Pending / Sent / Failed / Bounced |
| Scheduled Send | Timestamp | Yes | When should this go out |
| Actual Send | Timestamp | No | When it actually went (if sent) |
| Delivery Channel | Single Select | Yes | Email (placeholder for future SMS/Slack) |
| Created | Timestamp | Yes | When notification was queued |

## Views & Interactions

### PM Working View
**Audience:** Project Manager. Purpose: Fast visibility into critical/high items needing action. One-click operations.

**Layout:**
- Primary sort: Urgency (Critical → High → Normal), then by Last Activity Date (oldest first)
- Filter presets: "Critical + 24h no activity", "High + 48h no activity", "All Overdue"
- Editable columns (inline): PM Urgency, Follow-up Owner, Next Step, Add Note/Comment
- Status column with workflow buttons: Mark as Flagged / In Pursuit / Resolved
- Highlight: Items with escalations pending or already sent (visual indicator)

**Bulk actions:**
- Select multiple → Reassign Follow-up Owner
- Select multiple → Mark as In Pursuit
- Select multiple → Manual escalation flag

**Hidden context:** Shows Follow-up Owner clearly so PM can see who owns what without digging.

### Team Accountability Dashboard
**Audience:** Distributed team members + PM oversight. Purpose: Show workload, aging, responsibility.

**Layout — Workload by Owner:**
- Grouped by Follow-up Owner
- Each person shows: # items assigned, # critical, # high, # overdue (>48h no activity)
- Drill-down: click owner name → see their items in detail

**Layout — Aging Bucket View:**
- Buckets: 0-24h / 24-48h / 48h+ since last activity
- Count of items in each bucket, colored by urgency
- Flag items in 48h+ bucket that are still Critical/High (escalation candidates)

**Layout — Status Breakdown:**
- Pie or bar: Imported / Flagged / In Pursuit / Resolved
- Shows flow through workflow

**Hidden context:** Makes it obvious who's bottleneck, what's aging, what's moving.

## Automation Rules

### Escalation Triggers
Rules run daily or on-demand. Each fires exactly once per item (no spam).

| Urgency | No-Activity Threshold | Action |
|---------|----------------------|--------|
| Critical | 24 hours | Create escalation, queue notification to Follow-up Owner |
| High | 48 hours | Create escalation, queue notification to Follow-up Owner |
| Normal | 5 days | Create escalation, queue notification to Follow-up Owner |

**Smart Routing:** Notification is addressed to Follow-up Owner (the person who can move it), not Responsible Party.

**Notification Template (email):**
```
Subject: [ESCALATION] {Item Type}: {Description}

Hi {Follow-up Owner},

This item is aging and needs your action:

Item: {Description}
Type: {Item Type}
Owner: {Responsible Party}
Due: {Due Date}
Last Activity: {Last Activity Date} ({X hours ago})
Urgency: {PM Urgency}
Next Step: {Next Step}

Please update status or escalate if blocked.
```

### Hybrid Urgency System
- **User override:** PM can manually set PM Urgency on any item. Checkbox "User Override" = true prevents system suggestions.
- **System suggestion:** On create or if no override, suggest urgency based on:
  - Due date within 3 days? → Critical
  - Due date within 7 days? → High
  - Otherwise → Normal
  - (PM can override if rule doesn't fit context)

## Workflow States

**Imported:** Item enters tracker, initial assessment.
↓
**Flagged:** PM or escalation rule marks it as needing pursuit. Notification sent to Follow-up Owner.
↓
**In Pursuit:** Owner actively working (meeting scheduled, answer pending, etc.). Regular check-ins.
↓
**Resolved:** Item closed, no further action. (Optional: archive/soft-delete after 30 days.)

## Error Handling & Edge Cases

- **Escalation fires multiple times:** Escalations table logs each trigger. Notification Queue tracks status per notification (pending/sent). Only queue a new notification if previous one failed or >24h has passed since last (avoid spam).
- **Follow-up Owner is blank:** Don't escalate. Log as "no owner" in escalations. PM must assign before automation can proceed.
- **Email send fails:** Mark in Notification Queue as Failed. Admin reviews and retries or manually notifies.
- **Item resolved mid-escalation:** Escalation still logs. Notification may still send (graceful degradation). Ignore if recipient resolves before reading.

## Future Extensions

- Email integration (actual send, not placeholder)
- SMS/Slack notifications
- Bulk import from CSV or Procore exports
- Historical analytics (velocity, escalation trends)
- Soft-delete / archive workflow for resolved items
- Calendar integration (due dates in Outlook/Google Calendar)

## Success Criteria

- ✓ All 100+ items trackable with zero manual escalation overhead
- ✓ PM can identify critical items needing action in <1 minute
- ✓ Team members see their assignments and workload clearly
- ✓ Every escalation logged (audit trail for project retrospectives)
- ✓ Notifications reach the right person (Follow-up Owner, not noise)
- ✓ No feature creep: only what's needed for core tracking & escalation
