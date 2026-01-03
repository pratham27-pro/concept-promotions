// screens/client/ClientOutletsScreen.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import { API_BASE_URL } from "../../url/base";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const regionStates = {
    North: [
        "Jammu and Kashmir",
        "Ladakh",
        "Himachal Pradesh",
        "Punjab",
        "Haryana",
        "Uttarakhand",
        "Uttar Pradesh",
        "Delhi",
        "Chandigarh",
    ],
    South: [
        "Andhra Pradesh",
        "Karnataka",
        "Kerala",
        "Tamil Nadu",
        "Telangana",
        "Puducherry",
        "Lakshadweep",
    ],
    East: [
        "Bihar",
        "Jharkhand",
        "Odisha",
        "West Bengal",
        "Sikkim",
        "Andaman and Nicobar Islands",
        "Arunachal Pradesh",
        "Assam",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Tripura",
    ],
    West: [
        "Rajasthan",
        "Gujarat",
        "Maharashtra",
        "Madhya Pradesh",
        "Goa",
        "Chhattisgarh",
        "Dadra and Nagar Haveli and Daman and Diu",
    ],
};

const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(228, 0, 43, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForLabels: {
        fontSize: 10,
    },
};

const ClientOutletsScreen = ({ navigation }) => {
    // API Data States
    const [campaigns, setCampaigns] = useState([]);
    const [payments, setPayments] = useState([]);
    const [reportedOutlets, setReportedOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter States
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchText, setSearchText] = useState("");

    // Dropdown open states
    const [campaignOpen, setCampaignOpen] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);

    const paymentOptions = [
        { label: "Pending", value: "Pending" },
        { label: "Partially Paid", value: "Partially Paid" },
        { label: "Completed", value: "Completed" },
    ];

    useFocusEffect(
        useCallback(() => {
            fetchOutletsData();
        }, [])
    );

    const fetchOutletsData = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
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
            console.error("❌ Outlets fetch error:", error);
            Alert.alert("Error", "Failed to load outlets data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOutletsData();
    };

    // Dynamic dropdown options
    const campaignOptions = useMemo(() => {
        return campaigns.map((c) => ({
            label: c.name,
            value: c._id,
        }));
    }, [campaigns]);

    const regionOptions = useMemo(() => {
        const uniqueRegions = new Set();
        campaigns.forEach((c) => {
            c.regions?.forEach((r) => uniqueRegions.add(r));
        });
        return Array.from(uniqueRegions).map((r) => ({
            label: r,
            value: r.toLowerCase(),
        }));
    }, [campaigns]);

    const allocatedStates = useMemo(() => {
        const uniqueStates = new Set();
        campaigns.forEach((c) => {
            c.states?.forEach((s) => uniqueStates.add(s));
        });
        return Array.from(uniqueStates);
    }, [campaigns]);

    const stateOptions = useMemo(() => {
        if (selectedRegions.length === 0) {
            return allocatedStates.map((state) => ({
                label: state,
                value: state.toLowerCase().replace(/\s+/g, "-"),
            }));
        }

        const filteredStates = selectedRegions.flatMap((region) => {
            return regionStates[region.label] || [];
        });

        const validStates = filteredStates.filter((state) =>
            allocatedStates.includes(state)
        );

        return validStates.map((state) => ({
            label: state,
            value: state.toLowerCase().replace(/\s+/g, "-"),
        }));
    }, [selectedRegions, allocatedStates]);

    const handleRegionChange = (items) => {
        setSelectedRegions(items);
        if (items.length > 0) {
            const validStateLabels = items.flatMap(
                (region) => regionStates[region.label] || []
            );
            const filteredStates = selectedStates.filter(
                (state) =>
                    validStateLabels.some(
                        (validState) =>
                            validState.toLowerCase().replace(/\s+/g, "-") ===
                            state.value
                    ) && allocatedStates.includes(state.label)
            );
            setSelectedStates(filteredStates);
        }
    };

    // Build complete outlets list
    const allOutlets = useMemo(() => {
        const outletsMap = new Map();

        campaigns.forEach((campaign) => {
            campaign.retailers?.forEach((retailer) => {
                const retailerId = retailer.retailerId;

                if (!outletsMap.has(retailerId)) {
                    const paymentInfo = payments.find(
                        (p) => p.retailerId === retailerId
                    );
                    const retailerEmployees =
                        campaign.retailerWiseEmployees?.find(
                            (rwe) => rwe.retailerId === retailerId
                        );

                    outletsMap.set(retailerId, {
                        retailerId: retailerId,
                        retailerName: retailer.retailerName,
                        retailerCode: retailer.retailerCode,
                        shopName: retailer.shopName,
                        city: retailer.city,
                        state: retailer.state,
                        contactNo: retailer.contactNo,
                        paymentStatus: paymentInfo?.paymentStatus || "Pending",
                        employees: retailerEmployees?.employees || [],
                        campaignId: campaign._id,
                        campaignName: campaign.name,
                        regions: campaign.regions,
                        states: campaign.states,
                    });
                }
            });
        });

        return Array.from(outletsMap.values());
    }, [campaigns, payments]);

    // Calculate statistics and filtered outlets
    const { statistics, filteredOutlets } = useMemo(() => {
        let filteredCampaigns = campaigns;

        if (selectedCampaigns.length > 0) {
            const selectedIds = selectedCampaigns.map((c) => c.value);
            filteredCampaigns = filteredCampaigns.filter((c) =>
                selectedIds.includes(c._id)
            );
        }

        if (selectedRegions.length > 0) {
            const selectedRegionLabels = selectedRegions.map((r) => r.label);
            filteredCampaigns = filteredCampaigns.filter((c) =>
                c.regions?.some((r) => selectedRegionLabels.includes(r))
            );
        }

        if (selectedStates.length > 0) {
            const selectedStateLabels = selectedStates.map((s) => s.label);
            filteredCampaigns = filteredCampaigns.filter((c) =>
                c.states?.some((s) => selectedStateLabels.includes(s))
            );
        }

        const filteredCampaignIds = filteredCampaigns.map((c) => c._id);

        const outletsEnrolled = filteredCampaigns.reduce(
            (sum, c) => sum + (c.totalOutletsAssigned || 0),
            0
        );

        const outletsActivated = filteredCampaigns.reduce(
            (sum, c) => sum + (c.totalOutletsAccepted || 0),
            0
        );

        const filteredRetailerIds = new Set();
        filteredCampaigns.forEach((campaign) => {
            campaign.retailers?.forEach((retailer) => {
                if (retailer.retailerId) {
                    filteredRetailerIds.add(retailer.retailerId);
                }
            });
        });

        const outletsReported =
            reportedOutlets?.filter((outlet) =>
                filteredRetailerIds.has(outlet.retailerId)
            ).length || 0;

        let filteredPayments = payments.filter((p) =>
            filteredCampaignIds.includes(p.campaignId)
        );

        if (selectedPayment) {
            filteredPayments = filteredPayments.filter(
                (p) => p.paymentStatus === selectedPayment.value
            );
        }

        const outletsPaid = filteredPayments.filter(
            (p) => p.paymentStatus === "Completed"
        ).length;

        // Filter outlets table
        let outletsArray = allOutlets;

        if (selectedCampaigns.length > 0) {
            const selectedIds = selectedCampaigns.map((c) => c.value);
            outletsArray = outletsArray.filter((outlet) =>
                selectedIds.includes(outlet.campaignId)
            );
        }

        if (selectedRegions.length > 0) {
            const selectedRegionLabels = selectedRegions.map((r) => r.label);
            outletsArray = outletsArray.filter((outlet) =>
                outlet.regions?.some((r) => selectedRegionLabels.includes(r))
            );
        }

        if (selectedStates.length > 0) {
            const selectedStateLabels = selectedStates.map((s) => s.label);
            outletsArray = outletsArray.filter((outlet) =>
                outlet.states?.some((s) => selectedStateLabels.includes(s))
            );
        }

        if (selectedPayment) {
            outletsArray = outletsArray.filter(
                (outlet) => outlet.paymentStatus === selectedPayment.value
            );
        }

        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            outletsArray = outletsArray.filter(
                (outlet) =>
                    outlet.retailerName?.toLowerCase().includes(searchLower) ||
                    outlet.retailerCode?.toLowerCase().includes(searchLower) ||
                    outlet.shopName?.toLowerCase().includes(searchLower) ||
                    outlet.city?.toLowerCase().includes(searchLower)
            );
        }

        return {
            statistics: {
                outletsEnrolled,
                outletsActivated,
                outletsReported,
                outletsPaid,
            },
            filteredOutlets: outletsArray,
        };
    }, [
        allOutlets,
        campaigns,
        payments,
        reportedOutlets,
        selectedCampaigns,
        selectedRegions,
        selectedStates,
        selectedPayment,
        searchText,
    ]);

    // Chart data for React Native Chart Kit
    const campaignChartData = useMemo(() => {
        const topCampaigns = campaigns.slice(0, 5);
        return {
            labels: topCampaigns.map((c) => c.name.substring(0, 8)),
            datasets: [
                {
                    data: topCampaigns.map((c) => c.totalOutletsAssigned || 0),
                    color: (opacity = 1) => `rgba(228, 0, 43, ${opacity})`,
                },
                {
                    data: topCampaigns.map((c) => c.totalOutletsAccepted || 0),
                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                },
            ],
            legend: ["Enrolled", "Activated"],
        };
    }, [campaigns]);

    const paymentPieData = useMemo(() => {
        return [
            {
                name: "Completed",
                population: payments.filter(
                    (p) => p.paymentStatus === "Completed"
                ).length,
                color: "#22c55e",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
            {
                name: "Partial",
                population: payments.filter(
                    (p) => p.paymentStatus === "Partially Paid"
                ).length,
                color: "#fbbf24",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
            {
                name: "Pending",
                population: payments.filter(
                    (p) => p.paymentStatus === "Pending"
                ).length,
                color: "#ef4444",
                legendFontColor: "#333",
                legendFontSize: 12,
            },
        ];
    }, [payments]);

    const stateChartData = useMemo(() => {
        const stateCounts = {};
        allOutlets.forEach((outlet) => {
            if (outlet.state) {
                stateCounts[outlet.state] =
                    (stateCounts[outlet.state] || 0) + 1;
            }
        });
        const topStates = Object.entries(stateCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        return {
            labels: topStates.map(([state]) => state.substring(0, 8)),
            datasets: [
                {
                    data: topStates.map(([, count]) => count),
                },
            ],
        };
    }, [allOutlets]);

    const regionPieData = useMemo(() => {
        const regionCounts = {};
        const colors = ["#E4002B", "#3b82f6", "#22c55e", "#fbbf24"];

        campaigns.forEach((campaign) => {
            campaign.regions?.forEach((region) => {
                const outletCount = campaign.totalOutletsAssigned || 0;
                regionCounts[region] =
                    (regionCounts[region] || 0) + outletCount;
            });
        });

        return Object.entries(regionCounts).map(([region, count], index) => ({
            name: region,
            population: count,
            color: colors[index % colors.length],
            legendFontColor: "#333",
            legendFontSize: 12,
        }));
    }, [campaigns]);

    if (loading) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <Header
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()} // Use local navigation
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E4002B" />
                    <Text style={styles.loadingText}>Loading outlets...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header
                showBackButton={true}
                onBackPress={() => navigation.goBack()} // Use local navigation
            />

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
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Outlets Overview</Text>
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <View style={styles.filterRow}>
                        <View style={{ flex: 1, zIndex: 9000 }}>
                            <SearchableDropdown
                                label="Campaign"
                                placeholder="Select Campaign"
                                open={campaignOpen}
                                value={selectedCampaigns}
                                items={campaignOptions}
                                setOpen={setCampaignOpen}
                                setValue={setSelectedCampaigns}
                                searchable={true}
                                multiple={true}
                                zIndex={9000}
                            />
                        </View>

                        <View style={{ flex: 1, zIndex: 8000 }}>
                            <SearchableDropdown
                                label="Region"
                                placeholder="Select Region"
                                open={regionOpen}
                                value={selectedRegions}
                                items={regionOptions}
                                setOpen={setRegionOpen}
                                setValue={handleRegionChange}
                                searchable={true}
                                multiple={true}
                                zIndex={8000}
                            />
                        </View>
                    </View>

                    <View style={styles.filterRow}>
                        <View style={{ flex: 1, zIndex: 7000 }}>
                            <SearchableDropdown
                                label="State"
                                placeholder="Select State"
                                open={stateOpen}
                                value={selectedStates}
                                items={stateOptions}
                                setOpen={setStateOpen}
                                setValue={setSelectedStates}
                                searchable={true}
                                multiple={true}
                                zIndex={7000}
                            />
                        </View>

                        <View style={{ flex: 1, zIndex: 6000 }}>
                            <SearchableDropdown
                                label="Payment Status"
                                placeholder="Select Payment"
                                open={paymentOpen}
                                value={selectedPayment}
                                items={paymentOptions}
                                setOpen={setPaymentOpen}
                                setValue={setSelectedPayment}
                                searchable={true}
                                multiple={false}
                                zIndex={6000}
                            />
                        </View>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Ionicons
                            name="search"
                            size={20}
                            color="#999"
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or outlet code..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="storefront" size={28} color="#E4002B" />
                        <Text style={styles.statValue}>
                            {statistics.outletsEnrolled}
                        </Text>
                        <Text style={styles.statLabel}>Enrolled</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons
                            name="checkmark-circle"
                            size={28}
                            color="#28a745"
                        />
                        <Text style={styles.statValue}>
                            {statistics.outletsActivated}
                        </Text>
                        <Text style={styles.statLabel}>Activated</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="clipboard" size={28} color="#007AFF" />
                        <Text style={styles.statValue}>
                            {statistics.outletsReported}
                        </Text>
                        <Text style={styles.statLabel}>Reported</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="cash" size={28} color="#FFA500" />
                        <Text style={styles.statValue}>
                            {statistics.outletsPaid}
                        </Text>
                        <Text style={styles.statLabel}>Paid</Text>
                    </View>
                </View>

                {/* Charts Section */}
                <View style={styles.chartsSection}>
                    {/* Campaign-wise Outlets Bar Chart */}
                    {campaigns.length > 0 && (
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>
                                Campaign-wise Outlets
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                <BarChart
                                    data={campaignChartData}
                                    width={Math.max(
                                        SCREEN_WIDTH - 60,
                                        campaigns.slice(0, 5).length * 80
                                    )}
                                    height={220}
                                    chartConfig={chartConfig}
                                    style={styles.chart}
                                    yAxisLabel=""
                                    yAxisSuffix=""
                                    fromZero
                                    showBarTops={false}
                                />
                            </ScrollView>
                        </View>
                    )}

                    {/* Payment Status Pie Chart */}
                    {payments.length > 0 && (
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>
                                Payment Status
                            </Text>
                            <PieChart
                                data={paymentPieData}
                                width={SCREEN_WIDTH - 60}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                style={styles.chart}
                            />
                        </View>
                    )}

                    {/* State-wise Distribution Bar Chart */}
                    {allOutlets.length > 0 && (
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>
                                State-wise Distribution
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                <BarChart
                                    data={stateChartData}
                                    width={Math.max(SCREEN_WIDTH - 60, 400)}
                                    height={220}
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) =>
                                            `rgba(59, 130, 246, ${opacity})`,
                                    }}
                                    style={styles.chart}
                                    yAxisLabel=""
                                    yAxisSuffix=""
                                    fromZero
                                    showBarTops={false}
                                />
                            </ScrollView>
                        </View>
                    )}

                    {/* Region-wise Distribution Pie Chart */}
                    {regionPieData.length > 0 && (
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>
                                Region-wise Distribution
                            </Text>
                            <PieChart
                                data={regionPieData}
                                width={SCREEN_WIDTH - 60}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                style={styles.chart}
                            />
                        </View>
                    )}
                </View>

                {/* Outlets Table */}
                <View style={styles.tableContainer}>
                    <Text style={styles.tableTitle}>
                        Outlets List ({filteredOutlets.length})
                    </Text>
                    {filteredOutlets.length === 0 ? (
                        <View style={styles.noData}>
                            <Ionicons
                                name="folder-open-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.noDataText}>
                                No outlets found
                            </Text>
                        </View>
                    ) : (
                        filteredOutlets.map((outlet, index) => (
                            <View
                                key={outlet.retailerId}
                                style={styles.outletCard}
                            >
                                <View style={styles.outletHeader}>
                                    <Text style={styles.outletNumber}>
                                        #{index + 1}
                                    </Text>
                                    <View
                                        style={[
                                            styles.paymentBadge,
                                            {
                                                backgroundColor:
                                                    outlet.paymentStatus ===
                                                    "Completed"
                                                        ? "#d4edda"
                                                        : outlet.paymentStatus ===
                                                          "Partially Paid"
                                                        ? "#fff3cd"
                                                        : "#f8d7da",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.paymentBadgeText,
                                                {
                                                    color:
                                                        outlet.paymentStatus ===
                                                        "Completed"
                                                            ? "#28a745"
                                                            : outlet.paymentStatus ===
                                                              "Partially Paid"
                                                            ? "#FFA500"
                                                            : "#dc3545",
                                                },
                                            ]}
                                        >
                                            {outlet.paymentStatus}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.outletInfo}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>
                                            Name:
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            {outlet.retailerName || "N/A"}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>
                                            Code:
                                        </Text>
                                        <Text style={styles.codeValue}>
                                            {outlet.retailerCode || "N/A"}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>
                                            Shop:
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            {outlet.shopName || "N/A"}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>
                                            Location:
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            {outlet.city}, {outlet.state}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>
                                            Contact:
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            {outlet.contactNo || "N/A"}
                                        </Text>
                                    </View>

                                    {outlet.employees &&
                                        outlet.employees.length > 0 && (
                                            <View
                                                style={styles.employeeSection}
                                            >
                                                <Text
                                                    style={styles.employeeLabel}
                                                >
                                                    Assigned Employees:
                                                </Text>
                                                {outlet.employees.map(
                                                    (emp, idx) => (
                                                        <Text
                                                            key={idx}
                                                            style={
                                                                styles.employeeName
                                                            }
                                                        >
                                                            • {emp.employeeName}{" "}
                                                            ({emp.employeeCode})
                                                        </Text>
                                                    )
                                                )}
                                            </View>
                                        )}
                                </View>
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
    headingContainer: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 10,
        marginHorizontal: 16,
        borderRadius: 12,
    },
    headingText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E4002B",
    },
    filtersContainer: {
        marginTop: 15,
        marginHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
    },
    filterRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginTop: 5,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        color: "#333",
    },
    statsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: 16,
        marginTop: 15,
        justifyContent: "space-between",
        gap: 12,
    },
    statCard: {
        flexBasis: "48%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    statValue: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    statLabel: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
    },
    chartsSection: {
        marginTop: 20,
        marginHorizontal: 16,
        gap: 15,
    },
    chartCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    tableContainer: {
        marginTop: 20,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    outletCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    outletHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    outletNumber: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    paymentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paymentBadgeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    outletInfo: {
        gap: 6,
    },
    infoRow: {
        flexDirection: "row",
    },
    infoLabel: {
        fontSize: 13,
        color: "#666",
        width: 80,
    },
    infoValue: {
        fontSize: 13,
        color: "#333",
        flex: 1,
        fontWeight: "500",
    },
    codeValue: {
        fontSize: 13,
        color: "#333",
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    employeeSection: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    employeeLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
        marginBottom: 4,
    },
    employeeName: {
        fontSize: 12,
        color: "#333",
        marginLeft: 8,
        marginTop: 2,
    },
    noData: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    noDataText: {
        fontSize: 16,
        color: "#999",
        marginTop: 15,
    },
});

export default ClientOutletsScreen;
