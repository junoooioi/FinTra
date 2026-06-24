import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkflow } from '../hooks/useWorkflow';
import { NotificationBell } from '../components/NotificationBell';
import { AuditTrailLog } from '../components/AuditTrailLog';
import { DashboardPage } from '../pages/DashboardPage';
import { BudgetSectionPage } from '../pages/BudgetSectionPage';
import { AccountingSectionPage } from '../pages/AccountingSectionPage';
import { CashierSectionPage } from '../pages/CashierSectionPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AccessDeniedPage } from '../components/AccessDeniedPage';
import { DostLogo } from '../components/DostLogo';
import { 
  LayoutDashboard, Receipt, BookOpen, 
  CreditCard, History, Shield, Menu, X, Lock, BarChart3, LogOut
} from 'lucide-react';
import { Role } from '../types';

export function ApplicationShell() {
  const { 
    currentPath, 
    setCurrentPath, 
    activeRole, 
    setActiveRole, 
    documents,
    user,
    logout
  } = useWorkflow();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Calculate live desk queue indicators
  const budgetCount = documents.filter(d => d.currentSection === 'BUDGET').length;
  const acctgCount = documents.filter(d => d.currentSection === 'ACCOUNTING').length;
  const cashierCount = documents.filter(d => d.currentSection === 'CASHIER').length;

  // Gate app rendering on Google User Session
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render correct desk page under strict Role-Based Access Control
  const renderActivePage = () => {
    switch (currentPath) {
      case 'budget':
        if (activeRole !== 'Budget Officer' && activeRole !== 'Administrator') {
          return (
            <AccessDeniedPage
              requiredRole="Budget Officer"
              currentRole={activeRole}
              sectionName="Budget Section"
              onGoBack={() => setCurrentPath('dashboard')}
            />
          );
        }
        return <BudgetSectionPage />;
      case 'accounting':
        if (activeRole !== 'Chief Accountant' && activeRole !== 'Administrator') {
          return (
            <AccessDeniedPage
              requiredRole="Chief Accountant"
              currentRole={activeRole}
              sectionName="Accounting Section"
              onGoBack={() => setCurrentPath('dashboard')}
            />
          );
        }
        return <AccountingSectionPage />;
      case 'cashier':
        if (activeRole !== 'Disbursing Cashier' && activeRole !== 'Administrator') {
          return (
            <AccessDeniedPage
              requiredRole="Disbursing Cashier"
              currentRole={activeRole}
              sectionName="Cashier Section"
              onGoBack={() => setCurrentPath('dashboard')}
            />
          );
        }
        return <CashierSectionPage />;
      case 'reports':
        return <ReportsPage />;
      case 'audit':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-xl animate-fade-in shadow-xs">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">System Records & Ledger</h2>
              <p className="text-xs text-slate-400">View real-time, non-editable transaction audit points across all desk desks.</p>
            </div>
            <AuditTrailLog />
          </div>
        );
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  const navGroups = [
    {
      title: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: 0, requiredRole: null },
      ]
    },
    {
      title: 'Financial Unit',
      items: [
        { id: 'budget', label: 'Budget Section', icon: Receipt, count: budgetCount, requiredRole: 'Budget Officer' as Role },
        { id: 'accounting', label: 'Accounting Section', icon: BookOpen, count: acctgCount, requiredRole: 'Chief Accountant' as Role },
        { id: 'cashier', label: 'Cashier Section', icon: CreditCard, count: cashierCount, requiredRole: 'Disbursing Cashier' as Role },
      ]
    },
    {
      title: 'Analytics & Logs',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3, count: 0, requiredRole: null },
        { id: 'audit', label: 'System Audit Ledger', icon: History, count: 0, requiredRole: null },
      ]
    }
  ];

  return (
    <div className="h-screen bg-tech-bg text-tech-text flex flex-row font-sans overflow-hidden">
      
      {/* Sidebar Nav (Desktop Left sidebar, mobile drawer) */}
      <aside className={`
        fixed lg:sticky top-0 bottom-0 left-0 h-screen bg-gradient-to-b from-[#013c6e] via-[#025191] to-[#014073] text-white p-0 shrink-0 z-40 transition-all duration-300 flex flex-col justify-between border-r border-white/5
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarHidden ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:border-none' : 'lg:w-64 lg:opacity-100'}
      `}>
        <div className="flex flex-col h-full justify-between w-64">
          <div className="flex flex-col">
            
            {/* Desktop Technical Branding Header with Option to Hide */}
            <div className="px-4 py-5 flex items-center justify-between border-b border-white/10 shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <DostLogo className="w-10 h-10 shrink-0" />
                <div className="min-w-0">
                  <span className="font-sans font-extrabold tracking-tight text-lg text-white block leading-tight">FinTra</span>
                  <span className="font-inter text-[8px] font-bold text-white/75 tracking-wider block mt-0.5 leading-tight whitespace-nowrap">Finance and Administrative Services</span>
                </div>
              </div>
              
              {/* Button to collapse sidebar */}
              <button
                type="button"
                onClick={() => setSidebarHidden(true)}
                className="hidden lg:flex items-center justify-center w-6 h-6 p-0 text-white opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity duration-150 cursor-pointer shrink-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                title="Hide Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Links */}
            <nav className="py-4 flex-1 space-y-4">
              {navGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  <div className="px-6 py-1 text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">
                    {group.title}
                  </div>
                  
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = currentPath === item.id;
                      const isLocked = item.requiredRole && activeRole !== item.requiredRole && activeRole !== 'Administrator';
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentPath(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full px-6 py-2.5 flex items-center justify-between text-xs transition duration-150 select-none cursor-pointer ${
                            isSelected 
                              ? 'bg-white/10 border-l-4 border-white text-white font-bold' 
                              : 'text-white/60 hover:text-white hover:bg-white/5 hover:border-l-4 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 shrink-0 transition ${isLocked ? 'text-white/20' : 'text-white/60 group-hover:text-white'}`} />
                            <span className={isLocked ? 'text-white/35 font-medium italic' : undefined}>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isLocked && (
                              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            {item.count > 0 && !isLocked && (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-tech-accent/20 text-blue-400 border border-tech-accent/30 animate-pulse">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

          </div>

          {/* Bottom identity panel aligned with theme with Sign Out option */}
          <div className="p-6 border-t border-white/10 shrink-0 bg-black/10">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold uppercase text-slate-300 shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-none">{user.name}</p>
                  <p className="text-[9px] text-white/40 font-mono tracking-wider truncate mt-1">{user.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out of FinTra Portal"
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/70 border border-white/10 hover:border-red-500/30 rounded-lg transition duration-150 cursor-pointer shrink-0 flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs cursor-pointer" 
        />
      )}

      {/* Right Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* 1. Header Navigation Bar (Clean Corporate Light Theme) */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop toggle button for showing / hiding the sidebar */}
            <button
              onClick={() => setSidebarHidden(!sidebarHidden)}
              className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200 shadow-2xs bg-slate-50 mr-2"
              title={sidebarHidden ? "Show Sidebar" : "Hide Sidebar"}
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </button>
            
            {/* Brand details shown on mobile header or when desktop sidebar is hidden */}
            <div className={`items-center gap-2 select-none ${sidebarHidden ? 'flex' : 'flex lg:hidden'}`}>
              <DostLogo className="w-8 h-8 shrink-0" />
              <div>
                <span className="font-sans font-extrabold text-sm tracking-tight block text-slate-800 leading-none">FinTra</span>
              </div>
            </div>

            {/* Technical Search Mimic in Desktop Header or quick navigation */}
            <div className="hidden lg:block relative">
              <input 
                type="text" 
                placeholder="Search by ORS, DV, PO or Supplier..." 
                className="w-80 bg-slate-100 border-none rounded-md px-4 py-1.5 text-xs focus:ring-1 focus:ring-tech-accent text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                readOnly
              />
            </div>
          </div>

          {/* Center Simulation Controller - Key Role Toggle Switcher */}
          {user.role === 'Administrator' ? (
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-lg text-xs animate-fade-in shadow-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 font-bold uppercase tracking-widest text-[9px] border-r border-slate-250 font-mono">
                <Shield className="w-3.5 h-3.5 text-tech-accent animate-pulse" />
                Clearance Filter:
              </div>
              
              <div className="flex gap-1">
                {(['Budget Officer', 'Chief Accountant', 'Disbursing Cashier', 'Administrator'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRole(r);
                    }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-md transition duration-150 cursor-pointer select-none ${
                      activeRole === r 
                        ? 'bg-tech-accent text-white font-bold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-150'
                    }`}
                  >
                    {r.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 animate-fade-in">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Active Government Clearance: <span className="font-extrabold text-blue-800">{user.role}</span></span>
            </div>
          )}

          {/* Right Notifications Center */}
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block" />
            
            {/* Active role mini label */}
            <div className="hidden sm:flex items-center gap-2.5 pl-1 text-left">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-250 text-xs text-slate-705 font-extrabold uppercase flex items-center justify-center font-mono ring-2 ring-blue-50">
                {user.name.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800 leading-none truncate max-w-28">{user.name}</p>
                <p className="text-[9px] text-tech-accent font-mono uppercase leading-none mt-1 tracking-wider font-semibold">
                  {user.role === 'Administrator' ? `ADMIN (${activeRole.split(' ')[0]})` : 'SECURE AGENT'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic header row specifically for mobile screens to switch roles quickly */}
        {user.role === 'Administrator' ? (
          <div className="md:hidden bg-slate-100 px-4 py-2 border-b border-slate-250 flex items-center justify-between text-xs gap-2 animate-fade-in shrink-0">
            <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-slate-500 font-mono shrink-0">
              Assume clearance:
            </span>
            <select
              id="mobile_role_select"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as Role)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-tech-accent"
            >
              <option value="Budget Officer">Budget Officer (Maria)</option>
              <option value="Chief Accountant">Chief Accountant (Cesar)</option>
              <option value="Disbursing Cashier">Disbursing Cashier (Regina)</option>
              <option value="Administrator">Administrator (All Access)</option>
            </select>
          </div>
        ) : (
          <div className="md:hidden bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2 text-xs text-slate-700 font-medium animate-fade-in select-none shrink-0">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-pulse" />
            <span>Active Clearance: <strong className="text-slate-900 font-bold">{user.role}</strong> ({user.name})</span>
          </div>
        )}

        {/* Main Content Stage Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActivePage()}
          </div>
        </main>

        {/* Modern Compact Tech Footer */}
        <footer className="bg-[#151619] text-white/40 border-t border-white/10 text-[9px] py-4 px-6 font-mono shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> SYSTEM STATUS: ONLINE
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-tech-accent rounded-full"></span> AUDIT SYNC: 100%
              </span>
            </div>
            <div className="flex gap-4">
              <span>DOST-V FTS v1.0.0-Stable</span>
              <span className="font-bold text-white/30">Last Ledger Update: {new Date().toLocaleDateString(undefined, {month:'2-digit', day:'2-digit', year:'numeric'})} 16:45:01</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
