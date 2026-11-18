import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'

const QuotePrintPage = lazy(() => import('./pages/QuotePrintPage'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<p className="p-6">載入中…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/print/demo" element={<QuotePrintPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
