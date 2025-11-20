import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as RootNavigation from "../../navigation/RootNavigation";

// Import reusable components
import Header from "../../components/common/Header";
import GridButton from "../../components/common/GridButton";
import GradientButton from "../../components/common/GradientButton";

const EmployeeCampaignDetailsScreen = ({ route }) => {
    const { campaign } = route.params;

    const handleButtonPress = (buttonName) => {
        console.log(`${buttonName} pressed`);
        // Navigation will be added when those screens are created
    };

    const handleSubmitReport = () => {
        RootNavigation.navigate("EmployeeSubmitReport", { campaign });
    };

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
                    <Text style={styles.campaignName}>{campaign.title}</Text>
                    <Text style={styles.campaignDuration}>
                        📅 {campaign.startDate} - {campaign.endDate}
                    </Text>

                    {/* Retailer Info */}
                    <View style={styles.retailerInfoCard}>
                        <Text style={styles.retailerLabel}>Assigned At:</Text>
                        <Text style={styles.retailerName}>
                            {campaign.retailerName}
                        </Text>
                        <Text style={styles.retailerLocation}>
                            📍 {campaign.location}
                        </Text>
                    </View>
                </View>

                {/* Grid Buttons - Using GridButton component */}
                <View style={styles.gridContainer}>
                    {/* Row 1 */}
                    <GridButton
                        title="Info"
                        icon="information-circle-outline"
                        onPress={() => handleButtonPress("Info")}
                        // colors={["#007AFF", "#0051D5"]}
                    />

                    <GridButton
                        title="Gratification"
                        icon="gift-outline"
                        onPress={() => handleButtonPress("Gratification")}
                        // colors={["#007AFF", "#0051D5"]}
                    />

                    {/* Row 2 */}
                    <GridButton
                        title="View Report"
                        icon="document-text-outline"
                        onPress={() => handleButtonPress("View Report")}
                        // colors={["#007AFF", "#0051D5"]}
                    />

                    <GridButton
                        title="Period"
                        icon="calendar-outline"
                        onPress={() => handleButtonPress("Period")}
                        // colors={["#007AFF", "#0051D5"]}
                    />

                    {/* Row 3 */}
                    <GridButton
                        title="Outlets Assigned"
                        icon="storefront-outline"
                        onPress={() => handleButtonPress("Outlets Assigned")}
                        // colors={["#007AFF", "#0051D5"]}
                    />

                    <GridButton
                        title="Status"
                        icon="stats-chart-outline"
                        onPress={() => handleButtonPress("Status")}
                        // colors={["#007AFF", "#0051D5"]}
                    />
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
        marginBottom: 10,
    },
    campaignDuration: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 15,
    },
    retailerInfoCard: {
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
        marginTop: 10,
    },
    retailerLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 5,
    },
    retailerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    retailerLocation: {
        fontSize: 14,
        color: "#666",
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
