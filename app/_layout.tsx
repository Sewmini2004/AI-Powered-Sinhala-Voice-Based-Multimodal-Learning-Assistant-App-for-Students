import { Stack, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AppProvider } from './(tabs)/AppContext';

// Temporary auth state. Replace this with your actual auth logic.
const isSignedIn = false;

export default function RootLayout() {
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  // This is where you would check for a token or user session
  // In a real app, you would load this from AsyncStorage or a similar service
  useEffect(() => {
    // Simulate a check
    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  }, []);

  if (!isReady) {
    return null; // or a SplashScreen component
  }

  return (
    <AppProvider>
      <Stack>
        {/* If the user is not signed in, show the auth stack */}
        {!isSignedIn && (
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
        )}
        {/* If the user is signed in, show the app (tabs) stack */}
        {isSignedIn && (
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
        )}
      </Stack>
    </AppProvider>
  );
}