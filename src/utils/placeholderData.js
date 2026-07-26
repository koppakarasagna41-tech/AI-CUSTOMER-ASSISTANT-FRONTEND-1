/**
 * placeholderData.js
 *
 * Static mock data used across pages until real APIs are connected.
 * Swap these out by replacing the relevant service calls.
 */

import { generateId } from './helpers';

// ── Conversations ─────────────────────────────────────────────
export const PLACEHOLDER_CONVERSATIONS = [
  {
    id:        generateId(),
    title:     'Order tracking issue',
    preview:   'Hi, I placed an order 5 days ago but haven\'t received a shipping update…',
    status:    'open',
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    messages:  12,
    tags:      ['shipping', 'orders'],
  },
  {
    id:        generateId(),
    title:     'Billing discrepancy',
    preview:   'I was charged twice for my subscription this month. Please help.',
    status:    'resolved',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messages:  7,
    tags:      ['billing'],
  },
  {
    id:        generateId(),
    title:     'Account login problem',
    preview:   'I can\'t log into my account. Reset password email is not arriving.',
    status:    'pending',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages:  4,
    tags:      ['account', 'auth'],
  },
  {
    id:        generateId(),
    title:     'Product return request',
    preview:   'I would like to return the headphones I purchased last week.',
    status:    'open',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    messages:  9,
    tags:      ['returns', 'products'],
  },
  {
    id:        generateId(),
    title:     'Feature request — dark mode',
    preview:   'It would be great to have a dark mode option in the mobile app.',
    status:    'resolved',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    messages:  3,
    tags:      ['feature-request'],
  },
  {
    id:        generateId(),
    title:     'Integration with Slack',
    preview:   'Can you provide documentation for the Slack integration?',
    status:    'open',
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    messages:  6,
    tags:      ['integrations'],
  },
];

// ── Analytics metrics ─────────────────────────────────────────
export const PLACEHOLDER_METRICS = {
  totalConversations: 1284,
  resolvedToday:       47,
  avgResponseTime:     '1m 32s',
  satisfactionScore:   94.2,
  activeUsers:         312,
  aiResolutionRate:    78,
};

export const PLACEHOLDER_CHART_DATA = [
  { day: 'Mon', conversations: 42,  resolved: 38  },
  { day: 'Tue', conversations: 58,  resolved: 50  },
  { day: 'Wed', conversations: 35,  resolved: 30  },
  { day: 'Thu', conversations: 71,  resolved: 65  },
  { day: 'Fri', conversations: 89,  resolved: 80  },
  { day: 'Sat', conversations: 54,  resolved: 48  },
  { day: 'Sun', conversations: 29,  resolved: 26  },
];

export const PLACEHOLDER_TOP_ISSUES = [
  { topic: 'Shipping & Delivery', count: 324, pct: 25 },
  { topic: 'Billing & Payments',  count: 247, pct: 19 },
  { topic: 'Account Access',      count: 198, pct: 15 },
  { topic: 'Product Returns',     count: 176, pct: 14 },
  { topic: 'Technical Support',   count: 143, pct: 11 },
  { topic: 'Feature Requests',    count:  98, pct:  8 },
  { topic: 'Other',               count: 104, pct:  8 },
];

// ── Demo user ─────────────────────────────────────────────────
export const DEMO_USER = {
  id:     'usr_demo_001',
  name:   'Alex Johnson',
  email:  'alex@example.com',
  avatar: null,          // null = show initials fallback
  role:   'admin',
  plan:   'Pro',
  joinedAt: '2025-01-15T09:00:00Z',
};

export const DEMO_CREDENTIALS = {
  email:    'demo@example.com',
  password: 'Demo1234',
};
