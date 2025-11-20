import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Screens
import PassbookScreen from "../../screens/retailer/PassbookScreen";
import ProfileScreen from "../../screens/retailer/ProfileScreen";
import RetailerDashboardScreen from "../../screens/retailer/RetailerDashboardScreen";

const Tab = createBottomTabNavigator();

const RetailerTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#007AFF",
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

                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Passbook") {
                        iconName = focused ? "wallet" : "wallet-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={RetailerDashboardScreen}
                options={{ title: "Home" }}
            />
            <Tab.Screen
                name="Passbook"
                component={PassbookScreen}
                options={{ title: "Passbook" }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Profile" }}
            />
        </Tab.Navigator>
    );
};

export default RetailerTabNavigator;
