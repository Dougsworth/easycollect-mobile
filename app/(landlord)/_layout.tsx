import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, FileText, DollarSign, MoreHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AiChat } from '@/components/AiChat';

function TabIcon({ Icon, color, focused }: { Icon: any; color: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />
      {focused && (
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: '#0f172a',
            position: 'absolute',
            bottom: -10,
          }}
        />
      )}
    </View>
  );
}

export default function LandlordLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0f172a',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            backgroundColor: '#ffffff',
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
        screenListeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
      >
        <Tabs.Screen
          name="(dashboard)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={LayoutDashboard} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(tenants)"
          options={{
            title: 'Tenants',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Users} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(invoices)"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={FileText} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(payments)"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={DollarSign} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(more)"
          options={{
            title: 'More',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={MoreHorizontal} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      <AiChat />
    </View>
  );
}
