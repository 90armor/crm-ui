// ─── Domain types ─────────────────────────────────────────────────────────────
// Every type/interface shared across pages and components. Mock seed data
// lives in src/data/, design tokens in src/theme/ — this file is types only.

export type Dept = 'Nurse (OPD)' | 'Nurse (OBGYN)' | 'MC' | 'MA (IPD)' | 'MA (PED)' | 'Pharmacy'
export type ViewAs = 'PFSD' | Dept
export type PageName = 'Inbox' | 'Manual' | 'Reservations' | 'Documents' | 'Medicines' | 'Support' | 'Activity Logs'
export type Status = 'Open' | 'Pending' | 'Closed'
export type Priority = 'Normal' | 'Prio'
export type PharmacyType = 'Question' | 'Medicine only'
export type ChainEntryStatus = 'queued' | 'pending' | 'active' | 'waitingPatient' | 'returned' | 'completed'

export interface ChainEntry {
  dept: Dept
  comment: string
  returnComment: string
  entryStatus: ChainEntryStatus
  pharmacyType?: PharmacyType
}

export interface ContactNote {
  id: string
  author: string
  text: string
  timestamp: string
}

export interface Contact {
  id: string
  name: string
  initials: string
  color: string
  source: 'Facebook' | 'Telegram' | 'Manual'
  hnNumber?: string
  phone?: string
  lastMessage: string
  firstContact: string
  status: Status
  priority: Priority
  chain: ChainEntry[]
  currentChainIndex: number
  lastActive: string
  activityLog: string[]
  notes?: ContactNote[]
}

// ─── Requests (Reservations, Documents, Medicines, Support) ─────────────────

// Shared shape for every "request" module — each one is a patient-initiated
// request with a lifecycle status and an assignee, layered with its own
// domain-specific fields. `contact` reuses the Contact shape so every row can
// reuse Avatar/SourceIcon/MessagePanel unchanged — a request's patient is
// still a "contact" for messaging purposes.
export type RequestStatus = 'Open' | 'Pending' | 'Resolved'
export interface ServiceRequest {
  id: string
  contact: Contact
  createdDate: string
  status: RequestStatus
  assignee: string | null
}

export type VisitorType = 'First Visit' | 'Follow-up'
export type AppointmentType = 'New Appointment' | 'Follow-up Visit' | 'Consultation' | 'Procedure'

export interface Reservation extends ServiceRequest {
  hospital: string
  visitorType: VisitorType
  appointmentType: AppointmentType
  scheduleDate: string
  scheduleTime: string
  doctor: string
  // Row-click detail pane fields — the contact's name is often a handle/username
  // (source-specific), not the patient's legal name, so these are kept separate.
  fullName: string
  dateOfBirth: string
  address: string
  nationalId: string
  purpose: string
  healthPackage: string
}

export type DocumentType = 'Japan National Insurance' | 'Medical Certificate' | 'Insurance Claim' | 'Referral Letter' | 'Lab Report'
export type ReceiveMethod = 'Pickup' | 'Mail' | 'Email' | 'Courier'

export interface DocumentRequest extends ServiceRequest {
  documentType: DocumentType
  patientName: string
  patientId: string
  receiveMethod: ReceiveMethod
  receiveDate: string
}

export type MedicinePurpose = 'Request Only' | 'Refill' | 'New Prescription' | 'Delivery Request'

export interface MedicineRequest extends ServiceRequest {
  patientId: string
  purpose: MedicinePurpose
  items: number
}

export interface SupportRequest extends ServiceRequest {
  patientId: string
  // Free text, not a fixed category (unlike Medicine's purpose) — support
  // requests cover open-ended reasons, so there's no Purpose filter either.
  purpose: string
  comments: string
  callbackNo: string
}

// ─── IT Staff · Activity Logs (mock only — no backing auth/audit system yet) ──

export type ActivityLogType = 'User Management' | 'Login' | 'Logout'

export interface ActivityLogRecord {
  id: string
  type: ActivityLogType
  user: string
  action: string
  details: string
  timestamp: string
  ip: string
}

// ─── Misc UI-facing types ────────────────────────────────────────────────────

export interface ChatMessage {
  from: 'contact' | 'staff'
  sender?: string
  text: string
  time: string
}

export interface ManualFormData {
  patientId: string
  name: string
  phone: string
  comment: string
}
