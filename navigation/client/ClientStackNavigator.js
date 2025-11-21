import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientTabNavigator from "./ClientTabNavigator";

const Stack = createNativeStackNavigator();

const ClientStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
            {/* Add other client-only screens here later if needed */}
        </Stack.Navigator>
    );
};

export default ClientStackNavigator;
