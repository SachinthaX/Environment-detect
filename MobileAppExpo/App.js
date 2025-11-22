import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen';
import EnvironmentScreen from './src/screens/EnvironmentScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import DiseaseDetectionScreen from './src/screens/DiseaseDetectionScreen';
import GrowthPredictionScreen from './src/screens/GrowthPredictionScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#e5e7eb',
          headerTitleStyle: { fontWeight: '600' },
          tabBarStyle: { backgroundColor: '#020617' },
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: '#64748b',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Environment" component={EnvironmentScreen} />
        <Tab.Screen name="Pests" component={PestDetectionScreen} />
        <Tab.Screen name="Disease" component={DiseaseDetectionScreen} />
        <Tab.Screen name="Growth" component={GrowthPredictionScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
