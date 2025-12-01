// App.dev.js - FOR DEVELOPMENT ONLY
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Import all your screens
import LoginScreen from "./screens/auth/LoginScreen";

import CreateEmployeeProfileScreen from "./screens/employee/CreateEmployeeProfileScreen";
import EmployeeDashboardScreen from "./screens/employee/EmployeeDashboardScreen";

import CompleteRetailerProfileScreen from "./screens/retailer/CompleteRetailerProfileScreen";
import RetailerDashboardScreen from "./screens/retailer/RetailerDashboardScreen";

import ClientHomeScreen from "./screens/client/ClientHomeScreen";

// Mock navigation screens selector
const DevScreenSelector = () => {
    const [selectedScreen, setSelectedScreen] = useState(null);

    const screens = [
        {
            name: "Login Screen",
            component: LoginScreen,
            icon: "log-in",
            color: "#E4002B",
        },
        {
            name: "Complete Employee Profile",
            component: CreateEmployeeProfileScreen,
            icon: "person-add",
            color: "#2196F3",
        },
        {
            name: "Employee Dashboard",
            component: EmployeeDashboardScreen,
            icon: "briefcase",
            color: "#4CAF50",
        },
        {
            name: "Complete Retailer Profile",
            component: CompleteRetailerProfileScreen,
            icon: "store",
            color: "#FF9800",
        },
        {
            name: "Retailer Dashboard",
            component: RetailerDashboardScreen,
            icon: "business",
            color: "#9C27B0",
        },
        {
            name: "Client Dashboard",
            component: ClientHomeScreen,
            icon: "people",
            color: "#00BCD4",
        },
    ];

    if (selectedScreen !== null) {
        const ScreenComponent = screens[selectedScreen].component;
        return (
            <View style={styles.screenContainer}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedScreen(null)}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={styles.backButtonText}>Back to Menu</Text>
                </TouchableOpacity>

                {/* Render selected screen */}
                <ScreenComponent
                    navigation={{ goBack: () => setSelectedScreen(null) }}
                />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>🚀 Dev Mode</Text>
                    <Text style={styles.headerSubtitle}>
                        Select a screen to test
                    </Text>
                </View>

                {/* Screen selector */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {screens.map((screen, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.screenButton,
                                { borderLeftColor: screen.color },
                            ]}
                            onPress={() => setSelectedScreen(index)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: screen.color },
                                ]}
                            >
                                <Ionicons
                                    name={screen.icon}
                                    size={24}
                                    color="#fff"
                                />
                            </View>
                            <Text style={styles.screenButtonText}>
                                {screen.name}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        ⚠️ Remember to switch to production mode before
                        deploying!
                    </Text>
                </View>
            </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        backgroundColor: "#E4002B",
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#fff",
        opacity: 0.9,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    screenButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    screenButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    footer: {
        backgroundColor: "#FFF3CD",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#FFE082",
    },
    footerText: {
        fontSize: 12,
        color: "#856404",
        textAlign: "center",
    },
    screenContainer: {
        flex: 1,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E4002B",
        paddingVertical: 12,
        paddingHorizontal: 20,
        paddingTop: 50,
        gap: 10,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default function App() {
    return (
        <NavigationContainer>
            <DevScreenSelector />
        </NavigationContainer>
    );
}
