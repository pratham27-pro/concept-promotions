import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://srv1168036.hstgr.cloud/api";

const RetailerProfileScreen = () => {
    const { logout } = useAuth();
    const navigation = useNavigation();

    const [retailer, setRetailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [personPhotoUri, setPersonPhotoUri] = useState(null);

    // Fetch retailer profile on mount and when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchRetailerProfile();
        }, [])
    );

    const fetchRetailerProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                Alert.alert("Error", "Please login again");
                navigation.replace("Login");
                return;
            }

            // Fetch profile data
            const response = await fetch(
                `${API_BASE_URL}/retailer/retailer/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseData = await response.json();

            if (response.ok && responseData) {
                // console.log("📋 Retailer data:", responseData);

                // Calculate profile completion
                const completion = calculateProfileCompletion(responseData);
                setRetailer({ ...responseData, profileCompletion: completion });

                // Fetch person photo if it exists
                await fetchPersonPhoto(token);
            } else {
                throw new Error(
                    responseData.message || "Failed to fetch profile"
                );
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPersonPhoto = async (token) => {
        try {
            console.log("🔍 Fetching person photo directly...");

            const response = await fetch(
                `${API_BASE_URL}/retailer/retailer/image/personPhoto`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("📸 Image response status:", response.status);

            // If 404, image doesn't exist - that's fine
            if (response.status === 404) {
                console.log("ℹ️ No person photo found for this retailer");
                return;
            }

            if (!response.ok) {
                console.log(`⚠️ Error fetching image: ${response.status}`);
                const errorText = await response.text();
                console.log("Error details:", errorText);
                return;
            }

            console.log("✅ Image response OK, processing blob...");

            const blob = await response.blob();
            console.log("📦 Blob received, size:", blob.size, "bytes");

            const reader = new FileReader();

            reader.onloadend = () => {
                console.log("📖 FileReader finished");
                let base64Data = reader.result;

                if (!base64Data || !base64Data.startsWith("data:")) {
                    console.log("❌ Invalid data URI");
                    return;
                }

                let base64Content = base64Data.split(",")[1];
                console.log(
                    "📝 Base64 preview:",
                    base64Content.substring(0, 20)
                );

                // DETECT AND FIX DOUBLE-ENCODING
                if (base64Content?.startsWith("LzlqLz")) {
                    console.log(
                        `🔧 Detected double-encoded image, decoding...`
                    );
                    try {
                        const decodedContent = atob(base64Content);

                        if (
                            decodedContent.startsWith("/9j/") ||
                            decodedContent.startsWith("iVBOR")
                        ) {
                            base64Content = decodedContent;
                            console.log(`✅ Successfully decoded`);
                        }
                    } catch (decodeError) {
                        console.error(`❌ Failed to decode:`, decodeError);
                    }
                }

                // Detect image type and reconstruct with correct MIME
                const isJPEG = base64Content?.startsWith("/9j/");
                const isPNG = base64Content?.startsWith("iVBOR");

                console.log("🔍 Image type - JPEG:", isJPEG, "PNG:", isPNG);

                if (isPNG) {
                    base64Data = `data:image/png;base64,${base64Content}`;
                } else if (isJPEG) {
                    base64Data = `data:image/jpeg;base64,${base64Content}`;
                } else {
                    console.warn(`⚠️ Unknown image format, using default`);
                    base64Data = `data:image/jpeg;base64,${base64Content}`;
                }

                console.log(`✅ Setting person photo URI`);
                setPersonPhotoUri(base64Data);
                console.log(`✅ Person photo loaded successfully!`);
            };

            reader.onerror = (error) => {
                console.error("❌ FileReader error:", error);
            };

            console.log("📖 Starting FileReader...");
            reader.readAsDataURL(blob);
        } catch (error) {
            console.log("❌ Error in fetchPersonPhoto:", error.message);
            console.error("Full error:", error);
        }
    };

    const calculateProfileCompletion = (data) => {
        let completedFields = 0;
        const totalFields = 15;

        // Basic fields
        if (data.name) completedFields++;
        if (data.contactNo) completedFields++;
        if (data.email) completedFields++;
        if (data.dob) completedFields++;
        if (data.gender) completedFields++;
        if (data.govtIdType && data.govtIdNumber) completedFields++;

        // Shop details
        if (data.shopDetails?.shopName) completedFields++;
        if (data.shopDetails?.businessType) completedFields++;
        if (data.shopDetails?.ownershipType) completedFields++;
        if (data.shopDetails?.PANCard) completedFields++;
        if (data.shopDetails?.shopAddress?.address) completedFields++;

        // Bank details
        if (data.bankDetails?.bankName) completedFields++;
        if (data.bankDetails?.accountNumber) completedFields++;
        if (data.bankDetails?.IFSC) completedFields++;

        // T&C and Penny Check
        if (data.tnc && data.pennyCheck) completedFields++;

        return Math.round((completedFields / totalFields) * 100);
    };

    const getTierColor = (tier) => {
        switch (tier?.toLowerCase()) {
            case "platinum":
                return ["#E5E4E2", "#BCC6CC"];
            case "gold":
                return ["#FFD700", "#FFA500"];
            case "silver":
                return ["#C0C0C0", "#808080"];
            case "bronze":
                return ["#CD7F32", "#8B4513"];
            default:
                return ["#E0E0E0", "#9E9E9E"];
        }
    };

    const getTierIcon = (tier) => {
        switch (tier?.toLowerCase()) {
            case "platinum":
                return "diamond";
            case "gold":
                return "trophy";
            case "silver":
                return "medal";
            case "bronze":
                return "ribbon";
            default:
                return "star";
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRetailerProfile();
        setRefreshing(false);
    };

    const handleUpdateProfile = () => {
        navigation.navigate("CompleteRetailerProfile");
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        navigation.replace("Login");
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    if (!retailer) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <StatusBar style="dark" />
                <Ionicons name="alert-circle-outline" size={60} color="#999" />
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchRetailerProfile}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#007AFF"]}
                        tintColor="#007AFF"
                    />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    {/* Profile Photo */}
                    <TouchableOpacity
                        style={styles.photoContainer}
                        onPress={handleUpdateProfile}
                        activeOpacity={0.8}
                    >
                        {personPhotoUri ? (
                            <>
                                <Image
                                    source={{ uri: personPhotoUri }}
                                    style={styles.profilePhoto}
                                />
                                <View style={styles.editBadge}>
                                    <Ionicons
                                        name="camera"
                                        size={16}
                                        color="#fff"
                                    />
                                </View>
                            </>
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Ionicons
                                    name="person"
                                    size={60}
                                    color="#999"
                                />
                                <Text style={styles.addPhotoText}>
                                    Tap to add photo
                                </Text>
                            </View>
                        )}

                        {/* Tier Badge */}
                        {retailer.tier && (
                            <LinearGradient
                                colors={getTierColor(retailer.tier)}
                                style={styles.tierBadge}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name={getTierIcon(retailer.tier)}
                                    size={16}
                                    color="#fff"
                                />
                                <Text style={styles.tierText}>
                                    {retailer.tier.toUpperCase()}
                                </Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>

                    {/* Retailer Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.retailerName}>{retailer.name}</Text>
                        {retailer.shopDetails?.shopName && (
                            <Text style={styles.shopName}>
                                {retailer.shopDetails.shopName}
                            </Text>
                        )}
                        {retailer.uniqueId && (
                            <Text style={styles.uniqueId}>
                                ID: {retailer.uniqueId}
                            </Text>
                        )}
                        {retailer.retailerCode && (
                            <Text style={styles.retailerCode}>
                                Code: {retailer.retailerCode}
                            </Text>
                        )}

                        <View style={styles.contactInfo}>
                            {retailer.email && (
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.infoText}>
                                        {retailer.email}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="call-outline"
                                    size={16}
                                    color="#666"
                                />
                                <Text style={styles.infoText}>
                                    {retailer.contactNo}
                                </Text>
                            </View>
                            {retailer.createdAt && (
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.infoText}>
                                        Joined: {formatDate(retailer.createdAt)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Profile Completion */}
                <View style={styles.completionCard}>
                    <View style={styles.completionHeader}>
                        <Text style={styles.completionTitle}>
                            Profile Completion
                        </Text>
                        <Text style={styles.completionPercentage}>
                            {retailer.profileCompletion || 0}%
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <LinearGradient
                                colors={["#4CAF50", "#8BC34A"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${
                                            retailer.profileCompletion || 0
                                        }%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    {(retailer.profileCompletion || 0) < 100 && (
                        <Text style={styles.completionHint}>
                            Complete your profile to unlock more features!
                        </Text>
                    )}
                </View>

                {/* Shop Details Card */}
                {retailer.shopDetails && (
                    <View style={styles.detailsCard}>
                        <Text style={styles.cardTitle}>Shop Details</Text>

                        {retailer.shopDetails.businessType && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Business Type
                                </Text>
                                <Text style={styles.detailValue}>
                                    {retailer.shopDetails.businessType}
                                </Text>
                            </View>
                        )}

                        {retailer.shopDetails.ownershipType && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Ownership Type
                                </Text>
                                <Text style={styles.detailValue}>
                                    {retailer.shopDetails.ownershipType}
                                </Text>
                            </View>
                        )}

                        {retailer.shopDetails.PANCard && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>PAN Card</Text>
                                <Text style={styles.detailValue}>
                                    {retailer.shopDetails.PANCard}
                                </Text>
                            </View>
                        )}

                        {retailer.shopDetails.GSTNo && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>GST No.</Text>
                                <Text style={styles.detailValue}>
                                    {retailer.shopDetails.GSTNo}
                                </Text>
                            </View>
                        )}

                        {retailer.shopDetails.shopAddress?.address && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Address</Text>
                                <Text style={styles.detailValue}>
                                    {retailer.shopDetails.shopAddress.address}
                                    {retailer.shopDetails.shopAddress
                                        .address2 &&
                                        `, ${retailer.shopDetails.shopAddress.address2}`}
                                    {retailer.shopDetails.shopAddress.city &&
                                        `, ${retailer.shopDetails.shopAddress.city}`}
                                    {retailer.shopDetails.shopAddress.state &&
                                        `, ${retailer.shopDetails.shopAddress.state}`}
                                    {retailer.shopDetails.shopAddress.pincode &&
                                        ` - ${retailer.shopDetails.shopAddress.pincode}`}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Profile Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons
                            name="briefcase-outline"
                            size={28}
                            color="#007AFF"
                        />
                        <Text style={styles.statValue}>
                            {retailer.assignedCampaigns?.length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Campaigns</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={28}
                            color="#28a745"
                        />
                        <Text style={styles.statValue}>
                            {Math.floor(
                                (retailer.assignedCampaigns?.length || 0) * 0.7
                            )}
                        </Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="time-outline"
                            size={28}
                            color="#FFA500"
                        />
                        <Text style={styles.statValue}>
                            {Math.ceil(
                                (retailer.assignedCampaigns?.length || 0) * 0.3
                            )}
                        </Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                {/* Update Profile Button */}
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#007AFF", "#0051D5"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.updateButtonGradient}
                    >
                        <Ionicons
                            name="create-outline"
                            size={22}
                            color="#fff"
                        />
                        <Text style={styles.updateButtonText}>
                            Update Profile
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Additional Options */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.optionItem, styles.logoutOption]}
                        onPress={handleLogout}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons
                                name="log-out-outline"
                                size={24}
                                color="#dc3545"
                            />
                            <Text
                                style={[styles.optionText, styles.logoutText]}
                            >
                                Logout
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#dc3545"
                        />
                    </TouchableOpacity>
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
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 120,
        paddingHorizontal: 20,
    },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    photoContainer: {
        alignSelf: "center",
        position: "relative",
        marginBottom: 20,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#fff",
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#fff",
    },
    editBadge: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#007AFF",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    addPhotoText: {
        fontSize: 12,
        color: "#999",
        marginTop: 8,
        textAlign: "center",
    },
    tierBadge: {
        position: "absolute",
        bottom: 0,
        left: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    tierText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    infoContainer: {
        alignItems: "center",
    },
    retailerName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    shopName: {
        fontSize: 16,
        color: "#666",
        marginBottom: 3,
    },
    uniqueId: {
        fontSize: 13,
        color: "#999",
        marginBottom: 3,
    },
    retailerCode: {
        fontSize: 13,
        color: "#999",
        marginBottom: 15,
    },
    contactInfo: {
        width: "100%",
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 5,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    completionCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    completionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    completionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    completionPercentage: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4CAF50",
    },
    progressBarContainer: {
        marginBottom: 10,
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 10,
    },
    completionHint: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
        marginTop: 5,
    },
    detailsCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    detailRow: {
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 13,
        color: "#666",
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    updateButton: {
        marginTop: 20,
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    updateButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    updateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    optionsContainer: {
        marginTop: 20,
        backgroundColor: "#fff",
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    optionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    optionText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    logoutOption: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: "#dc3545",
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: "#666",
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: "#007AFF",
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default RetailerProfileScreen;
