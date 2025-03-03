import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, Animated, TouchableOpacity, Easing } from 'react-native';
import { Text, Card, Button, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collectDeviceMetrics } from '../services/DeviceMetrics';

export default function HomeScreen({ navigation }: any) {
    const [deviceStats, setDeviceStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Animation values
    const cpuProgress = useRef(new Animated.Value(0)).current;
    const memoryProgress = useRef(new Animated.Value(0)).current;
    const batteryProgress = useRef(new Animated.Value(0)).current;
    const storageProgress = useRef(new Animated.Value(0)).current;

    const animateValues = (cpu: number, memory: number, battery: number, storage: number) => {
        // Reset values
        cpuProgress.setValue(0);
        memoryProgress.setValue(0);
        batteryProgress.setValue(0);
        storageProgress.setValue(0);

        // Animate to new values
        Animated.parallel([
            Animated.timing(cpuProgress, {
                toValue: cpu / 100,
                duration: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false
            }),
            Animated.timing(memoryProgress, {
                toValue: memory / 100,
                duration: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false
            }),
            Animated.timing(batteryProgress, {
                toValue: battery / 100,
                duration: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false
            }),
            Animated.timing(storageProgress, {
                toValue: storage / 100,
                duration: 1000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false
            })
        ]).start();
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const metrics = await collectDeviceMetrics();
                setDeviceStats(metrics);

                // Animate the progress bars
                animateValues(
                    metrics.cpuUsage,
                    metrics.memoryUsage,
                    metrics.batteryLevel,
                    metrics.storageUsed
                );
            } catch (err) {
                console.error(err);
                setError('Failed to load device metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Refresh metrics every 30 seconds
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    const viewDetailedMetrics = () => {
        // Navigate to detailed metrics screen with current device stats
        navigation.navigate('DetailedMetrics', { deviceStats });
    };

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
                                <View style={styles.cardHeader}>
                                    <Text variant="titleLarge">Device Health</Text>
                                    <TouchableOpacity onPress={viewDetailedMetrics}>
                                        <MaterialCommunityIcons name="chart-bar" size={24} color="#6200ee" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text variant="bodyLarge">CPU</Text>
                                        <View style={styles.progressContainer}>
                                            <ProgressBar
                                                progress={cpuProgress as any}
                                                color={deviceStats?.cpuUsage > 80 ? '#F44336' :
                                                    deviceStats?.cpuUsage > 60 ? '#FF9800' : '#4CAF50'}
                                                style={styles.progressBar}
                                            />
                                            <Text variant="headlineMedium">{deviceStats?.cpuUsage}%</Text>
                                        </View>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text variant="bodyLarge">Memory</Text>
                                        <View style={styles.progressContainer}>
                                            <ProgressBar
                                                progress={memoryProgress as any}
                                                color={deviceStats?.memoryUsage > 80 ? '#F44336' :
                                                    deviceStats?.memoryUsage > 60 ? '#FF9800' : '#4CAF50'}
                                                style={styles.progressBar}
                                            />
                                            <Text variant="headlineMedium">{deviceStats?.memoryUsage}%</Text>
                                        </View>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text variant="bodyLarge">Battery</Text>
                                        <View style={styles.progressContainer}>
                                            <ProgressBar
                                                progress={batteryProgress as any}
                                                color={deviceStats?.batteryLevel < 20 ? '#F44336' :
                                                    deviceStats?.batteryLevel < 50 ? '#FF9800' : '#4CAF50'}
                                                style={styles.progressBar}
                                            />
                                            <Text variant="headlineMedium">{deviceStats?.batteryLevel}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={viewDetailedMetrics}>View Details</Button>
                            </Card.Actions>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">Storage Usage</Text>
                                <View style={styles.progressContainer}>
                                    <ProgressBar
                                        progress={storageProgress as any}
                                        color={deviceStats?.storageUsed > 90 ? '#F44336' :
                                            deviceStats?.storageUsed > 75 ? '#FF9800' : '#4CAF50'}
                                        style={styles.progressBar}
                                    />
                                    <Text variant="headlineMedium">{deviceStats?.storageUsed}% Used</Text>
                                </View>
                                <Text variant="bodyMedium">Last optimized: {new Date().toLocaleDateString()}</Text>
                            </Card.Content>
                            <Card.Actions>
                                <Button mode="contained" onPress={() => navigation.navigate('Optimize')}>Optimize Now</Button>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statsContainer: {
        marginTop: 16,
    },
    statItem: {
        marginBottom: 16,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        marginBottom: 5,
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
