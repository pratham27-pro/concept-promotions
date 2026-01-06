import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import * as XLSX from "xlsx";

import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import { API_BASE_URL } from "../../url/base";

const ClientPassbookScreen = () => {
    // ---- API DATA STATE ----
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);

    // ---- FILTER STATE ----
    const [campaignStatus, setCampaignStatus] = useState({
        label: "Active",
        value: "active",
    });
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [selectedRetailers, setSelectedRetailers] = useState([]);

    // ---- DATE FILTER STATE ----
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // ---- PAGINATION STATE ----
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

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
    const [statusItems] = useState([
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "All Campaigns", value: "all" },
    ]);

    // ---- DROPDOWN OPEN STATES ----
    const [statusOpen, setStatusOpen] = useState(false);
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
            const campaigns = campaignsData.campaigns || [];
            console.log(`✅ Loaded ${campaigns.length} campaigns`);

            // 2️⃣ Fetch All Budgets
            const budgetsRes = await fetch(`${API_BASE_URL}/budgets`, {
                headers,
            });
            const budgetsData = await budgetsRes.json();
            const budgetsArray = budgetsData.budgets || [];
            console.log(`✅ Loaded ${budgetsArray.length} budgets`);

            setAllCampaigns(campaigns);
            setBudgets(budgetsArray);
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

    // ---- FILTER CAMPAIGNS BY STATUS ----
    const filteredCampaigns = useMemo(() => {
        if (campaignStatus.value === "all") return allCampaigns;
        const isActive = campaignStatus.value === "active";
        return allCampaigns.filter((c) => c.isActive === isActive);
    }, [allCampaigns, campaignStatus]);

    // ---- COMPUTE STATE OPTIONS FROM CAMPAIGNS ----
    const stateOptions = useMemo(() => {
        const stateSet = new Set();

        filteredCampaigns.forEach((campaign) => {
            (campaign.assignedRetailers || []).forEach((retailerAssignment) => {
                const state =
                    retailerAssignment.retailerId?.shopDetails?.shopAddress
                        ?.state;
                if (state) stateSet.add(state);
            });
        });

        return Array.from(stateSet).map((state) => ({
            label: state,
            value: state,
        }));
    }, [filteredCampaigns]);

    useEffect(() => {
        setStateItems(stateOptions);
    }, [stateOptions]);

    // ---- COMPUTE CAMPAIGN OPTIONS ----
    const campaignOptions = useMemo(() => {
        return filteredCampaigns.map((c) => ({
            label: c.name,
            value: c._id,
        }));
    }, [filteredCampaigns]);

    useEffect(() => {
        setCampaignItems(campaignOptions);
    }, [campaignOptions]);

    // ---- COMPUTE RETAILER OPTIONS FROM CAMPAIGNS ----
    const retailerOptions = useMemo(() => {
        const retailersMap = new Map();

        filteredCampaigns.forEach((campaign) => {
            (campaign.assignedRetailers || []).forEach((retailerAssignment) => {
                const retailer = retailerAssignment.retailerId;
                if (retailer && retailer._id) {
                    const retailerId = retailer._id;
                    const outletCode = retailer.uniqueId || "N/A";
                    const shopName = retailer.shopDetails?.shopName || "N/A";

                    if (!retailersMap.has(retailerId)) {
                        retailersMap.set(retailerId, {
                            value: retailerId,
                            label: `${outletCode} - ${shopName}`,
                        });
                    }
                }
            });
        });

        return Array.from(retailersMap.values());
    }, [filteredCampaigns]);

    useEffect(() => {
        setRetailerItems(retailerOptions);
    }, [retailerOptions]);

    // ---- DATE HELPER FUNCTIONS ----
    const parseDate = (dateStr) => {
        if (!dateStr) return null;

        if (dateStr.includes("-")) {
            return new Date(dateStr);
        } else if (dateStr.includes("/")) {
            const parts = dateStr.split("/");
            if (parts.length !== 3) return null;
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }

        return null;
    };

    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr || dateStr === "N/A") return "N/A";

        const date = parseDate(dateStr);
        if (!date || isNaN(date.getTime())) return "N/A";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const isDateInRange = (dateStr, start, end) => {
        if (!start && !end) return true;

        const date = parseDate(dateStr);
        if (!date || isNaN(date.getTime())) return false;

        const startDateObj = start ? new Date(start) : null;
        const endDateObj = end ? new Date(end) : null;

        date.setHours(0, 0, 0, 0);
        if (startDateObj) startDateObj.setHours(0, 0, 0, 0);
        if (endDateObj) endDateObj.setHours(0, 0, 0, 0);

        if (startDateObj && endDateObj) {
            return date >= startDateObj && date <= endDateObj;
        } else if (startDateObj) {
            return date >= startDateObj;
        } else if (endDateObj) {
            return date <= endDateObj;
        }
        return true;
    };

    // ---- BUILD PASSBOOK DISPLAY DATA WITH ALL FILTERS ----
    const allDisplayData = useMemo(() => {
        const data = [];

        filteredCampaigns.forEach((campaign) => {
            (campaign.assignedRetailers || []).forEach((retailerAssignment) => {
                const retailer = retailerAssignment.retailerId;

                if (!retailer || !retailer._id) return;

                const retailerId = retailer._id;
                const outletCode = retailer.uniqueId || "N/A";
                const shopName = retailer.shopDetails?.shopName || "N/A";
                const state = retailer.shopDetails?.shopAddress?.state || "N/A";

                // Apply State Filter
                if (selectedStates.length > 0) {
                    const stateValues = selectedStates.map((s) => s.value);
                    if (!stateValues.includes(state)) return;
                }

                // Apply Campaign Filter
                if (selectedCampaigns.length > 0) {
                    const campaignIds = selectedCampaigns.map((c) => c.value);
                    if (!campaignIds.includes(campaign._id)) return;
                }

                // Apply Retailer Filter
                if (selectedRetailers.length > 0) {
                    const retailerIds = selectedRetailers.map((r) => r.value);
                    if (!retailerIds.includes(retailerId)) return;
                }

                // Find budget data for this retailer
                const budget = budgets.find((b) => {
                    if (!b || !b.retailerId) return false;
                    const budgetRetailerId =
                        typeof b.retailerId === "object"
                            ? b.retailerId._id
                            : b.retailerId;
                    return budgetRetailerId === retailerId;
                });

                if (budget && budget.campaigns) {
                    const campaignBudget = budget.campaigns.find((c) => {
                        if (!c || !c.campaignId) return false;
                        const campaignIdValue =
                            typeof c.campaignId === "object"
                                ? c.campaignId._id
                                : c.campaignId;
                        return campaignIdValue === campaign._id;
                    });

                    if (campaignBudget) {
                        // Apply Date Filter on Installments
                        const filteredInstallments = (
                            campaignBudget.installments || []
                        ).filter((inst) =>
                            isDateInRange(
                                inst.dateOfInstallment,
                                startDate,
                                endDate
                            )
                        );

                        const cPaid = filteredInstallments.reduce(
                            (sum, inst) => sum + (inst.installmentAmount || 0),
                            0
                        );

                        const cPending = campaignBudget.tca - cPaid;

                        let lastPaymentDate = "N/A";
                        if (filteredInstallments.length > 0) {
                            const sortedInstallments = [
                                ...filteredInstallments,
                            ].sort((a, b) => {
                                const dateA = parseDate(a.dateOfInstallment);
                                const dateB = parseDate(b.dateOfInstallment);
                                return dateB - dateA;
                            });
                            lastPaymentDate =
                                sortedInstallments[0].dateOfInstallment;
                        }

                        // Skip if date filter is applied but no installments match
                        if (
                            (startDate || endDate) &&
                            filteredInstallments.length === 0
                        ) {
                            return;
                        }

                        data.push({
                            outletCode,
                            shopName,
                            state,
                            campaignName: campaign.name,
                            campaignId: campaign._id,
                            tca: campaignBudget.tca || 0,
                            cPaid,
                            cPending,
                            lastPaymentDate,
                            installments: filteredInstallments,
                        });
                    }
                }
            });
        });

        return data;
    }, [
        filteredCampaigns,
        budgets,
        selectedStates,
        selectedCampaigns,
        selectedRetailers,
        startDate,
        endDate,
    ]);

    // ---- PAGINATION LOGIC ----
    const totalRecords = allDisplayData.length;
    const totalPages = Math.ceil(totalRecords / limit);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return allDisplayData.slice(startIndex, endIndex);
    }, [allDisplayData, currentPage, limit]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        selectedStates,
        selectedCampaigns,
        selectedRetailers,
        startDate,
        endDate,
        campaignStatus,
    ]);

    // ---- CALCULATE SUMMARY ----
    const summary = useMemo(() => {
        const totalAmount = allDisplayData.reduce(
            (sum, p) => sum + (p.tca || 0),
            0
        );
        const totalPaid = allDisplayData.reduce(
            (sum, p) => sum + (p.cPaid || 0),
            0
        );
        const totalPending = allDisplayData.reduce(
            (sum, p) => sum + (p.cPending || 0),
            0
        );

        return {
            totalAmount,
            totalPaid,
            totalPending,
        };
    }, [allDisplayData]);

    // ---- PAGINATION HELPERS ----
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push("...");
                pageNumbers.push(currentPage - 1);
                pageNumbers.push(currentPage);
                pageNumbers.push(currentPage + 1);
                pageNumbers.push("...");
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // ---- EXPORT TO EXCEL (Using Legacy FileSystem API) ----
    const handleExportToExcel = async () => {
        if (allDisplayData.length === 0) {
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
            rows.push(["CLIENT PASSBOOK REPORT"]);

            // Row 2: Empty
            rows.push([]);

            // Row 3: SUMMARY label
            rows.push(["SUMMARY"]);

            // Row 4: Summary values
            rows.push([
                "Total Budget",
                `₹${summary.totalAmount.toLocaleString()}`,
                "",
                "Total Paid Amount",
                `₹${summary.totalPaid.toLocaleString()}`,
                "",
                "Total Pending Amount",
                `₹${summary.totalPending.toLocaleString()}`,
            ]);

            // Row 5 & 6: Empty rows
            rows.push([]);
            rows.push([]);

            // Row 7: Header
            rows.push([
                "S.No",
                "State",
                "Outlet Name",
                "Outlet Code",
                "Campaign Name",
                "Total Campaign Amount",
                "Paid",
                "Balance",
                "Date",
                "UTR Number",
                "Remarks",
            ]);

            // ✅ Data rows with continuous S.No and running balance calculation
            let serialNumber = 1;

            allDisplayData.forEach((record) => {
                const installments = record.installments || [];
                const totalBudget = record.tca;

                if (installments.length === 0) {
                    // ✅ No installments - show "-" for empty fields
                    rows.push([
                        serialNumber++,
                        record.state,
                        record.shopName,
                        record.outletCode,
                        record.campaignName,
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
                            record.state,
                            record.shopName,
                            record.outletCode,
                            record.campaignName,
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
                { wch: 15 }, // State
                { wch: 25 }, // Outlet Name
                { wch: 15 }, // Outlet Code
                { wch: 25 }, // Campaign Name
                { wch: 20 }, // Total Campaign Amount
                { wch: 15 }, // Paid
                { wch: 15 }, // Balance
                { wch: 18 }, // Date
                { wch: 15 }, // UTR Number
                { wch: 18 }, // Remarks
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
            const fileName = `Client_Passbook_${
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

    // ---- HANDLE FILTER CHANGES ----
    const handleStatusChange = (callback) => {
        const newValue =
            typeof callback === "function"
                ? callback(campaignStatus.value)
                : callback;
        const newStatus = statusItems.find((item) => item.value === newValue);
        if (newStatus) {
            setCampaignStatus(newStatus);
            setSelectedStates([]);
            setSelectedCampaigns([]);
            setSelectedRetailers([]);
        }
    };

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
        setStartDate(null);
        setEndDate(null);
    };

    // ---- DATE PICKER HANDLERS ----
    const onStartDateChange = (event, selectedDate) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
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
                    {allDisplayData.length > 0 && (
                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={handleExportToExcel}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="download-outline"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.exportButtonText}>
                                        Export
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <Text style={styles.filterTitle}>Filter Options</Text>

                    {/* Campaign Status Filter */}
                    <View style={{ zIndex: 10000, marginBottom: 10 }}>
                        <SearchableDropdown
                            label="Campaign Status"
                            placeholder="Select Status"
                            open={statusOpen}
                            value={campaignStatus.value}
                            items={statusItems}
                            setOpen={setStatusOpen}
                            setValue={handleStatusChange}
                            setItems={() => {}}
                            searchable={false}
                            multiple={false}
                            zIndex={10000}
                        />
                    </View>

                    {/* State Filter */}
                    <View style={{ zIndex: 9000, marginBottom: 10 }}>
                        <SearchableDropdown
                            label="State (Optional)"
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

                    {/* Campaign Filter */}
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

                    {/* Retailer Filter */}
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

                    {/* Date Range Filters */}
                    <View style={styles.dateRow}>
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>
                                Start Date (Optional)
                            </Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartPicker(true)}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color="#666"
                                />
                                <Text style={styles.dateButtonText}>
                                    {startDate
                                        ? formatDateToDDMMYYYY(
                                              startDate.toISOString()
                                          )
                                        : "Select Date"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>
                                End Date (Optional)
                            </Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndPicker(true)}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color="#666"
                                />
                                <Text style={styles.dateButtonText}>
                                    {endDate
                                        ? formatDateToDDMMYYYY(
                                              endDate.toISOString()
                                          )
                                        : "Select Date"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={onStartDateChange}
                        />
                    )}

                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={onEndDateChange}
                        />
                    )}

                    {(selectedStates.length > 0 ||
                        selectedCampaigns.length > 0 ||
                        selectedRetailers.length > 0 ||
                        startDate ||
                        endDate) && (
                        <Text
                            style={styles.clearButton}
                            onPress={handleClearFilters}
                        >
                            Clear All Filters
                        </Text>
                    )}
                </View>

                {/* Summary Cards */}
                {allDisplayData.length > 0 && (
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

                {/* Records List with Pagination Info */}
                <View style={styles.listContainer}>
                    {allDisplayData.length === 0 ? (
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
                            <View style={styles.recordsHeader}>
                                <Text style={styles.recordsCount}>
                                    Passbook Records ({totalRecords})
                                </Text>
                                {totalRecords > limit && (
                                    <Text style={styles.paginationInfo}>
                                        Showing {(currentPage - 1) * limit + 1}{" "}
                                        to{" "}
                                        {Math.min(
                                            currentPage * limit,
                                            totalRecords
                                        )}{" "}
                                        of {totalRecords}
                                    </Text>
                                )}
                            </View>

                            {paginatedData.map((record, index) => (
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

                                    <Text style={styles.outletCodeText}>
                                        Code: {record.outletCode}
                                    </Text>

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

                                    <View style={styles.lastPaymentRow}>
                                        <Ionicons
                                            name="time-outline"
                                            size={14}
                                            color="#666"
                                        />
                                        <Text style={styles.lastPaymentText}>
                                            Last Payment:{" "}
                                            {formatDateToDDMMYYYY(
                                                record.lastPaymentDate
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <View style={styles.paginationContainer}>
                                    <Text style={styles.pageInfo}>
                                        Page {currentPage} of {totalPages}
                                    </Text>

                                    <View style={styles.paginationButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.pageButton,
                                                currentPage === 1 &&
                                                    styles.pageButtonDisabled,
                                            ]}
                                            onPress={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                        >
                                            <Text
                                                style={[
                                                    styles.pageButtonText,
                                                    currentPage === 1 &&
                                                        styles.pageButtonTextDisabled,
                                                ]}
                                            >
                                                First
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.pageButton,
                                                currentPage === 1 &&
                                                    styles.pageButtonDisabled,
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
                                                size={18}
                                                color={
                                                    currentPage === 1
                                                        ? "#ccc"
                                                        : "#333"
                                                }
                                            />
                                        </TouchableOpacity>

                                        <View style={styles.pageNumbersRow}>
                                            {getPageNumbers().map(
                                                (pageNum, idx) =>
                                                    pageNum === "..." ? (
                                                        <Text
                                                            key={`ellipsis-${idx}`}
                                                            style={
                                                                styles.ellipsis
                                                            }
                                                        >
                                                            ...
                                                        </Text>
                                                    ) : (
                                                        <TouchableOpacity
                                                            key={pageNum}
                                                            style={[
                                                                styles.pageNumberButton,
                                                                currentPage ===
                                                                    pageNum &&
                                                                    styles.pageNumberButtonActive,
                                                            ]}
                                                            onPress={() =>
                                                                handlePageChange(
                                                                    pageNum
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.pageNumberText,
                                                                    currentPage ===
                                                                        pageNum &&
                                                                        styles.pageNumberTextActive,
                                                                ]}
                                                            >
                                                                {pageNum}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            style={[
                                                styles.pageButton,
                                                currentPage === totalPages &&
                                                    styles.pageButtonDisabled,
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
                                                size={18}
                                                color={
                                                    currentPage === totalPages
                                                        ? "#ccc"
                                                        : "#333"
                                                }
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.pageButton,
                                                currentPage === totalPages &&
                                                    styles.pageButtonDisabled,
                                            ]}
                                            onPress={() =>
                                                handlePageChange(totalPages)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.pageButtonText,
                                                    currentPage ===
                                                        totalPages &&
                                                        styles.pageButtonTextDisabled,
                                                ]}
                                            >
                                                Last
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
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
        paddingHorizontal: 16,
        marginTop: 10,
        marginHorizontal: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headingText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E4002B",
    },
    exportButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#28a745",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    exportButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
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
    dateRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    dateColumn: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 6,
        fontWeight: "500",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 8,
    },
    dateButtonText: {
        fontSize: 13,
        color: "#333",
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
    recordsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        flexWrap: "wrap",
        gap: 8,
    },
    recordsCount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    paginationInfo: {
        fontSize: 12,
        color: "#666",
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
        marginBottom: 4,
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
    outletCodeText: {
        fontSize: 11,
        color: "#888",
        marginBottom: 8,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
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
        marginBottom: 8,
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
    lastPaymentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    lastPaymentText: {
        fontSize: 11,
        color: "#666",
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
    paginationContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        gap: 12,
    },
    pageInfo: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
    },
    paginationButtons: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    pageButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#F5F5F5",
        borderRadius: 6,
        minWidth: 60,
        alignItems: "center",
    },
    pageButtonDisabled: {
        backgroundColor: "#E5E7EB",
        opacity: 0.5,
    },
    pageButtonText: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
    },
    pageButtonTextDisabled: {
        color: "#999",
    },
    pageNumbersRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    pageNumberButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "#F5F5F5",
        borderRadius: 6,
        minWidth: 36,
        alignItems: "center",
    },
    pageNumberButtonActive: {
        backgroundColor: "#E4002B",
    },
    pageNumberText: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
    },
    pageNumberTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    ellipsis: {
        fontSize: 12,
        color: "#999",
        paddingHorizontal: 4,
    },
});

export default ClientPassbookScreen;
