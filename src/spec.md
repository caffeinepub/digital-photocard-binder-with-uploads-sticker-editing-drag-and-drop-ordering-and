# Specification

## Summary
**Goal:** Implement a secure Master Admin Key system for the Admin Portal, add a User Oversight Table with user management capabilities, and enable dynamic binder grid layouts with user-configurable presets.

**Planned changes:**
- Store Master Admin Key in backend (default: '7vX#2kL!m9$Q') and add key verification prompt on /admin-portal route
- Add Master Admin Key change functionality and 30-minute inactivity timeout to Admin Portal
- Create User Oversight Table displaying User Email, Join Date, Subscription Status, and Total Cards Collected
- Add search bar to filter users by email in User Oversight Table
- Implement 'View Binder' button for read-only access to user collections
- Style User Oversight Table with zebra stripes, bold headers, and color-coded subscription status (Pro: green, Free: gray)
- Add manual subscription status update capability for admin
- Add 'Binder View' dropdown in User Settings with grid layout options: '2x2', '3x3', '4x3', '5x4'
- Save user's grid layout preference in backend user profile
- Update Gallery View (BinderViewScreen) to dynamically render cards in CSS Grid based on saved preference
- Ensure card images auto-resize to fit grid dimensions while maintaining aspect ratio
- Add 'Global Layout Options' section in Admin Portal to manage available grid presets
- Enable admin to add/remove grid presets and set a 'Default Layout' for new users

**User-visible outcome:** Admin can securely access the Admin Portal with a Master Admin Key, view and manage all users in a searchable table, inspect user collections in read-only mode, and manually adjust subscription statuses. Users can customize their binder view by selecting from multiple grid layout options in User Settings. Admin can configure which layout presets are available and set the default for new users.
