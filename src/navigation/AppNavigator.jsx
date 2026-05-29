// saflash — Root app navigator
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getConfig } from '../database/sessionRepository';
import useAppStore from '../store/appStore';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const onboardingDone = useAppStore(s => s.onboardingDone);
  const setOnboardingDoneStore = useAppStore(s => s.setOnboardingDone);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const config = await getConfig();
      const done = config?.onboarding_done === 1 || config?.first_launch === 0;
      setOnboardingDoneStore(done);
      setInitialRoute(done ? 'MainTabs' : 'Onboarding');
    } catch (err) {
      // If DB not ready yet, show onboarding
      setInitialRoute('Onboarding');
    }
  };

  // Show nothing while checking
  if (!initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
