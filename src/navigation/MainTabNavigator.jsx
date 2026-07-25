// saflash — Main tab navigator (bottom tabs)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY } from '../theme/typography';
import PathNavigator from './PathNavigator';
import WordsNavigator from './WordsNavigator';
import PhrasesNavigator from './PhrasesNavigator';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  WordsNavigator: { focused: 'book', unfocused: 'book-outline' },
  PhrasesNavigator: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Progress: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.deepOlive,
        tabBarInactiveTintColor: COLORS.textPlaceholder,
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY.medium,
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surfaceWhite,
          borderTopColor: COLORS.borderSage,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={PathNavigator}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="WordsNavigator"
        component={WordsNavigator}
        options={{ tabBarLabel: 'Palabras' }}
      />
      <Tab.Screen
        name="PhrasesNavigator"
        component={PhrasesNavigator}
        options={{ tabBarLabel: 'Frases' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progreso',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
