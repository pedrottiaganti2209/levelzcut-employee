import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { DayEntry, Prices, ServiceDef } from '../types';
import { DEFAULT_SERVICES, slugify, nextColor } from '../types';

export function useEmployeeData(user: User | null) {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  // Catálogo completo, incluindo serviços arquivados — precisa existir pra
  // preço/cor/nome de lançamentos antigos continuarem corretos mesmo depois
  // de o barbeiro remover aquele serviço da lista de edição.
  const [allServices, setAllServices] = useState<ServiceDef[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const { data: entriesData } = await supabase
      .from('employee_daily_entries')
      .select('year, month, day, counts')
      .eq('user_id', user.id);

    if (entriesData) {
      setEntries(entriesData.map((r: any) => ({
        year: r.year,
        month: r.month,
        day: r.day,
        counts: r.counts ?? {},
      })));
    }

    const { data: servicesData } = await supabase
      .from('employee_prices')
      .select('service_type, label, emoji, color, price, sort_order, is_core, archived')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (servicesData && servicesData.length > 0) {
      setAllServices(servicesData.map((r: any) => ({
        type: r.service_type,
        label: r.label ?? r.service_type,
        emoji: r.emoji ?? '✂️',
        color: r.color ?? '#D4AF37',
        price: Number(r.price),
        sortOrder: r.sort_order ?? 0,
        isCore: !!r.is_core,
        archived: !!r.archived,
      })));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Só os visíveis (não arquivados) — o que entra na tela de Valores e no
  // formulário de lançamento diário.
  const visibleServices = allServices.filter(s => !s.archived);

  const prices: Prices = {};
  allServices.forEach(s => { prices[s.type] = s.price; });

  const saveEntry = useCallback(async (entry: DayEntry) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      year: entry.year,
      month: entry.month,
      day: entry.day,
      counts: entry.counts,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('employee_daily_entries')
      .upsert(payload, { onConflict: 'user_id,year,month,day' });
    if (error) return;

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

  const savePrice = useCallback(async (type: string, price: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('employee_prices')
      .update({ price, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('service_type', type);
    if (error) return;
    setAllServices(prev => prev.map(s => (s.type === type ? { ...s, price } : s)));
  }, [user]);

  const addService = useCallback(async (label: string, emoji: string) => {
    if (!user) return;
    const trimmed = label.trim();
    if (!trimmed) return;
    const type = slugify(trimmed);

    setAllServices(prev => {
      const existingIdx = prev.findIndex(s => s.type === type);
      const sortOrder = existingIdx >= 0 ? prev[existingIdx].sortOrder : prev.length;
      const color = existingIdx >= 0 ? prev[existingIdx].color : nextColor(sortOrder);

      supabase
        .from('employee_prices')
        .upsert(
          {
            user_id: user.id,
            service_type: type,
            label: trimmed,
            emoji,
            color,
            sort_order: sortOrder,
            is_core: false,
            archived: false,
            price: existingIdx >= 0 ? prev[existingIdx].price : 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,service_type' }
        )
        .then(({ error }) => { if (error) loadData(); });

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], label: trimmed, emoji, archived: false };
        return next;
      }
      return [...prev, { type, label: trimmed, emoji, color, price: 0, sortOrder, isCore: false, archived: false }];
    });
  }, [user, loadData]);

  const removeService = useCallback(async (type: string) => {
    if (!user) return;
    const svc = allServices.find(s => s.type === type);
    if (!svc || svc.isCore) return;
    const { error } = await supabase
      .from('employee_prices')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('service_type', type)
      .eq('is_core', false);
    if (error) return;
    setAllServices(prev => prev.map(s => (s.type === type ? { ...s, archived: true } : s)));
  }, [user, allServices]);

  const getEntry = useCallback((year: number, month: number, day: number): DayEntry | undefined => {
    return entries.find(e => e.year === year && e.month === month && e.day === day);
  }, [entries]);

  const getMonthEntries = useCallback((year: number, month: number): DayEntry[] => {
    return entries.filter(e => e.year === year && e.month === month);
  }, [entries]);

  return {
    entries,
    allServices,
    visibleServices,
    prices,
    loading,
    saveEntry,
    savePrice,
    addService,
    removeService,
    getEntry,
    getMonthEntries,
  };
}
