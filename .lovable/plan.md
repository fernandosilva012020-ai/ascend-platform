# Plan - Connect XForge Licenses to Real Data

Connect the XForge Licenses page to the `xforge-admin` Supabase Edge Function to replace mock data with real data for list and metrics.

## Technical Details

- **Supabase Integration**: Use the existing Supabase client in `src/integrations/supabase/client`.
- **Data Fetching**: 
    - Obtain user session and handle redirection to `/login` if missing.
    - Invoke the `xforge-admin` Edge Function with the `list` action.
    - Implement error handling for 401 (Expired Session), 403 (Forbidden), and other errors.
- **UI Mapping**:
    - **Metrics**: Map `metrics.active`, `metrics.expired`, `metrics.blocked`, and `metrics.devices` to the header cards.
    - **Table**: 
        - Remove mock licenses.
        - Map `user_name` to Client.
        - Map `key_preview` to Code.
        - Map `plan` to Plan.
        - Map `display_status` to Status (converting `active`, `expired`, `suspended`, `revoked`).
        - Map `lifetime` / `expires_at` to Validity.
        - Map `device_count / max_devices` to Devices.
        - Map `last_validated_at` to Last Access.
- **Filtering & Search**: Update existing frontend logic to search/filter the real data fetched from the Edge Function.
- **Loading State**: Add an elegant loading UI while fetching data.
- **Security**: 
    - No direct table access.
    - No service_role usage.
    - No manual token storage in localStorage.

## Implementation Steps

1. **Modify `src/routes/licencas-xforge.tsx`**:
    - Add data fetching logic using `useQuery` or `useEffect` + local state (TanStack Start context allows for loaders, but instructions suggest component-level fetching after checking session).
    - Update types to match the Edge Function response.
    - Implement loading and error states.
    - Replace mock data usage with the fetched licenses and metrics.
2. **Update UI Components**:
    - Adjust table row rendering to handle the new data structure.
    - Ensure status badges use the correct colors for translated statuses.
    - Update search and filter logic to work with the new license object structure.
