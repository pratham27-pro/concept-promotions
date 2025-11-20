import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as RootNavigation from "../../navigation/RootNavigation";
import Header from "../../components/common/Header";

const EmployeeProfileScreen = () => {
    // Mock data - will be fetched from DB
    const [employee, setEmployee] = useState({
        name: "Rajesh Kumar",
        email: "rajesh@gmail.com",
        contactNo: "9876543210",
        photo: null,
        profileCompletion: 85,
        employeeId: "EMP2025001",
        employeeType: "Permanent", // or 'Contractual'
        designation: "Field Executive",
        joiningDate: "01/06/2024",
        dob: "15/03/1995",
        address: "123, MG Road, Delhi - 110001",
    });

    const handleUpdateProfile = () => {
        RootNavigation.navigate("UpdateEmployeeProfile", { employee });
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Profile Photo */}
                    <View style={styles.photoContainer}>
                        {employee.photo ? (
                            <Image
                                source={{ uri: employee.photo }}
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
                        <Text style={styles.designation}>
                            {employee.designation}
                        </Text>
                        <View style={styles.employeeTypeBadge}>
                            <Text style={styles.employeeTypeText}>
                                {employee.employeeType}
                            </Text>
                        </View>
                        <Text style={styles.employeeId}>
                            ID: {employee.employeeId}
                        </Text>

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
                                    {employee.contactNo}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={16}
                                    color="#666"
                                />
                                <Text style={styles.infoText}>
                                    Joined: {employee.joiningDate}
                                </Text>
                            </View>
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
                            {employee.profileCompletion}%
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
                                    { width: `${employee.profileCompletion}%` },
                                ]}
                            />
                        </View>
                    </View>

                    {employee.profileCompletion < 100 && (
                        <Text style={styles.completionHint}>
                            Complete your profile to unlock more features!
                        </Text>
                    )}
                </View>

                {/* Personal Details Card */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Personal Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date of Birth</Text>
                        <Text style={styles.detailValue}>{employee.dob}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>
                            {employee.address}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Employee Type</Text>
                        <Text style={styles.detailValue}>
                            {employee.employeeType}
                        </Text>
                    </View>
                </View>

                {/* Profile Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons
                            name="briefcase-outline"
                            size={28}
                            color="#007AFF"
                        />
                        <Text style={styles.statValue}>15</Text>
                        <Text style={styles.statLabel}>Campaigns</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={28}
                            color="#28a745"
                        />
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="time-outline"
                            size={28}
                            color="#FFA500"
                        />
                        <Text style={styles.statValue}>3</Text>
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        flex: 1,
        alignItems: "center",
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#f0f0f0",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#333",
    },
    logoSubtext: {
        fontSize: 6,
        color: "#666",
        marginTop: 2,
    },
    placeholder: {
        width: 40,
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
});

export default EmployeeProfileScreen;
