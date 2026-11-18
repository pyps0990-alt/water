import { useEffect, useState } from 'react'
import { Header, MobileActionBar } from '../components/Header'
import { Hero } from '../sections/Hero'
import { Reviews } from '../sections/Reviews'
import { Process, Services, Unaccepted } from '../sections/Services'
import { ScheduleBoard } from '../sections/ScheduleBoard'
import { SurveyForm } from '../sections/SurveyForm'
import { StatusLookup } from '../sections/StatusLookup'
import { useSiteData } from '../hooks/useSiteData'
import { useSchedule } from '../hooks/useSchedule'
import { captureSource } from '../lib/source'
import { useRevealFallback } from '../lib/motion'
import { isFirebaseConfigured } from '../lib/firebase'
import { weekStart } from '../lib/dates'
import type { Source } from '../types/models'

export default function Home() {
  const { settings, reviews } = useSiteData()
  const schedule = useSchedule(settings.maxWeeklyCases)
  const [source] = useState<Source>(() => captureSource())
  const c = settings.companyInfo
  useRevealFallback(settings)

  // Live capacity for the hero badge (null until schedule data arrives).
  const remaining = !isFirebaseConfigured || schedule.loading ? null
    : Math.max(0, settings.maxWeeklyCases - (schedule.weekBooked[weekStart(schedule.today)] ?? 0))

  // Deep links from LINE rich menu: /?source=line#book
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
  }, [])

  return (
    <>
      <a href="#main" className="sr-only z-50 bg-surface p-3 focus:not-sr-only focus:fixed focus:left-2 focus:top-2">跳到主要內容</a>
      <Header name={c.name} />
      <main id="main" className="pb-20 md:pb-0">
        <Hero settings={settings} reviews={reviews} remaining={remaining} />
        <Reviews reviews={reviews} fallbackUrl={settings.googleReviewUrl} />
        <Services />
        <Unaccepted items={settings.unacceptedServices} />
        <Process />
        <ScheduleBoard maxWeeklyCases={settings.maxWeeklyCases} notice={settings.publicNotice} {...schedule} />
        <SurveyForm source={source} weekFull={schedule.thisWeekFull} />
        <StatusLookup />
      </main>
      <footer className="bp-grid pb-24 pt-10 text-slate-200 md:pb-10">
        <div className="mx-auto max-w-5xl px-4">
          <dl className="grid border-[1.5px] border-slate-400 font-mono text-sm sm:grid-cols-4">
            <div className="border-b border-slate-500 p-3 sm:col-span-2 sm:border-r">
              <dt className="text-xs text-slate-400">STUDIO</dt>
              <dd className="font-sans text-lg font-black text-white">{c.name}</dd>
            </div>
            <div className="border-b border-slate-500 p-3 sm:border-r">
              <dt className="text-xs text-slate-400">TAX ID 統編</dt><dd>{c.taxId || '—'}</dd>
            </div>
            <div className="border-b border-slate-500 p-3">
              <dt className="text-xs text-slate-400">TEL</dt>
              <dd>{c.phone ? <a className="underline" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a> : '—'}</dd>
            </div>
            <div className="p-3 sm:col-span-2 sm:border-r sm:border-slate-500">
              <dt className="text-xs text-slate-400">SERVICE AREA</dt><dd className="font-sans">{c.address}</dd>
            </div>
            <div className="p-3 sm:col-span-2">
              <dt className="text-xs text-slate-400">LINE</dt>
              <dd>{c.lineOfficialUrl ? <a className="inline-flex min-h-11 items-center font-sans underline" href={c.lineOfficialUrl}>加入 LINE 官方帳號</a> : '—'}</dd>
            </div>
          </dl>
        </div>
      </footer>
      <MobileActionBar />
    </>
  )
}
