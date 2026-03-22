import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function Select({ label, placeholder = 'Select...', options, value, onValueChange, error, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <View className={cn(className)} style={{ marginBottom: 14 }}>
      {label && <Text style={st.label}>{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        style={[st.trigger, error && { borderColor: '#ef4444' }]}
      >
        <Text style={[st.triggerText, !selectedOption && { color: '#94a3b8' }]}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color="#94a3b8" />
      </Pressable>
      {error && <Text style={st.error}>{error}</Text>}

      <Modal visible={open} transparent animationType="slide">
        <Pressable style={st.overlay} onPress={() => setOpen(false)} />
        <SafeAreaView style={st.sheet}>
          <View style={st.sheetHeader}>
            <Text style={st.sheetTitle}>{label ?? 'Select'}</Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onValueChange(item.value); setOpen(false); }}
                style={st.option}
              >
                <Text style={st.optionText}>{item.label}</Text>
                {item.value === value && <Check size={16} color="#3b82f6" />}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500', color: '#0f172a', marginBottom: 6 },
  trigger: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: { fontSize: 15, color: '#0f172a' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  sheetHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: { fontSize: 15, color: '#0f172a' },
});
