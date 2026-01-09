// Gratification.js - Same as Retailer version but for Employee
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

const Gratification = ({ route, navigation }) => {
    const { campaign } = route.params;

    const [selectedImage, setSelectedImage] = useState(null);
    const [descriptionExpanded, setDescriptionExpanded] = useState(true);

    // Debug logs
    console.log(
        "🎁 Employee Gratification Screen - Full Campaign Object:",
        campaign
    );
    console.log("🎁 Gratification Field:", campaign?.gratification);

    if (!campaign) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <StatusBar style="dark" />
                <Header title="Gratification" />
                <View style={styles.emptyState}>
                    <Ionicons name="gift-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                        No campaign data available
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Extract gratification data
    const gratification =
        campaign.gratification || campaign.rawData?.gratification || {};
    const gratificationType = gratification.type || "";
    const gratificationDescription = gratification.description || "";
    const gratificationImages = gratification.images || [];

    console.log("🎁 Extracted - Type:", gratificationType || "NO");
    console.log(
        "📝 Extracted - Description:",
        gratificationDescription ? "YES" : "NO"
    );
    console.log("🖼️ Extracted - Images:", gratificationImages.length);

    // Get image URL
    const getImageUrl = (image) => {
        if (!image) return null;
        return image?.url || image?.secure_url || image;
    };

    const hasGratificationData =
        gratificationType ||
        gratificationDescription ||
        gratificationImages.length > 0;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header title="Gratification" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="gift" size={32} color="#E4002B" />
                    </View>
                    <Text style={styles.headerTitle}>
                        Gratification Details
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        Rewards & Benefits for this campaign
                    </Text>
                </View>

                {hasGratificationData ? (
                    <>
                        {/* Gratification Type */}
                        {gratificationType && (
                            <View style={styles.card}>
                                <View style={styles.cardTitleContainer}>
                                    <Ionicons
                                        name="pricetag"
                                        size={22}
                                        color="#E4002B"
                                    />
                                    <Text style={styles.cardTitle}>
                                        Gratification Type
                                    </Text>
                                </View>

                                <View style={styles.typeBadgeContainer}>
                                    <View style={styles.typeBadge}>
                                        <Ionicons
                                            name="star"
                                            size={18}
                                            color="#7c3aed"
                                        />
                                        <Text style={styles.typeBadgeText}>
                                            {gratificationType}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Gratification Description */}
                        {gratificationDescription && (
                            <View style={styles.card}>
                                <TouchableOpacity
                                    style={styles.expandableHeader}
                                    onPress={() =>
                                        setDescriptionExpanded(
                                            !descriptionExpanded
                                        )
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
                                            {gratificationDescription}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Gratification Images */}
                        {gratificationImages &&
                            gratificationImages.length > 0 && (
                                <View style={styles.card}>
                                    <View style={styles.imagesHeader}>
                                        <Ionicons
                                            name="images"
                                            size={22}
                                            color="#E4002B"
                                        />
                                        <Text style={styles.cardTitle}>
                                            Gratification Images (
                                            {gratificationImages.length})
                                        </Text>
                                    </View>

                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={
                                            styles.imagesContainer
                                        }
                                    >
                                        {gratificationImages.map(
                                            (image, index) => {
                                                const imageUrl =
                                                    getImageUrl(image);
                                                console.log(
                                                    `🖼️ Gratification Image ${
                                                        index + 1
                                                    } URL:`,
                                                    imageUrl
                                                );

                                                if (!imageUrl) return null;

                                                return (
                                                    <TouchableOpacity
                                                        key={
                                                            image?.publicId ||
                                                            index
                                                        }
                                                        style={
                                                            styles.imageContainer
                                                        }
                                                        onPress={() =>
                                                            setSelectedImage(
                                                                imageUrl
                                                            )
                                                        }
                                                        activeOpacity={0.8}
                                                    >
                                                        <Image
                                                            source={{
                                                                uri: imageUrl,
                                                            }}
                                                            style={styles.image}
                                                            resizeMode="cover"
                                                            onError={(e) => {
                                                                console.error(
                                                                    `❌ Failed to load gratification image ${index}:`,
                                                                    imageUrl
                                                                );
                                                            }}
                                                            onLoad={() => {
                                                                console.log(
                                                                    `✅ Gratification image ${index} loaded successfully`
                                                                );
                                                            }}
                                                        />
                                                        <View
                                                            style={
                                                                styles.imageOverlay
                                                            }
                                                        >
                                                            <Ionicons
                                                                name="expand-outline"
                                                                size={24}
                                                                color="#fff"
                                                            />
                                                        </View>
                                                        <Text
                                                            style={
                                                                styles.imageLabel
                                                            }
                                                        >
                                                            Image {index + 1}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            }
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                    </>
                ) : (
                    /* Empty State */
                    <View style={styles.emptyInfoState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons
                                name="gift-outline"
                                size={80}
                                color="#E4002B"
                                style={{ opacity: 0.2 }}
                            />
                        </View>
                        <Text style={styles.emptyInfoTitle}>
                            No Gratification Details
                        </Text>
                        <Text style={styles.emptyInfoText}>
                            This campaign doesn't have gratification details
                            available yet.
                        </Text>
                        <Text style={styles.emptyInfoHint}>
                            Check back later or contact your campaign manager
                            for more information.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Full Screen Image Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Ionicons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// Use the same styles from RetailerCampaignGratification
const styles = StyleSheet.create({
    // ... (same styles as RetailerCampaignGratification)
    // Copy all styles from the retailer gratification screen
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
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#E4002B",
    },
    headerIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#ffe5e9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
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
    typeBadgeContainer: {
        alignItems: "flex-start",
    },
    typeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3e8ff",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
        borderWidth: 1,
        borderColor: "#e9d5ff",
    },
    typeBadgeText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#7c3aed",
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
    imagesHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    imagesContainer: {
        gap: 12,
        paddingRight: 16,
    },
    imageContainer: {
        width: width * 0.7,
        height: 220,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#e9ecef",
        position: "relative",
        backgroundColor: "#f8f9fa",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        padding: 8,
    },
    imageLabel: {
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
        borderRadius: 16,
        alignItems: "center",
        marginTop: 20,
        borderWidth: 2,
        borderColor: "#e9ecef",
        borderStyle: "dashed",
    },
    emptyIconContainer: {
        marginBottom: 20,
    },
    emptyInfoTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 8,
    },
    emptyInfoText: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 12,
    },
    emptyInfoHint: {
        fontSize: 13,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
        lineHeight: 18,
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

export default Gratification;
