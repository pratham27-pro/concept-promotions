// navigation/AppNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";

import { useAuth } from "../context/AuthContext";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";

import CreateEmployeeProfileScreen from "../screens/employee/CreateEmployeeProfileScreen";
import EmployeeDashboardScreen from "../screens/employee/EmployeeDashboardScreen";

import CreateRetailerProfileScreen from "../screens/retailer/CreateRetailerProfileScreen";
import RetailerDashboardScreen from "../screens/retailer/RetailerDashboardScreen";

import ClientHomeScreen from "../screens/client/ClientHomeScreen";

// Add other screens as needed

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { userToken, userRole, isLoading, needsProfileCompletion } =
        useAuth();

    // Show loading screen while checking auth status
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E4002B" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!userToken ? (
                // ✅ Not logged in - Show universal login screen
                <Stack.Screen name="Login" component={LoginScreen} />
            ) : needsProfileCompletion ? (
                // ✅ Logged in but profile incomplete
                <>
                    {userRole === "employee" && (
                        <Stack.Screen
                            name="CompleteEmployeeProfile"
                            component={CreateEmployeeProfileScreen}
                        />
                    )}
                    {userRole === "retailer" && (
                        <Stack.Screen
                            name="CompleteRetailerProfile"
                            component={CreateRetailerProfileScreen}
                        />
                    )}
                </>
            ) : (
                // ✅ Logged in with complete profile - Show dashboards
                <>
                    {userRole === "employee" && (
                        <Stack.Screen
                            name="EmployeeDashboard"
                            component={EmployeeDashboardScreen}
                        />
                    )}
                    {userRole === "retailer" && (
                        <Stack.Screen
                            name="RetailerDashboard"
                            component={RetailerDashboardScreen}
                        />
                    )}
                    {userRole === "client" && (
                        <Stack.Screen
                            name="ClientHome"
                            component={ClientHomeScreen}
                        />
                    )}
                </>
            )}
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
});

export default AppNavigator;
