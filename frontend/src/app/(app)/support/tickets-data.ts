// ---------------------------------------------------------------------------
// Support tickets — shared fake data for the support module.
// All figures are illustrative. No Math.random / Date.now at module scope.
// ---------------------------------------------------------------------------

import { customers, team } from "@/data";

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketStatus = "Open" | "Pending" | "Resolved" | "Closed";

export type TicketMessage = {
  id: string;
  author: string;
  avatar: string;
  role: "requester" | "agent";
  time: string;
  body: string;
};

export type Ticket = {
  id: string;
  subject: string;
  requester: string;
  requesterEmail: string;
  requesterAvatar: string;
  company: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  assignee: string;
  assigneeAvatar: string;
  created: string;
  updated: string;
  tags: string[];
  messages: TicketMessage[];
};

// Support agents (pulled from the team directory in @/data).
const agents = {
  hannah: team[5], // Hannah Kim — Customer Success Lead
  priya: team[3], // Priya Nair — Product Designer (billing specialist)
  emma: team[7], // Emma Novak — Frontend Engineer
  marcus: team[2], // Marcus Chen — Staff Engineer
  omar: team[8], // Omar Haddad — DevOps Engineer
};

type Raw = {
  id: string;
  subject: string;
  requester: (typeof customers)[number];
  agent: (typeof team)[number];
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  created: string;
  updated: string;
  tags: string[];
  thread: { from: "requester" | "agent"; time: string; body: string }[];
};

const raw: Raw[] = [
  {
    id: "TKT-2048",
    subject: "Unable to export analytics to CSV",
    requester: customers[0],
    agent: agents.hannah,
    priority: "High",
    status: "Open",
    category: "Bug",
    created: "2026-07-16",
    updated: "2026-07-17",
    tags: ["analytics", "export", "csv"],
    thread: [
      {
        from: "requester",
        time: "Jul 16, 2026 · 9:12 AM",
        body: "When I click “Export to CSV” on the Analytics page nothing downloads. The button spins for a second and then goes back to normal. I've tried Chrome and Safari with the same result.",
      },
      {
        from: "agent",
        time: "Jul 16, 2026 · 9:40 AM",
        body: "Thanks for the detailed report — sorry for the trouble! Could you let me know roughly how many rows the report contains? We've seen the spinner stall on very large date ranges while the file is being prepared in the background.",
      },
      {
        from: "requester",
        time: "Jul 16, 2026 · 10:05 AM",
        body: "It's the last 90 days, so probably around 40k rows. Narrowing it to 7 days does download fine, so it looks size-related like you said.",
      },
      {
        from: "agent",
        time: "Jul 17, 2026 · 8:22 AM",
        body: "That's really helpful — I've reproduced it above ~25k rows and passed it to engineering. As a workaround you can export in monthly chunks for now. I'll keep this ticket open and update you the moment the fix ships.",
      },
    ],
  },
  {
    id: "TKT-2049",
    subject: "Charged twice for the Pro plan this month",
    requester: customers[4],
    agent: agents.priya,
    priority: "Urgent",
    status: "Open",
    category: "Billing",
    created: "2026-07-17",
    updated: "2026-07-17",
    tags: ["billing", "duplicate-charge", "refund"],
    thread: [
      {
        from: "requester",
        time: "Jul 17, 2026 · 7:48 AM",
        body: "I was charged $49 twice on the same day for my Pro subscription. My bank statement shows both transactions. Can you please refund the duplicate?",
      },
      {
        from: "agent",
        time: "Jul 17, 2026 · 8:10 AM",
        body: "I'm sorry about that — I can see the duplicate authorization on your account. I've flagged it for an immediate refund; the second $49 charge will drop off within 3–5 business days. I'll confirm here once it's processed.",
      },
    ],
  },
  {
    id: "TKT-2050",
    subject: "How do I invite teammates to my workspace?",
    requester: customers[8],
    agent: agents.emma,
    priority: "Low",
    status: "Resolved",
    category: "How-to",
    created: "2026-07-15",
    updated: "2026-07-17",
    tags: ["onboarding", "team", "invites"],
    thread: [
      {
        from: "requester",
        time: "Jul 15, 2026 · 2:31 PM",
        body: "We just upgraded and I want to add my two colleagues. I can't find where to send invites — could you point me in the right direction?",
      },
      {
        from: "agent",
        time: "Jul 15, 2026 · 2:52 PM",
        body: "Great to have you on the Pro plan! Head to Settings → Members → Invite, then enter their email addresses and pick a role. They'll get an email with a join link that's valid for 7 days.",
      },
      {
        from: "requester",
        time: "Jul 17, 2026 · 9:05 AM",
        body: "That did it — both are in now. Thank you for the quick help!",
      },
      {
        from: "agent",
        time: "Jul 17, 2026 · 9:11 AM",
        body: "Wonderful! I'll mark this as resolved, but feel free to reopen it if anything else comes up. Have a great week.",
      },
    ],
  },
  {
    id: "TKT-2051",
    subject: "SSO login gets stuck in a redirect loop",
    requester: customers[12],
    agent: agents.marcus,
    priority: "Urgent",
    status: "Pending",
    category: "Bug",
    created: "2026-07-14",
    updated: "2026-07-16",
    tags: ["sso", "saml", "auth"],
    thread: [
      {
        from: "requester",
        time: "Jul 14, 2026 · 11:20 AM",
        body: "Since this morning our whole team is unable to sign in via Okta SSO. The page keeps bouncing between your login screen and Okta until it errors out with “too many redirects”.",
      },
      {
        from: "agent",
        time: "Jul 14, 2026 · 11:44 AM",
        body: "Thanks for flagging — a redirect loop usually means the ACS URL or clock skew on the IdP is off. Could you confirm the exact ACS URL configured in Okta so I can compare it against what we expect?",
      },
      {
        from: "requester",
        time: "Jul 15, 2026 · 8:30 AM",
        body: "Here's the ACS URL from our Okta app: https://app.orbynadmin.com/auth/saml/callback. Let me know if that looks right.",
      },
      {
        from: "agent",
        time: "Jul 16, 2026 · 10:02 AM",
        body: "That URL is correct. I've pushed a config change on our side to relax the assertion time window — please try again and let me know. I'm keeping this pending on your confirmation.",
      },
    ],
  },
  {
    id: "TKT-2052",
    subject: "Feature request: dark mode for exported reports",
    requester: customers[16],
    agent: agents.hannah,
    priority: "Low",
    status: "Open",
    category: "Feature Request",
    created: "2026-07-13",
    updated: "2026-07-15",
    tags: ["reports", "dark-mode", "feature"],
    thread: [
      {
        from: "requester",
        time: "Jul 13, 2026 · 4:10 PM",
        body: "The in-app dark mode is fantastic, but the PDF reports we export are always light. Any chance of a dark theme for exports? We share these in dark-themed decks.",
      },
      {
        from: "agent",
        time: "Jul 15, 2026 · 9:18 AM",
        body: "Love this idea — thank you! I've added it to our product board and linked your account so you'll be notified if it's picked up. I'll leave the ticket open to track interest.",
      },
    ],
  },
  {
    id: "TKT-2053",
    subject: "Dashboard loads very slowly on mobile data",
    requester: customers[20],
    agent: agents.omar,
    priority: "Medium",
    status: "Pending",
    category: "Performance",
    created: "2026-07-12",
    updated: "2026-07-16",
    tags: ["performance", "mobile", "dashboard"],
    thread: [
      {
        from: "requester",
        time: "Jul 12, 2026 · 1:05 PM",
        body: "On my phone over 4G the dashboard takes 15+ seconds to load. On desktop wifi it's instant. Is there anything that can be done to speed it up on mobile?",
      },
      {
        from: "agent",
        time: "Jul 12, 2026 · 1:39 PM",
        body: "Appreciate the report. The dashboard preloads a lot of chart data up front — we're rolling out lazy-loading for below-the-fold widgets. Could you tell me your device model so I can check it against our test matrix?",
      },
      {
        from: "requester",
        time: "Jul 16, 2026 · 8:50 AM",
        body: "It's an iPhone 14 on iOS 18. Happy to test any beta build you have.",
      },
    ],
  },
  {
    id: "TKT-2054",
    subject: "Password reset email never arrives",
    requester: customers[24],
    agent: agents.emma,
    priority: "Medium",
    status: "Resolved",
    category: "Account",
    created: "2026-07-15",
    updated: "2026-07-17",
    tags: ["account", "email", "password"],
    thread: [
      {
        from: "requester",
        time: "Jul 15, 2026 · 6:22 PM",
        body: "I've requested a password reset four times and nothing shows up, not even in spam. I'm locked out of my account.",
      },
      {
        from: "agent",
        time: "Jul 15, 2026 · 6:40 PM",
        body: "Sorry about that! Your address was on a temporary suppression list from an earlier bounce. I've cleared it and sent a fresh reset link manually — it should arrive within a minute.",
      },
      {
        from: "requester",
        time: "Jul 17, 2026 · 7:15 AM",
        body: "Got it and I'm back in. Thanks for sorting it out so fast.",
      },
    ],
  },
  {
    id: "TKT-2055",
    subject: "Invoice PDF shows the wrong tax rate",
    requester: customers[28],
    agent: agents.priya,
    priority: "High",
    status: "Open",
    category: "Billing",
    created: "2026-07-16",
    updated: "2026-07-16",
    tags: ["billing", "invoice", "tax"],
    thread: [
      {
        from: "requester",
        time: "Jul 16, 2026 · 10:48 AM",
        body: "Our latest invoice lists 8% VAT, but our region should be 20%. Our finance team can't process it until the rate is corrected. Can you reissue it?",
      },
      {
        from: "agent",
        time: "Jul 16, 2026 · 11:20 AM",
        body: "Thanks for catching this. It looks like the tax region on your billing profile wasn't updated after your address change. I'm correcting it now and will reissue a fresh invoice with the right VAT for you today.",
      },
    ],
  },
  {
    id: "TKT-2056",
    subject: "Getting 429 rate-limit errors on the API",
    requester: customers[32],
    agent: agents.marcus,
    priority: "High",
    status: "Pending",
    category: "API",
    created: "2026-07-13",
    updated: "2026-07-15",
    tags: ["api", "rate-limit", "integration"],
    thread: [
      {
        from: "requester",
        time: "Jul 13, 2026 · 9:02 AM",
        body: "Our sync job started hitting HTTP 429 responses this week even though our volume hasn't changed. Did the rate limits change recently?",
      },
      {
        from: "agent",
        time: "Jul 13, 2026 · 9:35 AM",
        body: "We did tighten burst limits to protect the platform. Your integration is bursting ~200 requests in under a second on each run. Adding exponential backoff (or spacing calls to ~50/sec) should resolve it — I can share a sample retry snippet.",
      },
      {
        from: "requester",
        time: "Jul 15, 2026 · 2:14 PM",
        body: "A snippet would be great, thanks. We use Node on our side.",
      },
    ],
  },
  {
    id: "TKT-2057",
    subject: "Need a quote to upgrade to Enterprise",
    requester: customers[36],
    agent: agents.hannah,
    priority: "Medium",
    status: "Closed",
    category: "Sales",
    created: "2026-07-10",
    updated: "2026-07-14",
    tags: ["sales", "enterprise", "quote"],
    thread: [
      {
        from: "requester",
        time: "Jul 10, 2026 · 3:28 PM",
        body: "We're on Pro with 18 seats and are considering Enterprise for SSO and audit logs. Could you send over pricing for around 40 seats?",
      },
      {
        from: "agent",
        time: "Jul 10, 2026 · 4:02 PM",
        body: "Absolutely — I've put together a 40-seat Enterprise quote including SSO, audit logs and priority support and emailed it over. Happy to jump on a call to walk through it whenever suits you.",
      },
      {
        from: "requester",
        time: "Jul 14, 2026 · 11:00 AM",
        body: "Got the quote and forwarded it to procurement. We'll come back through our account manager to finalize. Thanks!",
      },
      {
        from: "agent",
        time: "Jul 14, 2026 · 11:15 AM",
        body: "Perfect, sounds good. I'll close this ticket for now — reach out anytime and we'll pick it right back up.",
      },
    ],
  },
];

export const tickets: Ticket[] = raw.map((t) => ({
  id: t.id,
  subject: t.subject,
  requester: t.requester.name,
  requesterEmail: t.requester.email,
  requesterAvatar: t.requester.avatar,
  company: t.requester.company,
  priority: t.priority,
  status: t.status,
  category: t.category,
  assignee: t.agent.name,
  assigneeAvatar: t.agent.avatar,
  created: t.created,
  updated: t.updated,
  tags: t.tags,
  messages: t.thread.map((m, i) => ({
    id: `${t.id}-M${i + 1}`,
    author: m.from === "requester" ? t.requester.name : t.agent.name,
    avatar: m.from === "requester" ? t.requester.avatar : t.agent.avatar,
    role: m.from,
    time: m.time,
    body: m.body,
  })),
}));

export const getTicketById = (id: string) => tickets.find((t) => t.id === id);
