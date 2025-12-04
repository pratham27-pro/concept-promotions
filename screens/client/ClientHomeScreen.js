// screens/client/ClientHomeScreen.js
import React, { useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../../context/AuthContext";
import Header from "../../components/common/Header";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const ClientHomeScreen = ({ navigation }) => {
    const { userProfile } = useAuth();

    const [clientName, setClientName] = useState("");

    // API Data States
    const [campaigns, setCampaigns] = useState([]);
    const [payments, setPayments] = useState([]);
    const [reportedOutlets, setReportedOutlets] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchClientData();
            loadClientName();
        }, [])
    );

    const loadClientName = async () => {
        try {
            if (userProfile?.name) {
                setClientName(userProfile.name);
                return;
            }

            const userDataString = await AsyncStorage.getItem("userData");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                const name =
                    userData?.admin?.name || userData?.name || "Client";
                setClientName(name);
            }
        } catch (error) {
            console.error("Error loading client name:", error);
            setClientName("Client");
        }
    };

    const fetchClientData = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                console.warn("❗ No token found");
                Alert.alert("Session Expired", "Please login again.", [
                    { text: "OK", onPress: () => navigation.replace("Login") },
                ]);
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const [campaignsRes, paymentsRes, outletsRes] =
                await Promise.allSettled([
                    fetch(`${API_BASE_URL}/client/client/campaigns`, {
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/client/client/payments`, {
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/client/client/reported-outlets`, {
                        headers,
                    }),
                ]);

            if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
                const campData = await campaignsRes.value.json();
                setCampaigns(campData.campaigns || []);
            } else {
                setCampaigns([]);
            }

            if (paymentsRes.status === "fulfilled" && paymentsRes.value.ok) {
                const payData = await paymentsRes.value.json();
                setPayments(payData.payments || []);
            } else {
                setPayments([]);
            }

            if (outletsRes.status === "fulfilled" && outletsRes.value.ok) {
                const outletData = await outletsRes.value.json();
                setReportedOutlets(outletData.outlets || []);
            } else {
                setReportedOutlets([]);
            }
        } catch (error) {
            console.error("❌ Client Dashboard API Error:", error);
            Alert.alert(
                "Error",
                "Failed to load dashboard data. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchClientData();
        loadClientName();
    };

    // Calculate summary statistics
    const activeCampaigns = useMemo(() => {
        return campaigns.filter((c) => {
            const endDate = new Date(c.endDate);
            return endDate >= new Date();
        }).length;
    }, [campaigns]);

    const totalSpend = useMemo(() => {
        return payments.reduce(
            (sum, payment) => sum + (payment.totalAmount || 0),
            0
        );
    }, [payments]);

    const uniqueOutletsCount = useMemo(() => {
        const uniqueRetailers = new Set();
        campaigns.forEach((campaign) => {
            campaign.retailers?.forEach((retailer) => {
                if (retailer.retailerId) {
                    uniqueRetailers.add(retailer.retailerId);
                }
            });
        });
        return uniqueRetailers.size;
    }, [campaigns]);

    const pendingPayments = useMemo(() => {
        return payments.filter((p) => p.paymentStatus === "Pending").length;
    }, [payments]);

    const summaryCards = useMemo(
        () => [
            {
                id: 1,
                title: "Active Campaigns",
                value: activeCampaigns,
                icon: "megaphone-outline",
                color: "#007AFF",
                bgColor: "#E3F2FD",
            },
            {
                id: 2,
                title: "Total Spend",
                value: `₹${(totalSpend / 100000).toFixed(1)}L`,
                icon: "cash-outline",
                color: "#28a745",
                bgColor: "#E8F5E9",
            },
            {
                id: 3,
                title: "Outlets Enrolled",
                value: uniqueOutletsCount,
                icon: "storefront-outline",
                color: "#FFA500",
                bgColor: "#FFF3E0",
            },
            {
                id: 4,
                title: "Pending Payments",
                value: pendingPayments,
                icon: "time-outline",
                color: "#dc3545",
                bgColor: "#FFEBEE",
            },
        ],
        [activeCampaigns, totalSpend, uniqueOutletsCount, pendingPayments]
    );

    // Recent activity
    const recentActivity = useMemo(() => {
        const reportsThisWeek = reportedOutlets.filter((outlet) => {
            const reportDate = new Date(outlet.createdAt || outlet.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reportDate >= weekAgo;
        }).length;

        const thisMonthPayments = payments.filter((payment) => {
            const paymentDate = new Date(payment.date || payment.createdAt);
            const currentMonth = new Date().getMonth();
            return paymentDate.getMonth() === currentMonth;
        });

        const thisMonthSpend = thisMonthPayments.reduce(
            (sum, p) => sum + (p.totalAmount || 0),
            0
        );

        const completedPayments = payments.filter(
            (p) => p.paymentStatus === "Completed"
        ).length;

        return [
            {
                icon: "checkmark-done-outline",
                iconColor: "#28a745",
                title: `${reportsThisWeek} reports submitted this week`,
                subtitle:
                    activeCampaigns > 0
                        ? `Across ${activeCampaigns} active campaigns`
                        : "No active campaigns",
            },
            {
                icon: "wallet-outline",
                iconColor: "#007AFF",
                title:
                    thisMonthSpend > 0
                        ? `₹${(thisMonthSpend / 100000).toFixed(
                              2
                          )}L spent this month`
                        : "No spending this month",
                subtitle: `${completedPayments} payments completed`,
            },
        ];
    }, [reportedOutlets, payments, activeCampaigns]);

    const quickActions = [
        {
            id: 1,
            title: "Outlets Overview",
            icon: "storefront-outline",
            description: "View all enrolled outlets",
            screen: "ClientOutlets",
            color: "#007AFF",
        },
        {
            id: 2,
            title: "View Passbook",
            icon: "wallet-outline",
            description: "Track payments and transactions",
            screen: "Passbook",
            color: "#28a745",
        },
        {
            id: 3,
            title: "Campaign Reports",
            icon: "document-text-outline",
            description: "View detailed campaign reports",
            screen: "Reports",
            color: "#FFA500",
        },
        {
            id: 4,
            title: "Contact Support",
            icon: "call-outline",
            description: "Get help and support",
            screen: "ContactUs",
            color: "#dc3545",
        },
    ];

    const handleQuickAction = useCallback(
        (action) => {
            console.log("Quick action:", action.title);

            if (action.screen === "Passbook") {
                navigation.navigate("ClientPassbook");
            } else if (action.screen === "ClientOutlets") {
                navigation.navigate("ClientOutlets");
            } else if (action.screen === "Reports") {
                navigation.navigate("ClientReport");
            } else {
                Alert.alert(
                    "Coming Soon",
                    `${action.title} feature will be available soon.`,
                    [{ text: "OK" }]
                );
            }
        },
        [navigation]
    );

    if (loading) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <Header showBackButton={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E4002B" />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header showBackButton={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#E4002B"]}
                        tintColor="#E4002B"
                    />
                }
            >
                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeContent}>
                        <Text style={styles.welcomeTitle}>
                            Welcome, {clientName}! 👋
                        </Text>
                        <Text style={styles.welcomeSubtitle}>
                            Track your campaigns, reports and payments in one
                            place.
                        </Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Ionicons
                            name="person-circle"
                            size={60}
                            color="#E4002B"
                        />
                    </View>
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
                                        { backgroundColor: card.bgColor },
                                    ]}
                                >
                                    <Ionicons
                                        name={card.icon}
                                        size={26}
                                        color={card.color}
                                    />
                                </View>
                                <Text style={styles.summaryValue}>
                                    {card.value}
                                </Text>
                                <Text
                                    style={styles.summaryLabel}
                                    numberOfLines={1}
                                >
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
                        {recentActivity.map((activity, index) => (
                            <React.Fragment key={index}>
                                <View style={styles.activityRow}>
                                    <View
                                        style={[
                                            styles.activityIconWrapper,
                                            {
                                                backgroundColor: `${activity.iconColor}15`,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={activity.icon}
                                            size={22}
                                            color={activity.iconColor}
                                        />
                                    </View>
                                    <View style={styles.activityTextContainer}>
                                        <Text style={styles.activityTitle}>
                                            {activity.title}
                                        </Text>
                                        <Text style={styles.activitySubtitle}>
                                            {activity.subtitle}
                                        </Text>
                                    </View>
                                </View>
                                {index < recentActivity.length - 1 && (
                                    <View style={styles.activityDivider} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[styles.section, { marginBottom: 20 }]}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.actionCard}
                                onPress={() => handleQuickAction(action)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.actionIconContainer,
                                        {
                                            backgroundColor: `${action.color}15`,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={action.icon}
                                        size={28}
                                        color={action.color}
                                    />
                                </View>
                                <View style={styles.actionTextContainer}>
                                    <Text
                                        style={styles.actionTitle}
                                        numberOfLines={1}
                                    >
                                        {action.title}
                                    </Text>
                                    <Text
                                        style={styles.actionDescription}
                                        numberOfLines={2}
                                    >
                                        {action.description}
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
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        paddingHorizontal: 16,
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
        fontWeight: "500",
    },
    welcomeCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeContent: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 6,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    welcomeIconContainer: {
        marginLeft: 12,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    summaryCard: {
        flexBasis: "48%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    activityCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    activityIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    activityTextContainer: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 13,
        color: "#666",
    },
    activityDivider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 14,
    },
    actionsGrid: {
        gap: 12,
    },
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
});

export default ClientHomeScreen;
