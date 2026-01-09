// ReportDetails.js - React Native Version
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE_URL } from "../../../../url/base";

const { width } = Dimensions.get("window");

const ReportDetails = ({ visible, report, loading, onClose }) => {
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

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
                        [{ text: "OK" }]
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

    const renderInfoSection = (title, icon, children) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={20} color="#E4002B" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

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
                                {renderInfoSection(
                                    "Basic Information",
                                    "information-circle",
                                    <>
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
                                    </>
                                )}

                                {/* Campaign Information */}
                                {renderInfoSection(
                                    "Campaign Information",
                                    "business",
                                    <>
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
                                    </>
                                )}

                                {/* Retailer Information */}
                                {report.retailer &&
                                    renderInfoSection(
                                        "Retailer Information",
                                        "storefront",
                                        <>
                                            {renderInfoRow(
                                                "Retailer Name",
                                                report.retailer?.retailerName
                                            )}
                                            {renderInfoRow(
                                                "Outlet Code",
                                                report.retailer?.outletCode
                                            )}
                                            {renderInfoRow(
                                                "Outlet Name",
                                                report.retailer?.outletName
                                            )}
                                            {report.retailer?.retailerId
                                                ?.contactNo &&
                                                renderInfoRow(
                                                    "Contact",
                                                    report.retailer.retailerId
                                                        .contactNo
                                                )}
                                        </>
                                    )}

                                {/* Employee Information */}
                                {report.employee?.employeeId &&
                                    renderInfoSection(
                                        "Employee Information",
                                        "person",
                                        <>
                                            {renderInfoRow(
                                                "Employee Name",
                                                report.employee.employeeName ||
                                                    report.employee.employeeId
                                                        ?.name
                                            )}
                                            {renderInfoRow(
                                                "Employee Code",
                                                report.employee.employeeCode ||
                                                    report.employee.employeeId
                                                        ?.employeeId
                                            )}
                                            {report.employee.employeeId
                                                ?.phone &&
                                                renderInfoRow(
                                                    "Contact",
                                                    report.employee.employeeId
                                                        .phone
                                                )}
                                        </>
                                    )}

                                {/* Visit Details */}
                                {report.submittedBy?.role === "Employee" &&
                                    renderInfoSection(
                                        "Visit Details",
                                        "walk",
                                        <>
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
                                        </>
                                    )}

                                {/* Stock Information */}
                                {report.reportType === "Stock" &&
                                    (report.brand ||
                                        report.product ||
                                        report.sku ||
                                        report.stockType) &&
                                    renderInfoSection(
                                        "Product/Stock Information",
                                        "cube",
                                        <>
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
                                        </>
                                    )}

                                {/* Remarks */}
                                {report.remarks && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Ionicons
                                                name="chatbox-ellipses"
                                                size={20}
                                                color="#E4002B"
                                            />
                                            <Text style={styles.sectionTitle}>
                                                Remarks
                                            </Text>
                                        </View>
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
                                            <View style={styles.sectionHeader}>
                                                <Ionicons
                                                    name="images"
                                                    size={20}
                                                    color="#E4002B"
                                                />
                                                <Text
                                                    style={styles.sectionTitle}
                                                >
                                                    Shop Display Images (
                                                    {
                                                        report.shopDisplayImages
                                                            .length
                                                    }
                                                    )
                                                </Text>
                                            </View>
                                            <View style={styles.imageGrid}>
                                                {report.shopDisplayImages.map(
                                                    (img, idx) => {
                                                        const imageSource =
                                                            getImageSource(img);
                                                        if (!imageSource)
                                                            return null;

                                                        return (
                                                            <TouchableOpacity
                                                                key={idx}
                                                                style={
                                                                    styles.imageContainer
                                                                }
                                                                onPress={() =>
                                                                    setSelectedImage(
                                                                        imageSource
                                                                    )
                                                                }
                                                                activeOpacity={
                                                                    0.8
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
                                                                <View
                                                                    style={
                                                                        styles.imageOverlay
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="expand-outline"
                                                                        size={
                                                                            20
                                                                        }
                                                                        color="#fff"
                                                                    />
                                                                </View>
                                                                <Text
                                                                    style={
                                                                        styles.imageLabel
                                                                    }
                                                                >
                                                                    Image{" "}
                                                                    {idx + 1}
                                                                </Text>
                                                            </TouchableOpacity>
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
                                            <View style={styles.sectionHeader}>
                                                <Ionicons
                                                    name="document-text"
                                                    size={20}
                                                    color="#E4002B"
                                                />
                                                <Text
                                                    style={styles.sectionTitle}
                                                >
                                                    Bill{" "}
                                                    {report.billCopies.length >
                                                    1
                                                        ? "Copies"
                                                        : "Copy"}{" "}
                                                    ({report.billCopies.length})
                                                </Text>
                                            </View>
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
                                                            <TouchableOpacity
                                                                key={idx}
                                                                style={
                                                                    styles.imageContainerLarge
                                                                }
                                                                onPress={() =>
                                                                    setSelectedImage(
                                                                        imageSource
                                                                    )
                                                                }
                                                                activeOpacity={
                                                                    0.8
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
                                                                <View
                                                                    style={
                                                                        styles.imageOverlay
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="expand-outline"
                                                                        size={
                                                                            24
                                                                        }
                                                                        color="#fff"
                                                                    />
                                                                </View>
                                                                <Text
                                                                    style={
                                                                        styles.imageLabel
                                                                    }
                                                                >
                                                                    Bill{" "}
                                                                    {idx + 1}
                                                                </Text>
                                                            </TouchableOpacity>
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
                                            <View style={styles.sectionHeader}>
                                                <Ionicons
                                                    name="folder"
                                                    size={20}
                                                    color="#E4002B"
                                                />
                                                <Text
                                                    style={styles.sectionTitle}
                                                >
                                                    Files ({report.files.length}
                                                    )
                                                </Text>
                                            </View>
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
                                                            <TouchableOpacity
                                                                key={idx}
                                                                style={
                                                                    styles.imageContainer
                                                                }
                                                                onPress={() =>
                                                                    setSelectedImage(
                                                                        imageSource
                                                                    )
                                                                }
                                                                activeOpacity={
                                                                    0.8
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
                                                                <View
                                                                    style={
                                                                        styles.imageOverlay
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="expand-outline"
                                                                        size={
                                                                            20
                                                                        }
                                                                        color="#fff"
                                                                    />
                                                                </View>
                                                                <Text
                                                                    style={
                                                                        styles.imageLabel
                                                                    }
                                                                >
                                                                    File{" "}
                                                                    {idx + 1}
                                                                </Text>
                                                            </TouchableOpacity>
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

            {/* Full Screen Image Modal */}
            {selectedImage && (
                <Modal
                    visible={!!selectedImage}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setSelectedImage(null)}
                >
                    <View style={styles.imageModalOverlay}>
                        <TouchableOpacity
                            style={styles.imageModalCloseButton}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons
                                name="close-circle"
                                size={40}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>
            )}
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
        marginBottom: 20,
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
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
        position: "relative",
    },
    imageContainerLarge: {
        width: "100%",
        height: 300,
        backgroundColor: "#000",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 12,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "90%",
    },
    imageLarge: {
        width: "100%",
        height: "90%",
    },
    imageOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        padding: 6,
    },
    imageLabel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        fontSize: 11,
        color: "#fff",
        textAlign: "center",
        paddingVertical: 4,
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    imageModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    imageModalCloseButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
    fullScreenImage: {
        width: width,
        height: "80%",
    },
});

export default ReportDetails;
