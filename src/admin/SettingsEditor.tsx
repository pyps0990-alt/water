import { useEffect, useState } from 'react'
import { btnPrimary, inputCls } from '../components/ui'
import { DEFAULT_SETTINGS } from '../hooks/useSiteData'
import { compressPhoto } from '../lib/submitCase'
import { fileUrl, uploadFile } from '../lib/firebaseExtras'
import type { SystemSettings } from '../types/models'
import { getSettings, saveSettings } from './api'
import { Card } from './shared'

export function SettingsEditor() {
  const [s, setS] = useState<SystemSettings | null>(null)
  const [unaccepted, setUnaccepted] = useState('')
  const [licenses, setLicenses] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getSettings().then((d) => {
      const merged = { ...DEFAULT_SETTINGS, ...d, companyInfo: { ...DEFAULT_SETTINGS.companyInfo, ...d.companyInfo } }
      setS(merged)
      setUnaccepted(merged.unacceptedServices.join('\n'))
      setLicenses(merged.licenses.map((l) => `${l.name}｜${l.certId}`).join('\n'))
    })
  }, [])
  if (!s) return <p role="status">載入中…</p>

  const ci = s.companyInfo
  const setCI = (k: keyof typeof ci) => (e: { target: { value: string } }) => setS({ ...s, companyInfo: { ...ci, [k]: e.target.value } })
  const field = (k: keyof typeof ci, label: string, mono = false) => (
    <label className="block font-bold">{label}<input className={`${inputCls} ${mono ? 'font-mono' : ''}`} value={ci[k]} onChange={setCI(k)} /></label>
  )

  async function save() {
    const patch: Partial<SystemSettings> = {
      companyInfo: ci,
      googleReviewUrl: s!.googleReviewUrl ?? '',
      unacceptedServices: unaccepted.split('\n').map((x) => x.trim()).filter(Boolean),
      licenses: licenses.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => {
        const [name, certId = ''] = x.split(/[｜|]/).map((y) => y.trim())
        return { name, certId }
      }),
    }
    try { await saveSettings(patch); setMsg('設定已儲存') } catch (e) { setMsg(`儲存失敗：${(e as Error).message}`) }
  }

  async function uploadWatermark(f?: File) {
    if (!f) return
    setMsg('上傳浮水印中…')
    try {
      const c = await compressPhoto(f)
      await uploadFile('branding/watermark.webp', c, 'image/webp')
      const watermarkUrl = await fileUrl('branding/watermark.webp')
      await saveSettings({ watermarkUrl })
      setS({ ...s!, watermarkUrl })
      setMsg('浮水印已更新')
    } catch (e) { setMsg(`上傳失敗：${(e as Error).message}`) }
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-black">公司設定</h1>
      <Card className="grid gap-3 sm:grid-cols-2">
        {field('name', '工作室名稱')}
        {field('taxId', '統一編號', true)}
        {field('phone', '電話', true)}
        {field('address', '服務據點／地址')}
        <div className="sm:col-span-2">{field('bankAccount', '匯款帳號（銀行代碼＋帳號）', true)}</div>
        {field('lineOfficialUrl', 'LINE 官方帳號連結', true)}
        <label className="block font-bold">Google 評論連結
          <input className={`${inputCls} font-mono`} value={s.googleReviewUrl ?? ''} onChange={(e) => setS({ ...s, googleReviewUrl: e.target.value })} />
        </label>
      </Card>
      <Card className="grid gap-3 sm:grid-cols-2">
        <label className="block font-bold">未承接項目（一行一項）
          <textarea rows={5} className={inputCls} value={unaccepted} onChange={(e) => setUnaccepted(e.target.value)} />
        </label>
        <label className="block font-bold">證照（一行一張：名稱｜證號）
          <textarea rows={5} className={`${inputCls} font-mono`} value={licenses} onChange={(e) => setLicenses(e.target.value)} placeholder="乙級室內配線技術士｜123-456789" />
        </label>
      </Card>
      <Card>
        <p className="font-bold">報價單浮水印</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {s.watermarkUrl ? <img src={s.watermarkUrl} alt="目前的浮水印" className="h-20 w-20 border border-slate-400 object-contain" /> : <span className="text-ink-muted">未設定（將以工作室名稱代替）</span>}
          <label className={`${btnPrimary} cursor-pointer`}>上傳圖片（建議透明背景 PNG）
            <input type="file" accept="image/png,image/webp,image/jpeg" className="sr-only" onChange={(e) => uploadWatermark(e.target.files?.[0])} />
          </label>
        </div>
      </Card>
      <div className="sticky bottom-16 flex items-center gap-3 border-t-2 border-navy bg-surface/95 py-3 md:bottom-0">
        <button className={btnPrimary} onClick={save}>儲存設定</button>
        <span aria-live="polite" className="font-bold">{msg}</span>
      </div>
    </div>
  )
}
