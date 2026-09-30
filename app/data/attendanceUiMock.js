/**
 * Phase 27 UI-only mock for Employee Attendance Timings + Actions.
 * Isolated so it can be replaced by API data later without rewriting UI.
 * Do NOT put these values into Pinia stores or backend models.
 */
export const attendanceUiMock = {
    currentShift: {
        startTime: '9:30 AM',
        endTime: '6:30 PM',
        duration: '9h 0m',
        breakMinutes: 60
    },
    sinceLastLogin: '0h 17m',
    effectiveHours: '4h 14m',
    grossHours: '5h 08m'
}

export default attendanceUiMock
