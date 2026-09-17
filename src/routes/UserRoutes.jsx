import React from 'react'
import { Route } from 'react-router-dom'
import { UserLayout } from '../components/user/UserLayout'
import { Home } from '../pages/user/Home'
import { Browse } from '../pages/user/Browse'
import { PlotDetails } from '../pages/user/PlotDetails'
import { Wishlist } from '../pages/user/Wishlist'
import { MyAppointments } from '../pages/user/MyAppointments'
import { Profile } from '../pages/user/Profile'
import { Enquiry } from '../pages/user/Enquiry'
import { Reviews } from '../pages/user/Reviews'
import { Contact } from '../pages/user/Contact'

export function getUserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route index element={<Home />} />
      <Route path="plots" element={<Browse />} />
      <Route path="plots/:plotId" element={<PlotDetails />} />
      <Route path="wishlist" element={<Wishlist />} />
      <Route path="appointments" element={<MyAppointments />} />
      <Route path="profile" element={<Profile />} />
      <Route path="enquiry" element={<Enquiry />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="contact" element={<Contact />} />
    </Route>
  )
}

export default getUserRoutes
