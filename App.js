import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import LoginScreen from "./screens/auth/LoginScreen";
import CreateRetailerProfileScreen from "./screens/retailer/CreateRetailerProfileScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
                initialRouteName="Login"
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen
                    name="CreateRetailerProfile"
                    component={CreateRetailerProfileScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
