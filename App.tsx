/**
 * BoostIQ Pro Mobile App
 * Updated: Metro cache should be cleared after this change
 */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import CoursesScreen from './screens/CoursesScreen';
import OptimizeScreen from './screens/OptimizeScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdvancedOptimizeScreen from './screens/AdvancedOptimizeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <NavigationContainer>
                    <Tab.Navigator
                        screenOptions={{
                            tabBarActiveTintColor: '#6200ee',
                            tabBarInactiveTintColor: '#757575',
                            tabBarStyle: {
                                paddingBottom: 5,
                                paddingTop: 5,
                                height: 60
                            }
                        }}
                    >
                        <Tab.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                tabBarIcon: ({ color }) => (
                                    <MaterialCommunityIcons name="home" color={color} size={26} />
                                ),
                            }}
                        />
                        <Tab.Screen
                            name="Courses"
                            component={CoursesScreen}
                            options={{
                                tabBarIcon: ({ color }) => (
                                    <MaterialCommunityIcons name="book-open-variant" color={color} size={26} />
                                ),
                            }}
                        />
                        <Tab.Screen
                            name="Optimize"
                            component={AdvancedOptimizeScreen}
                            options={{
                                tabBarIcon: ({ color }) => (
                                    <MaterialCommunityIcons name="lightning-bolt" color={color} size={26} />
                                ),
                            }}
                        />
                        <Tab.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{
                                tabBarIcon: ({ color }) => (
                                    <MaterialCommunityIcons name="account" color={color} size={26} />
                                ),
                            }}
                        />
                    </Tab.Navigator>
                    <StatusBar style="auto" />
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
