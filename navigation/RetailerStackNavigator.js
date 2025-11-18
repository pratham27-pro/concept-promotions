import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RetailerTabNavigator from "./RetailerTabNavigator";
import CampaignDetailsScreen from "../screens/retailer/CampaignDetailsScreen";
import SubmitReportScreen from "../screens/retailer/SubmitReportScreen";
import UpdateProfileScreen from "../screens/retailer/UpdateProfileScreen";

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
                name="CampaignDetails"
                component={CampaignDetailsScreen}
            />
            <Stack.Screen name="SubmitReport" component={SubmitReportScreen} />
            <Stack.Screen
                name="UpdateProfile"
                component={UpdateProfileScreen}
            />
        </Stack.Navigator>
    );
};

export default RetailerStackNavigator;
