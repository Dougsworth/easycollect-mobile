import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, SafeAreaView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

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
    <View className={cn('mb-4', className)}>
      {label && <Text style={{ fontSize: ms(13), marginBottom: s(6) }} className="font-semibold text-foreground">{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'rounded-xl border bg-white flex-row items-center justify-between',
          error ? 'border-destructive' : 'border-border',
        )}
        style={{ height: s(46), paddingHorizontal: s(16) }}
      >
        <Text style={{ fontSize: ms(15) }} className={selectedOption ? 'text-foreground' : 'text-gray-400'}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronDown size={s(16)} color="#9ca3af" />
      </Pressable>
      {error && <Text style={{ fontSize: ms(13), marginTop: s(4) }} className="text-destructive">{error}</Text>}

      <Modal visible={open} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpen(false)} />
        <SafeAreaView className="bg-white rounded-t-3xl max-h-[60%]">
          <View style={{ padding: s(16) }} className="border-b border-border">
            <Text style={{ fontSize: ms(17) }} className="font-semibold text-foreground">{label ?? 'Select'}</Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onValueChange(item.value); setOpen(false); }}
                className="flex-row items-center justify-between border-b border-border/50"
                style={{ paddingHorizontal: s(16), paddingVertical: s(14) }}
              >
                <Text style={{ fontSize: ms(15) }} className="text-foreground">{item.label}</Text>
                {item.value === value && <Check size={s(16)} color="#3b82f6" />}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
