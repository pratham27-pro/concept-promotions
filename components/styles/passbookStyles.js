import { Platform, StyleSheet } from "react-native";

export const commonPassbookStyles = StyleSheet.create({
    headerButtons: {
        flexDirection: "row",
        gap: 10,
    },
    exportButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.25)",
        justifyContent: "center",
        alignItems: "center",
    },
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
        backgroundColor: "#ea6666ff",
        borderColor: "#ea6666ff",
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
