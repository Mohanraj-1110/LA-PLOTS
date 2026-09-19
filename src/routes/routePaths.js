/**
 * Unified Application Route Constants
 * Bridges Public Portal (/) and Admin Management System (/admin/*)
 */
export const ROUTES = {
  // Public Customer Routes
  PUBLIC_HOME: '/',
  PUBLIC_PLOTS: '/plots',
  PUBLIC_PLOT_DETAILS: '/plots/:id',
  publicPlotDetailsPath: (id) => `/plots/${id}`,
  PUBLIC_WISHLIST: '/wishlist',
  PUBLIC_APPOINTMENTS: '/my-appointments',
  PUBLIC_PROFILE: '/profile',
  PUBLIC_ENQUIRY: '/enquiry',
  PUBLIC_EMI: '/emi',
  PUBLIC_FAQ: '/faq',
  PUBLIC_REVIEWS: '/reviews',
  PUBLIC_CONTACT: '/contact',
  USER_DASHBOARD: '/user',

  // Authentication Routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Agent Portal Routes (prefixed with /agent)
  AGENT_HOME: '/agent',
  AGENT_DASHBOARD: '/agent',
  AGENT_PLOTS: '/agent/plots',
  AGENT_APPOINTMENTS: '/agent/appointments',
  AGENT_ENQUIRIES: '/agent/enquiries',

  // Admin Portal Routes (prefixed with /admin)
  HOME: '/admin',
  DASHBOARD: '/admin',
  ADMIN_HOME: '/admin',

  // Projects Management
  PROJECTS: '/admin/projects',
  ADD_PROJECT: '/admin/projects/new',
  PROJECT_DETAILS: '/admin/projects/:id',
  projectDetailsPath: (id) => `/admin/projects/${id}`,
  EDIT_PROJECT: '/admin/projects/:id/edit',
  editProjectPath: (id) => `/admin/projects/${id}/edit`,

  // Plots Management
  PLOTS: '/admin/plots',
  ADD_PLOT: '/admin/plots/new',
  PLOT_DETAILS: '/admin/plots/:id',
  plotDetailsPath: (id) => `/admin/plots/${id}`,
  EDIT_PLOT: '/admin/plots/:id/edit',
  editPlotPath: (id) => `/admin/plots/${id}/edit`,

  // Customers & CRM
  CUSTOMERS: '/admin/customers',
  ADD_CUSTOMER: '/admin/customers/new',
  CUSTOMER_DETAILS: '/admin/customers/:id',
  customerDetailsPath: (id) => `/admin/customers/${id}`,
  EDIT_CUSTOMER: '/admin/customers/:id/edit',
  editCustomerPath: (id) => `/admin/customers/${id}/edit`,

  // Appointments Management
  APPOINTMENTS: '/admin/appointments',
  ADD_APPOINTMENT: '/admin/appointments/new',
  APPOINTMENT_DETAILS: '/admin/appointments/:id',
  appointmentDetailsPath: (id) => `/admin/appointments/${id}`,

  // Business Modules
  SALES: '/admin/sales',
  DOCUMENTS: '/admin/documents',
  ENQUIRIES: '/admin/enquiries',
  REPORTS: '/admin/reports',
  USERS: '/admin/users',
  SETTINGS: '/admin/settings',
  ABOUT: '/admin/about',
  MORE: '/admin/more',
};

export default ROUTES;
