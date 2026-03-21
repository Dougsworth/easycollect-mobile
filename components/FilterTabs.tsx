import { ScrollView, Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/utils';
import { s, ms } from '@/lib/responsive';

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: s(20), marginBottom: s(12) }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onTabChange(tab.value)}
            className={cn(
              'flex-row items-center',
              isActive ? 'bg-foreground' : 'bg-white border border-border',
            )}
            style={[
              {
                marginRight: s(8),
                borderRadius: s(20),
                paddingHorizontal: s(14),
                paddingVertical: s(7),
              },
              isActive ? undefined : {
                borderColor: '#e2e8f0',
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 4,
                elevation: 1,
              },
            ]}
          >
            <Text
              style={{ fontSize: ms(13) }}
              className={cn(
                'font-semibold',
                isActive ? 'text-white' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <View className={cn(
                'rounded-full items-center',
                isActive ? 'bg-white/20' : 'bg-muted',
              )}
                style={{ marginLeft: s(5), paddingHorizontal: s(5), minWidth: s(18) }}
              >
                <Text
                  style={{ fontSize: ms(10) }}
                  className={cn(
                    'font-semibold',
                    isActive ? 'text-white' : 'text-muted-foreground',
                  )}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
