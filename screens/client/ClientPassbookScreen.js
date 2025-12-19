import React, {
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
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

const API_BASE_URL = "https://srv1168036.hstgr.cloud/api";
const PASSBOOK_API =
    "https://deployed-site-o2d3.onrender.com/api/budgets/passbook";

const ClientPassbookScreen = () => {
    // ---- API DATA STATE ----
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [allRetailers, setAllRetailers] = useState([]);
    const [passbookData, setPassbookData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ---- FILTER STATE ----
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedRetailers, setSelectedRetailers] = useState([]);

    // ---- REFS FOR STABLE STATE ACCESS ----
    const selectedStatesRef = useRef([]);
    const selectedCampaignsRef = useRef([]);
    const selectedRetailersRef = useRef([]);

    // Update refs whenever state changes
    useEffect(() => {
        selectedStatesRef.current = selectedStates;
    }, [selectedStates]);

    useEffect(() => {
        selectedCampaignsRef.current = selectedCampaigns;
    }, [selectedCampaigns]);

    useEffect(() => {
        selectedRetailersRef.current = selectedRetailers;
    }, [selectedRetailers]);

    // ---- DROPDOWN ITEMS STATE ----
    const [stateItems, setStateItems] = useState([]);
    const [campaignItems, setCampaignItems] = useState([]);
    const [retailerItems, setRetailerItems] = useState([]);

    // ---- DROPDOWN OPEN STATES ----
    const [stateOpen, setStateOpen] = useState(false);
    const [campaignOpen, setCampaignOpen] = useState(false);
    const [retailerOpen, setRetailerOpen] = useState(false);

    // ---- FETCH DATA FROM API ----
    useFocusEffect(
        useCallback(() => {
            fetchAllData();
        }, [])
    );

    const fetchAllData = async () => {
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

            // 1️⃣ Fetch Client Campaigns
            const campaignsRes = await fetch(
                `${API_BASE_URL}/client/client/campaigns`,
                { headers }
            );
            const campaignsData = await campaignsRes.json();
            const campaigns = (campaignsData.campaigns || []).filter(
                (c) => c.isActive === true
            );
            console.log(`✅ Loaded ${campaigns.length} campaigns`);

            // 2️⃣ Fetch Retailers
            const retailersRes = await fetch(
                `${API_BASE_URL}/admin/retailers`,
                { headers }
            );
            const retailersData = await retailersRes.json();
            const retailers = retailersData.retailers || [];
            console.log(`✅ Loaded ${retailers.length} retailers`);

            setAllCampaigns(campaigns);
            setAllRetailers(retailers);
        } catch (error) {
            console.error("❌ Fetch error:", error);
            Alert.alert("Error", "Failed to load data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    // ---- COMPUTE STATE OPTIONS ----
    const stateOptions = useMemo(() => {
        const uniqueStates = [
            ...new Set(
                allRetailers
                    .map((r) => r.shopDetails?.shopAddress?.state)
                    .filter(Boolean)
            ),
        ];
        return uniqueStates.map((s) => ({ label: s, value: s }));
    }, [allRetailers]);

    useEffect(() => {
        setStateItems(stateOptions);
    }, [stateOptions]);

    // ---- COMPUTE CAMPAIGN OPTIONS (FILTERED BY STATE) ----
    const campaignOptions = useMemo(() => {
        let filteredCampaigns = [...allCampaigns];

        if (selectedStates.length > 0) {
            const stateValues = selectedStates.map((s) => s.value);
            filteredCampaigns = filteredCampaigns.filter((c) => {
                if (Array.isArray(c.states)) {
                    return c.states.some((state) =>
                        stateValues.includes(state)
                    );
                }
                return stateValues.includes(c.state);
            });
        }

        return filteredCampaigns.map((c) => ({
            label: c.name,
            value: c._id,
        }));
    }, [allCampaigns, selectedStates]);

    useEffect(() => {
        setCampaignItems(campaignOptions);
    }, [campaignOptions]);

    // ---- COMPUTE RETAILER OPTIONS (FILTERED BY STATE & CAMPAIGN) ----
    const retailerOptions = useMemo(() => {
        let filteredRetailers = [...allRetailers];

        if (selectedStates.length > 0) {
            const stateValues = selectedStates.map((s) => s.value);
            filteredRetailers = filteredRetailers.filter((r) =>
                stateValues.includes(r.shopDetails?.shopAddress?.state)
            );
        }

        if (selectedCampaigns.length > 0) {
            const campaignIds = selectedCampaigns.map((c) => c.value);
            filteredRetailers = filteredRetailers.filter((r) => {
                const assignedToCampaign =
                    Array.isArray(r.assignedCampaigns) &&
                    r.assignedCampaigns.some((ac) =>
                        campaignIds.includes(
                            typeof ac === "string" ? ac : ac._id
                        )
                    );
                return assignedToCampaign;
            });
        }

        return filteredRetailers.map((r) => ({
            label: `${r.uniqueId} - ${r.shopDetails?.shopName || "N/A"}`,
            value: r.uniqueId,
        }));
    }, [allRetailers, selectedStates, selectedCampaigns]);

    useEffect(() => {
        setRetailerItems(retailerOptions);
    }, [retailerOptions]);

    // ---- FETCH PASSBOOK DATA WHEN FILTERS CHANGE ----
    const fetchPassbookData = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const stateValues = selectedStates.map((s) => s.value);

            let retailersToFetch = allRetailers.filter((r) =>
                stateValues.includes(r.shopDetails?.shopAddress?.state)
            );

            if (selectedRetailers.length > 0) {
                const retailerCodes = selectedRetailers.map((r) => r.value);
                retailersToFetch = retailersToFetch.filter((r) =>
                    retailerCodes.includes(r.uniqueId)
                );
            }

            const allPassbookData = [];

            console.log(
                `📞 Fetching passbook for ${retailersToFetch.length} retailers...`
            );

            for (const retailer of retailersToFetch) {
                const response = await fetch(
                    `${PASSBOOK_API}?retailerId=${retailer._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.length > 0) {
                        allPassbookData.push(...data.data);
                    }
                }
            }

            const clientCampaignIds = allCampaigns.map((c) => c._id);
            const campaignIds = selectedCampaigns.map((c) => c.value);
            const flattenedData = [];

            allPassbookData.forEach((budgetRecord) => {
                if (!stateValues.includes(budgetRecord.state)) return;

                budgetRecord.campaigns.forEach((campaign) => {
                    const campaignIdStr =
                        campaign.campaignId._id || campaign.campaignId;

                    if (!clientCampaignIds.includes(campaignIdStr)) return;

                    if (
                        selectedCampaigns.length === 0 ||
                        campaignIds.includes(campaignIdStr)
                    ) {
                        flattenedData.push({
                            outletCode: budgetRecord.outletCode,
                            shopName: budgetRecord.shopName,
                            state: budgetRecord.state,
                            campaignName: campaign.campaignName,
                            campaignId: campaignIdStr,
                            tca: campaign.tca,
                            cPaid: campaign.cPaid,
                            cPending: campaign.cPending,
                        });
                    }
                });
            });

            console.log(`✅ Found ${flattenedData.length} passbook records`);
            setPassbookData(flattenedData);
        } catch (error) {
            console.error("❌ Error fetching passbook:", error);
            Alert.alert("Error", "Failed to fetch passbook data");
        }
    }, [
        selectedStates,
        selectedCampaigns,
        selectedRetailers,
        allCampaigns,
        allRetailers,
    ]);

    useEffect(() => {
        if (
            selectedStates.length > 0 &&
            allCampaigns.length > 0 &&
            allRetailers.length > 0
        ) {
            fetchPassbookData();
        } else {
            setPassbookData([]);
        }
    }, [
        selectedStates,
        selectedCampaigns,
        selectedRetailers,
        fetchPassbookData,
    ]);

    // ---- CALCULATE SUMMARY ----
    const summary = useMemo(() => {
        const totalAmount = passbookData.reduce(
            (sum, p) => sum + (p.tca || 0),
            0
        );
        const totalPaid = passbookData.reduce(
            (sum, p) => sum + (p.cPaid || 0),
            0
        );
        const totalPending = passbookData.reduce(
            (sum, p) => sum + (p.cPending || 0),
            0
        );

        return {
            totalAmount,
            totalPaid,
            totalPending,
        };
    }, [passbookData]);

    // ---- HANDLE FILTER CHANGES ----
    const handleStateChange = (callback) => {
        const currentValues = selectedStatesRef.current.map((s) => s.value);
        const newValues =
            typeof callback === "function" ? callback(currentValues) : callback;

        let newState = [];
        if (Array.isArray(newValues) && newValues.length > 0) {
            newState = stateItems.filter((item) =>
                newValues.includes(item.value)
            );
        }

        setSelectedStates(newState);
        if (
            JSON.stringify(currentValues.sort()) !==
            JSON.stringify(newValues.sort())
        ) {
            setSelectedCampaigns([]);
            setSelectedRetailers([]);
        }
    };

    const handleCampaignChange = (callback) => {
        const currentValues = selectedCampaignsRef.current.map((c) => c.value);
        const newValues =
            typeof callback === "function" ? callback(currentValues) : callback;

        let newCampaigns = [];
        if (Array.isArray(newValues) && newValues.length > 0) {
            newCampaigns = campaignItems.filter((item) =>
                newValues.includes(item.value)
            );
        }

        setSelectedCampaigns(newCampaigns);
        if (
            JSON.stringify(currentValues.sort()) !==
            JSON.stringify(newValues.sort())
        ) {
            setSelectedRetailers([]);
        }
    };

    const handleRetailerChange = (callback) => {
        const currentValues = selectedRetailersRef.current.map((r) => r.value);
        const newValues =
            typeof callback === "function" ? callback(currentValues) : callback;

        let newRetailers = [];
        if (Array.isArray(newValues) && newValues.length > 0) {
            newRetailers = retailerItems.filter((item) =>
                newValues.includes(item.value)
            );
        }

        setSelectedRetailers(newRetailers);
    };

    // ---- CLEAR FILTERS ----
    const handleClearFilters = () => {
        setSelectedStates([]);
        setSelectedCampaigns([]);
        setSelectedRetailers([]);
        setPassbookData([]);
    };

    if (loading) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <Header showBackButton={false} />
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
                <View style={styles.headingContainer}>
                    <Text style={styles.headingText}>Client Passbook</Text>
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <Text style={styles.filterTitle}>Filter Options</Text>

                    {/* State Filter - Required */}
                    <View style={{ zIndex: 9000, marginBottom: 10 }}>
                        <SearchableDropdown
                            label="State *"
                            placeholder="Select States"
                            open={stateOpen}
                            value={selectedStates.map((s) => s.value)}
                            items={stateItems}
                            setOpen={setStateOpen}
                            setValue={handleStateChange}
                            setItems={setStateItems}
                            searchable={true}
                            multiple={true}
                            zIndex={9000}
                        />
                    </View>

                    {/* Campaign Filter - Optional */}
                    <View style={{ zIndex: 8000, marginBottom: 10 }}>
                        <SearchableDropdown
                            label="Campaign (Optional)"
                            placeholder="All Campaigns"
                            open={campaignOpen}
                            value={selectedCampaigns.map((c) => c.value)}
                            items={campaignItems}
                            setOpen={setCampaignOpen}
                            setValue={handleCampaignChange}
                            setItems={setCampaignItems}
                            searchable={true}
                            multiple={true}
                            zIndex={8000}
                        />
                    </View>

                    {/* Retailer Filter - Optional */}
                    <View style={{ zIndex: 7000, marginBottom: 10 }}>
                        <SearchableDropdown
                            label="Retailer (Optional)"
                            placeholder="All Retailers"
                            open={retailerOpen}
                            value={selectedRetailers.map((r) => r.value)}
                            items={retailerItems}
                            setOpen={setRetailerOpen}
                            setValue={handleRetailerChange}
                            setItems={setRetailerItems}
                            searchable={true}
                            multiple={true}
                            zIndex={7000}
                        />
                    </View>

                    {(selectedStates.length > 0 ||
                        selectedCampaigns.length > 0 ||
                        selectedRetailers.length > 0) && (
                        <Text
                            style={styles.clearButton}
                            onPress={handleClearFilters}
                        >
                            Clear All Filters
                        </Text>
                    )}
                </View>

                {/* Summary Cards */}
                {passbookData.length > 0 && (
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
                            <Text style={styles.summaryLabel}>
                                Total Amount (TCA)
                            </Text>
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
                                ₹{summary.totalPending.toLocaleString()}
                            </Text>
                            <Text style={styles.summaryLabel}>Pending</Text>
                        </View>
                    </View>
                )}

                {/* Records List */}
                <View style={styles.listContainer}>
                    {selectedStates.length === 0 ? (
                        <View style={styles.noTransactions}>
                            <Ionicons
                                name="filter-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.noTransactionsText}>
                                Selection Required
                            </Text>
                            <Text style={styles.noTransactionsSubtext}>
                                Please select at least one state to view
                                passbook data
                            </Text>
                        </View>
                    ) : passbookData.length === 0 ? (
                        <View style={styles.noTransactions}>
                            <Ionicons
                                name="receipt-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.noTransactionsText}>
                                No records found
                            </Text>
                            <Text style={styles.noTransactionsSubtext}>
                                Try adjusting your filters
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.recordsCount}>
                                Passbook Records ({passbookData.length})
                            </Text>
                            {passbookData.map((record, index) => (
                                <View
                                    key={`${record.outletCode}-${record.campaignId}-${index}`}
                                    style={styles.transactionCard}
                                >
                                    <View style={styles.transactionHeader}>
                                        <Text style={styles.outletText}>
                                            {record.shopName}
                                        </Text>
                                        <Text style={styles.stateText}>
                                            {record.state}
                                        </Text>
                                    </View>

                                    <Text style={styles.campaignText}>
                                        Campaign: {record.campaignName}
                                    </Text>

                                    <View style={styles.amountRow}>
                                        <View style={styles.amountColumn}>
                                            <Text style={styles.amountLabel}>
                                                Total Amount (TCA)
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.amountValue,
                                                    { color: "#007AFF" },
                                                ]}
                                            >
                                                ₹{record.tca?.toLocaleString()}
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
                                                {record.cPaid?.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={styles.amountColumn}>
                                            <Text style={styles.amountLabel}>
                                                Pending
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.amountValue,
                                                    { color: "#FFA500" },
                                                ]}
                                            >
                                                ₹
                                                {record.cPending?.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </>
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
    filterTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    clearButton: {
        fontSize: 13,
        color: "#E4002B",
        textDecorationLine: "underline",
        marginTop: 10,
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
        fontSize: 11,
        color: "#666",
    },
    listContainer: {
        marginTop: 15,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    recordsCount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
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
    stateText: {
        fontSize: 12,
        color: "#666",
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
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
        textAlign: "center",
        paddingHorizontal: 20,
    },
});

export default ClientPassbookScreen;
