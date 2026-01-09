import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CampaignDetailsScreen from "../../screens/retailer/CampaignDetailsScreen";
import CreateRetailerProfileScreen from "../../screens/retailer/CreateRetailerProfileScreen";
import RetailerProfileScreen from "../../screens/retailer/ProfileScreen";
import SubmitReportScreen from "../../screens/retailer/SubmitReportScreen";
import RetailerCampaignGratification from "../../screens/retailer/campaign-details/Gratification";
import Info from "../../screens/retailer/campaign-details/Info";
import ReportDetails from "../../screens/retailer/campaign-details/reports/ReportDetails";
import RetailerViewReportsScreen from "../../screens/retailer/campaign-details/reports/ViewReport";
import RetailerTabNavigator from "./RetailerTabNavigator";
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
            <Stack.Screen
                name="RetailerViewReports"
                component={RetailerViewReportsScreen}
            />
            <Stack.Screen name="ReportDetails" component={ReportDetails} />
            <Stack.Screen name="RetailerCampaignInfo" component={Info} />
            <Stack.Screen
                name="RetailerCampaignGratification"
                component={RetailerCampaignGratification}
            />
        </Stack.Navigator>
    );
};

export default RetailerStackNavigator;
