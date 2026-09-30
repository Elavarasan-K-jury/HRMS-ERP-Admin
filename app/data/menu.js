export const employee_menu = () => {
    return [
        {
            group: 'Home',
            items: [
                { label: 'Dashboard', path: '/employee', icon: 'ion:pie-chart' },
            ]
        },

        {
            group: 'Self',
            items: [
                {
                    label: 'Me',
                    path: '/employee/profile',
                    icon: 'ion:person-outline',
                    children: [
                        { label: 'Attendance', path: '/employee/attendance', icon: 'ion:clock' },
                        { label: 'Holidays', path: '/employee/holidays', icon: 'ion:calendar-outline' },
                        { label: 'Expenses & Travels', path: '/employee/expense', icon: 'ion:cash' },
                    ]
                }
            ]
        },
    ]
}
export const organization_menu = (org_id) => {
    return [
        // 1. Dashboard
        {
            group: 'Overview',
            items: [
                { label: 'Dashboard', path: `/organization/${org_id}/dashboard`, icon: 'ion:pie-chart' },
            ],
        },

        // 2. Employees
        {
            group: 'Employees',
            items: [
                {
                    label: 'Employees',
                    path: '/employees',
                    icon: 'ion:people',
                    children: [
                        { label: 'Employees List', path: `/organization/${org_id}/organization/employees`, icon: 'ion:person-outline', permission: 'employees.view' },
                        { label: 'Login', path: `/organization/${org_id}/organization/employees/login`, icon: 'ion:log-in-outline', permission: 'employees.view' },
                    ],
                },
            ],
        },

        // 3. Org Structure
        {
            group: 'Org Structure',
            items: [
                {
                    label: 'Org Structure',
                    path: '/org-structure',
                    icon: 'ion:business',
                    children: [
                        { label: 'Departments', path: `/organization/${org_id}/departments`, icon: 'lucide:git-fork', permission: 'orgnaization.departments.view' },
                        { label: 'Branches', path: `/organization/${org_id}/branches`, icon: 'lucide:building-2', permission: 'orgnaization.branches.view' },
                        { label: 'Designations', path: `/organization/${org_id}/designations`, icon: 'ion:briefcase-outline', permission: 'orgnaization.designations.view' },
                        { label: 'Hierarchy', path: `/organization/${org_id}/hierarchy`, icon: 'ion:people-outline', permission: 'orgnaization.hierarchy.view' },
                        { label: 'Pay Grades', path: `/organization/${org_id}/org-structure/pay-grades`, icon: 'heroicons:currency-dollar' },
                        { label: 'Legal Entities', path: `/organization/${org_id}/org-structure/legal-entities`, icon: 'heroicons:building-office' },
                        { label: 'Location', path: `/organization/${org_id}/org-structure/locations`, icon: 'heroicons:map-pin' },
                        { label: 'IP Configurations', path: `/organization/${org_id}/settings/ip-configurations`, icon: 'ion:globe-outline' },
                    ],
                },
            ],
        },

                // 11. Attendance as Time Attend
        {
            group: 'Time Attend',
            items: [
                {
                    label: 'Time Attend',
                    path: `/organization/${org_id}/attendance`,
                    icon: 'ion:clock',
                    children: [
                        { label: 'Attendance Tracking', path: `/organization/${org_id}/attendance`, icon: 'ion:clock', permission: 'attendance.view' },
                        { label: 'Attendance Report', path: `/organization/${org_id}/attendance/report`, icon: 'ion:document-text-outline', permission: 'attendance.view' },
                        { label: 'Approvals', path: `/organization/${org_id}/approvals/inbox`, icon: 'heroicons:check-circle' },
                        { label: 'Regularise & Cancel Penalties', path: `/organization/${org_id}/attendance/regularise`, icon: 'ion:create-outline', permission: 'attendance_regularisation.manage' },
                        { label: 'Shifts/WeeklyOffs & Holidays', path: `/organization/${org_id}/attendance/shifts`, icon: 'ion:calendar-outline' },
                        { label: 'Overtime', path: `/organization/${org_id}/attendance/overtime`, icon: 'ion:time-outline' },
                        { label: 'Leaves', path: `/organization/${org_id}/leave`, icon: 'ion:calendar', permission: 'leave.view' },
                        { label: 'Leave Types', path: `/organization/${org_id}/attendance/leave-types`, icon: 'ion:list-outline', permission: 'leave.manage' },
                        { label: 'Reports', path: `/organization/${org_id}/attendance/reports`, icon: 'ion:stats-chart-outline' },
                        { label: 'Settings', path: `/organization/${org_id}/attendance/settings`, icon: 'ion:cog-outline' },
                        { label: 'Approval Flows', path: `/organization/${org_id}/settings/approval-flows`, icon: 'heroicons:cog-6-tooth' },
                    ],
                },
            ],
        },

        // 4. Exits (New)
        {
            group: 'Exits',
            items: [
                {
                    label: 'Exits',
                    path: '/exits',
                    icon: 'ion:exit-outline',
                    children: [
                        { label: 'Summary', path: `/organization/${org_id}/exits/summary`, icon: 'ion:stats-chart-outline' },
                        { label: 'Exit Process', path: `/organization/${org_id}/exits/process`, icon: 'ion:document-text-outline' },
                        { label: 'Reverted Exits', path: `/organization/${org_id}/exits/reverted`, icon: 'ion:refresh-outline' },
                        { label: 'Task Tracking', path: `/organization/${org_id}/exits/task-tracking`, icon: 'ion:checklist-outline' },
                        { label: 'Task Templates', path: `/organization/${org_id}/exits/task-templates`, icon: 'ion:document-outline' },
                        { label: 'Exit Survey', path: `/organization/${org_id}/exits/survey`, icon: 'ion:chatbubble-outline' },
                        { label: 'Bulk Actions', path: `/organization/${org_id}/exits/bulk-actions`, icon: 'ion:people-outline' },
                        { label: 'Exit Settings', path: `/organization/${org_id}/exits/settings`, icon: 'ion:cog-outline' },
                    ],
                },
            ],
        },

        // 6. Expense and Travels
        {
            group: 'Expenses',
            items: [
                {
                    label: 'Expense and Travels',
                    path: '/expense-travels',
                    icon: 'ion:cash',
                    children: [
                        { label: 'Summary', path: `/organization/${org_id}/expense-travels/summary`, icon: 'ion:stats-chart-outline' },
                        { label: 'Expenses', path: `/organization/${org_id}/expense-travels/expenses`, icon: 'ion:card-outline' },
                        { label: 'Advances', path: `/organization/${org_id}/expense-travels/advances`, icon: 'ion:cash-outline' },
                        { label: 'Policies and Settings', path: `/organization/${org_id}/expense-travels/policies`, icon: 'ion:document-text-outline' },
                        { label: 'Reports and Invoices', path: `/organization/${org_id}/expense-travels/reports-invoices`, icon: 'ion:document-text-outline' },
                    ],
                },
            ],
        },

        // 7. Documents (New)
        {
            group: 'Documents',
            items: [
                {
                    label: 'Documents',
                    path: '/documents',
                    icon: 'ion:folder-outline',
                    children: [
                        { label: 'Document Templates', path: `/organization/${org_id}/documents/templates`, icon: 'ion:document-outline' },
                        { label: 'Employee Documents', path: `/organization/${org_id}/documents/employee`, icon: 'ion:person-outline' },
                        { label: 'Organization Documents', path: `/organization/${org_id}/documents/organization`, icon: 'ion:business-outline' },
                    ],
                },
            ],
        },

        // 8. Payroll as My Finance
        {
            group: 'My Finance',
            items: [
                {
                    label: 'My Finance',
                    path: '/my-finance',
                    icon: 'ion:wallet',
                    permission: 'payroll.view',
                    children: [
                        { label: 'Salary Components', path: `/organization/${org_id}/payroll/components`, icon: 'ion:git-branch' },
                        { label: 'Salary Groups', path: `/organization/${org_id}/payroll/groups`, icon: 'heroicons:document-currency-rupee' },
                        { label: 'Payslip Templates', path: `/organization/${org_id}/payroll/payslip-template`, icon: 'ion:receipt-outline' },
                        { label: 'Payslips', path: '/payroll/payslips', icon: 'ion:receipt-outline' },
                        { label: 'Bonuses', path: '/payroll/bonuses', icon: 'ion:gift-outline' },
                        { label: 'Settings', path: `/organization/${org_id}/payroll/settings`, icon: 'ion:cog' },
                    ],
                },
            ],
        },

        // Keep other existing items below (Storage, Reports & Analytics, System - Calculators, Integrations)
        {
            group: 'Storage',
            items: [
                {
                    label: 'Folders & Files',
                    path: `/organization/${org_id}/folder-files`,
                    icon: 'heroicons:folder',
                },
            ],
        },

        {
            group: 'Reports & Analytics',
            items: [
                {
                    label: 'Analytics & Reports',
                    path: '/reports',
                    icon: 'ion:bar-chart',
                    permission: 'reports.view',
                    children: [
                        { label: 'HR Reports', path: '/reports/hr', icon: 'ion:people-circle-outline' },
                        { label: 'Payroll Reports', path: '/reports/payroll', icon: 'ion:cash-outline' },
                        { label: 'Attendance Reports', path: '/reports/attendance', icon: 'ion:time-outline' },
                    ],
                },
            ],
        },

        {
            group: 'Tools',
            items: [
                {
                    label: 'Calculators',
                    path: '/Calculators',
                    icon: 'heroicons:calculator',
                    children: [
                        { label: 'Salary', path: `/organization/${org_id}/calculators/salary`, icon: 'heroicons:calculator' },
                    ],
                },
                {
                    label: 'Integrations',
                    path: '/integrations',
                    icon: 'ion:link',
                    children: [
                        { label: 'HRMS APIs', path: '/integrations/apis', icon: 'ion:code-slash-outline' },
                        { label: 'Third-Party Apps', path: '/integrations/apps', icon: 'ion:extension-puzzle-outline' },
                    ],
                },
            ],
        },
    ]
}

export const menu = [
    {
        group: 'Analytics',
        items: [
            { label: 'Dashboard', path: '/', icon: 'ion:pie-chart' },
        ]
    },     {
        group: 'Tenants',
        items: [
            {
                label: 'Organization',
                path: '/organization/list',
                icon: 'ion:business',
                permission: 'super.organization.manage',
            },
        ],
    },

    {
        group: 'Offers',
        items: [
            {
                label: 'Discounts',
                path: '/discounts',
                icon: 'heroicons:percent-badge',
                permission: 'super.organization.manage',
            },
        ],
    },

    {
        group: 'Reports & Analytics',
        items: [
            { label: 'Traffic Reports', path: '/reports/traffic', icon: 'heroicons:chart-pie', permission: 'reports.view' },
            { label: 'Usage Reports', path: '/reports/usage', icon: 'heroicons:chart-bar', permission: 'reports.view' },
        ],
    },

    {
        group: 'System',
        items: [
            {
                label: 'Modules',
                path: '/modules',
                icon: 'ion:document-text',
                permission: 'super.admin.manage',
            },
            { label: 'General Settings', path: '/settings/general', icon: 'ion:options-outline', permission: 'settings.access' },
            { label: 'Admins', path: '/settings/admins', icon: 'ion:person-add-outline', permission: 'super.admin.manage' },
            { label: 'Roles & Permissions', path: '/settings/roles', icon: 'ion:key-outline', permission: 'super.admin.manage' },
            { label: 'Audit Logs', path: '/settings/audit-logs', icon: 'ion:document-text-outline', permission: 'super.admin.manage' },
            { label: 'Notifications', path: '/settings/notifications', icon: 'ion:notifications-outline', permission: 'settings.access' },
        ],
    },
]


//Old Org menu
export const getMenu = (admin = false, org_id, moduleKeys = [], permissionKeys = []) => {
    if (admin) {
        return [
            {
                group: 'Core HR',
                items: [
                    { label: 'Dashboard', path: `/organization/${org_id}/dashboard`, icon: 'ion:pie-chart' },
                    {
                        label: 'Organization',
                        path: '/organization',
                        icon: 'ion:business',
                        children: [
                            { label: 'Departments', path: `/organization/${org_id}/departments`, icon: 'lucide:git-fork' },
                            { label: 'Designations', path: `/organization/${org_id}/designations`, icon: 'ion:briefcase-outline' },
                            { label: 'Hierarchy', path: `/organization/${org_id}/hierarchy`, icon: 'ion:people-outline' },
                        ],
                    },
                    {
                        label: 'Employee',
                        path: '/employee',
                        icon: 'ion:people',
                        children: [
                            { label: 'Employees', path: `/organization/${org_id}/employee/list`, icon: 'ion:person-outline' },
                            { label: 'Employee Categories', path: `/organization/${org_id}/employee/categories`, icon: 'ion:albums-outline' },
                        ],
                    },
                    {
                        label: 'Attendance',
                        path: `/organization/${org_id}/attendance`,
                        icon: 'ion:clock',
                        children: [
                            { label: 'Attendance', path: `/organization/${org_id}/attendance`, icon: 'ion:clock' },
                            { label: 'Attendance Policy', path: `/organization/${org_id}/attendance/policy`, icon: 'ion:document-text-outline' },
                            { label: 'Attendance Report', path: `/organization/${org_id}/attendance/report`, icon: 'ion:document-text-outline' },
                        ]
                    },
                    { label: 'Leave', path: `/organization/${org_id}/leave`, icon: 'ion:calendar' },
                ],
            },
            {
                group: 'Payroll & Finance',
                items: [
                    {
                        label: 'Payroll',
                        path: '/payroll',
                        icon: 'ion:wallet',
                        children: [
                            { label: 'Salary Components', path: `/organization/${org_id}/payroll/components`, icon: 'ion:git-branch' },
                            { label: 'Salary Groups', path: `/organization/${org_id}/payroll/groups`, icon: 'heroicons:document-currency-rupee' },
                            { label: 'Payroll', path: `/organization/${org_id}/payroll/run`, icon: 'ion:wallet' },
                            { label: 'Payslips', path: '/payroll/payslips', icon: 'ion:receipt-outline' },
                            { label: 'Bonuses', path: '/payroll/bonuses', icon: 'ion:gift-outline' },
                            { label: 'Settings', path: `/organization/${org_id}/payroll/settings`, icon: 'ion:cog' },
                        ],
                    },
                    {
                        label: 'Expenses',
                        path: '/expenses',
                        icon: 'ion:cash',
                        children: [
                            { label: 'Office Expenses', path: `/organization/${org_id}/expenses/office`, icon: 'heroicons:currency-rupee' },
                            { label: 'Other Expenses', path: `/organization/${org_id}/expenses/other`, icon: 'heroicons:document-currency-rupee' },
                        ],
                    },
                    { label: 'Reimbursement', path: `/organization/${org_id}/reimbursement`, icon: 'ion:cash-outline' },
                ],
            },
            {
                group: 'Performance & Talent',
                items: [
                    {
                        label: 'Performance',
                        path: '/performance',
                        icon: 'ion:trending-up',
                        children: [
                            { label: 'Appraisals', path: '/performance/appraisals', icon: 'ion:stats-chart-outline' },
                            { label: 'Goals & KPIs', path: '/performance/goals', icon: 'ion:flag-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'Storage',
                items: [
                    {
                        label: 'Folders & Files',
                        path: `/organization/${org_id}/folder-files`,
                        icon: 'heroicons:folder',
                    },
                ],
            },
            {
                group: 'Reports & Analytics',
                items: [
                    {
                        label: 'Analytics & Reports',
                        path: '/reports',
                        icon: 'ion:bar-chart',
                        children: [
                            { label: 'HR Reports', path: '/reports/hr', icon: 'ion:people-circle-outline' },
                            { label: 'Payroll Reports', path: '/reports/payroll', icon: 'ion:cash-outline' },
                            { label: 'Attendance Reports', path: '/reports/attendance', icon: 'ion:time-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'System',
                items: [
                    {
                        label: 'Calculators',
                        path: '/Calculators',
                        icon: 'heroicons:calculator',
                        children: [
                            { label: 'Salary', path: `/organization/${org_id}/calculators/salary`, icon: 'heroicons:calculator' },
                        ],
                    },
                    {
                        label: 'Integrations',
                        path: '/integrations',
                        icon: 'ion:link',
                        children: [
                            { label: 'HRMS APIs', path: '/integrations/apis', icon: 'ion:code-slash-outline' },
                            { label: 'Third-Party Apps', path: '/integrations/apps', icon: 'ion:extension-puzzle-outline' },
                        ],
                    },
                    {
                        label: 'Settings',
                        path: '/settings',
                        icon: 'ion:cog',
                        children: [
                            { label: 'General Settings', path: '/settings/general', icon: 'ion:options-outline' },
                            { label: 'Roles & Permissions', path: '/settings/roles', icon: 'ion:key-outline' },
                            { label: 'Notifications', path: '/settings/notifications', icon: 'ion:notifications-outline' },
                        ],
                    },
                ],
            },
        ]
    } else {
        // Employee sidebar is now sourced exclusively from employee_menu()
        // in auth.vue and employee.vue layouts. This branch is retained
        // only for backward compatibility with authStore.toggleView().
        return []
    }
}
