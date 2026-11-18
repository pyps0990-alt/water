import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QuoteDocument } from '../print/QuoteDocument'
import { PrintShell } from '../print/PrintShell'
import { DEFAULT_SETTINGS } from '../hooks/useSiteData'
import type { SystemSettings } from '../types/models'
import { getCase, getSettings, type CaseRow } from './api'

export function AdminPrint() {
  const { id = '' } = useParams()
  const [c, setC] = useState<CaseRow | null | undefined>()
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS)
  useEffect(() => {
    getCase(id).then(setC).catch(() => setC(null))
    getSettings().then((d) => setSettings({ ...DEFAULT_SETTINGS, ...d, companyInfo: { ...DEFAULT_SETTINGS.companyInfo, ...d.companyInfo } }))
  }, [id])

  if (c === undefined) return <p role="status" className="p-6">載入中…</p>
  if (!c?.quotation) return <p role="alert" className="p-6">此案件尚無報價單。<a className="underline" href={`/admin/case/${id}`}>返回案件</a></p>
  const ci = c.clientInfo
  return (
    <PrintShell backHref={`/admin/case/${id}`} backLabel="返回案件">
      <QuoteDocument quote={c.quotation} company={settings.companyInfo} watermarkUrl={settings.watermarkUrl || undefined}
        client={{ name: ci.name, phone: ci.phone, address: `${ci.district}${ci.address}` }} />
    </PrintShell>
  )
}
