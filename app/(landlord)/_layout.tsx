import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, FileText, DollarSign, MoreHorizontal } from 'lucide-react-native';
import { AiChat } from '@/components/AiChat';

export default function LandlordLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            borderTopColor: '#e5e7eb',
            backgroundColor: '#ffffff',
            height: 85,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="(dashboard)"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(tenants)"
          options={{
            title: 'Tenants',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(invoices)"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(payments)"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(more)"
          options={{
            title: 'More',
            tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
          }}
        />
      </Tabs>
      <AiChat />
    </View>
  );
}
