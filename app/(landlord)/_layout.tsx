import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, FileText, DollarSign, MoreHorizontal } from 'lucide-react-native';
import { AiChat } from '@/components/AiChat';

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
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 26 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
        }}
      >
        <Tabs.Screen
          name="(dashboard)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <LayoutDashboard size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="(tenants)"
          options={{
            title: 'Tenants',
            tabBarIcon: ({ color, focused }) => (
              <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="(invoices)"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color, focused }) => (
              <FileText size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="(payments)"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, focused }) => (
              <DollarSign size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="(more)"
          options={{
            title: 'More',
            tabBarIcon: ({ color, focused }) => (
              <MoreHorizontal size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
      </Tabs>
      <AiChat />
    </View>
  );
}
