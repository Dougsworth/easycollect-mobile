import { Stack } from 'expo-router';

export default function TenantLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="receipt" />
      <Stack.Screen name="upload-receipt" />
    </Stack>
  );
}
