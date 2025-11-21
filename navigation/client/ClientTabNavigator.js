import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClientHomeScreen from "../../screens/client/ClientHomeScreen";
import ClientPassbookScreen from "../../screens/client/ClientPassbookScreen";
import ClientReportScreen from "../../screens/client/ClientReportScreen";


const Tab = createBottomTabNavigator();

const ClientTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#E4002B",
                tabBarInactiveTintColor: "#8E8E93",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#E5E5EA",
                    height: Platform.OS === "ios" ? 85 : 60 + insets.bottom,
                    paddingBottom:
                        Platform.OS === "ios" ? 25 : insets.bottom + 8,
                    paddingTop: 8,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: Platform.OS === "ios" ? 0 : 4,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "ClientHome") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "ClientReport") {
                        iconName = focused
                            ? "document-text"
                            : "document-text-outline";
                    } else if (route.name === "ClientPassbook") {
                        iconName = focused ? "wallet" : "wallet-outline";

                    }

                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="ClientHome"
                component={ClientHomeScreen}
                options={{ title: "Home" }}
            />
            <Tab.Screen
                name="ClientReport"
                component={ClientReportScreen}
                options={{ title: "Report" }}
            />
            <Tab.Screen
                name="ClientPassbook"
                component={ClientPassbookScreen}
                options={{ title: "Passbook" }}
            />
        </Tab.Navigator>
    );
};

export default ClientTabNavigator;
