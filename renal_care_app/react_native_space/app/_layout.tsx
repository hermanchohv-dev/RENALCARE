import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { IS_DEMO } from '@/src/api/customFetch';
import { DemoStatus } from '@/src/components/DemoStatus';
import { StatusBar } from 'react-native';

const queryClient = new QueryClient({ defaultOptions: { queries: { networkMode: IS_DEMO ? 'always' : 'online', retry: IS_DEMO ? false : 3 }, mutations: { networkMode: IS_DEMO ? 'always' : 'online' } } });

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar barStyle="light-content" />
          <DemoStatus />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="tabs" />
            <Stack.Screen name="historia" />
            <Stack.Screen name="tratamiento" />
            <Stack.Screen name="dieta" />
            <Stack.Screen name="ambulancia" />
            <Stack.Screen name="contacto" />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
