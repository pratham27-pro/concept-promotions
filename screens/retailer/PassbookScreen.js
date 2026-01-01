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
import Header from "../../components/common/Header";

const API_BASE_URL = "https://conceptpromotions.in/api";

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

    // ===============================
    // FETCH RETAILER INFO
    // ===============================
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

    // ===============================
    // FETCH ASSIGNED CAMPAIGNS
    // ===============================
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

    // ===============================
    // FETCH PASSBOOK DATA
    // ===============================
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

    // ===============================
    // APPLY FILTERS
    // ===============================
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

    // ===============================
    // CLEAR FILTERS
    // ===============================
    const handleClearFilters = () => {
        setSelectedCampaign(null);
        setFromDate(null);
        setToDate(null);
        if (passbookData) {
            setDisplayedCampaigns(passbookData.campaigns || []);
        }
    };

    // ===============================
    // TOGGLE CAMPAIGN EXPANSION
    // ===============================
    const toggleCampaignExpansion = (campaignId) => {
        setExpandedCampaigns((prev) => ({
            ...prev,
            [campaignId]: !prev[campaignId],
        }));
    };

    // ===============================
    // REFRESH
    // ===============================
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRetailerInfo();
        setRefreshing(false);
    };

    // ===============================
    // RENDER CAMPAIGN CARD
    // ===============================
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

    // ===============================
    // RENDER HEADER
    // ===============================
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
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={onRefresh}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                    </TouchableOpacity>
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

    // ===============================
    // RENDER EMPTY STATE
    // ===============================
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

    // ===============================
    // LOADING STATE
    // ===============================
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
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: "#64748b",
        fontWeight: "500",
    },
    listContainer: {
        paddingBottom: Platform.OS === "ios" ? 100 : 140,
    },

    // Header Content
    headerContent: {
        marginBottom: 20,
    },

    // Hero Section
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    heroHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    heroGreeting: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 4,
        fontWeight: "500",
    },
    heroName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },

    // Total Balance Card
    totalBalanceCard: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    balanceLabel: {
        fontSize: 13,
        color: "#64748b",
        marginBottom: 8,
        fontWeight: "500",
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 16,
    },
    balanceFooter: {
        flexDirection: "row",
        alignItems: "center",
    },
    balanceItem: {
        flex: 1,
    },
    balanceItemLabel: {
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 4,
    },
    balanceItemValueGreen: {
        fontSize: 16,
        fontWeight: "700",
        color: "#10b981",
    },
    balanceItemValueOrange: {
        fontSize: 16,
        fontWeight: "700",
        color: "#f59e0b",
    },
    balanceDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#e2e8f0",
        marginHorizontal: 16,
    },

    // Filters Section
    filtersSection: {
        paddingHorizontal: 20,
        marginTop: -15,
        marginBottom: 20,
    },
    filterToggleButton: {
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    filterToggleGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 8,
    },
    filterToggleText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#667eea",
    },
    filterToggleTextActive: {
        color: "#fff",
    },
    filterBadge: {
        backgroundColor: "#ef4444",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    filterBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },

    // Filter Options
    filterOptionsContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    filterGroup: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 12,
    },

    // Campaign Chips
    chipScrollContent: {
        paddingRight: 20,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#f1f5f9",
        marginRight: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    filterChipActive: {
        backgroundColor: "#667eea",
        borderColor: "#667eea",
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
    },
    filterChipTextActive: {
        color: "#fff",
    },

    // Date Filters
    dateFilterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    dateButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    dateButtonTextContainer: {
        flex: 1,
    },
    dateButtonLabel: {
        fontSize: 11,
        color: "#94a3b8",
        marginBottom: 2,
    },
    dateButtonValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1e293b",
    },
    dateArrow: {
        marginTop: 10,
    },

    // Clear Filters Button
    clearFiltersButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    clearFiltersText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    // Section Header
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e293b",
    },
    campaignCount: {
        backgroundColor: "#667eea",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    campaignCountText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },

    // Campaign Card
    campaignCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },

    // Campaign Header
    campaignHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    campaignHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 12,
    },
    campaignIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    campaignHeaderText: {
        flex: 1,
    },
    campaignName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 2,
    },
    campaignClient: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
    },

    // Budget Mini Cards
    budgetCardsContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 10,
    },
    budgetMiniCard: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    budgetMiniLabel: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 6,
        marginBottom: 4,
        fontWeight: "500",
    },
    budgetMiniValue: {
        fontSize: 14,
        fontWeight: "bold",
    },
    totalValue: {
        color: "#667eea",
    },
    paidValue: {
        color: "#10b981",
    },
    pendingValue: {
        color: "#f59e0b",
    },

    // Installments
    installmentsContainer: {
        paddingBottom: 16,
    },
    installmentsDivider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginBottom: 16,
    },
    installmentsHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    installmentsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
    },
    installmentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f8fafc",
    },
    lastInstallment: {
        borderBottomWidth: 0,
    },
    installmentLeft: {
        flexDirection: "row",
        flex: 1,
        marginRight: 12,
    },
    installmentNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ede9fe",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    installmentNumberText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#667eea",
    },
    installmentDetails: {
        flex: 1,
    },
    installmentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    installmentDate: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "500",
    },
    installmentUTR: {
        fontSize: 12,
        color: "#64748b",
    },
    installmentRemarks: {
        fontSize: 11,
        color: "#94a3b8",
        fontStyle: "italic",
    },
    installmentAmountContainer: {
        alignItems: "flex-end",
    },
    installmentAmount: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#10b981",
        marginBottom: 4,
    },
    successBadge: {
        backgroundColor: "#d1fae5",
        borderRadius: 10,
        padding: 4,
    },

    // No Installments
    noInstallmentsContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    noInstallmentsText: {
        fontSize: 14,
        color: "#94a3b8",
        marginTop: 12,
        fontStyle: "italic",
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyContent: {
        alignItems: "center",
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: 20,
    },
    emptyButton: {
        marginTop: 24,
        backgroundColor: "#667eea",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default PassbookScreen;
