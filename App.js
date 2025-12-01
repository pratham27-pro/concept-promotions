// App.js

// ✅ FOR DEVELOPMENT (Comment out for production)
export { default } from "./App.dev";

// ✅ FOR PRODUCTION (Uncomment for production)
// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { AuthProvider } from "./context/AuthContext";
// import AppNavigator from "./navigation/AppNavigator";
//
// export default function App() {
//     return (
//         <SafeAreaProvider>
//             <AuthProvider>
//                 <NavigationContainer>
//                     <AppNavigator />
//                 </NavigationContainer>
//             </AuthProvider>
//         </SafeAreaProvider>
//     );
// }
