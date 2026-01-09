import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
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
import { API_BASE_URL } from "../../url/base";

// TODO: One line description to be added from the backend.

const EmployeeDashboardScreen = ({ navigation }) => {
    const { userProfile } = useAuth();

    const [employeeName, setEmployeeName] = useState("");
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const SUPPORT_NUMBER = "1800123456";

    // Fetch campaigns when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchCampaigns();
        }, [])
    );

    const fetchCampaigns = async () => {
        try {
            setLoading(true);

            // Get employee name from context or AsyncStorage
            if (userProfile?.name) {
                setEmployeeName(userProfile.name);
            }

            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            console.log("📤 Fetching campaigns...");

            const response = await fetch(
                `${API_BASE_URL}/employee/employee/campaigns`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            console.log("📥 Campaigns response:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch campaigns");
            }

            // Set employee name from response if available
            if (data.employee?.name) {
                setEmployeeName(data.employee.name);
            }

            // Transform campaigns data to match UI structure
            const transformedCampaigns = data.campaigns.map((campaign) => {
                // Find this employee's assignment in the campaign
                const assignment = campaign.assignedEmployees?.find(
                    (emp) => emp.employeeId._id === data.employee.id
                );

                return {
                    id: campaign._id,
                    title: campaign.name,
                    description: campaign.description,
                    startDate: new Date(
                        campaign.campaignStartDate
                    ).toLocaleDateString("en-GB"),
                    endDate: new Date(
                        campaign.campaignEndDate
                    ).toLocaleDateString("en-GB"),
                    image:
                        campaign.campaignImage ||
                        "https://via.placeholder.com/300x150",
                    status: assignment?.status || null, // 'accepted', 'rejected', or null
                    // Get first assigned retailer for display
                    retailerName:
                        campaign.assignedRetailers?.[0]?.retailerId?.name ||
                        "N/A",
                    location: campaign.location || "N/A",
                    // Store full campaign data for details screen
                    fullData: campaign,
                };
            });

            setCampaigns(transformedCampaigns);
            console.log("✅ Campaigns loaded successfully");
        } catch (error) {
            console.error("❌ Error fetching campaigns:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to load campaigns. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCampaigns();
    };

    const makePhoneCall = () => {
        let phoneNumber = "";
        if (Platform.OS === "android") {
            phoneNumber = `tel:${SUPPORT_NUMBER}`;
        } else {
            phoneNumber = `telprompt:${SUPPORT_NUMBER}`;
        }

        Linking.canOpenURL(phoneNumber)
            .then((supported) => {
                if (!supported) {
                    Alert.alert("Error", "Phone number is not available");
                } else {
                    return Linking.openURL(phoneNumber);
                }
            })
            .catch((err) => console.error("Error opening phone:", err));
    };

    const handleNotifications = () => {
        Alert.alert("Notifications", "You have no new notifications");
    };

    const handleAccept = async (campaignId) => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            // TODO: Add your backend API call here to update campaign status
            // const response = await fetch(`${API_BASE_URL}/employee/campaign/${campaignId}/accept`, {
            //     method: "POST",
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         "Content-Type": "application/json",
            //     },
            // });

            // Update local state optimistically
            setCampaigns((prevCampaigns) =>
                prevCampaigns.map((campaign) =>
                    campaign.id === campaignId
                        ? { ...campaign, status: "accepted" }
                        : campaign
                )
            );

            Alert.alert("Success", "Campaign accepted successfully!");
        } catch (error) {
            console.error("Error accepting campaign:", error);
            Alert.alert(
                "Error",
                "Failed to accept campaign. Please try again."
            );
        }
    };

    const handleReject = async (campaignId) => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            // TODO: Add your backend API call here to update campaign status
            // const response = await fetch(`${API_BASE_URL}/employee/campaign/${campaignId}/reject`, {
            //     method: "POST",
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         "Content-Type": "application/json",
            //     },
            // });

            // Update local state optimistically
            setCampaigns((prevCampaigns) =>
                prevCampaigns.map((campaign) =>
                    campaign.id === campaignId
                        ? { ...campaign, status: "rejected" }
                        : campaign
                )
            );
        } catch (error) {
            console.error("Error rejecting campaign:", error);
            Alert.alert(
                "Error",
                "Failed to reject campaign. Please try again."
            );
        }
    };

    const handleViewDetails = (campaign) => {
        console.log("📋 Navigating with campaign:", campaign);

        // Navigate with the full raw campaign data
        navigation.navigate("EmployeeCampaignDetails", {
            campaign: campaign.fullData || campaign,
        });
    };

    if (loading) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <Header showBackButton={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading campaigns...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
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
                {/* Logo Section */}
                <Header showBackButton={false} />

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Hello, {employeeName || "Employee"}!
                    </Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={makePhoneCall}
                        >
                            <Ionicons name="call" size={24} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleNotifications}
                        >
                            <Ionicons
                                name="notifications"
                                size={24}
                                color="#007AFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Assigned Campaigns Section */}
                <View style={styles.campaignsSection}>
                    <Text style={styles.sectionTitle}>Assigned Campaigns</Text>

                    {campaigns.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="briefcase-outline"
                                size={64}
                                color="#ccc"
                            />
                            <Text style={styles.emptyStateText}>
                                No campaigns assigned yet
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Check back later for new assignments
                            </Text>
                        </View>
                    ) : (
                        campaigns.map((campaign) => (
                            <View key={campaign.id} style={styles.campaignCard}>
                                <Image
                                    source={{ uri: campaign.image }}
                                    style={styles.campaignImage}
                                />

                                <View style={styles.campaignContent}>
                                    <Text style={styles.campaignTitle}>
                                        {campaign.title}
                                    </Text>
                                    <Text
                                        style={styles.campaignDescription}
                                        numberOfLines={2}
                                    >
                                        {campaign.description}
                                    </Text>
                                    <Text style={styles.campaignDates}>
                                        📅 {campaign.startDate} -{" "}
                                        {campaign.endDate}
                                    </Text>

                                    {/* Retailer Info */}
                                    <View style={styles.retailerInfo}>
                                        <Ionicons
                                            name="storefront-outline"
                                            size={16}
                                            color="#666"
                                        />
                                        <Text style={styles.retailerText}>
                                            {campaign.retailerName}
                                        </Text>
                                    </View>
                                    <View style={styles.retailerInfo}>
                                        <Ionicons
                                            name="location-outline"
                                            size={16}
                                            color="#666"
                                        />
                                        <Text style={styles.retailerText}>
                                            {campaign.location}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.viewDetailsButton}
                                        onPress={() =>
                                            handleViewDetails(campaign)
                                        }
                                    >
                                        <Text style={styles.viewDetailsText}>
                                            View Details
                                        </Text>
                                    </TouchableOpacity>

                                    {campaign.status === null && (
                                        <View
                                            style={styles.acceptRejectButtons}
                                        >
                                            <TouchableOpacity
                                                style={styles.acceptButton}
                                                onPress={() =>
                                                    handleAccept(campaign.id)
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.acceptButtonText
                                                    }
                                                >
                                                    Accept
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.rejectButton}
                                                onPress={() =>
                                                    handleReject(campaign.id)
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.rejectButtonText
                                                    }
                                                >
                                                    Reject
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {/* Accepted Status */}
                                {campaign.status === "accepted" && (
                                    <View style={styles.acceptedStatus}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#28a745"
                                        />
                                        <Text style={styles.acceptedText}>
                                            ✓ Campaign Accepted
                                        </Text>
                                    </View>
                                )}

                                {/* Rejected Status */}
                                {campaign.status === "rejected" && (
                                    <View style={styles.rejectedStatus}>
                                        <Ionicons
                                            name="close-circle"
                                            size={20}
                                            color="#dc3545"
                                        />
                                        <Text style={styles.rejectedText}>
                                            ✗ Campaign Rejected
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
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
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: "#666",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "#fff",
        marginBottom: 15,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    headerIcons: {
        flexDirection: "row",
        gap: 15,
    },
    iconButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: "#E8F4FF",
        justifyContent: "center",
        alignItems: "center",
    },
    campaignsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        backgroundColor: "#fff",
        borderRadius: 15,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 20,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#999",
        marginTop: 8,
    },
    campaignCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: "hidden",
    },
    campaignImage: {
        width: "100%",
        height: 150,
        backgroundColor: "#f0f0f0",
    },
    campaignContent: {
        padding: 15,
    },
    campaignTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    campaignDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 10,
    },
    campaignDates: {
        fontSize: 13,
        color: "#007AFF",
        fontWeight: "600",
        marginBottom: 10,
    },
    retailerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        gap: 5,
    },
    retailerText: {
        fontSize: 13,
        color: "#666",
    },
    actionButtons: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    viewDetailsButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    viewDetailsText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    acceptRejectButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: "#28a745",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    acceptButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#dc3545",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    rejectButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    acceptedStatus: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d4edda",
        padding: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
    },
    acceptedText: {
        color: "#28a745",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 8,
    },
    rejectedStatus: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8d7da",
        padding: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 8,
    },
    rejectedText: {
        color: "#dc3545",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 8,
    },
});

export default EmployeeDashboardScreen;
