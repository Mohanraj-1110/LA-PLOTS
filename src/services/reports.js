import { collection, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

const emptyData = () => ({ plots: [], customers: [], appointments: [], sales: [] })

export function subscribeToReports(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange(emptyData())
    return () => undefined
  }
  const data = emptyData()
  const collections = Object.keys(data)
  const unsubscribes = collections.map((name) =>
    onSnapshot(
      collection(db, name),
      (snapshot) => {
        data[name] = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        onChange({ ...data })
      },
      onError
    )
  )
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
}

export function reportDate(value) {
  if (value && typeof value === 'object' && 'toDate' in value) return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export function withinRange(row, from, to) {
  const date = reportDate(row.saleDate || row.createdAt || row.date)
  if (!date) return !from && !to
  return (
    (!from || date >= new Date(`${from}T00:00:00`)) &&
    (!to || date <= new Date(`${to}T23:59:59`))
  )
}
