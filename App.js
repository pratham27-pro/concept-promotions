import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { navigationRef } from "./navigation/RootNavigation";

// Screens
import LoginScreen from "./screens/auth/LoginScreen";
import CreateRetailerProfileScreen from "./screens/retailer/CreateRetailerProfileScreen";
import RetailerStackNavigator from "./navigation/RetailerStackNavigator";

const Stack = createNativeStackNavigator();

// 🚀 DEVELOPMENT MODE - Set to true to skip login
const DEV_MODE = true; // Change to false for production

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}
                    initialRouteName={DEV_MODE ? "RetailerDashboard" : "Login"}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen
                        name="CreateRetailerProfile"
                        component={CreateRetailerProfileScreen}
                    />
                    <Stack.Screen
                        name="RetailerDashboard"
                        component={RetailerStackNavigator}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
