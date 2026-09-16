import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import { FinanceProvider } from './context/FinanceContext'
import { CrmProvider } from './context/CrmContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'

// Preloader for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      <p className="mt-4 text-sm font-medium text-slate-500">Loading module...</p>
    </div>
  </div>
)

// Code Splitting (Lazy Loading) - Reduces Initial Bundle Size Drastically
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const KanbanPage = lazy(() => import('./pages/KanbanPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const YearlyPlannerPage = lazy(() => import('./pages/YearlyPlannerPage'))
const TaskHistoryPage = lazy(() => import('./pages/TaskHistoryPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AcceptInvite = lazy(() => import('./pages/AcceptInvite'))
const SosmedCalendar = lazy(() => import('./pages/SosmedCalendar'))
const PayrollPage = lazy(() => import('./pages/PayrollPage'))

// Finance Pages
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'))
const InvoiceList = lazy(() => import('./pages/finance/InvoiceList'))
const CreateInvoice = lazy(() => import('./pages/finance/CreateInvoice'))
const EditInvoice = lazy(() => import('./pages/finance/EditInvoice'))
const InvoiceDetail = lazy(() => import('./pages/finance/InvoiceDetail'))
const CashFlow = lazy(() => import('./pages/finance/CashFlow'))
const FinanceReports = lazy(() => import('./pages/finance/FinanceReports'))

// CRM Pages
const MarketingDashboard = lazy(() => import('./pages/crm/MarketingDashboard'))
const DashboardDirut = lazy(() => import('./pages/crm/DashboardDirut'))
const ScrapingCenter = lazy(() => import('./pages/crm/ScrapingCenter'))
const LeadsManagement = lazy(() => import('./pages/crm/LeadsManagement'))
const LeadDetail = lazy(() => import('./pages/crm/LeadDetail'))
const CrmLayout = lazy(() => import('./pages/crm/CrmLayout'))

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <FinanceProvider>
            <CrmProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Route */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/invite/:token" element={<AcceptInvite />} />

                  {/* Protected Routes — Core (accessible by all roles) */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                  <Route path="/projects/:projectId" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                  <Route path="/yearly-planner" element={<ProtectedRoute><YearlyPlannerPage /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><TaskHistoryPage /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                  {/* Team — Project Manager only */}
                  <Route path="/team" element={<ProtectedRoute><RoleGuard allowedRoles={['project_manager']}><TeamPage /></RoleGuard></ProtectedRoute>} />

                  {/* Sosmed — Social Media Specialist + PM */}
                  <Route path="/sosmed" element={<ProtectedRoute><RoleGuard allowedRoles={['sosmed']}><SosmedCalendar /></RoleGuard></ProtectedRoute>} />

                  {/* Payroll — Project Manager and Finance */}
                  <Route path="/payroll" element={<ProtectedRoute><RoleGuard allowedRoles={['project_manager', 'finance']}><PayrollPage /></RoleGuard></ProtectedRoute>} />

                  {/* Finance Routes — Finance role + PM */}
                  <Route path="/finance" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><FinanceDashboard /></RoleGuard></ProtectedRoute>} />
                  <Route path="/finance/invoices" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><InvoiceList /></RoleGuard></ProtectedRoute>} />
                  <Route path="/finance/invoices/create" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><CreateInvoice /></RoleGuard></ProtectedRoute>} />
                  <Route path="/finance/invoices/:invoiceId/edit" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><EditInvoice /></RoleGuard></ProtectedRoute>} />
                  <Route path="/finance/invoices/:invoiceId" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><InvoiceDetail /></RoleGuard></ProtectedRoute>} />
                  <Route path="/finance/cashflow" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><CashFlow /></RoleGuard></ProtectedRoute>} />
                  <Route path="/finance/reports" element={<ProtectedRoute><RoleGuard allowedRoles={['finance']}><FinanceReports /></RoleGuard></ProtectedRoute>} />

                  {/* CRM Routes — Marketing role + PM */}
                  <Route element={<ProtectedRoute><RoleGuard allowedRoles={['marketing']}><CrmLayout /></RoleGuard></ProtectedRoute>}>
                    <Route path="/crm/marketing" element={<MarketingDashboard />} />
                    <Route path="/crm/dirut" element={<DashboardDirut />} />
                    <Route path="/crm/scraping" element={<ScrapingCenter />} />
                    <Route path="/crm/leads" element={<LeadsManagement />} />
                    <Route path="/crm/leads/:id" element={<LeadDetail />} />
                  </Route>

                  {/* Default Route */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </CrmProvider>
          </FinanceProvider>
        </TaskProvider>
      </AuthProvider>
    </Router>
  )
}

export default App