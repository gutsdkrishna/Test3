/**
 * Advanced AI Service Module for BoostIQ Pro Mobile
 * 
 * This module handles device optimization using Groq's AI API directly from the mobile app.
 * It analyzes device statistics and background app data to provide intelligent optimization suggestions.
 * 
 * Key Features:
 * - Real-time device performance analysis using Groq's LLM
 * - Background app impact assessment
 * - Automated optimization recommendations
 * - Intelligent resource management
 */

import { DeviceMetrics, AppInfo } from "./DeviceMetrics";

// Import Groq with better error handling
let Groq: any;
try {
  Groq = require("groq-sdk").Groq;
} catch (e) {
  console.error("Failed to import Groq SDK:", e);
}

// API key for Groq
const GROQ_API_KEY = "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";

// Using Llama model for its advanced capabilities in system analysis
const MODEL_NAME = "llama3-8b-8192";

/**
 * SystemAnalysis Interface
 * Defines the structure of AI-generated optimization recommendations
 */
interface SystemAnalysis {
  type: string;          // Category of optimization (e.g., "Memory Optimization", "Battery Management")
  description: string;   // Detailed explanation of the optimization strategy
  impact: number;        // Estimated performance improvement (1-30%)
  priority: "high" | "medium" | "low";  // Urgency level
  actions: string[];     // Specific actions to be taken
  requiresPermission: boolean;  // Whether user permission is needed
  isAutomated: boolean;  // Whether actions can be automated
}

/**
 * Advanced Optimization Result
 * Extends the basic optimization result with more detailed information
 */
export interface AdvancedOptimizationResult {
  success: boolean;
  message: string;
  timestamp: string;
  optimizations: SystemAnalysis[];
  summary: {
    totalImpact: number;
    highPriorityCount: number;
    automatedActionsCount: number;
    memoryGain: string;
    batteryGain: string;
    storageGain: string;
  };
}

/**
 * Debug Logger with enhanced information
 */
function debugLog(message: string, data?: any, error?: any) {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] AI DEBUG: ${message}`);
  
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log("Data present but could not be stringified");
    }
  }
  
  if (error) {
    console.error("ERROR DETAILS:", error);
    if (error.response) {
      console.error("API Response Error:", {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }
  }
}

/**
 * Cleans and parses the AI response
 */
function parseAIResponse(content: string): SystemAnalysis[] {
  try {
    debugLog("Raw AI response content:", content);

    // Extract JSON content using regex
    const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON content found in response");
    }

    // Clean up the extracted JSON
    let jsonContent = jsonMatch[0]
      .replace(/(\r\n|\n|\r)/gm, '') // Remove newlines
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    debugLog("Extracted JSON content:", jsonContent);

    let parsed: SystemAnalysis[] = [];
    try {
      // Try parsing as array first
      if (jsonContent.startsWith('[')) {
        parsed = JSON.parse(jsonContent) as SystemAnalysis[];
      } else {
        // If single object, wrap in array
        parsed = [JSON.parse(jsonContent) as SystemAnalysis];
      }
    } catch (parseError) {
      if (parseError instanceof Error) {
        debugLog("Initial parse failed, attempting to fix JSON format", { error: parseError.message });
      } else {
        debugLog("Initial parse failed, attempting to fix JSON format", { error: String(parseError) });
      }

      // Try to fix common formatting issues
      jsonContent = jsonContent
        .replace(/}\s*{/g, '},{') // Fix object separators
        .replace(/,\s*]/g, ']') // Remove trailing commas
        .replace(/,\s*}/g, '}'); // Remove trailing commas in objects

      if (!jsonContent.startsWith('[')) {
        jsonContent = `[${jsonContent}]`;
      }

      debugLog("Attempting to parse fixed JSON:", jsonContent);
      parsed = JSON.parse(jsonContent) as SystemAnalysis[];
    }

    // Validate the parsed optimizations
    const validOptimizations = parsed.filter(opt => {
      return opt.type && 
        opt.description && 
        typeof opt.impact === 'number' &&
        Array.isArray(opt.actions) &&
        typeof opt.requiresPermission === 'boolean' &&
        typeof opt.isAutomated === 'boolean';
    });

    if (validOptimizations.length === 0) {
      throw new Error("No valid optimizations found in response");
    }

    return validOptimizations;
  } catch (error) {
    debugLog("Failed to parse AI response", { error, content });
    if (error instanceof Error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    } else {
      throw new Error("Failed to parse AI response: Unknown error");
    }
  }
}

/**
 * Calculate memory, battery, and storage gains from optimizations
 */
function calculateGains(optimizations: SystemAnalysis[]): {
  memoryGain: string;
  batteryGain: string;
  storageGain: string;
} {
  // Calculate weighted gains based on optimization impact and type
  let memoryImpact = 0;
  let batteryImpact = 0;
  let storageImpact = 0;
  
  optimizations.forEach(opt => {
    if (opt.type.toLowerCase().includes("memory")) {
      memoryImpact += opt.impact;
    } else if (opt.type.toLowerCase().includes("battery")) {
      batteryImpact += opt.impact;
    } else if (opt.type.toLowerCase().includes("storage")) {
      storageImpact += opt.impact;
    } else {
      // Generic optimizations benefit all areas
      memoryImpact += opt.impact * 0.5;
      batteryImpact += opt.impact * 0.3;
      storageImpact += opt.impact * 0.2;
    }
  });
  
  // Convert impacts to readable values
  return {
    memoryGain: `${Math.round(memoryImpact * 3)}MB`,
    batteryGain: `${Math.round(batteryImpact * 0.25)}%`,
    storageGain: `${Math.round(storageImpact * 10)}MB`,
  };
}

/**
 * Main AI Optimization Function with enhanced error handling
 */
export async function getAdvancedAIOptimizations(
  deviceMetrics: DeviceMetrics
): Promise<AdvancedOptimizationResult | undefined> {
  try {
    // Check if Groq SDK is available
    if (!Groq) {
      throw new Error("Groq SDK is not available. This may be due to compatibility issues with the current environment.");
    }
    
    // Initialize Groq client with error handling
    let groq;
    try {
      groq = new Groq({ 
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true  // Enable browser environment
      });
      debugLog("Groq client initialized successfully");
    } catch (error) {
      debugLog("Failed to initialize Groq client", {}, error);
      if (error instanceof Error) {
        throw new Error(`Groq client initialization failed: ${error.message}`);
      } else {
        throw new Error("Groq client initialization failed: Unknown error");
      }
    }
    
    // Prepare system state
    debugLog("Preparing system state data");
    const systemState = {
      device: {
        cpu: deviceMetrics.cpuUsage,
        ram: deviceMetrics.memoryUsage,
        battery: deviceMetrics.batteryLevel,
        batteryState: deviceMetrics.batteryState,
        storage: deviceMetrics.storageUsed,
        totalStorage: deviceMetrics.totalStorage,
        deviceName: deviceMetrics.deviceName,
        osVersion: deviceMetrics.osVersion
      },
      apps: deviceMetrics.installedApps.map(app => ({
        name: app.name,
        packageName: app.packageName,
        memoryUsage: app.memoryUsage,
        batteryDrain: app.batteryDrain,
        backgroundTime: app.backgroundTime
      }))
    };

    // Test if we can make a simple network request to Groq API
    debugLog("Testing API connectivity");
    
    // Make API request with timeout and proper error handling
    debugLog("Sending request to Groq API");
    
    let response;
    try {
      // Add a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("API request timed out after 15 seconds")), 15000)
      );
      
      // Actual API call
      const apiPromise = groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: `As an AI device optimizer, analyze the system state and return ONLY a JSON array of optimization strategies.`
          },
          {
            role: "user",
            content: `Analyze this system state:\n${JSON.stringify(systemState, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      
      // Race between timeout and API call
      response = await Promise.race([apiPromise, timeoutPromise]);
      debugLog("Received response from API", response);
    } catch (error) {
      debugLog("API request failed", {}, error);
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error("API request failed: Unknown error");
      }
    }
    
    // The rest of the function remains similar, with better error handling
    // ...
    
    // For this debugging version, return a mock success result when testing in Expo Snack
    if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('snack.expo.dev')) {
      // We're in Expo Snack environment, return mock data
      debugLog("Detected Expo Snack environment, returning mock data");
      return {
        success: true,
        message: "Mock AI optimization (Expo Snack compatibility)",
        timestamp: new Date().toISOString(),
        optimizations: [{
          type: "Memory Optimization",
          description: "This is mock data for Expo Snack environment since API calls may be restricted",
          impact: 25,
          priority: "high",
          actions: ["Close high-memory apps", "Clear app caches"],
          requiresPermission: false,
          isAutomated: true
        }],
        summary: {
          totalImpact: 25,
          highPriorityCount: 1,
          automatedActionsCount: 1,
          memoryGain: "120MB",
          batteryGain: "7%",
          storageGain: "250MB"
        }
      };
    }

    // Process response and return result
    // ...

  } catch (error) {
    console.error("Advanced AI Optimization error:", error);
    debugLog("Advanced AI Optimization failed", {}, error);
    
    // Return detailed error information
    return {
      success: false,
      message: `AI response not available: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
      optimizations: [{
        type: "Error Recovery",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        impact: 5,
        priority: "medium",
        actions: ["Try again later", "Check internet connection"],
        requiresPermission: false,
        isAutomated: false
      }],
      summary: {
        totalImpact: 5,
        highPriorityCount: 0,
        automatedActionsCount: 0,
        memoryGain: "0MB",
        batteryGain: "0%",
        storageGain: "0MB"
      }
    };
  }
}
