import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const LoginScreen = () => {
    const navigation = useNavigation();
    // Dropdown state
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(null);
    const [items, setItems] = useState([
        { label: "Retailer", value: "retailer" },
        { label: "Employee", value: "employee" },
        { label: "Client", value: "client" },
    ]);

    // Form state
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        // Validation
        if (!role) {
            Alert.alert("Error", "Please select your role");
            return;
        }
        if (!emailOrPhone) {
            Alert.alert("Error", "Please enter your email or phone number");
            return;
        }
        if (!password) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        setIsLoading(true);

        try {
            // Determine if input is email or phone
            const isEmail = emailOrPhone.includes("@");

            // Your backend requires BOTH contactNo AND email
            // So we need to handle this based on what user enters
            const requestBody = {};

            if (isEmail) {
                // If user entered email, we need to also send a placeholder phone
                // OR modify your backend to accept either field
                requestBody.email = emailOrPhone;
                requestBody.contactNo = password; // You'll need to handle this on backend
            } else {
                // If user entered phone number
                requestBody.email = emailOrPhone;
                requestBody.contactNo = password; // You'll need to handle this on backend
            }

            console.log("📤 Sending login request:", requestBody);

            // API call to login endpoint
            const response = await fetch(
                "https://supreme-419p.onrender.com/api/retailer/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Login Error:", data);
                Alert.alert(
                    "Login Failed",
                    data.message || "Invalid credentials"
                );
                setIsLoading(false);
                return;
            }

            // Login successful
            console.log("✅ Login successful:", data);

            // Save token
            // await AsyncStorage.setItem('userToken', data.token);
            // await AsyncStorage.setItem('userRole', role);

            // Navigate based on role
            if (role === "retailer") {
                navigation.navigate("CreateRetailerProfile");
            } else if (role === "employee") {
                Alert.alert(
                    "Coming Soon",
                    "Employee profile creation is under development"
                );
            } else if (role === "client") {
                Alert.alert(
                    "Coming Soon",
                    "Client profile creation is under development"
                );
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            Alert.alert(
                "Error",
                "Network error. Please check your internet connection."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            "Forgot Password",
            "Password reset functionality will be added."
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    {/* Replace this View with your actual logo */}
                    {/* <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          /> */}
                    <View style={styles.logoPlaceholder}>
                        <Image
                            source={require("../../assets/cpLogo.jpg")}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>
                        Please login to continue
                    </Text>

                    {/* Role Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Select Role</Text>
                        <DropDownPicker
                            open={open}
                            value={role}
                            items={items}
                            setOpen={setOpen}
                            setValue={setRole}
                            setItems={setItems}
                            placeholder="Select your role"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            placeholderStyle={styles.dropdownPlaceholder}
                            textStyle={styles.dropdownText}
                            zIndex={3000}
                            zIndexInverse={1000}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>

                    {/* Email/Phone Input */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Email/Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email or phone number"
                            placeholderTextColor="#999"
                            value={emailOrPhone}
                            onChangeText={setEmailOrPhone}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                <Text style={styles.eyeText}>
                                    {showPassword ? "👁️" : "X"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={handleForgotPassword}
                        disabled={isLoading}
                    >
                        <Text style={styles.forgotPasswordText}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            isLoading && styles.loginButtonDisabled,
                        ]}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 50,
    },
    logo: {
        width: 100,
        height: 100,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: "#fff",
        // borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    logoText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        letterSpacing: 1,
    },
    logoSubtext: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
        letterSpacing: 2,
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    dropdown: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 12,
        minHeight: 50,
    },
    dropdownContainer: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 12,
    },
    dropdownPlaceholder: {
        color: "#999",
        fontSize: 15,
    },
    dropdownText: {
        fontSize: 15,
        color: "#333",
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: "#333",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        padding: 15,
        fontSize: 15,
        color: "#333",
    },
    eyeIcon: {
        padding: 15,
    },
    eyeText: {
        fontSize: 18,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "#E53935",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonDisabled: {
        backgroundColor: "#A0C9F5",
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
});

export default LoginScreen;
