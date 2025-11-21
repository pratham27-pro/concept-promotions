import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { navigationRef } from "./navigation/RootNavigation";

import EmployeeStackNavigator from "./navigation/employee/EmployeeStackNavigator";
import RetailerStackNavigator from "./navigation/retailer/RetailerStackNavigator";
import ClientStackNavigator from "./navigation/client/ClientStackNavigator";

import LoginScreen from "./screens/auth/LoginScreen";
import CreateEmployeeProfileScreen from "./screens/employee/CreateEmployeeProfileScreen";
import CreateRetailerProfileScreen from "./screens/retailer/CreateRetailerProfileScreen";
// (Client create profile not finalized yet, so not imported)

const Stack = createNativeStackNavigator();

// Development Configuration
const DEV_CONFIG = {
    ENABLED: true,
    USER_TYPE: "CLIENT", // 'RETAILER', 'EMPLOYEE', 'CLIENT'

    // Set to true to test profile creation screens (retailer/employee only)
    TEST_PROFILE_CREATION: false,
};

const getInitialRoute = () => {
    if (!DEV_CONFIG.ENABLED) return "Login";

    if (DEV_CONFIG.TEST_PROFILE_CREATION) {
        if (DEV_CONFIG.USER_TYPE === "RETAILER") return "CreateRetailerProfile";
        if (DEV_CONFIG.USER_TYPE === "EMPLOYEE") return "CreateEmployeeProfile";
        return "Login"; // client create profile not ready
    }

    if (DEV_CONFIG.USER_TYPE === "RETAILER") return "RetailerDashboard";
    if (DEV_CONFIG.USER_TYPE === "EMPLOYEE") return "EmployeeDashboard";
    if (DEV_CONFIG.USER_TYPE === "CLIENT") return "ClientDashboard";

    return "Login";
};

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName={getInitialRoute()}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />

                    {/* Retailer */}
                    <Stack.Screen
                        name="CreateRetailerProfile"
                        component={CreateRetailerProfileScreen}
                    />
                    <Stack.Screen
                        name="RetailerDashboard"
                        component={RetailerStackNavigator}
                    />

                    {/* Employee */}
                    <Stack.Screen
                        name="CreateEmployeeProfile"
                        component={CreateEmployeeProfileScreen}
                    />
                    <Stack.Screen
                        name="EmployeeDashboard"
                        component={EmployeeStackNavigator}
                    />

                    {/* Client */}
                    <Stack.Screen
                        name="ClientDashboard"
                        component={ClientStackNavigator}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
