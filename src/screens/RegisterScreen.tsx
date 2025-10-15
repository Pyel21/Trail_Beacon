// src/screens/RegisterScreen.tsx
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
	username: z.string().min(3, 'Min 3 characters'),
	password: z.string().min(6, 'Min 6 characters'),
	confirmPassword: z.string(),
	name: z.string().min(2, 'Min 2 characters'),
	age: z.string().regex(/^[0-9]{1,3}$/, 'Enter a valid age'),
	sex: z.enum(['Male', 'Female', 'Other']).or(z.string().min(1, 'Required')),
	address: z.string().min(3, 'Required'),
	phone: z.string().optional(),
	emergency_contact: z.string().optional(),
	medical_info: z.string().optional()
}).refine(v => v.password === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type Form = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
	const [isLoading, setIsLoading] = useState(false);
	const { control, handleSubmit, formState: { errors } } = useForm<Form>({
		defaultValues: { 
			email: '', 
			username: '', 
			password: '', 
			confirmPassword: '', 
			name: '',
			age: '', 
			sex: '', 
			address: '',
			phone: '',
			emergency_contact: '',
			medical_info: ''
		},
		resolver: zodResolver(schema)
	});

	const onSubmit = async (data: Form) => {
		setIsLoading(true);
		try {
			// Create user in Supabase
			const userData = {
				email: data.email,
				username: data.username,
				password: data.password, // In production, hash this password
				name: data.name,
				age: parseInt(data.age),
				sex: data.sex,
				address: data.address,
				phone: data.phone || null,
				emergency_contact: data.emergency_contact || null,
				medical_info: data.medical_info || null
			};

			const user = await MessagingService.createUser(userData as any);
			
			if (user) {
				Alert.alert(
					'Registration Successful', 
					'Your account has been created successfully!',
					[{ text: 'OK', onPress: () => navigation.replace('Home') }]
				);
			} else {
				Alert.alert('Registration Failed', 'Failed to create account. Please try again.');
			}
		} catch (error) {
			console.error('Registration error:', error);
			Alert.alert('Registration Failed', 'An error occurred. Please try again.');
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
							multiline={name === 'address' || name === 'medical_info'}
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
				<Text className="text-sand-500 text-xl font-bold">Register</Text>
				<View className="w-16" />
			</View>

			<ScrollView className="flex-1 px-6 py-6">
				<Text className="text-sand-500 text-2xl font-bold mb-2">Create Account</Text>
				<Text className="text-muted text-base mb-8">
					Set up your Trail Beacon profile to start your hiking journey
				</Text>

				{/* Personal Information */}
				<Text className="text-sand-500 text-lg font-semibold mb-4">Personal Information</Text>
				{renderInput('name', 'Full Name')}
				{renderInput('email', 'Email Address', false, 'email-address')}
				{renderInput('username', 'Username')}
				{renderInput('age', 'Age', false, 'numeric')}
				
				<View className="mb-4">
					<Text className="text-sand-500 text-sm font-medium mb-2">Sex</Text>
					<Controller
						control={control}
						name="sex"
						render={({ field: { onChange, value } }) => (
							<View className="flex-row space-x-3">
								{['Male', 'Female', 'Other'].map((option) => (
									<TouchableOpacity
										key={option}
										className={`flex-1 py-3 px-4 rounded-xl border ${
											value === option 
												? 'bg-sky-500 border-sky-500' 
												: 'bg-charcoal-800 border-charcoal-600'
										}`}
										onPress={() => onChange(option)}
									>
										<Text className={`text-center font-semibold ${
											value === option ? 'text-white' : 'text-sand-500'
										}`}>
											{option}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
					/>
					{errors.sex && (
						<Text className="text-rust-500 text-sm mt-1">
							{errors.sex?.message}
						</Text>
					)}
				</View>

				{renderInput('address', 'Address')}

				{/* Contact Information */}
				<Text className="text-sand-500 text-lg font-semibold mb-4 mt-6">Contact Information</Text>
				{renderInput('phone', 'Phone Number (Optional)', false, 'phone-pad')}
				{renderInput('emergency_contact', 'Emergency Contact (Optional)', false, 'phone-pad')}

				{/* Medical Information */}
				<Text className="text-sand-500 text-lg font-semibold mb-4 mt-6">Medical Information (Optional)</Text>
				{renderInput('medical_info', 'Medical Conditions, Allergies, etc.')}

				{/* Security */}
				<Text className="text-sand-500 text-lg font-semibold mb-4 mt-6">Security</Text>
				{renderInput('password', 'Password', true)}
				{renderInput('confirmPassword', 'Confirm Password', true)}

				{/* Register Button */}
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
						<Text className="text-white font-bold text-lg">Create Account</Text>
					)}
				</TouchableOpacity>

				{/* Login Link */}
				<TouchableOpacity 
					className="mt-6"
					onPress={() => navigation.navigate('Login')}
				>
					<Text className="text-muted text-center">
						Already have an account? <Text className="text-sky-500 font-semibold">Sign In</Text>
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}


