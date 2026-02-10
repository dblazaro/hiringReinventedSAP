import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Linkedin, Github, Briefcase,
  Award, Star, Zap, Send, Shield, FileText, TrendingUp,
  ChevronRight, ExternalLink, Clock, Calendar
} from 'lucide-react';
import { api } from '../api';

const stageOrder = ['discovered', 'enriched', 'outreach_ready', 'contacted', 'engaged', 'responded', 'screening', 'interviewing', 'offer', 'hired'];

export default function TalentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<any>(null);
  const [outreach, setOutreach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.talents.get(id),
      api.outreach.history(id).catch(() => ({ data: [] })),
    ]).then(([talentRes, outreachRes]) => {
      setTalent(talentRes.data);
      setOutreach(outreachRes.data);
      setLoading(false);
    });
  }, [id]);

  const generateOutreach = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const res = await api.outreach.generate({
        talentId: id,
        includeAccentureContent: true,
        includeChallenge: true,
      });
      setGeneratedMsg(res.data);
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const moveStage = async (stage: string) => {
    if (!id) return;
    const res = await api.talents.moveStage(id, stage);
    setTalent(res.data);
  };

  if (loading) return <div className="p-6"><div className="h-96 bg-gray-200 rounded-xl animate-pulse" /></div>;
  if (!talent) return <div className="p-6 text-center text-gray-500">Talent not found</div>;

  const currentStageIndex = stageOrder.indexOf(talent.funnelStage || talent.funnel_stage);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate('/talents')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft size={16} /> Back to Talent Pool
      </button>

      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-sap-blue rounded-xl flex items-center justify-center text-white font-display font-bold text-xl">
              {(talent.fullName || talent.full_name || '').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">{talent.fullName || talent.full_name}</h1>
              <p className="text-gray-600">{talent.currentRole || talent.current_role} @ {talent.currentCompany || talent.current_company}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={14} /> {talent.city}, {talent.state}, Brazil</span>
                <span className="flex items-center gap-1"><Briefcase size={14} /> {talent.yearsOfExperience || talent.years_of_experience || 0} years</span>
                <span className="flex items-center gap-1"><Star size={14} /> {talent.points || 0} pts</span>
              </div>
              <div className="flex gap-3 mt-3">
                {talent.email && <a href={`mailto:${talent.email}`} className="text-gray-400 hover:text-gray-600"><Mail size={18} /></a>}
                {talent.phone && <a href={`tel:${talent.phone}`} className="text-gray-400 hover:text-gray-600"><Phone size={18} /></a>}
                {(talent.linkedinUrl || talent.linkedin_url) && <a href={talent.linkedinUrl || talent.linkedin_url} target="_blank" className="text-gray-400 hover:text-blue-600"><Linkedin size={18} /></a>}
                {(talent.githubUrl || talent.github_url) && <a href={talent.githubUrl || talent.github_url} target="_blank" className="text-gray-400 hover:text-gray-800"><Github size={18} /></a>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={generateOutreach} className="btn-primary flex items-center gap-2" disabled={generating}>
              <Zap size={16} /> {generating ? 'Generating...' : 'Generate Outreach'}
            </button>
          </div>
        </div>
      </div>

      {/* Funnel Progress */}
      <div className="card">
        <h3 className="font-display font-semibold mb-4">Hiring Funnel Progress</h3>
        <div className="flex items-center gap-1">
          {stageOrder.map((stage, i) => (
            <button
              key={stage}
              onClick={() => moveStage(stage)}
              className={`flex-1 py-2 px-1 text-xs font-medium rounded text-center transition-all ${
                i <= currentStageIndex
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {stage.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* SAP Profile */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3">SAP Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Modules</p>
                <div className="flex flex-wrap gap-2">
                  {(talent.sapModules || []).map((m: string) => (
                    <span key={m} className="px-2.5 py-1 bg-sap-blue/10 text-sap-blue text-sm rounded-lg font-medium">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(talent.skills || []).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{s}</span>
                  ))}
                </div>
              </div>
              {(talent.sapCertifications || []).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {talent.sapCertifications.map((c: string) => (
                      <span key={c} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-sm rounded-lg flex items-center gap-1">
                        <Award size={12} /> {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Languages</p>
                <div className="flex gap-2">
                  {(talent.languages || []).map((l: string) => (
                    <span key={l} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Outreach */}
          {generatedMsg && (
            <div className="card border-primary-200 bg-primary-50/30 animate-fade-in">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-primary-700">
                <Zap size={18} /> AI-Generated Outreach
              </h3>
              <div className="space-y-3">
                {generatedMsg.subject && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Subject</p>
                    <p className="font-medium">{generatedMsg.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Message Body</p>
                  <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded-lg border border-primary-200 font-sans">{generatedMsg.body}</pre>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedMsg.personalizedElements?.map((el: string) => (
                    <span key={el} className="badge bg-primary-100 text-primary-700">{el}</span>
                  ))}
                </div>
                {generatedMsg.suggestedContentPieces?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Suggested Content</p>
                    {generatedMsg.suggestedContentPieces.map((c: string) => (
                      <p key={c} className="text-sm text-sap-blue flex items-center gap-1"><FileText size={12} /> {c}</p>
                    ))}
                  </div>
                )}
                {generatedMsg.suggestedChallenge && (
                  <p className="text-sm text-accent-600 flex items-center gap-1"><Award size={12} /> Challenge: {generatedMsg.suggestedChallenge}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Est. Engagement: <strong className="text-primary-600">{generatedMsg.estimatedEngagementScore}%</strong></span>
                    <span className={generatedMsg.lgpdCompliant ? 'text-green-600' : 'text-red-600'}>
                      <Shield size={14} className="inline mr-1" />{generatedMsg.lgpdCompliant ? 'LGPD OK' : 'LGPD Issue'}
                    </span>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      await api.outreach.send({
                        talentId: id,
                        subject: generatedMsg.subject,
                        body: generatedMsg.body,
                        channel: generatedMsg.channel,
                        personalizedElements: generatedMsg.personalizedElements,
                      });
                      setGeneratedMsg(null);
                      const res = await api.talents.get(id!);
                      setTalent(res.data);
                    }}
                  >
                    <Send size={14} className="inline mr-1" /> Send Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Outreach History */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3">Outreach History</h3>
            {(!outreach || outreach.length === 0) ? (
              <p className="text-sm text-gray-400 py-4 text-center">No outreach messages sent yet</p>
            ) : (
              <div className="space-y-3">
                {outreach.map((msg: any) => (
                  <div key={msg.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{msg.channel}</span>
                      <span className={`badge ${msg.status === 'sent' ? 'bg-blue-100 text-blue-600' : msg.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {msg.status}
                      </span>
                    </div>
                    {msg.subject && <p className="text-sm mt-1 font-medium">{msg.subject}</p>}
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} /> {msg.sent_at || msg.created_at}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Engagement Score */}
          <div className="card text-center">
            <p className="text-sm text-gray-500 mb-2">Engagement Score</p>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={(talent.engagementScore || talent.engagement_score || 0) > 60 ? '#10b981' : (talent.engagementScore || talent.engagement_score || 0) > 30 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${((talent.engagementScore || talent.engagement_score || 0) / 100) * 251.2} 251.2`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                {talent.engagementScore || talent.engagement_score || 0}
              </span>
            </div>
          </div>

          {/* Quick Info */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3">Quick Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Source</dt>
                <dd className="capitalize font-medium">{(talent.source || '').replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Consent</dt>
                <dd className={`font-medium ${talent.consentStatus === 'granted' ? 'text-green-600' : talent.consentStatus === 'revoked' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {(talent.consentStatus || talent.consent_status || 'pending').toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Preference</dt>
                <dd className="capitalize font-medium">{talent.communicationPreference || talent.communication_preference}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Profile</dt>
                <dd className="font-medium">{talent.profileCompleteness || talent.profile_completeness || 0}%</dd>
              </div>
            </dl>
          </div>

          {/* Badges */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3">Badges & Achievements</h3>
            {(talent.badgesEarned || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">No badges yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {talent.badgesEarned.map((b: string) => (
                  <span key={b} className="badge bg-amber-50 text-amber-700"><Award size={12} className="mr-1" /> {b}</span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="font-display font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(talent.tags || []).map((t: string) => (
                <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
