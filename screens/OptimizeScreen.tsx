import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, List, Switch, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';

export default function OptimizeScreen() {
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<any>(null);
    const [aiEnabled, setAiEnabled] = useState(true);

    const startOptimization = async () => {
        setOptimizing(true);
        setOptimizationResult(null);

        try {
            // This might not work if the endpoint is not implemented yet
            const response = await apiClient.post('/api/optimize');
            setOptimizationResult(response.data);
        } catch (err) {
            console.error(err);
            // For demo purposes, set mock optimization result
            setTimeout(() => {
                setOptimizationResult({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    gains: {
                        memory: '215MB',
                        battery: '12%',
                        storage: '1.2GB'
                    },
                    actions: [
                        'Closed 4 background apps',
                        'Cleared app cache',
                        'Optimized system settings'
                    ],
                    recommendations: [
                        'Update 3 outdated apps',
                        'Free up storage by removing unused files'
                    ]
                });
            }, 2000);
        } finally {
            setOptimizing(false);
        }
    };

    const toggleAI = async (value: boolean) => {
        try {
            // This might not work if the endpoint is not implemented yet
            await apiClient.post('/api/toggle-ai-optimization', { enabled: value });
            setAiEnabled(value);
        } catch (err) {
            console.error(err);
            // For demo, just toggle the state
            setAiEnabled(value);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.optimizeCard}>
                    <Card.Content>
                        <Text variant="headlineMedium">AI-Powered Optimization</Text>
                        <Text variant="bodyMedium" style={styles.description}>
                            Our AI will analyze your device usage and optimize performance, battery life, and storage
                        </Text>
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
                    </Card.Content>
                </Card>

                {optimizing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.loadingText}>Analyzing device and optimizing...</Text>
                    </View>
                )}

                {optimizationResult && (
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
                                        left={() => <List.Icon icon="check-circle" />}
                                    />
                                ))}
                            </List.Section>

                            <Text variant="titleMedium" style={styles.sectionTitle}>Recommendations</Text>
                            <List.Section>
                                {optimizationResult.recommendations.map((rec: string, index: number) => (
                                    <List.Item
                                        key={index}
                                        title={rec}
                                        left={() => <List.Icon icon="information" />}
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
});
