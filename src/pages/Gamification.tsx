import { useEffect, useState } from 'react';
import {
  Trophy, Award, Star, Target, Zap, Clock, Users,
  ChevronRight, Sword, Rocket, Lightbulb, Medal
} from 'lucide-react';
import { api } from '../api';

const difficultyColors: Record<string, string> = {
  entry: 'bg-blue-100 text-blue-700 border-blue-200',
  experienced: 'bg-green-100 text-green-700 border-green-200',
  lead: 'bg-purple-100 text-purple-700 border-purple-200',
  expert: 'bg-amber-100 text-amber-700 border-amber-200',
};

const rarityColors: Record<string, string> = {
  common: 'bg-gray-100 text-gray-600 border-gray-300',
  rare: 'bg-blue-100 text-blue-600 border-blue-300',
  epic: 'bg-purple-100 text-purple-600 border-purple-300',
  legendary: 'bg-amber-100 text-amber-600 border-amber-400',
};

const typeIcons: Record<string, any> = {
  quiz: Target,
  mini_project: Rocket,
  assessment: Star,
  contribution: Lightbulb,
  referral: Users,
};

export default function Gamification() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tab, setTab] = useState<'challenges' | 'badges' | 'leaderboard'>('challenges');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.gamification.challenges(),
      api.gamification.badges(),
      api.gamification.leaderboard(),
    ]).then(([chRes, bgRes, lbRes]) => {
      setChallenges(chRes.data || []);
      setBadges(bgRes.data || []);
      setLeaderboard(lbRes.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Trophy className="text-sap-gold" size={24} /> Gamification Hub
        </h1>
        <p className="text-sm text-gray-500">Engage SAP talents with challenges, badges, and competitions</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Active Challenges" value={challenges.filter(c => c.isActive).length} />
        <StatCard icon={Award} label="Badges Available" value={badges.length} />
        <StatCard icon={Users} label="Active Players" value={leaderboard.length} />
        <StatCard icon={Star} label="Total Completions" value={challenges.reduce((s: number, c: any) => s + (c.completions || 0), 0)} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['challenges', 'badges', 'leaderboard'] as const).map(t => (
          <button
            key={t}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : tab === 'challenges' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(c => {
            const Icon = typeIcons[c.type] || Target;
            return (
              <div key={c.id} className={`card border-2 hover:shadow-lg transition-all ${difficultyColors[c.difficulty] ? 'border-transparent' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${difficultyColors[c.difficulty]?.split(' ')[0] || 'bg-gray-100'}`}>
                    <Icon size={20} className={difficultyColors[c.difficulty]?.split(' ')[1] || 'text-gray-600'} />
                  </div>
                  <span className={`badge ${difficultyColors[c.difficulty] || ''}`}>
                    {c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)}
                  </span>
                </div>
                <h3 className="font-display font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  {c.timeLimit && (
                    <span className="flex items-center gap-1"><Clock size={14} /> {c.timeLimit} min</span>
                  )}
                  <span className="flex items-center gap-1"><Star size={14} className="text-sap-gold" /> {c.points} pts</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {c.completions}</span>
                </div>

                {c.sapModule && (
                  <p className="text-xs text-sap-blue mt-2">{c.sapModule}</p>
                )}

                {c.avgScore > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Avg Score</span>
                      <span>{c.avgScore.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full" style={{ width: `${c.avgScore}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : tab === 'badges' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(b => (
            <div key={b.id} className={`card border-2 text-center hover:shadow-lg transition-all ${rarityColors[b.rarity]}`}>
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${rarityColors[b.rarity]?.split(' ')[0]}`}>
                <Award size={28} className={rarityColors[b.rarity]?.split(' ')[1]} />
              </div>
              <h3 className="font-display font-semibold">{b.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{b.description}</p>
              <span className={`badge mt-3 ${rarityColors[b.rarity]}`}>{b.rarity}</span>
              <p className="text-xs text-gray-400 mt-2">{b.requirement}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Trophy className="text-sap-gold" size={20} /> Talent Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.talentId}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${i < 3 ? 'bg-gradient-to-r from-amber-50 to-transparent' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? 'bg-yellow-400 text-white' :
                  i === 1 ? 'bg-gray-300 text-white' :
                  i === 2 ? 'bg-amber-600 text-white' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{entry.talentName}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{entry.challengesCompleted} challenges</span>
                    <span>{entry.badgeCount} badges</span>
                    <span>Engagement: {entry.engagementScore}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary-600">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
        <Icon size={20} className="text-primary-600" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
