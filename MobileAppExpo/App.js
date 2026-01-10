import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { Ionicons } from '@expo/vector-icons';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import EnvironmentScreen from './src/screens/EnvironmentScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import DiseaseDetectionScreen from './src/screens/DiseaseDetectionScreen';
import GrowthPredictionScreen from './src/screens/GrowthPredictionScreen';
import MushroomTypeScreen from './src/screens/MushroomTypeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // IMPORTANT: don't hide the header
          headerShown: true,

          // Your old header styling
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#e5e7eb',
          headerTitleStyle: { fontWeight: '600' },

          // Your old tab styling
          tabBarStyle: { backgroundColor: '#020617' },
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: '#64748b',

          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Type') {
              return (
                <MaterialCommunityIcons
                  name="mushroom"
                  size={size}
                  color={color}
                />
              );
            }

            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Environmental Monitoring') iconName = 'thermometer';
            else if (route.name === 'Pests') iconName = 'bug';
            else if (route.name === 'Disease') iconName = 'medkit';
            else if (route.name === 'Growth') iconName = 'stats-chart';

            return <Ionicons name={iconName} size={size} color={color} />;
          },

        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Environmental Monitoring" component={EnvironmentScreen} />
        <Tab.Screen name="Pests" component={PestDetectionScreen} />
        <Tab.Screen name="Disease" component={DiseaseDetectionScreen} />
        <Tab.Screen name="Growth" component={GrowthPredictionScreen} />
        <Tab.Screen name="Type" component={MushroomTypeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
