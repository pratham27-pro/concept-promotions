// ClientReportScreen.js - ALL ISSUES FIXED
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import { API_BASE_URL } from "../../url/base";
import ReportDetails from "../employee/campain-details/reports/ReportDetails";

const ClientReportScreen = ({ navigation }) => {
    // Refs
    const scrollViewRef = useRef(null);

    // Campaign Data
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState("active");
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedReportType, setSelectedReportType] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    // Date Picker states
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // Dropdown open states
    const [statusOpen, setStatusOpen] = useState(false);
    const [campaignOpen, setCampaignOpen] = useState(false);
    const [reportTypeOpen, setReportTypeOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [retailerOpen, setRetailerOpen] = useState(false);

    // Dropdown items
    const [campaignItems, setCampaignItems] = useState([]);
    const [stateItems, setStateItems] = useState([]);
    const [retailerItems, setRetailerItems] = useState([]);

    // Data
    const [displayReports, setDisplayReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [limit] = useState(10);

    // Refresh
    const [refreshing, setRefreshing] = useState(false);

    // Report Details Modal
    const [selectedReport, setSelectedReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [showReportDetailsModal, setShowReportDetailsModal] = useState(false);

    // Dropdown Options
    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "All Campaigns", value: "all" },
    ];

    const reportTypeOptions = [
        { label: "Window Display", value: "Window Display" },
        { label: "Stock", value: "Stock" },
        { label: "Others", value: "Others" },
    ];

    const closeAllDropdowns = () => {
        if (
            statusOpen ||
            stateOpen ||
            campaignOpen ||
            retailerOpen ||
            reportTypeOpen
        ) {
            setStatusOpen(false);
            setStateOpen(false);
            setCampaignOpen(false);
            setRetailerOpen(false);
            setReportTypeOpen(false);
            Keyboard.dismiss();
        }
    };

    // Callbacks to close other dropdowns
    const handleStatusOpen = () => {
        setCampaignOpen(false);
        setReportTypeOpen(false);
        setStateOpen(false);
        setRetailerOpen(false);
    };

    const handleCampaignOpen = () => {
        setStatusOpen(false);
        setReportTypeOpen(false);
        setStateOpen(false);
        setRetailerOpen(false);
    };

    const handleReportTypeOpen = () => {
        setStatusOpen(false);
        setCampaignOpen(false);
        setStateOpen(false);
        setRetailerOpen(false);
    };

    const handleStateOpen = () => {
        setStatusOpen(false);
        setCampaignOpen(false);
        setReportTypeOpen(false);
        setRetailerOpen(false);
    };

    const handleRetailerOpen = () => {
        setStatusOpen(false);
        setCampaignOpen(false);
        setReportTypeOpen(false);
        setStateOpen(false);
    };

    // Fetch campaigns on mount
    // ✅ FIX: Only fetch campaigns once on mount, not on every focus
    useFocusEffect(
        useCallback(() => {
            // Only fetch if we don't have campaigns yet
            if (allCampaigns.length === 0) {
                fetchCampaigns();
            }
        }, []) // Empty dependency array - only run on mount
    );

    const fetchCampaigns = async () => {
        try {
            setLoadingCampaigns(true);
            const token = await AsyncStorage.getItem("userToken");

            const response = await fetch(
                `${API_BASE_URL}/client/client/campaigns`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch campaigns");
            }

            console.log("✅ Fetched campaigns:", data.campaigns?.length || 0);
            setAllCampaigns(data.campaigns || []);
        } catch (error) {
            console.error("❌ Error fetching campaigns:", error);
            Alert.alert("Error", "Failed to load campaigns");
        } finally {
            setLoadingCampaigns(false);
            setRefreshing(false);
        }
    };

    // ✅ FIX 1: Use useMemo for filtered campaigns
    const filteredCampaigns = useMemo(() => {
        if (selectedStatus === "all") {
            return allCampaigns;
        }
        const isActive = selectedStatus === "active";
        return allCampaigns.filter((c) => c.isActive === isActive);
    }, [allCampaigns, selectedStatus]);

    // ✅ FIX 2: Update campaign items when filteredCampaigns changes
    useEffect(() => {
        console.log(
            "📊 Updating campaign items, filtered count:",
            filteredCampaigns.length
        );

        const campItems = filteredCampaigns.map((c) => ({
            label: c.name,
            value: c._id,
        }));
        setCampaignItems(campItems);
    }, [filteredCampaigns]);

    // ✅ FIX 3: Update state/retailer items when dependencies change
    useEffect(() => {
        // Only run if we have campaigns
        if (filteredCampaigns.length === 0) {
            setStateItems([]);
            setRetailerItems([]);
            return;
        }

        console.log("📊 Updating state and retailer items");

        // Get campaigns to process
        const campaignsToProcess = selectedCampaign
            ? filteredCampaigns.filter((c) => c._id === selectedCampaign)
            : filteredCampaigns;

        // Build state options
        const stateSet = new Set();
        campaignsToProcess.forEach((campaign) => {
            (campaign.assignedRetailers || []).forEach((retailerAssignment) => {
                const state =
                    retailerAssignment.retailerId?.shopDetails?.shopAddress
                        ?.state;
                if (state) stateSet.add(state);
            });
        });

        const stateOpts = Array.from(stateSet).map((state) => ({
            label: state,
            value: state,
        }));
        setStateItems(stateOpts);
        console.log("  States found:", stateOpts.length);

        // ✅ CRITICAL FIX: If selected state is no longer in the new list, clear it
        if (
            selectedState &&
            !stateOpts.find((s) => s.value === selectedState)
        ) {
            setSelectedState(null);
        }

        // Build retailer options
        const retailersMap = new Map();
        campaignsToProcess.forEach((campaign) => {
            (campaign.assignedRetailers || []).forEach((retailerAssignment) => {
                const retailer = retailerAssignment.retailerId;
                if (retailer && retailer._id) {
                    const retailerId = retailer._id;
                    const outletName = retailer.shopDetails?.shopName || "N/A";
                    const outletCode = retailer.uniqueId || "N/A";
                    const retailerName = retailer.name || "N/A";

                    // Filter by selected state if applicable
                    if (selectedState) {
                        const retailerState =
                            retailer.shopDetails?.shopAddress?.state;
                        if (retailerState !== selectedState) return;
                    }

                    if (!retailersMap.has(retailerId)) {
                        retailersMap.set(retailerId, {
                            label: `${outletName} • ${outletCode} • ${retailerName}`,
                            value: retailerId,
                        });
                    }
                }
            });
        });

        const retailerOpts = Array.from(retailersMap.values());
        setRetailerItems(retailerOpts);
        console.log("  Retailers found:", retailerOpts.length);

        // ✅ CRITICAL FIX: If selected retailer is no longer in the new list, clear it
        if (
            selectedRetailer &&
            !retailerOpts.find((r) => r.value === selectedRetailer)
        ) {
            setSelectedRetailer(null);
        }
    }, [filteredCampaigns, selectedCampaign, selectedState, selectedRetailer]);

    // ✅ FIX 4: Handle filter changes - simpler without useCallback
    const handleStatusChange = (newValue) => {
        console.log("🔄 Status changed", newValue);
        setSelectedCampaign(null);
        setSelectedRetailer(null);
        setSelectedState(null);
    };

    const handleCampaignChange = (newValue) => {
        console.log("🔄 Campaign changed", newValue);
        setSelectedRetailer(null);
        setSelectedState(null);
    };

    const handleStateChange = (newValue) => {
        console.log("🔄 State changed", newValue);
        setSelectedRetailer(null);
    };

    // Fetch reports
    const fetchReports = async (page = 1) => {
        console.log("🔍 Fetching reports for page:", page);
        setLoading(true);
        setHasSearched(true);

        // ✅ FIX 5: Set currentPage immediately
        setCurrentPage(page);

        try {
            const token = await AsyncStorage.getItem("userToken");

            // Build query params
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", limit);

            if (selectedCampaign) {
                params.append("campaignId", selectedCampaign);
            }
            if (selectedReportType) {
                params.append("reportType", selectedReportType);
            }
            if (selectedRetailer) {
                params.append("retailerId", selectedRetailer);
            }
            if (fromDate) {
                params.append(
                    "startDate",
                    fromDate.toISOString().split("T")[0]
                );
            }
            if (toDate) {
                params.append("endDate", toDate.toISOString().split("T")[0]);
            }

            console.log("📤 Request params:", params.toString());

            const response = await fetch(
                `${API_BASE_URL}/reports/client-reports?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch reports");
            }

            let reports = data.reports || [];

            // Client-side filter by state if selected
            if (selectedState) {
                reports = reports.filter(
                    (report) =>
                        report.retailer?.retailerId?.shopDetails?.shopAddress
                            ?.state === selectedState
                );
            }

            console.log("📥 Reports received:", reports.length);
            setDisplayReports(reports);
            setTotalReports(data.pagination?.total || reports.length);
            setTotalPages(data.pagination?.pages || 1);

            // Scroll to top after loading new page
            setTimeout(() => {
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ y: 0, animated: true });
                }
            }, 100);

            if (reports.length === 0) {
                Alert.alert(
                    "Info",
                    "No reports found for the selected filters"
                );
            }
        } catch (error) {
            console.error("❌ Error fetching reports:", error);
            Alert.alert("Error", "Failed to load reports");
            setDisplayReports([]);
        } finally {
            setLoading(false);
        }
    };

    // View report details
    const handleViewDetails = async (report) => {
        try {
            setLoadingReport(true);
            setShowReportDetailsModal(true);

            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(
                `${API_BASE_URL}/reports/${report._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSelectedReport(data.report);
            } else {
                throw new Error("Failed to load report details");
            }
        } catch (error) {
            console.error("❌ Error fetching report details:", error);
            Alert.alert("Error", "Failed to load report details");
            setShowReportDetailsModal(false);
        } finally {
            setLoadingReport(false);
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSelectedCampaign(null);
        setSelectedRetailer(null);
        setSelectedState(null);
        setSelectedReportType(null);
        setFromDate(null);
        setToDate(null);
        setDisplayReports([]);
        setHasSearched(false);
        setCurrentPage(1);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateShort = (date) => {
        if (!date) return "Select Date";
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ✅ FIX 6: Pagination handler - simplified
    const handlePageChange = (newPage) => {
        console.log("📄 Page change requested:", newPage);
        if (newPage >= 1 && newPage <= totalPages) {
            fetchReports(newPage);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCampaigns();
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header title="View Reports" />
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#E4002B"]}
                        tintColor={"#E4002B"}
                    />
                }
            >
                <View>
                    {/* Filters Section */}
                    <View style={styles.filtersContainer}>
                        <Text style={styles.filtersTitle}>
                            Filter Reports (All Optional)
                        </Text>

                        {/* Campaign Status Dropdown */}
                        <SearchableDropdown
                            label="Campaign Status"
                            placeholder="Select Status"
                            open={statusOpen}
                            value={selectedStatus}
                            items={statusOptions}
                            setOpen={setStatusOpen}
                            setValue={setSelectedStatus}
                            setItems={() => {}}
                            searchable={false}
                            multiple={false}
                            zIndex={10000}
                            onOpen={handleStatusOpen}
                            onChangeValue={handleStatusChange}
                        />

                        {/* Campaign Dropdown */}
                        <SearchableDropdown
                            label="Campaign"
                            placeholder="Select Campaign"
                            open={campaignOpen}
                            value={selectedCampaign}
                            items={campaignItems}
                            setOpen={setCampaignOpen}
                            setValue={setSelectedCampaign}
                            setItems={setCampaignItems}
                            searchable={true}
                            multiple={false}
                            zIndex={9000}
                            onOpen={handleCampaignOpen}
                            onChangeValue={handleCampaignChange}
                        />

                        {/* Report Type Dropdown */}
                        <SearchableDropdown
                            label="Report Type"
                            placeholder="Select Report Type"
                            open={reportTypeOpen}
                            value={selectedReportType}
                            items={reportTypeOptions}
                            setOpen={setReportTypeOpen}
                            setValue={setSelectedReportType}
                            setItems={() => {}}
                            searchable={false}
                            multiple={false}
                            zIndex={8000}
                            onOpen={handleReportTypeOpen}
                        />

                        {/* State Dropdown */}
                        <SearchableDropdown
                            label="State"
                            placeholder="Select State"
                            open={stateOpen}
                            value={selectedState}
                            items={stateItems}
                            setOpen={setStateOpen}
                            setValue={setSelectedState}
                            setItems={setStateItems}
                            searchable={true}
                            multiple={false}
                            zIndex={7000}
                            onOpen={handleStateOpen}
                            onChangeValue={handleStateChange}
                        />

                        {/* Retailer Dropdown */}
                        <SearchableDropdown
                            label="Retailer"
                            placeholder="Select Retailer"
                            open={retailerOpen}
                            value={selectedRetailer}
                            items={retailerItems}
                            setOpen={setRetailerOpen}
                            setValue={setSelectedRetailer}
                            setItems={setRetailerItems}
                            searchable={true}
                            multiple={false}
                            zIndex={6000}
                            onOpen={handleRetailerOpen}
                        />

                        {/* Date Range */}
                        <View style={styles.dateRangeContainer}>
                            <View style={styles.dateItem}>
                                <Text style={styles.filterLabel}>
                                    From Date
                                </Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowFromDatePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {formatDateShort(fromDate)}
                                    </Text>
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateItem}>
                                <Text style={styles.filterLabel}>To Date</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowToDatePicker(true)}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {formatDateShort(toDate)}
                                    </Text>
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.searchButton,
                                    loading && styles.searchButtonDisabled,
                                ]}
                                onPress={() => fetchReports(1)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        color="#fff"
                                        size="small"
                                    />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="search"
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.searchButtonText}>
                                            Search Reports
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {(selectedCampaign ||
                                selectedRetailer ||
                                selectedState ||
                                selectedReportType ||
                                fromDate ||
                                toDate) && (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={handleClearFilters}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={18}
                                        color="#E4002B"
                                    />
                                    <Text style={styles.clearButtonText}>
                                        Clear Filters
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Reports Table */}
                    {!loading && hasSearched && displayReports.length > 0 && (
                        <View style={styles.reportsContainer}>
                            <View style={styles.reportsHeader}>
                                <Text style={styles.reportsTitle}>
                                    Reports ({totalReports} found)
                                </Text>
                                <Text style={styles.reportsSubtitle}>
                                    Showing {(currentPage - 1) * limit + 1} to{" "}
                                    {Math.min(
                                        currentPage * limit,
                                        totalReports
                                    )}{" "}
                                    of {totalReports}
                                </Text>
                            </View>

                            {displayReports.map((report, index) => (
                                <View
                                    key={report._id}
                                    style={styles.reportCard}
                                >
                                    <View style={styles.reportHeader}>
                                        <View style={styles.reportNumber}>
                                            <Text
                                                style={styles.reportNumberText}
                                            >
                                                #
                                                {(currentPage - 1) * limit +
                                                    index +
                                                    1}
                                            </Text>
                                        </View>
                                        <View style={styles.reportTypeBadge}>
                                            <Text
                                                style={
                                                    styles.reportTypeBadgeText
                                                }
                                            >
                                                {report.reportType || "N/A"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.reportBody}>
                                        <View style={styles.reportRow}>
                                            <Ionicons
                                                name="business"
                                                size={16}
                                                color="#666"
                                            />
                                            <Text style={styles.reportLabel}>
                                                Campaign:
                                            </Text>
                                            <Text style={styles.reportValue}>
                                                {report.campaignId?.name ||
                                                    "N/A"}
                                            </Text>
                                        </View>

                                        <View style={styles.reportRow}>
                                            <Ionicons
                                                name="person"
                                                size={16}
                                                color="#666"
                                            />
                                            <Text style={styles.reportLabel}>
                                                Retailer:
                                            </Text>
                                            <Text style={styles.reportValue}>
                                                {report.retailer
                                                    ?.retailerName || "N/A"}
                                            </Text>
                                        </View>

                                        <View style={styles.reportRow}>
                                            <Ionicons
                                                name="storefront"
                                                size={16}
                                                color="#666"
                                            />
                                            <Text style={styles.reportLabel}>
                                                Outlet:
                                            </Text>
                                            <Text style={styles.reportValue}>
                                                {report.retailer?.outletName ||
                                                    "N/A"}
                                            </Text>
                                        </View>

                                        <View style={styles.reportRow}>
                                            <Ionicons
                                                name="pricetag"
                                                size={16}
                                                color="#666"
                                            />
                                            <Text style={styles.reportLabel}>
                                                Code:
                                            </Text>
                                            <Text style={styles.reportValue}>
                                                {report.retailer?.outletCode ||
                                                    "N/A"}
                                            </Text>
                                        </View>

                                        <View style={styles.reportRow}>
                                            <Ionicons
                                                name="calendar"
                                                size={16}
                                                color="#666"
                                            />
                                            <Text style={styles.reportLabel}>
                                                Date:
                                            </Text>
                                            <Text style={styles.reportValue}>
                                                {formatDate(
                                                    report.dateOfSubmission ||
                                                        report.createdAt
                                                )}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.viewDetailsButton}
                                        onPress={() =>
                                            handleViewDetails(report)
                                        }
                                    >
                                        <Text style={styles.viewDetailsText}>
                                            View Details
                                        </Text>
                                        <Ionicons
                                            name="arrow-forward"
                                            size={18}
                                            color="#E4002B"
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <View style={styles.paginationContainer}>
                                    <Text style={styles.paginationText}>
                                        Page {currentPage} of {totalPages}
                                    </Text>

                                    <View style={styles.paginationButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === 1 &&
                                                    styles.paginationButtonDisabled,
                                            ]}
                                            onPress={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            <Ionicons
                                                name="chevron-back"
                                                size={20}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>

                                        <Text style={styles.paginationPageText}>
                                            {currentPage}
                                        </Text>

                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === totalPages &&
                                                    styles.paginationButtonDisabled,
                                            ]}
                                            onPress={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            <Ionicons
                                                name="chevron-forward"
                                                size={20}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#E4002B" />
                            <Text style={styles.loadingText}>
                                Loading reports...
                            </Text>
                        </View>
                    )}

                    {/* Empty State - No Results */}
                    {!loading && hasSearched && displayReports.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="folder-open-outline"
                                size={64}
                                color="#ccc"
                            />
                            <Text style={styles.emptyStateTitle}>
                                No reports found
                            </Text>
                            <Text style={styles.emptyStateText}>
                                Try adjusting your search criteria or clear
                                filters to see all reports.
                            </Text>
                        </View>
                    )}

                    {/* Empty State - Ready to Search */}
                    {!hasSearched && (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="search-outline"
                                size={64}
                                color="#E4002B"
                            />
                            <Text style={styles.emptyStateTitle}>
                                Ready to search reports
                            </Text>
                            <Text style={styles.emptyStateText}>
                                Click "Search Reports" to view reports with your
                                selected filters.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Date Pickers */}
            {showFromDatePicker && (
                <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                        setShowFromDatePicker(Platform.OS === "ios");
                        if (selectedDate) {
                            setFromDate(selectedDate);
                        }
                    }}
                />
            )}

            {showToDatePicker && (
                <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                        setShowToDatePicker(Platform.OS === "ios");
                        if (selectedDate) {
                            setToDate(selectedDate);
                        }
                    }}
                />
            )}

            {/* Report Details Modal */}
            {showReportDetailsModal && (
                <ReportDetails
                    visible={showReportDetailsModal}
                    report={selectedReport}
                    loading={loadingReport}
                    onClose={() => {
                        setShowReportDetailsModal(false);
                        setSelectedReport(null);
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollView: {
        flex: 1,
    },
    filtersContainer: {
        backgroundColor: "#fff",
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filtersTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    filterItem: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        marginBottom: 6,
    },
    filterButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    filterButtonText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    dateRangeContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    dateItem: {
        flex: 1,
    },
    dateButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    dateButtonText: {
        fontSize: 13,
        color: "#333",
    },
    actionButtonsContainer: {
        gap: 12,
    },
    searchButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E4002B",
        padding: 14,
        borderRadius: 8,
        gap: 8,
    },
    searchButtonDisabled: {
        backgroundColor: "#ccc",
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    clearButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        padding: 10,
    },
    clearButtonText: {
        color: "#E4002B",
        fontSize: 14,
        fontWeight: "600",
    },
    reportsContainer: {
        padding: 16,
    },
    reportsHeader: {
        marginBottom: 16,
    },
    reportsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    reportsSubtitle: {
        fontSize: 13,
        color: "#666",
    },
    reportCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reportHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    reportNumber: {
        backgroundColor: "#E4002B",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    reportNumberText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    reportTypeBadge: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    reportTypeBadgeText: {
        color: "#333",
        fontSize: 12,
        fontWeight: "600",
    },
    reportBody: {
        gap: 10,
    },
    reportRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    reportLabel: {
        fontSize: 13,
        color: "#666",
        fontWeight: "600",
        minWidth: 70,
    },
    reportValue: {
        flex: 1,
        fontSize: 13,
        color: "#333",
    },
    viewDetailsButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    viewDetailsText: {
        color: "#E4002B",
        fontSize: 14,
        fontWeight: "600",
    },
    paginationContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 100,
        gap: 12,
    },
    paginationText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    paginationButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    paginationButton: {
        backgroundColor: "#E4002B",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    paginationButtonDisabled: {
        backgroundColor: "#ccc",
    },
    paginationPageText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        minWidth: 30,
        textAlign: "center",
    },
    loadingContainer: {
        padding: 60,
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
    },
    emptyState: {
        padding: 60,
        alignItems: "center",
        backgroundColor: "#fff",
        margin: 16,
        borderRadius: 12,
        marginBottom: 150,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "70%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    modalContent: {
        padding: 16,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: "#f8f9fa",
    },
    modalOptionSelected: {
        backgroundColor: "#ffe5e9",
        borderWidth: 1,
        borderColor: "#E4002B",
    },
    modalOptionText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    modalOptionTextSelected: {
        color: "#E4002B",
        fontWeight: "600",
    },
});

export default ClientReportScreen;
