import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/common/Header";

const ClientHomeScreen = () => {
    const [clientName] = useState("Welcome, Client");

    const summaryCards = [
        {
            id: 1,
            title: "Active Campaigns",
            value: 8,
            icon: "megaphone-outline",
            color: "#007AFF",
        },
        {
            id: 2,
            title: "Total Spend",
            value: "₹12.5L",
            icon: "cash-outline",
            color: "#28a745",
        },
        {
            id: 3,
            title: "Reports Submitted",
            value: 42,
            icon: "document-text-outline",
            color: "#FFA500",
        },
    ];

    const quickActions = [
        {
            id: 1,
            title: "View Detailed Report",
            icon: "analytics-outline",
        },
        {
            id: 2,
            title: "Download Last Month",
            icon: "download-outline",
        },
        {
            id: 3,
            title: "Contact Account Manager",
            icon: "call-outline",
        },
    ];

    const handleQuickAction = (title) => {
        console.log("Quick action:", title);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header showBackButton={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Page Heading */}
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Client Home Page</Text>
                </View>

                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View>
                        <Text style={styles.welcomeTitle}>{clientName}</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Track your campaigns, reports and payments in one
                            place.
                        </Text>
                    </View>
                    <Ionicons
                        name="person-circle-outline"
                        size={52}
                        color="#E4002B"
                    />
                </View>

                {/* Summary Cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.summaryRow}>
                        {summaryCards.map((card) => (
                            <View key={card.id} style={styles.summaryCard}>
                                <View
                                    style={[
                                        styles.summaryIconWrapper,
                                        { backgroundColor: `${card.color}15` },
                                    ]}
                                >
                                    <Ionicons
                                        name={card.icon}
                                        size={24}
                                        color={card.color}
                                    />
                                </View>
                                <Text style={styles.summaryValue}>
                                    {card.value}
                                </Text>
                                <Text style={styles.summaryLabel}>
                                    {card.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    <View style={styles.activityCard}>
                        <View style={styles.activityRow}>
                            <View style={styles.activityIconWrapper}>
                                <Ionicons
                                    name="checkmark-done-outline"
                                    size={22}
                                    color="#28a745"
                                />
                            </View>
                            <View style={styles.activityTextContainer}>
                                <Text style={styles.activityTitle}>
                                    5 reports submitted this week
                                </Text>
                                <Text style={styles.activitySubtitle}>
                                    Across 3 active campaigns
                                </Text>
                            </View>
                        </View>

                        <View style={styles.activityDivider} />

                        <View style={styles.activityRow}>
                            <View style={styles.activityIconWrapper}>
                                <Ionicons
                                    name="wallet-outline"
                                    size={22}
                                    color="#007AFF"
                                />
                            </View>
                            <View style={styles.activityTextContainer}>
                                <Text style={styles.activityTitle}>
                                    ₹2.8L billed this month
                                </Text>
                                <Text style={styles.activitySubtitle}>
                                    Next invoice on 30 Nov 2025
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[styles.section, { marginBottom: 20 }]}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionItem}
                            onPress={() => handleQuickAction(action.title)}
                        >
                            <View style={styles.actionLeft}>
                                <Ionicons
                                    name={action.icon}
                                    size={22}
                                    color="#007AFF"
                                />
                                <Text style={styles.actionText}>
                                    {action.title}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
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
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        paddingHorizontal: 20,
    },
    headingContainer: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 10,
        borderRadius: 12,
    },
    headingText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E4002B",
    },
    welcomeCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 18,
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 6,
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: "#666",
        maxWidth: "80%",
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 12,
        alignItems: "flex-start",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    summaryIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
    },
    activityCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    activityIconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    activitySubtitle: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    activityDivider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 12,
    },
    actionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    actionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    actionText: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
});

export default ClientHomeScreen;
