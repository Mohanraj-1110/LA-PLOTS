import { useEffect, useState } from 'react'

export function useFirestore(subscribeFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeFn(
      (result) => {
        setData(result)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, deps)

  return { data, loading, error }
}
