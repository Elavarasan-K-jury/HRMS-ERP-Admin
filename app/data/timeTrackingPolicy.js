/**
 * ⚠️ TEMPORARY UI-ONLY MOCK DATA — Time Tracking Policy
 *
 * This file exists ONLY for the Time Tracking Policy listing/summary UI phase.
 * It is intentionally isolated from:
 *   - the real attendance policy store (attendancePolicy.store.js)
 *   - all attendance policy APIs / gRPC / Prisma models
 *   - the attendance calculation engine (check-in/out, logs, regularisation)
 *
 * Nothing here is connected to any backend. Replace this module with a real
 * API integration in a future phase. Do NOT insert these records into the DB.
 *
 * Summary sections are data-driven (see `summarySections`) so future
 * manufacturing-oriented sections (biometric/device capture, grace period,
 * break tracking, missing punch, gross/effective hours, overtime interaction,
 * etc.) can be added here as new entries WITHOUT redesigning the page.
 */

const CAPTURE_MODE_SECTION = (webClockIn, remoteClockIn) => ({
    id: 'capture-mode',
    title: 'Capture Mode',
    icon: 'ion:clock-outline',
    rows: [
        { label: 'Web Clock-in', flag: webClockIn },
        { label: 'Remote Clock-in', flag: remoteClockIn },
    ],
})

const WORK_FROM_HOME_SECTION = (allowed, approvalRequired) => ({
    id: 'work-from-home',
    title: 'Work From Home',
    icon: 'ion:home-outline',
    rows: [
        { label: 'Allowed', value: allowed },
        { label: 'Approval Required', value: approvalRequired },
    ],
})

const ON_DUTY_SECTION = (allowed, approvalRequired) => ({
    id: 'on-duty',
    title: 'On Duty',
    icon: 'ion:briefcase-outline',
    rows: [
        { label: 'Allowed', value: allowed },
        { label: 'Approval Required', value: approvalRequired },
    ],
})

const PARTIAL_WORK_DAY_SECTION = ({ lateArrival, earlyLeaving, interveningTimeOff, requestsAllowed, approvalRequired }) => ({
    id: 'partial-work-day',
    title: 'Partial Work Day',
    icon: 'ion:time-outline',
    rows: [
        { label: 'Late Arrival', value: lateArrival },
        { label: 'Early Leaving', value: earlyLeaving },
        { label: 'Intervening Time-off', value: interveningTimeOff },
        { label: 'Requests Allowed', value: requestsAllowed },
        { label: 'Approval Required', value: approvalRequired },
    ],
})

export const timeTrackingPolicies = [
    {
        id: 'ttp-general-capture-scheme',
        name: 'General Capture Scheme',
        employeesAssigned: 8,
        isDefault: true,
        summarySections: [
            CAPTURE_MODE_SECTION(true, false),
            WORK_FROM_HOME_SECTION('Yes', 'Yes'),
            ON_DUTY_SECTION('Yes', 'Yes'),
            PARTIAL_WORK_DAY_SECTION({
                lateArrival: '45 mins per request',
                earlyLeaving: 'Not Allowed',
                interveningTimeOff: 'Not Allowed',
                requestsAllowed: '3 requests monthly',
                approvalRequired: 'Yes',
            }),
        ],
    },
    {
        id: 'ttp-office-staff',
        name: 'Office Staff',
        employeesAssigned: 15,
        isDefault: false,
        summarySections: [
            CAPTURE_MODE_SECTION(true, false),
            WORK_FROM_HOME_SECTION('Yes', 'Yes'),
            ON_DUTY_SECTION('Yes', 'Yes'),
            PARTIAL_WORK_DAY_SECTION({
                lateArrival: '15 mins grace period',
                earlyLeaving: '15 mins per request',
                interveningTimeOff: 'Allowed',
                requestsAllowed: '4 requests monthly',
                approvalRequired: 'Yes',
            }),
        ],
    },
    {
        id: 'ttp-factory-staff',
        name: 'Factory Staff',
        employeesAssigned: 25,
        isDefault: false,
        summarySections: [
            CAPTURE_MODE_SECTION(true, false),
            WORK_FROM_HOME_SECTION('No', 'Not applicable'),
            ON_DUTY_SECTION('Yes', 'Yes'),
            PARTIAL_WORK_DAY_SECTION({
                lateArrival: '30 mins per request',
                earlyLeaving: 'Not Allowed',
                interveningTimeOff: 'Not Allowed',
                requestsAllowed: '2 requests monthly',
                approvalRequired: 'Yes',
            }),
        ],
    },
    {
        id: 'ttp-remote-staff',
        name: 'Remote Staff',
        employeesAssigned: 5,
        isDefault: false,
        summarySections: [
            CAPTURE_MODE_SECTION(true, true),
            WORK_FROM_HOME_SECTION('Yes', 'No'),
            ON_DUTY_SECTION('Yes', 'Yes'),
            PARTIAL_WORK_DAY_SECTION({
                lateArrival: '30 mins per request',
                earlyLeaving: '30 mins per request',
                interveningTimeOff: 'Allowed',
                requestsAllowed: '5 requests monthly',
                approvalRequired: 'Yes',
            }),
        ],
    },
]

export const defaultTimeTrackingPolicyId = 'ttp-general-capture-scheme'
