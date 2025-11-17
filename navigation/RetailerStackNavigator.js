import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RetailerTabNavigator from "./RetailerTabNavigator";
import CampaignDetailsScreen from "../screens/retailer/CampaignDetailsScreen";

const Stack = createNativeStackNavigator();

const RetailerStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="RetailerTabs"
                component={RetailerTabNavigator}
            />
            <Stack.Screen
                name="CampaignDetails" // ✅ This is the correct name to use
                component={CampaignDetailsScreen}
            />
        </Stack.Navigator>
    );
};

export default RetailerStackNavigator;
