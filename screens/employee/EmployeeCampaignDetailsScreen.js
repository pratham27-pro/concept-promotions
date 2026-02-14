import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import reusable components
import GradientButton from "../../components/common/GradientButton";
import GridButton from "../../components/common/GridButton";
import Header from "../../components/common/Header";

const EmployeeCampaignDetailsScreen = ({ route }) => {
    const navigation = useNavigation();
    const [campaignData, setCampaignData] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ Add loading state

    useEffect(() => {
        if (route.params?.campaign) {
            transformCampaignData(route.params.campaign);
        }
    }, [route.params]);

    // ✅ SIMPLIFIED - Just transform the campaign data we receive
    const transformCampaignData = (campaign) => {
        try {
            setLoading(true);

            console.log("📋 Campaign received:", campaign);
            console.log("📋 Campaign.info:", campaign.info);
            console.log("📋 Campaign.gratification:", campaign.gratification);

            // Transform the campaign data to a consistent format
            const transformedCampaign = {
                id: campaign.id || campaign._id,
                name: campaign.title || campaign.name || "Campaign",
                client: campaign.client || "N/A",
                type: campaign.campaignType || campaign.type || "Campaign",
                startDate: formatDate(
                    campaign.startDate || campaign.campaignStartDate,
                ),
                endDate: formatDate(
                    campaign.endDate || campaign.campaignEndDate,
                ),
                // ✅ Preserve original date fields for other screens
                campaignStartDate:
                    campaign.startDate || campaign.campaignStartDate,
                campaignEndDate: campaign.endDate || campaign.campaignEndDate,

                regions: campaign.regions || [],
                states: campaign.states || [],
                status: campaign.status,
                assignedEmployees: campaign.assignedEmployees || [],
                assignedRetailers: campaign.assignedRetailers || [],
                retailerName: getRetailerName(campaign),
                location: getLocation(campaign),

                // ✅ CRITICAL - These should now have data!
                info: campaign.info || {},
                gratification: campaign.gratification || {},

                rawData: campaign, // Keep original data
            };

            setCampaignData(transformedCampaign);
            console.log("✅ Transformed campaign:", transformedCampaign);
            console.log("✅ Info field:", transformedCampaign.info);
            console.log(
                "✅ Gratification field:",
                transformedCampaign.gratification,
            );
        } catch (error) {
            console.error("❌ Error transforming campaign:", error);
            Alert.alert("Error", "Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        // If already formatted (DD/MM/YYYY)
        if (typeof dateString === "string" && dateString.includes("/")) {
            return dateString;
        }

        // Convert ISO date
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getRetailerName = (campaign) => {
        // Try different possible sources
        if (campaign.retailerName) return campaign.retailerName;
        if (campaign.assignedRetailers?.length > 0) {
            return campaign.assignedRetailers[0].name || "Retailer";
        }
        return "Not Assigned";
    };

    const getLocation = (campaign) => {
        // Try to get location from different sources
        if (campaign.location) return campaign.location;

        // Build location from states/regions
        const states = campaign.states || [];
        const regions = campaign.regions || [];

        if (states.length > 0) {
            return states.join(", ");
        }

        if (regions.length > 0) {
            return regions.join(", ");
        }

        return "Location not specified";
    };

    const handleInfo = () => {
        if (!campaignData) return;
        navigation.navigate("EmployeeCampaignInfo", { campaign: campaignData });
    };

    const handleGratification = () => {
        if (!campaignData) return;
        navigation.navigate("EmployeeCampaignGratification", {
            campaign: campaignData,
        });
    };

    const handleViewReport = () => {
        if (!campaignData) return;
        navigation.navigate("EmployeeViewReports", { campaign: campaignData });
    };

    const handleButtonPress = (buttonName) => {
        console.log(`${buttonName} pressed`);
        // Navigation will be added when those screens are created
    };

    const handleSubmitReport = () => {
        console.log("📤 ========== SUBMIT REPORT NAVIGATION ==========");
        console.log(
            "📤 Campaign Data being sent:",
            JSON.stringify(campaignData, null, 2),
        );
        console.log("📤 Campaign ID:", campaignData.id);
        console.log("📤 Campaign Name:", campaignData.name);
        console.log("📤 Raw Data:", campaignData.rawData);
        console.log("================================================");

        // Pass both the campaign data and the ID
        navigation.navigate("EmployeeSubmitReport", {
            campaign: {
                ...campaignData.rawData,
                _id: campaignData.id,
                id: campaignData.id,
                name: campaignData.name,
            },
            campaignId: campaignData.id, // Pass ID directly
        });
    };

    // Loading state
    if (!campaignData) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                    Loading campaign details...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header using reusable component */}
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Campaign Name */}
                <View style={styles.campaignNameContainer}>
                    <Text style={styles.campaignName}>{campaignData.name}</Text>
                    <Text style={styles.campaignSubtitle}>
                        {campaignData.client} • {campaignData.type}
                    </Text>
                    <Text style={styles.campaignDuration}>
                        📅 {campaignData.startDate} - {campaignData.endDate}
                    </Text>

                    {/* Status Badge */}
                    {campaignData.status && (
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusBadge,
                                    campaignData.status === "accepted" &&
                                        styles.statusAccepted,
                                    campaignData.status === "rejected" &&
                                        styles.statusRejected,
                                    !campaignData.status &&
                                        styles.statusPending,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        campaignData.status === "accepted" &&
                                            styles.statusTextAccepted,
                                        campaignData.status === "rejected" &&
                                            styles.statusTextRejected,
                                    ]}
                                >
                                    {campaignData.status === "accepted" &&
                                        "✓ Accepted"}
                                    {campaignData.status === "rejected" &&
                                        "✗ Rejected"}
                                    {!campaignData.status && "⏳ Pending"}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Location Info */}
                    {/* {campaignData.location && (
                        <View style={styles.locationCard}>
                            <Text style={styles.locationLabel}>Location:</Text>
                            <Text style={styles.locationText}>
                                📍 {campaignData.location}
                            </Text>
                        </View>
                    )} */}

                    {/* Assigned Employees (if any) */}
                    {/* {campaignData.assignedEmployees?.length > 0 && (
                        <View style={styles.employeesCard}>
                            <Text style={styles.employeesLabel}>
                                Team Members (
                                {campaignData.assignedEmployees.length}):
                            </Text>
                            {campaignData.assignedEmployees.map(
                                (employee, index) => (
                                    <Text
                                        key={index}
                                        style={styles.employeeName}
                                    >
                                        👤 {employee.name || "Employee"}{" "}
                                        {employee.phone
                                            ? `— ${employee.phone}`
                                            : ""}
                                    </Text>
                                )
                            )}
                        </View>
                    )} */}
                </View>

                {/* Grid Buttons - Using GridButton component */}
                <View style={styles.gridContainer}>
                    {/* Row 1 */}
                    <GridButton
                        title="Info"
                        icon="information-circle-outline"
                        onPress={handleInfo}
                    />

                    <GridButton
                        title="Gratification"
                        icon="gift-outline"
                        onPress={handleGratification}
                    />

                    {/* Row 2 */}
                    <GridButton
                        title="View Report"
                        icon="document-text-outline"
                        onPress={handleViewReport}
                    />
                    {/*
                    <GridButton
                        title="Period"
                        icon="calendar-outline"
                        onPress={() => handleButtonPress("Period")}
                    /> */}

                    {/* Row 3 */}
                    {/* <GridButton
                        title="Outlets Assigned"
                        icon="storefront-outline"
                        onPress={() => handleButtonPress("Outlets Assigned")}
                    /> */}

                    {/* <GridButton
                        title="Status"
                        icon="stats-chart-outline"
                        onPress={() => handleButtonPress("Status")}
                    /> */}
                </View>

                {/* Submit Report Button - Using GradientButton */}
                <View style={styles.submitButtonContainer}>
                    <GradientButton
                        title="Submit Report"
                        icon="cloud-upload-outline"
                        onPress={handleSubmitReport}
                        colors={["#E4002B", "#c82333"]}
                        fullWidth={true}
                    />
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
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: "#666",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        flexGrow: 1,
    },
    campaignNameContainer: {
        backgroundColor: "#fff",
        padding: 20,
        marginTop: 15,
        marginHorizontal: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    campaignName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 5,
    },
    campaignSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 10,
    },
    campaignDuration: {
        fontSize: 14,
        color: "#007AFF",
        textAlign: "center",
        fontWeight: "600",
        marginBottom: 15,
    },
    statusContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    statusAccepted: {
        backgroundColor: "#d4edda",
    },
    statusRejected: {
        backgroundColor: "#f8d7da",
    },
    statusPending: {
        backgroundColor: "#fff3cd",
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    statusTextAccepted: {
        color: "#28a745",
    },
    statusTextRejected: {
        color: "#dc3545",
    },
    locationCard: {
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
        marginBottom: 10,
    },
    locationLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    employeesCard: {
        backgroundColor: "#e3f2fd",
        padding: 12,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#2196F3",
    },
    employeesLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
        fontWeight: "600",
    },
    employeeName: {
        fontSize: 13,
        color: "#333",
        marginBottom: 4,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 15,
        marginTop: 20,
        justifyContent: "space-between",
    },
    submitButtonContainer: {
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 20,
    },
});

export default EmployeeCampaignDetailsScreen;
