import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import WiFiDirectService, { NearbyUser } from '../services/WiFiDirectService';

export default function WiFiDirectDemo() {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    // Start broadcasting on component mount
    startBroadcasting();
    
    return () => {
      WiFiDirectService.stopScanning();
    };
  }, []);

  const startBroadcasting = async () => {
    try {
      setIsBroadcasting(true);
      await WiFiDirectService.broadcastPresence('Demo User');
      Alert.alert('Broadcasting Started', 'Your device is now visible to other Trail Beacon users.');
    } catch (error) {
      console.error('Failed to start broadcasting:', error);
      Alert.alert('Error', 'Failed to start broadcasting your presence.');
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
    try {
      await WiFiDirectService.startScanning((users) => {
        setNearbyUsers(users);
      });
    } catch (error) {
      console.error('Failed to start scanning:', error);
      Alert.alert('Error', 'Failed to start scanning for nearby users.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    WiFiDirectService.stopScanning();
    setIsScanning(false);
    setNearbyUsers([]);
  };

  const connectToUser = async (user: NearbyUser) => {
    try {
      const success = await WiFiDirectService.connectToUser(user.id);
      if (success) {
        Alert.alert('Connected', `Successfully connected to ${user.name}`);
      }
    } catch (error) {
      console.error('Failed to connect to user:', error);
    }
  };

  const disconnectFromUser = async (user: NearbyUser) => {
    try {
      const success = await WiFiDirectService.disconnectFromUser(user.id);
      if (success) {
        Alert.alert('Disconnected', `Disconnected from ${user.name}`);
      }
    } catch (error) {
      console.error('Failed to disconnect from user:', error);
    }
  };

  return (
    <View className="flex-1 bg-charcoal-900 p-6">
      <Text className="text-sand-500 text-2xl font-bold mb-6 text-center">
        WiFi Direct Demo
      </Text>

      {/* Status */}
      <View className="bg-charcoal-800 rounded-xl p-4 mb-6">
        <Text className="text-sand-500 text-lg font-semibold mb-3">Status</Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-muted">Broadcasting:</Text>
            <View className={`rounded-full px-3 py-1 ${
              isBroadcasting ? 'bg-green-500/20' : 'bg-charcoal-600'
            }`}>
              <Text className={`text-sm font-semibold ${
                isBroadcasting ? 'text-green-500' : 'text-muted'
              }`}>
                {isBroadcasting ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-muted">Scanning:</Text>
            <View className={`rounded-full px-3 py-1 ${
              isScanning ? 'bg-sky-500/20' : 'bg-charcoal-600'
            }`}>
              <Text className={`text-sm font-semibold ${
                isScanning ? 'text-sky-500' : 'text-muted'
              }`}>
                {isScanning ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-muted">Nearby Users:</Text>
            <Text className="text-sand-500 font-semibold">
              {nearbyUsers.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="space-y-3 mb-6">
        <TouchableOpacity
          className={`rounded-xl py-4 px-6 ${
            isScanning ? 'bg-rust-500' : 'bg-sky-500'
          }`}
          onPress={isScanning ? stopScanning : startScanning}
        >
          <Text className="text-white text-center font-bold text-lg">
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-moss-500 rounded-xl py-4 px-6"
          onPress={startBroadcasting}
        >
          <Text className="text-white text-center font-bold text-lg">
            Restart Broadcasting
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nearby Users */}
      <View className="flex-1">
        <Text className="text-sand-500 text-lg font-semibold mb-4">
          Nearby Users ({nearbyUsers.length})
        </Text>
        
        {nearbyUsers.length === 0 ? (
          <View className="bg-charcoal-800 rounded-xl p-8 items-center">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-sand-500 text-lg font-semibold mb-2">
              No nearby users found
            </Text>
            <Text className="text-muted text-center">
              {isScanning 
                ? 'Scanning for other Trail Beacon users...'
                : 'Start scanning to find nearby users'
              }
            </Text>
          </View>
        ) : (
          <ScrollView className="space-y-3">
            {nearbyUsers.map((user) => (
              <View key={user.id} className="bg-charcoal-800 rounded-xl p-4">
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
                    <Text className="text-muted text-sm">
                      {user.distance}m away
                    </Text>
                    <Text className="text-muted text-xs">
                      {user.signalStrength}dBm
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-2">
                    <View className={`w-2 h-2 rounded-full ${
                      user.isConnected ? 'bg-green-500' : 'bg-muted'
                    }`} />
                    <Text className="text-muted text-sm">
                      {user.isConnected ? 'Connected' : 'Available'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className={`rounded-xl px-4 py-2 ${
                      user.isConnected 
                        ? 'bg-rust-500' 
                        : 'bg-sky-500'
                    }`}
                    onPress={() => 
                      user.isConnected 
                        ? disconnectFromUser(user)
                        : connectToUser(user)
                    }
                  >
                    <Text className="text-white text-sm font-semibold">
                      {user.isConnected ? 'Disconnect' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
