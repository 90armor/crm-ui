import type { SupportRequest } from '@/types/domain'

export const SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'sup-1',
    contact: {
      id: 'sup-contact-1', name: 'Poky', initials: 'P', color: '#3b82f6',
      source: 'Telegram', lastMessage: 'ASDFF',
      firstContact: '28 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 28, 8:10 AM', activityLog: ['Support request logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    patientId: 'P1234', createdDate: '28 Jul 2026', status: 'Open', assignee: null,
    purpose: 'ASDFF', comments: '-', callbackNo: '023456781',
  },
  {
    id: 'sup-2',
    contact: {
      id: 'sup-contact-2', name: 'Suparat K.', initials: 'SK', color: '#10b981',
      source: 'Facebook', lastMessage: 'I was charged twice for my last visit, please help.',
      firstContact: '24 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 25, 11:00 AM', activityLog: ['Support request logged via Facebook · 2h ago', 'Assigned to Nurse Malee S. · 1h ago'],
    },
    patientId: 'P1267', createdDate: '24 Jul 2026', status: 'Pending', assignee: 'Nurse Malee S.',
    purpose: 'Billing inquiry', comments: 'Waiting on finance to confirm the duplicate charge.', callbackNo: '0891234567',
  },
  {
    id: 'sup-3',
    contact: {
      id: 'sup-contact-3', name: 'Kittipong R.', initials: 'KR', color: '#8b5cf6',
      source: 'Manual', hnNumber: 'HN00456', phone: '0898765432', lastMessage: 'Can\'t log in to the patient portal.',
      firstContact: '19 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 21, 9:30 AM', activityLog: ['Support request logged via Manual · 2h ago', 'Assigned to Dr. Somchai P. · 1h ago'],
    },
    patientId: 'P1198', createdDate: '19 Jul 2026', status: 'Resolved', assignee: 'Dr. Somchai P.',
    purpose: 'Portal login issue', comments: 'Password reset sent, confirmed working.', callbackNo: '0898765432',
  },
  {
    id: 'sup-4',
    contact: {
      id: 'sup-contact-4', name: 'Nan Waraporn', initials: 'NW', color: '#f97316',
      source: 'Telegram', lastMessage: 'Wanted to give feedback about the waiting time.',
      firstContact: '22 Jul 2026', status: 'Pending', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 23, 3:20 PM', activityLog: ['Support request logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    patientId: 'P1245', createdDate: '22 Jul 2026', status: 'Pending', assignee: null,
    purpose: 'General feedback', comments: '-', callbackNo: '0865551234',
  },
  {
    id: 'sup-5',
    contact: {
      id: 'sup-contact-5', name: 'Chaiyot S.', initials: 'CS', color: '#06b6d4',
      source: 'Facebook', lastMessage: 'Need help understanding my last invoice.',
      firstContact: '20 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 20, 10:05 AM', activityLog: ['Support request logged via Facebook · 2h ago', 'Assigned to Nurse Ben T. · 1h ago'],
    },
    patientId: 'P1209', createdDate: '20 Jul 2026', status: 'Open', assignee: 'Nurse Ben T.',
    purpose: 'Billing inquiry', comments: 'Called once, no answer — retry tomorrow.', callbackNo: '0877654321',
  },
  {
    id: 'sup-6',
    contact: {
      id: 'sup-contact-6', name: 'Pim Aroonrat', initials: 'PA', color: '#ec4899',
      source: 'Manual', hnNumber: 'HN00789', phone: '0876543210', lastMessage: 'Thanks, my issue got sorted out already.',
      firstContact: '16 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 17, 4:00 PM', activityLog: ['Support request logged via Manual · 2h ago', 'Assigned to Dr. Ariya K. · 1h ago'],
    },
    patientId: 'P1176', createdDate: '16 Jul 2026', status: 'Resolved', assignee: 'Dr. Ariya K.',
    purpose: 'Technical support', comments: 'Reinstalled the app, resolved.', callbackNo: '0876543210',
  },
]
