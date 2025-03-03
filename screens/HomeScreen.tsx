import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';

export default function HomeScreen() {
    const [deviceStats, setDeviceStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // This might not work if the endpoint is not implemented yet
                const response = await apiClient.get('/api/device-stats');
                setDeviceStats(response.data);
            } catch (err) {
                console.error(err);
                // For demo purposes, set some mock data
                setDeviceStats({
                    cpuUsage: 34,
                    memoryUsage: 62,
                    batteryLevel: 78,
                    storageUsed: 45,
                    lastOptimized: new Date().toLocaleDateString()
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>BoostIQ Pro Dashboard</Text>

                {loading ? (
                    <ActivityIndicator size="large" style={styles.loader} />
                ) : (
                    <>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">Device Health</Text>
                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text variant="bodyLarge">CPU Usage</Text>
                                        <Text variant="headlineMedium">{deviceStats?.cpuUsage}%</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text variant="bodyLarge">Memory</Text>
                                        <Text variant="headlineMedium">{deviceStats?.memoryUsage}%</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text variant="bodyLarge">Battery</Text>
                                        <Text variant="headlineMedium">{deviceStats?.batteryLevel}%</Text>
                                    </View>
                                </View>
                            </Card.Content>
                            <Card.Actions>
                                <Button>View Details</Button>
                            </Card.Actions>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">Storage Usage</Text>
                                <Text variant="headlineMedium">{deviceStats?.storageUsed}% Used</Text>
                                <Text variant="bodyMedium">Last optimized: {deviceStats?.lastOptimized}</Text>
                            </Card.Content>
                            <Card.Actions>
                                <Button mode="contained">Optimize Now</Button>
                            </Card.Actions>
                        </Card>
                    </>
                )}

                {error && <Text style={styles.error}>{error}</Text>}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
        elevation: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    loader: {
        marginTop: 50
    }
});
