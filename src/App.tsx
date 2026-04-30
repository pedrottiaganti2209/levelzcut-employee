import { useState } from 'react';
import { CalendarDays, BarChart2, Settings, RefreshCw } from 'lucide-react';
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

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { prices, loading: dataLoading, saveEntry, savePrice, getEntry, getMonthEntries } = useEmployeeData(user);
  const [activeTab, setActiveTab] = useState<Tab>('calendar');

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Derive username from email (user1@levelzcut.internal → user1)
  const username = user?.email?.split('@')[0] ?? '';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw size={28} className="text-yellow-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={signIn} />;
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
