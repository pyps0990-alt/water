import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore/lite'
import { getDb, isFirebaseConfigured } from '../lib/firebase'
import type { ReviewsCache, SystemSettings } from '../types/models'

export const DEFAULT_SETTINGS: SystemSettings = {
  maxWeeklyCases: 5,
  companyInfo: {
    name: '水電工程工作室',
    taxId: '',
    phone: '',
    address: '基隆／台北服務據點',
    bankAccount: '',
    lineOfficialUrl: '',
  },
  watermarkUrl: '',
  unacceptedServices: ['高壓工業變電站工程', '公共場所消防安全設備簽證'],
  licenses: [],
}

export function useSiteData() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS)
  const [reviews, setReviews] = useState<ReviewsCache | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const db = getDb()
    getDoc(doc(db, 'system_settings/global'))
      .then((d) => {
        if (!d.exists()) return
        const data = d.data() as Partial<SystemSettings>
        setSettings({ ...DEFAULT_SETTINGS, ...data, companyInfo: { ...DEFAULT_SETTINGS.companyInfo, ...data.companyInfo } })
      })
      .catch(() => {})
    getDoc(doc(db, 'system_settings/reviews'))
      .then((d) => d.exists() && setReviews(d.data() as ReviewsCache))
      .catch(() => {})
  }, [])

  return { settings, reviews }
}
