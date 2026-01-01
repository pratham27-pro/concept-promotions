import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CampaignDetailsScreen from "../../screens/retailer/CampaignDetailsScreen";
import SubmitReportScreen from "../../screens/retailer/SubmitReportScreen";
import RetailerTabNavigator from "./RetailerTabNavigator";
import CreateRetailerProfileScreen from "../../screens/retailer/CreateRetailerProfileScreen";
import RetailerProfileScreen from "../../screens/retailer/ProfileScreen";
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
                component={RetailerProfileScreen}
            />
            <Stack.Screen
                name="CompleteRetailerProfile"
                component={CreateRetailerProfileScreen}
            />
        </Stack.Navigator>
    );
};

export default RetailerStackNavigator;
