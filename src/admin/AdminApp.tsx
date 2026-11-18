import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, signInWithPopup, signInWithCredential, signOut, GoogleAuthProvider, type User } from 'firebase/auth'
import { CalendarDays, ClipboardList, LogOut, Settings, Wrench } from 'lucide-react'
import { getAuthInstance, googleProvider } from '../lib/firebaseExtras'
import { isFirebaseConfigured, useEmulators } from '../lib/firebase'
import { btnAccent, btnOutlineLight } from '../components/ui'
import { SingleLineDiagram } from '../components/SingleLineDiagram'
import { listCases } from './api'
import { CaseList } from './CaseList'
import { CaseDetail } from './CaseDetail'
import { ScheduleManager } from './ScheduleManager'
import { SettingsEditor } from './SettingsEditor'
import { AdminPrint } from './AdminPrint'

type Gate = 'loading' | 'signed-out' | 'denied' | 'ok'

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null)
  const [gate, setGate] = useState<Gate>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(getAuthInstance(), async (u) => {
      setUser(u)
      if (!u) return setGate('signed-out')
      // Authorization is enforced by security rules; probe with a 1-doc read.
      try { await listCases(1); setGate('ok') } catch { setGate('denied') }
    })
  }, [])

  if (!isFirebaseConfigured) {
    return <Centered><p>Firebase 尚未設定，管理後台無法使用。</p></Centered>
  }
  if (gate === 'loading') return <Centered><p role="status">載入中…</p></Centered>
  if (gate !== 'ok') {
    const login = async () => {
      setError('')
      try { await signInWithPopup(getAuthInstance(), googleProvider) } catch (e) { setError((e as Error).message) }
    }
    const emulatorLogin = () => signInWithCredential(getAuthInstance(), GoogleAuthProvider.credential(
      JSON.stringify({ sub: 'admin1', email: 'admin1@gmail.com', email_verified: true })))
    return (
      <main className="bp-night grid min-h-screen place-items-center px-4 py-10 text-white">
        <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-2">
          <div className="enter-frame hidden md:block" style={{ '--d': '.1s' } as CSSProperties}>
            <div className="rounded-md border border-white/12 bg-[linear-gradient(160deg,rgb(30_43_74/0.85),rgb(11_20_40/0.85))] p-4"><SingleLineDiagram /></div>
          </div>
          <div className="enter rounded-md border border-white/12 bg-white/5 p-7 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] backdrop-blur" style={{ '--d': '.2s' } as CSSProperties}>
            <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-[image:var(--grad-copper)] shadow-[var(--glow-copper)]"><Wrench className="h-5 w-5 text-navy" /></span>
            <p className="mt-5 font-mono text-xs font-bold tracking-widest text-busy-dk">CONTROL ROOM · ADMIN</p>
            <h1 className="mt-1 text-3xl font-black">管理後台</h1>
            <div className="mt-6 grid gap-3">
              {gate === 'denied' ? (
                <>
                  <p role="alert" className="font-bold text-closed-dk">{user?.email} 沒有管理權限。</p>
                  <button className={btnOutlineLight} onClick={() => signOut(getAuthInstance())}>改用其他帳號</button>
                </>
              ) : (
                <>
                  <p className="text-slate-300">請使用已授權的 Google 帳號登入。</p>
                  <button className={btnAccent} onClick={login}>使用 Google 登入</button>
                  {useEmulators && <button className={btnOutlineLight} onClick={emulatorLogin}>模擬器測試登入</button>}
                  {error && <p role="alert" className="text-closed-dk">{error}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <Routes>
      <Route path="print/:id" element={<AdminPrint />} />
      <Route path="*" element={<Layout user={user} />} />
    </Routes>
  )
}

function Layout({ user }: { user: User | null }) {
  const tab = ({ isActive }: { isActive: boolean }) =>
    `relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 px-3 text-sm font-bold transition-colors md:flex-row md:gap-2 md:flex-none after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:bg-[image:var(--grad-copper)] after:transition-transform after:duration-300 ${isActive ? 'text-busy-dk after:scale-x-100' : 'text-slate-200 after:scale-x-0 hover:text-white'}`
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="glass-nav sticky top-0 z-30 text-white shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]">
       <div className="flex items-center gap-3 px-4 py-2">
        <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[image:var(--grad-copper)] shadow-[var(--glow-copper)]"><Wrench className="h-4 w-4 text-navy" /></span>
        <span className="font-black">管理後台<span className="ml-2 hidden font-mono text-xs font-bold tracking-widest text-slate-400 sm:inline">CONTROL ROOM</span></span>
        <nav aria-label="後台導覽" className="glass-nav fixed inset-x-0 bottom-0 z-30 flex border-t border-copper/60 pb-[env(safe-area-inset-bottom)] md:static md:ml-6 md:border-0 md:bg-transparent md:pb-0 md:backdrop-blur-none">
          <NavLink end viewTransition to="/admin" className={tab}><ClipboardList aria-hidden className="h-5 w-5" />案件</NavLink>
          <NavLink viewTransition to="/admin/schedule" className={tab}><CalendarDays aria-hidden className="h-5 w-5" />檔期</NavLink>
          <NavLink viewTransition to="/admin/settings" className={tab}><Settings aria-hidden className="h-5 w-5" />設定</NavLink>
        </nav>
        <span className="ml-auto hidden font-mono text-xs text-slate-400 lg:inline">{user?.email}</span>
        <button onClick={() => signOut(getAuthInstance())} className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-bold text-slate-200 transition-colors hover:text-white max-lg:ml-auto">
          <LogOut aria-hidden className="h-4 w-4" />登出
        </button>
       </div>
       <div aria-hidden className="copper-rule opacity-80" />
      </header>
      <main className="mx-auto max-w-6xl px-3 py-5 md:px-6">
        <Routes>
          <Route index element={<CaseList />} />
          <Route path="case/:id" element={<CaseDetail />} />
          <Route path="schedule" element={<ScheduleManager />} />
          <Route path="settings" element={<SettingsEditor />} />
        </Routes>
      </main>
    </div>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return <main className="bp-night flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center text-white">{children}</main>
}
