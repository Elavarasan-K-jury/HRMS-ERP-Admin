export const employee_menu = (org_id, employee_id) => {
    return [
        {
            group: 'Home',
            items: [
                { label: 'Dashboard', path: `/organization/${org_id}/employee/${employee_id}/home`, icon: 'ion:pie-chart' },
            ]
        },

        {
            group: 'Self',
            items: [
                {
                    label: 'Me',
                    path: `/organization/${org_id}/employee/${employee_id}/me`,
                    icon: 'ion:person-outline',
                    children: [
                        { label: 'Attendance', path: `/organization/${org_id}/employee/${employee_id}/attendance`, icon: 'ion:clock' },
                        { label: 'Leave', path: `/organization/${org_id}/employee/${employee_id}/leaves`, icon: 'ion:calendar-outline' },
                        { label: 'Performance', path: `/organization/${org_id}/employee/${employee_id}/performance`, icon: 'ion:bar-chart-outline' },
                        { label: 'Holidays', path: `/organization/${org_id}/employee/${employee_id}/holidays`, icon: 'ion:calendar-outline' },
                        { label: 'Expenses & Travels', path: `/organization/${org_id}/employee/${employee_id}/expenses`, icon: 'ion:cash' },
                        { label: 'Apps', path: `/organization/${org_id}/employee/${employee_id}/apps`, icon: 'ion:apps-outline' },
                    ]
                }
            ]
        },

        {
            group: 'Employees',
            items: [
                {
                    label: 'Employees',
                    path: `/organization/${org_id}/employee/${employee_id}/employees`,
                    icon: 'ion:people',
                    children: [
                        { label: 'Employees List', path: `/organization/${org_id}/employee/${employee_id}/employees/list`, icon: 'ion:person-outline' },
                    ],
                },
            ],
        },

        {
            group: 'Org Structure',
            items: [
                {
                    label: 'Org Structure',
                    path: `/organization/${org_id}/employee/${employee_id}/org-structure`,
                    icon: 'ion:business',
                    children: [
                        { label: 'Departments', path: `/organization/${org_id}/employee/${employee_id}/org-structure/departments`, icon: 'lucide:git-fork' },
                        { label: 'Branches', path: `/organization/${org_id}/employee/${employee_id}/org-structure/branches`, icon: 'lucide:building-2' },
                        { label: 'Holidays', path: `/organization/${org_id}/employee/${employee_id}/org-structure/holidays`, icon: 'ion:calendar-number-outline' },
                        { label: 'Designations', path: `/organization/${org_id}/employee/${employee_id}/org-structure/designations`, icon: 'ion:briefcase-outline' },
                        { label: 'Hierarchy', path: `/organization/${org_id}/employee/${employee_id}/org-structure/hierarchy`, icon: 'ion:people-outline' },
                    ],
                },
            ],
        },

        {
            group: 'Onboarding',
            items: [
                {
                    label: 'Onboarding',
                    path: `/organization/${org_id}/employee/${employee_id}/onboarding`,
                    icon: 'ion:person-add-outline',
                },
            ],
        },

        {
            group: 'Exits',
            items: [
                {
                    label: 'Exits',
                    path: `/organization/${org_id}/employee/${employee_id}/exits`,
                    icon: 'ion:exit-outline',
                    children: [
                        { label: 'Summary', path: `/organization/${org_id}/employee/${employee_id}/exits/summary`, icon: 'ion:stats-chart-outline' },
                        { label: 'Exit Process', path: `/organization/${org_id}/employee/${employee_id}/exits/process`, icon: 'ion:document-text-outline' },
                        { label: 'Reverted Exits', path: `/organization/${org_id}/employee/${employee_id}/exits/reverted`, icon: 'ion:refresh-outline' },
                        { label: 'Task Tracking', path: `/organization/${org_id}/employee/${employee_id}/exits/task-tracking`, icon: 'ion:checklist-outline' },
                    ],
                },
            ],
        },

        {
            group: 'Expenses',
            items: [
                {
                    label: 'Expense and Travels',
                    path: `/organization/${org_id}/employee/${employee_id}/expense-travels`,
                    icon: 'ion:cash',
                    children: [
                        { label: 'Summary', path: `/organization/${org_id}/employee/${employee_id}/expense-travels/summary`, icon: 'ion:stats-chart-outline' },
                        { label: 'Expenses', path: `/organization/${org_id}/employee/${employee_id}/expense-travels/expenses`, icon: 'ion:card-outline' },
                        { label: 'Advances', path: `/organization/${org_id}/employee/${employee_id}/expense-travels/advances`, icon: 'ion:cash-outline' },
                    ],
                },
            ],
        },

        {
            group: 'Documents',
            items: [
                {
                    label: 'Documents',
                    path: `/organization/${org_id}/employee/${employee_id}/documents`,
                    icon: 'ion:folder-outline',
                    children: [
                        { label: 'Employee Documents', path: `/organization/${org_id}/employee/${employee_id}/documents/employee`, icon: 'ion:person-outline' },
                        { label: 'Organization Documents', path: `/organization/${org_id}/employee/${employee_id}/documents/organization`, icon: 'ion:business-outline' },
                    ],
                },
            ],
        },

        {
            group: 'Assets',
            items: [
                {
                    label: 'Assets',
                    path: `/organization/${org_id}/employee/${employee_id}/assets`,
                    icon: 'ion:laptop-outline',
                    children: [
                        { label: 'Assigned Assets', path: `/organization/${org_id}/employee/${employee_id}/assets/assigned`, icon: 'ion:desktop-outline' },
                        { label: 'Asset Requests', path: `/organization/${org_id}/employee/${employee_id}/assets/requests`, icon: 'ion:document-text-outline' },
                    ],
                },
            ],
        },

        {
            group: 'My Finance',
            items: [
                {
                    label: 'My Finance',
                    path: `/organization/${org_id}/employee/${employee_id}/my-finance`,
                    icon: 'ion:wallet',
                    children: [
                        { label: 'Summary', path: `/organization/${org_id}/employee/${employee_id}/my-finance/summary`, icon: 'ion:stats-chart-outline' },
                        { label: 'My Pay', path: `/organization/${org_id}/employee/${employee_id}/my-finance/my-pay`, icon: 'ion:cash-outline' },
                        { label: 'Manage Tax', path: `/organization/${org_id}/employee/${employee_id}/my-finance/manage-tax`, icon: 'heroicons:percent-badge' },
                    ]
                }
            ]
        },

        {
            group: 'Time Attend',
            items: [
                {
                    label: 'Time Attend',
                    path: `/organization/${org_id}/employee/${employee_id}/attendance`,
                    icon: 'ion:clock',
                    children: [
                        { label: 'Attendance Tracking', path: `/organization/${org_id}/employee/${employee_id}/attendance`, icon: 'ion:clock' },
                        { label: 'Leaves', path: `/organization/${org_id}/employee/${employee_id}/leaves`, icon: 'ion:calendar' },
                    ],
                },
            ],
        },

        {
            group: 'Engage',
            items: [
                {
                    label: 'Engage',
                    path: `/organization/${org_id}/employee/${employee_id}/engage`,
                    icon: 'ion:chatbubble-ellipses-outline',
                    children: [
                        { label: 'Announcements', path: `/organization/${org_id}/employee/${employee_id}/engage/announcements`, icon: 'ion:megaphone-outline' },
                        { label: 'Polls', path: `/organization/${org_id}/employee/${employee_id}/engage/polls`, icon: 'ion:bar-chart-outline' },
                        { label: 'Articles', path: `/organization/${org_id}/employee/${employee_id}/engage/articles`, icon: 'ion:newspaper-outline' },
                    ]
                }
            ]
        },

        {
            group: 'Reports & Analytics',
            items: [
                {
                    label: 'Analytics & Reports',
                    path: `/organization/${org_id}/employee/${employee_id}/reports`,
                    icon: 'ion:bar-chart',
                    children: [
                        { label: 'HR Reports', path: `/organization/${org_id}/employee/${employee_id}/reports/hr`, icon: 'ion:people-circle-outline' },
                        { label: 'Payroll Reports', path: `/organization/${org_id}/employee/${employee_id}/reports/payroll`, icon: 'ion:cash-outline' },
                        { label: 'Attendance Reports', path: `/organization/${org_id}/employee/${employee_id}/reports/attendance`, icon: 'ion:time-outline' },
                    ],
                },
            ],
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
                        { label: 'Holidays', path: `/organization/${org_id}/holiday`, icon: 'ion:calendar-number-outline' },
                        { label: 'Designations', path: `/organization/${org_id}/designations`, icon: 'ion:briefcase-outline', permission: 'orgnaization.designations.view' },
                        { label: 'Hierarchy', path: `/organization/${org_id}/hierarchy`, icon: 'ion:people-outline', permission: 'orgnaization.hierarchy.view' },
                        { label: 'Pay Grades', path: `/organization/${org_id}/org-structure/pay-grades`, icon: 'heroicons:currency-dollar' },
                        { label: 'Bands', path: `/organization/${org_id}/org-structure/bands`, icon: 'ion:git-branch-outline' },
                        { label: 'Legal Entities', path: `/organization/${org_id}/org-structure/legal-entities`, icon: 'heroicons:building-office' },
                        { label: 'Location', path: `/organization/${org_id}/org-structure/locations`, icon: 'heroicons:map-pin' },
                        { label: 'Cost Center', path: `/organization/${org_id}/org-structure/cost-centers`, icon: 'lucide:coins' },
                    ],
                },
            ],
        },

        // 4. Onboarding
        {
            group: 'Onboarding',
            items: [
                {
                    label: 'Onboarding',
                    path: `/organization/${org_id}/employee/onboarding`,
                    icon: 'ion:person-add-outline',
                    children: [
                        { label: 'Onboarding Tasks', path: `/organization/${org_id}/employee/onboarding`, icon: 'ion:person-add-outline', permission: 'employees.view' },
                        { label: 'Task Templates', path: `/organization/${org_id}/onboarding/task-templates`, icon: 'ion:document-outline' },
                    ],
                },
            ],
        },

        // 5. Exits (New)
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
                        { label: 'Subscriptions', path: `/organization/${org_id}/expenses/subscription`, icon: 'heroicons:currency-rupee' },
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

        // 8. Assets
        {
            group: 'Assets',
            items: [
                {
                    label: 'Assets',
                    path: '/assets',
                    icon: 'ion:laptop-outline',
                    children: [
                        { label: 'Summary', path: `/organization/${org_id}/assets/summary`, icon: 'ion:stats-chart-outline' },
                        { label: 'Assigned Assets', path: `/organization/${org_id}/assets/assigned`, icon: 'ion:desktop-outline' },
                        { label: 'Asset Requests', path: `/organization/${org_id}/assets/requests`, icon: 'ion:document-text-outline' },
                        { label: 'Asset Categories', path: `/organization/${org_id}/assets/categories`, icon: 'heroicons:squares-plus' },
                        { label: 'Asset Models', path: `/organization/${org_id}/assets/models`, icon: 'heroicons:rectangle-group' },
                        { label: 'Asset Acknowledgement', path: `/organization/${org_id}/assets/acknowledgement`, icon: 'ion:checkmark-circle-outline' },
                        { label: 'Reports', path: `/organization/${org_id}/assets/reports`, icon: 'ion:document-text-outline' },
                        { label: 'Settings', path: `/organization/${org_id}/assets/settings`, icon: 'ion:cog-outline' },
                    ],
                },
            ],
        },

        // 10. Payroll as My Finance
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
                        { label: 'Attendance Policy', path: `/organization/${org_id}/attendance/policy`, icon: 'ion:document-text-outline', permission: 'attendance.view' },
                        { label: 'Attendance Report', path: `/organization/${org_id}/attendance/report`, icon: 'ion:document-text-outline', permission: 'attendance.view' },
                        { label: 'Approvals', path: `/organization/${org_id}/attendance/approvals`, icon: 'heroicons:check-circle' },
                        { label: 'Shifts/Weekly Offs', path: `/organization/${org_id}/attendance/shifts`, icon: 'ion:calendar-outline' },
                        { label: 'Overtime', path: `/organization/${org_id}/attendance/overtime`, icon: 'ion:time-outline' },
                        { label: 'Leaves', path: `/organization/${org_id}/leave`, icon: 'ion:calendar', permission: 'leave.view' },
                        { label: 'Reports', path: `/organization/${org_id}/attendance/reports`, icon: 'ion:stats-chart-outline' },
                        { label: 'Settings', path: `/organization/${org_id}/attendance/settings`, icon: 'ion:cog-outline' },
                    ],
                },
            ],
        },

        // 12. Performance as Engage
        {
            group: 'Engage',
            items: [
                {
                    label: 'Engage',
                    path: '/engage',
                    icon: 'ion:chatbubble-ellipses-outline',
                    children: [
                        { label: 'Announcements', path: `/organization/${org_id}/engage/announcements`, icon: 'ion:megaphone-outline' },
                        { label: 'Survey', path: `/organization/${org_id}/engage/survey`, icon: 'ion:document-text-outline' },
                        { label: 'Pulse', path: `/organization/${org_id}/engage/pulse`, icon: 'ion:pulse-outline' },
                        { label: 'Polls', path: `/organization/${org_id}/engage/polls`, icon: 'ion:bar-chart-outline' },
                        { label: 'Wall Settings', path: `/organization/${org_id}/engage/wall-settings`, icon: 'ion:cog-outline' },
                        { label: 'Articles', path: `/organization/${org_id}/engage/articles`, icon: 'ion:newspaper-outline' },
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
    }, {
        group: 'Tenants',
        items: [
            {
                label: 'Organization',
                path: '/organization/list',
                icon: 'ion:business',
                permission: 'super.organization.manage',
            },
            {
                label: 'Plans',
                path: '/Plans',
                icon: 'heroicons:receipt-percent',
                permission: 'super.organization.manage',
            },
        ],
    },

    {
        group: 'Billing',
        items: [
            {
                label: 'Invoices',
                path: '/invoices',
                icon: 'ion:document-text',
                permission: 'super.organization.manage',
            },
            { label: 'Payments', path: '/payments', icon: 'ion:cash', permission: 'super.organization.manage' },
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
            { label: 'Payment Reports', path: '/reports/payments', icon: 'heroicons:currency-dollar', permission: 'reports.view' },
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

export const getMenu = (admin = false, org_id, subscriptionPaid = false, moduleKeys = [], permissionKeys = []) => {
    if (admin) {
        return !subscriptionPaid ? [
            {
                group: 'Payroll & Finance',
                items: [
                    {
                        label: 'Expenses',
                        path: '/expenses',
                        icon: 'ion:cash',
                        children: [
                            { label: 'Subscription', path: `/organization/${org_id}/expenses/subscription`, icon: 'heroicons:currency-rupee' },
                        ],
                    },
                ],
            },
        ] : [
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
                            { label: 'Holidays', path: `/organization/${org_id}/holiday`, icon: 'ion:calendar-number-outline' },
                        ],
                    },
                    {
                        label: 'Employee',
                        path: '/employee',
                        icon: 'ion:people',
                        children: [
                            { label: 'Employees', path: `/organization/${org_id}/employee/list`, icon: 'ion:person-outline' },
                            { label: 'Employee Categories', path: `/organization/${org_id}/employee/categories`, icon: 'ion:albums-outline' },
                            { label: 'Onboarding', path: `/organization/${org_id}/employee/onboarding`, icon: 'ion:person-add-outline' },
                            { label: 'Permissions', path: `/organization/${org_id}/employee/permissions`, icon: 'heroicons:lock-closed' },
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
                            { label: 'Subscription', path: `/organization/${org_id}/expenses/subscription`, icon: 'heroicons:currency-rupee' },
                            { label: 'Invoices', path: `/organization/${org_id}/expenses/invoices`, icon: 'heroicons:document-currency-rupee' },
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
                            { label: 'Feedback', path: '/performance/feedback', icon: 'ion:chatbubble-ellipses-outline' },
                        ],
                    },
                    { label: 'Onboarding', path: '/onboarding', icon: 'ion:person-add' },
                ],
            },
            {
                group: 'Operations',
                items: [
                    {
                        label: 'Asset Management',
                        path: '/assets',
                        icon: 'ion:laptop-outline',
                        children: [
                            { label: 'Asset Categories', path: `/organization/${org_id}/assets/categories`, icon: 'heroicons:squares-plus' },
                            { label: 'Asset Models', path: `/organization/${org_id}/assets/models`, icon: 'heroicons:rectangle-group' },
                            { label: 'Assets', path: `/organization/${org_id}/assets`, icon: 'ion:desktop-outline' },
                            { label: 'Asset Requests', path: `/organization/${org_id}/assets/requests`, icon: 'ion:document-text-outline' },
                        ],
                    },
                    { label: 'Employee Self-Service', path: '/ess', icon: 'ion:person-circle' },
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
        return !subscriptionPaid ? [] : [
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
                        path: '/employee',
                        icon: 'ion:person-outline',
                        children: [
                            { label: 'Attendance', path: '/employee/attendance', icon: 'ion:clock' },
                            { label: 'Leave', path: '/employee/leaves', icon: 'ion:calendar-outline' },
                            { label: 'Performance', path: '/employee/performance', icon: 'ion:bar-chart-outline' },
                            { label: 'Holidays', path: '/employee/holidays', icon: 'ion:calendar-outline' },
                            { label: 'Expenses & Travels', path: '/employee/expense', icon: 'ion:cash' },
                            { label: 'Apps', path: '/employee/apps', icon: 'ion:apps-outline' },
                        ]
                    }
                ]
            },
            {
                group: 'Employees',
                items: [
                    {
                        label: 'Employees',
                        path: '/employee/employees',
                        icon: 'ion:people',
                        children: [
                            { label: 'Employees List', path: `/organization/${org_id}/employee/list`, icon: 'ion:person-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'Org Structure',
                items: [
                    {
                        label: 'Org Structure',
                        path: '/employee/org-structure',
                        icon: 'ion:business',
                        children: [
                            { label: 'Departments', path: `/organization/${org_id}/departments`, icon: 'lucide:git-fork' },
                            { label: 'Branches', path: `/organization/${org_id}/branches`, icon: 'lucide:building-2' },
                            { label: 'Holidays', path: `/organization/${org_id}/holiday`, icon: 'ion:calendar-number-outline' },
                            { label: 'Designations', path: `/organization/${org_id}/designations`, icon: 'ion:briefcase-outline' },
                            { label: 'Hierarchy', path: `/organization/${org_id}/hierarchy`, icon: 'ion:people-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'Onboarding',
                items: [
                    {
                        label: 'Onboarding',
                        path: `/organization/${org_id}/employee/onboarding`,
                        icon: 'ion:person-add-outline',
                    },
                ],
            },
            {
                group: 'Exits',
                items: [
                    {
                        label: 'Exits',
                        path: '/employee/exits',
                        icon: 'ion:exit-outline',
                        children: [
                            { label: 'Summary', path: `/organization/${org_id}/exits/summary`, icon: 'ion:stats-chart-outline' },
                            { label: 'Exit Process', path: `/organization/${org_id}/exits/process`, icon: 'ion:document-text-outline' },
                            { label: 'Reverted Exits', path: `/organization/${org_id}/exits/reverted`, icon: 'ion:refresh-outline' },
                            { label: 'Task Tracking', path: `/organization/${org_id}/exits/task-tracking`, icon: 'ion:checklist-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'Expenses',
                items: [
                    {
                        label: 'Expense and Travels',
                        path: '/employee/expense-travels',
                        icon: 'ion:cash',
                        children: [
                            { label: 'Summary', path: `/organization/${org_id}/expense-travels/summary`, icon: 'ion:stats-chart-outline' },
                            { label: 'Expenses', path: `/organization/${org_id}/expense-travels/expenses`, icon: 'ion:card-outline' },
                            { label: 'Advances', path: `/organization/${org_id}/expense-travels/advances`, icon: 'ion:cash-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'Documents',
                items: [
                    {
                        label: 'Documents',
                        path: '/employee/documents',
                        icon: 'ion:folder-outline',
                        children: [
                            { label: 'Employee Documents', path: `/organization/${org_id}/documents/employee`, icon: 'ion:person-outline' },
                            { label: 'Organization Documents', path: `/organization/${org_id}/documents/organization`, icon: 'ion:business-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'Assets',
                items: [
                    {
                        label: 'Assets',
                        path: '/employee/assets',
                        icon: 'ion:laptop-outline',
                        children: [
                        { label: 'Assigned Assets', path: `/organization/${org_id}/assets/assigned`, icon: 'ion:desktop-outline' },
                            { label: 'Asset Requests', path: `/organization/${org_id}/assets/requests`, icon: 'ion:document-text-outline' },
                        ],
                    },
                ],
            },
            {
                group: 'My Finance',
                items: [
                    {
                        label: 'My Finance',
                        path: '/employee/my-finance',
                        icon: 'ion:wallet',
                        children: [
                            { label: 'Summary', path: '/employee/my-finance/summary', icon: 'ion:stats-chart-outline' },
                            { label: 'My Pay', path: '/employee/my-finance/my-pay', icon: 'ion:cash-outline' },
                            { label: 'Manage Tax', path: '/employee/my-finance/manage-tax', icon: 'heroicons:percent-badge' },
                        ]
                    }
                ]
            },
            {
                group: 'Time Attend',
                items: [
                    {
                        label: 'Time Attend',
                        path: '/employee/time-attend',
                        icon: 'ion:clock',
                        children: [
                            { label: 'Attendance Tracking', path: '/employee/attendance', icon: 'ion:clock' },
                            { label: 'Leaves', path: `/organization/${org_id}/leave`, icon: 'ion:calendar' },
                        ],
                    },
                ],
            },
            {
                group: 'Engage',
                items: [
                    {
                        label: 'Engage',
                        path: '/employee/engage',
                        icon: 'ion:chatbubble-ellipses-outline',
                        children: [
                            { label: 'Announcements', path: '/employee/engage/announcements', icon: 'ion:megaphone-outline' },
                            { label: 'Polls', path: '/employee/engage/polls', icon: 'ion:bar-chart-outline' },
                            { label: 'Articles', path: '/employee/engage/articles', icon: 'ion:newspaper-outline' },
                        ]
                    }
                ]
            },
            {
                group: 'Reports & Analytics',
                items: [
                    {
                        label: 'Analytics & Reports',
                        path: '/employee/reports',
                        icon: 'ion:bar-chart',
                        children: [
                            { label: 'HR Reports', path: '/employee/reports/hr', icon: 'ion:people-circle-outline' },
                            { label: 'Payroll Reports', path: '/employee/reports/payroll', icon: 'ion:cash-outline' },
                            { label: 'Attendance Reports', path: '/employee/reports/attendance', icon: 'ion:time-outline' },
                        ],
                    },
                ],
            },
        ]
    }
}
