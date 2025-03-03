import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedCircularProgressProps {
    value: number;
    size?: number;
    thickness?: number;
    color?: string;
    backgroundColor?: string;
}

const AnimatedCircularProgress = ({
    value = 0,
    size = 80,
    thickness = 8,
    color = '#6200ee',
    backgroundColor = '#e0e0e0'
}: AnimatedCircularProgressProps) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Use a simple animation for the value
        Animated.timing(animatedValue, {
            toValue: value,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [value]);

    // Calculate the animated display value
    const displayValue = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 100],
        extrapolate: 'clamp',
    });

    // For simplicity, create a pie-like progress representation
    const getProgressStyles = () => {
        // Simple approach: use color intensity based on value
        const rotation = value * 3.6; // Convert percentage to degrees (100% = 360 degrees)

        return {
            transform: [{ rotate: `${rotation}deg` }],
            backgroundColor: color,
            opacity: value / 100,
        };
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Background Circle */}
            <View
                style={[
                    styles.backgroundCircle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: thickness,
                        borderColor: backgroundColor
                    }
                ]}
            />

            {/* Progress indicator - simplified approach */}
            <View
                style={[
                    styles.progressIndicator,
                    {
                        width: size - 2 * thickness,
                        height: size - 2 * thickness,
                        borderRadius: (size - 2 * thickness) / 2,
                    },
                    getProgressStyles()
                ]}
            />

            {/* Text in center */}
            <View style={styles.textContainer}>
                <Animated.Text
                    style={[
                        styles.valueText,
                        { fontSize: size / 4 }
                    ]}
                >
                    {Math.round(value)}%
                </Animated.Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressIndicator: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueText: {
        fontWeight: 'bold',
    }
});

export default AnimatedCircularProgress;
