#!/usr/bin/env node

/**
 * Critical Path Tracker — Escalation Trigger Script
 *
 * Runs daily (or on-demand) to identify aging items and create escalations.
 * Integrates with Zite API to read Items, write Escalations, and queue Notifications.
 *
 * Environment Variables:
 * - ZITE_API_BASE: Base URL for Zite API (default: https://api.zite.com)
 * - ZITE_DB_ID: Critical Path Tracker database ID
 * - ZITE_API_KEY: Zite API authentication key
 * - SEND_NOTIFICATIONS: Boolean, whether to actually send emails (default: false for testing)
 */

const fetch = require('node-fetch');

const ZITE_API_BASE = process.env.ZITE_API_BASE || 'https://api.zite.com';
const ZITE_DB_ID = process.env.ZITE_DB_ID;
const ZITE_API_KEY = process.env.ZITE_API_KEY;
const SEND_NOTIFICATIONS = process.env.SEND_NOTIFICATIONS === 'true';

// Table IDs (from database schema)
const TABLES = {
  ITEMS: 'tubYoQjcKZD',
  ESCALATIONS: 'tkmQRyK7J4L',
  NOTIFICATION_QUEUE: 'twxyaSwzdBH',
};

// Escalation rules: [urgency, hoursThreshold, escalationType]
const ESCALATION_RULES = [
  { urgency: 'Critical', hoursThreshold: 24, type: 'Age-Based Critical' },
  { urgency: 'High', hoursThreshold: 48, type: 'Age-Based High' },
  { urgency: 'Normal', hoursThreshold: 120, type: 'Age-Based Normal' }, // 5 days
];

async function runEscalationRules() {
  console.log('[' + new Date().toISOString() + '] Starting escalation rules...');

  try {
    // 1. Fetch all non-resolved items
    console.log('  → Fetching non-resolved items...');
    const items = await fetchItems({ status: { $ne: 'Resolved' } });
    console.log(`  ✓ Found ${items.length} items to evaluate`);

    let escalationsCreated = 0;
    let notificationsCreated = 0;

    // 2. For each item, check escalation rules
    for (const item of items) {
      const hoursAgo = getHoursSinceActivity(item.lastActivityDate);
      const urgency = item.pmUrgency;

      console.log(`  Evaluating: ${item.title} (${urgency}, ${hoursAgo}h old)`);

      // Check each rule
      for (const rule of ESCALATION_RULES) {
        if (urgency === rule.urgency && hoursAgo > rule.hoursThreshold) {
          const escalated = await createEscalation(item, rule);
          if (escalated) {
            escalationsCreated++;
            notificationsCreated++;
            console.log(`    ✓ Escalated as ${rule.type}`);
          }
          break; // Only apply one rule per item
        }
      }
    }

    console.log(`\n✓ Escalation run complete:`);
    console.log(`  - Escalations created: ${escalationsCreated}`);
    console.log(`  - Notifications queued: ${notificationsCreated}`);

  } catch (error) {
    console.error('✗ Error running escalation rules:', error);
    process.exit(1);
  }
}

async function fetchItems(filters = {}) {
  // Query Items table via Zite API
  // Returns array of item objects with all fields

  const defaultFilters = {
    status: { $ne: 'Resolved' }
  };

  // PLACEHOLDER: Replace with actual Zite API call
  // const response = await fetch(`${ZITE_API_BASE}/databases/${ZITE_DB_ID}/tables/${TABLES.ITEMS}/query`, {
  //   method: 'GET',
  //   headers: {
  //     'Authorization': `Bearer ${ZITE_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ filters: { ...defaultFilters, ...filters } })
  // });
  // const data = await response.json();
  // return data.records;

  console.warn('  ⚠ PLACEHOLDER: Replace with actual Zite API call');
  return [];
}

async function createEscalation(item, rule) {
  // Check if escalation already exists for this item today
  const recentEscalation = await hasRecentEscalation(item.id, rule.type);
  if (recentEscalation) {
    console.log(`    ⊘ Escalation already created today for this rule`);
    return false;
  }

  try {
    // Create Escalation record
    const escalationData = {
      title: `Escalation: ${item.title}`,
      'Item ID': [item.id],
      'Escalation Type': rule.type,
      'Triggered Date': new Date().toISOString(),
      'Previous Urgency': item.pmUrgency,
      'New Urgency': item.pmUrgency,
      'Notified Person': item.followUpOwner,
      'Notification Status': 'Pending',
      'Reason': `No activity for ${rule.hoursThreshold} hours; ${rule.urgency.toLowerCase()} priority item aging`
    };

    const escalationRecord = await createRecord(TABLES.ESCALATIONS, escalationData);

    // Create Notification Queue record
    const notificationData = {
      title: `Notification: ${item.title}`,
      'Item ID': [item.id],
      'Escalation ID': [escalationRecord.id],
      'Recipient': item.followUpOwner,
      'Message Type': 'Escalation',
      'Subject': `[ESCALATION] ${item.itemType}: ${item.title}`,
      'Body': generateEmailBody(item),
      'Status': 'Pending',
      'Scheduled Send': new Date().toISOString(),
      'Delivery Channel': 'Email'
    };

    const notificationRecord = await createRecord(TABLES.NOTIFICATION_QUEUE, notificationData);

    // Optional: Send email immediately
    if (SEND_NOTIFICATIONS && item.followUpOwner) {
      await sendEmail(item.followUpOwner, notificationData);
    }

    return true;

  } catch (error) {
    console.error(`    ✗ Error creating escalation: ${error.message}`);
    return false;
  }
}

async function hasRecentEscalation(itemId, escalationType) {
  // Query Escalations table: check if escalation for this item + type exists from today
  // PLACEHOLDER: Replace with actual Zite API query
  return false;
}

async function createRecord(tableId, data) {
  // PLACEHOLDER: Replace with actual Zite API call
  // const response = await fetch(`${ZITE_API_BASE}/databases/${ZITE_DB_ID}/tables/${tableId}/records`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${ZITE_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ record: data })
  // });
  // const result = await response.json();
  // return result;

  console.warn('    ⚠ PLACEHOLDER: Replace with actual Zite API call');
  return { id: 'placeholder-' + Date.now() };
}

async function sendEmail(recipient, notificationData) {
  // PLACEHOLDER: Replace with actual email service (SendGrid, Nodemailer, AWS SES, etc.)
  // const emailService = require('./email-service');
  // await emailService.send({
  //   to: recipient,
  //   subject: notificationData.Subject,
  //   body: notificationData.Body
  // });

  console.warn(`    ⚠ PLACEHOLDER: Replace with actual email service (sendto: ${recipient})`);
}

function generateEmailBody(item) {
  const lastActivityDate = new Date(item.lastActivityDate);
  const hoursAgo = getHoursSinceActivity(item.lastActivityDate);
  const timeAgoStr = hoursAgo > 24
    ? `${Math.floor(hoursAgo / 24)} days`
    : `${Math.floor(hoursAgo)} hours`;

  return `Hi ${item.followUpOwner},

This item is aging and needs your action:

Item: ${item.title}
Type: ${item.itemType}
Owner: ${item.responsibleParty}
Due: ${item.dueDate || 'Not specified'}
Last Activity: ${lastActivityDate.toISOString().split('T')[0]} (more than ${timeAgoStr} ago)
Urgency: ${item.pmUrgency}
Next Step: ${item.nextStep || 'Not specified'}

Please update status or escalate if blocked.

---
Critical Path Tracker
Database: https://build.fillout.com/database/${ZITE_DB_ID}`;
}

function getHoursSinceActivity(lastActivityDate) {
  if (!lastActivityDate) return 0;
  const lastActivity = new Date(lastActivityDate);
  const now = new Date();
  const diffMs = now - lastActivity;
  return Math.floor(diffMs / (1000 * 60 * 60));
}

// CLI entry point
if (require.main === module) {
  runEscalationRules().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runEscalationRules, createEscalation };
