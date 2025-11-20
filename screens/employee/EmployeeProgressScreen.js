import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";

const EmployeeProgressScreen = () => {
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Dummy data - will be replaced with API call
    const visitData = [
        {
            id: 1,
            retailerName: "ABC Store",
            typeOfVisit: "Scheduled",
            attended: false,
            reason: "Outlet Closed",
            summary: "",
            lastVisit: "NA",
            upcomingVisit: "20-Nov-25",
        },
        {
            id: 2,
            retailerName: "Fashion Hub",
            typeOfVisit: "Unscheduled",
            attended: true,
            reason: "",
            summary: "Stock checked & display updated",
            lastVisit: "10-Nov-25",
            upcomingVisit: "18-Nov-25",
        },
        {
            id: 3,
            retailerName: "City Trends",
            typeOfVisit: "Scheduled",
            attended: true,
            reason: "",
            summary: "Merchandising verified",
            lastVisit: "08-Nov-25",
            upcomingVisit: "16-Nov-25",
        },
        {
            id: 4,
            retailerName: "Style Point",
            typeOfVisit: "Scheduled",
            attended: true,
            reason: "",
            summary: "New products displayed",
            lastVisit: "05-Nov-25",
            upcomingVisit: "22-Nov-25",
        },
    ];

    const handleViewVisit = (visit) => {
        setSelectedVisit(visit);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.pageTitle}>Track Progress</Text>

                    {/* Desktop-style Table for wider screens */}
                    <View style={styles.tableContainer}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text
                                style={[styles.headerCell, styles.nameColumn]}
                            >
                                Retailer Name
                            </Text>
                            <Text
                                style={[styles.headerCell, styles.dateColumn]}
                            >
                                Last Visit
                            </Text>
                            <Text
                                style={[styles.headerCell, styles.dateColumn]}
                            >
                                Upcoming Visit
                            </Text>
                            <Text
                                style={[styles.headerCell, styles.actionColumn]}
                            >
                                Action
                            </Text>
                        </View>

                        {/* Table Rows */}
                        {visitData.map((row) => (
                            <View key={row.id} style={styles.tableRow}>
                                <Text
                                    style={[styles.rowCell, styles.nameColumn]}
                                    numberOfLines={2}
                                >
                                    {row.retailerName}
                                </Text>
                                <Text
                                    style={[styles.rowCell, styles.dateColumn]}
                                >
                                    {row.lastVisit}
                                </Text>
                                <Text
                                    style={[styles.rowCell, styles.dateColumn]}
                                >
                                    {row.upcomingVisit}
                                </Text>
                                <View
                                    style={[
                                        styles.rowCell,
                                        styles.actionColumn,
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => handleViewVisit(row)}
                                    >
                                        <Text style={styles.viewButtonText}>
                                            View
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Mobile Card View (Alternative for smaller screens) */}
                    {/* <View style={styles.cardsContainer}>
            {visitData.map((row) => (
              <View key={row.id} style={styles.card}>
                <Text style={styles.cardTitle}>{row.retailerName}</Text>

                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Last Visit:</Text>
                  <Text style={styles.cardValue}>{row.lastVisit}</Text>
                </View>

                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Upcoming Visit:</Text>
                  <Text style={styles.cardValue}>{row.upcomingVisit}</Text>
                </View>

                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => handleViewVisit(row)}
                >
                  <Text style={styles.cardButtonText}>View Last Visit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View> */}
                </View>
            </ScrollView>

            {/* Visit Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Last Visit Details
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {selectedVisit && (
                                <>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Retailer Name:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedVisit.retailerName}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Type of Visit:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedVisit.typeOfVisit}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Last Visit Date:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedVisit.lastVisit}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Attended:
                                        </Text>
                                        <View style={styles.attendedBadge}>
                                            {selectedVisit.attended ? (
                                                <>
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={20}
                                                        color="#28a745"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.attendedYes
                                                        }
                                                    >
                                                        Yes
                                                    </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Ionicons
                                                        name="close-circle"
                                                        size={20}
                                                        color="#dc3545"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.attendedNo
                                                        }
                                                    >
                                                        No
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {!selectedVisit.attended &&
                                        selectedVisit.reason && (
                                            <View style={styles.detailRow}>
                                                <Text
                                                    style={styles.detailLabel}
                                                >
                                                    Reason:
                                                </Text>
                                                <Text
                                                    style={styles.detailValue}
                                                >
                                                    {selectedVisit.reason}
                                                </Text>
                                            </View>
                                        )}

                                    {selectedVisit.attended &&
                                        selectedVisit.summary && (
                                            <View style={styles.detailRow}>
                                                <Text
                                                    style={styles.detailLabel}
                                                >
                                                    Summary:
                                                </Text>
                                                <Text
                                                    style={styles.detailValue}
                                                >
                                                    {selectedVisit.summary}
                                                </Text>
                                            </View>
                                        )}

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Upcoming Visit:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedVisit.upcomingVisit}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    contentContainer: {
        padding: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#E4002B",
        marginBottom: 20,
    },
    tableContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#E4002B",
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    headerCell: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
    },
    nameColumn: {
        flex: 2.5,
    },
    dateColumn: {
        flex: 2,
    },
    actionColumn: {
        flex: 1.5,
        alignItems: "center",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        alignItems: "center",
    },
    rowCell: {
        fontSize: 13,
        color: "#333",
    },
    viewButton: {
        backgroundColor: "#E4002B",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    viewButtonText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: 500,
        maxHeight: "80%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E4002B",
    },
    closeButton: {
        padding: 5,
    },
    modalContent: {
        padding: 20,
    },
    detailRow: {
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    attendedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    attendedYes: {
        fontSize: 16,
        color: "#28a745",
        fontWeight: "600",
    },
    attendedNo: {
        fontSize: 16,
        color: "#dc3545",
        fontWeight: "600",
    },
    modalCloseButton: {
        backgroundColor: "#E4002B",
        paddingVertical: 15,
        alignItems: "center",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    modalCloseButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EmployeeProgressScreen;
