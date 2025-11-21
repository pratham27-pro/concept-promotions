// src/screens/client/ClientPassbookScreen.js
import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";

const ClientPassbookScreen = () => {
    // ---- FILTER OPTIONS ----
    const campaignOptions = [
        { label: "Campaign A", value: "campaign1" },
        { label: "Campaign B", value: "campaign2" },
        { label: "Campaign C", value: "campaign3" },
    ];

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

    const outletOptions = [
        { label: "Outlet 101", value: "Outlet 101" },
        { label: "Outlet 102", value: "Outlet 102" },
        { label: "Outlet 103", value: "Outlet 103" },
    ];

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

    // ---- DROPDOWN OPEN STATES (for zIndex stacking) ----
    const [campaignOpen, setCampaignOpen] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [outletOpen, setOutletOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);

    // ---- STATE OPTIONS DERIVED FROM REGIONS ----
    const stateOptions = useMemo(() => {
        if (!selectedRegions || selectedRegions.length === 0) {
            const allStates = Object.values(regionStates).flat();
            return allStates.map((state) => ({
                label: state,
                value: state.toLowerCase().replace(/\s+/g, "-"),
            }));
        }

        const filteredStates = selectedRegions.flatMap((region) => {
            const regionKey = region.label; // "North", "South", etc.
            return regionStates[regionKey] || [];
        });

        return filteredStates.map((state) => ({
            label: state,
            value: state.toLowerCase().replace(/\s+/g, "-"),
        }));
    }, [selectedRegions]);

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

    // ---- PASSBOOK DATA (dummy, like web) ----
    const rows = [
        {
            outlet: "Outlet 101",
            date: "01-Apr-25",
            particulars: "Opening Balance",
            debit: "",
            credit: "",
            balance: "0.00",
            paymentStatus: "paid",
        },
        {
            outlet: "Outlet 101",
            date: "10-Apr-25",
            particulars: "Monte Carlo Campaign",
            debit: "1000",
            credit: "",
            balance: "1000.00",
            paymentStatus: "pending",
        },
        {
            outlet: "Outlet 102",
            date: "11-Apr-25",
            particulars: "ABCD Campaign",
            debit: "",
            credit: "1000",
            balance: "0.00",
            paymentStatus: "paid",
        },
    ];

    // ---- FILTERED DATA ----
    const filteredRows = rows.filter((row) => {
        if (selectedOutlet && row.outlet !== selectedOutlet.value) return false;
        if (selectedPayment && row.paymentStatus !== selectedPayment.value)
            return false;
        // Further campaign/region/state/date filters can be applied here later
        return true;
    });

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
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

                {/* Summary Cards (reuse pattern from retailer/employee) */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <Ionicons
                            name="wallet-outline"
                            size={24}
                            color="#28a745"
                        />
                        <Text style={styles.summaryValue}>₹25,000</Text>
                        <Text style={styles.summaryLabel}>Total Debit</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Ionicons
                            name="card-outline"
                            size={24}
                            color="#007AFF"
                        />
                        <Text style={styles.summaryValue}>₹22,000</Text>
                        <Text style={styles.summaryLabel}>Total Credit</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Ionicons
                            name="cash-outline"
                            size={24}
                            color="#FFA500"
                        />
                        <Text style={styles.summaryValue}>₹3,000</Text>
                        <Text style={styles.summaryLabel}>Net Balance</Text>
                    </View>
                </View>

                {/* Passbook List (instead of HTML table, same card style as retailer) */}
                <View style={styles.listContainer}>
                    {filteredRows.length === 0 ? (
                        <View style={styles.noTransactions}>
                            <Ionicons
                                name="receipt-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.noTransactionsText}>
                                No records found
                            </Text>
                        </View>
                    ) : (
                        filteredRows.map((item, index) => (
                            <View key={index} style={styles.transactionCard}>
                                <View style={styles.transactionHeader}>
                                    <Text style={styles.outletText}>
                                        {item.outlet}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {item.date}
                                    </Text>
                                </View>

                                <Text style={styles.particularsText}>
                                    {item.particulars}
                                </Text>

                                <View style={styles.amountRow}>
                                    <View style={styles.amountColumn}>
                                        <Text style={styles.amountLabel}>
                                            Debit
                                        </Text>
                                        <Text
                                            style={[
                                                styles.amountValue,
                                                { color: "#dc3545" },
                                            ]}
                                        >
                                            {item.debit
                                                ? `₹${item.debit}`
                                                : "-"}
                                        </Text>
                                    </View>
                                    <View style={styles.amountColumn}>
                                        <Text style={styles.amountLabel}>
                                            Credit
                                        </Text>
                                        <Text
                                            style={[
                                                styles.amountValue,
                                                { color: "#28a745" },
                                            ]}
                                        >
                                            {item.credit
                                                ? `₹${item.credit}`
                                                : "-"}
                                        </Text>
                                    </View>
                                    <View style={styles.amountColumn}>
                                        <Text style={styles.amountLabel}>
                                            Balance
                                        </Text>
                                        <Text style={styles.amountValue}>
                                            ₹{item.balance}
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
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    outletText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    dateText: {
        fontSize: 12,
        color: "#666",
    },
    particularsText: {
        fontSize: 13,
        color: "#555",
        marginBottom: 8,
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
    },
    amountValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 2,
    },
    noTransactions: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    noTransactionsText: {
        fontSize: 16,
        color: "#999",
        marginTop: 10,
    },
});

export default ClientPassbookScreen;
