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

const ProfileScreen = () => {
    // Mock data - will be fetched from DB
    const [retailer, setRetailer] = useState({
        name: "Hari Kumar",
        email: "hari@gmail.com",
        contactNo: "9310040629",
        tier: "gold", // platinum, gold, silver, bronze
        photo: null,
        profileCompletion: 75, // Percentage
        shopName: "Hari General Store",
        uniqueId: "NRDLDEL5292",
    });

    const getTierColor = (tier) => {
        switch (tier) {
            case "platinum":
                return ["#E5E4E2", "#BCC6CC"];
            case "gold":
                return ["#FFD700", "#FFA500"];
            case "silver":
                return ["#C0C0C0", "#808080"];
            case "bronze":
                return ["#CD7F32", "#8B4513"];
            default:
                return ["#E0E0E0", "#9E9E9E"];
        }
    };

    const getTierIcon = (tier) => {
        switch (tier) {
            case "platinum":
                return "diamond";
            case "gold":
                return "trophy";
            case "silver":
                return "medal";
            case "bronze":
                return "ribbon";
            default:
                return "star";
        }
    };

    const handleUpdateProfile = () => {
        RootNavigation.navigate("UpdateProfile", { retailer });
    };

    // const tabBarHeight = useBottomTabBarHeight();

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
                        {retailer.photo ? (
                            <Image
                                source={{ uri: retailer.photo }}
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

                        {/* Tier Badge */}
                        <LinearGradient
                            colors={getTierColor(retailer.tier)}
                            style={styles.tierBadge}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons
                                name={getTierIcon(retailer.tier)}
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.tierText}>
                                {retailer.tier.toUpperCase()}
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Retailer Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.retailerName}>{retailer.name}</Text>
                        <Text style={styles.shopName}>{retailer.shopName}</Text>
                        <Text style={styles.uniqueId}>
                            ID: {retailer.uniqueId}
                        </Text>

                        <View style={styles.contactInfo}>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="mail-outline"
                                    size={16}
                                    color="#666"
                                />
                                <Text style={styles.infoText}>
                                    {retailer.email}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="call-outline"
                                    size={16}
                                    color="#666"
                                />
                                <Text style={styles.infoText}>
                                    {retailer.contactNo}
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
                            {retailer.profileCompletion}%
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <LinearGradient
                                colors={["#4CAF50", "#8BC34A"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressBarFill,
                                    { width: `${retailer.profileCompletion}%` },
                                ]}
                            />
                        </View>
                    </View>

                    {retailer.profileCompletion < 100 && (
                        <Text style={styles.completionHint}>
                            Complete your profile to unlock more features!
                        </Text>
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
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Campaigns</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={28}
                            color="#28a745"
                        />
                        <Text style={styles.statValue}>8</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="time-outline"
                            size={28}
                            color="#FFA500"
                        />
                        <Text style={styles.statValue}>4</Text>
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

                {/* Additional Options */}
                {/* <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="document-text-outline"
                                size={24}
                                color="#007AFF"
                            />
                            <Text style={styles.optionText}>My Documents</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#999"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="card-outline"
                                size={24}
                                color="#007AFF"
                            />
                            <Text style={styles.optionText}>Bank Details</Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#999"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
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

                    <TouchableOpacity
                        style={[styles.optionItem, styles.logoutOption]}
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
                </View> */}
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
        paddingBottom: Platform.OS === "ios" ? 100 : 120,
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
        position: "relative",
        marginBottom: 20,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#fff",
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#fff",
    },
    tierBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    tierText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    infoContainer: {
        alignItems: "center",
    },
    retailerName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    shopName: {
        fontSize: 16,
        color: "#666",
        marginBottom: 3,
    },
    uniqueId: {
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
        color: "#4CAF50",
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

export default ProfileScreen;
