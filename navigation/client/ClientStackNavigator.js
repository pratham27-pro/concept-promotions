import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientHomeScreen from "../../screens/client/ClientHomeScreen";
import ClientOutletsScreen from "../../screens/client/ClientOutletScreen";
import ClientTabNavigator from "./ClientTabNavigator";

import LoginScreen from "../../screens/auth/LoginScreen";

const Stack = createNativeStackNavigator();

const ClientStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
            <Stack.Screen
                name="ClientHomeDashboard"
                component={ClientHomeScreen}
            />
            <Stack.Screen
                name="ClientOutlets"
                component={ClientOutletsScreen}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
};

export default ClientStackNavigator;
