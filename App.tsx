import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from './src/screens/LandingScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import SOSSettingsScreen from './src/screens/SOSSettingsScreen';

export type RootStackParamList = {
	Landing: undefined;
	Login: undefined;
	Register: undefined;
	Home: undefined;
	Map: undefined;
	AccountSettings: undefined;
	SOSSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Landing" component={LandingScreen} />
				<Stack.Screen name="Register" component={RegisterScreen} />
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="Map" component={MapScreen} />
				<Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
				<Stack.Screen name="SOSSettings" component={SOSSettingsScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}