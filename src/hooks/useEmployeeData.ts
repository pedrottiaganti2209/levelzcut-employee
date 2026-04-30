import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { DayEntry, Prices, ServiceType } from '../types';
import { DEFAULT_PRICES } from '../types';

export function useEmployeeData(user: User | null) {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [prices, setPrices] = useState<Prices>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    // Load entries
    const { data: entriesData } = await supabase
      .from('employee_daily_entries')
      .select('*')
      .eq('user_id', user.id);

    if (entriesData) {
      setEntries(entriesData.map((r: any) => ({
        year: r.year,
        month: r.month,
        day: r.day,
        cabelo: r.cabelo ?? 0,
        combo: r.combo ?? 0,
        barba: r.barba ?? 0,
        premium: r.premium ?? 0,
      })));
    }

    // Load prices
    const { data: pricesData } = await supabase
      .from('employee_prices')
      .select('*')
      .eq('user_id', user.id);

    if (pricesData && pricesData.length > 0) {
      const p: Prices = { ...DEFAULT_PRICES };
      pricesData.forEach((r: any) => {
        p[r.service_type as ServiceType] = Number(r.price);
      });
      setPrices(p);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveEntry = useCallback(async (entry: DayEntry) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      year: entry.year,
      month: entry.month,
      day: entry.day,
      cabelo: entry.cabelo,
      combo: entry.combo,
      barba: entry.barba,
      premium: entry.premium,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('employee_daily_entries')
      .upsert(payload, { onConflict: 'user_id,year,month,day' });
    if (error) { console.error(error); return; }

    setEntries(prev => {
      const idx = prev.findIndex(e => e.year === entry.year && e.month === entry.month && e.day === entry.day);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, [user]);

  const savePrice = useCallback(async (type: ServiceType, price: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('employee_prices')
      .upsert(
        { user_id: user.id, service_type: type, price, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,service_type' }
      );
    if (error) { console.error(error); return; }
    setPrices(prev => ({ ...prev, [type]: price }));
  }, [user]);

  const getEntry = useCallback((year: number, month: number, day: number): DayEntry | undefined => {
    return entries.find(e => e.year === year && e.month === month && e.day === day);
  }, [entries]);

  const getMonthEntries = useCallback((year: number, month: number): DayEntry[] => {
    return entries.filter(e => e.year === year && e.month === month);
  }, [entries]);

  return { entries, prices, loading, saveEntry, savePrice, getEntry, getMonthEntries };
}
