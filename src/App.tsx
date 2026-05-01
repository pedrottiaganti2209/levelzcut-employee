import { useState } from 'react';
import { CalendarDays, BarChart2, Settings, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useEmployeeData } from './hooks/useEmployeeData';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { CalendarView } from './components/Calendar/CalendarView';
import { MonthSummary } from './components/Dashboard/MonthSummary';
import { PerformanceChart } from './components/Charts/PerformanceChart';
import { PriceSettings } from './components/Settings/PriceSettings';

type Tab = 'calendar' | 'summary' | 'chart' | 'settings';

const TABS: { id: Tab; label: string; Icon: any }[] = [
  { id: 'calendar', label: 'Agenda', Icon: CalendarDays },
  { id: 'summary', label: 'Resumo', Icon: BarChart2 },
  { id: 'chart', label: 'Gráfico', Icon: BarChart2 },
  { id: 'settings', label: 'Valores', Icon: Settings },
];

function ResetPasswordForm({ onUpdate }: { onUpdate: (pwd: string) => Promise<string | null> }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6) { setError('Mínimo de 6 caracteres.'); return; }
    setLoading(true);
    const err = await onUpdate(password);
    if (err) { setError('Não foi possível redefinir. Tente novamente.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-white text-2xl font-bold tracking-tight">Nova senha</h1>
          <p className="text-gray-500 text-sm mt-1">Escolha uma nova senha para sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Nova senha</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Confirmar senha</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••"
              autoComplete="new-password"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg py-2 px-3">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, isPasswordRecovery, signIn, signUp, resetPassword, updatePassword, signOut } = useAuth();
  const { prices, loading: dataLoading, saveEntry, savePrice, getEntry, getMonthEntries } = useEmployeeData(user);
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const username = user?.email?.split('@')[0] ?? '';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw size={28} className="text-yellow-600 animate-spin" />
      </div>
    );
  }

  if (isPasswordRecovery) {
    return <ResetPasswordForm onUpdate={updatePassword} />;
  }

  if (!user) {
    return <Login onLogin={signIn} onSignUp={signUp} onResetPassword={resetPassword} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header username={username} onSignOut={signOut} />

      <main className="max-w-2xl mx-auto px-4 pb-24 pt-5">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={28} className="animate-spin text-yellow-600" />
          </div>
        ) : (
          <>
            {activeTab === 'calendar' && (
              <CalendarView
                today={today}
                prices={prices}
                getEntry={getEntry}
                getMonthEntries={getMonthEntries}
                onSave={saveEntry}
              />
            )}
            {activeTab === 'summary' && (
              <MonthSummary
                entries={getMonthEntries(currentYear, currentMonth)}
                prices={prices}
                year={currentYear}
                month={currentMonth}
              />
            )}
            {activeTab === 'chart' && (
              <PerformanceChart
                entries={getMonthEntries(currentYear, currentMonth)}
                prices={prices}
                year={currentYear}
                month={currentMonth}
              />
            )}
            {activeTab === 'settings' && (
              <PriceSettings prices={prices} onSave={savePrice} />
            )}
          </>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-30">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                activeTab === id ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
