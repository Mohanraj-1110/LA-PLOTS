import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { initializeApp } from 'firebase-admin/app'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getAuth } from 'firebase-admin/auth'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()
const db = getFirestore()
const messaging = getMessaging()

export const inviteAgent = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.')
  const caller = await db.collection('users').doc(request.auth.uid).get()
  if (caller.data()?.role !== 'admin') throw new HttpsError('permission-denied', 'Only admins can invite agents.')
  const { name, email, temporaryPassword } = request.data || {}
  if (!name?.trim() || !email?.trim() || !temporaryPassword || temporaryPassword.length < 6) {
    throw new HttpsError('invalid-argument', 'Name, email, and a 6+ character temporary password are required.')
  }
  const user = await getAuth().createUser({ displayName: name.trim(), email: email.trim(), password: temporaryPassword })
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    name: name.trim(),
    email: email.trim(),
    phone: '',
    role: 'agent',
    photoURL: '',
    createdAt: FieldValue.serverTimestamp(),
  })
  return { uid: user.uid }
})

export const sendAppointmentReminders = onSchedule({ schedule: '0 8 * * *', timeZone: 'Asia/Kolkata' }, async () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  const todayKey = start.toISOString().slice(0, 10)
  const appointments = await db.collection('appointments').where('date', '>=', Timestamp.fromDate(start)).where('date', '<', Timestamp.fromDate(end)).get()

  await Promise.all(appointments.docs.map(async (appointment) => {
    const data = appointment.data()
    if (data.status === 'completed' || data.status === 'cancelled' || data.reminderSentDate === todayKey) return
    const notification = {
      userId: data.customerId,
      title: 'Appointment reminder',
      message: `${data.type ?? 'Appointment'} scheduled at ${data.time ?? 'the planned time'}.`,
      type: 'appointment_reminder',
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    }
    await db.collection('notifications').add(notification)
    const customer = await db.collection('users').doc(data.customerId).get()
    const token = customer.data()?.fcmToken
    if (token) await messaging.send({ token, notification: { title: notification.title, body: notification.message } })
    await appointment.ref.update({ reminderSentDate: todayKey })
  }))
})
