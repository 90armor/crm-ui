import type { ActivityLogRecord } from '@/types/domain'

// IT Staff only. Mock audit trail — no backing auth/logging system yet.
export const IT_ACTIVITY_LOGS: ActivityLogRecord[] = [
  { id: 'log-1', type: 'Login', user: 'Dr. Somchai P.', action: 'Signed in', details: 'Successful login via password', timestamp: '29 Jul 2026, 09:02 AM', ip: '192.168.1.14' },
  { id: 'log-2', type: 'User Management', user: 'Kritsada W. (IT Admin)', action: 'Created user', details: 'Added new staff account "Nurse Ben T."', timestamp: '29 Jul 2026, 08:47 AM', ip: '192.168.1.2' },
  { id: 'log-3', type: 'Logout', user: 'Nurse Malee S.', action: 'Signed out', details: 'Session ended by user', timestamp: '28 Jul 2026, 06:15 PM', ip: '192.168.1.30' },
  { id: 'log-4', type: 'Login', user: 'Nurse Ben T.', action: 'Signed in', details: 'Successful login via password', timestamp: '28 Jul 2026, 08:58 AM', ip: '192.168.1.31' },
  { id: 'log-5', type: 'User Management', user: 'Kritsada W. (IT Admin)', action: 'Updated permissions', details: '"Dr. Ariya K." role changed from Staff to Admin', timestamp: '28 Jul 2026, 08:40 AM', ip: '192.168.1.2' },
  { id: 'log-6', type: 'Login', user: 'Dr. Ariya K.', action: 'Failed login attempt', details: 'Incorrect password (2nd attempt)', timestamp: '27 Jul 2026, 07:55 PM', ip: '203.0.113.42' },
  { id: 'log-7', type: 'Login', user: 'Dr. Ariya K.', action: 'Signed in', details: 'Successful login via password', timestamp: '27 Jul 2026, 07:56 PM', ip: '203.0.113.42' },
  { id: 'log-8', type: 'Logout', user: 'Dr. Somchai P.', action: 'Signed out', details: 'Session ended by user', timestamp: '27 Jul 2026, 05:30 PM', ip: '192.168.1.14' },
  { id: 'log-9', type: 'User Management', user: 'Kritsada W. (IT Admin)', action: 'Deactivated user', details: 'Disabled account "Nurse Somsri T." (resigned)', timestamp: '26 Jul 2026, 03:12 PM', ip: '192.168.1.2' },
  { id: 'log-10', type: 'Logout', user: 'Nurse Ben T.', action: 'Session expired', details: 'Auto logout after 30 min of inactivity', timestamp: '26 Jul 2026, 01:05 PM', ip: '192.168.1.31' },
  { id: 'log-11', type: 'Login', user: 'Nurse Malee S.', action: 'Signed in', details: 'Successful login via password', timestamp: '26 Jul 2026, 08:02 AM', ip: '192.168.1.30' },
  { id: 'log-12', type: 'User Management', user: 'Kritsada W. (IT Admin)', action: 'Reset password', details: 'Password reset requested for "Nurse Malee S."', timestamp: '25 Jul 2026, 11:20 AM', ip: '192.168.1.2' },
  { id: 'log-13', type: 'Login', user: 'Kritsada W. (IT Admin)', action: 'Signed in', details: 'Successful login via password', timestamp: '25 Jul 2026, 08:01 AM', ip: '192.168.1.2' },
  { id: 'log-14', type: 'Logout', user: 'Dr. Ariya K.', action: 'Signed out', details: 'Session ended by user', timestamp: '24 Jul 2026, 06:48 PM', ip: '203.0.113.42' },
]
