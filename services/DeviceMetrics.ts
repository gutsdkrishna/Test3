import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

export interface DeviceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  batteryLevel: number;
  batteryState: string;
  storageUsed: number;
  totalStorage: number;
  deviceName: string;
  osVersion: string;
  installedApps: AppInfo[];
}

export interface AppInfo {
  name: string;
  packageName: string;
  memoryUsage: number;
  batteryDrain: number;
  backgroundTime: number;
}

/**
 * Collects device metrics directly from the Android device
 */
export async function collectDeviceMetrics(): Promise<DeviceMetrics> {
  try {
    // Get device name and OS version
    let deviceName = 'Unknown Device';
    let osVersion = 'Unknown OS';
    
    try {
      deviceName = Device.modelName || 'Unknown Device';
    } catch (error) {
      console.warn("Error getting device name:", error);
    }
    
    try {
      osVersion = Device.osVersion || Device.osName + ' (version unknown)';
    } catch (error) {
      console.warn("Error getting OS version:", error);
    }
    
    // Get battery information
    let batteryLevel = 0;
    let batteryState = Battery.BatteryState.UNKNOWN;
    
    try {
      batteryLevel = await Battery.getBatteryLevelAsync();
      batteryState = await Battery.getBatteryStateAsync();
    } catch (error) {
      console.warn("Error getting battery info:", error);
      batteryLevel = 0.75; // Default to 75% if we can't determine actual level
    }
    
    let batteryStateString = 'unknown';
    switch (batteryState) {
      case Battery.BatteryState.CHARGING:
        batteryStateString = 'charging';
        break;
      case Battery.BatteryState.FULL:
        batteryStateString = 'full';
        break;
      case Battery.BatteryState.UNPLUGGED:
        batteryStateString = 'unplugged';
        break;
    }
    
    // Get storage information
    let fileInfo = 0;
    let totalStorage = 1;
    let storagePercentUsed = 0;
    
    try {
      fileInfo = await FileSystem.getFreeDiskStorageAsync();
      totalStorage = await FileSystem.getTotalDiskCapacityAsync();
      const storageUsed = totalStorage - fileInfo;
      storagePercentUsed = (storageUsed / totalStorage) * 100;
    } catch (error) {
      console.warn("Error getting storage info:", error);
      storagePercentUsed = 50; // Default to 50% if we can't determine actual usage
    }
    
    // Get CPU and memory usage (estimated since direct access is limited)
    const cpuUsage = Math.floor(Math.random() * 40) + 20; // Simulate 20-60% CPU usage for demo
    const memoryUsage = Math.floor(Math.random() * 50) + 30; // Simulate 30-80% memory usage for demo
    
    // Get running apps (simplified - in a real app, would use native module)
    const installedApps = await getInstalledApps();
    
    return {
      cpuUsage,
      memoryUsage,
      batteryLevel: Math.round(batteryLevel * 100),
      batteryState: batteryStateString,
      storageUsed: Math.round(storagePercentUsed),
      totalStorage,
      deviceName,
      osVersion,
      installedApps
    };
  } catch (error) {
    console.error("Error collecting device metrics:", error);
    
    // Return fallback metrics
    return {
      cpuUsage: 30,
      memoryUsage: 45,
      batteryLevel: 75,
      batteryState: 'unknown',
      storageUsed: 50,
      totalStorage: 128 * 1024 * 1024 * 1024, // 128 GB
      deviceName: 'Android Device',
      osVersion: 'Android',
      installedApps: await getInstalledApps()
    };
  }
}

/**
 * Get information about installed apps
 * Note: This is a simulated implementation as React Native doesn't provide direct access
 * to this information. In a real app, you would implement a native module.
 */
async function getInstalledApps(): Promise<AppInfo[]> {
  // This is simulated data - in a real app, use a native module to get this information
  const simulatedApps: AppInfo[] = [
    {
      name: "Social Media App",
      packageName: "com.example.social",
      memoryUsage: 245,
      batteryDrain: 2.5,
      backgroundTime: 120
    },
    {
      name: "Maps Navigation",
      packageName: "com.example.maps",
      memoryUsage: 180,
      batteryDrain: 4.2,
      backgroundTime: 30
    },
    {
      name: "Email Client",
      packageName: "com.example.mail",
      memoryUsage: 120,
      batteryDrain: 0.8,
      backgroundTime: 240
    },
    {
      name: "Weather App",
      packageName: "com.example.weather",
      memoryUsage: 75,
      batteryDrain: 0.3,
      backgroundTime: 15
    },
    {
      name: "Game App",
      packageName: "com.example.game",
      memoryUsage: 320,
      batteryDrain: 5.1,
      backgroundTime: 60
    }
  ];
  
  let appName = 'BoostIQ Pro';
  let packageName = 'com.boostiq.pro';
  
  try {
    if (Platform.OS === 'android') {
      appName = Application.applicationName || 'BoostIQ Pro';
      packageName = Application.applicationId || 'com.boostiq.pro';
    }
  } catch (error) {
    console.warn("Error getting application info:", error);
  }
  
  // Include our current app info
  const ourApp: AppInfo = {
    name: appName,
    packageName: packageName,
    memoryUsage: 85,
    batteryDrain: 0.7,
    backgroundTime: 0 // Our app is in foreground
  };
  
  return [...simulatedApps, ourApp];
}
