import React from 'react'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminLayout } from '../components/admin/AdminLayout'
import { Dashboard } from '../pages/admin/Dashboard'
import { Plots } from '../pages/admin/Plots'
import { Customers } from '../pages/admin/Customers'
import { Appointments } from '../pages/admin/Appointments'
import { Sales } from '../pages/admin/Sales'
import { Documents } from '../pages/admin/Documents'
import { Reports } from '../pages/admin/Reports'
import { Enquiries } from '../pages/admin/Enquiries'
import { Messages } from '../pages/admin/Messages'
import { Settings } from '../pages/admin/Settings'

export function getAdminRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={['admin', 'agent']} />}>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plots" element={<Plots />} />
        <Route path="plots/new" element={<Plots />} />
        <Route path="plots/:plotId" element={<Plots />} />
        <Route path="plots/:plotId/edit" element={<Plots />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/new" element={<Customers />} />
        <Route path="customers/:customerId" element={<Customers />} />
        <Route path="customers/:customerId/edit" element={<Customers />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/new" element={<Appointments />} />
        <Route path="appointments/:appointmentId" element={<Appointments />} />
        <Route path="appointments/:appointmentId/edit" element={<Appointments />} />
        <Route path="sales" element={<Sales />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Route>
  )
}

export default getAdminRoutes
