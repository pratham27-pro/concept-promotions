import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GridButton from "../../components/common/GridButton";
import Header from "../../components/common/Header";

const RetailerCampaignDetailsScreen = ({ route, navigation }) => {
    const { campaign: initialCampaign } = route.params;

    const [loading, setLoading] = useState(false);
    const [campaignData, setCampaignData] = useState(null);

    useEffect(() => {
        if (initialCampaign) {
            transformCampaignData();
        }
    }, [initialCampaign]);

    // ✅ Just transform the data, no API call needed
    const transformCampaignData = () => {
        try {
            setLoading(true);

            const transformedData = {
                id: initialCampaign._id,
                name: initialCampaign.name,
                title: initialCampaign.name,
                client: initialCampaign.client,
                type: initialCampaign.type,
                description: `${initialCampaign.type || "Campaign"} - ${
                    initialCampaign.client || "Client"
                }`,
                startDate: formatDate(initialCampaign.campaignStartDate),
                endDate: formatDate(initialCampaign.campaignEndDate),
                campaignStartDate: initialCampaign.campaignStartDate,
                campaignEndDate: initialCampaign.campaignEndDate,
                regions: initialCampaign.regions || [],
                states: initialCampaign.states || [],
                isActive: initialCampaign.isActive,
                status: initialCampaign.retailerStatus?.status || null,
                assignedEmployees: initialCampaign.assignedEmployees || [],
                gratification: initialCampaign.gratification || {},
                rawData: initialCampaign,
                info: initialCampaign.info || {},
            };

            setCampaignData(transformedData);
        } catch (error) {
            console.error("Error transforming campaign data:", error);
            Alert.alert("Error", "Failed to load campaign details");
        } finally {
            setLoading(false);
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

    const handleInfo = () => {
        if (!campaignData) return;
        navigation.navigate("RetailerCampaignInfo", { campaign: campaignData });
    };

    const handleGratification = () => {
        if (!campaignData) return;
        navigation.navigate("RetailerCampaignGratification", {
            campaign: campaignData,
        });
    };

    const handleViewReport = () => {
        if (!campaignData) return;
        navigation.navigate("RetailerViewReports", { campaign: campaignData });
    };

    const handleStats = () => {
        Alert.alert("Stats", "Stats feature coming soon!");
    };

    const handlePeriod = () => {
        if (!campaignData) return;
        navigation.navigate("RetailerCampaignPeriod", {
            campaign: campaignData,
        });
    };

    const handleLeaderboard = () => {
        Alert.alert("Leaderboard", "Leaderboard feature coming soon!");
    };

    const handleSubmitReport = () => {
        if (!campaignData) {
            Alert.alert("Error", "Campaign data not loaded");
            return;
        }

        // Check if campaign is accepted
        if (campaignData.status !== "accepted") {
            Alert.alert(
                "Cannot Submit Report",
                "You need to accept this campaign before submitting reports.",
            );
            return;
        }

        navigation.navigate("SubmitReport", { campaign: campaignData });
    };

    if (loading || !campaignData) {
        return (
            <SafeAreaView
                style={[styles.container, styles.centerContent]}
                edges={["top", "left", "right"]}
            >
                <StatusBar style="dark" />
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#dc3545" />
                    <Text style={styles.loadingText}>
                        Loading campaign details...
                    </Text>
                </View>
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
            >
                {/* Campaign Name */}
                <View style={styles.campaignNameContainer}>
                    <Text style={styles.campaignName}>{campaignData.name}</Text>
                    <Text style={styles.campaignClient}>
                        {campaignData.client} • {campaignData.type}
                    </Text>
                    <Text style={styles.campaignDuration}>
                        📅 {campaignData.startDate} - {campaignData.endDate}
                    </Text>

                    {/* Status Badge */}
                    {campaignData.status && (
                        <View
                            style={[
                                styles.statusBadge,
                                campaignData.status === "accepted"
                                    ? styles.statusAccepted
                                    : styles.statusRejected,
                            ]}
                        >
                            <Ionicons
                                name={
                                    campaignData.status === "accepted"
                                        ? "checkmark-circle"
                                        : "close-circle"
                                }
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.statusText}>
                                {campaignData.status === "accepted"
                                    ? "Accepted"
                                    : "Rejected"}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Assigned Employees */}
                {campaignData.assignedEmployees.length > 0 && (
                    <View style={styles.employeesContainer}>
                        <Text style={styles.employeesTitle}>
                            Assigned Employees:
                        </Text>
                        {campaignData.assignedEmployees.map(
                            (employee, index) => (
                                <View key={index} style={styles.employeeRow}>
                                    <Ionicons
                                        name="person-circle-outline"
                                        size={20}
                                        color="#007AFF"
                                    />
                                    <View style={styles.employeeInfo}>
                                        <Text style={styles.employeeName}>
                                            {employee.name || "Employee"}
                                        </Text>
                                        <Text style={styles.employeeContact}>
                                            {employee.phone ||
                                                employee.email ||
                                                "N/A"}
                                        </Text>
                                    </View>
                                </View>
                            ),
                        )}
                    </View>
                )}

                {/* Grid Buttons - 2 columns, 3 rows */}
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

                    {/* <GridButton
                        title="Stats"
                        icon="stats-chart-outline"
                        onPress={handleStats}
                    /> */}

                    {/* Row 3 */}
                    {/* <GridButton
                        title="Period"
                        icon="calendar-outline"
                        onPress={handlePeriod}
                    />

                    <GridButton
                        title="Leaderboard"
                        icon="trophy-outline"
                        onPress={handleLeaderboard}
                    /> */}
                </View>

                {/* Submit Report Button - Only show if accepted */}
                {campaignData.status === "accepted" && (
                    <TouchableOpacity
                        style={styles.submitButtonWrapper}
                        onPress={handleSubmitReport}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#dc3545", "#c82333"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitButton}
                        >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.submitButtonText}>
                                Submit Report
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Message if not accepted */}
                {campaignData.status !== "accepted" && (
                    <View style={styles.notAcceptedContainer}>
                        <Ionicons
                            name="information-circle-outline"
                            size={24}
                            color="#666"
                        />
                        <Text style={styles.notAcceptedText}>
                            Accept this campaign from the dashboard to submit
                            reports
                        </Text>
                    </View>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
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
        marginBottom: 8,
    },
    campaignClient: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        marginBottom: 8,
    },
    campaignDuration: {
        fontSize: 14,
        color: "#007AFF",
        textAlign: "center",
        fontWeight: "600",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginTop: 12,
        alignSelf: "center",
    },
    statusAccepted: {
        backgroundColor: "#28a745",
    },
    statusRejected: {
        backgroundColor: "#dc3545",
    },
    statusText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    employeesContainer: {
        backgroundColor: "#fff",
        padding: 15,
        marginTop: 15,
        marginHorizontal: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    employeesTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    employeeRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    employeeInfo: {
        marginLeft: 10,
        flex: 1,
    },
    employeeName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    employeeContact: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 15,
        marginTop: 20,
        justifyContent: "space-between",
    },
    submitButtonWrapper: {
        paddingHorizontal: 15,
        marginTop: 20,
        marginBottom: 20,
    },
    submitButton: {
        flexDirection: "row",
        height: 60,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#dc3545",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    notAcceptedContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        padding: 15,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    notAcceptedText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 10,
        flex: 1,
    },
});

export default RetailerCampaignDetailsScreen;
