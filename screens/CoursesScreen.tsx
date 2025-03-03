import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';

interface Course {
    id: number;
    title: string;
    instructor: string;
    rating: number;
}

export default function CoursesScreen() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await apiClient.get('/api/courses');
                setCourses(response.data);
            } catch (err) {
                setError('Failed to fetch courses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Available Courses</Text>

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.courseCard}>
                            <Card.Content>
                                <Text variant="titleLarge">{item.title}</Text>
                                <Text variant="bodyMedium">Instructor: {item.instructor}</Text>
                                <Text variant="bodyMedium">Rating: {item.rating}/5.0</Text>
                            </Card.Content>
                            <Card.Actions>
                                <Button>View Details</Button>
                                <Button mode="contained">Enroll</Button>
                            </Card.Actions>
                        </Card>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    listContent: {
        padding: 16,
    },
    courseCard: {
        marginBottom: 16,
        elevation: 2,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    loader: {
        marginTop: 50,
    }
});
