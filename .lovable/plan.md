# Implementation Plan - XForge Pro License Management

Add a comprehensive administration area for XForge Pro license management, including a new navigation item, license listing with filtering, creation modal, and detailed license view.

## User Interface & Design

- **Navigation**: Add "🔑 Licenças XForge" to the "GESTÃO" section in the sidebar.
- **Header**: Page title "Licenças XForge Pro" with subtitle and a "+ Criar licença" button.
- **Metrics**: Four summary cards for Active, Expired, Blocked licenses, and Active Devices.
- **Search & Filters**: Integrated search bar and dropdown filters for Status and Plan.
- **Data Table**: Professional table with columns for Client, Code (masked), Plan, Status, Validity, Devices, Last Access, and Actions.
- **Modals**:
    - **Create License**: Form for client name, plan selection, duration type (period vs. lifetime), and device limits.
    - **License Details**: Comprehensive view of all license metadata and device identification.
- **Empty State**: Friendly illustration/text when no licenses exist.

## Technical Details

- **Routing**: New route `/licencas-xforge` using TanStack Router.
- **State Management**: Local state for mock data, search queries, and filters.
- **Components**:
    - `src/routes/licencas-xforge.tsx`: Main page component.
    - `src/components/licenses/LicenseCreateModal.tsx`: Creation form.
    - `src/components/licenses/LicenseDetailsModal.tsx`: Detailed view.
    - `src/components/licenses/LicenseTable.tsx`: Data grid.
- **Icons**: Lucide icons for actions (Key, Eye, Copy, Lock, Unlock, RefreshCw, Edit, Trash).

## Constraints
- Preserve existing sidebar and layout.
- No Supabase integration yet; use mock data.
- Full responsiveness (Mobile/Tablet/Desktop).
- No hardcoded secret keys.
