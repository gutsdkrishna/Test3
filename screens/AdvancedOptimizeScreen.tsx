import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, List, Switch, ActivityIndicator, Banner, Chip, ProgressBar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { collectDeviceMetrics, type DeviceMetrics } from '../services/DeviceMetrics';
import { getAdvancedAIOptimizations, type AdvancedOptimizationResult } from '../services/AdvancedAIOptimization';
import AnimatedCircularProgress from '../components/AnimatedCircularProgress';

export default function AdvancedOptimizeScreen() {
    const [optimizing, setOptimizing] = useState(false);
    const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics | null>(null);
    const [optResult, setOptResult] = useState<AdvancedOptimizationResult | null>(null);
    const [aiEnabled, setAiEnabled] = useState(true);
    const [statusBanner, setStatusBanner] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({
        visible: false,
        message: '',
        type: 'success'
    });

    const startOptimization = async () => {
        setOptimizing(true);
        setOptResult(null);
        setStatusBanner({ visible: false, message: '', type: 'success' });

        try {
            // Step 1: Collect device metrics directly from the device
            console.log("Collecting device metrics...");
            const metrics = await collectDeviceMetrics();
            setDeviceMetrics(metrics);

            // Step 2: Use Groq AI to get advanced optimization recommendations
            if (aiEnabled) {
                console.log("Getting advanced AI optimizations...");
                const result = await getAdvancedAIOptimizations(metrics);
                setOptResult(result);

                // Show appropriate message based on AI success
                if (result.success) {
                    setStatusBanner({
                        visible: true,
                        message: "AI optimization completed successfully!",
                        type: 'success'
                    });
                } else {
                    setStatusBanner({
                        visible: true,
                        message: "AI response not available right now.",
                        type: 'error'
                    });
                }
            }
        } catch (error) {
            console.error("Advanced optimization error:", error);
            setStatusBanner({
                visible: true,
                message: "Optimization failed. Please try again.",
                type: 'error'
            });
        } finally {
            setOptimizing(false);
        }
    };

    // Render priority badge with appropriate color
    const renderPriorityBadge = (priority: string) => {
        const colors = {
            high: '#ff4d4d',
            medium: '#ffb84d',
            low: '#66cc99'
        };
        const color = colors[priority as keyof typeof colors] || '#757575';

        return (
            <Chip
                mode="outlined"
                style={[styles.priorityChip, { borderColor: color }]}
                textStyle={{ color }}
            >
                {priority}
            </Chip>
        );
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

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineMedium">Advanced AI Optimization</Text>
                        <Text variant="bodyMedium" style={styles.description}>
                            Our advanced AI will analyze your device in detail and provide comprehensive optimization strategies
                        </Text>

                        {deviceMetrics && (
                            <View style={styles.metricsContainer}>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Current Device Metrics:</Text>
                                <View style={styles.metricsRow}>
                                    <View style={styles.metricItem}>
                                        <Text variant="bodyLarge">CPU</Text>
                                        <AnimatedCircularProgress
                                            value={deviceMetrics.cpuUsage}
                                            size={60}
                                            color={deviceMetrics.cpuUsage > 70 ? '#ff4d4d' : '#6200ee'}
                                        />
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text variant="bodyLarge">Memory</Text>
                                        <AnimatedCircularProgress
                                            value={deviceMetrics.memoryUsage}
                                            size={60}
                                            color={deviceMetrics.memoryUsage > 80 ? '#ff4d4d' : '#6200ee'}
                                        />
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text variant="bodyLarge">Storage</Text>
                                        <AnimatedCircularProgress
                                            value={deviceMetrics.storageUsed}
                                            size={60}
                                            color={deviceMetrics.storageUsed > 90 ? '#ff4d4d' : '#6200ee'}
                                        />
                                    </View>
                                </View>
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
                            {optimizing ? 'Analyzing...' : 'Start Advanced Analysis'}
                        </Button>
                    </Card.Actions>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.settingRow}>
                            <Text variant="bodyLarge">Enable AI optimization</Text>
                            <Switch value={aiEnabled} onValueChange={setAiEnabled} />
                        </View>
                        <Text variant="bodySmall">
                            Uses Groq's advanced LLM to analyze device metrics and provide intelligent optimization
                        </Text>
                    </Card.Content>
                </Card>

                {optimizing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.loadingText}>Analyzing device and generating optimizations...</Text>
                    </View>
                )}

                {optResult && optResult.success && (
                    <>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">Optimization Summary</Text>
                                <View style={styles.summaryContainer}>
                                    <View style={styles.summaryItem}>
                                        <Text variant="displaySmall">{optResult.summary.totalImpact}%</Text>
                                        <Text variant="bodySmall">Total Impact</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text variant="bodyLarge">{optResult.summary.memoryGain}</Text>
                                        <Text variant="bodySmall">Memory Gain</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text variant="bodyLarge">{optResult.summary.batteryGain}</Text>
                                        <Text variant="bodySmall">Battery Gain</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text variant="bodyLarge">{optResult.summary.storageGain}</Text>
                                        <Text variant="bodySmall">Storage Gain</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        {optResult.optimizations.map((opt, index) => (
                            <Card key={index} style={styles.card}>
                                <Card.Content>
                                    <View style={styles.optimizationHeader}>
                                        <Text variant="titleMedium">{opt.type}</Text>
                                        {renderPriorityBadge(opt.priority)}
                                    </View>
                                    <Text variant="bodyMedium">{opt.description}</Text>

                                    <View style={styles.impactContainer}>
                                        <Text variant="bodySmall">Impact: </Text>
                                        <ProgressBar
                                            progress={opt.impact / 100}
                                            color="#6200ee"
                                            style={styles.impactBar}
                                        />
                                        <Text variant="bodySmall">{opt.impact}%</Text>
                                    </View>

                                    <Divider style={styles.divider} />

                                    <Text variant="titleSmall" style={styles.actionsTitle}>
                                        Actions {opt.isAutomated ? '(Automated)' : '(Manual)'}:
                                    </Text>
                                    {opt.actions.map((action, idx) => (
                                        <List.Item
                                            key={idx}
                                            title={action}
                                            left={props => <List.Icon {...props} icon={opt.isAutomated ? "robot" : "hand"} />}
                                        />
                                    ))}

                                    <View style={styles.actionButtonsContainer}>
                                        <Button
                                            mode={opt.isAutomated ? "contained" : "outlined"}
                                            style={styles.actionButton}
                                        >
                                            {opt.isAutomated ? "Apply Automatically" : "Apply Manually"}
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </>
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
        paddingBottom: 32,
    },
    card: {
        marginBottom: 16,
        elevation: 4,
    },
    description: {
        marginTop: 8,
        marginBottom: 16,
    },
    metricsContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    metricItem: {
        alignItems: 'center',
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optimizeButton: {
        width: '100%',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    summaryItem: {
        alignItems: 'center',
        width: '48%',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    optimizationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priorityChip: {
        height: 28,
    },
    impactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    impactBar: {
        flex: 1,
        marginHorizontal: 8,
        height: 6,
        borderRadius: 3,
    },
    divider: {
        marginVertical: 12,
    },
    actionsTitle: {
        marginBottom: 8,
    },
    actionButtonsContainer: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        marginLeft: 8,
    },
});
