import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayEntry, Prices } from '../../types';
import { SERVICE_COLORS, totalCuts, totalEarnings, TRACKING_START } from '../../types';
import { DayEntryModal } from './DayEntryModal';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  today: Date;
  prices: Prices;
  getEntry: (year: number, month: number, day: number) => DayEntry | undefined;
  getMonthEntries: (year: number, month: number) => DayEntry[];
  onSave: (entry: DayEntry) => void;
}

function formatCurrency(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function CalendarView({ today, prices, getEntry, getMonthEntries, onSave }: Props) {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [editDay, setEditDay] = useState<number | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const rows = Math.ceil((firstWeekday + daysInMonth) / 7);

  const monthEntries = getMonthEntries(year, month);
  const monthTotalQty = monthEntries.reduce((s, e) => s + totalCuts(e), 0);
  const monthTotalEarnings = monthEntries.reduce((s, e) => s + totalEarnings(e, prices), 0);

  // Per-service totals for the month
  const serviceTotals = { cabelo: 0, combo: 0, barba: 0, premium: 0 };
  monthEntries.forEach(e => {
    serviceTotals.cabelo += e.cabelo;
    serviceTotals.combo += e.combo;
    serviceTotals.barba += e.barba;
    serviceTotals.premium += e.premium;
  });

  const canGoPrev = year > TRACKING_START.year || (year === TRACKING_START.year && month > TRACKING_START.month);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const isFuture = (day: number) => {
    if (!isCurrentMonth) return year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1);
    return day > today.getDate();
  };

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-full disabled:opacity-20 hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={22} className="text-yellow-500" />
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-xl">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            {monthTotalQty} cortes · {formatCurrency(monthTotalEarnings)}
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={22} className="text-yellow-500" />
        </button>
      </div>

      {/* Per-service badge row */}
      {monthTotalQty > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['cabelo', 'combo', 'barba', 'premium'] as const).map(type => (
            serviceTotals[type] > 0 ? (
              <span
                key={type}
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: SERVICE_COLORS[type] + '22', color: SERVICE_COLORS[type] }}
              >
                {serviceTotals[type]}× {type}
              </span>
            ) : null
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-800">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: rows * 7 }, (_, i) => {
            const day = i - firstWeekday + 1;
            const isValid = day >= 1 && day <= daysInMonth;
            const isToday = isCurrentMonth && day === today.getDate();
            const future = isValid && isFuture(day);
            const entry = isValid ? getEntry(year, month, day) : undefined;
            const qty = entry ? totalCuts(entry) : 0;
            const earnings = entry ? totalEarnings(entry, prices) : 0;
            const hasData = qty > 0;

            return (
              <button
                key={i}
                disabled={!isValid || future}
                onClick={() => isValid && !future && setEditDay(day)}
                className={`
                  relative min-h-[64px] sm:min-h-[72px] flex flex-col items-center justify-start pt-1.5 pb-1 px-0.5
                  border-b border-r border-gray-800/50 transition-colors
                  ${!isValid ? 'opacity-0 pointer-events-none' : ''}
                  ${future ? 'opacity-25 cursor-not-allowed' : ''}
                  ${isValid && !future ? 'hover:bg-gray-800/60 active:bg-gray-800 cursor-pointer' : ''}
                  ${hasData ? 'bg-yellow-900/10' : ''}
                `}
              >
                {isValid && (
                  <>
                    <span className={`
                      text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-yellow-500 text-black' : hasData ? 'text-yellow-300' : 'text-gray-400'}
                    `}>
                      {day}
                    </span>
                    {hasData && (
                      <>
                        <span className="text-yellow-400 font-bold text-xs mt-0.5">{qty}</span>
                        <span className="text-gray-500 text-[10px] leading-tight">
                          {formatCurrency(earnings).replace('R$ ', '')}
                        </span>
                      </>
                    )}
                    {/* Service color dots */}
                    {entry && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {(['cabelo', 'combo', 'barba', 'premium'] as const).map(t =>
                          entry[t] > 0 ? (
                            <span key={t} className="w-1.5 h-1.5 rounded-full" style={{ background: SERVICE_COLORS[t] }} />
                          ) : null
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">Toque num dia para lançar os cortes</p>

      {editDay !== null && (
        <DayEntryModal
          year={year}
          month={month}
          day={editDay}
          initial={getEntry(year, month, editDay)}
          prices={prices}
          onSave={onSave}
          onClose={() => setEditDay(null)}
        />
      )}
    </div>
  );
}
