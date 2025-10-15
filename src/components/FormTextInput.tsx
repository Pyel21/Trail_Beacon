import React from 'react';
import { TextInput, View, Text } from 'react-native';

interface FormTextInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
}

export default function FormTextInput({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  error 
}: FormTextInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-text text-sm font-medium mb-2">
        {label}
      </Text>
      <TextInput
        className={`bg-card border border-gray-600 rounded-xl px-4 py-3 text-text text-base ${
          error ? 'border-action' : 'border-gray-600'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#98A2AE"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
      {error && (
        <Text className="text-action text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
