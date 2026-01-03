import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header";
import { commonPassbookStyles } from "../../components/styles/passbookStyles";
import { API_BASE_URL } from "../../url/base";

const EmployeePassbookScreen = () => {
    // Employee Info
    const [employeeInfo, setEmployeeInfo] = useState(null);

    // Employee-Retailer Mappings
    const [employeeRetailerMappings, setEmployeeRetailerMappings] = useState(
        []
    );
    const [retailerOptions, setRetailerOptions] = useState([]);

    // Filters
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // Passbook Data
    const [passbookData, setPassbookData] = useState(null);
    const [displayedCampaigns, setDisplayedCampaigns] = useState([]);
    const [campaignOptions, setCampaignOptions] = useState([]);

    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCampaigns, setExpandedCampaigns] = useState({});
    const [showRetailerSelector, setShowRetailerSelector] = useState(false);

    // Fetch data on mount
    useFocusEffect(
        useCallback(() => {
            fetchEmployeeInfo();
        }, [])
    );

    // FETCH EMPLOYEE INFO
    const fetchEmployeeInfo = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                Alert.alert("Error", "Please login again");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/employee/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch employee info");
            }

            const data = await response.json();
            setEmployeeInfo(data.employee);

            // Fetch employee-retailer mappings
            await fetchEmployeeRetailerMappings(data.employee._id, token);
        } catch (err) {
            console.error("Error fetching employee info:", err);
            Alert.alert("Error", "Failed to load employee information");
        } finally {
            setLoading(false);
        }
    };

    // FETCH EMPLOYEE-RETAILER MAPPINGS
    const fetchEmployeeRetailerMappings = async (employeeId, token) => {
        try {
            // Fetch all active campaigns
            const campaignsRes = await fetch(
                `${API_BASE_URL}/admin/campaigns`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const campaignsData = await campaignsRes.json();
            const activeCampaigns = (campaignsData.campaigns || []).filter(
                (c) => c.isActive === true
            );

            console.log(`📋 Found ${activeCampaigns.length} active campaigns`);

            const allMappings = [];

            // For each campaign, fetch employee-retailer mapping
            for (const campaign of activeCampaigns) {
                try {
                    const mappingRes = await fetch(
                        `${API_BASE_URL}/admin/campaign/${campaign._id}/employee-retailer-mapping`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    // ✅ Check if response is OK
                    if (!mappingRes.ok) {
                        console.warn(
                            `⚠️ Failed to fetch mapping for campaign ${campaign._id}: ${mappingRes.status}`
                        );
                        continue; // Skip this campaign
                    }

                    const mappingData = await mappingRes.json();

                    // ✅ Check if mappingData has employees array
                    if (
                        !mappingData ||
                        !mappingData.employees ||
                        !Array.isArray(mappingData.employees)
                    ) {
                        console.warn(
                            `⚠️ Invalid mapping data structure for campaign ${campaign._id}`
                        );
                        continue; // Skip this campaign
                    }

                    const currentEmployee = mappingData.employees.find(
                        (emp) => emp._id === employeeId || emp.id === employeeId
                    );

                    // ✅ Check if employee found and has retailers
                    if (
                        currentEmployee &&
                        currentEmployee.retailers &&
                        Array.isArray(currentEmployee.retailers)
                    ) {
                        currentEmployee.retailers.forEach((retailer) => {
                            allMappings.push({
                                campaignId: campaign._id,
                                campaignName: campaign.name,
                                campaignData: campaign,
                                retailerId: retailer._id || retailer.id,
                                retailerData: retailer,
                            });
                        });
                        console.log(
                            `✅ Campaign ${campaign.name}: Found ${currentEmployee.retailers.length} retailers`
                        );
                    } else {
                        console.log(
                            `ℹ️ Campaign ${campaign.name}: No retailers assigned to this employee`
                        );
                    }
                } catch (err) {
                    console.error(
                        `❌ Error fetching mapping for campaign ${campaign._id}:`,
                        err.message
                    );
                    // Continue with other campaigns even if one fails
                    continue;
                }
            }

            console.log(`✅ Total mappings found: ${allMappings.length}`);

            setEmployeeRetailerMappings(allMappings);

            // Extract unique retailers
            const uniqueRetailers = allMappings.reduce((acc, mapping) => {
                if (!acc.find((r) => r.value === mapping.retailerId)) {
                    acc.push({
                        value: mapping.retailerId,
                        label: `${mapping.retailerData.uniqueId || ""} - ${
                            mapping.retailerData.shopDetails?.shopName || "N/A"
                        }`,
                        data: mapping.retailerData,
                    });
                }
                return acc;
            }, []);

            console.log(`✅ Unique retailers: ${uniqueRetailers.length}`);
            setRetailerOptions(uniqueRetailers);

            if (uniqueRetailers.length === 0) {
                Alert.alert(
                    "Info",
                    "No retailers are currently assigned to you"
                );
            }
        } catch (err) {
            console.error("❌ Error fetching employee-retailer mappings:", err);
            Alert.alert("Error", "Failed to load assigned retailers");
        }
    };

    // FETCH PASSBOOK DATA
    useEffect(() => {
        if (selectedRetailer) {
            fetchPassbookData();
        } else {
            resetPassbookData();
        }
    }, [selectedRetailer]);

    const fetchPassbookData = async () => {
        if (!selectedRetailer) return;

        try {
            const token = await AsyncStorage.getItem("userToken");
            const params = new URLSearchParams();
            params.append("retailerId", selectedRetailer.value);

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

                    // Filter campaigns: Only show campaigns where employee is assigned
                    const assignedCampaignIds = employeeRetailerMappings
                        .filter((m) => m.retailerId === selectedRetailer.value)
                        .map((m) => m.campaignId);

                    const filteredCampaigns = budgetRecord.campaigns.filter(
                        (c) => assignedCampaignIds.includes(c.campaignId._id)
                    );

                    if (filteredCampaigns.length === 0) {
                        Alert.alert(
                            "Info",
                            "No campaigns assigned to you for this retailer"
                        );
                        resetPassbookData();
                        return;
                    }

                    setPassbookData({
                        ...budgetRecord,
                        campaigns: filteredCampaigns,
                    });

                    setDisplayedCampaigns(filteredCampaigns);

                    // Set campaign options
                    const campaignOpts = filteredCampaigns.map((c) => ({
                        value: c.campaignId._id,
                        label: c.campaignName,
                        data: c.campaignId,
                    }));
                    setCampaignOptions(campaignOpts);
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
        setCampaignOptions([]);
    };

    // APPLY FILTERS
    useEffect(() => {
        if (passbookData) {
            applyFilters();
        }
    }, [selectedCampaign, fromDate, toDate, passbookData]);

    const applyFilters = () => {
        if (!passbookData) return;

        let filtered = [...passbookData.campaigns];

        // Filter by Campaign first
        if (selectedCampaign) {
            filtered = filtered.filter(
                (c) => c.campaignId._id === selectedCampaign.value
            );
        }

        // ✅ Filter by Date Range (but keep campaigns even if no matching installments)
        if (fromDate || toDate) {
            filtered = filtered.map((campaign) => {
                // Filter installments by date range
                const filteredInstallments = campaign.installments.filter(
                    (inst) => {
                        // Parse date from dd/mm/yyyy or ISO format
                        const instDateString = inst.dateOfInstallment;
                        let instDate;

                        if (instDateString.includes("/")) {
                            const [day, month, year] =
                                instDateString.split("/");
                            instDate = new Date(`${year}-${month}-${day}`);
                        } else {
                            instDate = new Date(instDateString);
                        }

                        const from = fromDate ? new Date(fromDate) : null;
                        const to = toDate ? new Date(toDate) : null;

                        if (from) from.setHours(0, 0, 0, 0);
                        if (to) to.setHours(23, 59, 59, 999);
                        instDate.setHours(0, 0, 0, 0);

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

                // ✅ Recalculate paid and pending based on filtered installments
                const filteredCPaid = filteredInstallments.reduce(
                    (sum, inst) => sum + (inst.installmentAmount || 0),
                    0
                );
                const filteredCPending = campaign.tca - filteredCPaid;

                // ✅ Return campaign with filtered installments (even if empty)
                return {
                    ...campaign,
                    installments: filteredInstallments,
                    cPaid: filteredCPaid,
                    cPending: filteredCPending,
                };
            });
            // ✅ DON'T filter out campaigns with zero installments
            // Remove this line: .filter((campaign) => campaign.installments.length > 0);
        }

        setDisplayedCampaigns(filtered);
    };

    // CLEAR FILTERS
    const handleClearFilters = () => {
        setSelectedRetailer(null);
        setSelectedCampaign(null);
        setFromDate(null);
        setToDate(null);
        resetPassbookData();
    };

    // CALCULATE SUMMARY
    const getFilteredSummary = () => {
        if (!displayedCampaigns.length) {
            return {
                filteredTAR: 0,
                filteredTAPaid: 0,
                filteredTAPending: 0,
            };
        }

        const filteredTAR = displayedCampaigns.reduce(
            (sum, campaign) => sum + (campaign.tca || 0),
            0
        );

        const filteredTAPaid = displayedCampaigns.reduce(
            (sum, campaign) => sum + (campaign.cPaid || 0),
            0
        );

        const filteredTAPending = filteredTAR - filteredTAPaid;

        return { filteredTAR, filteredTAPaid, filteredTAPending };
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
        await fetchEmployeeInfo();
        setRefreshing(false);
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

                {/* Installments - Collapsible */}
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
                                                {inst.dateOfInstallment}
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
                            {fromDate || toDate
                                ? "No payments in this date range"
                                : "No payments recorded yet"}
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
                        <Text style={styles.heroGreeting}>
                            Employee Passbook
                        </Text>
                        <Text style={styles.heroName}>
                            {employeeInfo?.name || "Employee"}
                        </Text>
                        {employeeInfo?.employeeId && (
                            <Text style={styles.heroEmployeeId}>
                                ID: {employeeInfo.employeeId}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={onRefresh}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Summary Card */}
                {passbookData && (
                    <View style={styles.totalBalanceCard}>
                        <Text style={styles.balanceLabel}>
                            {selectedRetailer?.data?.shopDetails?.shopName ||
                                "Retailer"}
                        </Text>
                        <Text style={styles.balanceSubLabel}>
                            {selectedRetailer?.data?.uniqueId || "N/A"}
                        </Text>
                        <View style={styles.balanceFooter}>
                            <View style={styles.balanceItem}>
                                <Text style={styles.balanceItemLabel}>
                                    Total Budget
                                </Text>
                                <Text style={styles.balanceItemValueBlue}>
                                    ₹
                                    {getFilteredSummary().filteredTAR.toLocaleString(
                                        "en-IN"
                                    )}
                                </Text>
                            </View>
                            <View style={styles.balanceDivider} />
                            <View style={styles.balanceItem}>
                                <Text style={styles.balanceItemLabel}>
                                    Paid
                                </Text>
                                <Text style={styles.balanceItemValueGreen}>
                                    ₹
                                    {getFilteredSummary().filteredTAPaid.toLocaleString(
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
                                    {getFilteredSummary().filteredTAPending.toLocaleString(
                                        "en-IN"
                                    )}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </LinearGradient>

            {/* Retailer Selector */}
            <View style={styles.filtersSection}>
                <Text style={styles.filterSectionTitle}>Select Retailer *</Text>
                <TouchableOpacity
                    style={styles.retailerSelectorButton}
                    onPress={() =>
                        setShowRetailerSelector(!showRetailerSelector)
                    }
                >
                    <View style={styles.retailerSelectorLeft}>
                        <MaterialCommunityIcons
                            name="store"
                            size={20}
                            color="#667eea"
                        />
                        <Text style={styles.retailerSelectorText}>
                            {selectedRetailer
                                ? selectedRetailer.label
                                : "Select a retailer"}
                        </Text>
                    </View>
                    <Ionicons
                        name={
                            showRetailerSelector ? "chevron-up" : "chevron-down"
                        }
                        size={20}
                        color="#667eea"
                    />
                </TouchableOpacity>

                {showRetailerSelector && (
                    <ScrollView style={styles.retailerList}>
                        {retailerOptions.map((retailer) => (
                            <TouchableOpacity
                                key={retailer.value}
                                style={[
                                    styles.retailerItem,
                                    selectedRetailer?.value ===
                                        retailer.value &&
                                        styles.retailerItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedRetailer(retailer);
                                    setShowRetailerSelector(false);
                                    setSelectedCampaign(null);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="store-outline"
                                    size={18}
                                    color={
                                        selectedRetailer?.value ===
                                        retailer.value
                                            ? "#667eea"
                                            : "#64748b"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.retailerItemText,
                                        selectedRetailer?.value ===
                                            retailer.value &&
                                            styles.retailerItemTextSelected,
                                    ]}
                                >
                                    {retailer.label}
                                </Text>
                                {selectedRetailer?.value === retailer.value && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color="#667eea"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                        {retailerOptions.length === 0 && (
                            <Text style={styles.noRetailersText}>
                                No retailers assigned to you
                            </Text>
                        )}
                    </ScrollView>
                )}

                {/* Additional Filters - Only show when retailer is selected */}
                {selectedRetailer && (
                    <>
                        <Text style={styles.filterSectionTitle}>
                            Optional Filters
                        </Text>

                        {/* Campaign Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>
                                <MaterialCommunityIcons
                                    name="bullhorn-outline"
                                    size={16}
                                    color="#f14d4dff"
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
                                        key={campaign.value}
                                        style={[
                                            styles.filterChip,
                                            selectedCampaign?.value ===
                                                campaign.value &&
                                                styles.filterChipActive,
                                        ]}
                                        onPress={() =>
                                            setSelectedCampaign(campaign)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                selectedCampaign?.value ===
                                                    campaign.value &&
                                                    styles.filterChipTextActive,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {campaign.label}
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
                                onPress={() => {
                                    setSelectedCampaign(null);
                                    setFromDate(null);
                                    setToDate(null);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name="filter-remove"
                                    size={18}
                                    color="#fff"
                                />
                                <Text style={styles.clearFiltersText}>
                                    Clear Filters
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>

            {/* Section Title */}
            {passbookData && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Campaign Details</Text>
                    <View style={styles.campaignCount}>
                        <Text style={styles.campaignCountText}>
                            {displayedCampaigns.length}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );

    // RENDER EMPTY STATE
    const renderEmpty = () => (
        <View style={styles.emptyState}>
            {!selectedRetailer ? (
                <View style={styles.emptyContent}>
                    <LinearGradient
                        colors={["#f8fafc", "#f1f5f9"]}
                        style={styles.emptyIconContainer}
                    >
                        <MaterialCommunityIcons
                            name="store-alert-outline"
                            size={48}
                            color="#94a3b8"
                        />
                    </LinearGradient>
                    <Text style={styles.emptyTitle}>
                        Select a retailer to continue
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Choose from the assigned retailers above
                    </Text>
                </View>
            ) : passbookData ? (
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
                        No records found for this retailer
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

            <Header />

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

// Keep the same styles from the previous retailer passbook, just add these additional ones:
const styles = StyleSheet.create({
    ...commonPassbookStyles,
    // Employee-specific styles
    heroEmployeeId: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    balanceSubLabel: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 16,
    },
    balanceItemValueBlue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#667eea",
    },
    filterSectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 10,
        marginTop: 15,
    },
    retailerSelectorButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    retailerSelectorLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    retailerSelectorText: {
        fontSize: 14,
        color: "#1e293b",
        flex: 1,
    },
    retailerList: {
        maxHeight: 200,
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    retailerItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    retailerItemSelected: {
        backgroundColor: "#f8fafc",
    },
    retailerItemText: {
        flex: 1,
        fontSize: 14,
        color: "#64748b",
    },
    retailerItemTextSelected: {
        color: "#667eea",
        fontWeight: "600",
    },
    noRetailersText: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        padding: 20,
    },
});

export default EmployeePassbookScreen;
