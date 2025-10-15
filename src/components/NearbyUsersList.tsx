import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import WiFiDirectService, { NearbyUser } from '../services/WiFiDirectService';

interface NearbyUsersListProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect?: (user: NearbyUser) => void;
}

export default function NearbyUsersList({ visible, onClose, onUserSelect }: NearbyUsersListProps) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  useEffect(() => {
    if (visible) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [visible]);

  const startScanning = async () => {
    setIsScanning(true);
    try {
      await WiFiDirectService.startScanning((users) => {
        setNearbyUsers(users);
      });
    } catch (error) {
      console.error('Failed to start scanning:', error);
      Alert.alert('Error', 'Failed to start scanning for nearby users.');
    }
  };

  const stopScanning = () => {
    WiFiDirectService.stopScanning();
    setIsScanning(false);
  };

  const handleUserConnect = async (user: NearbyUser) => {
    try {
      const success = await WiFiDirectService.connectToUser(user.id);
      if (success) {
        setSelectedUser(user);
        Alert.alert('Connected', `Successfully connected to ${user.name}`);
        if (onUserSelect) {
          onUserSelect(user);
        }
      }
    } catch (error) {
      console.error('Failed to connect to user:', error);
    }
  };

  const handleUserDisconnect = async (user: NearbyUser) => {
    try {
      const success = await WiFiDirectService.disconnectFromUser(user.id);
      if (success) {
        setSelectedUser(null);
        Alert.alert('Disconnected', `Disconnected from ${user.name}`);
      }
    } catch (error) {
      console.error('Failed to disconnect from user:', error);
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= -50) return 'text-green-500';
    if (strength >= -70) return 'text-yellow-500';
    if (strength >= -85) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSignalStrengthIcon = (strength: number) => {
    if (strength >= -50) return '📶';
    if (strength >= -70) return '📶';
    if (strength >= -85) return '📶';
    return '📶';
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) return '< 1m';
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="bg-charcoal-800 rounded-t-3xl w-full max-h-96">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-charcoal-700">
            <View className="flex-row items-center space-x-3">
              <Text className="text-sand-500 text-xl font-bold">Nearby Users</Text>
              {isScanning && (
                <ActivityIndicator size="small" color="#4A90E2" />
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-muted text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-6">
            {nearbyUsers.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-4xl mb-4">🔍</Text>
                <Text className="text-sand-500 text-lg font-semibold mb-2">
                  {isScanning ? 'Scanning for users...' : 'No nearby users found'}
                </Text>
                <Text className="text-muted text-center">
                  {isScanning 
                    ? 'Looking for other Trail Beacon users in your area'
                    : 'Make sure other users have the app open and are nearby'
                  }
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {nearbyUsers.map((user) => (
                  <View key={user.id} className="bg-charcoal-700 rounded-xl p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-sand-500 text-lg font-semibold">
                          {user.name}
                        </Text>
                        <Text className="text-muted text-sm">
                          {user.deviceName}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className={`text-sm font-semibold ${getSignalStrengthColor(user.signalStrength)}`}>
                          {getSignalStrengthIcon(user.signalStrength)} {user.signalStrength}dBm
                        </Text>
                        <Text className="text-muted text-xs">
                          {formatDistance(user.distance)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center space-x-1">
                          <Text className="text-muted text-xs">📍</Text>
                          <Text className="text-muted text-xs">
                            {formatLastSeen(user.lastSeen)}
                          </Text>
                        </View>
                        <View className={`rounded-full px-2 py-1 ${
                          user.isConnected ? 'bg-green-500/20' : 'bg-charcoal-600'
                        }`}>
                          <Text className={`text-xs font-semibold ${
                            user.isConnected ? 'text-green-500' : 'text-muted'
                          }`}>
                            {user.isConnected ? 'Connected' : 'Available'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        className={`rounded-xl px-4 py-2 ${
                          user.isConnected 
                            ? 'bg-rust-500' 
                            : 'bg-sky-500'
                        }`}
                        onPress={() => 
                          user.isConnected 
                            ? handleUserDisconnect(user)
                            : handleUserConnect(user)
                        }
                      >
                        <Text className="text-white text-sm font-semibold">
                          {user.isConnected ? 'Disconnect' : 'Connect'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-6 border-t border-charcoal-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted text-sm">
                {nearbyUsers.length} user{nearbyUsers.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity
                className="bg-moss-500 rounded-xl px-4 py-2"
                onPress={isScanning ? stopScanning : startScanning}
              >
                <Text className="text-white text-sm font-semibold">
                  {isScanning ? 'Stop Scan' : 'Start Scan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
