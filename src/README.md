# Blurry Admin Panel

A complete React.js admin interface for the Blurry dating app, ported from the Laravel get-journey-tours admin template.

## Features

- **Dashboard**: Statistics cards, user management overview, and key metrics
- **Plans Management**: Create, edit, and manage subscription plans
- **Email Templates**: Manage email templates for notifications and communications
- **Settings**: Configure SMTP, privacy policy, terms & conditions, and other app settings
- **Authentication**: Secure login/logout with JWT token management
- **Responsive Layout**: Mobile-friendly design with collapsible sidebar
- **Protected Routes**: Role-based access control for admin functions

## File Structure

```
src/admin/
├── assets/
│   └── css/
│       └── admin.css           # Custom admin styles
├── components/
│   └── layout/
│       ├── Sidebar.tsx         # Navigation sidebar
│       ├── Topbar.tsx          # Top navigation bar
│       └── Footer.tsx          # Footer component
├── context/
│   └── AdminContext.tsx        # Global admin state management
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── layouts/
│   └── AdminLayout.tsx         # Main admin layout wrapper
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx       # Admin login page
│   ├── dashboard/
│   │   └── Dashboard.tsx       # Main dashboard
│   ├── plans/
│   │   └── PlansPage.tsx       # Subscription plans management
│   ├── email-templates/
│   │   └── EmailTemplatesPage.tsx
│   └── settings/
│       └── SettingsPage.tsx    # System settings
├── routes/
│   └── AdminRoutes.tsx         # Admin routing configuration
├── services/
│   ├── api.ts                  # Axios configuration
│   ├── auth.service.ts         # Authentication API calls
│   ├── plans.service.ts        # Plans API calls
│   ├── emailTemplates.service.ts
│   └── settings.service.ts     # Settings API calls
├── utils/
│   └── helpers.ts              # Utility functions
└── index.tsx                   # Admin app entry point
```

## Routes

The admin panel is accessible under `/blurry-admin/*` and includes:

- `/blurry-admin/login` - Login page
- `/blurry-admin/` - Dashboard (default)
- `/blurry-admin/dashboard` - Dashboard
- `/blurry-admin/plans` - Plans management
- `/blurry-admin/email-templates` - Email templates
- `/blurry-admin/settings` - System settings

## API Integration

The admin panel connects to the backend API at `/api/admin/v1/` endpoints:

- Authentication: `/api/admin/v1/auth/*`
- Plans: `/api/admin/v1/plans/*`
- Email Templates: `/api/admin/v1/email-templates/*`
- Settings: `/api/admin/v1/settings/*`

## Environment Variables

Configure these in your `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Blurry Admin
VITE_APP_VERSION=1.0.0
```

## Usage

### Development

The admin panel is integrated into the main React app routing system. Start the development server:

```bash
npm run dev
```

Navigate to `http://localhost:5173/blurry-admin/` to access the admin panel.

### Default Login Credentials

For development, you can use:
- Email: admin@blurry.com  
- Password: 123456

### State Management

The admin uses React Context for state management:

```tsx
import { useAdmin } from './admin/context/AdminContext';

const { state, dispatch } = useAdmin();
// state.user, state.isAuthenticated, state.loading, etc.
```

### Authentication

Protected routes automatically redirect to login if not authenticated:

```tsx
import { useAuth } from './admin/hooks/useAuth';

const { login, logout, user, isAuthenticated } = useAuth();
```

### API Services

All API calls are centralized in service files:

```tsx
import { authService } from './admin/services/auth.service';
import { plansService } from './admin/services/plans.service';

// Login
const response = await authService.login({ email, password });

// Get plans
const plans = await plansService.getAll();
```

## Styling

The admin panel uses custom CSS based on the Laravel admin template, with Bootstrap-style classes for consistency. Key features:

- Responsive layout with collapsible sidebar
- Consistent color scheme and typography
- Custom card components and form styling
- Loading states and animations

## Integration with Existing Project

The admin panel is integrated into the main app's routing system in:

- `src/routes/router.tsx` - Main router configuration
- `src/routes/router.link.tsx` - Route definitions
- `src/routes/blurryAdminFeature.tsx` - Admin feature wrapper

The admin runs independently within the main app, handling its own routing and state management while sharing the overall application structure.