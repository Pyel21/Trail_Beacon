import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RootStackParamList } from '../../App';
import MessagingService from '../services/MessagingService';

const schema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(6, 'Min 6 characters')
});

type Form = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
	const [isLoading, setIsLoading] = useState(false);
	const { control, handleSubmit, formState: { errors } } = useForm<Form>({ 
		defaultValues: { email: '', password: '' }, 
		resolver: zodResolver(schema) 
	});

	const onSubmit = async (data: Form) => {
		setIsLoading(true);
		try {
			// For now, we'll do a simple user lookup
			// In production, you'd implement proper authentication
			const users = await MessagingService.getMessages(data.email, undefined, undefined, 1);
			
			// Simple demo authentication - in production use proper auth
			if (data.email && data.password) {
				Alert.alert(
					'Login Successful', 
					'Welcome back to Trail Beacon!',
					[{ text: 'OK', onPress: () => navigation.replace('Home') }]
				);
			} else {
				Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
			}
		} catch (error) {
			console.error('Login error:', error);
			Alert.alert('Login Failed', 'An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const renderInput = (name: keyof Form, placeholder: string, secureTextEntry = false, keyboardType: any = 'default') => (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, onBlur, value } }) => (
				<View className="mb-4">
					<Text className="text-sand-500 text-sm font-medium mb-2">
						{placeholder}
					</Text>
					<View className={`bg-charcoal-800 border rounded-xl px-4 py-3 ${
						errors[name] ? 'border-rust-500' : 'border-charcoal-600'
					}`}>
						<TextInput
							className="text-sand-500 text-base"
							placeholder={placeholder}
							placeholderTextColor="#6B6B6B"
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							secureTextEntry={secureTextEntry}
							keyboardType={keyboardType}
						/>
					</View>
					{errors[name] && (
						<Text className="text-rust-500 text-sm mt-1">
							{errors[name]?.message}
						</Text>
					)}
				</View>
			)}
		/>
	);

	return (
		<View className="flex-1 bg-charcoal-900">
			{/* Header */}
			<View className="flex-row items-center justify-between px-6 py-4 bg-charcoal-800">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text className="text-sky-500 text-lg">← Back</Text>
				</TouchableOpacity>
				<Text className="text-sand-500 text-xl font-bold">Login</Text>
				<View className="w-16" />
			</View>

			<ScrollView className="flex-1 px-6 py-6">
				<Text className="text-sand-500 text-2xl font-bold mb-2">Welcome Back!</Text>
				<Text className="text-muted text-base mb-8">
					Sign in to continue your Trail Beacon journey
				</Text>

				{renderInput('email', 'Email Address', false, 'email-address')}
				{renderInput('password', 'Password', true)}

				{/* Login Button */}
				<TouchableOpacity 
					className={`rounded-xl py-4 px-6 items-center mt-6 ${
						isLoading ? 'bg-charcoal-700' : 'bg-sky-500'
					}`}
					onPress={handleSubmit(onSubmit)}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator size="small" color="#FFFFFF" />
					) : (
						<Text className="text-white font-bold text-lg">Sign In</Text>
					)}
				</TouchableOpacity>

				{/* Register Link */}
				<TouchableOpacity 
					className="mt-6"
					onPress={() => navigation.navigate('Register')}
				>
					<Text className="text-muted text-center">
						Don't have an account? <Text className="text-sky-500 font-semibold">Create Account</Text>
					</Text>
				</TouchableOpacity>

				{/* Demo Credentials */}
				<View className="mt-8 bg-charcoal-800 rounded-xl p-4">
					<Text className="text-sand-500 text-sm font-semibold mb-2">Demo Credentials:</Text>
					<Text className="text-muted text-sm">Email: aleckzz@example.com</Text>
					<Text className="text-muted text-sm">Password: (any password)</Text>
				</View>
			</ScrollView>
		</View>
	);
}