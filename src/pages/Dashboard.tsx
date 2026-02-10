import { useEffect, useState } from 'react';
import {
  Users, Send, TrendingUp, Gamepad2, Target, Award,
  ArrowUpRight, ArrowDownRight, Zap, Globe
} from 'lucide-react';
import { api } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#7c3aed', '#0070f2', '#10b981', '#e8a400', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.dashboard().then(res => {
      setMetrics(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!metrics) return <div className="p-8 text-center text-gray-500">Failed to load dashboard</div>;

  const levelData = Object.entries(metrics.talentsByLevel || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
  }));

  const sourceData = Object.entries(metrics.talentsBySource || {}).map(([name, value]) => ({
    name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
    value: value as number,
  }));

  const stageData = Object.entries(metrics.talentsByStage || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    count: value as number,
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">SAP Talent Intelligence - Brazil Overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Globe size={16} />
          <span>Accenture SAP Practice</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Talents"
          value={metrics.totalTalents}
          icon={Users}
          color="primary"
          change="+12% this week"
          positive
        />
        <KPICard
          title="Active Campaigns"
          value={metrics.campaignPerformance.activeCampaigns}
          icon={Send}
          color="blue"
          change={`Best: ${metrics.campaignPerformance.bestPerforming?.substring(0, 20) || 'N/A'}`}
        />
        <KPICard
          title="Avg Engagement"
          value={`${metrics.gamificationMetrics.avgEngagementScore}%`}
          icon={TrendingUp}
          color="green"
          change={`${metrics.gamificationMetrics.activePlayers} active players`}
          positive
        />
        <KPICard
          title="Response Rate"
          value={`${metrics.outreachMetrics.responseRate.toFixed(1)}%`}
          icon={Zap}
          color="amber"
          change={`${metrics.outreachMetrics.totalSent} messages sent`}
        />
      </div>

      {/* Funnel + Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hiring Funnel */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Hiring Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Experience Level Pie */}
        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-4">By Experience Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={levelData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {levelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source + Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-4">Talent Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0070f2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="discovered" stackId="1" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
              <Area type="monotone" dataKey="contacted" stackId="1" stroke="#0070f2" fill="#0070f2" fillOpacity={0.6} />
              <Area type="monotone" dataKey="responded" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="hired" stackId="1" stroke="#e8a400" fill="#e8a400" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location + LGPD Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-4">Talents by State</h3>
          <div className="space-y-2">
            {Object.entries(metrics.talentsByLocation || {}).sort(([, a], [, b]) => (b as number) - (a as number)).map(([state, count]) => (
              <div key={state} className="flex items-center gap-3">
                <span className="w-8 text-sm font-mono font-medium text-gray-600">{state}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-sap-blue rounded-full transition-all"
                    style={{ width: `${((count as number) / metrics.totalTalents) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-4">LGPD Consent Status</h3>
          <div className="space-y-4">
            {Object.entries(metrics.talentsByConsent || {}).map(([status, count]) => {
              const colors: Record<string, string> = { granted: 'bg-green-500', pending: 'bg-yellow-500', revoked: 'bg-red-500' };
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-400'}`} />
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                  <span className="font-semibold">{count as number}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <Award size={16} />
              LGPD Compliant - All data processing documented
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, change, positive }: any) {
  const colorMap: Record<string, string> = {
    primary: 'from-primary-500 to-primary-600',
    blue: 'from-sap-blue to-blue-600',
    green: 'from-accent-500 to-accent-600',
    amber: 'from-sap-gold to-amber-500',
  };

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-display font-bold mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${positive ? 'text-green-600' : 'text-gray-500'}`}>
            {positive && <ArrowUpRight size={12} />}
            {change}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-80 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
