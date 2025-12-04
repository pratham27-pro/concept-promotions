import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

// Import reusable components
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import FileUpload from "../../components/common/FileUpload";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

// TODO: Yet to be tested after retailer profile completion and updation is sorted.

const SubmitReportScreen = ({ route, navigation }) => {
    const { campaign } = route.params;

    // Loading state
    const [submitting, setSubmitting] = useState(false);

    // Visit Type (always "physical" for retailer)
    const [visitType] = useState("physical");

    // Report Type
    const [reportTypeOpen, setReportTypeOpen] = useState(false);
    const [reportType, setReportType] = useState(null);
    const [reportTypeOptions] = useState([
        { label: "Window Display", value: "window" },
        { label: "Stock", value: "stock" },
        { label: "Others", value: "others" },
    ]);

    // Frequency (Future use)
    const [frequencyOpen, setFrequencyOpen] = useState(false);
    const [frequency, setFrequency] = useState(null);
    const [frequencyOptions] = useState([
        { label: "Daily", value: "daily" },
        { label: "Weekly", value: "weekly" },
        { label: "Fortnightly", value: "fortnightly" },
        { label: "Monthly", value: "monthly" },
        { label: "Custom", value: "custom" },
    ]);

    // Custom Date Range
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

    // Future Options
    const [futureOpen, setFutureOpen] = useState(false);
    const [future, setFuture] = useState(null);
    const [futureOptions] = useState([
        { label: "Future Option 1", value: "future1" },
        { label: "Future Option 2", value: "future2" },
        { label: "Future Option 3", value: "future3" },
    ]);

    // Stock Section
    const [stockTypeOpen, setStockTypeOpen] = useState(false);
    const [stockType, setStockType] = useState(null);
    const [stockTypeOptions] = useState([
        { label: "Opening Stock", value: "opening" },
        { label: "Closing Stock", value: "closing" },
        { label: "Purchase Stock", value: "purchase" },
        { label: "Sold Stock", value: "sold" },
    ]);

    const [brandOpen, setBrandOpen] = useState(false);
    const [brand, setBrand] = useState(null);
    const [brandOptions] = useState([
        { label: "Brand A", value: "brand1" },
        { label: "Brand B", value: "brand2" },
        { label: "Brand C", value: "brand3" },
    ]);

    const [productOpen, setProductOpen] = useState(false);
    const [product, setProduct] = useState(null);
    const [productOptions] = useState([
        { label: "Product X", value: "product1" },
        { label: "Product Y", value: "product2" },
        { label: "Product Z", value: "product3" },
    ]);

    const [skuOpen, setSkuOpen] = useState(false);
    const [sku, setSku] = useState(null);
    const [skuOptions] = useState([
        { label: "SKU 1", value: "sku1" },
        { label: "SKU 2", value: "sku2" },
        { label: "SKU 3", value: "sku3" },
    ]);

    const [productTypeOpen, setProductTypeOpen] = useState(false);
    const [productType, setProductType] = useState(null);
    const [productTypeOptions] = useState([
        { label: "Focus", value: "focus" },
        { label: "All", value: "all" },
    ]);

    const [quantity, setQuantity] = useState("");
    const [billCopy, setBillCopy] = useState(null);

    // Other Reason Text (for "others" report type)
    const [otherReasonText, setOtherReasonText] = useState("");

    // Files for window and others
    const [files, setFiles] = useState([]);

    // Location
    const [location, setLocation] = useState(null);

    // Get current location
    const getCurrentLocation = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location permission is required to submit reports"
                );
                return null;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            return {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };
        } catch (error) {
            console.error("Error getting location:", error);
            return null;
        }
    };

    const validateForm = () => {
        if (!reportType) {
            Alert.alert("Error", "Please select report type");
            return false;
        }

        // Stock validation
        if (reportType === "stock") {
            if (!stockType) {
                Alert.alert("Error", "Please select stock type");
                return false;
            }
            if (!brand) {
                Alert.alert("Error", "Please select brand");
                return false;
            }
            if (!product) {
                Alert.alert("Error", "Please select product");
                return false;
            }
            if (!sku) {
                Alert.alert("Error", "Please select SKU");
                return false;
            }
            if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
                Alert.alert("Error", "Please enter valid quantity");
                return false;
            }
        }

        // Window validation
        if (reportType === "window") {
            if (!files || files.length === 0) {
                Alert.alert(
                    "Error",
                    "Please upload at least one shop display image"
                );
                return false;
            }
        }

        // Others validation
        if (reportType === "others") {
            if (!otherReasonText.trim()) {
                Alert.alert("Error", "Please describe the reason");
                return false;
            }
            if (!files || files.length === 0) {
                Alert.alert("Error", "Please upload a file");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // Get location
            const currentLocation = await getCurrentLocation();
            if (!currentLocation) {
                Alert.alert(
                    "Error",
                    "Unable to get location. Please try again."
                );
                setSubmitting(false);
                return;
            }

            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            const formData = new FormData();

            // Basic fields
            formData.append("campaignId", campaign.id);
            formData.append("visitType", visitType);
            formData.append("reportType", reportType);
            formData.append("latitude", currentLocation.latitude);
            formData.append("longitude", currentLocation.longitude);

            // Stock fields
            if (reportType === "stock") {
                formData.append("stockType", stockType);
                formData.append("brand", brand);
                formData.append("product", product);
                formData.append("sku", sku);
                formData.append("quantity", quantity);

                // Bill copy upload
                if (billCopy && billCopy.uri) {
                    formData.append("images", {
                        uri: billCopy.uri,
                        name: billCopy.name || "bill_copy.pdf",
                        type:
                            billCopy.mimeType ||
                            billCopy.type ||
                            "application/pdf",
                    });
                }
            }

            // Others fields
            if (reportType === "others") {
                formData.append("otherReasonText", otherReasonText);
            }

            // Images upload (for window and others)
            if (
                (reportType === "window" || reportType === "others") &&
                files.length > 0
            ) {
                files.forEach((file, index) => {
                    if (file && file.uri) {
                        formData.append("images", {
                            uri: file.uri,
                            name: file.name || `image_${index + 1}.jpg`,
                            type: file.mimeType || file.type || "image/jpeg",
                        });
                    }
                });
            }

            console.log("📤 Submitting retailer report...");

            const response = await fetch(
                `${API_BASE_URL}/retailer/report/submit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // Don't set Content-Type - FormData will set it with boundary
                    },
                    body: formData,
                }
            );

            const responseText = await response.text();
            console.log("📥 Raw response:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("❌ Failed to parse JSON:", e);
                throw new Error("Server returned invalid response");
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit report");
            }

            console.log("✅ Report submitted successfully:", data);

            Alert.alert("Success", "Report submitted successfully!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error("❌ Error submitting report:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to submit report. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header using reusable component */}
            <Header title="Submit Report" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                <View style={styles.formContainer}>
                    {/* Campaign Info */}
                    <View style={styles.campaignInfo}>
                        <Text style={styles.campaignInfoText}>
                            Campaign: {campaign.title}
                        </Text>
                    </View>

                    {/* Type of Report */}
                    <SearchableDropdown
                        label="Type of Report"
                        placeholder="Select Report Type"
                        open={reportTypeOpen}
                        value={reportType}
                        items={reportTypeOptions}
                        setOpen={setReportTypeOpen}
                        setValue={setReportType}
                        required={true}
                        zIndex={7000}
                    />

                    {/* Frequency (Future Use) */}
                    <SearchableDropdown
                        label="Frequency (Future Use)"
                        placeholder="Select Frequency"
                        open={frequencyOpen}
                        value={frequency}
                        items={frequencyOptions}
                        setOpen={setFrequencyOpen}
                        setValue={setFrequency}
                        zIndex={6000}
                        onSelectItem={(item) => {
                            setShowCustomDate(item.value === "custom");
                        }}
                    />

                    {/* Custom Date Range */}
                    {showCustomDate && (
                        <View
                            style={[styles.dateRangeContainer, { zIndex: 1 }]}
                        >
                            <View style={styles.dateInputWrapper}>
                                <Text style={styles.label}>From *</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowFromPicker(true)}
                                >
                                    <Text>{fromDate.toLocaleDateString()}</Text>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                                {showFromPicker && (
                                    <DateTimePicker
                                        value={fromDate}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowFromPicker(false);
                                            if (selectedDate)
                                                setFromDate(selectedDate);
                                        }}
                                    />
                                )}
                            </View>

                            <View style={styles.dateInputWrapper}>
                                <Text style={styles.label}>To *</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowToPicker(true)}
                                >
                                    <Text>{toDate.toLocaleDateString()}</Text>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                                {showToPicker && (
                                    <DateTimePicker
                                        value={toDate}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowToPicker(false);
                                            if (selectedDate)
                                                setToDate(selectedDate);
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                    )}

                    {/* Extra (Future) */}
                    <SearchableDropdown
                        label="Extra (Future Use)"
                        placeholder="Select future use"
                        open={futureOpen}
                        value={future}
                        items={futureOptions}
                        setOpen={setFutureOpen}
                        setValue={setFuture}
                        zIndex={5000}
                    />

                    {/* STOCK SECTION */}
                    {reportType === "stock" && (
                        <View style={[styles.stockSection, { zIndex: 1 }]}>
                            <Text style={styles.sectionTitle}>
                                Stock Details
                            </Text>

                            <SearchableDropdown
                                label="Type of Stock"
                                placeholder="Select Stock Type"
                                open={stockTypeOpen}
                                value={stockType}
                                items={stockTypeOptions}
                                setOpen={setStockTypeOpen}
                                setValue={setStockType}
                                required={true}
                                zIndex={4000}
                            />

                            <SearchableDropdown
                                label="Brand"
                                placeholder="Select Brand"
                                open={brandOpen}
                                value={brand}
                                items={brandOptions}
                                setOpen={setBrandOpen}
                                setValue={setBrand}
                                required={true}
                                zIndex={3000}
                            />

                            <SearchableDropdown
                                label="Product"
                                placeholder="Select Product"
                                open={productOpen}
                                value={product}
                                items={productOptions}
                                setOpen={setProductOpen}
                                setValue={setProduct}
                                required={true}
                                zIndex={2000}
                            />

                            <SearchableDropdown
                                label="SKU"
                                placeholder="Select SKU"
                                open={skuOpen}
                                value={sku}
                                items={skuOptions}
                                setOpen={setSkuOpen}
                                setValue={setSku}
                                required={true}
                                zIndex={1000}
                            />

                            <SearchableDropdown
                                label="Product Type"
                                placeholder="Select Product Type"
                                open={productTypeOpen}
                                value={productType}
                                items={productTypeOptions}
                                setOpen={setProductTypeOpen}
                                setValue={setProductType}
                                zIndex={500}
                            />

                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>Quantity *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter quantity"
                                    placeholderTextColor="#999"
                                    value={quantity}
                                    onChangeText={(text) =>
                                        setQuantity(text.replace(/[^0-9]/g, ""))
                                    }
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Bill Copy */}
                            <FileUpload
                                label="Bill Copy (Optional)"
                                file={billCopy}
                                onFileSelect={setBillCopy}
                                onFileRemove={() => setBillCopy(null)}
                                accept="all"
                                placeholder="Click to upload bill copy"
                            />
                        </View>
                    )}

                    {/* WINDOW SECTION */}
                    {reportType === "window" && (
                        <View style={{ zIndex: 1 }}>
                            <FileUpload
                                label="Upload Shop Display"
                                file={files}
                                onFileSelect={(newFiles) =>
                                    setFiles(
                                        Array.isArray(newFiles)
                                            ? newFiles
                                            : [...files, newFiles]
                                    )
                                }
                                onFileRemove={setFiles}
                                accept="all"
                                multiple={true}
                                placeholder="Click to add images"
                                required={true}
                            />
                        </View>
                    )}

                    {/* OTHERS SECTION */}
                    {reportType === "others" && (
                        <View style={{ zIndex: 1 }}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Reason *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe the reason for this report"
                                    placeholderTextColor="#999"
                                    value={otherReasonText}
                                    onChangeText={setOtherReasonText}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            <FileUpload
                                label="Upload File"
                                file={files.length > 0 ? files[0] : null}
                                onFileSelect={(file) => setFiles([file])}
                                onFileRemove={() => setFiles([])}
                                accept="all"
                                placeholder="Click to upload file"
                                required={true}
                            />
                        </View>
                    )}

                    {/* Location Info */}
                    <View style={styles.infoCard}>
                        <Ionicons name="location" size={20} color="#007AFF" />
                        <Text style={styles.infoText}>
                            Location will be captured automatically when you
                            submit
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            submitting && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Submit Report
                            </Text>
                        )}
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
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 100 : 90,
    },
    formContainer: {
        padding: 20,
    },
    campaignInfo: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    campaignInfoText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 15,
        fontSize: 15,
        color: "#333",
    },
    textArea: {
        minHeight: 100,
        paddingTop: 15,
    },
    dateRangeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 10,
    },
    dateInputWrapper: {
        flex: 1,
    },
    dateInput: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    stockSection: {
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    infoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F4FF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#007AFF",
    },
    submitButton: {
        backgroundColor: "#E4002B",
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: "#FFCDD2",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SubmitReportScreen;
