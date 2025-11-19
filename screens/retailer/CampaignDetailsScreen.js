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
import Header from "../../components/common/Header";
import GridButton from "../../components/common/GridButton";

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
            <Header />

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
                    <GridButton
                        title="Info"
                        icon="information-circle-outline"
                        onPress={() => console.log("Info pressed")}
                        // navigateTo="CampaignInfo"
                        // navigationParams={{ campaign }}
                    />

                    <GridButton
                        title="Gratification"
                        icon="gift-outline"
                        onPress={() => console.log("Gratification pressed")}
                        // navigateTo="CampaignInfo"
                        // navigationParams={{ campaign }}
                    />

                    {/* Row 2 */}
                    <GridButton
                        title="View Report"
                        icon="document-text-outline"
                        onPress={() => console.log("View Report pressed")}
                        // navigateTo="CampaignInfo"
                        // navigationParams={{ campaign }}
                    />

                    <GridButton
                        title="Stats"
                        icon="stats-chart-outline"
                        onPress={() => console.log("Stats pressed")}
                        // navigateTo="CampaignInfo"
                        // navigationParams={{ campaign }}
                    />

                    {/* Row 3 */}
                    <GridButton
                        title="Period"
                        icon="calendar-outline"
                        onPress={() => console.log("Period pressed")}
                        // navigateTo="CampaignInfo"
                        // navigationParams={{ campaign }}
                    />

                    <GridButton
                        title="Leaderboard"
                        icon="trophy-outline"
                        onPress={() => console.log("Leaderboard pressed")}
                        // navigateTo="CampaignInfo"
                        // navigationParams={{ campaign }}
                    />
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
