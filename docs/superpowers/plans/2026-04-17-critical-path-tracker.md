# Critical Path Item Tracker Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build a Zite database with 3 tables (Items, Escalations, Notification Queue), two coordinated views (PM working view + team accountability dashboard), and foundational automation logic for escalation and smart routing.

**Architecture:** Single Zite database containing Items as the core record type, with Escalations and Notification Queue as supporting audit/automation tables. Two views slice the same data for different audiences: PM for fast control (sorted by urgency + age), team for accountability (grouped by owner + aging buckets). Automation fires via external scheduling (daily) or on-demand triggers.

**Tech Stack:** Zite (database), Zite MCP tools (schema + data), Zite views (native), external automation (placeholder for email/reminder service).

---

## File Structure

```
Zite Database: Critical Path Tracker
├── Items table (core)
│   ├── Item ID, Type, Description, Status, Urgency, Owner fields
│   └── [PM Working View] — filtered + sorted for speed
├── Escalations table (audit log)
│   ├── Links to Items, tracks escalation events
│   └── [Read-only reference in dashboards]
├── Notification Queue table (reminder tracking)
│   ├── Links to Items + Escalations
│   └── [Status tracking for email delivery]
└── [Team Accountability Dashboard] — grouped view of Items by owner + aging
```

---

## Task 1: Create Database & Items Table

**Files:**
- Create: Zite database `Critical Path Tracker`
- Create: `Items` table with core fields

- [ ] **Step 1: Create database with Items table schema**

Using Zite MCP `create_database` tool with the Items table definition:

```json
{
  "name": "Critical Path Tracker",
  "tables": [
    {
      "name": "Items",
      "fields": [
        { "name": "Item Type", "type": "single_select", "template": { "options": [{ "value": "RFI" }, { "value": "Submittal" }, { "value": "Change Order" }, { "value": "Punch" }] } },
        { "name": "Description", "type": "long_text" },
        { "name": "Procore Ref ID", "type": "single_line_text" },
        { "name": "Status", "type": "single_select", "template": { "options": [{ "value": "Imported" }, { "value": "Flagged" }, { "value": "In Pursuit" }, { "value": "Resolved" }] } },
        { "name": "Responsible Party", "type": "single_line_text" },
        { "name": "Follow-up Owner", "type": "single_line_text" },
        { "name": "PM Urgency", "type": "single_select", "template": { "options": [{ "value": "Critical" }, { "value": "High" }, { "value": "Normal" }] } },
        { "name": "User Override", "type": "checkbox" },
        { "name": "Due Date", "type": "date" },
        { "name": "Last Activity Date", "type": "date" },
        { "name": "Next Step", "type": "long_text" }
      ]
    }
  ]
}
```

Expected: Database created, Items table visible in Zite with all fields.

- [ ] **Step 2: Verify Items table structure**

Open Zite dashboard → Critical Path Tracker → Items table. Confirm:
- ✓ All 11 fields present
- ✓ Field types correct (single_select, long_text, date, checkbox, single_line_text)
- ✓ Dropdown options visible (Item Type, Status, PM Urgency)

- [ ] **Step 3: Create sample Items record**

Insert test record:
- Item Type: RFI
- Description: "Foundation inspection approval pending"
- Procore Ref ID: "RFI-2026-001"
- Status: Flagged
- Responsible Party: "Site Superintendent"
- Follow-up Owner: "John Smith"
- PM Urgency: Critical
- User Override: unchecked
- Due Date: 2026-04-20
- Last Activity Date: 2026-04-16
- Next Step: "Call inspector, confirm availability"

Expected: Record created, all fields visible in Items table.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-04-17-critical-path-tracker-design.md
git commit -m "feat: create Zite database with Items table and sample record"
```

---

## Task 2: Create Escalations Table

**Files:**
- Create: `Escalations` table in Critical Path Tracker database

- [ ] **Step 1: Create Escalations table schema**

Using Zite MCP `create_table` tool:

```json
{
  "baseId": "[Critical Path Tracker DB ID from Task 1]",
  "name": "Escalations",
  "fields": [
    { "name": "Item ID", "type": "linked_record" },
    { "name": "Escalation Type", "type": "single_select", "template": { "options": [{ "value": "Manual Flag" }, { "value": "Age-Based Critical" }, { "value": "Age-Based High" }, { "value": "Age-Based Normal" }] } },
    { "name": "Triggered Date", "type": "datetime" },
    { "name": "Previous Urgency", "type": "single_line_text" },
    { "name": "New Urgency", "type": "single_line_text" },
    { "name": "Notified Person", "type": "single_line_text" },
    { "name": "Notification Status", "type": "single_select", "template": { "options": [{ "value": "Pending" }, { "value": "Sent" }, { "value": "Failed" }, { "value": "Acknowledged" }] } },
    { "name": "Reason", "type": "long_text" }
  ]
}
```

Expected: Escalations table created with all 8 fields.

- [ ] **Step 2: Verify Escalations table structure**

Open Zite → Critical Path Tracker → Escalations table. Confirm:
- ✓ Item ID field is a link to Items table
- ✓ All fields present
- ✓ Escalation Type dropdown options visible

- [ ] **Step 3: Create sample Escalations record**

Insert test record linked to the sample Items record from Task 1:
- Item ID: [link to foundation inspection RFI]
- Escalation Type: Age-Based Critical
- Triggered Date: 2026-04-17 10:30 AM
- Previous Urgency: "Normal"
- New Urgency: "Critical"
- Notified Person: "John Smith"
- Notification Status: Pending
- Reason: "No activity for 24 hours; critical item aging"

Expected: Record created, Item ID link resolves correctly.

- [ ] **Step 4: Commit**

```bash
git add [Zite database config if exported]
git commit -m "feat: create Escalations audit table with sample record"
```

---

## Task 3: Create Notification Queue Table

**Files:**
- Create: `Notification Queue` table in Critical Path Tracker database

- [ ] **Step 1: Create Notification Queue table schema**

Using Zite MCP `create_table` tool:

```json
{
  "baseId": "[Critical Path Tracker DB ID]",
  "name": "Notification Queue",
  "fields": [
    { "name": "Item ID", "type": "linked_record" },
    { "name": "Escalation ID", "type": "linked_record" },
    { "name": "Recipient", "type": "single_line_text" },
    { "name": "Message Type", "type": "single_select", "template": { "options": [{ "value": "Reminder" }, { "value": "Escalation" }, { "value": "Status Update" }] } },
    { "name": "Subject", "type": "single_line_text" },
    { "name": "Body", "type": "long_text" },
    { "name": "Status", "type": "single_select", "template": { "options": [{ "value": "Pending" }, { "value": "Sent" }, { "value": "Failed" }, { "value": "Bounced" }] } },
    { "name": "Scheduled Send", "type": "datetime" },
    { "name": "Actual Send", "type": "datetime" },
    { "name": "Delivery Channel", "type": "single_select", "template": { "options": [{ "value": "Email" }, { "value": "SMS" }, { "value": "Slack" }] } }
  ]
}
```

Expected: Notification Queue table created with all 10 fields.

- [ ] **Step 2: Verify Notification Queue table structure**

Open Zite → Critical Path Tracker → Notification Queue table. Confirm:
- ✓ Item ID and Escalation ID are linked fields
- ✓ Status and Message Type dropdowns visible
- ✓ Datetime fields for scheduling

- [ ] **Step 3: Create sample Notification Queue record**

Insert test record:
- Item ID: [link to foundation inspection RFI]
- Escalation ID: [link to escalation from Task 2]
- Recipient: "John Smith"
- Message Type: Escalation
- Subject: "[ESCALATION] RFI: Foundation inspection approval pending"
- Body: "Hi John,\n\nThis item is aging and needs your action:\n\nItem: Foundation inspection approval pending\nType: RFI\nOwner: Site Superintendent\nDue: 2026-04-20\nLast Activity: 2026-04-16 (more than 24 hours ago)\nUrgency: Critical\nNext Step: Call inspector, confirm availability\n\nPlease update status or escalate if blocked."
- Status: Pending
- Scheduled Send: 2026-04-17 10:45 AM
- Actual Send: [blank]
- Delivery Channel: Email

Expected: Record created, links resolve.

- [ ] **Step 4: Commit**

```bash
git add [Zite database config]
git commit -m "feat: create Notification Queue tracking table with sample record"
```

---

## Task 4: Create PM Working View

**Files:**
- Create: PM Working View in Items table

- [ ] **Step 1: Create PM Working View in Zite**

In Zite Items table → Create New View → Name: "PM Working View"

Configure:
- **Sort order:** Primary: PM Urgency (Critical → High → Normal), Secondary: Last Activity Date (oldest first)
- **Columns visible:** Item Type, Description, Responsible Party, Follow-up Owner, PM Urgency, Last Activity Date, Next Step, Status
- **Filter presets:** Create filter "Critical + Overdue" (Status != Resolved AND PM Urgency = Critical AND Last Activity Date < 1 day ago)
- **Highlight:** Show color coding on PM Urgency column (Critical = red, High = yellow, Normal = gray)

Expected: View appears in Items table dropdown, sorts and filters correctly.

- [ ] **Step 2: Test PM Working View with sample data**

Open PM Working View. Verify:
- ✓ Foundation inspection RFI appears at top (Critical, oldest activity)
- ✓ Columns show all key fields for quick action
- ✓ Filter "Critical + Overdue" correctly identifies aging items
- ✓ Can inline-edit Follow-up Owner, Next Step fields

Expected: View is fast, shows critical items first, editable for PM.

- [ ] **Step 3: Create 3 more test records for realistic view**

Add sample items:
1. Change Order: "Site access modifications", Status: Imported, Urgency: High, Owner: "Jane Doe", Activity: 2 days ago
2. Submittal: "Concrete mix design approval", Status: In Pursuit, Urgency: Normal, Owner: "Mike Johnson", Activity: 3 hours ago
3. Punch: "Door frame alignment", Status: Flagged, Urgency: Critical, Owner: "Sarah Lee", Activity: 36 hours ago

Expected: PM Working View now shows 4 items, sorted by urgency + age.

- [ ] **Step 4: Verify view is responsive**

- Click on Follow-up Owner field → edit inline → verify change saves
- Click Status dropdown → change from "Imported" to "Flagged" → verify change persists
- Click "Critical + Overdue" filter → verify it highlights/isolates aging critical items

Expected: All edits save immediately, view updates in real-time.

- [ ] **Step 5: Commit**

```bash
git add [Zite view config if exported]
git commit -m "feat: create PM Working View with sort/filter and inline edit"
```

---

## Task 5: Create Team Accountability Dashboard

**Files:**
- Create: Team Accountability View in Items table

- [ ] **Step 1: Create Team Accountability View (Grouped by Owner)**

In Zite Items table → Create New View → Name: "Team Accountability Dashboard"

Configure:
- **Group by:** Follow-up Owner
- **Columns visible:** Item Type, Description, Status, PM Urgency, Last Activity Date, Due Date
- **Aggregation cards per owner:** Count of total items, count of Critical, count of High, count overdue (>48h no activity)
- **Secondary view option:** Aging Bucket view (0-24h / 24-48h / 48h+ since last activity)

Expected: View groups all items by Follow-up Owner with summary counts.

- [ ] **Step 2: Test Team Accountability Dashboard with sample data**

Open Team Accountability Dashboard. Verify:
- ✓ John Smith group shows: 2 items (1 Critical, 1 Escalation pending)
- ✓ Jane Doe group shows: 1 item (High)
- ✓ Mike Johnson group shows: 1 item (Normal, in progress)
- ✓ Sarah Lee group shows: 1 item (Critical, 36h+ old)

Expected: Dashboard clearly shows workload distribution and who has aging items.

- [ ] **Step 3: Create Aging Bucket View (alternative layout)**

In Zite Items table → Create New View → Name: "Aging Buckets"

Configure:
- **Group by:** Aging bucket (custom logic):
  - "0-24h" (Last Activity > 24h ago AND < 48h ago)
  - "24-48h" (Last Activity > 48h ago AND < 5 days ago)
  - "48h+" (Last Activity > 5 days ago)
- **Columns:** Description, Follow-up Owner, PM Urgency, Last Activity Date
- **Sort within group:** By PM Urgency (Critical first)

Expected: View clearly shows aging items and who owns them.

- [ ] **Step 4: Test Aging Bucket View**

Open Aging Buckets view. Verify:
- ✓ Foundation inspection RFI + Door frame punch both in "48h+" bucket (Critical)
- ✓ Change Order in "24-48h" bucket (High)
- ✓ Submittal in "0-24h" bucket (Normal, recent activity)

Expected: Aging view makes it obvious what's stale and needs escalation.

- [ ] **Step 5: Commit**

```bash
git add [Zite view configs]
git commit -m "feat: create Team Accountability Dashboard with owner grouping and aging buckets"
```

---

## Task 6: Set Up Escalation Logic & Automation Foundation

**Files:**
- Create: `automation-rules.md` (documentation for automation triggers)

- [ ] **Step 1: Document escalation rules in code**

Create file `docs/superpowers/specs/critical-path-tracker-automation.md`:

```markdown
# Critical Path Tracker — Automation Rules & Triggers

## Escalation Rules (run daily or on-demand)

### Rule 1: Critical Age-Based Escalation
- Trigger: Item with PM Urgency = "Critical" AND Last Activity Date > 24 hours ago AND Status != "Resolved"
- Action:
  1. Check if escalation already exists in Escalations table for this item (same type)
  2. If not, create new Escalation record: Escalation Type = "Age-Based Critical", New Urgency = "Critical", Notified Person = Follow-up Owner
  3. Create Notification Queue record: Recipient = Follow-up Owner, Message Type = "Escalation", Status = "Pending"
  4. Log timestamp

### Rule 2: High Age-Based Escalation
- Trigger: Item with PM Urgency = "High" AND Last Activity Date > 48 hours ago AND Status != "Resolved"
- Action: [Same as Rule 1, but Escalation Type = "Age-Based High"]

### Rule 3: Normal Age-Based Escalation
- Trigger: Item with PM Urgency = "Normal" AND Last Activity Date > 5 days ago AND Status != "Resolved"
- Action: [Same as Rule 1, but Escalation Type = "Age-Based Normal"]

## Smart Routing
- All escalation notifications are sent to Follow-up Owner (linked in Items.Follow-up Owner)
- Never send to Responsible Party (original requester)

## Notification Template
Subject: [ESCALATION] {Item Type}: {Description}
Body: [See design spec]

## Frequency
- Run daily at 8:00 AM (or on-demand via admin trigger)
- Prevent duplicate notifications: only queue a new notification if > 24 hours since last sent for same item
```

Expected: Automation rules documented and committed.

- [ ] **Step 2: Create placeholder automation endpoint (for future external service)**

Create file `automation/escalation-trigger.js` (Node.js example for external automation service):

```javascript
// PLACEHOLDER: This script runs daily via external scheduler (e.g., Vercel Cron, AWS Lambda)
// Connects to Zite API and executes escalation rules

const ZITE_API_BASE = process.env.ZITE_API_BASE || 'https://api.zite.com';
const ZITE_DB_ID = process.env.ZITE_DB_ID;
const ZITE_API_KEY = process.env.ZITE_API_KEY;

async function runEscalationRules() {
  console.log('Running escalation rules...');
  
  // 1. Fetch all non-resolved items from Items table
  const items = await fetchItems({
    filters: [{ field: 'Status', operator: 'not_equal', value: 'Resolved' }]
  });
  
  // 2. For each item, check escalation rules
  for (const item of items) {
    const hoursAgo = getHoursSinceActivity(item.lastActivityDate);
    const urgency = item.pmUrgency;
    
    if (urgency === 'Critical' && hoursAgo > 24) {
      await createEscalation(item, 'Age-Based Critical');
    } else if (urgency === 'High' && hoursAgo > 48) {
      await createEscalation(item, 'Age-Based High');
    } else if (urgency === 'Normal' && hoursAgo > 120) { // 5 days
      await createEscalation(item, 'Age-Based Normal');
    }
  }
  
  console.log('Escalation rules complete');
}

async function createEscalation(item, type) {
  console.log(`Escalating item ${item.id}: ${type}`);
  
  // 1. Create Escalation record
  // 2. Create Notification Queue record
  // 3. (Future) Send email notification
}

// Invoke
runEscalationRules().catch(console.error);
```

Expected: Placeholder automation script created, shows the integration pattern for future implementation.

- [ ] **Step 3: Document setup instructions**

Create file `README.md` (or update existing) with automation setup:

```markdown
## Setting Up Escalation Automation

### Option 1: Vercel Crons (Recommended)
1. Deploy `automation/escalation-trigger.js` to Vercel
2. Add to `vercel.json`:
   \`\`\`json
   {
     "crons": [
       {
         "path": "/api/escalations",
         "schedule": "0 8 * * *"
       }
     ]
   }
   \`\`\`

### Option 2: External Scheduler (e.g., Make, Zapier)
1. Create webhook endpoint for `escalation-trigger.js`
2. Configure daily trigger at 8:00 AM

### Manual Trigger
- Run `node automation/escalation-trigger.js` anytime to force escalation check

### Environment Variables Required
- `ZITE_API_BASE`: Base URL for Zite API
- `ZITE_DB_ID`: Critical Path Tracker database ID
- `ZITE_API_KEY`: Zite API key (from account settings)
```

Expected: Setup instructions clear for future implementation.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/critical-path-tracker-automation.md automation/escalation-trigger.js README.md
git commit -m "feat: document escalation rules and placeholder automation script"
```

---

## Task 7: Verify End-to-End & Document Handoff

**Files:**
- Update: `README.md` with tracker overview and usage

- [ ] **Step 1: Verify all 3 tables are linked correctly**

In Zite:
- Items table → Open foundation inspection RFI record
- Click Item ID link in Escalations table → resolves to correct Items record ✓
- Click Item ID link in Notification Queue table → resolves to correct Items record ✓
- Escalations table: Escalation ID link → resolves correctly ✓

Expected: All links navigate correctly.

- [ ] **Step 2: Verify both views work with test data**

- PM Working View: Load → verify sort (Critical RFI + Door Punch at top) ✓
- Team Accountability Dashboard: Load → verify John Smith has 2 items, others show correct counts ✓
- Aging Buckets view: Load → verify 48h+ bucket shows critical items ✓
- Inline edit a status field → verify it saves and views update ✓

Expected: All views load fast, reflect data changes in real-time.

- [ ] **Step 3: Document tracker overview**

Update/create `README.md` section:

```markdown
## Critical Path Item Tracker

### Purpose
Manage 100+ RFIs, submittals, change orders, and punch items at scale with automatic escalation.

### Database Schema
- **Items**: Core record (Item Type, Status, Urgency, Owner, Due Date, Last Activity, Next Step)
- **Escalations**: Audit log of all escalation events (trigger type, previous/new urgency, notification status)
- **Notification Queue**: Tracking for email/reminder notifications (recipient, scheduled send, status)

### Views
1. **PM Working View** — Sort by urgency + age. One-click edit Follow-up Owner, Next Step, Status. Identify overdue items instantly.
2. **Team Accountability Dashboard** — Group by Follow-up Owner. See workload distribution, critical items per person.
3. **Aging Buckets** — 0-24h / 24-48h / 48h+ buckets. Spot aging items for escalation.

### Escalation Rules (Automated)
- Critical items + 24h no activity → escalate + notify Follow-up Owner
- High items + 48h no activity → escalate + notify
- Normal items + 5 days → escalate + notify

Smart routing: notifications go to Follow-up Owner (person who can move it), not requester.

### Workflow States
Imported → Flagged → In Pursuit → Resolved

### Next Steps
1. [Configure automation trigger](automation/escalation-trigger.js) — set up daily or on-demand escalation check
2. [Integrate email notifications](#) — future: wire Escalations table to email service
3. [Import existing items](#) — create Zite API script to bulk-import from CSV or Procore exports
```

Expected: README clearly explains tracker, how to use each view, automation setup.

- [ ] **Step 4: Create quick-start guide**

Create file `docs/TRACKER_QUICKSTART.md`:

```markdown
# Quick Start: Critical Path Item Tracker

## For Project Managers
1. Open **PM Working View** in Items table
2. Items are pre-sorted: Critical items with oldest activity appear first
3. **1-minute workflow:**
   - Scan top 5 items (critical + aging)
   - Click Follow-up Owner → assign if blank
   - Click Next Step → add concrete action
   - Click Status → mark as "In Pursuit" if you've assigned it
4. **Bulk escalate:** Select multiple items → Reassign Follow-up Owner or change Status

## For Team Members
1. Open **Team Accountability Dashboard** in Items table
2. Find your name in the grouped list
3. See total count, critical count, and aging items assigned to you
4. Click any item to see full details and update status

## For Admins
1. Check **Aging Buckets** view daily
2. Items in 48h+ bucket should auto-escalate → check Escalations table for logs
3. Review Notification Queue table → see pending/sent/failed emails
4. Run automation trigger: `node automation/escalation-trigger.js`

## Creating a New Item
1. Items table → Add Record
2. Fill: Item Type, Description, Responsible Party, Follow-up Owner, Due Date
3. PM Urgency will auto-suggest based on due date (user can override)
4. Set Next Step and Last Activity Date = today
5. Status defaults to "Imported"
6. Save

## Updating Status
Click item → Status dropdown → Select new state (Flagged / In Pursuit / Resolved)
Related Escalations + Notifications auto-log the state change.
```

Expected: Quick reference for all user types.

- [ ] **Step 5: Commit final setup**

```bash
git add README.md docs/TRACKER_QUICKSTART.md
git commit -m "feat: finalize tracker setup with documentation and quick start guide"
```

---

## Plan Review: Critical Concerns?

None identified. Proceed with execution.
