import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as RootNavigation from "../../navigation/RootNavigation";
import Header from "../../components/common/Header";

const PassbookScreen = () => {
    // Mock data - will be fetched from DB
    const [retailer] = useState({
        name: "Hari Kumar",
        photo: null,
        totalEarnings: 125000,
        pendingPayments: 15000,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Pagination states
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Mock all transactions data (simulating API)
    const allMockTransactions = [
        {
            id: "1",
            type: "credit",
            amount: 5000,
            date: "2025-11-15",
            time: "10:30 AM",
            campaignName: "Summer Sale Campaign",
            status: "completed",
            transactionId: "TXN123456789",
        },
        {
            id: "2",
            type: "credit",
            amount: 8000,
            date: "2025-11-10",
            time: "02:15 PM",
            campaignName: "Festive Diwali Offer",
            status: "completed",
            transactionId: "TXN123456788",
        },
        {
            id: "3",
            type: "pending",
            amount: 15000,
            date: "2025-11-18",
            time: "Pending",
            campaignName: "Winter Collection",
            status: "pending",
            transactionId: "TXN123456790",
        },
        {
            id: "4",
            type: "credit",
            amount: 3500,
            date: "2025-11-05",
            time: "11:45 AM",
            campaignName: "Flash Sale",
            status: "completed",
            transactionId: "TXN123456787",
        },
        {
            id: "5",
            type: "credit",
            amount: 12000,
            date: "2025-10-28",
            time: "04:20 PM",
            campaignName: "Mega Discount Days",
            status: "completed",
            transactionId: "TXN123456786",
        },
        {
            id: "6",
            type: "credit",
            amount: 7500,
            date: "2025-10-20",
            time: "09:15 AM",
            campaignName: "Back to School",
            status: "completed",
            transactionId: "TXN123456785",
        },
        {
            id: "7",
            type: "credit",
            amount: 4200,
            date: "2025-10-15",
            time: "03:30 PM",
            campaignName: "Weekend Bonanza",
            status: "completed",
            transactionId: "TXN123456784",
        },
        {
            id: "8",
            type: "pending",
            amount: 9000,
            date: "2025-11-20",
            time: "Pending",
            campaignName: "Black Friday Sale",
            status: "pending",
            transactionId: "TXN123456791",
        },
        {
            id: "9",
            type: "credit",
            amount: 6300,
            date: "2025-10-08",
            time: "01:45 PM",
            campaignName: "Clearance Sale",
            status: "completed",
            transactionId: "TXN123456783",
        },
        {
            id: "10",
            type: "credit",
            amount: 11000,
            date: "2025-10-01",
            time: "10:00 AM",
            campaignName: "New Launch Campaign",
            status: "completed",
            transactionId: "TXN123456782",
        },
        {
            id: "11",
            type: "credit",
            amount: 5500,
            date: "2025-09-25",
            time: "02:20 PM",
            campaignName: "Summer Clearance",
            status: "completed",
            transactionId: "TXN123456781",
        },
        {
            id: "12",
            type: "credit",
            amount: 8800,
            date: "2025-09-18",
            time: "11:30 AM",
            campaignName: "Festival Discount",
            status: "completed",
            transactionId: "TXN123456780",
        },
    ];

    // Load initial transactions
    useEffect(() => {
        loadTransactions(1);
    }, []);

    // Simulate API call with pagination
    const loadTransactions = async (pageNumber) => {
        if (loading) return;

        setLoading(true);

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const itemsPerPage = 5;
            const startIndex = (pageNumber - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            const newTransactions = allMockTransactions.slice(
                startIndex,
                endIndex
            );

            if (pageNumber === 1) {
                setTransactions(newTransactions);
            } else {
                setTransactions((prev) => [...prev, ...newTransactions]);
            }

            // Check if there are more items
            setHasMore(endIndex < allMockTransactions.length);
            setPage(pageNumber);
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load more transactions when reaching end
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadTransactions(page + 1);
        }
    };

    // Filter transactions based on search
    const filteredTransactions = transactions.filter((transaction) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            transaction.amount.toString().includes(query) ||
            transaction.campaignName.toLowerCase().includes(query) ||
            transaction.transactionId.toLowerCase().includes(query)
        );
    });

    const renderTransaction = ({ item }) => (
        <TouchableOpacity style={styles.transactionCard}>
            <View style={styles.transactionLeft}>
                <View
                    style={[
                        styles.transactionIcon,
                        item.type === "credit"
                            ? styles.creditIcon
                            : styles.pendingIcon,
                    ]}
                >
                    <Ionicons
                        name={
                            item.type === "credit"
                                ? "arrow-down"
                                : "time-outline"
                        }
                        size={24}
                        color={item.type === "credit" ? "#28a745" : "#FFA500"}
                    />
                </View>

                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCampaign} numberOfLines={1}>
                        {item.campaignName}
                    </Text>
                    <Text style={styles.transactionDate}>
                        {item.date} • {item.time}
                    </Text>
                    <Text style={styles.transactionId}>
                        ID: {item.transactionId}
                    </Text>
                </View>
            </View>

            <View style={styles.transactionRight}>
                <Text
                    style={[
                        styles.transactionAmount,
                        item.type === "credit"
                            ? styles.creditAmount
                            : styles.pendingAmount,
                    ]}
                >
                    {item.type === "credit" ? "+" : ""}₹
                    {item.amount.toLocaleString("en-IN")}
                </Text>
                <View
                    style={[
                        styles.statusBadge,
                        item.status === "completed"
                            ? styles.completedBadge
                            : styles.pendingBadge,
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.status === "completed" ? "Completed" : "Pending"}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {/* Retailer Info */}
            <View style={styles.retailerInfo}>
                {retailer.photo ? (
                    <Image
                        source={{ uri: retailer.photo }}
                        style={styles.retailerPhoto}
                    />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Ionicons name="person" size={30} color="#999" />
                    </View>
                )}
                <Text style={styles.retailerName}>{retailer.name}</Text>
            </View>

            {/* Earnings Cards */}
            <View style={styles.earningsContainer}>
                {/* Total Earnings */}
                <TouchableOpacity style={styles.earningCard}>
                    <LinearGradient
                        colors={["#28a745", "#20c997"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="wallet" size={28} color="#fff" />
                        </View>
                        <Text style={styles.cardLabel}>Total Earnings</Text>
                        <Text style={styles.cardAmount}>
                            ₹{retailer.totalEarnings.toLocaleString("en-IN")}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Pending Payments */}
                <TouchableOpacity style={styles.earningCard}>
                    <LinearGradient
                        colors={["#FFA500", "#FF8C00"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="time" size={28} color="#fff" />
                        </View>
                        <Text style={styles.cardLabel}>Pending Payments</Text>
                        <Text style={styles.cardAmount}>
                            ₹{retailer.pendingPayments.toLocaleString("en-IN")}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Balance and History Section */}
            <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>Balance and History</Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by amount or campaign"
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery("")}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons name="filter" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {/* Filter Options (placeholder for future) */}
                {showFilters && (
                    <View style={styles.filterOptions}>
                        <Text style={styles.filterText}>
                            Filters coming soon...
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!loading) return null;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>
                    Loading more transactions...
                </Text>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.noTransactions}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
            <Text style={styles.noTransactionsText}>No transactions found</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <Header />

            {/* Transactions List with Header */}
            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        flex: 1,
        alignItems: "center",
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#f0f0f0",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#333",
    },
    logoSubtext: {
        fontSize: 6,
        color: "#666",
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    listContainer: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    retailerInfo: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
        marginTop: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    retailerPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    photoPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    retailerName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    earningsContainer: {
        flexDirection: "row",
        marginTop: 20,
        gap: 15,
    },
    earningCard: {
        flex: 1,
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    cardGradient: {
        padding: 20,
        minHeight: 140,
    },
    cardIcon: {
        marginBottom: 10,
    },
    cardLabel: {
        fontSize: 13,
        color: "#fff",
        opacity: 0.9,
        marginBottom: 8,
    },
    cardAmount: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
    },
    historySection: {
        marginTop: 30,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    filterButton: {
        backgroundColor: "#fff",
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterOptions: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    filterText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    transactionCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#28a745",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    transactionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    transactionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    creditIcon: {
        backgroundColor: "#d4edda",
    },
    pendingIcon: {
        backgroundColor: "#fff3cd",
    },
    transactionInfo: {
        flex: 1,
    },
    transactionCampaign: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    transactionId: {
        fontSize: 11,
        color: "#999",
    },
    transactionRight: {
        alignItems: "flex-end",
        marginLeft: 10,
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },
    creditAmount: {
        color: "#28a745",
    },
    pendingAmount: {
        color: "#FFA500",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedBadge: {
        backgroundColor: "#d4edda",
    },
    pendingBadge: {
        backgroundColor: "#fff3cd",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#333",
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: "center",
        gap: 8,
    },
    loadingText: {
        fontSize: 13,
        color: "#666",
    },
    noTransactions: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    noTransactionsText: {
        fontSize: 16,
        color: "#999",
        marginTop: 15,
    },
});

export default PassbookScreen;
