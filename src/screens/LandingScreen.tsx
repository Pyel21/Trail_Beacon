import React from 'react';
import { View, Image, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
	return (
		<ImageBackground 
			source={require('../../assets/mountain-landscape.jpg')} 
			className="flex-1 w-full h-full"
			resizeMode="cover"
		>
			<View className="flex-1 bg-black/40 items-center justify-center px-6">
				<Image 
					source={require('../../assets/TrailBeacon.png')} 
					className="w-48 h-28 mb-4" 
					resizeMode="contain" 
				/>
				<Text className="text-white text-3xl font-extrabold text-center mb-6 drop-shadow-lg">
					TRAIL BEACON
				</Text>
				<Text className="text-gray-200 text-lg text-center mb-12 drop-shadow-lg">
					Make your trail safer
				</Text>

				<TouchableOpacity 
					className="bg-primary py-4 px-10 rounded-2xl w-full items-center mb-4"
					onPress={() => navigation.navigate('Register')}
				>
					<Text className="text-bg font-bold text-base">
						Get Started
					</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate('Login')}>
					<Text className="text-gray-300 text-base drop-shadow-lg">
						Already have an account?
					</Text>
				</TouchableOpacity>
			</View>
		</ImageBackground>
	);
}