import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import StatusBar from '../ui/StatusBar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <StatusBar />
        <Outlet />
      </main>
    </div>
  )
}
