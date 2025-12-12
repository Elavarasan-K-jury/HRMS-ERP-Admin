export const employee_menu = (org_id, employee_id) => {
    return [
        {
            group: 'Home',
            items: [
                { label: 'Home', path: `/organization/${org_id}/employee/${employee_id}/home`, icon: 'ion:home-outline' },
                { label: 'Holidays', path: `/organization/${org_id}/employee/${employee_id}/holidays`, icon: 'ion:calendar-outline' },
            ]
        },

        {
            group: 'Self',
            items: [
                { label: 'Attendance', path: `/organization/${org_id}/employee/${employee_id}/attendance`, icon: 'ion:clock' },
                { label: 'Leaves', path: `/organization/${org_id}/employee/${employee_id}/leaves`, icon: 'ion:calendar-outline' },
                { label: 'Performance', path: `/organization/${org_id}/employee/${employee_id}/performance`, icon: 'ion:bar-chart-outline' },
            ],
        },

        {
            group: 'Inbox',
            items: [
                { label: 'Mails', path: `/organization/${org_id}/employee/${employee_id}/mails`, icon: 'ion:mail-outline' },
                { label: 'Notifications', path: `/organization/${org_id}/employee/${employee_id}/notifications`, icon: 'ion:notifications-outline' },
                { label: 'Chat', path: '/chat', icon: 'ion:chatbubbles-outline' },
                { label: 'Channels', path: '/channels', icon: 'ion:chatbubbles-outline' },
                { label: 'Events', path: '/events', icon: 'ion:calendar-outline' },
            ],
        },

        {
            group: 'Finalnce',
            items: [
                { label: 'Salary', path: `/organization/${org_id}/employee/${employee_id}/finance/salary`, icon: 'ion:cash-outline' },
                { label: 'Payslips', path: '/payslips', icon: 'ion:document-text-outline' },
                { label: 'Income Tax', path: '/income-tax', icon: 'heroicons:percent-badge' },
                { label: 'Forms', path: '/forms', icon: 'heroicons:document-text' },
            ],
        },

        {
            group: 'Team',
            items: [
                { label: 'My Team', path: '/team', icon: 'ion:people-outline' },
                { label: 'Hierarchy', path: '/hierarchy', icon: 'ion:people-outline' },
            ],
        },

        {
            group: 'Settings',
            items: [
                { label: 'Profile', path: '/profile', icon: 'heroicons:user' },
            ],
        },
    ]
}
export const organization_menu = (org_id) => {
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
                        // { label: 'List', path: '/organization/list', icon: 'ion:list-outline' },
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
                        { label: 'Salary Template', path: `/organization/${org_id}/payroll/templates`, icon: 'heroicons:document-currency-rupee' },
                        { label: 'Payslips', path: '/payroll/payslips', icon: 'ion:receipt-outline' },
                        { label: 'Bonuses', path: '/payroll/bonuses', icon: 'ion:gift-outline' },
                    ],
                },
                { label: 'Expenses', path: '/expenses', icon: 'ion:cash' },
                { label: 'Reimbursement', path: '/reimbursement', icon: 'ion:cash-outline' },
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
                // {
                //     label: 'Recruitment',
                //     path: '/recruitment',
                //     icon: 'ion:document-text',
                //     children: [
                //         {label: 'Job Posts', path: '/recruitment/jobs', icon: 'ion:briefcase-outline' },
                //         {label: 'Candidates', path: '/recruitment/candidates', icon: 'ion:person-add-outline' },
                //         {label: 'Interviews', path: '/recruitment/interviews', icon: 'ion:calendar-outline' },
                //     ],
                // },
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
            },
            {
                label: 'Plans',
                path: '/Plans',
                icon: 'heroicons:receipt-percent',
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
            },
            { label: 'Payments', path: '/payments', icon: 'ion:cash' },
        ],
    },

    {
        group: 'Offers',
        items: [
            {
                label: 'Discounts',
                path: '/discounts',
                icon: 'heroicons:percent-badge',
            },
        ],
    },

    {
        group: 'Reports & Analytics',
        items: [
            { label: 'Traffic Reports', path: '/reports/traffic', icon: 'heroicons:chart-pie' },
            { label: 'Payment Reports', path: '/reports/payments', icon: 'heroicons:currency-dollar' },
            { label: 'Usage Reports', path: '/reports/usage', icon: 'heroicons:chart-bar' },
        ],
    },

    {
        group: 'System',
        items: [
            {
                label: 'Modules',
                path: '/modules',
                icon: 'ion:document-text',
            },
            { label: 'General Settings', path: '/settings/general', icon: 'ion:options-outline' },
            { label: 'Notifications', path: '/settings/notifications', icon: 'ion:notifications-outline' },

        ],
    },
]
