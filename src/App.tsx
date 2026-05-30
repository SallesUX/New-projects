import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import History from './pages/History'
import Analysis from './pages/Analysis'
import Admin from './pages/Admin'
import Profile from './pages/Profile'

const navItems = [
  { to: '/', label: 'Início', icon: HomeIcon },
  { to: '/registrar', label: 'Registrar', icon: PlusIcon },
  { to: '/historico', label: 'Histórico', icon: ListIcon },
  { to: '/analise', label: 'Análise', icon: ChartIcon },
  { to: '/perfil', label: 'Perfil', icon: PersonIcon },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F5F8FF] overflow-x-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/registrar" element={<Register />} />
            <Route path="/registrar/:date" element={<Register />} />
            <Route path="/historico" element={<History />} />
            <Route path="/analise" element={<Analysis />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </main>

        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white flex flex-col"
          style={{ boxShadow: '0 -4px 24px rgba(124,58,237,0.10)' }}
        >
          <div className="flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 font-medium transition-colors duration-200"
                style={{ fontSize: 10 }}
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex items-center justify-center w-9 h-8">
                      {isActive && (
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'rgba(124,58,237,0.13)' }}
                        />
                      )}
                      <Icon className={`w-5 h-5 relative ${isActive ? 'text-brand-purple' : 'text-text-muted'}`} />
                    </div>
                    <span className={isActive ? 'text-brand-purple' : 'text-text-muted'}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className="flex justify-center pb-1">
            <Link
              to="/admin"
              className="text-[9px] text-text-muted hover:text-text-secondary transition-colors px-3 py-0.5"
            >
              admin
            </Link>
          </div>
        </nav>
      </div>
    </BrowserRouter>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
