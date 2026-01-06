// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import EnvironmentScreen from './src/screens/EnvironmentScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import DiseaseDetectionScreen from './src/screens/DiseaseDetectionScreen';
import GrowthPredictionScreen from './src/screens/GrowthPredictionScreen';
import MushroomTypeScreen from "./src/screens/MushroomTypeScreen";


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Environment') {
              iconName = 'leaf';
            } else if (route.name === 'Pests') {
              iconName = 'bug';
            } else if (route.name === 'Disease') {
              iconName = 'medkit';
            } else if (route.name === 'Growth') {
              iconName = 'stats-chart';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Environment" component={EnvironmentScreen} />
        <Tab.Screen name="Pests" component={PestDetectionScreen} />
        <Tab.Screen name="Disease" component={DiseaseDetectionScreen} />
        <Tab.Screen name="Growth" component={GrowthPredictionScreen} />
        <Tab.Screen name="MushroomType" component={MushroomTypeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
