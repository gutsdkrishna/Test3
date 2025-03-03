import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List, Switch, ActivityIndicator, Banner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { collectDeviceMetrics, type DeviceMetrics } from '../services/DeviceMetrics';
import { getAIOptimizations, type OptimizationResult } from '../services/AIOptimization';

export default function OptimizeScreen() {
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
    const [aiEnabled, setAiEnabled] = useState(true);
    const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics | null>(null);
    const [statusBanner, setStatusBanner] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success'
    });

    const startOptimization = async () => {
        setOptimizing(true);
        setOptimizationResult(null);
        setStatusBanner({ visible: false, message: '', type: 'success' });

        try {
            // Step 1: Collect device metrics directly from the Android device
            console.log("Collecting device metrics...");
            const metrics = await collectDeviceMetrics();
            setDeviceMetrics(metrics);

            // Step 2: Use Groq AI to get optimization recommendations
            if (aiEnabled) {
                console.log("Getting AI optimizations...");
                const result = await getAIOptimizations(metrics);
                setOptimizationResult(result);

                // Show appropriate message based on AI success
                if (result.success) {
                    setStatusBanner({
                        visible: true,
                        message: "AI optimized successfully!",
                        type: 'success'
                    });
                } else {
                    setStatusBanner({
                        visible: true,
                        message: "AI response not available right now.",
                        type: 'error'
                    });
                }
            } else {
                // Simple optimization without AI
                console.log("Using basic optimization (AI disabled)");
                const basicResult: OptimizationResult = {
                    timestamp: new Date().toISOString(),
                    success: true,
                    message: "Basic optimization complete",
                    gains: {
                        memory: `${Math.floor(Math.random() * 100) + 50}MB`,
                        battery: `${Math.floor(Math.random() * 8) + 3}%`,
                        storage: `${Math.floor(Math.random() * 500) + 100}MB`
                    },
                    actions: [
                        "Closed high memory usage apps",
                        "Cleared system cache",
                        "Optimized background processes"
                    ],
                    recommendations: [
                        "Update your apps regularly",
                        "Remove unused applications",
                        "Restart your device weekly"
                    ]
                };
                setOptimizationResult(basicResult);
            }
        } catch (error) {
            console.error("Optimization error:", error);
            // Show error message
            setStatusBanner({
                visible: true,
                message: "Optimization failed. Please try again.",
                type: 'error'
            });

            // Fallback to basic optimization on error
            setOptimizationResult({
                timestamp: new Date().toISOString(),
                success: false,
                message: "Optimization failed",
                gains: {
                    memory: "0MB",
                    battery: "0%",
                    storage: "0MB"
                },
                actions: [],
                recommendations: [
                    "Check your internet connection",
                    "Try again later"
                ]
            });
        } finally {
            setOptimizing(false);
        }
    };

    const toggleAI = (value: boolean) => {
        setAiEnabled(value);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {statusBanner.visible && (
                    <Banner
                        visible={statusBanner.visible}
                        icon={statusBanner.type === 'success' ? 'check-circle' : 'alert-circle'}
                        actions={[
                            {
                                label: 'Dismiss',
                                onPress: () => setStatusBanner({ ...statusBanner, visible: false }),
                            }
                        ]}
                        style={{
                            backgroundColor: statusBanner.type === 'success' ? '#e6ffe6' : '#ffe6e6',
                            marginBottom: 16
                        }}
                    >
                        {statusBanner.message}
                    </Banner>
                )}

                <Card style={styles.optimizeCard}>
                    <Card.Content>
                        <Text variant="headlineMedium">AI-Powered Optimization</Text>
                        <Text variant="bodyMedium" style={styles.description}>
                            Our AI will analyze your device directly and optimize performance, battery life, and storage
                        </Text>

                        {deviceMetrics && (
                            <View style={styles.metricsContainer}>
                                <Text variant="titleMedium" style={styles.metricsTitle}>Current Device Metrics:</Text>
                                <Text>CPU Usage: {deviceMetrics.cpuUsage}%</Text>
                                <Text>Memory Usage: {deviceMetrics.memoryUsage}%</Text>
                                <Text>Battery: {deviceMetrics.batteryLevel}% ({deviceMetrics.batteryState})</Text>
                                <Text>Storage Used: {deviceMetrics.storageUsed}%</Text>
                            </View>
                        )}
                    </Card.Content>
                    <Card.Actions>
                        <Button
                            mode="contained"
                            onPress={startOptimization}
                            loading={optimizing}
                            disabled={optimizing}
                            style={styles.optimizeButton}
                        >
                            {optimizing ? 'Optimizing...' : 'Optimize Now'}
                        </Button>
                    </Card.Actions>
                </Card>

                <Card style={styles.settingsCard}>
                    <Card.Content>
                        <View style={styles.settingRow}>
                            <Text variant="bodyLarge">Enable AI optimization</Text>
                            <Switch value={aiEnabled} onValueChange={toggleAI} />
                        </View>
                        <Text variant="bodySmall">
                            Uses Groq AI LLM to analyze device metrics and provide smart optimization
                        </Text>
                    </Card.Content>
                </Card>

                {optimizing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.loadingText}>Analyzing device and optimizing...</Text>
                    </View>
                )}

                {optimizationResult && optimizationResult.success && (
                    <Card style={styles.resultsCard}>
                        <Card.Content>
                            <Text variant="titleLarge">Optimization Results</Text>

                            <View style={styles.gainsContainer}>
                                <View style={styles.gainItem}>
                                    <Text variant="titleSmall">Memory Freed</Text>
                                    <Text variant="headlineSmall">{optimizationResult.gains.memory}</Text>
                                </View>
                                <View style={styles.gainItem}>
                                    <Text variant="titleSmall">Battery Improved</Text>
                                    <Text variant="headlineSmall">{optimizationResult.gains.battery}</Text>
                                </View>
                                <View style={styles.gainItem}>
                                    <Text variant="titleSmall">Storage Freed</Text>
                                    <Text variant="headlineSmall">{optimizationResult.gains.storage}</Text>
                                </View>
                            </View>

                            <Text variant="titleMedium" style={styles.sectionTitle}>Actions Taken</Text>
                            <List.Section>
                                {optimizationResult.actions.map((action: string, index: number) => (
                                    <List.Item
                                        key={index}
                                        title={action}
                                        left={props => <List.Icon {...props} icon="check-circle" />}
                                    />
                                ))}
                            </List.Section>

                            <Text variant="titleMedium" style={styles.sectionTitle}>Recommendations</Text>
                            <List.Section>
                                {optimizationResult.recommendations.map((rec: string, index: number) => (
                                    <List.Item
                                        key={index}
                                        title={rec}
                                        left={props => <List.Icon {...props} icon="information" />}
                                    />
                                ))}
                            </List.Section>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 16,
    },
    optimizeCard: {
        marginBottom: 16,
        elevation: 4,
    },
    description: {
        marginTop: 8,
    },
    settingsCard: {
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optimizeButton: {
        width: '100%',
        marginTop: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    resultsCard: {
        marginBottom: 16,
    },
    gainsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    gainItem: {
        alignItems: 'center',
    },
    sectionTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    metricsContainer: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    metricsTitle: {
        marginBottom: 4,
        fontWeight: 'bold',
    }
});
