import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const LoginScreen = () => {
    const navigation = useNavigation();
    const { login } = useAuth();

    // Dropdown state
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(null);
    const [items, setItems] = useState([
        { label: "Retailer", value: "retailer" },
        { label: "Employee", value: "employee" },
        { label: "Client", value: "client" },
    ]);

    // Form state
    const [email, setEmail] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Show different fields based on role
    const getRequiredFields = () => {
        if (role === "retailer") {
            return {
                needsEmail: true,
                needsContactNo: true,
                needsPassword: false,
            };
        } else if (role === "employee" || role === "client") {
            return {
                needsEmail: true,
                needsContactNo: false,
                needsPassword: true,
            };
        }
        return {
            needsEmail: false,
            needsContactNo: false,
            needsPassword: false,
        };
    };

    const { needsEmail, needsContactNo, needsPassword } = getRequiredFields();

    const handleLogin = async () => {
        // Validation
        if (!role) {
            Alert.alert("Error", "Please select your role");
            return;
        }
        if (needsEmail && !email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }
        if (needsContactNo && !contactNo) {
            Alert.alert("Error", "Please enter your contact number");
            return;
        }
        if (needsPassword && !password) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        setIsLoading(true);

        try {
            let endpoint = "";
            let requestBody = {};

            // Build endpoint and payload based on role
            if (role === "retailer") {
                endpoint = `${API_BASE_URL}/retailer/login`;
                requestBody = {
                    email: email.trim(),
                    contactNo: contactNo.trim(),
                };
            } else if (role === "employee") {
                endpoint = `${API_BASE_URL}/employee/employee/login`;
                requestBody = {
                    email: email.trim(),
                    password: password,
                };
            } else if (role === "client") {
                endpoint = `${API_BASE_URL}/client/admin/login`;
                requestBody = {
                    email: email.trim(),
                    password: password,
                };
            }

            console.log("📤 Sending login request to:", endpoint);
            console.log("📤 Payload:", requestBody);

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Login Error:", data);
                Alert.alert(
                    "Login Failed",
                    data.message || "Invalid credentials. Please try again."
                );
                setIsLoading(false);
                return;
            }

            // Login successful
            console.log("✅ Login successful:", data);

            // Save userData
            await AsyncStorage.setItem("userData", JSON.stringify(data));
            await AsyncStorage.setItem("userToken", data.token || "");
            await AsyncStorage.setItem("userEmail", email);

            let userId;
            let backendRole = role; // This is "client_admin", "retailer_admin", "employee_admin"

            // ✅ Extract actual role from response data
            if (
                role === "client_admin" ||
                role === "client" ||
                role === "admin"
            ) {
                userId = data.admin?.id || data.admin?._id;
                // Get the actual role from admin data (national, regional, etc)
                backendRole = data.admin?.role || "national";
                console.log("🔍 Client admin role from backend:", backendRole);
            } else if (role === "retailer") {
                userId = data.retailer?.id || data.retailer?._id;
                backendRole = "retailer";
            } else if (role === "employee") {
                userId = data.employee?.id || data.employee?._id;
                backendRole = "employee";
            }

            // Save backend role temporarily
            await AsyncStorage.setItem("userRole", backendRole);

            // ✅ AuthContext will map the role
            await login(data.token, backendRole, userId);
        } catch (error) {
            console.error("❌ Network error:", error);
            Alert.alert(
                "Network Error",
                "Unable to connect to server. Please check your internet connection and try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert(
            "Forgot Password",
            "Please contact your administrator to reset your password.",
            [{ text: "OK" }]
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
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Please login to continue
                    </Text>

                    {/* Role Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Select Role *</Text>
                        <DropDownPicker
                            open={open}
                            value={role}
                            items={items}
                            setOpen={setOpen}
                            setValue={setRole}
                            setItems={setItems}
                            placeholder="Choose your role"
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
                            disabled={isLoading}
                        />
                    </View>

                    {/* Email Input - Show for all roles */}
                    {needsEmail && (
                        <View style={[styles.inputGroup, { zIndex: 1 }]}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>
                    )}

                    {/* Contact Number Input - Only for Retailer */}
                    {needsContactNo && (
                        <View style={[styles.inputGroup, { zIndex: 1 }]}>
                            <Text style={styles.label}>Contact Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your contact number"
                                placeholderTextColor="#999"
                                value={contactNo}
                                onChangeText={(text) =>
                                    setContactNo(text.replace(/[^0-9]/g, ""))
                                }
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!isLoading}
                            />
                        </View>
                    )}

                    {/* Password Input - Only for Employee & Client */}
                    {needsPassword && (
                        <View style={[styles.inputGroup, { zIndex: 1 }]}>
                            <Text style={styles.label}>Password *</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter your password"
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
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    disabled={isLoading}
                                >
                                    <Text style={styles.eyeText}>
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Forgot Password - Only show for password-based login */}
                    {needsPassword && (
                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={handleForgotPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    )}

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
        marginBottom: 40,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        backgroundColor: "#fff",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
        fontSize: 20,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#E53935",
        fontSize: 14,
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "#E53935",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#E53935",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonDisabled: {
        backgroundColor: "#FFCDD2",
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
});

export default LoginScreen;
