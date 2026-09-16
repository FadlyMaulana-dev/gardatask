import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Megaphone, Briefcase, Database, UserCheck } from 'lucide-react'

export default function CrmLayout() {
  const location = useLocation()
  
  const tabs = [
    { label: 'Marketing Dashboard', path: '/crm/marketing', icon: Megaphone },
    { label: 'Director Dashboard', path: '/crm/dirut', icon: Briefcase },
    { label: 'Leads Pipeline', path: '/crm/leads', icon: UserCheck },
    { label: 'Scraping Center', path: '/crm/scraping', icon: Database },
  ]

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Top Header & Tabbars */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Core
              </button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 border-l pl-4 border-gray-200">Marketing CRM</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 flex items-center gap-6 mt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            // Check active state exactly or starts with for nested routes like /crm/leads/:id
            const isActive = location.pathname === tab.path || (tab.path !== '/crm/marketing' && location.pathname.startsWith(tab.path))

            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className={`pb-3 flex items-center gap-2 border-b-2 font-medium transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  )
}
