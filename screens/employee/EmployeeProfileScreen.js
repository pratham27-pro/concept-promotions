import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header";
import { useAuth } from "../../context/AuthContext";
import * as RootNavigation from "../../navigation/RootNavigation";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const EmployeeProfileScreen = () => {
    const { logout } = useAuth();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [personPhotoUri, setPersonPhotoUri] = useState(null);

    // Fetch employee profile on mount and when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchEmployeeProfile();
        }, [])
    );

    const fetchEmployeeProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                Alert.alert("Error", "Please login again");
                RootNavigation.navigate("Login");
                return;
            }

            // Fetch profile data
            const response = await fetch(`${API_BASE_URL}/employee/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const responseData = await response.json();

            if (response.ok && responseData) {
                const data = responseData.employee || responseData;

                // Calculate profile completion
                const completion = calculateProfileCompletion(data);
                setEmployee({ ...data, profileCompletion: completion });

                // Fetch person photo if it exists
                await fetchPersonPhoto(token);
            } else {
                throw new Error(
                    responseData.message || "Failed to fetch profile"
                );
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPersonPhoto = async (token) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/employee/employee/document/personPhoto`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPersonPhotoUri(reader.result);
                };
                reader.readAsDataURL(blob);
            }
        } catch (error) {
            console.log("No person photo found");
        }
    };

    const calculateProfileCompletion = (data) => {
        let completedFields = 0;
        const totalFields = data.employeeType === "Permanent" ? 20 : 12;

        // Basic fields (always required)
        if (data.name) completedFields++;
        if (data.email) completedFields++;
        if (data.phone) completedFields++;
        if (data.gender) completedFields++;
        if (data.dob) completedFields++;
        if (data.aadhaarNumber) completedFields++;
        if (data.correspondenceAddress?.addressLine1) completedFields++;
        if (data.permanentAddress?.addressLine1) completedFields++;
        if (data.bankDetails?.accountNumber) completedFields++;
        if (data.bankDetails?.ifsc) completedFields++;

        // Permanent employee specific fields
        if (data.employeeType === "Permanent") {
            if (data.panNumber) completedFields++;
            if (data.highestQualification) completedFields++;
            if (data.maritalStatus) completedFields++;
            if (data.fathersName) completedFields++;
            if (data.motherName) completedFields++;
            if (data.uanNumber) completedFields++;
            if (data.pfNumber) completedFields++;
            if (data.esiNumber) completedFields++;
            if (data.experiences?.length > 0) completedFields++;
            if (personPhotoUri) completedFields++;
        } else {
            // Contractual specific
            if (data.contractLength) completedFields++;
            if (personPhotoUri) completedFields++;
        }

        return Math.round((completedFields / totalFields) * 100);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEmployeeProfile();
        setRefreshing(false);
    };

    const handleUpdateProfile = () => {
        RootNavigation.navigate("CompleteEmployeeProfile");
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        RootNavigation.navigate("Login");
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatAddress = (address) => {
        if (!address || !address.addressLine1) return "N/A";

        const parts = [
            address.addressLine1,
            address.addressLine2,
            address.city,
            address.state,
        ].filter(Boolean);

        if (address.pincode) {
            return `${parts.join(", ")} - ${address.pincode}`;
        }
        return parts.join(", ");
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    if (!employee) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <StatusBar style="dark" />
                <Ionicons name="alert-circle-outline" size={60} color="#999" />
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchEmployeeProfile}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#007AFF"]}
                        tintColor="#007AFF"
                    />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Profile Photo */}
                    <View style={styles.photoContainer}>
                        {personPhotoUri ? (
                            <Image
                                source={{ uri: personPhotoUri }}
                                style={styles.profilePhoto}
                            />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Ionicons
                                    name="person"
                                    size={60}
                                    color="#999"
                                />
                            </View>
                        )}
                    </View>

                    {/* Employee Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.employeeName}>{employee.name}</Text>
                        {employee.position && (
                            <Text style={styles.designation}>
                                {employee.position}
                            </Text>
                        )}
                        <View style={styles.employeeTypeBadge}>
                            <Text style={styles.employeeTypeText}>
                                {employee.employeeType || "Employee"}
                            </Text>
                        </View>
                        {employee.employeeId && (
                            <Text style={styles.employeeId}>
                                ID: {employee.employeeId}
                            </Text>
                        )}

                        <View style={styles.contactInfo}>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="mail-outline"
                                    size={16}
                                    color="#666"
                                />
                                <Text style={styles.infoText}>
                                    {employee.email}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="call-outline"
                                    size={16}
                                    color="#666"
                                />
                                <Text style={styles.infoText}>
                                    {employee.phone}
                                </Text>
                            </View>
                            {employee.createdAt && (
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.infoText}>
                                        Joined: {formatDate(employee.createdAt)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Profile Completion */}
                <View style={styles.completionCard}>
                    <View style={styles.completionHeader}>
                        <Text style={styles.completionTitle}>
                            Profile Completion
                        </Text>
                        <Text style={styles.completionPercentage}>
                            {employee.profileCompletion || 0}%
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <LinearGradient
                                colors={["#007AFF", "#0051D5"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${
                                            employee.profileCompletion || 0
                                        }%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    {(employee.profileCompletion || 0) < 100 && (
                        <Text style={styles.completionHint}>
                            Complete your profile to unlock more features!
                        </Text>
                    )}
                </View>

                {/* Personal Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Personal Details</Text>

                    {employee.dob && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                Date of Birth
                            </Text>
                            <Text style={styles.detailValue}>
                                {formatDate(employee.dob)}
                            </Text>
                        </View>
                    )}

                    {employee.gender && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Gender</Text>
                            <Text style={styles.detailValue}>
                                {employee.gender}
                            </Text>
                        </View>
                    )}

                    {employee.correspondenceAddress?.addressLine1 && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Address</Text>
                            <Text style={styles.detailValue}>
                                {formatAddress(employee.correspondenceAddress)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Employee Type</Text>
                        <Text style={styles.detailValue}>
                            {employee.employeeType || "N/A"}
                        </Text>
                    </View>

                    {employee.employeeType === "Permanent" &&
                        employee.highestQualification && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Qualification
                                </Text>
                                <Text style={styles.detailValue}>
                                    {employee.highestQualification}
                                </Text>
                            </View>
                        )}

                    {employee.employeeType === "Contractual" &&
                        employee.contractLength && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Contract Length
                                </Text>
                                <Text style={styles.detailValue}>
                                    {employee.contractLength}
                                </Text>
                            </View>
                        )}
                </View>

                {/* Profile Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons
                            name="briefcase-outline"
                            size={28}
                            color="#007AFF"
                        />
                        <Text style={styles.statValue}>
                            {employee.assignedCampaigns?.length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Campaigns</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={28}
                            color="#28a745"
                        />
                        <Text style={styles.statValue}>
                            {Math.floor(
                                (employee.assignedCampaigns?.length || 0) * 0.8
                            )}
                        </Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="time-outline"
                            size={28}
                            color="#FFA500"
                        />
                        <Text style={styles.statValue}>
                            {Math.ceil(
                                (employee.assignedCampaigns?.length || 0) * 0.2
                            )}
                        </Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                {/* Update Profile Button */}
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#007AFF", "#0051D5"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.updateButtonGradient}
                    >
                        <Ionicons
                            name="create-outline"
                            size={22}
                            color="#fff"
                        />
                        <Text style={styles.updateButtonText}>
                            Update Profile
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Options Container */}
                <View style={styles.optionsContainer}>
                    {/* View Documents */}
                    {employee.employeeType === "Permanent" && (
                        <TouchableOpacity
                            style={styles.optionItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <Ionicons
                                    name="document-text-outline"
                                    size={24}
                                    color="#007AFF"
                                />
                                <Text style={styles.optionText}>
                                    View Documents
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    )}

                    {/* Work Experience */}
                    {employee.employeeType === "Permanent" &&
                        employee.experiences?.length > 0 && (
                            <TouchableOpacity
                                style={styles.optionItem}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionLeft}>
                                    <Ionicons
                                        name="briefcase-outline"
                                        size={24}
                                        color="#007AFF"
                                    />
                                    <Text style={styles.optionText}>
                                        Work Experience (
                                        {employee.experiences.length})
                                    </Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        )}

                    {/* Settings */}
                    <TouchableOpacity
                        style={styles.optionItem}
                        activeOpacity={0.7}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="settings-outline"
                                size={24}
                                color="#007AFF"
                            />
                            <Text style={styles.optionText}>Settings</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#999"
                        />
                    </TouchableOpacity>

                    {/* Logout */}
                    <TouchableOpacity
                        style={[styles.optionItem, styles.logoutOption]}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="log-out-outline"
                                size={24}
                                color="#dc3545"
                            />
                            <Text
                                style={[styles.optionText, styles.logoutText]}
                            >
                                Logout
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#dc3545"
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        paddingHorizontal: 20,
    },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    photoContainer: {
        alignSelf: "center",
        marginBottom: 20,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#007AFF",
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#007AFF",
    },
    infoContainer: {
        alignItems: "center",
    },
    employeeName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    designation: {
        fontSize: 16,
        color: "#666",
        marginBottom: 10,
    },
    employeeTypeBadge: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginBottom: 5,
    },
    employeeTypeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    employeeId: {
        fontSize: 13,
        color: "#999",
        marginBottom: 15,
    },
    contactInfo: {
        width: "100%",
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 5,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    completionCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    completionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    completionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    completionPercentage: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
    },
    progressBarContainer: {
        marginBottom: 10,
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 10,
    },
    completionHint: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
        marginTop: 5,
    },
    detailsCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    detailRow: {
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 13,
        color: "#666",
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    updateButton: {
        marginTop: 20,
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    updateButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    updateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    optionsContainer: {
        marginTop: 20,
        backgroundColor: "#fff",
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    logoutOption: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: "#dc3545",
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: "#666",
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: "#007AFF",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EmployeeProfileScreen;
