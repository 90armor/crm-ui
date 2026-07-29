import type { Contact, Dept, ViewAs } from '@/types/domain'

export const INIT: Contact[] = [
  {
    id: '1', name: 'Thanawat N.', initials: 'TN', color: '#3b82f6',
    source: 'Telegram', lastMessage: 'សួស្តី ខ្ញុំចង់សួរអំពីថ្នាំ',
    firstContact: '08 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 03:55 AM',
    activityLog: ['Inquiry logged from Telegram · 3h ago', 'Status set to Pending · 3h ago'],
  },
  {
    id: '2', name: 'Wyan Phang M.', initials: 'WP', color: '#f97316',
    source: 'Telegram', lastMessage: 'ចង់ណាត់ជួបគ្រូពេទ្យបន្ទាន់',
    firstContact: '03 Jul 2026', status: 'Open', priority: 'Prio',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 4:25 AM',
    activityLog: ['Priority set to Prio · 1h ago', 'Inquiry logged from Telegram · 2h ago'],
  },
  {
    id: '3', name: 'Muait Phang M.', initials: 'MP', color: '#8b5cf6',
    source: 'Telegram', lastMessage: 'How are you doing?',
    firstContact: '01 Jul 2026', status: 'Pending', priority: 'Normal',
    chain: [
      { dept: 'Nurse (OPD)', comment: 'Check vitals and initial assessment', returnComment: '', entryStatus: 'active' },
      { dept: 'Pharmacy', comment: 'Dispense prescribed medication after nurse review', returnComment: '', entryStatus: 'queued', pharmacyType: 'Medicine only' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 15, 11:00 AM',
    activityLog: ['Assigned to Nurse (OPD) · 2h ago', 'Status set to Pending · 5h ago', 'Inquiry logged from Telegram · 5h ago'],
  },
  {
    id: '4', name: 'Danuri T.', initials: 'DT', color: '#10b981',
    source: 'Facebook', lastMessage: 'អ្នកជំងឺបានទទួលការព្យាបាលធម្មតាហើយ',
    firstContact: '10 Jul 2026', status: 'Closed', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 11, 4:17 PM',
    activityLog: ['Case closed · 1d ago', 'Pharmacy completed · 1d ago', 'Assigned to Pharmacy · 2d ago'],
  },
  {
    id: '5', name: 'Suda K.', initials: 'SK', color: '#06b6d4',
    source: 'Facebook', lastMessage: 'ចង់សួរអំពីការណាត់ជួប',
    firstContact: '10 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 10, 3:10 PM',
    activityLog: ['Inquiry logged from Facebook · 4h ago'],
  },
  {
    id: '6', name: 'Arun P.', initials: 'AP', color: '#ec4899',
    source: 'Manual', hnNumber: 'HN00123', phone: '0891234567', lastMessage: 'Inquired about post-op care',
    firstContact: '12 Jul 2026', status: 'Pending', priority: 'Prio',
    chain: [
      { dept: 'MA (IPD)', comment: 'Handle post-op care inquiry and coordinate with nurse', returnComment: '', entryStatus: 'active' },
      { dept: 'Nurse (OPD)', comment: 'Follow up on post-op status and wound check', returnComment: '', entryStatus: 'queued' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 12, 10:00 AM',
    activityLog: ['Assigned to MA (IPD) · 1h ago', 'Priority set to Prio · 2h ago', 'Inquiry logged from Manual · 8h ago'],
  },
  {
    id: '7', name: 'Somsak W.', initials: 'SW', color: '#f59e0b',
    source: 'Facebook', lastMessage: 'ចង់សួរអំពីថ្នាំដែលត្រូវលេប',
    firstContact: '15 Jul 2026', status: 'Pending', priority: 'Normal',
    chain: [
      { dept: 'Pharmacy', comment: 'Please check medication for this patient', returnComment: 'ថ្នាំនេះត្រូវការការអនុម័តពីគ្រូពេទ្យសិន មិនអាចចែកឱ្យបានទេ', entryStatus: 'returned', pharmacyType: 'Question' },
    ],
    currentChainIndex: 0, lastActive: 'Jul 16, 9:00 AM',
    activityLog: ['Returned to PFSD by Pharmacy · 30m ago', 'Assigned to Pharmacy · 2h ago', 'Inquiry logged from Facebook · 6h ago'],
  },
  {
    id: '8', name: 'Nattaya B.', initials: 'NB', color: '#6366f1',
    source: 'Facebook', lastMessage: 'សូមសួរអំពីលទ្ធផលឈាម',
    firstContact: '18 Jul 2026', status: 'Open', priority: 'Normal',
    chain: [], currentChainIndex: -1, lastActive: 'Jul 18, 8:30 AM',
    activityLog: ['Inquiry logged from Facebook · 30m ago'],
  },
]

export const AVATAR_COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#f59e0b', '#6366f1']

export const ALL_DEPTS: Dept[] = ['Nurse (OPD)', 'Nurse (OBGYN)', 'MC', 'MA (IPD)', 'MA (PED)', 'Pharmacy']
export const ALL_VIEWS: ViewAs[] = ['PFSD', ...ALL_DEPTS]

// Shared admin/clinical staff pool — also used as the Assignee options for
// the Documents/Medicines/Support modules.
export const STAFF_MEMBERS = ['Dr. Somchai P.', 'Dr. Ariya K.', 'Nurse Malee S.', 'Nurse Ben T.']
