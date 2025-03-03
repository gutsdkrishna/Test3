import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Avatar, Button, List, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    // Mock user data
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://i.pravatar.cc/300',
        subscription: 'Pro',
        joinDate: '2023-01-15',
        completedCourses: 5,
        inProgressCourses: 2
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <Avatar.Image
                        size={100}
                        source={{ uri: user.avatar }}
                        style={styles.avatar}
                    />
                    <Text variant="headlineMedium">{user.name}</Text>
                    <Text variant="bodyMedium">{user.email}</Text>
                    <View style={styles.subscriptionBadge}>
                        <Text style={styles.subscriptionText}>{user.subscription}</Text>
                    </View>
                </View>

                <Card style={styles.statsCard}>
                    <Card.Content>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text variant="headlineMedium">{user.completedCourses}</Text>
                                <Text variant="bodySmall">Completed</Text>
                                <Text variant="bodySmall">Courses</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text variant="headlineMedium">{user.inProgressCourses}</Text>
                                <Text variant="bodySmall">In Progress</Text>
                                <Text variant="bodySmall">Courses</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text variant="headlineMedium">
                                    {new Date().getFullYear() - new Date(user.joinDate).getFullYear()}
                                </Text>
                                <Text variant="bodySmall">Years as</Text>
                                <Text variant="bodySmall">Member</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <List.Section>
                    <List.Subheader>Account Settings</List.Subheader>
                    <Card style={styles.settingsCard}>
                        <List.Item
                            title="Edit Profile"
                            left={() => <List.Icon icon="account-edit" />}
                            right={() => <List.Icon icon="chevron-right" />}
                        />
                        <Divider />
                        <List.Item
                            title="Notification Settings"
                            left={() => <List.Icon icon="bell-outline" />}
                            right={() => <List.Icon icon="chevron-right" />}
                        />
                        <Divider />
                        <List.Item
                            title="Privacy Settings"
                            left={() => <List.Icon icon="shield-account" />}
                            right={() => <List.Icon icon="chevron-right" />}
                        />
                        <Divider />
                        <List.Item
                            title="Payment Methods"
                            left={() => <List.Icon icon="credit-card" />}
                            right={() => <List.Icon icon="chevron-right" />}
                        />
                    </Card>
                </List.Section>

                <Button
                    mode="outlined"
                    style={styles.logoutButton}
                    icon="logout-variant"
                >
                    Log Out
                </Button>
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
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        marginBottom: 12,
    },
    subscriptionBadge: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 8,
    },
    subscriptionText: {
        color: 'white',
        fontWeight: 'bold',
    },
    statsCard: {
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    settingsCard: {
        marginBottom: 24,
    },
    logoutButton: {
        marginBottom: 24,
    },
});
