import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { API_BASE_URL } from "../../url/base";

const ForgotPasswordScreen = ({ route }) => {
    const navigation = useNavigation();

    const preSelectedRole = route?.params?.preSelectedRole || null;

    // Step management
    const [step, setStep] = useState(1);

    // Dropdown state
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(preSelectedRole);
    const [items, setItems] = useState([
        { label: "Retailer", value: "retailer" },
        { label: "Employee", value: "employee" },
        { label: "Client", value: "client" },
    ]);

    // Form state
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Loading & Timer
    const [isLoading, setIsLoading] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [canResend, setCanResend] = useState(true); // ✅ Changed to true initially

    // OTP Timer countdown
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpTimer]);

    // Step 1: Verify phone number
    const handlePhoneSubmit = async () => {
        if (!role) {
            Alert.alert("Error", "Please select your role");
            return;
        }

        if (!phone || phone.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/password-reset/initiate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(
                    "Error",
                    data.message || "Phone verification failed",
                );
                setIsLoading(false);
                return;
            }

            // ✅ REMOVED role mismatch check - don't expose user data
            // Just proceed to step 2 regardless of backend userType

            Alert.alert(
                "Success",
                "Phone number verified! Please request OTP to continue.",
            );
            setStep(2);
            setCanResend(true); // ✅ Ensure Send OTP button is enabled
        } catch (error) {
            console.error("Phone verification error:", error);
            Alert.alert(
                "Network Error",
                "Unable to connect to server. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Send OTP
    const handleSendOTP = async () => {
        setIsLoading(true);
        setCanResend(false);

        try {
            const response = await fetch(`${API_BASE_URL}/otp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, type: "verification" }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.message || "Failed to send OTP");
                setIsLoading(false);
                setCanResend(true);
                return;
            }

            Alert.alert("Success", "OTP sent to your phone number!");
            setOtpTimer(60); // 60 seconds cooldown

            // For development - show OTP
            if (__DEV__ && data.otp) {
                console.log("🔐 OTP:", data.otp);
                Alert.alert("Development Mode", `OTP: ${data.otp}`);
            }
        } catch (error) {
            console.error("OTP send error:", error);
            Alert.alert(
                "Network Error",
                "Failed to send OTP. Please try again.",
            );
            setCanResend(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit OTP");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/password-reset/reset`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, otp, newPassword }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.message || "Password reset failed");
                setIsLoading(false);
                return;
            }

            Alert.alert(
                "Success",
                "Password reset successfully! Please login with your new password.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Login"),
                    },
                ],
            );
        } catch (error) {
            console.error("Password reset error:", error);
            Alert.alert(
                "Network Error",
                "Failed to reset password. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
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
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        {step === 1
                            ? "Enter your registered phone number"
                            : "Enter OTP and new password"}
                    </Text>

                    {/* Step Indicator */}
                    <View style={styles.stepIndicator}>
                        <View
                            style={[
                                styles.stepDot,
                                step >= 1 && styles.stepDotActive,
                            ]}
                        />
                        <View style={styles.stepLine} />
                        <View
                            style={[
                                styles.stepDot,
                                step >= 2 && styles.stepDotActive,
                            ]}
                        />
                    </View>

                    {/* Step 1: Phone Number */}
                    {step === 1 && (
                        <>
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
                                    dropDownContainerStyle={
                                        styles.dropdownContainer
                                    }
                                    placeholderStyle={
                                        styles.dropdownPlaceholder
                                    }
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

                            {/* Phone Input */}
                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>Phone Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="10-digit phone number"
                                    placeholderTextColor="#999"
                                    value={phone}
                                    onChangeText={(text) =>
                                        setPhone(text.replace(/[^0-9]/g, ""))
                                    }
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Continue Button */}
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    isLoading && styles.primaryButtonDisabled,
                                ]}
                                onPress={handlePhoneSubmit}
                                activeOpacity={0.8}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator
                                        color="#fff"
                                        size="small"
                                    />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        Continue
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Step 2: OTP & New Password */}
                    {step === 2 && (
                        <>
                            {/* Send OTP Button */}
                            <TouchableOpacity
                                style={[
                                    styles.secondaryButton,
                                    (otpTimer > 0 || isLoading) &&
                                        styles.secondaryButtonDisabled,
                                ]}
                                onPress={handleSendOTP}
                                activeOpacity={0.8}
                                disabled={otpTimer > 0 || isLoading}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    {otpTimer > 0
                                        ? `Resend OTP in ${otpTimer}s`
                                        : "Send OTP"}
                                </Text>
                            </TouchableOpacity>

                            {/* OTP Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>OTP *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="6-digit OTP"
                                    placeholderTextColor="#999"
                                    value={otp}
                                    onChangeText={(text) =>
                                        setOtp(text.replace(/[^0-9]/g, ""))
                                    }
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    editable={!isLoading}
                                />
                            </View>

                            {/* New Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password *</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter new password"
                                        placeholderTextColor="#999"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
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

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Confirm Password *
                                </Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Confirm new password"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.eyeText}>
                                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Reset Password Button */}
                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    isLoading && styles.primaryButtonDisabled,
                                ]}
                                onPress={handleResetPassword}
                                activeOpacity={0.8}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator
                                        color="#fff"
                                        size="small"
                                    />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        Reset Password
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Change Phone Number */}
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => {
                                    setStep(1);
                                    setOtp("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setOtpTimer(0);
                                    setCanResend(true);
                                }}
                                disabled={isLoading}
                            >
                                <Text style={styles.backButtonText}>
                                    Change Phone Number
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Back to Login */}
                    <TouchableOpacity
                        style={styles.backToLogin}
                        onPress={() => navigation.navigate("Login")}
                        disabled={isLoading}
                    >
                        <Text style={styles.backToLoginText}>
                            Back to Login
                        </Text>
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
        marginBottom: 20,
        textAlign: "center",
    },
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
    },
    stepDotActive: {
        backgroundColor: "#E53935",
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 8,
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
    primaryButton: {
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
        marginBottom: 12,
    },
    primaryButtonDisabled: {
        backgroundColor: "#FFCDD2",
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    secondaryButton: {
        backgroundColor: "#2196F3",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    secondaryButtonDisabled: {
        backgroundColor: "#BBDEFB",
    },
    secondaryButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    backButton: {
        alignItems: "center",
        marginTop: 12,
        marginBottom: 8,
    },
    backButtonText: {
        color: "#2196F3",
        fontSize: 14,
        fontWeight: "600",
    },
    backToLogin: {
        alignItems: "center",
        marginTop: 8,
    },
    backToLoginText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default ForgotPasswordScreen;
