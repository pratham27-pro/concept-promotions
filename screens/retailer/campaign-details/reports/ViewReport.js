import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../../../components/common/Header";
import { API_BASE_URL } from "../../../../url/base";
import ReportDetails from "./ReportDetails";

const RetailerViewReportsScreen = ({ route, navigation }) => {
    const { campaign } = route.params;

    // Date Range Filter
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // Data
    const [displayReports, setDisplayReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Campaign ID
    const [campaignId, setCampaignId] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [limit] = useState(10);

    // Retailer Info
    const [retailerInfo, setRetailerInfo] = useState(null);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    // Fetch retailer info and campaign ID
    useEffect(() => {
        fetchRetailerInfo();
        if (campaign) {
            fetchCampaignId();
        }
    }, [campaign]);

    const fetchRetailerInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(
                `${API_BASE_URL}/retailer/retailer/me`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await response.json();
            setRetailerInfo(data);
        } catch (err) {
            console.error("Error fetching retailer info:", err);
        }
    };

    const fetchCampaignId = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(`${API_BASE_URL}/retailer/campaigns`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            const matchedCampaign = data.campaigns?.find(
                (c) => c.name === campaign.name
            );

            if (matchedCampaign) {
                setCampaignId(matchedCampaign._id);
            }
        } catch (err) {
            console.error("Error fetching campaign ID:", err);
        }
    };

    const fetchReports = async (page = 1, isRefreshing = false) => {
        if (!retailerInfo?._id) {
            Alert.alert("Error", "Retailer information not loaded");
            return;
        }

        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setHasSearched(true);

        try {
            const token = await AsyncStorage.getItem("userToken");

            const res = await fetch(
                `${API_BASE_URL}/reports/retailer-reports/${retailerInfo._id}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                Alert.alert("Error", data.message || "Error fetching reports");
                setDisplayReports([]);
                return;
            }

            let reports = data.reports || [];

            // Filter by campaign
            if (campaignId) {
                reports = reports.filter(
                    (report) =>
                        report.campaignId?._id === campaignId ||
                        report.campaignId === campaignId
                );
            }

            // Filter by date range
            if (fromDate || toDate) {
                reports = reports.filter((report) => {
                    const reportDate = new Date(
                        report.dateOfSubmission || report.createdAt
                    );
                    const from = fromDate ? new Date(fromDate) : null;
                    const to = toDate ? new Date(toDate) : null;

                    if (from && to) {
                        return reportDate >= from && reportDate <= to;
                    } else if (from) {
                        return reportDate >= from;
                    } else if (to) {
                        return reportDate <= to;
                    }
                    return true;
                });
            }

            // Client-side pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedReports = reports.slice(startIndex, endIndex);

            setDisplayReports(paginatedReports);
            setTotalReports(reports.length);
            setCurrentPage(page);
            setTotalPages(Math.ceil(reports.length / limit));

            if (reports.length === 0 && !isRefreshing) {
                Alert.alert(
                    "Info",
                    "No reports found for the selected filters"
                );
            }
        } catch (err) {
            console.log("Reports Fetch Error:", err);
            Alert.alert("Error", "Failed to load reports");
            setDisplayReports([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleClearFilters = () => {
        setFromDate(null);
        setToDate(null);
        setDisplayReports([]);
        setHasSearched(false);
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleViewDetails = async (report) => {
        setLoadingReport(true);
        setShowModal(true);

        try {
            const token = await AsyncStorage.getItem("userToken");

            const res = await fetch(`${API_BASE_URL}/reports/${report._id}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok) {
                Alert.alert("Error", "Failed to load report details");
                setShowModal(false);
                return;
            }

            setSelectedReport(data.report);
        } catch (err) {
            console.error("Error fetching report details:", err);
            Alert.alert("Error", "Failed to load report details");
            setShowModal(false);
        } finally {
            setLoadingReport(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedReport(null);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchReports(newPage);
        }
    };

    const onRefresh = () => {
        if (hasSearched) {
            fetchReports(currentPage, true);
        }
    };

    // Date Picker Handlers
    const onFromDateChange = (event, selectedDate) => {
        setShowFromDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setFromDate(selectedDate);
        }
    };

    const onToDateChange = (event, selectedDate) => {
        setShowToDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setToDate(selectedDate);
        }
    };

    const renderReportCard = (report, index) => {
        const globalIndex = (currentPage - 1) * limit + index + 1;

        return (
            <View key={report._id} style={styles.reportCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.serialNumberBadge}>
                        <Text style={styles.serialNumberText}>
                            #{globalIndex}
                        </Text>
                    </View>
                    <View style={styles.reportTypeBadge}>
                        <Text style={styles.reportTypeText}>
                            {report.reportType || "N/A"}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    {/* Employee Info */}
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="person-outline"
                            size={18}
                            color="#666"
                        />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Employee</Text>
                            <Text style={styles.infoValue}>
                                {report.employee?.employeeId?.name || "N/A"}
                            </Text>
                            {report.employee?.employeeId?.employeeId && (
                                <Text style={styles.infoSubtext}>
                                    ID: {report.employee.employeeId.employeeId}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Date */}
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#666"
                        />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>
                                {formatDate(
                                    report.dateOfSubmission || report.createdAt
                                )}
                            </Text>
                        </View>
                    </View>

                    {/* Frequency */}
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="repeat-outline"
                            size={18}
                            color="#666"
                        />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Frequency</Text>
                            <View style={styles.frequencyBadge}>
                                <Text style={styles.frequencyText}>
                                    {report.frequency || "N/A"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewDetails(report)}
                >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#E4002B"
                    />
                </TouchableOpacity>
            </View>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    1,
                    "...",
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    totalPages
                );
            }
        }

        return (
            <View style={styles.paginationContainer}>
                <Text style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                </Text>

                <View style={styles.paginationButtons}>
                    <TouchableOpacity
                        style={[
                            styles.paginationButton,
                            currentPage === 1 &&
                                styles.paginationButtonDisabled,
                        ]}
                        onPress={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={currentPage === 1 ? "#ccc" : "#E4002B"}
                        />
                    </TouchableOpacity>

                    {pages.map((page, idx) =>
                        page === "..." ? (
                            <View
                                key={`ellipsis-${idx}`}
                                style={styles.ellipsis}
                            >
                                <Text style={styles.ellipsisText}>...</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                key={page}
                                style={[
                                    styles.pageNumberButton,
                                    currentPage === page &&
                                        styles.pageNumberButtonActive,
                                ]}
                                onPress={() => handlePageChange(page)}
                            >
                                <Text
                                    style={[
                                        styles.pageNumberText,
                                        currentPage === page &&
                                            styles.pageNumberTextActive,
                                    ]}
                                >
                                    {page}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}

                    <TouchableOpacity
                        style={[
                            styles.paginationButton,
                            currentPage === totalPages &&
                                styles.paginationButtonDisabled,
                        ]}
                        onPress={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={
                                currentPage === totalPages ? "#ccc" : "#E4002B"
                            }
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header title="My Reports" />

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
                {/* Campaign Info */}
                <View style={styles.campaignCard}>
                    <Text style={styles.campaignLabel}>Campaign</Text>
                    <Text style={styles.campaignName}>
                        {campaign?.name || "Loading..."}
                    </Text>
                    {campaign?.client && (
                        <Text style={styles.campaignClient}>
                            Client: {campaign.client}
                        </Text>
                    )}
                </View>

                {/* Filters */}
                <View style={styles.filterCard}>
                    <Text style={styles.filterTitle}>
                        Filter Reports (Optional)
                    </Text>

                    {/* From Date */}
                    <View style={styles.dateInputGroup}>
                        <Text style={styles.dateLabel}>From Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowFromDatePicker(true)}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#666"
                            />
                            <Text style={styles.dateInputText}>
                                {fromDate
                                    ? formatDate(fromDate)
                                    : "Select date"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showFromDatePicker && (
                        <DateTimePicker
                            value={fromDate || new Date()}
                            mode="date"
                            display={
                                Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={onFromDateChange}
                        />
                    )}

                    {/* To Date */}
                    <View style={styles.dateInputGroup}>
                        <Text style={styles.dateLabel}>To Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowToDatePicker(true)}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#666"
                            />
                            <Text style={styles.dateInputText}>
                                {toDate ? formatDate(toDate) : "Select date"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showToDatePicker && (
                        <DateTimePicker
                            value={toDate || new Date()}
                            mode="date"
                            display={
                                Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={onToDateChange}
                        />
                    )}

                    {/* Action Buttons */}
                    <View style={styles.filterActions}>
                        <TouchableOpacity
                            style={[
                                styles.searchButton,
                                loading && styles.searchButtonDisabled,
                            ]}
                            onPress={() => fetchReports(1)}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
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

                        {(fromDate || toDate) && (
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

                {/* Reports List */}
                {hasSearched && !loading && displayReports.length > 0 && (
                    <View style={styles.reportsSection}>
                        <View style={styles.reportsSectionHeader}>
                            <Text style={styles.reportsSectionTitle}>
                                Reports ({totalReports})
                            </Text>
                            <Text style={styles.reportsSectionSubtitle}>
                                Showing {(currentPage - 1) * limit + 1} to{" "}
                                {Math.min(currentPage * limit, totalReports)}
                            </Text>
                        </View>

                        {displayReports.map((report, index) =>
                            renderReportCard(report, index)
                        )}

                        {renderPagination()}
                    </View>
                )}

                {/* Loading State */}
                {loading && (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#E4002B" />
                        <Text style={styles.loadingText}>
                            Loading reports...
                        </Text>
                    </View>
                )}

                {/* Empty State */}
                {!loading && hasSearched && displayReports.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="document-text-outline"
                            size={64}
                            color="#ccc"
                        />
                        <Text style={styles.emptyStateTitle}>
                            No reports found
                        </Text>
                        <Text style={styles.emptyStateText}>
                            Try adjusting your search criteria or clear filters
                            to see all reports.
                        </Text>
                    </View>
                )}

                {/* Initial State */}
                {!hasSearched && !loading && (
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
                            Click "Search Reports" to view all reports for this
                            campaign, or use date filters to narrow down
                            results.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Report Details Modal */}
            {showModal && (
                <ReportDetails
                    visible={showModal}
                    report={selectedReport}
                    loading={loadingReport}
                    onClose={handleCloseModal}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    campaignCard: {
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    campaignLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
        textTransform: "uppercase",
        fontWeight: "600",
    },
    campaignName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    campaignClient: {
        fontSize: 13,
        color: "#666",
        marginTop: 4,
    },
    filterCard: {
        backgroundColor: "#EDEDED",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
    },
    dateInputGroup: {
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 8,
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        gap: 10,
    },
    dateInputText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    filterActions: {
        gap: 12,
    },
    searchButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E4002B",
        borderRadius: 10,
        padding: 14,
        gap: 8,
    },
    searchButtonDisabled: {
        backgroundColor: "#FFCDD2",
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    clearButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: 8,
    },
    clearButtonText: {
        color: "#E4002B",
        fontSize: 14,
        fontWeight: "500",
        textDecorationLine: "underline",
    },
    reportsSection: {
        marginBottom: 16,
    },
    reportsSectionHeader: {
        marginBottom: 16,
    },
    reportsSectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    reportsSectionSubtitle: {
        fontSize: 13,
        color: "#666",
    },
    reportCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    serialNumberBadge: {
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    serialNumberText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    reportTypeBadge: {
        backgroundColor: "#E4002B",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    reportTypeText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#fff",
    },
    cardContent: {
        gap: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    infoSubtext: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    frequencyBadge: {
        backgroundColor: "#e3f2fd",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    frequencyText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1976d2",
    },
    viewDetailsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: "#E4002B",
        borderRadius: 8,
        padding: 12,
        gap: 6,
    },
    viewDetailsText: {
        color: "#E4002B",
        fontSize: 14,
        fontWeight: "600",
    },
    paginationContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
    },
    paginationInfo: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
        marginBottom: 12,
    },
    paginationButtons: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    paginationButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        justifyContent: "center",
    },
    paginationButtonDisabled: {
        backgroundColor: "#f9f9f9",
    },
    pageNumberButton: {
        minWidth: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    pageNumberButtonActive: {
        backgroundColor: "#E4002B",
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    pageNumberTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    ellipsis: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    ellipsisText: {
        fontSize: 14,
        color: "#999",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#666",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptyStateText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },
});

export default RetailerViewReportsScreen;
