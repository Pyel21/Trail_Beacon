import WifiManager from 'react-native-wifi-reborn';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface NearbyUser {
  id: string;
  name: string;
  deviceName: string;
  distance: number;
  lastSeen: Date;
  isConnected: boolean;
  signalStrength: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface WiFiDirectConfig {
  serviceName: string;
  groupName: string;
  passphrase: string;
  scanInterval: number; // in milliseconds
}

class WiFiDirectService {
  private config: WiFiDirectConfig = {
    serviceName: 'TrailBeacon',
    groupName: 'TrailBeacon_Group',
    passphrase: 'TrailBeacon2024',
    scanInterval: 5000 // 5 seconds
  };

  private nearbyUsers: Map<string, NearbyUser> = new Map();
  private scanInterval: NodeJS.Timeout | null = null;
  private isScanning = false;
  private onUsersUpdate?: (users: NearbyUser[]) => void;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      await this.requestPermissions();
      await this.initializeWiFi();
    } catch (error) {
      console.error('Failed to initialize WiFi Direct service:', error);
    }
  }

  private async requestPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
          PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE,
          PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE,
        ]);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          throw new Error('Required permissions not granted');
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        throw error;
      }
    }
  }

  private async initializeWiFi(): Promise<void> {
    try {
      // Enable WiFi if not already enabled
      const isEnabled = await WifiManager.isEnabled();
      if (!isEnabled) {
        await WifiManager.setEnabled(true);
        // Wait a bit for WiFi to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Get current WiFi state
      const wifiState = await WifiManager.getCurrentState();
      console.log('WiFi State:', wifiState);
    } catch (error) {
      console.error('Failed to initialize WiFi:', error);
      throw error;
    }
  }

  public async startScanning(onUsersUpdate: (users: NearbyUser[]) => void): Promise<void> {
    if (this.isScanning) {
      console.log('Already scanning for nearby users');
      return;
    }

    this.onUsersUpdate = onUsersUpdate;
    this.isScanning = true;

    try {
      // Start continuous scanning
      this.scanInterval = setInterval(async () => {
        await this.scanForNearbyUsers();
      }, this.config.scanInterval);

      // Initial scan
      await this.scanForNearbyUsers();
    } catch (error) {
      console.error('Failed to start scanning:', error);
      this.isScanning = false;
    }
  }

  public stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isScanning = false;
    this.nearbyUsers.clear();
  }

  private async scanForNearbyUsers(): Promise<void> {
    try {
      // Get available WiFi networks
      const networks = await WifiManager.loadWifiList();
      
      // Filter for Trail Beacon networks
      const trailBeaconNetworks = networks.filter(network => 
        network.SSID.includes(this.config.serviceName) || 
        network.SSID.includes('TrailBeacon')
      );

      // Process each network as a potential nearby user
      const currentTime = new Date();
      const updatedUsers: NearbyUser[] = [];

      for (const network of trailBeaconNetworks) {
        const userId = this.extractUserIdFromSSID(network.SSID);
        if (userId) {
          const user: NearbyUser = {
            id: userId,
            name: this.extractUserNameFromSSID(network.SSID),
            deviceName: network.SSID,
            distance: this.calculateDistanceFromSignal(network.level),
            lastSeen: currentTime,
            isConnected: false,
            signalStrength: network.level,
            location: await this.getCurrentLocation()
          };

          this.nearbyUsers.set(userId, user);
          updatedUsers.push(user);
        }
      }

      // Remove users that haven't been seen recently (older than 30 seconds)
      const thirtySecondsAgo = new Date(currentTime.getTime() - 30000);
      for (const [userId, user] of this.nearbyUsers.entries()) {
        if (user.lastSeen < thirtySecondsAgo) {
          this.nearbyUsers.delete(userId);
        }
      }

      // Notify listeners
      if (this.onUsersUpdate) {
        this.onUsersUpdate(Array.from(this.nearbyUsers.values()));
      }

    } catch (error) {
      console.error('Failed to scan for nearby users:', error);
    }
  }

  private extractUserIdFromSSID(ssid: string): string | null {
    // Extract user ID from SSID format: "TrailBeacon_UserID_Name"
    const match = ssid.match(/TrailBeacon_([a-zA-Z0-9]+)_/);
    return match ? match[1] : null;
  }

  private extractUserNameFromSSID(ssid: string): string {
    // Extract user name from SSID format: "TrailBeacon_UserID_UserName"
    const match = ssid.match(/TrailBeacon_[a-zA-Z0-9]+_(.+)/);
    return match ? match[1].replace(/_/g, ' ') : 'Unknown User';
  }

  private calculateDistanceFromSignal(signalLevel: number): number {
    // Rough estimation of distance based on signal strength
    // This is a simplified calculation - in reality, you'd need more sophisticated methods
    if (signalLevel >= -30) return 1; // Very close
    if (signalLevel >= -50) return 5; // Close
    if (signalLevel >= -70) return 15; // Medium distance
    if (signalLevel >= -85) return 30; // Far
    return 50; // Very far
  }

  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
    try {
      // This would integrate with your location service
      // For now, return a placeholder
      return {
        latitude: 7.0707,
        longitude: 125.6127
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      return undefined;
    }
  }

  public async connectToUser(userId: string): Promise<boolean> {
    try {
      const user = this.nearbyUsers.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Connect to the user's WiFi network
      await WifiManager.connectToProtectedSSID(
        user.deviceName,
        this.config.passphrase,
        false
      );

      // Update user connection status
      user.isConnected = true;
      this.nearbyUsers.set(userId, user);

      return true;
    } catch (error) {
      console.error('Failed to connect to user:', error);
      Alert.alert('Connection Failed', 'Could not connect to the selected user.');
      return false;
    }
  }

  public async disconnectFromUser(userId: string): Promise<boolean> {
    try {
      const user = this.nearbyUsers.get(userId);
      if (!user) {
        return false;
      }

      // Disconnect from the network
      await WifiManager.disconnect();

      // Update user connection status
      user.isConnected = false;
      this.nearbyUsers.set(userId, user);

      return true;
    } catch (error) {
      console.error('Failed to disconnect from user:', error);
      return false;
    }
  }

  public getNearbyUsers(): NearbyUser[] {
    return Array.from(this.nearbyUsers.values());
  }

  public isUserConnected(userId: string): boolean {
    const user = this.nearbyUsers.get(userId);
    return user ? user.isConnected : false;
  }

  public async broadcastPresence(userName: string): Promise<void> {
    try {
      // Create a hotspot or broadcast our presence
      // This is a simplified implementation
      const ssid = `TrailBeacon_${Date.now()}_${userName.replace(/\s/g, '_')}`;
      
      // In a real implementation, you would:
      // 1. Create a WiFi Direct group
      // 2. Set up a hotspot with the SSID
      // 3. Handle the group management
      
      console.log(`Broadcasting presence as: ${ssid}`);
    } catch (error) {
      console.error('Failed to broadcast presence:', error);
    }
  }

  public getConfig(): WiFiDirectConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<WiFiDirectConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default new WiFiDirectService();
