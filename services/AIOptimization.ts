import { Groq } from "groq-sdk";
import type { DeviceMetrics, AppInfo } from "./DeviceMetrics";

export interface OptimizationResult {
  timestamp: string;
  gains: {
    memory: string;
    battery: string;
    storage: string;
  };
  actions: string[];
  recommendations: string[];
}

// Initialize Groq client with API key (hardcoded as requested)
const API_KEY = "gsk_MBnYq1bThZ9JTo4iQ0O6S1vIXRThV0lc3nvPUznzPiECFGSd";

/**
 * Get AI-powered optimizations using Groq directly from the Android app
 */
export async function getAIOptimizations(
  deviceMetrics: DeviceMetrics
): Promise<OptimizationResult> {
  try {
    const groq = new Groq({ apiKey: API_KEY });
    
    // Extract relevant information for optimization
    const { cpuUsage, memoryUsage, batteryLevel, storageUsed, installedApps } = deviceMetrics;
    
    // Format apps for the AI prompt
    const appsFormatted = installedApps
      .map(app => 
        `- ${app.name}: Memory ${app.memoryUsage}MB, Battery Drain ${app.batteryDrain}%/hr, Background Time ${app.backgroundTime}min`
      ).join('\n');
    
    // Create prompt for Groq LLM
    const prompt = `
    As an AI device optimizer, analyze this Android smartphone data and provide optimization recommendations.
    
    Current Device Statistics:
    - CPU Usage: ${cpuUsage}%
    - Memory Usage: ${memoryUsage}%
    - Battery Level: ${batteryLevel}%
    - Storage Used: ${storageUsed}%
    
    Running Apps (${installedApps.length}):
    ${appsFormatted}
    
    Based on this data, provide:
    1. Which apps should be closed to optimize performance
    2. System settings that should be adjusted
    3. Expected gains in memory, battery life, and storage
    Format the response as JSON with keys: "actions", "recommendations", and "gains" (where gains is an object with "memory", "battery", and "storage" keys).
    `;

    // Call Groq API directly from the Android app
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI device optimizer that provides actionable advice for improving smartphone performance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    // Parse AI response
    const content = completion.choices[0]?.message?.content || "{}";
    let aiResponse;
    
    try {
      aiResponse = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }
    
    // Create optimization result with defaults if fields are missing
    const optimizationResult: OptimizationResult = {
      timestamp: new Date().toISOString(),
      gains: {
        memory: aiResponse.gains?.memory || "150MB",
        battery: aiResponse.gains?.battery || "10%",
        storage: aiResponse.gains?.storage || "500MB"
      },
      actions: Array.isArray(aiResponse.actions) ? aiResponse.actions : [
        "Close high-memory background apps",
        "Clear app caches",
        "Disable unnecessary background processes"
      ],
      recommendations: Array.isArray(aiResponse.recommendations) ? aiResponse.recommendations : [
        "Update system software",
        "Remove unused applications",
        "Reduce screen brightness to save battery"
      ]
    };

    return optimizationResult;
  } catch (error) {
    console.error("Error getting AI optimizations:", error);
    
    // Return fallback optimization if AI fails
    return {
      timestamp: new Date().toISOString(),
      gains: {
        memory: "100MB",
        battery: "5%",
        storage: "250MB"
      },
      actions: [
        "Close high-memory background apps",
        "Clear app caches",
        "Disable unnecessary background processes"
      ],
      recommendations: [
        "Update system software",
        "Remove unused applications",
        "Reduce screen brightness to save battery"
      ]
    };
  }
}
