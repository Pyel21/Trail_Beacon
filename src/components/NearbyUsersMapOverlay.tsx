import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import WiFiDirectService, { NearbyUser } from '../services/WiFiDirectService';

interface NearbyUsersMapOverlayProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect?: (user: NearbyUser) => void;
}

const { width, height } = Dimensions.get('window');

export default function NearbyUsersMapOverlay({ visible, onClose, onUserSelect }: NearbyUsersMapOverlayProps) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isScanning, setIsScanning] = useState(false);

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
    }
  };

  const stopScanning = () => {
    WiFiDirectService.stopScanning();
    setIsScanning(false);
  };

  const handleUserSelect = (user: NearbyUser) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= -50) return '#22C55E'; // green
    if (strength >= -70) return '#EAB308'; // yellow
    if (strength >= -85) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getDistanceFromCenter = (user: NearbyUser, index: number) => {
    // Calculate position based on signal strength and index
    const baseDistance = Math.max(20, Math.min(80, 100 - (user.signalStrength + 100)));
    const angle = (index * 360) / Math.max(nearbyUsers.length, 1);
    const radians = (angle * Math.PI) / 180;
    
    return {
      x: Math.cos(radians) * baseDistance,
      y: Math.sin(radians) * baseDistance
    };
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        {/* Map Overlay */}
        <View className="flex-1 relative">
          {/* Center point (current user) */}
          <View 
            className="absolute items-center justify-center"
            style={{
              left: width / 2 - 15,
              top: height / 2 - 15,
              width: 30,
              height: 30,
            }}
          >
            <View className="w-8 h-8 bg-sky-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">ME</Text>
            </View>
            <View className="absolute w-16 h-16 border-2 border-sky-500/30 rounded-full -top-4 -left-4" />
          </View>

          {/* Nearby users */}
          {nearbyUsers.map((user, index) => {
            const position = getDistanceFromCenter(user, index);
            const signalColor = getSignalStrengthColor(user.signalStrength);
            
            return (
              <TouchableOpacity
                key={user.id}
                className="absolute items-center justify-center"
                style={{
                  left: width / 2 + position.x - 20,
                  top: height / 2 + position.y - 20,
                  width: 40,
                  height: 40,
                }}
                onPress={() => handleUserSelect(user)}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: signalColor }}
                >
                  <Text className="text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                {/* Signal strength indicator */}
                <View 
                  className="absolute w-6 h-6 border-2 rounded-full -top-1 -left-1"
                  style={{ borderColor: signalColor }}
                />
                
                {/* User name */}
                <View className="absolute -bottom-6 bg-charcoal-800 rounded-lg px-2 py-1">
                  <Text className="text-sand-500 text-xs font-semibold">
                    {user.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Scanning indicator */}
          {isScanning && (
            <View className="absolute top-16 left-4 right-4">
              <View className="bg-charcoal-800/90 rounded-xl p-3 flex-row items-center space-x-3">
                <View className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                <Text className="text-sand-500 text-sm font-medium">
                  Scanning for nearby users...
                </Text>
              </View>
            </View>
          )}

          {/* User count */}
          <View className="absolute top-16 right-4">
            <View className="bg-charcoal-800/90 rounded-xl p-3">
              <Text className="text-sand-500 text-sm font-semibold">
                {nearbyUsers.length} user{nearbyUsers.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View className="absolute bottom-16 left-4 right-4">
            <View className="bg-charcoal-800/90 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity
                    className="bg-moss-500 rounded-xl px-4 py-2"
                    onPress={isScanning ? stopScanning : startScanning}
                  >
                    <Text className="text-white text-sm font-semibold">
                      {isScanning ? 'Stop' : 'Scan'}
                    </Text>
                  </TouchableOpacity>
                  
                  <Text className="text-muted text-sm">
                    Tap users to connect
                  </Text>
                </View>
                
                <TouchableOpacity
                  className="bg-rust-500 rounded-xl px-4 py-2"
                  onPress={onClose}
                >
                  <Text className="text-white text-sm font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View className="absolute bottom-32 left-4">
            <View className="bg-charcoal-800/90 rounded-xl p-3">
              <Text className="text-sand-500 text-sm font-semibold mb-2">
                Signal Strength:
              </Text>
              <View className="space-y-1">
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 bg-green-500 rounded-full" />
                  <Text className="text-muted text-xs">Strong</Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <Text className="text-muted text-xs">Good</Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 bg-orange-500 rounded-full" />
                  <Text className="text-muted text-xs">Weak</Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <View className="w-3 h-3 bg-red-500 rounded-full" />
                  <Text className="text-muted text-xs">Very Weak</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
