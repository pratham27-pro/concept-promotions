import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { navigationRef } from "./navigation/RootNavigation";

import EmployeeStackNavigator from "./navigation/employee/EmployeeStackNavigator";
import RetailerStackNavigator from "./navigation/retailer/RetailerStackNavigator";
import LoginScreen from "./screens/auth/LoginScreen";
import CreateEmployeeProfileScreen from "./screens/employee/CreateEmployeeProfileScreen";
import CreateRetailerProfileScreen from "./screens/retailer/CreateRetailerProfileScreen";

const Stack = createNativeStackNavigator();

// Development Configuration
const DEV_CONFIG = {
    ENABLED: true,
    USER_TYPE: "EMPLOYEE", // 'RETAILER', 'EMPLOYEE', 'CLIENT'

    // Set to true to test profile creation screens
    TEST_PROFILE_CREATION: false,
};

const getInitialRoute = () => {
    if (!DEV_CONFIG.ENABLED) return "Login";

    if (DEV_CONFIG.TEST_PROFILE_CREATION) {
        return DEV_CONFIG.USER_TYPE === "RETAILER"
            ? "CreateRetailerProfile"
            : "CreateEmployeeProfile";
    }

    return DEV_CONFIG.USER_TYPE === "RETAILER"
        ? "RetailerDashboard"
        : "EmployeeDashboard";
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

                    <Stack.Screen
                        name="CreateRetailerProfile"
                        component={CreateRetailerProfileScreen}
                    />
                    <Stack.Screen
                        name="RetailerDashboard"
                        component={RetailerStackNavigator}
                    />

                    <Stack.Screen
                        name="CreateEmployeeProfile"
                        component={CreateEmployeeProfileScreen}
                    />
                    <Stack.Screen
                        name="EmployeeDashboard"
                        component={EmployeeStackNavigator}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
