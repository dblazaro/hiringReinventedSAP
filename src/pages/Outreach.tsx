import { useEffect, useState } from 'react';
import {
  Zap, Send, Users, FileText, Sparkles, Eye, Check,
  AlertTriangle, Shield, RefreshCw
} from 'lucide-react';
import { api } from '../api';

export default function Outreach() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [selectedTalent, setSelectedTalent] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [tone, setTone] = useState<string>('formal');
  const [generatedMsg, setGeneratedMsg] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    Promise.all([
      api.templates.list(),
      api.talents.list({ pageSize: '50', funnelStage: 'discovered,enriched,outreach_ready' }),
    ]).then(([tplRes, talRes]) => {
      setTemplates(tplRes.data || []);
      setTalents(talRes.data || []);
    });
  }, []);

  const generate = async () => {
    if (!selectedTalent) return;
    setGenerating(true);
    setSent(false);
    try {
      const res = await api.outreach.generate({
        talentId: selectedTalent,
        templateId: selectedTemplate || undefined,
        tone,
        includeAccentureContent: true,
        includeChallenge: true,
      });
      setGeneratedMsg(res.data);
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const send = async () => {
    if (!selectedTalent || !generatedMsg) return;
    setSending(true);
    try {
      await api.outreach.send({
        talentId: selectedTalent,
        subject: generatedMsg.subject,
        body: generatedMsg.body,
        channel: generatedMsg.channel,
        personalizedElements: generatedMsg.personalizedElements,
      });
      setSent(true);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const selectedTalentData = talents.find(t => t.id === selectedTalent);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Sparkles className="text-primary-500" size={24} /> AI Outreach Generator
        </h1>
        <p className="text-sm text-gray-500">Generate hyperpersonalized outreach messages using AI, Accenture content, and gamification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-display font-semibold mb-4">Configure Outreach</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Select Talent</label>
                <select className="select" value={selectedTalent} onChange={e => { setSelectedTalent(e.target.value); setGeneratedMsg(null); setSent(false); }}>
                  <option value="">Choose a talent...</option>
                  {talents.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName || t.full_name} - {(t.experienceLevel || t.experience_level || '').charAt(0).toUpperCase() + (t.experienceLevel || t.experience_level || '').slice(1)} - {(t.sapModules || []).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Template (optional)</label>
                <select className="select" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                  <option value="">Auto-select best template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Tone</label>
                <div className="flex gap-2">
                  {['formal', 'casual', 'enthusiastic', 'technical'].map(t => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${tone === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setTone(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  Include Accenture Content
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  Include Challenge
                </label>
              </div>

              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={generate}
                disabled={!selectedTalent || generating}
              >
                {generating ? <><RefreshCw size={16} className="animate-spin" /> Generating...</> : <><Zap size={16} /> Generate Personalized Message</>}
              </button>
            </div>
          </div>

          {/* Selected Talent Card */}
          {selectedTalentData && (
            <div className="card bg-gradient-to-br from-gray-50 to-primary-50/30">
              <h3 className="font-display font-semibold mb-2">Selected Talent</h3>
              <div className="space-y-1">
                <p className="font-medium">{selectedTalentData.fullName || selectedTalentData.full_name}</p>
                <p className="text-sm text-gray-600">{selectedTalentData.currentRole || selectedTalentData.current_role} @ {selectedTalentData.currentCompany || selectedTalentData.current_company}</p>
                <p className="text-sm text-gray-500">{selectedTalentData.city}, {selectedTalentData.state}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(selectedTalentData.sapModules || []).map((m: string) => (
                    <span key={m} className="text-xs px-1.5 py-0.5 bg-sap-blue/10 text-sap-blue rounded">{m}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Engagement: {selectedTalentData.engagementScore || selectedTalentData.engagement_score || 0}%</span>
                  <span>Source: {(selectedTalentData.source || '').replace('_', ' ')}</span>
                  <span className={`${(selectedTalentData.consentStatus || selectedTalentData.consent_status) === 'revoked' ? 'text-red-600' : 'text-green-600'}`}>
                    <Shield size={10} className="inline" /> LGPD: {selectedTalentData.consentStatus || selectedTalentData.consent_status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Message Preview */}
        <div className="space-y-4">
          {!generatedMsg && !generating && (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
              <Sparkles size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">AI-Powered Message Preview</p>
              <p className="text-sm mt-1">Select a talent and generate a personalized message</p>
            </div>
          )}

          {generating && (
            <div className="card flex flex-col items-center justify-center py-16">
              <RefreshCw size={48} className="mb-4 text-primary-500 animate-spin" />
              <p className="text-lg font-medium text-primary-600">Generating personalized message...</p>
              <p className="text-sm text-gray-500 mt-1">Analyzing talent profile, selecting content, and crafting message</p>
            </div>
          )}

          {generatedMsg && (
            <div className="card border-primary-200 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold flex items-center gap-2 text-primary-700">
                  <Zap size={18} /> Generated Message
                </h3>
                <span className="badge bg-primary-100 text-primary-700">
                  Est. Engagement: {generatedMsg.estimatedEngagementScore}%
                </span>
              </div>

              {generatedMsg.subject && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase">Subject Line</p>
                  <p className="font-medium text-lg">{generatedMsg.subject}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase mb-1">Message</p>
                <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{generatedMsg.body}</pre>
                </div>
              </div>

              {/* Personalization tags */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Personalization Elements</p>
                <div className="flex flex-wrap gap-1">
                  {generatedMsg.personalizedElements?.map((el: string) => (
                    <span key={el} className="badge bg-purple-100 text-purple-700">{el}</span>
                  ))}
                </div>
              </div>

              {/* Content suggestions */}
              {generatedMsg.suggestedContentPieces?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Included Content</p>
                  {generatedMsg.suggestedContentPieces.map((c: string) => (
                    <p key={c} className="text-sm flex items-center gap-1 text-sap-blue"><FileText size={12} /> {c}</p>
                  ))}
                </div>
              )}

              {generatedMsg.suggestedChallenge && (
                <div className="mb-4 p-2 bg-accent-50 rounded-lg">
                  <p className="text-sm text-accent-700 flex items-center gap-1">
                    <Sparkles size={14} /> Challenge Included: {generatedMsg.suggestedChallenge}
                  </p>
                </div>
              )}

              {/* LGPD + Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {generatedMsg.lgpdCompliant ? (
                    <span className="text-sm text-green-600 flex items-center gap-1"><Shield size={14} /> LGPD Compliant</span>
                  ) : (
                    <span className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle size={14} /> LGPD Warning</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={generate}>
                    <RefreshCw size={14} className="inline mr-1" /> Regenerate
                  </button>
                  {sent ? (
                    <span className="btn-accent flex items-center gap-1 cursor-default"><Check size={16} /> Sent!</span>
                  ) : (
                    <button className="btn-primary flex items-center gap-1" onClick={send} disabled={sending || !generatedMsg.lgpdCompliant}>
                      <Send size={14} /> {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
