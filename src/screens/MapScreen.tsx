// src/screens/MapScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import NearbyUsersList from '../components/NearbyUsersList';
import NearbyUsersMapOverlay from '../components/NearbyUsersMapOverlay';
import WiFiDirectService, { NearbyUser } from '../services/WiFiDirectService';
import MapboxGL from '@rnmapbox/maps';
import Constants from 'expo-constants';

// set Mapbox token from expo config or env fallback
MapboxGL.setAccessToken(
    (Constants.expoConfig as any)?.extra?.MAPBOX_ACCESS_TOKEN ||
    process.env.MAPBOX_ACCESS_TOKEN ||
    ''
);

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {
	const [showNearbyUsers, setShowNearbyUsers] = useState(false);
	const [showMapOverlay, setShowMapOverlay] = useState(false);
	const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
	const [isScanning, setIsScanning] = useState(false);

	// Default center (lng, lat)
	const defaultCenter = useMemo(() => [125.6127, 7.0707] as [number, number], []);

	useEffect(() => {
		// Initialize WiFi Direct service
		initializeWiFiDirect();

		// Enable Mapbox telemetry off if desired
		try {
			MapboxGL.setTelemetryEnabled && MapboxGL.setTelemetryEnabled(false);
		} catch {}

		// Cleanup on unmount
		return () => {
			WiFiDirectService.stopScanning();
		};
	}, []);

	const initializeWiFiDirect = async () => {
		try {
			// Start broadcasting our presence
			await WiFiDirectService.broadcastPresence('Aleckzz Palero');
		} catch (error) {
			console.error('Failed to initialize WiFi Direct:', error);
		}
	};

	const handleStartScanning = async () => {
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

	const handleStopScanning = () => {
		WiFiDirectService.stopScanning();
		setIsScanning(false);
		setNearbyUsers([]);
	};

	const handleUserSelect = (user: NearbyUser) => {
		Alert.alert(
			'Connect to User',
			`Do you want to connect to ${user.name}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{ 
					text: 'Connect', 
					onPress: async () => {
						const success = await WiFiDirectService.connectToUser(user.id);
						if (success) {
							Alert.alert('Connected', `Successfully connected to ${user.name}`);
						}
					}
				}
			]
		);
	};

	// Filter users that have numeric coordinates (expected shape: { latitude, longitude })
	const usersWithCoords = nearbyUsers.filter(
		(u): u is (NearbyUser & { latitude: number; longitude: number }) => {
			if (!u) return false;
			const lat = (u as any).latitude;
			const lon = (u as any).longitude;
			return typeof lat === 'number' && !isNaN(lat) && typeof lon === 'number' && !isNaN(lon);
		}
	) as (NearbyUser & { latitude: number; longitude: number })[];

	return (
		<View className="flex-1 bg-charcoal-900">
			{/* Header */}
			<View className="flex-row items-center justify-between px-6 py-4 bg-charcoal-800">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text className="text-sky-500 text-lg">← Back</Text>
				</TouchableOpacity>
				<Text className="text-sand-500 text-xl font-bold">Map</Text>
				<TouchableOpacity onPress={() => setShowNearbyUsers(true)}>
					<Text className="text-sky-500 text-lg">👥</Text>
				</TouchableOpacity>
			</View>

			{/* Map Area */}
			<View className="flex-1 bg-map relative">
				{/* Mapbox Map */}
				<MapboxGL.MapView style={{ flex: 1 }}>
					<MapboxGL.Camera zoomLevel={14} centerCoordinate={defaultCenter} />

					{/* Show the device location if permissions are granted */}
					<MapboxGL.UserLocation visible />

					{/* Render nearby users as point annotations if they have coordinates */}
					{usersWithCoords.map((user) => {
						const coord: [number, number] = [
							(user as any).longitude,
							(user as any).latitude
						];
						return (
							<MapboxGL.PointAnnotation
								key={user.id}
								id={user.id}
								coordinate={coord}
								onSelected={() => handleUserSelect(user)}
							>
								<View
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: '#FF6B35',
										justifyContent: 'center',
										alignItems: 'center',
										borderWidth: 2,
										borderColor: '#fff'
									}}
								/>
								<MapboxGL.Callout title={user.name} />
							</MapboxGL.PointAnnotation>
						);
					})}
				</MapboxGL.MapView>

				{/* WiFi Direct Controls (over map) */}
				<View className="absolute inset-0 items-center justify-center pointer-events-none">
					<View className="w-full px-6 pointer-events-auto" style={{ marginTop: 24 }}>
						<TouchableOpacity
							style={{
								borderRadius: 16,
								paddingVertical: 14,
								paddingHorizontal: 24,
								backgroundColor: isScanning ? '#B94A3E' : '#0EA5E9'
							}}
							onPress={isScanning ? handleStopScanning : handleStartScanning}
						>
							<Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
								{isScanning ? 'Stop Scanning' : 'Start Scanning'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{
								marginTop: 12,
								borderRadius: 16,
								paddingVertical: 14,
								paddingHorizontal: 24,
								backgroundColor: '#6AB04C'
							}}
							onPress={() => setShowMapOverlay(true)}
						>
							<Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 18 }}>
								View Nearby Users on Map
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Nearby users count */}
				{nearbyUsers.length > 0 && (
					<View style={{ position: 'absolute', top: 8, right: 8 }}>
						<View style={{ backgroundColor: 'rgba(17,24,39,0.9)', borderRadius: 12, padding: 8 }}>
							<Text style={{ color: '#F4EBD0', fontSize: 12, fontWeight: '600' }}>
								{nearbyUsers.length} user{nearbyUsers.length !== 1 ? 's' : ''} nearby
							</Text>
						</View>
					</View>
				)}

				{/* Scanning indicator */}
				{isScanning && (
					<View style={{ position: 'absolute', top: 8, left: 8 }}>
						<View style={{ backgroundColor: 'rgba(17,24,39,0.9)', borderRadius: 12, padding: 8, flexDirection: 'row', alignItems: 'center' }}>
							<View style={{ width: 8, height: 8, backgroundColor: '#0EA5E9', borderRadius: 4, marginRight: 8 }} />
							<Text style={{ color: '#F4EBD0', fontSize: 12, fontWeight: '500' }}>
								Scanning...
							</Text>
						</View>
					</View>
				)}
			</View>

			{/* Nearby Users List Modal */}
			<NearbyUsersList
				visible={showNearbyUsers}
				onClose={() => setShowNearbyUsers(false)}
				onUserSelect={handleUserSelect}
			/>

			{/* Map Overlay Modal */}
			<NearbyUsersMapOverlay
				visible={showMapOverlay}
				onClose={() => setShowMapOverlay(false)}
				onUserSelect={handleUserSelect}
			/>
		</View>
	);
}
