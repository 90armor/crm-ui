import type { MedicineRequest, MedicinePurpose } from '@/types/domain'

export const MEDICINE_PURPOSES: MedicinePurpose[] = ['Request Only', 'Refill', 'New Prescription', 'Delivery Request']

export const MEDICINE_REQUESTS: MedicineRequest[] = [
  {
    id: 'med-1',
    contact: {
      id: 'med-contact-1', name: 'Poky', initials: 'P', color: '#3b82f6',
      source: 'Telegram', lastMessage: 'Can I request my usual medicine only, no consultation needed?',
      firstContact: '28 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 28, 8:50 AM', activityLog: ['Medicine request logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    patientId: 'P12345', createdDate: '28 Jul 2026', status: 'Open', assignee: null,
    purpose: 'Request Only', items: 1,
  },
  {
    id: 'med-2',
    contact: {
      id: 'med-contact-2', name: 'Suparat K.', initials: 'SK', color: '#10b981',
      source: 'Facebook', lastMessage: 'Need a refill for my blood pressure medication.',
      firstContact: '24 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 25, 3:00 PM', activityLog: ['Medicine request logged via Facebook · 2h ago', 'Assigned to Nurse Malee S. · 1h ago'],
    },
    patientId: 'P12389', createdDate: '24 Jul 2026', status: 'Pending', assignee: 'Nurse Malee S.',
    purpose: 'Refill', items: 2,
  },
  {
    id: 'med-3',
    contact: {
      id: 'med-contact-3', name: 'Kittipong R.', initials: 'KR', color: '#8b5cf6',
      source: 'Manual', hnNumber: 'HN00456', phone: '0898765432', lastMessage: 'Doctor prescribed new medication, need it dispensed.',
      firstContact: '19 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 22, 11:20 AM', activityLog: ['Medicine request logged via Manual · 2h ago', 'Assigned to Dr. Somchai P. · 1h ago'],
    },
    patientId: 'P12312', createdDate: '19 Jul 2026', status: 'Resolved', assignee: 'Dr. Somchai P.',
    purpose: 'New Prescription', items: 3,
  },
  {
    id: 'med-4',
    contact: {
      id: 'med-contact-4', name: 'Nan Waraporn', initials: 'NW', color: '#f97316',
      source: 'Telegram', lastMessage: 'Can my medicine be delivered instead of picking up?',
      firstContact: '22 Jul 2026', status: 'Pending', priority: 'Prio',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 24, 1:15 PM', activityLog: ['Medicine request logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    patientId: 'P12401', createdDate: '22 Jul 2026', status: 'Pending', assignee: null,
    purpose: 'Delivery Request', items: 4,
  },
  {
    id: 'med-5',
    contact: {
      id: 'med-contact-5', name: 'Chaiyot S.', initials: 'CS', color: '#06b6d4',
      source: 'Facebook', lastMessage: 'Requesting my regular vitamins, no appointment.',
      firstContact: '20 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 20, 9:30 AM', activityLog: ['Medicine request logged via Facebook · 2h ago', 'Assigned to Nurse Ben T. · 1h ago'],
    },
    patientId: 'P12377', createdDate: '20 Jul 2026', status: 'Open', assignee: 'Nurse Ben T.',
    purpose: 'Request Only', items: 1,
  },
  {
    id: 'med-6',
    contact: {
      id: 'med-contact-6', name: 'Pim Aroonrat', initials: 'PA', color: '#ec4899',
      source: 'Manual', hnNumber: 'HN00789', phone: '0876543210', lastMessage: 'Confirming refill was picked up already.',
      firstContact: '16 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 18, 10:40 AM', activityLog: ['Medicine request logged via Manual · 2h ago', 'Assigned to Dr. Ariya K. · 1h ago'],
    },
    patientId: 'P12298', createdDate: '16 Jul 2026', status: 'Resolved', assignee: 'Dr. Ariya K.',
    purpose: 'Refill', items: 2,
  },
]
