import { useEffect, useState } from 'react';
import {
  Shield, CheckCircle, AlertTriangle, FileText, Download,
  Trash2, Eye, Lock, Database, Clock, Users
} from 'lucide-react';
import { api } from '../api';

export default function LGPDCompliance() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dsarTalentId, setDsarTalentId] = useState('');
  const [dsarResult, setDsarResult] = useState<any>(null);

  useEffect(() => {
    api.lgpd.overview().then(res => {
      setOverview(res.data);
      setLoading(false);
    });
  }, []);

  const runDsar = async () => {
    if (!dsarTalentId.trim()) return;
    try {
      const res = await api.lgpd.dsar(dsarTalentId.trim());
      setDsarResult(res.data);
    } catch (e) {
      console.error(e);
      setDsarResult({ error: 'Talent not found' });
    }
  };

  if (loading) return <div className="p-6"><div className="h-96 bg-gray-200 rounded-xl animate-pulse" /></div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield className="text-green-600" size={24} /> LGPD Compliance Center
        </h1>
        <p className="text-sm text-gray-500">Lei Geral de Protecao de Dados - Full compliance management</p>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ComplianceCard
          icon={Users}
          label="Total Data Subjects"
          value={overview?.totalTalents || 0}
          color="blue"
        />
        <ComplianceCard
          icon={CheckCircle}
          label="Consent Granted"
          value={overview?.consentGranted || 0}
          color="green"
        />
        <ComplianceCard
          icon={Clock}
          label="Consent Pending"
          value={overview?.consentPending || 0}
          color="yellow"
        />
        <ComplianceCard
          icon={AlertTriangle}
          label="Consent Revoked"
          value={overview?.consentRevoked || 0}
          color="red"
        />
      </div>

      {/* Compliance Rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Compliance Rate</h3>
          <span className="text-2xl font-bold text-green-600">{overview?.complianceRate || 0}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
            style={{ width: `${overview?.complianceRate || 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policies */}
        <div className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} /> Data Processing Policies
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Legal Bases for Processing</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {overview?.policies?.dataProcessingBases?.map((b: string) => (
                  <span key={b} className="badge bg-blue-100 text-blue-700">{b.replace('_', ' ')}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Data Retention Period</p>
              <p className="text-sm text-gray-500">{overview?.policies?.retentionPeriod}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Data Categories Processed</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {overview?.policies?.dataCategories?.map((c: string) => (
                  <span key={c} className="badge bg-gray-100 text-gray-600">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Processing Purposes</p>
              <ul className="mt-1 space-y-1">
                {overview?.policies?.purposes?.map((p: string, i: number) => (
                  <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                    <CheckCircle size={14} className="mt-0.5 text-green-500 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Data Protection Officer</p>
              <p className="text-sm text-primary-600">{overview?.policies?.dpo}</p>
            </div>
          </div>
        </div>

        {/* Data Subject Rights */}
        <div className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Lock size={18} /> Data Subject Rights (DSAR)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Execute data subject access requests, data portability, and right to erasure as required by LGPD.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="input"
              placeholder="Enter Talent ID..."
              value={dsarTalentId}
              onChange={e => setDsarTalentId(e.target.value)}
            />
            <button className="btn-primary" onClick={runDsar}>
              <Eye size={14} className="inline mr-1" /> Access
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-secondary flex items-center justify-center gap-2 text-sm">
              <Download size={14} /> Export Data
            </button>
            <button className="btn-danger flex items-center justify-center gap-2 text-sm">
              <Trash2 size={14} /> Right to Erasure
            </button>
          </div>

          {dsarResult && !dsarResult.error && (
            <div className="mt-4 animate-fade-in">
              <h4 className="font-medium text-sm mb-2">Data Subject Report</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2 max-h-64 overflow-y-auto">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Personal Data</p>
                  <p>Name: {dsarResult.personalData?.fullName}</p>
                  <p>Email: {dsarResult.personalData?.email || 'Not provided'}</p>
                  <p>Location: {dsarResult.personalData?.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Processing Details</p>
                  <p>Source: {dsarResult.processingDetails?.source}</p>
                  <p>Consent: {dsarResult.processingDetails?.consentStatus}</p>
                  <p>Basis: {dsarResult.processingDetails?.processingBasis}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Communication History</p>
                  <p>{dsarResult.communicationHistory?.length || 0} messages sent</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Activity Log</p>
                  <p>{dsarResult.activityLog?.length || 0} activities recorded</p>
                </div>
              </div>
            </div>
          )}

          {dsarResult?.error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
              {dsarResult.error}
            </div>
          )}
        </div>
      </div>

      {/* Recent Consent Log */}
      <div className="card">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Database size={18} /> Recent Consent Activity
        </h3>
        {(overview?.recentLogs || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No consent activity logged yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Talent ID</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Action</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Basis</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Details</th>
                  <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {overview.recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{log.talent_id?.substring(0, 12)}...</td>
                    <td className="px-3 py-2">
                      <span className={`badge ${log.action === 'grant' ? 'bg-green-100 text-green-700' : log.action === 'revoke' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2">{log.basis}</td>
                    <td className="px-3 py-2 text-gray-500">{log.details}</td>
                    <td className="px-3 py-2 text-gray-400">{log.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LGPD Info Banner */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start gap-4">
          <Shield size={32} className="text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-display font-semibold text-green-800">LGPD Compliance Guarantee</h3>
            <p className="text-sm text-green-700 mt-1">
              TalentFlow SAP is fully compliant with Brazil's Lei Geral de Protecao de Dados (LGPD - Lei 13.709/2018).
              All personal data processing is documented, consent is tracked, and data subject rights
              (access, correction, deletion, portability) are fully supported. Data is encrypted at rest
              and in transit. Contact our DPO at {overview?.policies?.dpo} for any data protection inquiries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceCard({ icon: Icon, label, value, color }: any) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
