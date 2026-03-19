import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="properties/index" />
      <Stack.Screen name="properties/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reports" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="activity-log" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
}
