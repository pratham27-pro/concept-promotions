// src/screens/client/ClientReportScreen.js
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GradientButton from "../../components/common/GradientButton";
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";

const ClientReportScreen = () => {
    // ---- OPTIONS ----
    const campaignOptions = [
        { value: "campaign1", label: "Campaign A" },
        { value: "campaign2", label: "Campaign B" },
        { value: "campaign3", label: "Campaign C" },
    ];

    const regionOptions = [
        { value: "north", label: "North" },
        { value: "south", label: "South" },
        { value: "east", label: "East" },
        { value: "west", label: "West" },
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
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "last7days", label: "Last 7 Days" },
        { value: "last30days", label: "Last 30 Days" },
        { value: "thisMonth", label: "This Month" },
        { value: "lastMonth", label: "Last Month" },
        { value: "custom", label: "Custom Range" },
    ];

    const paymentOptions = [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
    ];

    const statusOptions = [
        { value: "enrolled", label: "Enrolled" },
        { value: "activated", label: "Activated" },
        { value: "reported", label: "Reported" },
        { value: "paid", label: "Paid" },
    ];

    const outlets = [
        { value: "Outlet 101", label: "Outlet 101" },
        { value: "Outlet 102", label: "Outlet 102" },
        { value: "Outlet 103", label: "Outlet 103" },
    ];

    // ---- STATE ----
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // dropdown open states
    const [campaignOpen, setCampaignOpen] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
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
            const regionKey = region.label;
            return regionStates[regionKey] || [];
        });

        return filteredStates.map((state) => ({
            label: state,
            value: state.toLowerCase().replace(/\s+/g, "-"),
        }));
    }, [selectedRegions]);

    useEffect(() => {
        if (!selectedRegions || selectedRegions.length === 0) {
            setSelectedStates([]);
            return;
        }

        const validStateLabels = selectedRegions.flatMap(
            (region) => regionStates[region.label] || []
        );
        const filteredStates = selectedStates.filter((state) =>
            validStateLabels.some(
                (s) => s.toLowerCase().replace(/\s+/g, "-") === state.value
            )
        );
        setSelectedStates(filteredStates);
    }, [selectedRegions]);

    const handleRegionChange = (callback) => {
        setSelectedRegions(callback);
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

    // ---- SAMPLE REPORT DATA ----
    const reportData = [
        {
            id: 1,
            outlet: "Outlet 101",
            outletCode: "OUT101",
            region: "North",
            state: "Delhi",
            campaign: "Campaign A",
            status: "Paid",
            enrollDate: "01-Jan-25",
            activationDate: "05-Jan-25",
            reportDate: "15-Jan-25",
            paymentDate: "20-Jan-25",
            amount: "5000",
            payment: "Paid",
        },
        {
            id: 2,
            outlet: "Outlet 102",
            outletCode: "OUT102",
            region: "South",
            state: "Karnataka",
            campaign: "Campaign B",
            status: "Reported",
            enrollDate: "02-Jan-25",
            activationDate: "06-Jan-25",
            reportDate: "16-Jan-25",
            paymentDate: "-",
            amount: "4500",
            payment: "Pending",
        },
        {
            id: 3,
            outlet: "Outlet 103",
            outletCode: "OUT103",
            region: "West",
            state: "Maharashtra",
            campaign: "Campaign C",
            status: "Activated",
            enrollDate: "03-Jan-25",
            activationDate: "07-Jan-25",
            reportDate: "-",
            paymentDate: "-",
            amount: "-",
            payment: "Pending",
        },
    ];

    // ---- FILTERED DATA (basic for now) ----
    const filteredData = reportData.filter((row) => {
        if (selectedOutlet && row.outlet !== selectedOutlet.value) return false;
        if (
            selectedPayment &&
            row.payment.toLowerCase() !== selectedPayment.value
        )
            return false;
        if (selectedStatus && row.status.toLowerCase() !== selectedStatus.value)
            return false;
        // campaign/region/state/date filters can be wired to backend later
        return true;
    });

    const totalOutlets = filteredData.length;
    const totalPaid = filteredData.filter((r) => r.payment === "Paid").length;
    const totalPending = filteredData.filter(
        (r) => r.payment === "Pending"
    ).length;
    const totalAmount = filteredData
        .filter((r) => r.amount !== "-")
        .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const handleExport = () => {
        // Later: trigger API to generate & download CSV/Excel
        console.log("Exporting report...");
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header showBackButton={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Heading + Export */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Detailed Report</Text>
                    <GradientButton
                        title="Export"
                        icon="download-outline"
                        size="small"
                        colors={["#E4002B", "#C3002B"]}
                        onPress={handleExport}
                    />
                </View>

                {/* Filters Card */}
                <View style={styles.filtersCard}>
                    <View style={styles.filtersHeader}>
                        <Ionicons
                            name="filter-outline"
                            size={20}
                            color="#E4002B"
                        />
                        <Text style={styles.filtersTitle}>Filters</Text>
                    </View>

                    <View style={styles.filtersContainer}>
                        {/* Row 1: Campaign & Region */}
                        <View style={[styles.filterItem, { zIndex: 7000 }]}>
                            <SearchableDropdown
                                label="Campaign"
                                placeholder="Select Campaign"
                                open={campaignOpen}
                                value={selectedCampaigns}
                                items={campaignOptions}
                                setOpen={setCampaignOpen}
                                setValue={setSelectedCampaigns}
                                multiple={true}
                                searchable={true}
                                zIndex={7000}
                            />
                        </View>

                        <View style={[styles.filterItem, { zIndex: 6900 }]}>
                            <SearchableDropdown
                                label="Region"
                                placeholder="Select Region"
                                open={regionOpen}
                                value={selectedRegions}
                                items={regionOptions}
                                setOpen={setRegionOpen}
                                setValue={handleRegionChange}
                                multiple={true}
                                searchable={true}
                                zIndex={6900}
                            />
                        </View>

                        {/* Row 2: State & Outlet */}
                        <View style={[styles.filterItem, { zIndex: 6800 }]}>
                            <SearchableDropdown
                                label="State"
                                placeholder="Select State"
                                open={stateOpen}
                                value={selectedStates}
                                items={stateOptions}
                                setOpen={setStateOpen}
                                setValue={setSelectedStates}
                                multiple={true}
                                searchable={true}
                                zIndex={6800}
                            />
                        </View>

                        <View style={[styles.filterItem, { zIndex: 6700 }]}>
                            <SearchableDropdown
                                label="Outlet"
                                placeholder="Select Outlet"
                                open={outletOpen}
                                value={selectedOutlet}
                                items={outlets}
                                setOpen={setOutletOpen}
                                setValue={setSelectedOutlet}
                                multiple={false}
                                searchable={true}
                                zIndex={6700}
                            />
                        </View>

                        {/* Row 3: Status & Date Range */}
                        <View style={[styles.filterItem, { zIndex: 6600 }]}>
                            <SearchableDropdown
                                label="Outlet Status"
                                placeholder="Select Status"
                                open={statusOpen}
                                value={selectedStatus}
                                items={statusOptions}
                                setOpen={setStatusOpen}
                                setValue={setSelectedStatus}
                                multiple={false}
                                searchable={true}
                                zIndex={6600}
                            />
                        </View>

                        <View style={[styles.filterItem, { zIndex: 6500 }]}>
                            <SearchableDropdown
                                label="Date Range"
                                placeholder="Select Date"
                                open={dateOpen}
                                value={selectedDateRange}
                                items={dateOptions}
                                setOpen={setDateOpen}
                                setValue={handleDateChange}
                                multiple={false}
                                searchable={true}
                                zIndex={6500}
                            />
                        </View>

                        {/* Row 4: Payment (Full Width) */}
                        <View style={[styles.filterItemFull, { zIndex: 6400 }]}>
                            <SearchableDropdown
                                label="Payment Status"
                                placeholder="Select Payment"
                                open={paymentOpen}
                                value={selectedPayment}
                                items={paymentOptions}
                                setOpen={setPaymentOpen}
                                setValue={setSelectedPayment}
                                multiple={false}
                                searchable={true}
                                zIndex={6400}
                            />
                        </View>
                    </View>

                    {/* Custom date range */}
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

                {/* Report List (cards instead of table) */}
                <View style={styles.listContainer}>
                    {filteredData.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="document-text-outline"
                                size={60}
                                color="#ccc"
                            />
                            <Text style={styles.emptyText}>
                                No data available. Please adjust your filters.
                            </Text>
                        </View>
                    ) : (
                        filteredData.map((item, index) => (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.outletName}>
                                            {item.outlet}
                                        </Text>
                                        <Text style={styles.outletCode}>
                                            {item.outletCode}
                                        </Text>
                                    </View>
                                    <View style={styles.statusPillWrapper}>
                                        <Text
                                            style={[
                                                styles.statusPill,
                                                item.status === "Paid"
                                                    ? styles.statusPaid
                                                    : item.status === "Reported"
                                                    ? styles.statusReported
                                                    : item.status ===
                                                      "Activated"
                                                    ? styles.statusActivated
                                                    : styles.statusOther,
                                            ]}
                                        >
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>
                                        Region:
                                    </Text>
                                    <Text style={styles.infoValue}>
                                        {item.region}
                                    </Text>
                                    <Text style={styles.infoLabel}>State:</Text>
                                    <Text style={styles.infoValue}>
                                        {item.state}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>
                                        Campaign:
                                    </Text>
                                    <Text style={styles.infoValue}>
                                        {item.campaign}
                                    </Text>
                                </View>

                                <View style={styles.datesRow}>
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateLabel}>
                                            Enroll
                                        </Text>
                                        <Text style={styles.dateValue}>
                                            {item.enrollDate}
                                        </Text>
                                    </View>
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateLabel}>
                                            Activation
                                        </Text>
                                        <Text style={styles.dateValue}>
                                            {item.activationDate}
                                        </Text>
                                    </View>
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateLabel}>
                                            Report
                                        </Text>
                                        <Text style={styles.dateValue}>
                                            {item.reportDate}
                                        </Text>
                                    </View>
                                    <View style={styles.dateColumn}>
                                        <Text style={styles.dateLabel}>
                                            Payment
                                        </Text>
                                        <Text style={styles.dateValue}>
                                            {item.paymentDate}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.footerRow}>
                                    <View style={styles.amountWrapper}>
                                        <Text style={styles.amountLabel}>
                                            Amount
                                        </Text>
                                        <Text style={styles.amountValue}>
                                            {item.amount !== "-"
                                                ? `₹${Number(
                                                      item.amount
                                                  ).toLocaleString("en-IN")}`
                                                : "-"}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.paymentPill,
                                            item.payment === "Paid"
                                                ? styles.paymentPaid
                                                : item.payment === "Pending"
                                                ? styles.paymentPending
                                                : styles.paymentFailed,
                                        ]}
                                    >
                                        <Text style={styles.paymentText}>
                                            {item.payment}
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

export default ClientReportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#E4002B",
    },
    filtersCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    filtersHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    filtersTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    filtersContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 8,
    },
    filterItem: {
        width: "48%",
    },
    filterItemFull: {
        width: "100%",
    },
    customDateRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 6,
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
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    listContainer: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    outletName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    outletCode: {
        fontSize: 12,
        color: "#777",
        marginTop: 2,
    },
    statusPillWrapper: {
        alignItems: "flex-end",
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: "600",
        overflow: "hidden",
    },
    statusPaid: {
        backgroundColor: "#d4edda",
        color: "#155724",
    },
    statusReported: {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
    },
    statusActivated: {
        backgroundColor: "#fff3cd",
        color: "#856404",
    },
    statusOther: {
        backgroundColor: "#e2e3e5",
        color: "#383d41",
    },
    infoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    infoValue: {
        fontSize: 12,
        color: "#333",
        marginRight: 8,
    },
    datesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        marginBottom: 8,
    },
    dateColumn: {
        flex: 1,
        alignItems: "flex-start",
    },
    dateLabel: {
        fontSize: 11,
        color: "#777",
    },
    dateValue: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
        marginTop: 2,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountWrapper: {
        flexDirection: "column",
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
    paymentPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    paymentPaid: {
        backgroundColor: "#d4edda",
    },
    paymentPending: {
        backgroundColor: "#fff3cd",
    },
    paymentFailed: {
        backgroundColor: "#f8d7da",
    },
    paymentText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#333",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
    },
});
