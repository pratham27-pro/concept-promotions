import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";

const GradientButton = ({
    title,
    onPress,
    // Navigation props (optional)
    navigateTo,
    navigationParams,
    // Styling props
    colors = ["#007AFF", "#0051D5"],
    style,
    textStyle,
    // Icon props
    icon,
    iconSize = 22,
    iconColor = "#fff",
    iconPosition = "left", // 'left' or 'right'
    // State props
    disabled = false,
    loading = false,
    // Size variants
    size = "medium", // 'small', 'medium', 'large'
    fullWidth = false,
}) => {
    const handlePress = () => {
        if (disabled || loading) return;

        if (navigateTo) {
            RootNavigation.navigate(navigateTo, navigationParams);
        } else if (onPress) {
            onPress();
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case "small":
                return { paddingVertical: 10, paddingHorizontal: 20 };
            case "large":
                return { paddingVertical: 18, paddingHorizontal: 30 };
            default:
                return { paddingVertical: 14, paddingHorizontal: 24 };
        }
    };

    const getTextSize = () => {
        switch (size) {
            case "small":
                return 14;
            case "large":
                return 18;
            default:
                return 16;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                style,
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            <LinearGradient
                colors={disabled ? ["#ccc", "#999"] : colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, getSizeStyles()]}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        {icon && iconPosition === "left" && (
                            <Ionicons
                                name={icon}
                                size={iconSize}
                                color={iconColor}
                                style={styles.iconLeft}
                            />
                        )}
                        <Text
                            style={[
                                styles.text,
                                { fontSize: getTextSize() },
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                        {icon && iconPosition === "right" && (
                            <Ionicons
                                name={icon}
                                size={iconSize}
                                color={iconColor}
                                style={styles.iconRight}
                            />
                        )}
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    fullWidth: {
        width: "100%",
    },
    disabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    gradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        color: "#fff",
        fontWeight: "bold",
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});

export default GradientButton;
