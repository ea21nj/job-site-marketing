# Quick Start: Critical Path Item Tracker

Access your tracker: **https://build.fillout.com/database/ca6e6d64d4e055fd**

---

## For Project Managers (1-Minute Daily Workflow)

### Step 1: Open PM Working View
1. Go to Zite database → Items table
2. Select **PM Working View** from view dropdown
3. Items are pre-sorted: Critical items with oldest activity appear first

### Step 2: Daily Triage (5 minutes)
1. **Scan top 5-10 items** (all Critical or High urgency)
2. For each item:
   - Check **Follow-up Owner** → Is someone assigned?
   - Check **Next Step** → Is there a concrete action?
   - Check **Last Activity Date** → Is this aging?

### Step 3: Quick Actions
- **Assign owner:** Click Follow-up Owner field → type name → save
- **Update next step:** Click Next Step → add action → save
- **Mark in pursuit:** Click Status → select "In Pursuit" → save
- **Escalate:** Click PM Urgency → bump to higher priority → save

### Step 4: Multi-Select Bulk Actions
- Select multiple items (checkbox at row start)
- **Reassign Follow-up Owner** — move ownership to someone else
- **Mark as In Pursuit** — batch-update status
- **Change Urgency** — re-prioritize multiple items at once

---

## For Team Members (Check Your Workload)

### Step 1: Open Team Accountability Dashboard
1. Go to Items table
2. Select **Team Accountability Dashboard** from view dropdown
3. Items are grouped by Follow-up Owner

### Step 2: Find Your Name
- Scan group headers for your name
- See your workload summary:
  - Total items assigned to you
  - Number of Critical items
  - Number of High items
  - Number of aging items (>48h no activity)

### Step 3: Manage Your Items
- Click your group → see all assigned items
- Click any item to open details and update:
  - Status (Imported → Flagged → In Pursuit → Resolved)
  - Next Step (what's the next concrete action?)
  - Add notes/comments in Description field

### Step 4: Watch for Escalations
- Items with Last Activity > 48h will auto-escalate
- You'll receive an email notification
- Update status or Next Step to clear the escalation

---

## For Admins (Daily Oversight)

### Step 1: Check Escalation Activity
1. Open **Aging Buckets** view in Items table
2. Look at "48h+ Old" bucket
3. These are escalation candidates

### Step 2: Verify Escalation Log
1. Go to **Escalations** table
2. Check Status column:
   - "Pending" = escalation queued, waiting to notify
   - "Sent" = notification sent to owner
   - "Failed" = notification failed to send
3. Review Reason column to understand why items escalated

### Step 3: Monitor Notifications
1. Go to **Notification Queue** table
2. Check Status column:
   - "Pending" = waiting to send
   - "Sent" = sent successfully
   - "Failed" = email delivery failed
3. If failures: verify recipient email addresses, resend manually if needed

### Step 4: Manual Escalation Trigger (Testing)
- Run automation manually: `node automation/escalation-trigger.js`
- Verify new Escalation + Notification Queue records created
- Check Zite tables for expected results

---

## Creating a New Item

### Method 1: Zite UI (Fastest)
1. Items table → Click "Add Record" (or "+" button)
2. Fill required fields:
   - **Title** — Brief item name (auto-generated from Item Type + Description)
   - **Item Type** — Choose: RFI, Submittal, Change Order, Punch
   - **Description** — What is this, why does it matter?
   - **Responsible Party** — Who created/raised this item?
   - **Follow-up Owner** — Who will close it? (required for notifications)
   - **Due Date** — When does it need to be resolved?
3. Optional fields:
   - **Procore Ref ID** — Reference number from Procore or other system
   - **PM Urgency** — Critical/High/Normal (auto-suggested based on due date)
   - **Next Step** — What's the immediate action needed?
4. Click Save

### Method 2: Import from CSV (Bulk)
1. Prepare CSV with columns: Title, Item Type, Description, Responsible Party, Follow-up Owner, Due Date, Procore Ref ID
2. Zite → Items table → Import
3. Verify mapping → Import

---

## Updating Item Status

### Status Workflow
```
Imported → Flagged → In Pursuit → Resolved
```

**When to use each:**
- **Imported** — New item, initial assessment, ownership TBD
- **Flagged** — Item needs attention, has escalation or PM flag
- **In Pursuit** — Owner actively working on it (meeting scheduled, answer pending, etc.)
- **Resolved** — Item is closed, no further action needed

### How to Update Status
1. Open any item (click Title in any view)
2. Click **Status** field → dropdown
3. Select new status → Save
4. (Zite automatically logs the change and timestamp)

---

## Understanding Escalations

### How Escalations Work
1. **Automation runs daily at 8:00 AM**
2. Identifies aging items:
   - Critical with no activity > 24 hours
   - High with no activity > 48 hours
   - Normal with no activity > 5 days
3. Creates Escalations + Notification records
4. Sends email to Follow-up Owner

### What You'll See
- **Escalations table** grows with escalation records
- **Notification Queue** shows "Pending" notifications
- **Email arrives** in your inbox (if configured)

### How to Respond
1. Receive escalation email
2. Open item in Zite
3. Update **Status** (mark "In Pursuit" if actively working)
4. Update **Next Step** with what you're doing next
5. Update **Last Activity Date** to today (helps prevent duplicate escalations)

---

## Useful Filters & Searches

### Pre-Built Views
- **PM Working View** — Critical + High items, sorted by urgency + age
- **Team Accountability Dashboard** — Items grouped by owner, workload visibility
- **Aging Buckets** — Items grouped by activity age (0-24h / 24-48h / 48h+)

### Custom Filters (Create Your Own)
In any view, click **Filter** to add:
- Status = "Flagged" (show only flagged items)
- PM Urgency = "Critical" AND Last Activity Date < 1 day ago (critical + aging)
- Follow-up Owner = "[Your Name]" (show only your items)
- Due Date < today (show overdue items)

---

## Keyboard Shortcuts & Tips

- **Search**: Ctrl+F (Zite search across all items)
- **Add Record**: "+" button at top of Items table
- **Inline Edit**: Click any field to edit directly (no need to open full item)
- **Sort**: Click column header to sort A-Z or newest-oldest
- **Bulk Edit**: Select multiple rows with checkboxes, then choose bulk action

---

## Common Scenarios

### Scenario: You Receive an Escalation Email
1. Read email → has item title, urgency, due date, last activity date
2. Click link to Zite or open database directly
3. Find item in **PM Working View** (sorted by urgency)
4. Click Follow-up Owner → confirm it's you
5. Click Next Step → add action or note
6. Click Status → mark "In Pursuit" if actively working
7. That's it! No further escalations until 24 hours pass with no activity

### Scenario: You're Drowning in Items
1. Open **Team Accountability Dashboard**
2. Find your name → see total count
3. If count > 20: probably need help
4. Talk to PM → can reassign to others
5. Focus on Critical items first (PM Urgency = "Critical")

### Scenario: An Item Is Stuck/Blocked
1. Open item in Zite
2. Click Next Step → note what's blocking it (e.g., "Waiting for customer approval")
3. Click Status → stay in same status, don't mark "Resolved"
4. The escalation email will go to Follow-up Owner, who can escalate to PM if needed

### Scenario: You Resolved an Item
1. Open item in Zite
2. Click Status → select "Resolved"
3. (Zite will stop escalating once status is Resolved)
4. Optional: click Description to add final note (e.g., "Approved 2026-04-17")

---

## Getting Help

**Tracker Overview:** `docs/superpowers/specs/2026-04-17-critical-path-tracker-design.md`

**Views Setup Guide:** `docs/superpowers/specs/critical-path-tracker-views.md`

**Automation Rules:** `docs/superpowers/specs/critical-path-tracker-automation.md`

**Automation Deployment:** `docs/AUTOMATION_SETUP.md`

**Questions?** Contact your PM or project lead.
