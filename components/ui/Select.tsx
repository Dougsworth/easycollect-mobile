import { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, SafeAreaView } from 'react-native';
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
    <View className={cn('mb-4', className)}>
      {label && <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'h-12 rounded-xl border bg-white px-4 flex-row items-center justify-between',
          error ? 'border-destructive' : 'border-border',
        )}
      >
        <Text className={selectedOption ? 'text-foreground text-base' : 'text-gray-400 text-base'}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#9ca3af" />
      </Pressable>
      {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}

      <Modal visible={open} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpen(false)} />
        <SafeAreaView className="bg-white rounded-t-3xl max-h-[60%]">
          <View className="p-4 border-b border-border">
            <Text className="text-lg font-semibold text-foreground">{label ?? 'Select'}</Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onValueChange(item.value); setOpen(false); }}
                className="flex-row items-center justify-between px-4 py-3.5 border-b border-border/50"
              >
                <Text className="text-base text-foreground">{item.label}</Text>
                {item.value === value && <Check size={18} color="#3b82f6" />}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
