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

import { Groq } from "groq-sdk";
import { DeviceMetrics, AppInfo } from "./DeviceMetrics";

// API key is hardcoded as requested (in a real app, use secure storage)
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
 * Debug Logger
 * Helps track AI operations and responses during development
 */
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AI DEBUG: ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
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
      debugLog("Initial parse failed, attempting to fix JSON format", { error: parseError.message });

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
    throw new Error(`Failed to parse AI response: ${error.message}`);
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
 * Main AI Optimization Function
 * Analyzes device metrics and apps to generate optimization strategies
 */
export async function getAdvancedAIOptimizations(
  deviceMetrics: DeviceMetrics
): Promise<AdvancedOptimizationResult> {
  try {
    // Initialize Groq client
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    
    // Format data for the prompt
    const { installedApps } = deviceMetrics;
    const appsData = installedApps.map(app => ({
      name: app.name,
      packageName: app.packageName,
      memoryUsage: app.memoryUsage,
      batteryDrain: app.batteryDrain,
      backgroundTime: app.backgroundTime
    }));
    
    // Prepare system state for AI analysis
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
      apps: appsData
    };

    debugLog("Preparing AI analysis request", { systemState });

    // Request AI analysis using Groq
    const response = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: `As an AI device optimization expert, analyze the system state and return ONLY a JSON array of optimization strategies. Each strategy should follow this exact format:

[
  {
    "type": "Memory Optimization",
    "description": "Detailed explanation of the issue",
    "impact": 25,
    "priority": "high",
    "actions": ["Specific action 1", "Specific action 2"],
    "requiresPermission": true,
    "isAutomated": false
  }
]

Consider:
1. High memory/battery consuming apps
2. Battery optimization based on battery level and state
3. Storage cleanup opportunities
4. System performance improvements
5. Background apps that can be safely closed

Return ONLY the JSON array with NO additional text.`
        },
        {
          role: "user",
          content: `Analyze this system state and provide optimization recommendations:\n${JSON.stringify(systemState, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    // Parse and validate AI response
    const content = response.choices[0]?.message?.content || "[]";
    const optimizations = parseAIResponse(content);
    
    // Calculate impact metrics
    const totalImpact = optimizations.reduce((sum, opt) => sum + opt.impact, 0);
    const highPriorityCount = optimizations.filter(opt => opt.priority === "high").length;
    const automatedActionsCount = optimizations.filter(opt => opt.isAutomated).length;
    const gains = calculateGains(optimizations);

    // Create the final result
    return {
      success: true,
      message: "AI optimized",
      timestamp: new Date().toISOString(),
      optimizations: optimizations,
      summary: {
        totalImpact,
        highPriorityCount,
        automatedActionsCount,
        ...gains
      }
    };
  } catch (error) {
    console.error("Advanced AI Optimization error:", error);
    
    // Return fallback result if AI analysis fails
    return {
      success: false,
      message: "AI response not available right now",
      timestamp: new Date().toISOString(),
      optimizations: [{
        type: "Basic System Optimization",
        description: "General performance optimization based on system analysis",
        impact: 15,
        priority: "medium",
        actions: ["Clear system cache", "Close inactive apps"],
        requiresPermission: false,
        isAutomated: true
      }],
      summary: {
        totalImpact: 15,
        highPriorityCount: 0,
        automatedActionsCount: 1,
        memoryGain: "75MB",
        batteryGain: "5%",
        storageGain: "150MB"
      }
    };
  }
}
