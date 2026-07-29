import type { Reservation } from '@/types/domain'

export const HOSPITALS = ['Sunrise Hospital - Main', 'Sunrise Hospital - OPD', 'Sunrise Hospital - IPD']

export const RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    contact: {
      id: 'res-contact-1', name: '90Armor', initials: '9', color: '#3b82f6',
      source: 'Telegram', phone: '0812345678', lastMessage: 'I would like to book a new appointment.',
      firstContact: '24 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 24, 10:00 AM', activityLog: ['Reservation logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    createdDate: '24 Jul 2026', hospital: 'Sunrise Hospital - Main', visitorType: 'First Visit',
    status: 'Pending', assignee: null, appointmentType: 'New Appointment',
    scheduleDate: '30 Jul 2026', scheduleTime: '09:00', doctor: '-',
    fullName: 'Greg', dateOfBirth: '01 January 2005', address: 'Newton', nationalId: 'YH45321',
    purpose: 'Health Check-up', healthPackage: 'Basic Health Check-Up Package',
  },
  {
    id: 'res-2',
    contact: {
      id: 'res-contact-2', name: 'Suparat K.', initials: 'SK', color: '#10b981',
      source: 'Facebook', phone: '0891234567', lastMessage: 'Can I move my follow-up to next week?',
      firstContact: '20 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 22, 2:15 PM', activityLog: ['Reservation logged via Facebook · 2h ago', 'Assigned to Nurse Malee S. · 1h ago'],
    },
    createdDate: '20 Jul 2026', hospital: 'Sunrise Hospital - OPD', visitorType: 'Follow-up',
    status: 'Open', assignee: 'Nurse Malee S.', appointmentType: 'Follow-up Visit',
    scheduleDate: '02 Aug 2026', scheduleTime: '13:30', doctor: 'Dr. Ariya K.',
    fullName: 'Suparat Kongkiat', dateOfBirth: '14 March 1990', address: 'Bangkok', nationalId: 'TH88213',
    purpose: 'Follow-up check', healthPackage: 'Chronic Care Follow-up Package',
  },
  {
    id: 'res-3',
    contact: {
      id: 'res-contact-3', name: 'Kittipong R.', initials: 'KR', color: '#8b5cf6',
      source: 'Manual', hnNumber: 'HN00456', phone: '0898765432', lastMessage: 'Requested a consultation about knee pain.',
      firstContact: '18 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 25, 9:40 AM', activityLog: ['Reservation logged via Manual · 2h ago', 'Assigned to Dr. Somchai P. · 1h ago'],
    },
    createdDate: '18 Jul 2026', hospital: 'Sunrise Hospital - Main', visitorType: 'First Visit',
    status: 'Resolved', assignee: 'Dr. Somchai P.', appointmentType: 'Consultation',
    scheduleDate: '25 Jul 2026', scheduleTime: '10:00', doctor: 'Dr. Somchai P.',
    fullName: 'Kittipong Rattana', dateOfBirth: '22 September 1985', address: 'Chiang Mai', nationalId: 'TH45019',
    purpose: 'Knee pain consultation', healthPackage: 'Orthopedic Consultation Package',
  },
  {
    id: 'res-4',
    contact: {
      id: 'res-contact-4', name: 'Nan Waraporn', initials: 'NW', color: '#f97316',
      source: 'Telegram', phone: '0865551234', lastMessage: 'Need to reschedule my procedure.',
      firstContact: '21 Jul 2026', status: 'Pending', priority: 'Prio',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 23, 4:00 PM', activityLog: ['Reservation logged via Telegram · 2h ago', 'Awaiting assignment · 1h ago'],
    },
    createdDate: '21 Jul 2026', hospital: 'Sunrise Hospital - IPD', visitorType: 'Follow-up',
    status: 'Pending', assignee: null, appointmentType: 'Procedure',
    scheduleDate: '03 Aug 2026', scheduleTime: '08:30', doctor: '-',
    fullName: 'Nan Waraporn', dateOfBirth: '05 June 1993', address: 'Khon Kaen', nationalId: 'TH61027',
    purpose: 'Minor procedure reschedule', healthPackage: 'Day Procedure Package',
  },
  {
    id: 'res-5',
    contact: {
      id: 'res-contact-5', name: 'Chaiyot S.', initials: 'CS', color: '#06b6d4',
      source: 'Facebook', phone: '0877654321', lastMessage: 'First time visiting, want to book a check-up.',
      firstContact: '19 Jul 2026', status: 'Open', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 19, 11:20 AM', activityLog: ['Reservation logged via Facebook · 2h ago', 'Assigned to Nurse Ben T. · 1h ago'],
    },
    createdDate: '19 Jul 2026', hospital: 'Sunrise Hospital - OPD', visitorType: 'First Visit',
    status: 'Open', assignee: 'Nurse Ben T.', appointmentType: 'New Appointment',
    scheduleDate: '29 Jul 2026', scheduleTime: '15:00', doctor: '-',
    fullName: 'Chaiyot Somboon', dateOfBirth: '30 November 1998', address: 'Phuket', nationalId: 'TH70945',
    purpose: 'General check-up', healthPackage: 'Basic Health Check-Up Package',
  },
  {
    id: 'res-6',
    contact: {
      id: 'res-contact-6', name: 'Pim Aroonrat', initials: 'PA', color: '#ec4899',
      source: 'Manual', hnNumber: 'HN00789', phone: '0876543210', lastMessage: 'Confirming my follow-up appointment.',
      firstContact: '15 Jul 2026', status: 'Closed', priority: 'Normal',
      chain: [], currentChainIndex: -1, lastActive: 'Jul 22, 1:00 PM', activityLog: ['Reservation logged via Manual · 2h ago', 'Assigned to Dr. Ariya K. · 1h ago'],
    },
    createdDate: '15 Jul 2026', hospital: 'Sunrise Hospital - Main', visitorType: 'Follow-up',
    status: 'Resolved', assignee: 'Dr. Ariya K.', appointmentType: 'Consultation',
    scheduleDate: '22 Jul 2026', scheduleTime: '11:00', doctor: 'Dr. Ariya K.',
    fullName: 'Pim Aroonrat', dateOfBirth: '19 April 1988', address: 'Nonthaburi', nationalId: 'TH33087',
    purpose: 'Post-visit follow-up', healthPackage: 'Chronic Care Follow-up Package',
  },
]
