import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Text, Card, DataTable, Searchbar, Divider, ProgressBar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collectDeviceMetrics, AppInfo } from '../services/DeviceMetrics';

export default function DetailedMetricsScreen({ route, navigation }: any) {
    // Get the device stats passed from the HomeScreen or fetch new if not available
    const [deviceStats, setDeviceStats] = useState<any>(route.params?.deviceStats || null);
    const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(!route.params?.deviceStats);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const metrics = await collectDeviceMetrics();
            setDeviceStats(metrics);
            setInstalledApps(metrics.installedApps);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!deviceStats) {
            fetchMetrics();
        } else {
            setInstalledApps(deviceStats.installedApps);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMetrics();
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const filteredApps = installedApps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSortedAppsByMemory = () => {
        return [...filteredApps].sort((a, b) => b.memoryUsage - a.memoryUsage);
    };

    const getSortedAppsByBattery = () => {
        return [...filteredApps].sort((a, b) => b.batteryDrain - a.batteryDrain);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Detailed System Metrics</Text>

                {loading ? (
                    <Text>Loading metrics...</Text>
                ) : (
                    <>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">Device Information</Text>
                                <Divider style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Device:</Text>
                                    <Text style={styles.infoValue}>{deviceStats.deviceName}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>OS Version:</Text>
                                    <Text style={styles.infoValue}>{deviceStats.osVersion}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Battery State:</Text>
                                    <Text style={styles.infoValue}>{deviceStats.batteryState}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Storage:</Text>
                                    <Text style={styles.infoValue}>
                                        {Math.round(deviceStats.totalStorage / (1024 * 1024 * 1024))} GB Total
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge">System Resource Usage</Text>
                                <Divider style={styles.divider} />

                                <Text variant="titleMedium" style={styles.sectionTitle}>CPU Usage</Text>
                                <View style={styles.resourceRow}>
                                    <Text>{deviceStats.cpuUsage}%</Text>
                                    <ProgressBar
                                        progress={deviceStats.cpuUsage / 100}
                                        color={deviceStats.cpuUsage > 80 ? '#F44336' :
                                            deviceStats.cpuUsage > 60 ? '#FF9800' : '#4CAF50'}
                                        style={styles.progressBar}
                                    />
                                </View>

                                <Text variant="titleMedium" style={styles.sectionTitle}>Memory Usage</Text>
                                <View style={styles.resourceRow}>
                                    <Text>{deviceStats.memoryUsage}%</Text>
                                    <ProgressBar
                                        progress={deviceStats.memoryUsage / 100}
                                        color={deviceStats.memoryUsage > 80 ? '#F44336' :
                                            deviceStats.memoryUsage > 60 ? '#FF9800' : '#4CAF50'}
                                        style={styles.progressBar}
                                    />
                                </View>

                                <Text variant="titleMedium" style={styles.sectionTitle}>Battery Level</Text>
                                <View style={styles.resourceRow}>
                                    <Text>{deviceStats.batteryLevel}%</Text>
                                    <ProgressBar
                                        progress={deviceStats.batteryLevel / 100}
                                        color={deviceStats.batteryLevel < 20 ? '#F44336' :
                                            deviceStats.batteryLevel < 50 ? '#FF9800' : '#4CAF50'}
                                        style={styles.progressBar}
                                    />
                                </View>

                                <Text variant="titleMedium" style={styles.sectionTitle}>Storage Usage</Text>
                                <View style={styles.resourceRow}>
                                    <Text>{deviceStats.storageUsed}%</Text>
                                    <ProgressBar
                                        progress={deviceStats.storageUsed / 100}
                                        color={deviceStats.storageUsed > 90 ? '#F44336' :
                                            deviceStats.storageUsed > 75 ? '#FF9800' : '#4CAF50'}
                                        style={styles.progressBar}
                                    />
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.appHeaderContainer}>
                                    <Text variant="titleLarge">Running Applications</Text>
                                    <Button
                                        mode="contained"
                                        compact
                                        onPress={onRefresh}
                                        loading={refreshing}
                                    >
                                        Refresh
                                    </Button>
                                </View>
                                <Searchbar
                                    placeholder="Search apps"
                                    onChangeText={handleSearch}
                                    value={searchQuery}
                                    style={styles.searchBar}
                                />
                                <Divider style={styles.divider} />

                                <Text variant="titleMedium" style={styles.sectionTitle}>By Memory Usage</Text>
                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title>App Name</DataTable.Title>
                                        <DataTable.Title numeric>Memory</DataTable.Title>
                                        <DataTable.Title numeric>Background</DataTable.Title>
                                    </DataTable.Header>

                                    {getSortedAppsByMemory().map((app, index) => (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell>{app.name}</DataTable.Cell>
                                            <DataTable.Cell numeric>{app.memoryUsage} MB</DataTable.Cell>
                                            <DataTable.Cell numeric>{app.backgroundTime} min</DataTable.Cell>
                                        </DataTable.Row>
                                    ))}
                                </DataTable>

                                <Divider style={styles.divider} />

                                <Text variant="titleMedium" style={styles.sectionTitle}>By Battery Drain</Text>
                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title>App Name</DataTable.Title>
                                        <DataTable.Title numeric>Battery</DataTable.Title>
                                        <DataTable.Title numeric>Background</DataTable.Title>
                                    </DataTable.Header>

                                    {getSortedAppsByBattery().map((app, index) => (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell>{app.name}</DataTable.Cell>
                                            <DataTable.Cell numeric>{app.batteryDrain}%/hr</DataTable.Cell>
                                            <DataTable.Cell numeric>{app.backgroundTime} min</DataTable.Cell>
                                        </DataTable.Row>
                                    ))}
                                </DataTable>
                            </Card.Content>
                        </Card>
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
    divider: {