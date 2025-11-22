export const organization_menu = (org_id) => {
    return [
        {
            group: 'Core HR',
            items: [
                { label: 'Dashboard', path: `/panel/super-admin/organization/${org_id}/dashboard`, icon: 'ion:pie-chart' },
                {
                    label: 'Organization',
                    path: '/organization',
                    icon: 'ion:business',
                    children: [
                        // { label: 'List', path: '/organization/list', icon: 'ion:list-outline' },
                        { label: 'Departments', path: `/panel/super-admin/organization/${org_id}/departments`, icon: 'lucide:git-fork' },
                        { label: 'Designations', path: `/panel/super-admin/organization/${org_id}/designations`, icon: 'ion:briefcase-outline' },
                        { label: 'Hierarchy', path: `/panel/super-admin/organization/${org_id}/hierarchy`, icon: 'ion:people-outline' },
                    ],
                },
                {
                    label: 'Employee',
                    path: '/employee',
                    icon: 'ion:people',
                    children: [
                        { label: 'Employees', path: `/panel/super-admin/organization/${org_id}/employee/list`, icon: 'ion:person-outline' },
                        { label: 'Employee Categories', path: `/panel/super-admin/organization/${org_id}/employee/categories`, icon: 'ion:albums-outline' },
                        { label: 'Onboarding', path: `/panel/super-admin/organization/${org_id}/employee/onboarding`, icon: 'ion:person-add-outline' },
                        { label: 'Permissions', path: `/panel/super-admin/organization/${org_id}/employee/permissions`, icon: 'heroicons:lock-closed' },
                    ],
                },
                { label: 'Attendance', path: `/panel/super-admin/organization/${org_id}/attendance`, icon: 'ion:clock' },
                { label: 'Leave', path: `/panel/super-admin/organization/${org_id}/leave`, icon: 'ion:calendar' },
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
                        { label: 'Salary Structure', path: '/payroll/structure', icon: 'ion:document-outline' },
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
                        { label: 'Asset Categories', path: `/panel/super-admin/organization/${org_id}/assets/categories`, icon: 'heroicons:squares-plus' },
                        { label: 'Asset Models', path: `/panel/super-admin/organization/${org_id}/assets/models`, icon: 'heroicons:rectangle-group' },
                        { label: 'Assets', path: `/panel/super-admin/organization/${org_id}/assets`, icon: 'ion:desktop-outline' },
                        { label: 'Asset Requests', path: `/panel/super-admin/organization/${org_id}/assets/requests`, icon: 'ion:document-text-outline' },
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
            { label: 'Dashboard', path: '/panel/super-admin/dashboard', icon: 'ion:pie-chart' },
        ]
    }, {
        group: 'Tenants',
        items: [
            {
                label: 'Organization',
                path: '/panel/super-admin/organization/list',
                icon: 'ion:business',
            },
            {
                label: 'Plans',
                path: '/panel/super-admin/Plans',
                icon: 'heroicons:receipt-percent',
            },
        ],
    },

    {
        group: 'Billing',
        items: [
            {
                label: 'Invoices',
                path: '/panel/super-admin/invoices',
                icon: 'ion:document-text',
            },
            { label: 'Payments', path: '/panel/super-admin/payments', icon: 'ion:cash' },
        ],
    },

    {
        group: 'Offers',
        items: [
            {
                label: 'Discounts',
                path: '/panel/super-admin/discounts',
                icon: 'heroicons:percent-badge',
            },
        ],
    },

    {
        group: 'Reports & Analytics',
        items: [
            { label: 'Traffic Reports', path: '/panel/super-admin/reports/traffic', icon: 'heroicons:chart-pie' },
            { label: 'Payment Reports', path: '/panel/super-admin/reports/payments', icon: 'heroicons:currency-dollar' },
            { label: 'Usage Reports', path: '/panel/super-admin/reports/usage', icon: 'heroicons:chart-bar' },
        ],
    },

    {
        group: 'System',
        items: [
            {
                label: 'Modules',
                path: '/panel/super-admin/modules',
                icon: 'ion:document-text',
            },
            { label: 'General Settings', path: '/panel/super-admin/settings/general', icon: 'ion:options-outline' },
            { label: 'Notifications', path: '/panel/super-admin/settings/notifications', icon: 'ion:notifications-outline' },

        ],
    },
]
