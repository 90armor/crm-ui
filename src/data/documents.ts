import type { DocumentRequest, DocumentType, ReceiveMethod } from '@/types/domain'

export const DOCUMENT_TYPES: DocumentType[] = ['Japan National Insurance', 'Medical Certificate', 'Insurance Claim', 'Referral Letter', 'Lab Report']
export const RECEIVE_METHODS: ReceiveMethod[] = ['Pickup', 'Mail', 'Email', 'Courier']

export const DOCUMENT_REQUESTS: DocumentRequest[] = [
  {
    id: 'doc-1',
    contact: {
      id: 'doc-contact-1', name: '90Armor', initials: '9', color: '#3b82f6',
      source: 'Telegram', lastMessage: 'I need a copy of my insurance document.',
      firstContact: '28 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 28, 9:15 AM', activityLog: ['Document request logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    createdDate: '28 Jul 2026', status: 'Open', assignee: null,
    documentType: 'Japan National Insurance', patientName: 'HouseGreg', patientId: 'P3-88227',
    receiveMethod: 'Pickup', receiveDate: '29 Jul 2026',
  },
  {
    id: 'doc-2',
    contact: {
      id: 'doc-contact-2', name: 'Suparat K.', initials: 'SK', color: '#10b981',
      source: 'Facebook', lastMessage: 'Can you send my medical certificate by email?',
      firstContact: '24 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 25, 2:30 PM', activityLog: ['Document request logged via Facebook · 2h ago', 'Assigned to Nurse Malee S. · 1h ago'],
    },
    createdDate: '24 Jul 2026', status: 'Pending', assignee: 'Nurse Malee S.',
    documentType: 'Medical Certificate', patientName: 'Suparat Kongkiat', patientId: 'P3-88231',
    receiveMethod: 'Email', receiveDate: '26 Jul 2026',
  },
  {
    id: 'doc-3',
    contact: {
      id: 'doc-contact-3', name: 'Kittipong R.', initials: 'KR', color: '#8b5cf6',
      source: 'Manual', hnNumber: 'HN00456', phone: '0898765432', lastMessage: 'Requested a referral letter for a specialist.',
      firstContact: '19 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 23, 10:00 AM', activityLog: ['Document request logged via Manual · 2h ago', 'Assigned to Dr. Somchai P. · 1h ago'],
    },
    createdDate: '19 Jul 2026', status: 'Resolved', assignee: 'Dr. Somchai P.',
    documentType: 'Referral Letter', patientName: 'Kittipong Rattana', patientId: 'P3-88198',
    receiveMethod: 'Mail', receiveDate: '23 Jul 2026',
  },
  {
    id: 'doc-4',
    contact: {
      id: 'doc-contact-4', name: 'Nan Waraporn', initials: 'NW', color: '#f97316',
      source: 'Telegram', lastMessage: 'Need my lab results for insurance filing.',
      firstContact: '22 Jul 2026', status: 'Pending', priority: 'Prio',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 24, 4:45 PM', activityLog: ['Document request logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    createdDate: '22 Jul 2026', status: 'Pending', assignee: null,
    documentType: 'Lab Report', patientName: 'Nan Waraporn', patientId: 'P3-88245',
    receiveMethod: 'Courier', receiveDate: '27 Jul 2026',
  },
  {
    id: 'doc-5',
    contact: {
      id: 'doc-contact-5', name: 'Chaiyot S.', initials: 'CS', color: '#06b6d4',
      source: 'Facebook', lastMessage: 'Filing an insurance claim, need the paperwork.',
      firstContact: '20 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 20, 1:10 PM', activityLog: ['Document request logged via Facebook · 2h ago', 'Assigned to Nurse Ben T. · 1h ago'],
    },
    createdDate: '20 Jul 2026', status: 'Open', assignee: 'Nurse Ben T.',
    documentType: 'Insurance Claim', patientName: 'Chaiyot Somboon', patientId: 'P3-88209',
    receiveMethod: 'Pickup', receiveDate: '25 Jul 2026',
  },
  {
    id: 'doc-6',
    contact: {
      id: 'doc-contact-6', name: 'Pim Aroonrat', initials: 'PA', color: '#ec4899',
      source: 'Manual', hnNumber: 'HN00789', phone: '0876543210', lastMessage: 'Picked up my medical certificate already, confirming.',
      firstContact: '16 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 18, 9:00 AM', activityLog: ['Document request logged via Manual · 2h ago', 'Assigned to Dr. Ariya K. · 1h ago'],
    },
    createdDate: '16 Jul 2026', status: 'Resolved', assignee: 'Dr. Ariya K.',
    documentType: 'Medical Certificate', patientName: 'Pim Aroonrat', patientId: 'P3-88176',
    receiveMethod: 'Pickup', receiveDate: '18 Jul 2026',
  },
]
