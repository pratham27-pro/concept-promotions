// navigation/AppNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";

import { useAuth } from "../context/AuthContext";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";

import CreateEmployeeProfileScreen from "../screens/employee/CreateEmployeeProfileScreen";
import CreateRetailerProfileScreen from "../screens/retailer/CreateRetailerProfileScreen";

// ✅ Import Tab Navigators instead of Dashboard Screens
import EmployeeTabNavigator from "../navigation/employee/EmployeeTabNavigator";
import RetailerTabNavigator from "../navigation/retailer/RetailerTabNavigator";
import ClientStackNavigator from "../navigation/client/ClientStackNavigator";

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
                // ✅ Logged in with complete profile - Show Tab Navigators (with bottom navbar)
                <>
                    {userRole === "employee" && (
                        <Stack.Screen
                            name="EmployeeTabs"
                            component={EmployeeTabNavigator} // ✅ Tab Navigator instead of Dashboard
                        />
                    )}
                    {userRole === "retailer" && (
                        <Stack.Screen
                            name="RetailerTabs"
                            component={RetailerTabNavigator} // ✅ Tab Navigator instead of Dashboard
                        />
                    )}
                    {userRole === "client" && (
                        <>
                            {console.log(
                                "✅ Rendering ClientTabs for client role"
                            )}
                            <Stack.Screen
                                name="ClientStack"
                                component={ClientStackNavigator}
                            />
                        </>
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
