/**
 * Mock AI Service Module for BoostIQ Pro Mobile
 * 
 * This module provides a mock implementation of the AI optimization service
 * for environments where the Groq SDK doesn't work (like browsers/Expo Snack).
 */

import { DeviceMetrics } from "./DeviceMetrics";
import { AdvancedOptimizationResult } from "./AdvancedAIOptimization";

/**
 * Generate realistic-looking mock optimization data based on actual device metrics
 */
export function getMockAIOptimizations(
  deviceMetrics: DeviceMetrics
): AdvancedOptimizationResult {
  // Generate recommendations based on actual device status
  const recommendations = [];
  const actions = [];
  let totalImpact = 0;
  let highPriorityCount = 0;
  
  // Memory recommendations
  if (deviceMetrics.memoryUsage > 70) {
    recommendations.push({
      type: "Memory Optimization",
      description: "Your device is running low on memory. Closing unused apps can improve performance.",
      impact: 25,
      priority: "high",
      actions: ["Close background apps", "Clear app caches", "Restart memory-intensive applications"],
      requiresPermission: false,
      isAutomated: true
    });
    totalImpact += 25;
    highPriorityCount++;
  } else if (deviceMetrics.memoryUsage > 50) {
    recommendations.push({
      type: "Memory Management",
      description: "Memory usage is moderate but can be optimized for better performance.",
      impact: 15,
      priority: "medium",
      actions: ["Close unused apps", "Clear temporary files"],
      requiresPermission: false,
      isAutomated: true
    });
    totalImpact += 15;
  }
  
  // Battery recommendations
  if (deviceMetrics.batteryLevel < 30) {
    recommendations.push({
      type: "Battery Conservation",
      description: "Battery level is low. Implementing power saving measures is recommended.",
      impact: 20,
      priority: "high",
      actions: ["Enable battery saving mode", "Reduce screen brightness", "Close power-intensive applications"],
      requiresPermission: true,
      isAutomated: false
    });
    totalImpact += 20;
    highPriorityCount++;
  }
  
  // Storage recommendations
  if (deviceMetrics.storageUsed > 85) {
    recommendations.push({
      type: "Storage Cleanup",
      description: "Your device storage is nearly full which may affect performance.",
      impact: 18,
      priority: "medium",
      actions: ["Remove unused applications", "Clear app caches", "Delete temporary files"],
      requiresPermission: true,
      isAutomated: false
    });
    totalImpact += 18;
  }
  
  // Always add one general optimization
  recommendations.push({
    type: "General Optimization",
    description: "Regular maintenance helps keep your device running smoothly.",
    impact: 10,
    priority: "low",
    actions: ["Update system software", "Restart device weekly"],
    requiresPermission: false,
    isAutomated: true
  });
  totalImpact += 10;
  
  // Calculate gains based on device status
  const memoryGain = `${Math.floor((deviceMetrics.memoryUsage / 100) * 300)}MB`;
  const batteryGain = `${Math.floor(15 - (deviceMetrics.batteryLevel / 10))}%`;
  const storageGain = `${Math.floor((deviceMetrics.storageUsed / 100) * 1.5 * 1024)}MB`;
  
  return {
    success: true,
    message: "AI optimization completed (using mock data for compatibility)",
    timestamp: new Date().toISOString(),
    optimizations: recommendations,
    summary: {
      totalImpact: Math.min(totalImpact, 100), // Cap at 100%
      highPriorityCount,
      automatedActionsCount: recommendations.filter(r => r.isAutomated).length,
      memoryGain,
      batteryGain,
      storageGain
    }
  };
}
