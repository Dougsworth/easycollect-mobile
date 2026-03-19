import { ScrollView, Pressable, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface FilterTab {
  label: string;
  value: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          onPress={() => onTabChange(tab.value)}
          className={cn(
            'mr-2 rounded-full px-4 py-2',
            activeTab === tab.value ? 'bg-primary' : 'bg-muted',
          )}
        >
          <Text
            className={cn(
              'text-sm font-medium',
              activeTab === tab.value ? 'text-white' : 'text-muted-foreground',
            )}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
