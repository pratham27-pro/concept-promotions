import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EmployeeCampaignDetailsScreen from "../../screens/employee/EmployeeCampaignDetailsScreen";
import EmployeeTabNavigator from "./EmployeeTabNavigator";
import EmployeeSubmitReportScreen from "../../screens/employee/EmployeeSubmitReportScreen";
import UpdateEmployeeProfileScreen from "../../screens/employee/UpdateEmployeeProfileScreen";
// EmployeeSubmitReport will be created later

const Stack = createNativeStackNavigator();

const EmployeeStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="EmployeeTabs"
                component={EmployeeTabNavigator}
            />
            <Stack.Screen
                name="EmployeeCampaignDetails"
                component={EmployeeCampaignDetailsScreen}
            />
            {/* Add more employee screens here as needed */}
            <Stack.Screen
                name="EmployeeSubmitReport"
                component={EmployeeSubmitReportScreen}
            />
            <Stack.Screen
                name="UpdateEmployeeProfile"
                component={UpdateEmployeeProfileScreen}
            />
        </Stack.Navigator>
    );
};

export default EmployeeStackNavigator;
