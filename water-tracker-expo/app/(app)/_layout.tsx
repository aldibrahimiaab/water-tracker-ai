import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#ccc',
      }}
    >
      <Tabs.Screen
        name="add-water"
        options={{
          title: 'Add Water',
          tabBarIcon: ({ color }) => <FontAwesome5 name="plus-circle" size={28} color={color} />,
          headerTitle: 'Add Water',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color }) => <FontAwesome5 name="chart-bar" size={28} color={color} />,
          headerTitle: 'Today Statistics',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={28} color={color} />,
          headerTitle: 'Profile',
        }}
      />
    </Tabs>
  );
}
