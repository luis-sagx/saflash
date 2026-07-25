// saflash — Stack for the guided path tab.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PathScreen from '../screens/PathScreen';
import StudyLessonScreen from '../screens/StudyLessonScreen';

const Stack = createNativeStackNavigator();

export default function PathNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Path" component={PathScreen} />
      <Stack.Screen name="StudyLesson" component={StudyLessonScreen} />
    </Stack.Navigator>
  );
}
