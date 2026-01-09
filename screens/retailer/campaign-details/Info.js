// RetailerCampaignInfo.js - Fixed Version
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../../components/common/Header";

const { width } = Dimensions.get("window");

const RetailerCampaignInfo = ({ route, navigation }) => {
    const { campaign } = route.params;

    const [selectedBanner, setSelectedBanner] = useState(null);
    const [descriptionExpanded, setDescriptionExpanded] = useState(true); // ✅ Open by default
    const [tncExpanded, setTncExpanded] = useState(false);

    // Debug logs
    console.log("📱 Info Screen - Full Campaign Object:", campaign);
    console.log("📋 Info Field:", campaign?.info);

    if (!campaign) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <StatusBar style="dark" />
                <Header title="Campaign Info" />
                <View style={styles.emptyState}>
                    <Ionicons
                        name="information-circle-outline"
                        size={64}
                        color="#ccc"
                    />
                    <Text style={styles.emptyStateText}>
                        No campaign data available
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Extract data
    const campaignInfo = campaign.info || campaign.rawData?.info || {};
    const description = campaignInfo.description || "";
    const tnc = campaignInfo.tnc || "";
    const banners = campaignInfo.banners || [];

    console.log("📝 Extracted - Description:", description ? "YES" : "NO");
    console.log("📜 Extracted - T&C:", tnc ? "YES" : "NO");
    console.log("🖼️ Extracted - Banners:", banners.length);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch (error) {
            return "N/A";
        }
    };

    // Get status color
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "accepted":
                return {
                    backgroundColor: "#d4edda",
                    color: "#155724",
                };
            case "rejected":
                return {
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                };
            default:
                return {
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                };
        }
    };

    const statusStyle = getStatusStyle(campaign.status);

    // Get image URL
    const getImageUrl = (banner) => {
        if (!banner) return null;
        return banner?.url || banner?.secure_url || banner;
    };

    // Render info row
    const renderInfoRow = (icon, label, value, isStatus = false) => (
        <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
                <Ionicons name={icon} size={20} color="#666" />
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            {isStatus ? (
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.backgroundColor },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            { color: statusStyle.color },
                        ]}
                    >
                        {value
                            ? value.charAt(0).toUpperCase() + value.slice(1)
                            : "N/A"}
                    </Text>
                </View>
            ) : (
                <Text style={styles.infoValue}>{value || "N/A"}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header title="Campaign Info" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{campaign.name}</Text>
                    <Text style={styles.headerSubtitle}>
                        Campaign Information
                    </Text>
                </View>

                {/* Basic Details Card */}
                <View style={styles.card}>
                    <View style={styles.cardTitleContainer}>
                        <Ionicons
                            name="information-circle"
                            size={22}
                            color="#E4002B"
                        />
                        <Text style={styles.cardTitle}>Basic Details</Text>
                    </View>
                    <View style={styles.cardContent}>
                        {renderInfoRow(
                            "business-outline",
                            "Client",
                            campaign.client
                        )}
                        {renderInfoRow(
                            "pricetag-outline",
                            "Type",
                            campaign.type
                        )}
                        {renderInfoRow(
                            "calendar-outline",
                            "Start Date",
                            formatDate(
                                campaign.startDate || campaign.campaignStartDate
                            )
                        )}
                        {renderInfoRow(
                            "calendar-outline",
                            "End Date",
                            formatDate(
                                campaign.endDate || campaign.campaignEndDate
                            )
                        )}
                        {campaign.status &&
                            renderInfoRow(
                                "checkmark-circle-outline",
                                "Status",
                                campaign.status,
                                true
                            )}
                    </View>
                </View>

                {/* Description Card */}
                {description ? (
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.expandableHeader}
                            onPress={() =>
                                setDescriptionExpanded(!descriptionExpanded)
                            }
                            activeOpacity={0.7}
                        >
                            <View style={styles.expandableHeaderLeft}>
                                <Ionicons
                                    name="document-text"
                                    size={22}
                                    color="#E4002B"
                                />
                                <Text style={styles.cardTitle}>
                                    Description
                                </Text>
                            </View>
                            <Ionicons
                                name={
                                    descriptionExpanded
                                        ? "chevron-up-outline"
                                        : "chevron-down-outline"
                                }
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>

                        {descriptionExpanded && (
                            <View style={styles.expandableContent}>
                                <Text style={styles.descriptionText}>
                                    {description}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : null}

                {/* Campaign Banners Card */}
                {banners && banners.length > 0 ? (
                    <View style={styles.card}>
                        <View style={styles.bannerHeader}>
                            <Ionicons name="images" size={22} color="#E4002B" />
                            <Text style={styles.cardTitle}>
                                Campaign Banners ({banners.length})
                            </Text>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.bannersContainer}
                        >
                            {banners.map((banner, index) => {
                                const imageUrl = getImageUrl(banner);
                                console.log(
                                    `🖼️ Banner ${index + 1} URL:`,
                                    imageUrl
                                );

                                if (!imageUrl) return null;

                                return (
                                    <TouchableOpacity
                                        key={banner?.publicId || index}
                                        style={styles.bannerContainer}
                                        onPress={() =>
                                            setSelectedBanner(imageUrl)
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <Image
                                            source={{ uri: imageUrl }}
                                            style={styles.bannerImage}
                                            resizeMode="cover"
                                            onError={(e) => {
                                                console.error(
                                                    `❌ Failed to load banner ${index}:`,
                                                    imageUrl
                                                );
                                            }}
                                            onLoad={() => {
                                                console.log(
                                                    `✅ Banner ${index} loaded successfully`
                                                );
                                            }}
                                        />
                                        <View style={styles.bannerOverlay}>
                                            <Ionicons
                                                name="expand-outline"
                                                size={24}
                                                color="#fff"
                                            />
                                        </View>
                                        <Text style={styles.bannerLabel}>
                                            Banner {index + 1}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                ) : null}

                {/* Terms & Conditions Card */}
                {tnc ? (
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.expandableHeader}
                            onPress={() => setTncExpanded(!tncExpanded)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.expandableHeaderLeft}>
                                <Ionicons
                                    name="shield-checkmark"
                                    size={22}
                                    color="#E4002B"
                                />
                                <Text style={styles.cardTitle}>
                                    Terms & Conditions
                                </Text>
                            </View>
                            <Ionicons
                                name={
                                    tncExpanded
                                        ? "chevron-up-outline"
                                        : "chevron-down-outline"
                                }
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>

                        {tncExpanded && (
                            <View style={styles.tncContent}>
                                <Text style={styles.tncText}>{tnc}</Text>
                            </View>
                        )}
                    </View>
                ) : null}

                {/* Empty State - Only show if ALL fields are empty */}
                {!description && !tnc && (!banners || banners.length === 0) && (
                    <View style={styles.emptyInfoState}>
                        <Ionicons
                            name="information-circle-outline"
                            size={64}
                            color="#E4002B"
                            style={{ opacity: 0.3 }}
                        />
                        <Text style={styles.emptyInfoTitle}>
                            No Additional Information
                        </Text>
                        <Text style={styles.emptyInfoText}>
                            This campaign doesn't have additional information
                            like description, banners, or terms & conditions
                            yet.
                        </Text>
                        <Text style={styles.emptyInfoHint}>
                            Basic campaign details are shown above.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Full Screen Banner Modal */}
            <Modal
                visible={!!selectedBanner}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedBanner(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setSelectedBanner(null)}
                    >
                        <Ionicons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: selectedBanner }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: "#E4002B",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    cardContent: {
        gap: 12,
    },
    infoRow: {
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#E4002B",
    },
    infoLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    infoValue: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
        marginLeft: 28,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 28,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
    },
    expandableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    expandableHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    expandableContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: "#333",
    },
    bannerHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    bannersContainer: {
        gap: 12,
        paddingRight: 16,
    },
    bannerContainer: {
        width: width * 0.75,
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#e9ecef",
        position: "relative",
        backgroundColor: "#f8f9fa",
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    bannerOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        padding: 8,
    },
    bannerLabel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        padding: 8,
        textAlign: "center",
    },
    tncContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e9ecef",
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#E4002B",
    },
    tncText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#333",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    emptyInfoState: {
        backgroundColor: "#fff",
        padding: 40,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#e9ecef",
        borderStyle: "dashed",
    },
    emptyInfoTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    emptyInfoText: {
        marginTop: 8,
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },
    emptyInfoHint: {
        marginTop: 12,
        fontSize: 12,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCloseButton: {
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

export default RetailerCampaignInfo;
