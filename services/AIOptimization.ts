import { Groq } from "groq-sdk";
import type { DeviceMetrics, AppInfo } from "./DeviceMetrics";

export interface OptimizationResult {
  timestamp: string;
  success: boolean;
  message: string;
  gains: {
    memory: string;
    battery: string;
    storage: string;
  };
  actions: string[];
  recommendations: string[];
}

// Initialize Groq client with API key (hardcoded as requested)
const API_KEY = "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";

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

    // Call Groq API with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI request timed out")), 15000);
    });

    const completionPromise = groq.chat.completions.create({
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

    // Race between timeout and completion
    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
    
    // Parse AI response
    const content = completion.choices[0]?.message?.content || "{}";
    let aiResponse;
    
    try {
      aiResponse = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }
    
    // Validate if the response has the required structure
    if (!aiResponse.actions || !aiResponse.recommendations || !aiResponse.gains) {
      throw new Error("AI response missing required fields");
    }
    
    // Create optimization result
    const optimizationResult: OptimizationResult = {
      timestamp: new Date().toISOString(),
      success: true,
      message: "AI optimized",
      gains: {
        memory: aiResponse.gains.memory || "150MB",
        battery: aiResponse.gains.battery || "10%",
        storage: aiResponse.gains.storage || "500MB"
      },
      actions: Array.isArray(aiResponse.actions) ? aiResponse.actions : [],
      recommendations: Array.isArray(aiResponse.recommendations) ? aiResponse.recommendations : []
    };

    return optimizationResult;
  } catch (error) {
    console.error("Error getting AI optimizations:", error);
    
    // Return failed optimization result
    return {
      timestamp: new Date().toISOString(),
      success: false,
      message: "AI response not available right now.",
      gains: {
        memory: "0MB",
        battery: "0%",
        storage: "0MB"
      },
      actions: [],
      recommendations: [
        "Please try again later",
        "Check your internet connection",
        "The AI service might be experiencing high traffic"
      ]
    };
  }
}
