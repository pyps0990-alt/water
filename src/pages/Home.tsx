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
import type { Source } from '../types/models'

export default function Home() {
  const { settings, reviews } = useSiteData()
  const schedule = useSchedule(settings.maxWeeklyCases)
  const [source] = useState<Source>(() => captureSource())
  const c = settings.companyInfo

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
        <Hero settings={settings} reviews={reviews} />
        <Reviews reviews={reviews} fallbackUrl={settings.googleReviewUrl} />
        <Services />
        <Unaccepted items={settings.unacceptedServices} />
        <Process />
        <ScheduleBoard maxWeeklyCases={settings.maxWeeklyCases} notice={settings.publicNotice} {...schedule} />
        <SurveyForm source={source} weekFull={schedule.thisWeekFull} />
        <StatusLookup />
      </main>
      <footer className="bg-navy pb-24 pt-8 text-slate-200 md:pb-8">
        <div className="mx-auto max-w-5xl space-y-1 px-4">
          <p className="font-bold text-white">{c.name}</p>
          {c.taxId && <p>統一編號：{c.taxId}</p>}
          {c.phone && <p>電話：<a className="underline" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a></p>}
          <p>{c.address}</p>
          {c.lineOfficialUrl && <p><a className="inline-flex min-h-11 items-center underline" href={c.lineOfficialUrl}>加入 LINE 官方帳號</a></p>}
        </div>
      </footer>
      <MobileActionBar />
    </>
  )
}
