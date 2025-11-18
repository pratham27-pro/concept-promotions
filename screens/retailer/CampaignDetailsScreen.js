import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";

const CampaignDetailsScreen = ({ route, navigation }) => {
    const { campaign } = route.params;

    const handleButtonPress = (buttonName) => {
        Alert.alert(buttonName, `You pressed ${buttonName}`);
        // You can navigate to different screens based on button pressed
        // navigation.navigate('InfoScreen', { campaign });
    };

    const handleSubmitReport = () => {
        RootNavigation.navigate("SubmitReport", { campaign });
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>CONCEPT</Text>
                        <Text style={styles.logoSubtext}>PROMOTIONS</Text>
                    </View>
                </View>

                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Campaign Name */}
                <View style={styles.campaignNameContainer}>
                    <Text style={styles.campaignName}>{campaign.title}</Text>
                    <Text style={styles.campaignDuration}>
                        📅 {campaign.startDate} - {campaign.endDate}
                    </Text>
                </View>

                {/* Grid Buttons - 2 columns, 3 rows */}
                <View style={styles.gridContainer}>
                    {/* Row 1 */}
                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={() => handleButtonPress("Info")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#ff6b6b", "#ee5a6f"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons
                                name="information-circle-outline"
                                size={28}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>Info</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={() => handleButtonPress("Gratification")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#ff6b6b", "#ee5a6f"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons
                                name="gift-outline"
                                size={28}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>Gratification</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Row 2 */}
                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={() => handleButtonPress("View Report")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#ff6b6b", "#ee5a6f"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={28}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>View Report</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={() => handleButtonPress("Status")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#ff6b6b", "#ee5a6f"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons
                                name="stats-chart-outline"
                                size={28}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>Status</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Row 3 */}
                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={() => handleButtonPress("Period")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#ff6b6b", "#ee5a6f"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={28}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>Period</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonWrapper}
                        onPress={() => handleButtonPress("Leaderboard")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#ff6b6b", "#ee5a6f"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                        >
                            <Ionicons
                                name="trophy-outline"
                                size={28}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>Leaderboard</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Submit Report Button */}
                <TouchableOpacity
                    style={styles.submitButtonWrapper}
                    onPress={handleSubmitReport}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#dc3545", "#c82333"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButton}
                    >
                        <Ionicons
                            name="cloud-upload-outline"
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.submitButtonText}>
                            Submit Report
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
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
        flexGrow: 1,
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
    campaignNameContainer: {
        backgroundColor: "#fff",
        padding: 20,
        marginTop: 15,
        marginHorizontal: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    campaignName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
    },
    campaignDuration: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 15,
        marginTop: 20,
        justifyContent: "space-between",
    },
    buttonWrapper: {
        width: "48%",
        marginBottom: 15,
    },
    gradientButton: {
        height: 120,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#ff6b6b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
        textAlign: "center",
    },
    submitButtonWrapper: {
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 20,
    },
    submitButton: {
        flexDirection: "row",
        height: 60,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#dc3545",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
});

export default CampaignDetailsScreen;
