// ReportDetails.js - React Native Version
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE_URL } from "../../../../url/base";

const ReportDetails = ({ visible, report, loading, onClose }) => {
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    if (!report && !loading) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch (error) {
            return "N/A";
        }
    };

    const getImageSource = (imageData) => {
        if (!imageData) return null;

        // If it's a Cloudinary URL (string), return directly
        if (typeof imageData === "string") {
            return imageData;
        }

        // If it's an object with secure_url (Cloudinary format)
        if (imageData.secure_url) {
            return imageData.secure_url;
        }

        // If it's an object with url property
        if (imageData.url) {
            return imageData.url;
        }

        return null;
    };

    // ✅ Download PDF from backend
    const handleDownloadPDF = async () => {
        if (!report?._id) {
            Alert.alert("Error", "Report ID not found");
            return;
        }

        setDownloadingPDF(true);

        try {
            const token = await AsyncStorage.getItem("userToken");
            const fileName = `Report_${report.reportType || "Unknown"}_${
                new Date().toISOString().split("T")[0]
            }.pdf`;
            const fileUri = FileSystem.documentDirectory + fileName;

            // Download PDF from backend
            const downloadResult = await FileSystem.downloadAsync(
                `${API_BASE_URL}/reports/${report._id}/pdf`,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (downloadResult.status === 200) {
                // Check if sharing is available
                const isSharingAvailable = await Sharing.isAvailableAsync();

                if (isSharingAvailable) {
                    await Sharing.shareAsync(downloadResult.uri, {
                        mimeType: "application/pdf",
                        dialogTitle: "Save or Share Report PDF",
                        UTI: "com.adobe.pdf",
                    });
                } else {
                    Alert.alert(
                        "Success",
                        `PDF downloaded successfully!\nSaved to: ${fileName}`,
                        [
                            {
                                text: "OK",
                            },
                        ]
                    );
                }
            } else {
                throw new Error("Failed to download PDF");
            }
        } catch (error) {
            console.error("PDF Download Error:", error);
            Alert.alert("Error", "Failed to download PDF. Please try again.");
        } finally {
            setDownloadingPDF(false);
        }
    };

    const renderInfoRow = (label, value) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || "N/A"}</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Report Details</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={[
                                    styles.downloadButton,
                                    downloadingPDF &&
                                        styles.downloadButtonDisabled,
                                ]}
                                onPress={handleDownloadPDF}
                                disabled={downloadingPDF || loading}
                            >
                                {downloadingPDF ? (
                                    <ActivityIndicator
                                        color="#fff"
                                        size="small"
                                    />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="download-outline"
                                            size={18}
                                            color="#fff"
                                        />
                                        <Text style={styles.downloadButtonText}>
                                            PDF
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator
                                    size="large"
                                    color="#E4002B"
                                />
                                <Text style={styles.loadingText}>
                                    Loading report details...
                                </Text>
                            </View>
                        ) : report ? (
                            <View style={styles.content}>
                                {/* Basic Information */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        Basic Information
                                    </Text>
                                    <View style={styles.sectionContent}>
                                        {renderInfoRow(
                                            "Report Type",
                                            report.reportType
                                        )}
                                        {report.frequency &&
                                            renderInfoRow(
                                                "Frequency",
                                                report.frequency
                                            )}
                                        {renderInfoRow(
                                            "Date of Submission",
                                            formatDate(
                                                report.dateOfSubmission ||
                                                    report.createdAt
                                            )
                                        )}
                                        {renderInfoRow(
                                            "Submitted By",
                                            report.submittedBy?.role
                                        )}
                                    </View>
                                </View>

                                {/* Campaign Information */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>
                                        Campaign Information
                                    </Text>
                                    <View style={styles.sectionContent}>
                                        {renderInfoRow(
                                            "Campaign Name",
                                            report.campaignId?.name
                                        )}
                                        {renderInfoRow(
                                            "Campaign Type",
                                            report.campaignId?.type
                                        )}
                                        {renderInfoRow(
                                            "Client",
                                            report.campaignId?.client
                                        )}
                                    </View>
                                </View>

                                {/* Employee Information */}
                                {report.employee?.employeeId && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>
                                            Employee Information
                                        </Text>
                                        <View style={styles.sectionContent}>
                                            {renderInfoRow(
                                                "Employee Name",
                                                report.employee.employeeId.name
                                            )}
                                            {renderInfoRow(
                                                "Employee Code",
                                                report.employee.employeeId
                                                    .employeeId
                                            )}
                                            {report.employee.employeeId.phone &&
                                                renderInfoRow(
                                                    "Contact",
                                                    report.employee.employeeId
                                                        .phone
                                                )}
                                        </View>
                                    </View>
                                )}

                                {/* Visit Details */}
                                {report.submittedBy?.role === "Employee" && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>
                                            Visit Details
                                        </Text>
                                        <View style={styles.sectionContent}>
                                            {renderInfoRow(
                                                "Type of Visit",
                                                report.typeOfVisit
                                            )}
                                            {renderInfoRow(
                                                "Attendance Status",
                                                report.attendedVisit === "yes"
                                                    ? "Attended"
                                                    : "Not Attended"
                                            )}
                                            {report.attendedVisit === "no" &&
                                                report.reasonForNonAttendance && (
                                                    <>
                                                        {renderInfoRow(
                                                            "Reason",
                                                            report
                                                                .reasonForNonAttendance
                                                                .reason
                                                        )}
                                                        {report
                                                            .reasonForNonAttendance
                                                            .reason ===
                                                            "others" &&
                                                            report
                                                                .reasonForNonAttendance
                                                                .otherReason &&
                                                            renderInfoRow(
                                                                "Additional Details",
                                                                report
                                                                    .reasonForNonAttendance
                                                                    .otherReason
                                                            )}
                                                    </>
                                                )}
                                        </View>
                                    </View>
                                )}

                                {/* Stock Information */}
                                {report.reportType === "Stock" &&
                                    (report.brand ||
                                        report.product ||
                                        report.sku ||
                                        report.stockType) && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                Product/Stock Information
                                            </Text>
                                            <View style={styles.sectionContent}>
                                                {report.stockType &&
                                                    renderInfoRow(
                                                        "Stock Type",
                                                        report.stockType
                                                    )}
                                                {report.brand &&
                                                    renderInfoRow(
                                                        "Brand",
                                                        report.brand
                                                    )}
                                                {report.product &&
                                                    renderInfoRow(
                                                        "Product",
                                                        report.product
                                                    )}
                                                {report.sku &&
                                                    renderInfoRow(
                                                        "SKU",
                                                        report.sku
                                                    )}
                                                {report.productType &&
                                                    renderInfoRow(
                                                        "Product Type",
                                                        report.productType
                                                    )}
                                                {report.quantity &&
                                                    renderInfoRow(
                                                        "Quantity",
                                                        report.quantity
                                                    )}
                                            </View>
                                        </View>
                                    )}

                                {/* Remarks */}
                                {report.remarks && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>
                                            Remarks
                                        </Text>
                                        <View style={styles.sectionContent}>
                                            <Text style={styles.remarksText}>
                                                {report.remarks}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Shop Display Images */}
                                {report.reportType === "Window Display" &&
                                    report.shopDisplayImages &&
                                    report.shopDisplayImages.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                Shop Display Images (
                                                {
                                                    report.shopDisplayImages
                                                        .length
                                                }
                                                )
                                            </Text>
                                            <View style={styles.imageGrid}>
                                                {report.shopDisplayImages.map(
                                                    (img, idx) => {
                                                        const imageSource =
                                                            getImageSource(img);
                                                        if (!imageSource)
                                                            return null;

                                                        return (
                                                            <View
                                                                key={idx}
                                                                style={
                                                                    styles.imageContainer
                                                                }
                                                            >
                                                                <Image
                                                                    source={{
                                                                        uri: imageSource,
                                                                    }}
                                                                    style={
                                                                        styles.image
                                                                    }
                                                                    resizeMode="cover"
                                                                />
                                                                <Text
                                                                    style={
                                                                        styles.imageLabel
                                                                    }
                                                                >
                                                                    Image{" "}
                                                                    {idx + 1}
                                                                </Text>
                                                            </View>
                                                        );
                                                    }
                                                )}
                                            </View>
                                        </View>
                                    )}

                                {/* Bill Copies */}
                                {report.reportType === "Stock" &&
                                    report.billCopies &&
                                    report.billCopies.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                Bill{" "}
                                                {report.billCopies.length > 1
                                                    ? "Copies"
                                                    : "Copy"}{" "}
                                                ({report.billCopies.length})
                                            </Text>
                                            <View style={styles.imageGrid}>
                                                {report.billCopies.map(
                                                    (bill, idx) => {
                                                        const imageSource =
                                                            getImageSource(
                                                                bill
                                                            );
                                                        if (!imageSource)
                                                            return null;

                                                        return (
                                                            <View
                                                                key={idx}
                                                                style={
                                                                    styles.imageContainerLarge
                                                                }
                                                            >
                                                                <Image
                                                                    source={{
                                                                        uri: imageSource,
                                                                    }}
                                                                    style={
                                                                        styles.imageLarge
                                                                    }
                                                                    resizeMode="contain"
                                                                />
                                                                <Text
                                                                    style={
                                                                        styles.imageLabel
                                                                    }
                                                                >
                                                                    Bill{" "}
                                                                    {idx + 1}
                                                                </Text>
                                                            </View>
                                                        );
                                                    }
                                                )}
                                            </View>
                                        </View>
                                    )}

                                {/* Other Files */}
                                {report.reportType === "Others" &&
                                    report.files &&
                                    report.files.length > 0 && (
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                Files ({report.files.length})
                                            </Text>
                                            <View style={styles.imageGrid}>
                                                {report.files.map(
                                                    (file, idx) => {
                                                        const imageSource =
                                                            getImageSource(
                                                                file
                                                            );
                                                        if (!imageSource)
                                                            return null;

                                                        return (
                                                            <View
                                                                key={idx}
                                                                style={
                                                                    styles.imageContainer
                                                                }
                                                            >
                                                                <Image
                                                                    source={{
                                                                        uri: imageSource,
                                                                    }}
                                                                    style={
                                                                        styles.image
                                                                    }
                                                                    resizeMode="cover"
                                                                />
                                                                <Text
                                                                    style={
                                                                        styles.imageLabel
                                                                    }
                                                                >
                                                                    File{" "}
                                                                    {idx + 1}
                                                                </Text>
                                                            </View>
                                                        );
                                                    }
                                                )}
                                            </View>
                                        </View>
                                    )}
                            </View>
                        ) : null}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "95%",
        height: "95%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e9ecef",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E4002B",
        flex: 1,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    downloadButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4CAF50",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    downloadButtonDisabled: {
        backgroundColor: "#a5d6a7",
    },
    downloadButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
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
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    sectionContent: {
        gap: 12,
    },
    infoRow: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    infoLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "600",
    },
    remarksText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 8,
    },
    imageContainer: {
        width: "48%",
        aspectRatio: 1,
        backgroundColor: "#000",
        borderRadius: 8,
        overflow: "hidden",
    },
    imageContainerLarge: {
        width: "100%",
        height: 300,
        backgroundColor: "#000",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: "90%",
    },
    imageLarge: {
        width: "100%",
        height: "90%",
    },
    imageLabel: {
        fontSize: 11,
        color: "#fff",
        textAlign: "center",
        paddingVertical: 4,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
});

export default ReportDetails;
