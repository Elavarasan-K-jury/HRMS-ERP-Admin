# Jury HRMS — Admin Panel Documentation

## Overview

Jury HRMS is a comprehensive Human Resource Management System admin panel built with a modern glassmorphic user interface. It provides two primary access levels:

1. **Super Admin** — Platform-wide administration, analytics, tenant management, billing, and system configuration.
2. **Organization Admin** — Organization-specific HR operations including employee management, payroll, attendance, asset tracking, and more.

Additionally, an **Employee Self-Service** portal allows employees to view their own attendance, holidays, salary, and perform self-service operations.

---

## 1. Authentication & Security

### 1.1 Login Flow
The system uses an OTP-based authentication mechanism supporting both email and phone number login:

- **Step 1**: User enters their registered email address or phone number.
- **Step 2**: A one-time password (OTP) is sent to the registered contact method via the API.
- **Step 3**: User enters the 6-digit OTP to complete verification.
- **Step 4**: Upon successful verification, JWT access and refresh tokens are issued.

### 1.2 Session Management
- **Access Token**: Stored in a browser cookie (`ADMIN_ACCESS_KEY`) with a 7-day expiry.
- **Refresh Token**: Optionally stored in a cookie (`ADMIN_REFRESH_KEY`) when "Remember Me" is checked.
- **Auto-Refresh**: When an access token expires, the system automatically attempts to refresh it using the stored refresh token.
- **Redirect Preservation**: The original navigation target is saved in a `REDIRECT_PATH` cookie (5-minute expiry) so users return to their intended page after login.

### 1.3 Route Protection
A global navigation guard runs on every route change:
- Unauthenticated users are redirected to `/login`.
- Authenticated users on the login page are verified and redirected to the dashboard.
- Public paths (`/login`, `/forgot-password`) bypass authentication checks.

### 1.4 Token Verification
On page load or navigation, the system verifies the stored token against the server. If invalid, it attempts a refresh. If refresh fails, the user is logged out.

---

## 2. Dashboard (Super Admin)

The super admin dashboard provides a comprehensive overview of the entire platform with real-time metrics and visualizations.

### 2.1 Platform KPIs
- Total number of registered organizations.
- Active users across all organizations.
- Platform revenue metrics.
- Key performance indicators presented in summary cards.

### 2.2 Organization Growth
- A chart showing the growth trend of organizations over time.
- Helps super admins track platform adoption.

### 2.3 Revenue Trends
- Visualization of revenue generated from subscriptions over time.
- Monthly and yearly revenue patterns.

### 2.4 Module Usage Distribution
- Breakdown of which HRMS modules are most used across all organizations.
- Helps identify popular features and areas for improvement.

### 2.5 Top Organizations
- Lists organizations with the highest usage or activity.
- Quick access to view details of high-value tenants.

### 2.6 Subscription Risk Analysis
- Identifies organizations at risk of churn (expiring subscriptions, payment failures, etc.).
- Allows proactive intervention.

### 2.7 Service Health Monitoring
- Real-time health status of all backend services.
- Each service is marked as Healthy, Degraded, or Unhealthy based on error rates.
- Provides immediate visibility into platform stability.

---

## 3. Organization Management

### 3.1 Organization Listing
- Paginated table view of all registered tenant organizations.
- Columns include organization name, domain, contact details, industry, and status.
- Searchable with debounced input for real-time filtering.
- Sortable by various fields.

### 3.2 Create Organization
Full organization creation form with the following sections:

**Basic Details:**
- Organization name, domain, and GST number.
- Contact email and contact person details.
- Industry selection from 60+ predefined industry categories.
- Organization size.

**Address:**
- Complete address including street number/name, area, locality, city, state, postal code, and country.
- Country selection from a comprehensive list with flag icons.

**Plan & Limits:**
- Subscription plan assignment (from available plans).
- Payment duration (Monthly/Yearly).
- Resource limits: maximum employees, storage capacity (GB), API rate per minute, payroll runs per month, maximum leave policies, and maximum admin accounts.
- When a plan is selected, resource limits are automatically populated from the plan's feature definitions.

### 3.3 Edit Organization
- Full editing capability for all organization fields.
- Current subscription details are loaded for modification.
- Plan changes are reflected in new subscription assignments.

### 3.4 Delete Organization
- Confirmation dialog before deletion.
- Removes the organization and its associated data.

### 3.5 Organization Subscription
- View current subscription details for any organization.
- Track billing intervals and plan assignment.

---

## 4. Employee Management

### 4.1 Employee Listing
- Paginated table of all employees within an organization.
- Filterable by employee category.
- Searchable by name, email, or other fields.
- Sortable by creation date and other attributes.

### 4.2 Create/Edit Employee
Personal Information:
- First name, last name, full name (auto-generated).
- Email, phone, alternate phone.
- Gender, date of birth.
- Employee type: Regular Employee or Admin.

Categorization:
- Employee category (Permanent, Contract, Intern, etc.) — defines HR policies.
- Employee designation (job level).

Department Assignment:
- Employees can be assigned to multiple departments simultaneously.
- For each department assignment:
  - Select the department.
  - Specify a reporting manager.
  - Set start and end dates for the assignment.
- Dynamic add/remove of department rows.

### 4.3 Employee Report
- Detailed report view for individual employees.
- Includes all personal, departmental, and categorical information.

### 4.4 Employee Categories
Categories define employment types with configurable HR policies:

**Configuration Options:**
- Category name, code, and ID prefix (used for auto-generating employee IDs).
- Description of the category.
- Permanent/contract status flag.
- Benefits applicability.
- Training policy: whether training is required and duration in months.
- Probation policy: whether probation is required and duration in months.
- Notice period: whether notice is required and duration in months.
- Active/inactive status.

**Features:**
- Paginated listing with search.
- Create, edit, and delete categories.
- Category dropdown formatted as "Name (PREFIX)" for easy identification.

---

## 5. Department Management

### 5.1 Department Listing
- Paginated table of all departments within an organization.
- Searchable and sortable.

### 5.2 Create/Edit Department
- Department name and unique code.
- Description and optional notes.
- Department head assignment (select from employees) with start date.
- When editing, existing data is pre-populated.

### 5.3 Department Employees
- View all employees assigned to a specific department.
- Shows reporting structure within the department.

### 5.4 Delete Department
- Confirmation before deletion with success/error feedback.

---

## 6. Designation Management

### 6.1 Designation Listing
- Paginated table of all designations within an organization.
- Shows designation name, level, and associated department.

### 6.2 Create/Edit Designation
- Designation name.
- Designation level selection from 9 predefined levels:
  - Entry Level, Junior Level, Intermediate/Associate Level, Senior/Specialist Level, Lead/Supervisor Level, Managerial Level, Senior Management, Executive Level, Board/Governance Level.
- Description of the role.
- Optional department association.

### 6.3 Delete Designation
- Confirmation before deletion.

---

## 7. Organization & Department Hierarchy

### 7.1 Organization-Wide Hierarchy
- Displays the complete designation hierarchy across the entire organization.
- Each level shows:
  - Level label and order.
  - Number of designations at that level.
  - Number of employees at each designation.
  - Detailed listing of designations and employees within each level.

### 7.2 Department Reporting Hierarchy
- Tree-structured view of the reporting hierarchy within a department.
- Shows employees and their direct reportees in a nested format.
- Allows selection of specific departments to view their structure.
- Recursive tree supports unlimited depth of reporting levels.

---

## 8. Attendance Management

### 8.1 Attendance Policies
Policies define the rules for employee time tracking:

**Policy Configuration:**
- Policy name.
- Grace period (minutes) — allowable lateness without penalty.
- Half-day threshold (minutes) — duration that constitutes a half day.
- Full-day threshold (minutes) — duration required for a full day.
- Geo-check-in toggle — require location verification.
- Outside geo-fence allowance — permit check-in from outside the defined area.
- Auto-mark absent — automatically mark as absent if no check-in.
- Check-in buffer (minutes) — time before shift start when check-in is accepted.
- Check-out buffer (minutes) — time after shift end when check-out is accepted.
- Rounding strategy — how clock-in/out times are rounded.
- Overtime allowed toggle.
- Minimum overtime duration (minutes).

**Features:**
- List all policies for an organization.
- Create, edit, and view policies.
- Load policy data into form for editing.

### 8.2 Monthly Attendance (Organization View)
- View attendance data for the entire organization for a given month.
- Daily records show which employees were present, absent, or on leave.
- Monthly statistics: total working days, total present days.

### 8.3 Attendance Reports

**Report Generation:**
- Generate attendance reports with filters:
  - Department, designation, specific employee.
  - Date range (start and end date).
- Reports are generated asynchronously.

**Report Management:**
- List of all generated reports with status tracking.
- Statuses: PENDING → COMPLETED or FAILED.
- Auto-refresh every 2 seconds while reports are in progress.
- View individual report details by report ID.
- Pagination for report history.

---

## 9. Holiday Management

### 9.1 Holiday CRUD
- Create holidays with date, name, region, and type (PUBLIC, OPTIONAL, RESTRICTED).
- Optionally associate a holiday with a specific attendance policy.
- Edit and delete existing holidays.
- View all holidays with filtering by year, type, region, and policy.

### 9.2 Holiday Calendar
- Monthly calendar view showing holidays for a given year-month.
- Filters by policy and region.
- Day-by-day holiday indicators.

### 9.3 Employee Holiday View
- Read-only view for employees to see all organization holidays.
- Automatically computes the next upcoming holiday (including today's).
- Filter holidays by calendar year.
- Shows holiday dates and names in a simple list.

---

## 10. Payroll & Finance

### 10.1 Salary Component Definitions
Manage the building blocks of salary structures:

**Component Properties:**
- Unique key and display name.
- Type: Earning, Deduction, Reimbursement, Benefit, or Tax.
- Category: Standard or Allowance.
- Default formula for calculation.
- Description of the component.
- Taxable flag, variable flag, statutory flag.
- Include in CTC and Include in Gross flags.
- Display order for sorting.
- Active/inactive status.

**Category Tabs:**
- Components organized into tabs: Recurring, Adhoc, Allowance, Custom.
- Each tab shows a badge count of components in that category.
- Tab-based filtering for easier management.

**Features:**
- Paginated listing with search.
- Create, edit, and delete components.
- Default components have simplified editing (name and key only).

### 10.2 Salary Templates
Templates group salary components together for specific employee groups:

**Template Properties:**
- Name and description.
- Assigned departments and designations (which employee groups this applies to).
- Default template flag.
- Active/inactive status.

**Features:**
- Paginated listing with search.
- Create, edit, clone, and delete templates.
- Template builder for configuring component values.

### 10.3 Salary Ranges
Salary ranges define gross salary brackets within a template:

**Range Properties:**
- Low and high gross amount (e.g., 0-3 LPA, 3-6 LPA).
- Label for the range.
- Custom component values per range.

**Range Components:**
- Each range can have different values for salary components.
- Components reference the component definitions.
- Full replace strategy when saving (all components are replaced at once).
- Components have priority, min/max values, conditions, and formula overrides.
- Default components cannot be deleted.

**Features:**
- Add, edit, and delete ranges.
- Select active range to view/edit its components.
- Auto-select first range on load.

### 10.4 Payslip Templates
EJS-based payslip template management:

**Template Features:**
- Create and manage multiple payslip templates per organization.
- EJS (Embedded JavaScript) templating engine for dynamic content.
- Template variables are calculated and synced from the server.

**Template Editing:**
- Load template content (EJS HTML).
- View available variables for template construction.
- Save template with name, path, content, and variable definitions.

**Rendering:**
- Render templates with actual data to generate HTML payslips.
- Preview rendered output.
- Variables are automatically synced from server during rendering.

### 10.5 Finance Configuration

**Provident Fund (PF):**
- Enable/disable PF for the organization.
- Configure PF formula (calculation logic).
- PF registration number and registered organization name.
- Toggle PF on/off without deleting configuration.

**Employee State Insurance (ESI):**
- Enable/disable ESI for the organization.
- Configure ESI formula.
- ESI registration number and registered organization name.
- Toggle ESI on/off.

**Professional Tax (PTAX):**
- Enable/disable Professional Tax.
- Configure PTAX formula.
- PTAX registration number and registered organization name.
- Toggle PTAX on/off.

**Caching:**
- Finance enabled status is cached per organization.
- Only fetches from API when needed (no redundant calls).

### 10.6 Employee Salary Management

**Salary Revisions:**
- View all salary revisions for an employee.
- Each revision tracks changes over time with effective dates.
- Revision statuses: ACTIVE, INACTIVE, SUPERSEDED.

**Salary Structure Preview:**
- Select a salary template and enter gross annual amount.
- Preview the complete salary breakdown before assignment.
- Shows detailed earnings and deductions.

**Salary Assignment:**
- Assign new salary structure with:
  - Template selection.
  - Gross annual amount.
  - Effective from date.
  - Status (Active/Inactive/Superseded).
  - Current active flag.
  - Deduct from in-hand option.
- Validates that all required fields are filled.

---

## 11. Asset Management

### 11.1 Asset Categories
- Categories define types of assets (e.g., Laptops, Monitors, Phones, Furniture).
- Each category has a name, code, description, and active status.
- Paginated listing with search.
- Create, edit, and delete categories.
- Dropdown formatted as "Name (CODE)".

### 11.2 Asset Models
- Models define specific makes/models within a category.
- Properties: brand, model name, code, description.
- Specifications stored as dynamic key-value pairs.
- Associated with a category.
- Paginated listing with search.
- Create, edit, and delete models.
- Dropdown formatted as "ModelName (Brand)".

### 11.3 Assets
Individual asset items with full lifecycle management:

**Asset Properties:**
- Serial number and asset tag for identification.
- Associated category and model.
- Login credentials (username/password) for digital assets.
- Purchase date and warranty expiry date.
- Current status (Available, Assigned, Maintenance, Retired).
- Physical location.

**Features:**
- Paginated listing with filtering by category and model.
- Search across all asset fields.
- Create and edit assets.
- Validation ensures required fields are filled.

**Asset Assignment:**
- Assign assets to employees.
- Assignment records include:
  - Employee selection.
  - Assignment date.
  - Condition at assignment (Good, Fair, Poor).
  - Assignment status.
  - Optional notes.
- Validation requires both employee and condition selection.

**Asset Deletion:**
- Remove assets from the system with confirmation.

### 11.4 Asset Requests
Employee-initiated asset request workflow:

**Request Management:**
- List all asset requests with pagination.
- View request details including employee, asset type, and reason.

**Approval Workflow:**
- Approve requests with timestamp and approver information.
- Reject requests (mandatory rejection reason required).
- Both actions update the request status and record the approving admin.
- List refreshes automatically after each action.

---

## 12. Expense Management

### 12.1 Expense Request Listing
- View all expense requests submitted by employees.
- Filtering options:
  - Expense type: All, Travel, Food, Accommodation, Other.
  - Status: All, Pending, Approved, Rejected.
  - Date range (from/to).
  - Specific employee.
  - Free text search.

### 12.2 Approval Workflow
- **Approve**: Mark expenses as approved with super admin as approver.
- **Reject**: Mark expenses as rejected.
- Both actions provide success/failure feedback via toast notifications.
- List refreshes automatically after each action.

### 12.3 Pagination
- Paginated results with total count and page tracking.
- Server-side pagination for performance.

---

## 13. Subscription Plans & Billing

### 13.1 Plan Management
Subscription plans define the pricing tiers available to organizations:

**Plan Properties:**
- Name and description.
- Monthly price and yearly price.
- Trial period (days).
- GST percentage.
- Active/inactive status.

**Plan Features:**
- Each plan has configurable features (key-value pairs).
- Features represent resource limits and capabilities.
- Each feature can have: key name, value (numeric), unit, and unlimited flag.
- Examples: max employees, storage GB, API rate, payroll runs, leave policies, admin accounts.

**Features:**
- Paginated listing with search.
- Create, edit, and delete plans.
- Edit plan features when editing a plan.
- Features saved in bulk after plan save.

### 13.2 Invoices
- View all invoices generated for organizations.
- Filter by specific organization.
- Search functionality.
- Pagination support.
- View invoice details.
- Download invoices.
- Regenerate payment links for unpaid invoices.

---

## 14. File Storage

### 14.1 Folder Management
Organize files in a hierarchical folder structure:

**Folder Properties:**
- Name with optional color coding.
- Visibility: Private (creator only), Shared (specific employees), Public (all org members).
- Optional folder image/icon.

**Features:**
- Paginated listing with search.
- Create folders with multipart upload (supports folder image).
- Edit folder name, color, and visibility.
- Delete folders with confirmation.
- Share folders with selected employees.

**Storage Tracking:**
- Total storage quota and used storage displayed.
- Updates after file uploads/deletions.

### 14.2 File Management

**File Upload:**
- Upload files to specific folders (or root level).
- Single file upload with real-time progress tracking (percentage).
- Sequential multi-file upload with individual success/error tracking.
- Multipart form data upload.

**File Listing:**
- Organization-wide or folder-specific file view.
- Paginated listing.

**File Deletion:**
- Delete files with confirmation.
- Automatic folder storage recalculation after deletion.

---

## 15. Employee Onboarding Process

### 15.1 Onboarding Flow Builder
Create structured onboarding processes for new employees:

**Flow Structure:**
- Flows have a name, description, and estimated duration (days).
- Each flow contains multiple steps.
- Each step can have multiple form features/fields.

**Step Features:**
- Features have a name and input type.
- Available input types: Text, Email, Password, Number, Date, Time, File, Checkbox, Radio, Select.
- Features can have options (for Select/Radio inputs).
- Options flag and option text configuration.

**Builder Capabilities:**
- Add and remove steps dynamically.
- Add and remove features within steps.
- Reorder steps and features.
- Server-side persistence with create/update/delete for flows, steps, and features.

### 15.2 Import/Export
- Export onboarding flows as encrypted `.jhrmsenc` files (AES encryption).
- Import previously exported flows by decrypting and loading the file.
- Uses configurable encryption secret key.

---

## 16. Traffic & Usage Analytics (Super Admin)

### 16.1 Traffic Analytics Dashboard
Comprehensive traffic monitoring for the entire platform:

**KPIs:**
- Total requests across all services.
- Total errors.
- Error rate (percentage).
- Average latency (milliseconds).

**Time Range:**
- Hourly view (last 24 hours).
- Daily view (last 30 days).
- Toggle between granularities.

**Visualizations:**
- Traffic Trend: Stacked area chart showing requests and errors over time.
- Latency: Line chart with average, P95, and P99 latency metrics.
- Top Routes: Horizontal bar chart of the 5 most requested API routes.
- Service Health: List of all services with health status (Healthy/Degraded/Unhealthy) computed from error rates.
- Error Breakdown: Radial bar chart showing distribution of 5xx, 4xx, and 2xx responses.
- Alerts: Scrollable list of triggered alerts with timestamps.

**Auto-Refresh:**
- Automatically refreshes every 2 seconds for near-real-time monitoring.

### 16.2 Real-time Usage Monitoring
Live API usage monitoring via WebSocket connection:

**Live KPIs:**
- Requests per second (RPS).
- Current error count.
- Average latency.
- P95 latency.

**Organization Scoping:**
- View usage for all organizations or filter by specific organization.
- Dropdown selection for quick switching.
- Disconnects and reconnects socket on organization change.

**Live Charts:**
- Traffic Flow: Stacked area chart updating in real-time.
- Latency Movement: Line chart of latency over time.
- Capped at 180 data points (sliding window to prevent memory issues).
- Dynamic animation at 60ms for smooth updates.

**Connection Status:**
- LIVE indicator (green) when WebSocket is connected.
- OFFLINE indicator (red) when disconnected.

**Technical Details:**
- WebSocket transport for lowest latency.
- Socket.IO CDN loaded dynamically.
- Authentication token passed on connection.
- Initial snapshot loads history, then real-time events stream updates.

---

## 17. User Interface & Experience

### 17.1 Glassmorphic Design System
The entire UI is built with a frosted glass (glassmorphism) design language:
- Semi-transparent backgrounds with backdrop blur.
- Subtle border highlights.
- Gradient color schemes.
- Smooth transitions and animations.
- Custom scrollbar styling with gradient thumbs.

### 17.2 Theme Customization
- Users can change the application background color from a palette of 14 color families.
- Each color family has shades 700, 800, and 900 for depth.
- Colors include brand colors (Brand, Plum, Rust, Clay, Neutral) and standard Tailwind colors (Red, Blue, Green, Yellow, Orange, Purple, Pink, Lime, Teal, Cyan).
- Background color is persisted in localStorage.
- Accessible via a color sidebar panel.

### 17.3 Sidebar Navigation
- Expandable/collapsible sidebar (250px expanded, 85px collapsed).
- Dynamic menu content based on user role and context.
- Organization name displayed with abbreviated short form for collapsed mode.
- Section groups with labeled headers.
- Hierarchical menu items with expandable children.

### 17.4 Breadcrumb Navigation
- Auto-generated breadcrumbs based on the active route.
- Recursive resolution through nested menu structures.
- Shows the current page location within the application hierarchy.

### 17.5 Page & Layout Transitions
- Page transitions: Fade with 15px upward slide (0.4s).
- Layout transitions: Fade with scale from 1.2 to 1 (0.5s).
- Both use out-in mode (leave animation completes before enter begins).

### 17.6 Preloader
- Full-screen loading overlay shown during initial load and auth transitions.
- Uses animated loader component.
- 1-second minimum display time for smooth UX.

### 17.7 Toast Notifications
- Success and error toast messages for all operations.
- Auto-dismiss after 1.5 seconds.
- Slide-in animation from the top.

---

## 18. API Integration Architecture

### 18.1 HTTP Client
- Centralized Axios instance configured on app startup.
- Base URL configurable via environment variables.
- 15-second request timeout.
- Dynamic header injection for organization context (`x-org-id`) and employee context (`x-employee-id`).

### 18.2 Real-time Communication
- Socket.IO WebSocket client for real-time usage monitoring.
- Dynamic loading from CDN (not bundled in main application).
- Authentication token passed during connection handshake.
- Automatic reconnection on disconnect.

### 18.3 Encryption
- AES encryption/decryption for sensitive data (onboarding flow files).
- Configurable secret key via environment variables.
- Custom `.jhrmsenc` file extension for encrypted exports.

---

## 19. Layout System

The application uses four distinct layouts:

### 19.1 Default Layout
- Used for the login page.
- Full-screen conic gradient background cycling through brand colors.
- Minimal structure with centered content.

### 19.2 Auth Layout (Super Admin)
- Used for authenticated super admin pages.
- Dynamic background color from theme settings.
- Full sidebar navigation with super admin menu.
- Color picker sidebar.
- Header with breadcrumbs.
- Preloader overlay.
- "Powered by Jurysoft" badge.

### 19.3 Organization Layout
- Used for organization-specific admin pages.
- Same structure as auth layout but with:
  - Organization name as sidebar title.
  - Organization-specific menu items.
  - Dynamic menu generation from route parameters.
  - Finance module status check on mount.
  - Organization ID header injection.

### 19.4 Employee Layout
- Used for employee self-service pages.
- Same structure with:
  - Employee-specific menu items.
  - Both organization ID and employee ID header injection.
  - Employee-specific routing.

---

## 20. Navigation Menu Structure

### 20.1 Super Admin Menu
- **Analytics**: Dashboard.
- **Tenants**: Organization list, Plans.
- **Billing**: Invoices, Payments.
- **Offers**: Discounts.
- **Reports & Analytics**: Traffic Reports, Payment Reports, Usage Reports.
- **System**: Modules, General Settings, Notifications.

### 20.2 Organization Admin Menu
- **Core HR**: Dashboard, Organization (Departments, Designations, Hierarchy, Holidays), Employee (List, Categories, Onboarding, Permissions), Attendance (Attendance, Policy, Reports), Leave.
- **Payroll & Finance**: Payroll (Components, Groups, Payslip Template, Payslips, Bonuses, Settings), Expenses (Subscription, Invoices, Office, Other), Reimbursement.
- **Performance & Talent**: Performance (Appraisals, Goals & KPIs, Feedback), Onboarding.
- **Operations**: Asset Management (Categories, Models, Assets, Requests), Employee Self-Service.
- **Storage**: Folders & Files.
- **Reports & Analytics**: HR Reports, Payroll Reports, Attendance Reports.
- **System**: Calculators (Salary), Integrations (HRMS APIs, Third-Party Apps), Settings (General, Roles & Permissions, Notifications).

### 20.3 Employee Menu
- **Home**: Home, Holidays.
- **Self**: Attendance, Leaves, Performance.
- **Inbox**: Mails, Notifications, Chat, Channels, Events.
- **Finance**: Salary, Payslips, Income Tax, Forms.
- **Team**: My Team, Hierarchy.
- **Settings**: Profile.

---

## 21. Data Constants

### 21.1 Countries
- Comprehensive list of 40+ countries across all continents.
- Each entry has label, value, and flag icon reference.
- Separate country codes list with dialing codes for phone inputs.
- Fallback "Other/Global" entry.

### 21.2 Industries
- 60+ industry sectors covering all major categories.
- Each entry has label, value, and icon reference.
- Categories include Technology, Finance, Healthcare, Education, Manufacturing, Services, etc.

### 21.3 Designation Levels
- 9 career levels from Entry Level to Board/Governance Level.
- Used across the system for consistent designation hierarchy.

### 21.4 Input Types
- 10 form input types for the onboarding feature builder.
- Types: Text, Email, Password, Number, Date, Time, File, Checkbox, Radio, Select.
