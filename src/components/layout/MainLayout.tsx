import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-2 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 max-w-[1600px] mx-auto">
          {/* Sidebar - Más estrecho y pegado a la izquierda */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </aside>

          {/* Main Content - Ocupa más espacio */}
          <main className="lg:col-span-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
