# Critical Path Tracker — Automation Rules & Triggers

## Overview

Escalation automation runs daily (or on-demand) to identify aging items and automatically create escalation records + notifications. This document specifies the business logic and integration points.

---

## Escalation Rules (Daily/On-Demand Execution)

All rules evaluate non-resolved items and fire exactly once per item (no duplicate escalations on same day).

### Rule 1: Critical Age-Based Escalation

**Trigger Condition:**
```
PM Urgency = "Critical" 
AND Last Activity Date > 24 hours ago 
AND Status != "Resolved"
AND No existing escalation of type "Age-Based Critical" within last 24 hours
```

**Action Steps:**
1. Query Escalations table: Check if escalation exists for this Item ID with type "Age-Based Critical" from today
2. If no recent escalation found:
   a. Create Escalations record:
      - Item ID: [link to Items record]
      - Escalation Type: "Age-Based Critical"
      - Triggered Date: [current timestamp]
      - Previous Urgency: [item's current PM Urgency]
      - New Urgency: "Critical"
      - Notified Person: [item's Follow-up Owner]
      - Notification Status: "Pending"
      - Reason: "No activity for 24 hours; critical item aging"
   
   b. Create Notification Queue record:
      - Item ID: [link to Items record]
      - Escalation ID: [link to escalation record just created]
      - Recipient: [item's Follow-up Owner]
      - Message Type: "Escalation"
      - Subject: "[ESCALATION] {Item Type}: {Title}"
      - Body: [See template below]
      - Status: "Pending"
      - Scheduled Send: [current time]
      - Delivery Channel: "Email"

---

### Rule 2: High Age-Based Escalation

**Trigger Condition:**
```
PM Urgency = "High" 
AND Last Activity Date > 48 hours ago 
AND Status != "Resolved"
AND No existing escalation of type "Age-Based High" within last 48 hours
```

**Action Steps:** [Same as Rule 1, but with:]
- Escalation Type: "Age-Based High"
- Reason: "No activity for 48 hours; high priority item aging"

---

### Rule 3: Normal Age-Based Escalation

**Trigger Condition:**
```
PM Urgency = "Normal" 
AND Last Activity Date > 5 days ago (120 hours)
AND Status != "Resolved"
AND No existing escalation of type "Age-Based Normal" within last 5 days
```

**Action Steps:** [Same as Rule 1, but with:]
- Escalation Type: "Age-Based Normal"
- Reason: "No activity for 5 days; normal priority item aging"

---

## Smart Routing

**Critical Principle:** Notifications are sent to the person who can **move** the item, not to the person who **created** it.

- **Send to:** Item's Follow-up Owner field
- **Never send to:** Item's Responsible Party field

**Rationale:** The Follow-up Owner is accountable for the next action. They need the escalation notice, not the original requester.

**Implementation:** Use Follow-up Owner field value as the Recipient in Notification Queue record.

---

## Notification Template

All escalation notifications follow this format:

**Subject Line:**
```
[ESCALATION] {Item Type}: {Title}
```

Example: `[ESCALATION] RFI: Foundation inspection approval pending`

**Email Body:**
```
Hi {Follow-up Owner},

This item is aging and needs your action:

Item: {Title}
Type: {Item Type}
Owner: {Responsible Party}
Due: {Due Date}
Last Activity: {Last Activity Date} ({X hours/days ago})
Urgency: {PM Urgency}
Next Step: {Next Step}

Please update status or escalate if blocked.

---
Critical Path Tracker
Database: {database_url}
```

**Example:**
```
Hi John Smith,

This item is aging and needs your action:

Item: Foundation inspection approval pending
Type: RFI
Owner: Site Superintendent
Due: 2026-04-20
Last Activity: 2026-04-16 (more than 24 hours ago)
Urgency: Critical
Next Step: Call inspector, confirm availability

Please update status or escalate if blocked.

---
Critical Path Tracker
Database: https://build.fillout.com/database/ca6e6d64d4e055fd
```

---

## Execution Frequency & Deduplication

**Daily Schedule:**
- Run at 8:00 AM (or timezone-appropriate time)
- Prevents duplicate notifications: Only queue a new notification if 24+ hours have passed since the last notification for the same item

**Manual Trigger:**
- Can be run on-demand by admin or triggered manually
- Useful for immediate escalation checks or after business rule changes

**Deduplication Logic:**
```
IF (Last Notification for Item = NULL OR Last Notification for Item < 24 hours ago)
  THEN: Proceed with escalation + notification
ELSE: Skip (already notified recently)
```

---

## Data Flow & System Integration

```
[Daily Cron Trigger] 
  ↓
[Escalation Rules Engine]
  ├→ Query all non-resolved Items
  ├→ For each item, evaluate Rules 1-3
  ├→ If rule triggered:
  │  ├→ Create Escalations record
  │  └→ Create Notification Queue record
  ↓
[Notification Service] (future)
  ├→ Query Notification Queue (Status = "Pending")
  ├→ Send email to Recipient
  ├→ Update Notification Queue (Status = "Sent" or "Failed")
  ├→ Update Escalations table (Notification Status = "Sent" or "Failed")
```

---

## Testing Escalation Rules

With 4 test items currently in the database, here's the expected escalation behavior when rules run:

| Item | Current Status | Days Old | PM Urgency | Expected Action |
|------|---|---|---|---|
| Foundation Inspection RFI | Flagged | 2 | Critical | ✓ Escalate (24h rule) |
| Site Access Change Order | Imported | 2 | High | ✓ Escalate (48h rule) |
| Concrete Mix Submittal | In Pursuit | 0 | Normal | ✗ No escalation (recent) |
| Door Frame Punch | Flagged | 1.5 | Critical | ✓ Escalate (24h rule) |

**Expected Escalations table growth:** 3 new escalation records

**Expected Notification Queue growth:** 3 new notification records (all "Pending")

---

## Future Extensions

- **SMS/Slack notifications** — Replace/supplement Email with SMS or Slack
- **Escalation chains** — If no response in 24h after escalation, escalate again
- **Manager-level escalations** — Escalate critical items to PM if Follow-up Owner doesn't respond
- **Calendar integration** — Sync due dates with Outlook/Google Calendar
- **Custom thresholds** — Allow per-item or per-team custom escalation thresholds
