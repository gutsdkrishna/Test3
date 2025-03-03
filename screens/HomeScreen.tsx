import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Modal } from 'react-native';
import { Text, Card, Button, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { collectDeviceMetrics, type DeviceMetrics, type AppInfo } from '../services/DeviceMetrics';
import { RootTabParamList } from '../types/navigation';
// Fix the import path to use the correct path resolution
import AnimatedCircularProgress from './AnimatedCircularProgress';
// Detailed metrics modal component
const DetailedMetricsModal = ({
    visible,
    onClose,
    metrics,
    apps
}: {
    visible: boolean;
    onClose: () => void;
    metrics: DeviceMetrics | null;
    apps: AppInfo[];
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text variant="headlineMedium">Detailed System Metrics</Text>
                    <Button onPress={onClose}>Close</Button>
                </View>

                <ScrollView contentContainerStyle={styles.modalContent}>
                    <Card style={styles.detailCard}>
                        <Card.Content>
                            <Text variant="titleLarge">System Information</Text>
                            <View style={styles.detailItem}>
                                <Text>Device: {metrics?.deviceName || 'Unknown'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text>OS Version: {metrics?.osVersion || 'Unknown'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text>CPU Usage: {metrics?.cpuUsage || 0}%</Text>
                                <ProgressBar progress={(metrics?.cpuUsage ?? 0) / 100} color="#6200ee" style={styles.progressBar} />
                            </View>
                            <View style={styles.detailItem}>
                                <Text>Memory Usage: {metrics?.memoryUsage || 0}%</Text>
                                <ProgressBar progress={(metrics?.memoryUsage ?? 0) / 100} color="#6200ee" style={styles.progressBar} />
                            </View>
                            <View style={styles.detailItem}>
                                <Text>Battery: {metrics?.batteryLevel || 0}% ({metrics?.batteryState || 'unknown'})</Text>
                                <ProgressBar progress={(metrics?.batteryLevel ?? 0) / 100} color="#6200ee" style={styles.progressBar} />
                            </View>
                            <View style={styles.detailItem}>
                                <Text>Storage Used: {metrics?.storageUsed || 0}%</Text>
                                <ProgressBar progress={(metrics?.storageUsed ?? 0) / 100} color="#6200ee" style={styles.progressBar} />
                            </View>
                        </Card.Content>
                    </Card>

                    <Card style={styles.detailCard}>
                        <Card.Content>
                            <Text variant="titleLarge">Running Applications</Text>

                            {apps.map((app: AppInfo, index: number) => (
                                <View key={index} style={styles.appItem}>
                                    <Text variant="titleMedium">{app.name}</Text>
                                    <Text>Package: {app.packageName}</Text>
                                    <View style={styles.appMetrics}>
                                        <View style={styles.appMetricItem}>
                                            <Text variant="bodySmall">Memory</Text>
                                            <Text variant="bodyMedium">{app.memoryUsage}MB</Text>
                                        </View>
                                        <View style={styles.appMetricItem}>
                                            <Text variant="bodySmall">Battery Drain</Text>
                                            <Text variant="bodyMedium">{app.batteryDrain}%/hr</Text>
                                        </View>
                                        <View style={styles.appMetricItem}>
                                            <Text variant="bodySmall">Background</Text>
                                            <Text variant="bodyMedium">{app.backgroundTime}min</Text>
                                        </View>
                                    </View>
                                    <ProgressBar
                                        progress={app.memoryUsage / 500}
                                        color={app.memoryUsage > 200 ? "#ff4d4d" : "#6200ee"}
                                        style={styles.progressBar}
                                    />
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

export default function HomeScreen() {
    const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const navigation = useNavigation<NavigationProp<RootTabParamList>>();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const metrics = await collectDeviceMetrics();
                setDeviceMetrics(metrics);
            } catch (err) {
                console.error(err);
                setError('Failed to load device metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Set up refresh interval
        const intervalId = setInterval(fetchStats, 30000); // Refresh every 30 seconds

        return () => clearInterval(intervalId);
    }, []);

    const showDetailsModal = () => {
        setDetailsModalVisible(true);
    };

    const goToOptimize = () => {
        try {
            navigation.navigate('Optimize');
        } catch (err) {
            console.error("Navigation error:", err);
            alert("Could not open the optimize screen. Please try again.");
        }
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
                                <Text variant="titleLarge">Device Health</Text>
                                <View style={styles.metricsContainer}>
                                    <View style={styles.metricItem}>
                                        <AnimatedCircularProgress
                                            value={deviceMetrics?.cpuUsage || 0}
                                            color={(deviceMetrics?.cpuUsage ?? 0) > 70 ? '#ff4d4d' : '#6200ee'}
                                        />
                                        <Text style={styles.metricLabel}>CPU</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <AnimatedCircularProgress
                                            value={deviceMetrics?.memoryUsage || 0}
                                            color={(deviceMetrics?.memoryUsage ?? 0) > 80 ? '#ff4d4d' : '#6200ee'}
                                        />
                                        <Text style={styles.metricLabel}>Memory</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <AnimatedCircularProgress
                                            value={deviceMetrics?.batteryLevel || 0}
                                            color={(deviceMetrics?.batteryLevel ?? 0) < 20 ? '#ff4d4d' : '#6200ee'}
                                        />
                                        <Text style={styles.metricLabel}>Battery</Text>
                                    </View>
                                </View>
                                <View style={styles.storageSection}>
                                    <Text variant="bodyMedium">Storage Used: {deviceMetrics?.storageUsed || 0}%</Text>
                                    <ProgressBar
                                        progress={deviceMetrics?.storageUsed ? deviceMetrics.storageUsed / 100 : 0}
                                        color={(deviceMetrics?.storageUsed ?? 0) > 90 ? '#ff4d4d' : '#6200ee'}
                                        style={styles.storageBar}
                                    />
                                </View>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={showDetailsModal}>View Details</Button>
                            </Card.Actions>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">Optimization Status</Text>
                                <View style={styles.optimizationStatus}>
                                    <Text>Last optimized: {new Date().toLocaleDateString()}</Text>
                                    <Text style={styles.optimizationRecommendation}>
                                        {(deviceMetrics?.cpuUsage ?? 0) > 50 || (deviceMetrics?.memoryUsage ?? 0) > 70
                                            ? 'Optimization recommended'
                                            : 'System running optimally'}
                                    </Text>
                                </View>
                            </Card.Content>
                            <Card.Actions>
                                <Button
                                    mode="contained"
                                    onPress={goToOptimize}
                                >
                                    Optimize Now
                                </Button>
                            </Card.Actions>
                        </Card>
                    </>
                )}

                {error && <Text style={styles.error}>{error}</Text>}
            </ScrollView>

            <DetailedMetricsModal
                visible={detailsModalVisible}
                onClose={() => setDetailsModalVisible(false)}
                metrics={deviceMetrics}
                apps={deviceMetrics?.installedApps || []}
            />
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
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        marginBottom: 16,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    storageSection: {
        marginTop: 8,
    },
    storageBar: {
        height: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    optimizationStatus: {
        marginTop: 8,
    },
    optimizationRecommendation: {
        marginTop: 8,
        fontWeight: '500',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    loader: {
        marginTop: 50
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#ffffff',
    },
    modalContent: {
        padding: 16,
    },
    detailCard: {
        marginBottom: 16,
    },
    detailItem: {
        marginVertical: 8,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        marginTop: 4,
    },
    appItem: {
        marginVertical: 12,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    appMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 4,
    },
    appMetricItem: {
        alignItems: 'center',
    },
});
