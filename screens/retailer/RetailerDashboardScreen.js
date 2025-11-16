import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Linking,
    Alert,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const RetailerDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const [retailerName, setRetailerName] = useState("Hari");
    const [campaigns, setCampaigns] = useState([
        {
            id: "1",
            title: "Summer Sale Campaign",
            description:
                "Get 50% off on all summer products. Limited time offer for premium customers.",
            startDate: "01/12/2025",
            endDate: "31/12/2025",
            image: "https://via.placeholder.com/300x150",
            status: null, // null, 'accepted', 'rejected'
            assignedEmployees: [
                { name: "Rohit Sharma", phone: "9876543210" },
                { name: "Anjali Verma", phone: "9123456780" },
            ],
        },
        {
            id: "2",
            title: "Festive Diwali Offer",
            description:
                "Special festive discounts on electronics and home appliances.",
            startDate: "15/11/2025",
            endDate: "30/11/2025",
            image: "https://via.placeholder.com/300x150",
            status: null,
            assignedEmployees: [{ name: "Priya Singh", phone: "9988776655" }],
        },
    ]);

    const SUPPORT_NUMBER = "1800123456"; // Replace with your actual number

    // Handle phone call
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

    // Handle notification bell
    const handleNotifications = () => {
        Alert.alert("Notifications", "You have no new notifications");
    };

    // Handle campaign acceptance
    const handleAccept = (campaignId) => {
        setCampaigns((prevCampaigns) =>
            prevCampaigns.map((campaign) =>
                campaign.id === campaignId
                    ? { ...campaign, status: "accepted" }
                    : campaign
            )
        );
    };

    // Handle campaign rejection
    const handleReject = (campaignId) => {
        setCampaigns((prevCampaigns) =>
            prevCampaigns.map((campaign) =>
                campaign.id === campaignId
                    ? { ...campaign, status: "rejected" }
                    : campaign
            )
        );
    };

    // Handle view details
    const handleViewDetails = (campaign) => {
        Alert.alert(
            campaign.title,
            `${campaign.description}\n\nDuration: ${campaign.startDate} to ${campaign.endDate}`
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: tabBarHeight + 20, // Add extra padding for tab bar
                }}
            >
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    {/* Replace with your actual logo */}
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>CONCEPT</Text>
                        <Text style={styles.logoSubtext}>PROMOTIONS</Text>
                    </View>
                    {/* Uncomment when you have actual logo */}
                    {/* <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          /> */}
                </View>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, {retailerName}!</Text>
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

                    {campaigns.map((campaign) => (
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
                                    📅 {campaign.startDate} - {campaign.endDate}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.viewDetailsButton}
                                    onPress={() => handleViewDetails(campaign)}
                                >
                                    <Text style={styles.viewDetailsText}>
                                        View Details
                                    </Text>
                                </TouchableOpacity>

                                {campaign.status === null && (
                                    <View style={styles.acceptRejectButtons}>
                                        <TouchableOpacity
                                            style={styles.acceptButton}
                                            onPress={() =>
                                                handleAccept(campaign.id)
                                            }
                                        >
                                            <Text
                                                style={styles.acceptButtonText}
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
                                                style={styles.rejectButtonText}
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
                                    <View style={styles.employeesCard}>
                                        <Text style={styles.employeesTitle}>
                                            Assigned Employees:
                                        </Text>
                                        {campaign.assignedEmployees.map(
                                            (employee, index) => (
                                                <View
                                                    key={index}
                                                    style={styles.employeeRow}
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
                                                        {employee.name} —{" "}
                                                        {employee.phone}
                                                    </Text>
                                                </View>
                                            )
                                        )}
                                    </View>
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
                    ))}
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
    logo: {
        width: 100,
        height: 60,
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
