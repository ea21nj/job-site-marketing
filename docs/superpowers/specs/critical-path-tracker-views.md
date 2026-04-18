# Critical Path Item Tracker — Views Setup Guide

## View 1: PM Working View

**Purpose:** Fast visibility into critical/high items needing action. One-click operations for PM.

**Table:** Items

**Setup Steps in Zite:**

1. Open Items table → Click "+" to add new view
2. Name: `PM Working View`
3. View Type: Grid
4. **Sorting:**
   - Primary sort: PM Urgency (descending: Critical → High → Normal)
   - Secondary sort: Last Activity Date (ascending: oldest first)

5. **Visible Columns (in order):**
   - Title
   - Item Type
   - Description
   - Responsible Party
   - Follow-up Owner (editable inline)
   - PM Urgency (editable inline, color-coded)
   - Last Activity Date
   - Due Date
   - Next Step (editable inline)
   - Status (editable inline)

6. **Field Properties:**
   - Enable inline editing for: Follow-up Owner, PM Urgency, Next Step, Status
   - Hide: Procore Ref ID, User Override, Triggered Date (if shown)

7. **Filters (Optional - can be added as presets):**
   - Filter Preset "Critical + Aging": Status != "Resolved" AND PM Urgency = "Critical" AND Last Activity Date < today - 1 day
   - Filter Preset "High + Aging": Status != "Resolved" AND PM Urgency = "High" AND Last Activity Date < today - 2 days

8. **Grouping:** None (flat list, sorted by urgency + age)

9. **Colors/Formatting:**
   - PM Urgency column: Color code (Critical = Red, High = Orange, Normal = Gray)
   - Highlight rows where Last Activity Date > 7 days ago (optional)

**Expected Behavior:**
- Open view → critical items with oldest activity appear first
- PM can scan top 5-10 items and see exactly who owns them and what's next
- Click Follow-up Owner, Next Step, or Status → edit inline → saves immediately
- Multi-select items → bulk reassign or status change

---

## View 2: Team Accountability Dashboard

**Purpose:** Show workload distribution, aging items by owner, and team member accountability.

**Table:** Items

**Setup Steps in Zite:**

1. Open Items table → Click "+" to add new view
2. Name: `Team Accountability Dashboard`
3. View Type: Grid
4. **Grouping:**
   - Group by: Follow-up Owner (primary grouping)

5. **Group Configuration:**
   - Show summary cards for each group:
     - Total count of items assigned to owner
     - Count of Critical items
     - Count of High items
     - Count of items with Last Activity Date > 48 hours ago (aging)

6. **Visible Columns:**
   - Title
   - Item Type
   - Description
   - Status
   - PM Urgency (color-coded)
   - Last Activity Date
   - Due Date

7. **Sorting (within groups):**
   - Primary: PM Urgency (descending)
   - Secondary: Last Activity Date (ascending)

8. **Filters:**
   - Hide Resolved items (optional): Status != "Resolved"

9. **Summary Info per Owner:**
   - Click owner group header → see count of items in each status (Imported, Flagged, In Pursuit, Resolved)

**Expected Behavior:**
- Open view → groups show all Follow-up Owners with their assigned items
- Scan group headers to see who has the most items, who has critical items
- Identify bottlenecks (one person with 20+ items while others have 2-3)
- Items with Last Activity > 48h are escalation candidates

---

## View 3: Aging Buckets (Alternative/Secondary View)

**Purpose:** Quick identification of aging items regardless of owner. Supports escalation workflows.

**Table:** Items

**Setup Steps in Zite:**

1. Open Items table → Click "+" to add new view
2. Name: `Aging Buckets`
3. View Type: Grid
4. **Grouping:**
   - Group by: Custom formula or manual grouping
   - If Zite doesn't support dynamic age grouping, group by PM Urgency instead as a proxy

5. **Visible Columns:**
   - Title
   - Description
   - Follow-up Owner
   - PM Urgency
   - Last Activity Date
   - Status

6. **Sorting (within groups):**
   - By PM Urgency (Critical first)

7. **Manual Group Names (if using static grouping):**
   - Create 3 groups manually in view:
     - "0-24h Old"
     - "24-48h Old"
     - "48h+ Old"
   - Drag/filter items into groups based on Last Activity Date

**Alternative Approach (if Zite supports Formulas):**
- Create a formula field in Items table: `AgeInHours = (Today - Last Activity Date) * 24`
- Group by this formula field with ranges: 0-24, 24-48, 48+

**Expected Behavior:**
- Open view → see items organized by how long since last activity
- Scan "48h+ Old" bucket → these are escalation candidates
- All Critical/High items in 48h+ bucket should be flagged for escalation

---

## View Layout Summary

| View Name | Grouping | Sort | Key Use Case |
|-----------|----------|------|--------------|
| PM Working View | None | Urgency → Age | Fast triage & bulk actions |
| Team Accountability | By Owner | Urgency → Age | Workload visibility & accountability |
| Aging Buckets | By Age | Urgency | Escalation identification |

---

## Testing Views

Once created, test each view with the 4 sample records in Items table:
1. Foundation Inspection RFI (Critical, 2+ days old, Owner: John Smith)
2. Site Access Change Order (High, ~2 days old, Owner: Jane Doe)
3. Concrete Mix Submittal (Normal, ~3 hours old, Owner: Mike Johnson)
4. Door Frame Punch (Critical, ~1.5 days old, Owner: Sarah Lee)

**Expected Results:**
- **PM Working View:** RFI and Door Punch appear at top (both Critical, oldest first)
- **Team Accountability:** John Smith shows 1 Critical item, Jane Doe shows 1 High item, etc.
- **Aging Buckets:** Both Critical items in 48h+ bucket, Change Order in 24-48h, Submittal in 0-24h
