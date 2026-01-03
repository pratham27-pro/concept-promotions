import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
import { API_BASE_URL } from "../../url/base";

const SUPPORT_NUMBER = "1800123456"; // Replace with your actual number

const RetailerDashboardScreen = ({ navigation }) => {
    const tabBarHeight = useBottomTabBarHeight();

    const [retailerName, setRetailerName] = useState("");
    const [retailerId, setRetailerId] = useState("");
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch campaigns on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchCampaigns();
        }, [])
    );

    const fetchCampaigns = async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);

            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/retailer/campaigns`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch campaigns");
            }

            // Set retailer info from response
            if (data.retailer) {
                setRetailerName(data.retailer.name);
                setRetailerId(data.retailer.id);
            }

            // Transform campaigns data
            const transformedCampaigns = data.campaigns.map((campaign) => {
                return {
                    id: campaign._id,
                    name: campaign.name || "Untitled Campaign",
                    title: campaign.name || "Untitled Campaign",
                    description: `${campaign.type || "Campaign"} - ${
                        campaign.client || "Client"
                    }`,
                    startDate: formatDate(campaign.campaignStartDate),
                    endDate: formatDate(campaign.campaignEndDate),
                    image:
                        campaign.image || "https://via.placeholder.com/300x150",
                    status: campaign.retailerStatus?.status || null,
                    assignedEmployees: campaign.assignedEmployees || [],
                    campaignType: campaign.type,
                    client: campaign.client,
                    regions: campaign.regions || [],
                    states: campaign.states || [],
                    rawData: campaign,
                };
            });

            setCampaigns(transformedCampaigns);
            console.log("✅ Campaigns loaded:", transformedCampaigns.length);
        } catch (error) {
            console.error("❌ Error fetching campaigns:", error);
            Alert.alert("Error", "Failed to load campaigns. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCampaigns(true);
    };

    const updateCampaignStatus = async (campaignId, status) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/retailer/campaigns/${campaignId}/status`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update status");
            }

            // Update local state
            setCampaigns((prevCampaigns) =>
                prevCampaigns.map((campaign) =>
                    campaign.id === campaignId
                        ? { ...campaign, status: status }
                        : campaign
                )
            );

            Alert.alert("Success", `Campaign ${status} successfully!`);

            console.log("✅ Campaign status updated:", status);
        } catch (error) {
            console.error("Error updating status:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to update campaign status"
            );
        }
    };

    const handleAccept = (campaignId) => {
        Alert.alert(
            "Accept Campaign",
            "Are you sure you want to accept this campaign?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Accept",
                    onPress: () => updateCampaignStatus(campaignId, "accepted"),
                },
            ]
        );
    };

    const handleReject = (campaignId) => {
        Alert.alert(
            "Reject Campaign",
            "Are you sure you want to reject this campaign?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: () => updateCampaignStatus(campaignId, "rejected"),
                },
            ]
        );
    };

    const handleViewDetails = (campaign) => {
        // Fixed navigation - using the navigation prop directly
        navigation.navigate("CampaignDetails", {
            campaign: campaign.rawData || campaign,
        });
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

    if (loading) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, color: "#666" }}>
                    Loading campaigns...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: tabBarHeight + 20,
                }}
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
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>CONCEPT</Text>
                        <Text style={styles.logoSubtext}>PROMOTIONS</Text>
                    </View>
                </View>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Hello, {retailerName || "Retailer"}!
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

                {/* Ongoing Campaigns Section */}
                <View style={styles.campaignsSection}>
                    <Text style={styles.sectionTitle}>Ongoing Campaigns</Text>

                    {campaigns.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="document-text-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.emptyText}>
                                No campaigns assigned yet
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Pull down to refresh
                            </Text>
                        </View>
                    ) : (
                        campaigns.map((campaign) => (
                            <View key={campaign.id} style={styles.campaignCard}>
                                {/* Campaign Image */}
                                <Image
                                    source={{ uri: campaign.image }}
                                    style={styles.campaignImage}
                                />

                                {/* Campaign Content */}
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
                                </View>

                                {/* Action Buttons */}
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

                                {/* Status Messages */}
                                {campaign.status === "accepted" && (
                                    <View style={styles.statusContainer}>
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

                                        {/* Assigned Employees */}
                                        {campaign.assignedEmployees.length >
                                            0 && (
                                            <View style={styles.employeesCard}>
                                                <Text
                                                    style={
                                                        styles.employeesTitle
                                                    }
                                                >
                                                    Assigned Employees:
                                                </Text>
                                                {campaign.assignedEmployees.map(
                                                    (employee, index) => (
                                                        <View
                                                            key={index}
                                                            style={
                                                                styles.employeeRow
                                                            }
                                                        >
                                                            <Ionicons
                                                                name="person"
                                                                size={16}
                                                                color="#666"
                                                            />
                                                            <Text
                                                                style={
                                                                    styles.employeeName
                                                                }
                                                            >
                                                                {employee.name ||
                                                                    "Employee"}{" "}
                                                                —{" "}
                                                                {employee.phone ||
                                                                    "N/A"}
                                                            </Text>
                                                        </View>
                                                    )
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )}

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
    logoContainer: {
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "#fff",
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: "#f0f0f0",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    logoSubtext: {
        fontSize: 8,
        color: "#666",
        marginTop: 2,
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
        paddingBottom: 30,
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
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 15,
        fontWeight: "600",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#ccc",
        marginTop: 5,
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
    statusContainer: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    acceptedStatus: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d4edda",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
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
        borderRadius: 8,
        marginHorizontal: 15,
        marginBottom: 15,
    },
    rejectedText: {
        color: "#dc3545",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 8,
    },
    employeesCard: {
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#28a745",
    },
    employeesTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    employeeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    employeeName: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
    },
});

export default RetailerDashboardScreen;
