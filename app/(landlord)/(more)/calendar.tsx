import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoices } from '@/shared/services/invoices';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatDate } from '@/shared/utils';
import type { InvoiceWithTenant } from '@/shared/types/app.types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithTenant[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      getInvoices(user.id).then(setInvoices).catch(console.error);
    }
  }, [user]);

  const eventDays = useMemo(() => {
    const map = new Map<number, InvoiceWithTenant[]>();
    for (const inv of invoices) {
      const d = new Date(inv.due_date + 'T00:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(inv);
      }
    }
    return map;
  }, [invoices, year, month]);

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const selectedEvents = selectedDay ? eventDays.get(selectedDay) ?? [] : [];

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <PageHeader title="Calendar" showBack />
      <ScrollView className="flex-1 px-4">
        {/* Month Nav */}
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={prevMonth} className="p-2"><ChevronLeft size={24} color="#111827" /></Pressable>
          <Text className="text-lg font-semibold text-foreground">{MONTHS[month]} {year}</Text>
          <Pressable onPress={nextMonth} className="p-2"><ChevronRight size={24} color="#111827" /></Pressable>
        </View>

        {/* Day Headers */}
        <View className="flex-row mb-2">
          {DAYS.map(d => <Text key={d} className="flex-1 text-center text-xs font-medium text-muted-foreground">{d}</Text>)}
        </View>

        {/* Grid */}
        <View className="flex-row flex-wrap">
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <View key={`empty-${i}`} className="w-[14.28%] h-12" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const hasEvents = eventDays.has(day);
            const selected = selectedDay === day;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(selected ? null : day)}
                className={`w-[14.28%] h-12 items-center justify-center rounded-xl ${
                  selected ? 'bg-primary' : isToday(day) ? 'bg-primary-muted' : ''
                }`}
              >
                <Text className={`text-sm ${selected ? 'text-white font-bold' : isToday(day) ? 'text-primary font-bold' : 'text-foreground'}`}>
                  {day}
                </Text>
                {hasEvents && !selected && <View className="h-1.5 w-1.5 rounded-full bg-primary mt-0.5" />}
              </Pressable>
            );
          })}
        </View>

        {/* Selected Day Events */}
        {selectedDay && (
          <Card className="mt-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              {MONTHS[month]} {selectedDay} — {selectedEvents.length} invoice(s)
            </Text>
            {selectedEvents.map(inv => (
              <View key={inv.id} className="flex-row items-center justify-between py-2 border-b border-border/50">
                <View>
                  <Text className="text-sm text-foreground">{inv.tenant_first_name} {inv.tenant_last_name}</Text>
                  <Text className="text-xs text-muted-foreground">{inv.invoice_number}</Text>
                </View>
                <Text className="text-sm font-semibold">J${inv.amount.toLocaleString()}</Text>
              </View>
            ))}
            {selectedEvents.length === 0 && <Text className="text-sm text-muted-foreground">No events</Text>}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
