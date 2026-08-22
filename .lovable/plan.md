# Auth and Session implementation plan

Connect "Projeto X V2" to real Supabase Auth, securing routes and enabling real user profile data.

## User Review Required

> [!IMPORTANT]
> - A real Supabase connection is required. If not already connected, use the "Connect Supabase" button in the Lovable Cloud UI.
> - By default, users will need to sign up or you will need to create a user in the Supabase Auth dashboard to log in.

## Proposed Changes

### 1. Auth Provider and State
- Create `src/hooks/useAuth.tsx` to manage global Supabase session and user state.
- Use `supabase.auth.onAuthStateChange` to keep session in sync.
- Provide `login`, `logout`, and `session` utilities.

### 2. Login Page
- Create `src/routes/login.tsx`.
- Implement a premium UI consistent with the project's visual identity.
- Use `supabase.auth.signInWithPassword`.
- Add success/error toast notifications.

### 3. Route Protection
- Update `src/routes/__root.tsx` to wrap the application in `AuthProvider`.
- Implement a guard in the root or individual routes to redirect to `/login` if no session exists.
- Ensure public routes (like `/login`) are accessible.

### 4. Sidebar and User Profile
- Update `src/components/layout/AppSidebar.tsx` to display real user data from the session.
- Fix the "Sair" (Logout) button to call `supabase.auth.signOut()` and navigate to `/login`.
- Update `src/components/layout/AppHeader.tsx` to also reflect real user initials.

### 5. XForge Licenses Integration
- Update `src/routes/licencas-xforge.tsx` to use the global session token for Edge Function calls.

## Technical Details

### New Files
- `src/hooks/useAuth.tsx`: Global auth context provider.
- `src/routes/login.tsx`: Login page component.

### Modified Files
- `src/routes/__root.tsx`: Add AuthProvider.
- `src/components/layout/AppSidebar.tsx`: Real user data and logout logic.
- `src/components/layout/AppHeader.tsx`: Real user initials.
- `src/routes/index.tsx`: Dashboard protection.
- `src/routes/licencas-xforge.tsx`: API token usage.

### Supabase Integration
```typescript
// Login logic
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Logout logic
await supabase.auth.signOut();
```
