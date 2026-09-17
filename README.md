# LA PLOTS

Unified real estate plot management platform built with React 19, Vite, Tailwind CSS, and Firebase.

## Project Structure

```
src/
  assets/
  components/
    common/        (Button, Modal, Toast, StatCard, StatusBadge, etc.)
    admin/         (AdminLayout, AdminSidebar, AdminHeader, AdminBottomNav)
    user/          (UserLayout, UserHeader, UserFooter, PlotCard, PlotMap)
  pages/
    admin/         (Dashboard, Plots, Customers, Appointments, Sales, Documents, Reports, Enquiries, Messages, Settings)
    user/          (Home, Browse, PlotDetails, Wishlist, MyAppointments, Profile, Enquiry, Reviews, Contact)
    auth/          (Login, Signup, ForgotPassword)
  routes/
    AdminRoutes.jsx
    UserRoutes.jsx
    ProtectedRoute.jsx
  firebase/
    config.js
  services/        (plots.js, customers.js, appointments.js, sales.js, documents.js, enquiries.js, wishlists.js, reviews.js, users.js, dashboard.js, reports.js, auth.js)
  hooks/           (useAuth.js, useFirestore.js)
  context/         (AuthContext.jsx)
  App.jsx
  main.jsx
  index.css
functions/         (Firebase Cloud Functions in JavaScript)
```

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
