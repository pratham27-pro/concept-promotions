import React, { useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
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

import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const ClientPassbookScreen = () => {
    // ---- API DATA STATE ----
    const [campaigns, setCampaigns] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ---- FILTER STATE ----
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // ---- DROPDOWN OPEN STATES ----
    const [campaignOpen, setCampaignOpen] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [outletOpen, setOutletOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);

    // ---- STATIC FILTER OPTIONS ----
    const regionOptions = [
        { label: "North", value: "north" },
        { label: "South", value: "south" },
        { label: "East", value: "east" },
        { label: "West", value: "west" },
    ];

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

    const dateOptions = [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 Days", value: "last7days" },
        { label: "Last 30 Days", value: "last30days" },
        { label: "This Month", value: "thisMonth" },
        { label: "Last Month", value: "lastMonth" },
        { label: "Custom Range", value: "custom" },
    ];

    const paymentOptions = [
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
    ];

    // ---- FETCH DATA FROM API ----
    useFocusEffect(
        useCallback(() => {
            fetchPassbookData();
        }, [])
    );

    const fetchPassbookData = async () => {
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

            console.log("📤 Fetching passbook data...");

            // Fetch campaigns and payments in parallel
            const [campaignsRes, paymentsRes] = await Promise.allSettled([
                fetch(`${API_BASE_URL}/client/client/campaigns`, { headers }),
                fetch(`${API_BASE_URL}/client/client/payments`, { headers }),
            ]);

            // Process Campaigns
            if (campaignsRes.status === "fulfilled" && campaignsRes.value.ok) {
                const campData = await campaignsRes.value.json();
                console.log(
                    "✅ Campaigns loaded:",
                    campData.campaigns?.length || 0
                );
                setCampaigns(campData.campaigns || []);
            } else {
                console.error("❌ Campaigns fetch failed");
                setCampaigns([]);
            }

            // Process Payments
            if (paymentsRes.status === "fulfilled" && paymentsRes.value.ok) {
                const payData = await paymentsRes.value.json();
                console.log(
                    "✅ Payments loaded:",
                    payData.payments?.length || 0
                );
                setPayments(payData.payments || []);
            } else {
                console.error("❌ Payments fetch failed");
                setPayments([]);
            }

            console.log("✅ Passbook data loaded");
        } catch (error) {
            console.error("❌ Passbook fetch error:", error);
            Alert.alert("Error", "Failed to load passbook data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPassbookData();
    };

    // ---- DYNAMIC OPTIONS FROM API DATA ----
    const campaignOptions = useMemo(() => {
        return campaigns.map((c) => ({
            label: c.name || c.campaignName,
            value: c._id,
        }));
    }, [campaigns]);

    const outletOptions = useMemo(() => {
        const uniqueOutlets = [
            ...new Set(
                payments.map(
                    (p) => p.retailerShopName || p.retailerName || "Unknown"
                )
            ),
        ];
        return uniqueOutlets.map((name) => ({
            label: name,
            value: name,
        }));
    }, [payments]);

    const stateOptions = useMemo(() => {
        if (!selectedRegions || selectedRegions.length === 0) {
            const allStates = Object.values(regionStates).flat();
            return allStates.map((state) => ({
                label: state,
                value: state.toLowerCase().replace(/\s+/g, "-"),
            }));
        }

        const filteredStates = selectedRegions.flatMap((region) => {
            const regionKey = region.label;
            return regionStates[regionKey] || [];
        });

        return filteredStates.map((state) => ({
            label: state,
            value: state.toLowerCase().replace(/\s+/g, "-"),
        }));
    }, [selectedRegions]);

    // ---- FILTER HANDLERS ----
    const handleRegionChange = (items) => {
        setSelectedRegions(items);
        if (!items || items.length === 0) {
            setSelectedStates([]);
            return;
        }

        const validStateLabels = items.flatMap(
            (region) => regionStates[region.label] || []
        );
        const filteredStates = selectedStates.filter((state) =>
            validStateLabels.some(
                (s) => s.toLowerCase().replace(/\s+/g, "-") === state.value
            )
        );
        setSelectedStates(filteredStates);
    };

    const handleDateChange = (item) => {
        setSelectedDateRange(item);
        if (item?.value === "custom") {
            setShowCustomDate(true);
        } else {
            setShowCustomDate(false);
            setFromDate("");
            setToDate("");
        }
    };

    // ---- FILTERED PAYMENTS ----
    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            // Filter by outlet
            const shopName = payment.retailerShopName || payment.retailerName;
            if (selectedOutlet && shopName !== selectedOutlet.value) {
                return false;
            }

            // Filter by campaign
            if (
                selectedCampaigns.length > 0 &&
                !selectedCampaigns.some((c) => c.value === payment.campaignId)
            ) {
                return false;
            }

            // Filter by payment status
            if (
                selectedPayment &&
                payment.paymentStatus !== selectedPayment.value
            ) {
                return false;
            }

            // TODO: Add date range filtering logic here

            return true;
        });
    }, [payments, selectedOutlet, selectedCampaigns, selectedPayment]);

    // ---- CALCULATE SUMMARY ----
    const summary = useMemo(() => {
        const totalAmount = filteredPayments.reduce(
            (sum, p) => sum + (p.totalAmount || 0),
            0
        );
        const totalPaid = filteredPayments.reduce(
            (sum, p) => sum + (p.amountPaid || 0),
            0
        );
        const totalRemaining = filteredPayments.reduce(
            (sum, p) => sum + (p.remainingAmount || 0),
            0
        );

        return {
            totalAmount,
            totalPaid,
            totalRemaining,
        };
    }, [filteredPayments]);

    if (loading) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E4002B" />
                    <Text style={styles.loadingText}>Loading passbook...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header />

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
                    <Text style={styles.headingText}>Passbook</Text>
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    {/* Row 1: Campaign, Region, State */}
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
                    </View>

                    {/* Row 2: Payment, Outlet, Date */}
                    <View style={styles.filterRow}>
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

                        <View style={{ flex: 1, zIndex: 5000 }}>
                            <SearchableDropdown
                                label="Outlet"
                                placeholder="Select Outlet"
                                open={outletOpen}
                                value={selectedOutlet}
                                items={outletOptions}
                                setOpen={setOutletOpen}
                                setValue={setSelectedOutlet}
                                searchable={true}
                                multiple={false}
                                zIndex={5000}
                            />
                        </View>

                        <View style={{ flex: 1, zIndex: 4000 }}>
                            <SearchableDropdown
                                label="Date"
                                placeholder="Select Date"
                                open={dateOpen}
                                value={selectedDateRange}
                                items={dateOptions}
                                setOpen={setDateOpen}
                                setValue={handleDateChange}
                                searchable={true}
                                multiple={false}
                                zIndex={4000}
                            />
                        </View>
                    </View>

                    {/* Custom Date Range */}
                    {showCustomDate && (
                        <View style={styles.customDateRow}>
                            <View style={styles.customDateInputWrapper}>
                                <Text style={styles.customDateLabel}>
                                    From Date
                                </Text>
                                <TextInput
                                    style={styles.customDateInput}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#999"
                                    value={fromDate}
                                    onChangeText={setFromDate}
                                />
                            </View>
                            <View style={styles.customDateInputWrapper}>
                                <Text style={styles.customDateLabel}>
                                    To Date
                                </Text>
                                <TextInput
                                    style={styles.customDateInput}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#999"
                                    value={toDate}
                                    onChangeText={setToDate}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Ionicons
                            name="wallet-outline"
                            size={24}
                            color="#007AFF"
                        />
                        <Text style={styles.summaryValue}>
                            ₹{summary.totalAmount.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>Total Amount</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={24}
                            color="#28a745"
                        />
                        <Text style={styles.summaryValue}>
                            ₹{summary.totalPaid.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>Total Paid</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Ionicons
                            name="time-outline"
                            size={24}
                            color="#FFA500"
                        />
                        <Text style={styles.summaryValue}>
                            ₹{summary.totalRemaining.toLocaleString()}
                        </Text>
                        <Text style={styles.summaryLabel}>Remaining</Text>
                    </View>
                </View>

                {/* Payment List */}
                <View style={styles.listContainer}>
                    {filteredPayments.length === 0 ? (
                        <View style={styles.noTransactions}>
                            <Ionicons
                                name="receipt-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.noTransactionsText}>
                                No payment records found
                            </Text>
                            <Text style={styles.noTransactionsSubtext}>
                                Try adjusting your filters
                            </Text>
                        </View>
                    ) : (
                        filteredPayments.map((payment, index) => (
                            <View key={index} style={styles.transactionCard}>
                                <View style={styles.transactionHeader}>
                                    <Text style={styles.outletText}>
                                        {payment.retailerShopName ||
                                            payment.retailerName}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor:
                                                    payment.paymentStatus ===
                                                    "paid"
                                                        ? "#d4edda"
                                                        : payment.paymentStatus ===
                                                          "pending"
                                                        ? "#fff3cd"
                                                        : "#f8d7da",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color:
                                                        payment.paymentStatus ===
                                                        "paid"
                                                            ? "#28a745"
                                                            : payment.paymentStatus ===
                                                              "pending"
                                                            ? "#FFA500"
                                                            : "#dc3545",
                                                },
                                            ]}
                                        >
                                            {payment.paymentStatus?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.campaignText}>
                                    Campaign: {payment.campaignName}
                                </Text>

                                <View style={styles.amountRow}>
                                    <View style={styles.amountColumn}>
                                        <Text style={styles.amountLabel}>
                                            Total Amount
                                        </Text>
                                        <Text
                                            style={[
                                                styles.amountValue,
                                                { color: "#007AFF" },
                                            ]}
                                        >
                                            ₹
                                            {payment.totalAmount?.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.amountColumn}>
                                        <Text style={styles.amountLabel}>
                                            Paid
                                        </Text>
                                        <Text
                                            style={[
                                                styles.amountValue,
                                                { color: "#28a745" },
                                            ]}
                                        >
                                            ₹
                                            {payment.amountPaid?.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.amountColumn}>
                                        <Text style={styles.amountLabel}>
                                            Remaining
                                        </Text>
                                        <Text
                                            style={[
                                                styles.amountValue,
                                                { color: "#dc3545" },
                                            ]}
                                        >
                                            ₹
                                            {payment.remainingAmount?.toLocaleString()}
                                        </Text>
                                    </View>
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
    customDateRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    customDateInputWrapper: {
        flex: 1,
    },
    customDateLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    customDateInput: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        color: "#333",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginHorizontal: 16,
        marginTop: 15,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
    },
    listContainer: {
        marginTop: 15,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    transactionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    outletText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    campaignText: {
        fontSize: 13,
        color: "#666",
        marginBottom: 10,
    },
    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    amountColumn: {
        flex: 1,
    },
    amountLabel: {
        fontSize: 11,
        color: "#777",
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    noTransactions: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    noTransactionsText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#999",
        marginTop: 15,
    },
    noTransactionsSubtext: {
        fontSize: 13,
        color: "#bbb",
        marginTop: 5,
    },
});

export default ClientPassbookScreen;
