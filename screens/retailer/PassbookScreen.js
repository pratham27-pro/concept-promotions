import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as XLSX from "xlsx";
import Header from "../../components/common/Header";
import { commonPassbookStyles } from "../../components/styles/passbookStyles";
import { API_BASE_URL } from "../../url/base";

const PassbookScreen = () => {
    // Retailer Info
    const [retailerInfo, setRetailerInfo] = useState(null);

    // Passbook Data
    const [passbookData, setPassbookData] = useState(null);
    const [displayedCampaigns, setDisplayedCampaigns] = useState([]);

    // Campaign Options for filtering
    const [campaignOptions, setCampaignOptions] = useState([]);

    // Filters
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCampaigns, setExpandedCampaigns] = useState({});

    // Animation values
    const filterAnimation = useState(new Animated.Value(0))[0];

    const [exporting, setExporting] = useState(false);

    // Fetch data on mount and when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchRetailerInfo();
        }, [])
    );

    // Animate filters
    useEffect(() => {
        Animated.spring(filterAnimation, {
            toValue: showFilters ? 1 : 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
    }, [showFilters]);

    // FETCH RETAILER INFO
    const fetchRetailerInfo = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                Alert.alert("Error", "Please login again");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/retailer/retailer/me`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch retailer info");
            }

            const data = await response.json();
            setRetailerInfo(data);

            await fetchAssignedCampaigns(token);
            await fetchPassbookData(data._id, token);
        } catch (err) {
            console.error("Error fetching retailer info:", err);
            Alert.alert("Error", "Failed to load retailer information");
        } finally {
            setLoading(false);
        }
    };

    // FETCH ASSIGNED CAMPAIGNS
    const fetchAssignedCampaigns = async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/retailer/campaigns`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            const campaigns = data.campaigns || [];
            setCampaignOptions(campaigns);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
        }
    };

    // FETCH PASSBOOK DATA
    const fetchPassbookData = async (retailerId, token) => {
        if (!retailerId) return;

        try {
            const params = new URLSearchParams();
            params.append("retailerId", retailerId);

            const response = await fetch(
                `${API_BASE_URL}/budgets/passbook?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.length > 0) {
                    const budgetRecord = data.data[0];
                    setPassbookData(budgetRecord);
                    setDisplayedCampaigns(budgetRecord.campaigns || []);
                } else {
                    resetPassbookData();
                }
            } else {
                resetPassbookData();
            }
        } catch (error) {
            console.error("Error fetching passbook:", error);
            resetPassbookData();
        }
    };

    const resetPassbookData = () => {
        setPassbookData(null);
        setDisplayedCampaigns([]);
    };

    // APPLY FILTERS
    useEffect(() => {
        if (passbookData) {
            applyFilters();
        }
    }, [selectedCampaign, fromDate, toDate, passbookData]);

    const applyFilters = () => {
        if (!passbookData) return;

        let filtered = [...(passbookData.campaigns || [])];

        if (selectedCampaign) {
            filtered = filtered.filter(
                (c) => c.campaignId._id === selectedCampaign._id
            );
        }

        if (fromDate || toDate) {
            filtered = filtered
                .map((campaign) => {
                    const filteredInstallments = campaign.installments.filter(
                        (inst) => {
                            const instDate = new Date(inst.dateOfInstallment);
                            const from = fromDate ? new Date(fromDate) : null;
                            const to = toDate ? new Date(toDate) : null;

                            if (from && to) {
                                return instDate >= from && instDate <= to;
                            } else if (from) {
                                return instDate >= from;
                            } else if (to) {
                                return instDate <= to;
                            }
                            return true;
                        }
                    );

                    return {
                        ...campaign,
                        installments: filteredInstallments,
                    };
                })
                .filter((campaign) => campaign.installments.length > 0);
        }

        setDisplayedCampaigns(filtered);
    };

    // CLEAR FILTERS
    const handleClearFilters = () => {
        setSelectedCampaign(null);
        setFromDate(null);
        setToDate(null);
        if (passbookData) {
            setDisplayedCampaigns(passbookData.campaigns || []);
        }
    };

    // TOGGLE CAMPAIGN EXPANSION
    const toggleCampaignExpansion = (campaignId) => {
        setExpandedCampaigns((prev) => ({
            ...prev,
            [campaignId]: !prev[campaignId],
        }));
    };

    // REFRESH
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRetailerInfo();
        setRefreshing(false);
    };

    // ===============================
    // EXPORT TO EXCEL FUNCTION
    // ===============================
    const handleExportToExcel = async () => {
        if (!passbookData || displayedCampaigns.length === 0) {
            Alert.alert("No Data", "No data available to export.");
            return;
        }

        try {
            setExporting(true);

            // ✅ Helper function to parse dates
            const parseDate = (dateStr) => {
                if (!dateStr) return null;

                // Handle dd/mm/yyyy format
                if (typeof dateStr === "string" && dateStr.includes("/")) {
                    const [day, month, year] = dateStr.split("/");
                    return new Date(`${year}-${month}-${day}`);
                }

                return new Date(dateStr);
            };

            // ✅ Helper function to format date to DD/MM/YYYY
            const formatDateToDDMMYYYY = (dateStr) => {
                if (!dateStr || dateStr === "N/A") return "N/A";

                const date = parseDate(dateStr);
                if (!date || isNaN(date.getTime())) return "N/A";

                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();

                return `${day}/${month}/${year}`;
            };

            const rows = [];

            // Row 1: Title
            rows.push(["RETAILER PASSBOOK REPORT"]);

            // Row 2: Empty
            rows.push([]);

            // Row 3: RETAILER DETAILS
            rows.push(["RETAILER DETAILS"]);

            // Row 4: Retailer Info
            rows.push([
                "Outlet Code:",
                passbookData.outletCode,
                "",
                "Outlet Name:",
                passbookData.shopName,
                "",
                "Retailer Name:",
                retailerInfo?.name || passbookData.retailerName || "N/A",
            ]);

            // Row 5 & 6: Empty rows
            rows.push([]);
            rows.push([]);

            // Row 7: SUMMARY label
            rows.push(["SUMMARY"]);

            // Row 8: Summary values
            rows.push([
                "Total Budget",
                `₹${(passbookData.tar || 0).toLocaleString()}`,
                "",
                "Total Paid",
                `₹${(passbookData.taPaid || 0).toLocaleString()}`,
                "",
                "Total Pending",
                `₹${(passbookData.taPending || 0).toLocaleString()}`,
            ]);

            // Row 9 & 10: Empty rows
            rows.push([]);
            rows.push([]);

            // Row 11: Header - ✅ Matches web version (10 columns)
            rows.push([
                "S.No",
                "Campaign Name",
                "Client",
                "Type",
                "Total Campaign Amount",
                "Paid",
                "Balance",
                "Date",
                "UTR Number",
                "Remarks",
            ]);

            // ✅ Data rows with continuous S.No and running balance calculation
            let serialNumber = 1;

            displayedCampaigns.forEach((campaign) => {
                const installments = campaign.installments || [];
                const totalBudget = campaign.tca;

                if (installments.length === 0) {
                    // ✅ No installments - show "-" for empty fields
                    rows.push([
                        serialNumber++,
                        campaign.campaignName,
                        campaign.campaignId?.client || "N/A",
                        campaign.campaignId?.type || "N/A",
                        totalBudget,
                        "-",
                        totalBudget,
                        "-",
                        "-",
                        "-",
                    ]);
                } else {
                    // ✅ Has installments - Calculate running balance
                    let cumulativePaid = 0;

                    // Sort installments by date (oldest first) for proper balance calculation
                    const sortedInstallments = [...installments].sort(
                        (a, b) => {
                            const dateA = parseDate(a.dateOfInstallment);
                            const dateB = parseDate(b.dateOfInstallment);
                            return dateA - dateB; // Ascending order
                        }
                    );

                    sortedInstallments.forEach((inst) => {
                        const paidAmount = inst.installmentAmount || 0;
                        cumulativePaid += paidAmount;
                        const balance = totalBudget - cumulativePaid;

                        rows.push([
                            serialNumber++,
                            campaign.campaignName,
                            campaign.campaignId?.client || "N/A",
                            campaign.campaignId?.type || "N/A",
                            totalBudget,
                            paidAmount, // ✅ Amount paid in THIS installment
                            balance, // ✅ Balance AFTER this payment
                            formatDateToDDMMYYYY(inst.dateOfInstallment),
                            inst.utrNumber || "-",
                            inst.remarks || "-",
                        ]);
                    });
                }
            });

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(rows);

            // Set column widths
            ws["!cols"] = [
                { wch: 8 }, // S.No
                { wch: 30 }, // Campaign Name
                { wch: 20 }, // Client
                { wch: 15 }, // Type
                { wch: 22 }, // Total Campaign Amount
                { wch: 15 }, // Paid
                { wch: 15 }, // Balance
                { wch: 18 }, // Date
                { wch: 18 }, // UTR Number
                { wch: 20 }, // Remarks
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Passbook");

            // Generate base64 string
            const wbout = XLSX.write(wb, {
                bookType: "xlsx",
                type: "base64",
            });

            // Save file
            const fileName = `My_Passbook_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            const fileUri = FileSystem.documentDirectory + fileName;

            // Write file using legacy API
            await FileSystem.writeAsStringAsync(fileUri, wbout, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();

            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: "Save Passbook Report",
                    UTI: "com.microsoft.excel.xlsx",
                });
                Alert.alert("Success", "Passbook exported successfully!");
            } else {
                Alert.alert(
                    "Success",
                    `File saved to: ${fileUri}\n\nYou can find it in your app's documents folder.`
                );
            }

            console.log("✅ Passbook exported successfully!");
        } catch (error) {
            console.error("❌ Export error:", error);
            Alert.alert("Error", `Failed to export passbook: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    // RENDER CAMPAIGN CARD
    const renderCampaignCard = ({ item: campaign, index }) => {
        const isExpanded = expandedCampaigns[campaign._id];
        const hasInstallments =
            campaign.installments && campaign.installments.length > 0;

        return (
            <View
                style={[
                    styles.campaignCard,
                    { marginTop: index === 0 ? 0 : 15 },
                ]}
            >
                {/* Campaign Header */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                        hasInstallments && toggleCampaignExpansion(campaign._id)
                    }
                >
                    <LinearGradient
                        colors={["#ea6666ff", "#a24b4bff"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.campaignHeader}
                    >
                        <View style={styles.campaignHeaderLeft}>
                            <View style={styles.campaignIconContainer}>
                                <MaterialCommunityIcons
                                    name="bullhorn"
                                    size={24}
                                    color="#fff"
                                />
                            </View>
                            <View style={styles.campaignHeaderText}>
                                <Text
                                    style={styles.campaignName}
                                    numberOfLines={1}
                                >
                                    {campaign.campaignName}
                                </Text>
                                <Text style={styles.campaignClient}>
                                    {campaign.campaignId?.client || "N/A"}
                                </Text>
                            </View>
                        </View>
                        {hasInstallments && (
                            <Ionicons
                                name={
                                    isExpanded ? "chevron-up" : "chevron-down"
                                }
                                size={24}
                                color="#fff"
                            />
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Budget Summary Cards */}
                <View style={styles.budgetCardsContainer}>
                    <View style={[styles.budgetMiniCard, styles.totalCard]}>
                        <MaterialCommunityIcons
                            name="wallet"
                            size={20}
                            color="#667eea"
                        />
                        <Text style={styles.budgetMiniLabel}>Budget</Text>
                        <Text
                            style={[styles.budgetMiniValue, styles.totalValue]}
                        >
                            ₹{(campaign.tca || 0).toLocaleString("en-IN")}
                        </Text>
                    </View>

                    <View style={[styles.budgetMiniCard, styles.paidCard]}>
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#10b981"
                        />
                        <Text style={styles.budgetMiniLabel}>Paid</Text>
                        <Text
                            style={[styles.budgetMiniValue, styles.paidValue]}
                        >
                            ₹{(campaign.cPaid || 0).toLocaleString("en-IN")}
                        </Text>
                    </View>

                    <View style={[styles.budgetMiniCard, styles.pendingCard]}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={20}
                            color="#f59e0b"
                        />
                        <Text style={styles.budgetMiniLabel}>Pending</Text>
                        <Text
                            style={[
                                styles.budgetMiniValue,
                                styles.pendingValue,
                            ]}
                        >
                            ₹{(campaign.cPending || 0).toLocaleString("en-IN")}
                        </Text>
                    </View>
                </View>

                {/* Installments Section - Collapsible */}
                {isExpanded && hasInstallments && (
                    <View style={styles.installmentsContainer}>
                        <View style={styles.installmentsDivider} />
                        <View style={styles.installmentsHeader}>
                            <MaterialCommunityIcons
                                name="format-list-bulleted"
                                size={18}
                                color="#667eea"
                            />
                            <Text style={styles.installmentsTitle}>
                                Payment History ({campaign.installments.length})
                            </Text>
                        </View>

                        {campaign.installments.map((inst, idx) => (
                            <View
                                key={inst._id}
                                style={[
                                    styles.installmentItem,
                                    idx === campaign.installments.length - 1 &&
                                        styles.lastInstallment,
                                ]}
                            >
                                <View style={styles.installmentLeft}>
                                    <View style={styles.installmentNumber}>
                                        <Text
                                            style={styles.installmentNumberText}
                                        >
                                            #{inst.installmentNo}
                                        </Text>
                                    </View>
                                    <View style={styles.installmentDetails}>
                                        <View style={styles.installmentRow}>
                                            <Ionicons
                                                name="calendar-outline"
                                                size={14}
                                                color="#64748b"
                                            />
                                            <Text
                                                style={styles.installmentDate}
                                            >
                                                {new Date(
                                                    inst.dateOfInstallment
                                                ).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </Text>
                                        </View>
                                        <View style={styles.installmentRow}>
                                            <MaterialCommunityIcons
                                                name="bank-transfer"
                                                size={14}
                                                color="#64748b"
                                            />
                                            <Text style={styles.installmentUTR}>
                                                {inst.utrNumber}
                                            </Text>
                                        </View>
                                        {inst.remarks && (
                                            <View style={styles.installmentRow}>
                                                <Ionicons
                                                    name="information-circle-outline"
                                                    size={14}
                                                    color="#64748b"
                                                />
                                                <Text
                                                    style={
                                                        styles.installmentRemarks
                                                    }
                                                    numberOfLines={2}
                                                >
                                                    {inst.remarks}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.installmentAmountContainer}>
                                    <Text style={styles.installmentAmount}>
                                        ₹
                                        {inst.installmentAmount.toLocaleString(
                                            "en-IN"
                                        )}
                                    </Text>
                                    <View style={styles.successBadge}>
                                        <Ionicons
                                            name="checkmark"
                                            size={12}
                                            color="#10b981"
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {!hasInstallments && (
                    <View style={styles.noInstallmentsContainer}>
                        <MaterialCommunityIcons
                            name="inbox-outline"
                            size={32}
                            color="#cbd5e1"
                        />
                        <Text style={styles.noInstallmentsText}>
                            No payments recorded yet
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    // RENDER HEADER
    const renderHeader = () => (
        <View style={styles.headerContent}>
            {/* Hero Section */}
            <LinearGradient
                colors={["#ea6666ff", "#a24b4bff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSection}
            >
                <View style={styles.heroHeader}>
                    <View>
                        <Text style={styles.heroGreeting}>My Passbook</Text>
                        <Text style={styles.heroName}>
                            {retailerInfo?.name || "Retailer"}
                        </Text>
                    </View>

                    <View style={styles.headerButtons}>
                        {passbookData && displayedCampaigns.length > 0 && (
                            <TouchableOpacity
                                style={styles.exportButton}
                                onPress={handleExportToExcel}
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="download"
                                        size={20}
                                        color="#fff"
                                    />
                                )}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={onRefresh}
                        >
                            <Ionicons name="refresh" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {passbookData && (
                    <View style={styles.totalBalanceCard}>
                        <Text style={styles.balanceLabel}>Total Budget</Text>
                        <Text style={styles.balanceAmount}>
                            ₹{(passbookData.tar || 0).toLocaleString("en-IN")}
                        </Text>
                        <View style={styles.balanceFooter}>
                            <View style={styles.balanceItem}>
                                <Text style={styles.balanceItemLabel}>
                                    Received
                                </Text>
                                <Text style={styles.balanceItemValueGreen}>
                                    ₹
                                    {(passbookData.taPaid || 0).toLocaleString(
                                        "en-IN"
                                    )}
                                </Text>
                            </View>
                            <View style={styles.balanceDivider} />
                            <View style={styles.balanceItem}>
                                <Text style={styles.balanceItemLabel}>
                                    Pending
                                </Text>
                                <Text style={styles.balanceItemValueOrange}>
                                    ₹
                                    {(
                                        passbookData.taPending || 0
                                    ).toLocaleString("en-IN")}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </LinearGradient>

            {/* Filters Section */}
            <View style={styles.filtersSection}>
                <TouchableOpacity
                    style={styles.filterToggleButton}
                    onPress={() => setShowFilters(!showFilters)}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={
                            showFilters
                                ? ["#ea6666ff", "#a24b4bff"]
                                : ["#f8fafc", "#f1f5f9"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.filterToggleGradient}
                    >
                        <MaterialCommunityIcons
                            name="filter-variant"
                            size={20}
                            color={showFilters ? "#fff" : "#667eea"}
                        />
                        <Text
                            style={[
                                styles.filterToggleText,
                                showFilters && styles.filterToggleTextActive,
                            ]}
                        >
                            {showFilters ? "Hide Filters" : "Show Filters"}
                        </Text>
                        {(selectedCampaign || fromDate || toDate) && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>
                                    {
                                        [
                                            selectedCampaign,
                                            fromDate,
                                            toDate,
                                        ].filter(Boolean).length
                                    }
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {showFilters && (
                    <Animated.View
                        style={[
                            styles.filterOptionsContainer,
                            {
                                opacity: filterAnimation,
                                transform: [
                                    {
                                        translateY: filterAnimation.interpolate(
                                            {
                                                inputRange: [0, 1],
                                                outputRange: [-20, 0],
                                            }
                                        ),
                                    },
                                ],
                            },
                        ]}
                    >
                        {/* Campaign Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>
                                <MaterialCommunityIcons
                                    name="bullhorn-outline"
                                    size={16}
                                    color="#667eea"
                                />{" "}
                                Campaign
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipScrollContent}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        !selectedCampaign &&
                                            styles.filterChipActive,
                                    ]}
                                    onPress={() => setSelectedCampaign(null)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            !selectedCampaign &&
                                                styles.filterChipTextActive,
                                        ]}
                                    >
                                        All
                                    </Text>
                                </TouchableOpacity>
                                {campaignOptions.map((campaign) => (
                                    <TouchableOpacity
                                        key={campaign._id}
                                        style={[
                                            styles.filterChip,
                                            selectedCampaign?._id ===
                                                campaign._id &&
                                                styles.filterChipActive,
                                        ]}
                                        onPress={() =>
                                            setSelectedCampaign(campaign)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                selectedCampaign?._id ===
                                                    campaign._id &&
                                                    styles.filterChipTextActive,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {campaign.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Date Filters */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={16}
                                    color="#667eea"
                                />{" "}
                                Date Range
                            </Text>
                            <View style={styles.dateFilterRow}>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowFromDatePicker(true)}
                                >
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color="#667eea"
                                    />
                                    <View
                                        style={styles.dateButtonTextContainer}
                                    >
                                        <Text style={styles.dateButtonLabel}>
                                            From
                                        </Text>
                                        <Text style={styles.dateButtonValue}>
                                            {fromDate
                                                ? fromDate.toLocaleDateString(
                                                      "en-IN",
                                                      {
                                                          day: "2-digit",
                                                          month: "short",
                                                      }
                                                  )
                                                : "Select"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.dateArrow}>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={16}
                                        color="#94a3b8"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowToDatePicker(true)}
                                >
                                    <Ionicons
                                        name="calendar"
                                        size={18}
                                        color="#667eea"
                                    />
                                    <View
                                        style={styles.dateButtonTextContainer}
                                    >
                                        <Text style={styles.dateButtonLabel}>
                                            To
                                        </Text>
                                        <Text style={styles.dateButtonValue}>
                                            {toDate
                                                ? toDate.toLocaleDateString(
                                                      "en-IN",
                                                      {
                                                          day: "2-digit",
                                                          month: "short",
                                                      }
                                                  )
                                                : "Select"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Date Pickers */}
                        {showFromDatePicker && (
                            <DateTimePicker
                                value={fromDate || new Date()}
                                mode="date"
                                display={
                                    Platform.OS === "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                onChange={(event, selectedDate) => {
                                    setShowFromDatePicker(false);
                                    if (selectedDate) setFromDate(selectedDate);
                                }}
                            />
                        )}

                        {showToDatePicker && (
                            <DateTimePicker
                                value={toDate || new Date()}
                                mode="date"
                                display={
                                    Platform.OS === "ios"
                                        ? "spinner"
                                        : "default"
                                }
                                onChange={(event, selectedDate) => {
                                    setShowToDatePicker(false);
                                    if (selectedDate) setToDate(selectedDate);
                                }}
                            />
                        )}

                        {/* Clear Filters */}
                        {(selectedCampaign || fromDate || toDate) && (
                            <TouchableOpacity
                                style={styles.clearFiltersButton}
                                onPress={handleClearFilters}
                            >
                                <MaterialCommunityIcons
                                    name="filter-remove"
                                    size={18}
                                    color="#fff"
                                />
                                <Text style={styles.clearFiltersText}>
                                    Clear All Filters
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Campaign Details</Text>
                <View style={styles.campaignCount}>
                    <Text style={styles.campaignCountText}>
                        {displayedCampaigns.length}
                    </Text>
                </View>
            </View>
        </View>
    );

    // RENDER EMPTY STATE
    const renderEmpty = () => (
        <View style={styles.emptyState}>
            {passbookData ? (
                <View style={styles.emptyContent}>
                    <LinearGradient
                        colors={["#f8fafc", "#f1f5f9"]}
                        style={styles.emptyIconContainer}
                    >
                        <MaterialCommunityIcons
                            name="filter-remove-outline"
                            size={48}
                            color="#94a3b8"
                        />
                    </LinearGradient>
                    <Text style={styles.emptyTitle}>No matching campaigns</Text>
                    <Text style={styles.emptySubtext}>
                        Try adjusting your filters to see more results
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={handleClearFilters}
                    >
                        <Text style={styles.emptyButtonText}>
                            Clear Filters
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.emptyContent}>
                    <LinearGradient
                        colors={["#f8fafc", "#f1f5f9"]}
                        style={styles.emptyIconContainer}
                    >
                        <MaterialCommunityIcons
                            name="book-open-blank-variant"
                            size={48}
                            color="#94a3b8"
                        />
                    </LinearGradient>
                    <Text style={styles.emptyTitle}>No passbook data</Text>
                    <Text style={styles.emptySubtext}>
                        Budget records will appear here once campaigns are
                        assigned
                    </Text>
                </View>
            )}
        </View>
    );

    // LOADING STATE
    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, styles.centerContent]}
                edges={["top", "left", "right"]}
            >
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Loading your passbook...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="light" />

            {/* Header */}
            <Header />

            {/* Campaign List */}
            <FlatList
                data={displayedCampaigns}
                renderItem={renderCampaignCard}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    ...commonPassbookStyles,
});

export default PassbookScreen;
