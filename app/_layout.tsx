import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import RoleSwitcher from '../components/RoleSwitcher';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const role = process.env.EXPO_PUBLIC_APP_ROLE;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#080D1A" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F172A' },
            animation: 'fade',
          }}
        >
          {/* Default entry point */}
          <Stack.Screen name="index" />
          
          {/* Conditionally include only the active role's group */}
          {(!role || role === 'customer') && <Stack.Screen name="(customer)" />}
          {(!role || role === 'worker') && <Stack.Screen name="(worker)" />}
          {(!role || role === 'admin') && <Stack.Screen name="(admin)" />}
        </Stack>
        
        {/* Only show RoleSwitcher if no explicit env role is set */}
        {!role && <RoleSwitcher />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
