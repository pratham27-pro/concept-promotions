// screens/client/ClientHomeScreen.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import * as ImagePicker from "expo-image-picker";
import Header from "../../components/common/Header";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../url/base";

const screenWidth = Dimensions.get("window").width;

const ClientHomeScreen = ({ navigation }) => {
    const { userProfile, logout } = useAuth();

    const [clientName, setClientName] = useState("");

    // API Data States
    const [campaigns, setCampaigns] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [reportedOutlets, setReportedOutlets] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter States
    const [campaignFilter, setCampaignFilter] = useState("active"); // 'active', 'inactive', 'all'
    const [showFilters, setShowFilters] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [clientImage, setClientImage] = useState(null);

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
                if (userProfile?.profileImage?.url) {
                    setClientImage(userProfile.profileImage.url);
                }
                return;
            }

            const userDataString = await AsyncStorage.getItem("userData");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setClientName(
                    userData?.admin?.name || userData?.name || "Client"
                );

                const imageUrl =
                    userData?.admin?.profileImage?.url ||
                    userData?.profileImage?.url ||
                    null;
                setClientImage(imageUrl);
            }
        } catch (error) {
            console.error("Error loading client name:", error);
            setClientName("Client");
        }
    };

    const pickImage = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "We need camera roll permissions."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            await uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (imageUri) => {
        setUploadingImage(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const formData = new FormData();
            formData.append("profileImage", {
                uri: imageUri,
                type: "image/jpeg",
                name: "profile.jpg",
            });

            const response = await fetch(
                `${API_BASE_URL}/client/profile/image`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            if (response.ok) {
                Alert.alert("Success", "Profile image updated");
                await fetchClientData(); // ← Refetch to sync
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const deleteImage = async () => {
        setUploadingImage(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(
                `${API_BASE_URL}/client/profile/image`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                Alert.alert("Success", "Profile image deleted");
                await fetchClientData(); // ← Refetch to sync
            }
        } catch (error) {
            Alert.alert("Error", "Failed to delete image");
        } finally {
            setUploadingImage(false);
        }
    };

    const showImageOptions = () => {
        const options = clientImage
            ? ["Take Photo", "Choose from Library", "Delete Photo", "Cancel"]
            : ["Take Photo", "Choose from Library", "Cancel"];

        Alert.alert(
            "Profile Photo",
            "Choose an option",
            options.map((opt, idx) => ({
                text: opt,
                onPress: () => {
                    if (idx === 0) {
                        /* Take Photo - implement camera */
                    } else if (idx === 1) {
                        pickImage();
                    } else if (idx === 2 && clientImage) {
                        deleteImage();
                    }
                },
                style: idx === 2 && clientImage ? "destructive" : "default",
            }))
        );
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

            const [campaignsRes, budgetsRes, outletsRes, profileRes] =
                await Promise.allSettled([
                    fetch(`${API_BASE_URL}/client/client/campaigns`, {
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/budgets`, {
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/client/client/reported-outlets`, {
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/client/client/profile`, { headers }),
                ]);

            if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
                const campData = await campaignsRes.value.json();
                setCampaigns(campData.campaigns || []);
            } else {
                setCampaigns([]);
            }

            if (budgetsRes.status === "fulfilled" && budgetsRes.value.ok) {
                const budgetData = await budgetsRes.value.json();
                setBudgets(budgetData.budgets || []);
            } else {
                setBudgets([]);
            }

            if (outletsRes.status === "fulfilled" && outletsRes.value.ok) {
                const outletData = await outletsRes.value.json();
                setReportedOutlets(outletData.outlets || []);
            } else {
                setReportedOutlets([]);
            }

            if (profileRes.status === "fulfilled" && profileRes.value.ok) {
                const profileData = await profileRes.value.json();

                if (profileData.client?.name) {
                    setClientName(profileData.client.name);
                }

                if (profileData.client?.profileImage?.url) {
                    setClientImage(profileData.client.profileImage.url);
                } else {
                    console.log("❌ No image URL found in response");
                    console.log("❌ Checking alternative paths...");

                    // Try alternative structures
                    if (profileData.profileImage?.url) {
                        console.log("✅ Found at profileData.profileImage.url");
                        setClientImage(profileData.profileImage.url);
                    } else if (profileData.client?.profilePicture?.url) {
                        console.log(
                            "✅ Found at profileData.client.profilePicture.url"
                        );
                        setClientImage(profileData.client.profilePicture.url);
                    }
                }

                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify({ admin: profileData.client })
                );
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

    // Filter campaigns based on status
    const filteredCampaigns = useMemo(() => {
        if (campaignFilter === "all") return campaigns;
        const isActive = campaignFilter === "active";
        return campaigns.filter((c) => c.isActive === isActive);
    }, [campaigns, campaignFilter]);

    // Build outlets data from campaigns
    const outletsData = useMemo(() => {
        const outletsArray = [];

        filteredCampaigns.forEach((campaign) => {
            (campaign.assignedRetailers || []).forEach((retailerAssignment) => {
                const retailer = retailerAssignment.retailerId;

                if (!retailer || !retailer._id) return;

                const retailerId = retailer._id;
                const acceptanceStatus = retailerAssignment.status || "pending";

                // Find payment info
                const budget = budgets.find((b) => {
                    if (!b.retailerId) return false;
                    const budgetRetailerId = b.retailerId._id || b.retailerId;
                    return budgetRetailerId === retailerId;
                });

                let campaignPaymentStatus = "Pending";
                let tca = 0;
                let cPaid = 0;

                if (budget) {
                    const campaignBudget = budget.campaigns.find((c) => {
                        if (!c.campaignId) return false;
                        const budgetCampaignId =
                            c.campaignId._id || c.campaignId;
                        return budgetCampaignId === campaign._id;
                    });

                    if (campaignBudget) {
                        tca = campaignBudget.tca || 0;
                        cPaid = campaignBudget.cPaid || 0;

                        if (cPaid === 0) {
                            campaignPaymentStatus = "Pending";
                        } else if (cPaid < tca) {
                            campaignPaymentStatus = "Partially Paid";
                        } else if (cPaid >= tca) {
                            campaignPaymentStatus = "Completed";
                        }
                    }
                }

                outletsArray.push({
                    retailerId,
                    campaignId: campaign._id,
                    acceptanceStatus,
                    paymentStatus: campaignPaymentStatus,
                    tca,
                    cPaid,
                });
            });
        });

        return outletsArray;
    }, [filteredCampaigns, budgets]);

    // Calculate statistics
    const statistics = useMemo(() => {
        const uniqueOutlets = new Set(outletsData.map((o) => o.retailerId));
        const uniqueOutletsCount = uniqueOutlets.size;
        const campaignWiseEnrollments = outletsData.length;
        const campaignWiseActivated = outletsData.filter(
            (o) => o.acceptanceStatus === "accepted"
        ).length;
        const outletsFullyPaid = outletsData.filter(
            (o) => o.paymentStatus === "Completed"
        ).length;

        return {
            uniqueOutletsCount,
            campaignWiseEnrollments,
            campaignWiseActivated,
            outletsFullyPaid,
        };
    }, [outletsData]);

    const summaryCards = useMemo(
        () => [
            {
                id: 1,
                title: "Total Outlets",
                subtitle: "Unique outlets enrolled",
                value: statistics.uniqueOutletsCount,
                icon: "storefront-outline",
                color: "#007AFF",
                bgColor: "#E3F2FD",
            },
            {
                id: 2,
                title: "Campaign Enrollments",
                subtitle: "Outlet-campaign combinations",
                value: statistics.campaignWiseEnrollments,
                icon: "list-outline",
                color: "#28a745",
                bgColor: "#E8F5E9",
            },
            {
                id: 3,
                title: "Active Enrollments",
                subtitle: "Accepted by outlets",
                value: statistics.campaignWiseActivated,
                icon: "checkmark-circle-outline",
                color: "#FFA500",
                bgColor: "#FFF3E0",
            },
            {
                id: 4,
                title: "Completed Payments",
                subtitle: "Fully paid enrollments",
                value: statistics.outletsFullyPaid,
                icon: "cash-outline",
                color: "#dc3545",
                bgColor: "#FFEBEE",
            },
        ],
        [statistics]
    );

    // Chart Data
    const paymentChartData = useMemo(() => {
        const completed = outletsData.filter(
            (o) => o.paymentStatus === "Completed"
        ).length;
        const partiallyPaid = outletsData.filter(
            (o) => o.paymentStatus === "Partially Paid"
        ).length;
        const pending = outletsData.filter(
            (o) => o.paymentStatus === "Pending"
        ).length;

        return [
            {
                name: "Completed",
                count: completed,
                color: "#22C55E",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
            {
                name: "Partial",
                count: partiallyPaid,
                color: "#FBBF24",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
            {
                name: "Pending",
                count: pending,
                color: "#EF4444",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
        ];
    }, [outletsData]);

    const acceptanceChartData = useMemo(() => {
        const accepted = outletsData.filter(
            (o) => o.acceptanceStatus === "accepted"
        ).length;
        const pending = outletsData.filter(
            (o) => o.acceptanceStatus === "pending"
        ).length;
        const rejected = outletsData.filter(
            (o) => o.acceptanceStatus === "rejected"
        ).length;

        return [
            {
                name: "Accepted",
                count: accepted,
                color: "#22C55E",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
            {
                name: "Pending",
                count: pending,
                color: "#9CA3AF",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
            {
                name: "Rejected",
                count: rejected,
                color: "#EF4444",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
        ];
    }, [outletsData]);

    const stateChartData = useMemo(() => {
        const stateCounts = {};
        outletsData.forEach((outlet) => {
            filteredCampaigns.forEach((campaign) => {
                const retailerAssignment = campaign.assignedRetailers?.find(
                    (r) => r.retailerId?._id === outlet.retailerId
                );
                if (retailerAssignment) {
                    const state =
                        retailerAssignment.retailerId?.shopDetails?.shopAddress
                            ?.state || "Unknown";
                    stateCounts[state] = (stateCounts[state] || 0) + 1;
                }
            });
        });

        const sortedStates = Object.entries(stateCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        return {
            labels: sortedStates.map(([state]) => state),
            datasets: [{ data: sortedStates.map(([, count]) => count) }],
        };
    }, [outletsData, filteredCampaigns]);

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
            title: "Logout",
            icon: "log-out-outline",
            description: "Sign out of your account",
            screen: "Logout",
            color: "#dc3545",
        },
    ];

    const handleQuickAction = useCallback(
        (action) => {
            if (action.screen === "Passbook") {
                navigation.navigate("ClientPassbook");
            } else if (action.screen === "ClientOutlets") {
                const parent = navigation.getParent();
                if (parent) {
                    parent.navigate("ClientOutlets");
                }
            } else if (action.screen === "Reports") {
                navigation.navigate("ClientReport");
            } else if (action.screen === "Logout") {
                Alert.alert("Logout", "Are you sure you want to logout?", [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await AsyncStorage.multiRemove([
                                    "userToken",
                                    "userData",
                                ]);
                                if (logout) logout();
                                navigation.replace("Login");
                            } catch (error) {
                                console.error("Logout error:", error);
                            }
                        },
                    },
                ]);
            } else {
                Alert.alert(
                    "Coming Soon",
                    `${action.title} feature will be available soon.`,
                    [{ text: "OK" }]
                );
            }
        },
        [navigation, logout]
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
                    <TouchableOpacity
                        style={styles.welcomeIconContainer}
                        onPress={showImageOptions}
                        disabled={uploadingImage}
                        activeOpacity={0.7}
                    >
                        {uploadingImage ? (
                            <ActivityIndicator size="small" color="#E4002B" />
                        ) : clientImage ? (
                            <>
                                <Image
                                    source={{ uri: clientImage }}
                                    style={styles.clientImage}
                                />
                                <View style={styles.imageEditOverlay}>
                                    <Ionicons
                                        name="camera"
                                        size={16}
                                        color="#fff"
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <Ionicons
                                    name="person-circle"
                                    size={60}
                                    color="#E4002B"
                                />
                                <View style={styles.imageEditOverlay}>
                                    <Ionicons
                                        name="camera"
                                        size={16}
                                        color="#fff"
                                    />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Campaign Filter */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Campaign Status</Text>
                    <View style={styles.filterRow}>
                        {["active", "inactive", "all"].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterButton,
                                    campaignFilter === filter &&
                                        styles.filterButtonActive,
                                ]}
                                onPress={() => setCampaignFilter(filter)}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        campaignFilter === filter &&
                                            styles.filterButtonTextActive,
                                    ]}
                                >
                                    {filter.charAt(0).toUpperCase() +
                                        filter.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
                                <Text
                                    style={styles.summarySubtitle}
                                    numberOfLines={2}
                                >
                                    {card.subtitle}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Charts Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Analytics</Text>

                    {/* Payment Status Chart */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                            Payment Status Distribution
                        </Text>
                        {paymentChartData.some((d) => d.count > 0) ? (
                            <PieChart
                                data={paymentChartData}
                                width={screenWidth - 60}
                                height={200}
                                chartConfig={{
                                    color: (opacity = 1) =>
                                        `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="count"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        ) : (
                            <Text style={styles.noDataText}>
                                No payment data available
                            </Text>
                        )}
                    </View>

                    {/* Acceptance Status Chart */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                            Campaign Acceptance Status
                        </Text>
                        {acceptanceChartData.some((d) => d.count > 0) ? (
                            <PieChart
                                data={acceptanceChartData}
                                width={screenWidth - 60}
                                height={200}
                                chartConfig={{
                                    color: (opacity = 1) =>
                                        `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="count"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        ) : (
                            <Text style={styles.noDataText}>
                                No acceptance data available
                            </Text>
                        )}
                    </View>

                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>
                            State-wise Distribution (Top 8)
                        </Text>
                        {stateChartData.labels.length > 0 ? (
                            <BarChart
                                data={stateChartData}
                                width={screenWidth - 60}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#fff",
                                    backgroundGradientFrom: "#fff",
                                    backgroundGradientTo: "#fff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) =>
                                        `rgba(59, 130, 246, ${opacity})`,
                                    labelColor: (opacity = 1) =>
                                        `rgba(0, 0, 0, ${opacity})`,
                                    propsForLabels: { fontSize: 10 },
                                }}
                                showValuesOnTopOfBars
                                fromZero
                            />
                        ) : (
                            <Text style={styles.noDataText}>
                                No state data available
                            </Text>
                        )}
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
    clientImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#E4002B",
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
    filterRow: {
        flexDirection: "row",
        gap: 10,
    },
    imageEditOverlay: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#E4002B",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
    },
    filterButtonActive: {
        backgroundColor: "#E4002B",
        borderColor: "#E4002B",
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    filterButtonTextActive: {
        color: "#fff",
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
        color: "#1a1a1a",
        textAlign: "center",
        fontWeight: "600",
        marginBottom: 4,
    },
    summarySubtitle: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
    },
    noDataText: {
        textAlign: "center",
        color: "#666",
        fontSize: 14,
        paddingVertical: 40,
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
