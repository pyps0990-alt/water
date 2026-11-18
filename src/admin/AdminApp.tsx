import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, signInWithPopup, signInWithCredential, signOut, GoogleAuthProvider, type User } from 'firebase/auth'
import { CalendarDays, ClipboardList, LogOut, Settings, Wrench } from 'lucide-react'
import { getAuthInstance, googleProvider } from '../lib/firebaseExtras'
import { isFirebaseConfigured, useEmulators } from '../lib/firebase'
import { btnAccent, btnPrimary } from '../components/ui'
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
      <Centered>
        <h1 className="text-2xl font-black">管理後台</h1>
        {gate === 'denied' ? (
          <>
            <p role="alert" className="font-bold text-closed">{user?.email} 沒有管理權限。</p>
            <button className={btnPrimary} onClick={() => signOut(getAuthInstance())}>改用其他帳號</button>
          </>
        ) : (
          <>
            <p className="text-ink-muted">請使用已授權的 Google 帳號登入。</p>
            <button className={btnAccent} onClick={login}>使用 Google 登入</button>
            {useEmulators && <button className={btnPrimary} onClick={emulatorLogin}>模擬器測試登入</button>}
            {error && <p role="alert" className="text-closed">{error}</p>}
          </>
        )}
      </Centered>
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
    `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 px-3 text-sm font-bold md:flex-row md:gap-2 md:flex-none ${isActive ? 'text-busy-dk' : 'text-white'}`
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-copper bg-navy px-4 py-2 text-white">
        <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center border-2 border-copper"><Wrench className="h-4 w-4 text-copper" /></span>
        <span className="font-black">管理後台</span>
        <nav aria-label="後台導覽" className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-copper bg-navy md:static md:ml-6 md:border-0">
          <NavLink end to="/admin" className={tab}><ClipboardList aria-hidden className="h-5 w-5" />案件</NavLink>
          <NavLink to="/admin/schedule" className={tab}><CalendarDays aria-hidden className="h-5 w-5" />檔期</NavLink>
          <NavLink to="/admin/settings" className={tab}><Settings aria-hidden className="h-5 w-5" />設定</NavLink>
        </nav>
        <button onClick={() => signOut(getAuthInstance())} className="ml-auto inline-flex min-h-11 items-center gap-1 text-sm" aria-label="登出">
          <LogOut aria-hidden className="h-4 w-4" /><span className="hidden sm:inline">{user?.email}</span>
        </button>
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
  return <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">{children}</main>
}
