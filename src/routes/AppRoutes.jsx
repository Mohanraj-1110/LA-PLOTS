import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routePaths';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { UserLayout } from '../components/user/UserLayout';
import { LoadingSpinner } from '../components/common/LoadingState';

// Public Customer Portal Pages
import { Home } from '../pages/user/Home';
import { Browse } from '../pages/user/Browse';
import { PlotDetails } from '../pages/user/PlotDetails';
import { Wishlist } from '../pages/user/Wishlist';
import { MyAppointments } from '../pages/user/MyAppointments';
import { Profile } from '../pages/user/Profile';
import { Enquiry } from '../pages/user/Enquiry';
import { Reviews } from '../pages/user/Reviews';
import { Contact } from '../pages/user/Contact';
import { EmiCalculator } from '../pages/user/EmiCalculator';
import { Faq } from '../pages/user/Faq';

// Public Authentication Pages
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage || m.default }))
);
const SignupPage = lazy(() =>
  import('../pages/auth/SignupPage').then((m) => ({ default: m.SignupPage || m.Signup || m.default }))
);
const ForgotPasswordPage = lazy(() =>
  import('../pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage || m.default }))
);
const ResetPasswordPage = lazy(() =>
  import('../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage || m.default }))
);

// Admin Management Pages (Code-split for maximum performance)
const DashboardPage = lazy(() =>
  import('../pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage || m.default }))
);

// Plots CRUD
const PlotListPage = lazy(() =>
  import('../pages/plots/PlotListPage').then((m) => ({ default: m.PlotListPage || m.default }))
);
const AddPlotPage = lazy(() =>
  import('../pages/plots/AddPlotPage').then((m) => ({ default: m.AddPlotPage || m.default }))
);
const PlotDetailsPage = lazy(() =>
  import('../pages/plots/PlotDetailsPage').then((m) => ({ default: m.PlotDetailsPage || m.default }))
);
const EditPlotPage = lazy(() =>
  import('../pages/plots/EditPlotPage').then((m) => ({ default: m.EditPlotPage || m.default }))
);

// Customers CRM
const CustomerListPage = lazy(() =>
  import('../pages/customers/CustomerListPage').then((m) => ({ default: m.CustomerListPage || m.default }))
);
const AddCustomerPage = lazy(() =>
  import('../pages/customers/AddCustomerPage').then((m) => ({ default: m.AddCustomerPage || m.default }))
);
const CustomerDetailsPage = lazy(() =>
  import('../pages/customers/CustomerDetailsPage').then((m) => ({ default: m.CustomerDetailsPage || m.default }))
);
const EditCustomerPage = lazy(() =>
  import('../pages/customers/EditCustomerPage').then((m) => ({ default: m.EditCustomerPage || m.default }))
);

// Appointments
const AppointmentListPage = lazy(() =>
  import('../pages/appointments/AppointmentListPage').then((m) => ({ default: m.AppointmentListPage || m.default }))
);
const AddAppointmentPage = lazy(() =>
  import('../pages/appointments/AddAppointmentPage').then((m) => ({ default: m.AddAppointmentPage || m.default }))
);

// Business Intelligence & Operations
const SalesProfitPage = lazy(() =>
  import('../pages/sales/SalesProfitPage').then((m) => ({ default: m.SalesProfitPage || m.default }))
);
const DocumentListPage = lazy(() =>
  import('../pages/documents/DocumentListPage').then((m) => ({ default: m.DocumentListPage || m.default }))
);
const EnquiryListPage = lazy(() =>
  import('../pages/enquiries/EnquiryListPage').then((m) => ({ default: m.EnquiryListPage || m.default }))
);
const ReportsPage = lazy(() =>
  import('../pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage || m.default }))
);
const UsersPage = lazy(() =>
  import('../pages/users/UsersPage').then((m) => ({ default: m.UsersPage || m.Users || m.default }))
);
const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage || m.default }))
);
const AboutPage = lazy(() =>
  import('../pages/about/AboutPage').then((m) => ({ default: m.AboutPage || m.default }))
);
const MobileMorePage = lazy(() =>
  import('../pages/more/MobileMorePage').then((m) => ({ default: m.MobileMorePage || m.default }))
);

// Agent Management Pages (Property Details Only, Zero Sales/Amounts)
const AgentLayout = lazy(() =>
  import('../components/agent/AgentLayout').then((m) => ({ default: m.AgentLayout || m.default }))
);
const AgentDashboardPage = lazy(() =>
  import('../pages/agent/AgentDashboardPage').then((m) => ({ default: m.AgentDashboardPage || m.default }))
);
const AgentPlotsPage = lazy(() =>
  import('../pages/agent/AgentPlotsPage').then((m) => ({ default: m.AgentPlotsPage || m.default }))
);
const AgentAppointmentsPage = lazy(() =>
  import('../pages/agent/AgentAppointmentsPage').then((m) => ({ default: m.AgentAppointmentsPage || m.default }))
);
const AgentEnquiriesPage = lazy(() =>
  import('../pages/agent/AgentEnquiriesPage').then((m) => ({ default: m.AgentEnquiriesPage || m.default }))
);

// Dedicated Distinct Customer / User Dashboard
const UserDashboard = lazy(() =>
  import('../pages/user/UserDashboard').then((m) => ({ default: m.UserDashboard || m.default }))
);

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner text="Loading module..." />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Authentication routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Protected Field Agent Operations Portal (Property details only, zero sales amounts) */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={['agent', 'admin']}>
              <AgentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AgentDashboardPage />} />
          <Route path="plots" element={<AgentPlotsPage />} />
          <Route path="appointments" element={<AgentAppointmentsPage />} />
          <Route path="enquiries" element={<AgentEnquiriesPage />} />
        </Route>

        {/* Protected Admin Management Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Admin Plots */}
          <Route path="plots" element={<PlotListPage />} />
          <Route path="plots/new" element={<AddPlotPage />} />
          <Route path="plots/:id" element={<PlotDetailsPage />} />
          <Route path="plots/:id/edit" element={<EditPlotPage />} />

          {/* Admin Customers */}
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/new" element={<AddCustomerPage />} />
          <Route path="customers/:id" element={<CustomerDetailsPage />} />
          <Route path="customers/:id/edit" element={<EditCustomerPage />} />

          {/* Admin Appointments */}
          <Route path="appointments" element={<AppointmentListPage />} />
          <Route path="appointments/new" element={<AddAppointmentPage />} />

          {/* Admin Operations & Business Modules */}
          <Route path="sales" element={<SalesProfitPage />} />
          <Route path="documents" element={<DocumentListPage />} />
          <Route path="enquiries" element={<EnquiryListPage />} />
          <Route path="messages" element={<Navigate to="/admin" replace />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="more" element={<MobileMorePage />} />
        </Route>

        {/* Customer & Public Portal Routes */}
        <Route element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="user" element={<UserDashboard />} />
          <Route path="customer" element={<Navigate to="/user" replace />} />
          <Route path="plots" element={<Browse />} />
          <Route path="plots/:plotId" element={<PlotDetails />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="profile" element={<Profile />} />
          <Route path="enquiry" element={<Enquiry />} />
          <Route path="emi" element={<EmiCalculator />} />
          <Route path="faq" element={<Faq />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
