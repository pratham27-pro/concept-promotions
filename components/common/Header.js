import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";

const Header = ({
    showBackButton = true,
    onBackPress,
    showLogo = true,
    logoComponent,
    title,
    rightComponent,
    backgroundColor = "#fff",
}) => {
    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            RootNavigation.goBack();
        }
    };

    return (
        <View style={[styles.header, { backgroundColor }]}>
            {/* Left Side - Back Button */}
            <View style={styles.leftContainer}>
                {showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                )}
                {!showBackButton && <View style={styles.placeholder} />}
            </View>

            {/* Center - Logo or Title */}
            <View style={styles.centerContainer}>
                {showLogo && !logoComponent && (
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>CONCEPT</Text>
                        <Text style={styles.logoSubtext}>PROMOTIONS</Text>
                    </View>
                )}
                {logoComponent && logoComponent}
                {title && !showLogo && (
                    <Text style={styles.headerTitle}>{title}</Text>
                )}
            </View>

            {/* Right Side - Optional Component */}
            <View style={styles.rightContainer}>
                {rightComponent || <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leftContainer: {
        width: 40,
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
    },
    rightContainer: {
        width: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#f0f0f0",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#333",
    },
    logoSubtext: {
        fontSize: 6,
        color: "#666",
        marginTop: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    placeholder: {
        width: 40,
    },
});

export default Header;
