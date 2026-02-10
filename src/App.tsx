import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Send, Gamepad2, FileText,
  BarChart3, Shield, Search, Settings, Zap, Target
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TalentPool from './pages/TalentPool';
import TalentDetail from './pages/TalentDetail';
import Campaigns from './pages/Campaigns';
import Outreach from './pages/Outreach';
import Gamification from './pages/Gamification';
import ContentHub from './pages/ContentHub';
import Sourcing from './pages/Sourcing';
import LGPDCompliance from './pages/LGPDCompliance';
import Pipeline from './pages/Pipeline';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/talents', icon: Users, label: 'Talent Pool' },
  { to: '/pipeline', icon: Target, label: 'Pipeline' },
  { to: '/sourcing', icon: Search, label: 'Sourcing' },
  { to: '/campaigns', icon: Send, label: 'Campaigns' },
  { to: '/outreach', icon: Zap, label: 'Outreach AI' },
  { to: '/gamification', icon: Gamepad2, label: 'Gamification' },
  { to: '/content', icon: FileText, label: 'Content Hub' },
  { to: '/lgpd', icon: Shield, label: 'LGPD' },
];

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-primary-900 via-primary-800 to-sap-dark text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-sap-blue rounded-xl flex items-center justify-center font-display font-bold text-lg">
              TF
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">TalentFlow</h1>
              <p className="text-xs text-primary-300">SAP Talent Intelligence</p>
            </div>
          </div>
          <p className="text-[10px] text-primary-400 mt-2 uppercase tracking-wider">Powered by Accenture</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-lg shadow-primary-900/20'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-primary-400">
            <p>Accenture SAP Practice</p>
            <p>Brazil - Talent Hiring</p>
            <p className="mt-1 opacity-60">v1.0.0 - LGPD Compliant</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/talents" element={<TalentPool />} />
          <Route path="/talents/:id" element={<TalentDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/sourcing" element={<Sourcing />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/content" element={<ContentHub />} />
          <Route path="/lgpd" element={<LGPDCompliance />} />
        </Routes>
      </main>
    </div>
  );
}
