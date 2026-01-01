import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateEmployeeProfileScreen from "../../screens/employee/CreateEmployeeProfileScreen";
import EmployeeCampaignDetailsScreen from "../../screens/employee/EmployeeCampaignDetailsScreen";
import EmployeeSubmitReportScreen from "../../screens/employee/EmployeeSubmitReportScreen";
import EmployeeTabNavigator from "./EmployeeTabNavigator";
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
                name="CompleteEmployeeProfile"
                component={CreateEmployeeProfileScreen}
            />
        </Stack.Navigator>
    );
};

export default EmployeeStackNavigator;
