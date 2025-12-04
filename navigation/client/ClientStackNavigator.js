import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientTabNavigator from "./ClientTabNavigator";
import ClientHomeScreen from "../../screens/client/ClientHomeScreen";
import ClientOutletsScreen from "../../screens/client/ClientOutletScreen";

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
        </Stack.Navigator>
    );
};

export default ClientStackNavigator;
