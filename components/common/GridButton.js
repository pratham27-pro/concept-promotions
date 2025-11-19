import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";

const GridButton = ({
    title,
    icon,
    onPress,
    // Navigation props
    navigateTo,
    navigationParams,
    // Styling
    colors = ["#ff6b6b", "#ee5a6f"],
    iconSize = 28,
    iconColor = "#fff",
    disabled = false,
    // Size
    width = "48%", // Can be '48%' for grid or '100%' for full width
    height = 120,
    style,
}) => {
    const handlePress = () => {
        if (disabled) return;

        if (navigateTo) {
            RootNavigation.navigate(navigateTo, navigationParams);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.buttonWrapper, { width }, style]}
            onPress={handlePress}
            activeOpacity={0.8}
            disabled={disabled}
        >
            <LinearGradient
                colors={disabled ? ["#ccc", "#999"] : colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientButton, { height }]}
            >
                {icon && (
                    <Ionicons name={icon} size={iconSize} color={iconColor} />
                )}
                <Text style={styles.buttonText}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonWrapper: {
        marginBottom: 15,
    },
    gradientButton: {
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#ff6b6b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
        textAlign: "center",
    },
});

export default GridButton;
