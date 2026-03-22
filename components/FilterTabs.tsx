import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

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
  const handlePress = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(value);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={st.scroll}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => handlePress(tab.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[st.tab, isActive ? st.tabActive : st.tabInactive]}
          >
            <Text style={[st.tabText, isActive && st.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <Text style={[st.tabCount, isActive && st.tabCountActive]}>
                {tab.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 12, gap: 6 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  tabActive: {
    backgroundColor: '#0f172a',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabCountActive: {
    color: 'rgba(255,255,255,0.6)',
  },
});
