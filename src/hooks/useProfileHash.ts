import { useEffect, useState } from 'react'

export function useProfileHash(): boolean {
  const [onProfile, setOnProfile] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.location.hash === '#profile'
  })

  useEffect(() => {
    function sync() {
      setOnProfile(window.location.hash === '#profile')
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return onProfile
}
