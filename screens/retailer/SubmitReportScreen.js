import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import reusable components
import GeoTagCamera from "../../components/common/GeoTagCamera"; // ✅ ADD THIS
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import { API_BASE_URL } from "../../url/base";

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const RetailerSubmitReportScreen = ({ route, navigation }) => {
    const { campaign } = route.params;

    // Retailer & Campaign Info
    const [retailerInfo, setRetailerInfo] = useState(null);
    const [campaignId, setCampaignId] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Report Type
    const [reportTypeOpen, setReportTypeOpen] = useState(false);
    const [reportType, setReportType] = useState(null);
    const [reportTypeOptions] = useState([
        { label: "Window Display", value: "Window Display" },
        { label: "Stock", value: "Stock" },
        { label: "Others", value: "Others" },
    ]);

    // Frequency
    const [frequencyOpen, setFrequencyOpen] = useState(false);
    const [frequency, setFrequency] = useState(null);
    const [frequencyOptions] = useState([
        { label: "Daily", value: "Daily" },
        { label: "Weekly", value: "Weekly" },
        { label: "Fortnightly", value: "Fortnightly" },
        { label: "Monthly", value: "Monthly" },
        { label: "Adhoc", value: "Adhoc" },
    ]);

    // Date & Remarks
    const [dateOfSubmission, setDateOfSubmission] = useState(getTodayDate());
    const [remarks, setRemarks] = useState("");

    // Stock Fields
    const [stockTypeOpen, setStockTypeOpen] = useState(false);
    const [stockType, setStockType] = useState(null);
    const [stockTypeOptions] = useState([
        { label: "Opening Stock", value: "Opening Stock" },
        { label: "Closing Stock", value: "Closing Stock" },
        { label: "Purchase Stock", value: "Purchase Stock" },
        { label: "Sold Stock", value: "Sold Stock" },
    ]);

    const [productTypeOpen, setProductTypeOpen] = useState(false);
    const [productType, setProductType] = useState(null);
    const [productTypeOptions] = useState([
        { label: "Focus", value: "Focus" },
        { label: "All", value: "All" },
    ]);

    const [brand, setBrand] = useState("");
    const [product, setProduct] = useState("");
    const [sku, setSku] = useState("");
    const [quantity, setQuantity] = useState("");

    // Files
    const [shopDisplayImages, setShopDisplayImages] = useState([]); // ✅ Now handles geotag data
    const [billCopies, setBillCopies] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);

    // ===============================
    // FETCH DATA ON MOUNT
    // ===============================
    useEffect(() => {
        fetchRetailerInfo();
        if (campaign) {
            fetchCampaignId();
        }
    }, [campaign]);

    const fetchRetailerInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please log in again");
                navigation.replace("Login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/retailer/retailer/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load retailer profile");
            }

            const data = await response.json();
            console.log(
                "✅ FULL Retailer data:",
                JSON.stringify(data, null, 2)
            );
            console.log("✅ Retailer loaded:", {
                name: data.name,
                uniqueId: data.uniqueId,
                shopName: data.shopDetails?.shopName,
            });
            setRetailerInfo(data);
        } catch (err) {
            console.error("❌ Error fetching retailer info:", err);
            Alert.alert("Error", "Failed to load retailer information");
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaignId = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.get(
                `${API_BASE_URL}/retailer/campaigns`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const matchedCampaign = response.data.campaigns?.find(
                (c) => c.name === campaign.name || c._id === campaign.id
            );

            if (matchedCampaign) {
                setCampaignId(matchedCampaign._id);
                console.log("✅ Campaign ID found:", matchedCampaign._id);
            }
        } catch (err) {
            console.error("❌ Error fetching campaign ID:", err);
        }
    };

    // ===============================
    // REMOVED: pickShopDisplayImages - Now using GeoTagCamera
    // ===============================

    const pickBillCopies = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf"],
            multiple: true,
        });

        if (!result.canceled) {
            setBillCopies((prev) => [...prev, ...result.assets]);
        }
    };

    const pickOtherFiles = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            multiple: true,
        });

        if (!result.canceled) {
            setOtherFiles((prev) => [...prev, ...result.assets]);
        }
    };

    // REMOVED: removeShopImage - Handled by GeoTagCamera

    const removeBillCopy = (index) => {
        setBillCopies((prev) => prev.filter((_, i) => i !== index));
    };

    const removeOtherFile = (index) => {
        setOtherFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ===============================
    // VALIDATION & SUBMISSION
    // ===============================
    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem("userToken");
        // Validation
        if (!reportType) {
            Alert.alert("Error", "Please select a report type");
            return;
        }
        if (!campaignId) {
            Alert.alert("Error", "Campaign information not loaded");
            return;
        }
        if (!frequency) {
            Alert.alert("Error", "Please select frequency");
            return;
        }
        if (!dateOfSubmission) {
            Alert.alert("Error", "Please select date of submission");
            return;
        }
        if (!retailerInfo) {
            Alert.alert("Error", "Retailer information not loaded");
            return;
        }
        if (!retailerInfo.uniqueId) {
            Alert.alert(
                "Error",
                "Retailer unique ID not found. Please contact support."
            );
            return;
        }

        // Stock validation
        if (reportType.value === "Stock") {
            if (
                !stockType ||
                !brand.trim() ||
                !product.trim() ||
                !sku.trim() ||
                !productType ||
                !quantity
            ) {
                Alert.alert("Error", "Please fill all stock fields");
                return;
            }
        }

        try {
            setSubmitting(true);
            const formData = new FormData();

            // Required fields
            formData.append("reportType", reportType.value);
            formData.append("campaignId", campaignId);
            formData.append("frequency", frequency.value);
            formData.append("dateOfSubmission", dateOfSubmission);

            // Submitter info (Retailer)
            formData.append("submittedBy[role]", "Retailer");
            formData.append(
                "submittedBy[userId]",
                retailerInfo._id || retailerInfo.id
            );

            // Retailer info - using uniqueId as outletCode
            formData.append(
                "retailer[retailerId]",
                retailerInfo._id || retailerInfo.id
            );
            formData.append(
                "retailer[outletName]",
                retailerInfo.shopDetails?.shopName || retailerInfo.name || ""
            );
            formData.append("retailer[retailerName]", retailerInfo.name || "");
            formData.append("retailer[outletCode]", retailerInfo.uniqueId);

            console.log("📤 Submitting with:", {
                uniqueId: retailerInfo.uniqueId,
                dateOfSubmission: dateOfSubmission,
                reportType: reportType.value,
            });

            // Optional remarks
            if (remarks) {
                formData.append("remarks", remarks);
            }

            // Stock-specific fields
            if (reportType.value === "Stock") {
                formData.append("stockType", stockType.value);
                formData.append("brand", brand);
                formData.append("product", product);
                formData.append("sku", sku);
                formData.append("productType", productType.value);
                formData.append("quantity", quantity);

                for (let i = 0; i < billCopies.length; i++) {
                    const file = billCopies[i];
                    formData.append("billCopies", {
                        uri: file.uri,
                        type: file.mimeType || "application/pdf",
                        name: file.name || `bill_${i}.pdf`,
                    });
                    console.log(`✅ Bill copy ${i + 1} added`);
                }
            }

            // ✅ Window Display images - WITH GEOTAG (same as employee)
            if (reportType.value === "Window Display") {
                console.log(
                    `🖼️ Processing ${shopDisplayImages.length} geotagged images...`
                );

                for (let i = 0; i < shopDisplayImages.length; i++) {
                    const photo = shopDisplayImages[i];

                    // Append photo
                    formData.append("shopDisplayImages", {
                        uri: photo.uri,
                        type: photo.type || "image/jpeg",
                        name: photo.name || `image_${i}.jpg`,
                    });

                    // ✅ Append geotag metadata if exists
                    if (photo.geotag) {
                        formData.append(
                            `shopDisplayImageMetadata[${i}]`,
                            JSON.stringify(photo.geotag)
                        );
                        console.log(
                            `✅ Shop image ${i + 1} added with geotag:`,
                            {
                                lat: photo.geotag.latitude,
                                lon: photo.geotag.longitude,
                                typeoflatitude: typeof photo.geotag.latitude,
                                fullgeotag: photo.geotag,
                            }
                        );
                    } else {
                        console.log(`✅ Shop image ${i + 1} added (no geotag)`);
                    }
                }
            }

            // Others files
            if (reportType.value === "Others") {
                for (let i = 0; i < otherFiles.length; i++) {
                    const file = otherFiles[i];
                    formData.append("files", {
                        uri: file.uri,
                        type: file.mimeType || "application/octet-stream",
                        name: file.name || `file_${i}`,
                    });
                    console.log(`✅ Other file ${i + 1} added`);
                }
            }

            // ✅ Use endpoint that supports geotag (create-geo)
            const response = await fetch(`${API_BASE_URL}/reports/create-geo`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            console.log("📥 Response status:", response.status);

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("JSON parse error:", e);
                throw new Error("Invalid server response");
            }

            console.log("✅ Response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || `Server error (${response.status})`
                );
            }

            if (data.success) {
                Alert.alert("Success", "Report submitted successfully!", [
                    {
                        text: "OK",
                        onPress: () => {
                            // Reset form
                            setReportType(null);
                            setFrequency(null);
                            setDateOfSubmission(getTodayDate());
                            setRemarks("");
                            setStockType(null);
                            setBrand("");
                            setProduct("");
                            setSku("");
                            setProductType(null);
                            setQuantity("");
                            setShopDisplayImages([]);
                            setBillCopies([]);
                            setOtherFiles([]);
                            navigation.goBack();
                        },
                    },
                ]);
            }
        } catch (err) {
            console.error("❌ Submission error:", err);

            let errorMessage = "Failed to submit report";

            if (err.message) {
                errorMessage = err.message;
            }

            Alert.alert("Error", errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // ===============================
    // RENDER
    // ===============================
    if (loading) {
        return (
            <SafeAreaView
                style={styles.container}
                edges={["top", "left", "right"]}
            >
                <StatusBar style="dark" />
                <Header title="Submit Report" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E4002B" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header title="Submit Report" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                <View style={styles.formContainer}>
                    {/* Campaign Info */}
                    <View style={styles.campaignInfo}>
                        <Text style={styles.infoLabel}>Campaign</Text>
                        <Text style={styles.infoValue}>
                            {campaign?.name || campaign?.title || "Loading..."}
                        </Text>
                    </View>

                    {/* Retailer Info */}
                    {retailerInfo && (
                        <View style={styles.retailerInfo}>
                            <Text style={styles.infoLabel}>Retailer</Text>
                            <Text style={styles.infoValue}>
                                {retailerInfo.name}
                            </Text>
                            <Text style={styles.infoSubtext}>
                                {retailerInfo.shopDetails?.shopName}
                            </Text>
                            <Text style={styles.infoSubtext}>
                                Unique ID:{" "}
                                {retailerInfo.uniqueId || "Not assigned"}
                            </Text>
                        </View>
                    )}

                    {/* Type of Report */}
                    <SearchableDropdown
                        label="Type of Report"
                        placeholder="Select Report Type"
                        open={reportTypeOpen}
                        value={reportType?.value || null}
                        items={reportTypeOptions}
                        setOpen={setReportTypeOpen}
                        setValue={(callback) => {
                            const val =
                                typeof callback === "function"
                                    ? callback(reportType?.value)
                                    : callback;
                            const type = reportTypeOptions.find(
                                (t) => t.value === val
                            );
                            setReportType(type || null);
                        }}
                        setItems={() => {}}
                        required={true}
                        zIndex={5000}
                    />

                    {/* Frequency */}
                    <SearchableDropdown
                        label="Frequency"
                        placeholder="Select Frequency"
                        open={frequencyOpen}
                        value={frequency?.value || null}
                        items={frequencyOptions}
                        setOpen={setFrequencyOpen}
                        setValue={(callback) => {
                            const val =
                                typeof callback === "function"
                                    ? callback(frequency?.value)
                                    : callback;
                            const freq = frequencyOptions.find(
                                (f) => f.value === val
                            );
                            setFrequency(freq || null);
                        }}
                        setItems={() => {}}
                        required={true}
                        zIndex={4000}
                    />

                    {/* Date of Submission */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Date of Submission{" "}
                            <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={dateOfSubmission}
                            onChangeText={setDateOfSubmission}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>

                    {/* Remarks */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Remarks (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Add any additional notes..."
                            value={remarks}
                            onChangeText={setRemarks}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* STOCK SECTION */}
                    {reportType?.value === "Stock" && (
                        <View style={styles.stockSection}>
                            <Text style={styles.sectionTitle}>
                                Stock Details
                            </Text>

                            <SearchableDropdown
                                label="Type of Stock"
                                placeholder="Select Stock Type"
                                open={stockTypeOpen}
                                value={stockType?.value || null}
                                items={stockTypeOptions}
                                setOpen={setStockTypeOpen}
                                setValue={(callback) => {
                                    const val =
                                        typeof callback === "function"
                                            ? callback(stockType?.value)
                                            : callback;
                                    const type = stockTypeOptions.find(
                                        (t) => t.value === val
                                    );
                                    setStockType(type || null);
                                }}
                                setItems={() => {}}
                                required={true}
                                zIndex={3000}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Brand <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter brand name"
                                    value={brand}
                                    onChangeText={setBrand}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Product{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter product name"
                                    value={product}
                                    onChangeText={setProduct}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    SKU <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter SKU"
                                    value={sku}
                                    onChangeText={setSku}
                                />
                            </View>

                            <SearchableDropdown
                                label="Product Type"
                                placeholder="Select Product Type"
                                open={productTypeOpen}
                                value={productType?.value || null}
                                items={productTypeOptions}
                                setOpen={setProductTypeOpen}
                                setValue={(callback) => {
                                    const val =
                                        typeof callback === "function"
                                            ? callback(productType?.value)
                                            : callback;
                                    const type = productTypeOptions.find(
                                        (t) => t.value === val
                                    );
                                    setProductType(type || null);
                                }}
                                setItems={() => {}}
                                required={true}
                                zIndex={2000}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Quantity{" "}
                                    <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter quantity"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Bill Copies */}
                            <View style={styles.fileSection}>
                                <Text style={styles.label}>
                                    Bill Copies (Images/PDF)
                                </Text>
                                <TouchableOpacity
                                    style={styles.uploadButton}
                                    onPress={pickBillCopies}
                                >
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={24}
                                        color="#666"
                                    />
                                    <Text style={styles.uploadButtonText}>
                                        Upload Bill Copies
                                    </Text>
                                </TouchableOpacity>

                                {billCopies.length > 0 && (
                                    <View style={styles.fileList}>
                                        {billCopies.map((file, index) => (
                                            <View
                                                key={index}
                                                style={styles.fileItem}
                                            >
                                                <Text
                                                    style={styles.fileName}
                                                    numberOfLines={1}
                                                >
                                                    {file.name}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        removeBillCopy(index)
                                                    }
                                                >
                                                    <Ionicons
                                                        name="close-circle"
                                                        size={20}
                                                        color="#E4002B"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* ✅ WINDOW DISPLAY - REPLACED WITH GeoTagCamera */}
                    {reportType?.value === "Window Display" && (
                        <GeoTagCamera
                            label="Take Geotagged Shop Display Photos"
                            photos={shopDisplayImages}
                            onPhotosChange={setShopDisplayImages}
                            maxPhotos={5}
                            required={true}
                        />
                    )}

                    {/* OTHERS */}
                    {reportType?.value === "Others" && (
                        <View style={styles.fileSection}>
                            <Text style={styles.label}>Upload Files</Text>
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={pickOtherFiles}
                            >
                                <Ionicons
                                    name="document-attach-outline"
                                    size={24}
                                    color="#666"
                                />
                                <Text style={styles.uploadButtonText}>
                                    Upload Files
                                </Text>
                            </TouchableOpacity>

                            {otherFiles.length > 0 && (
                                <View style={styles.fileList}>
                                    {otherFiles.map((file, index) => (
                                        <View
                                            key={index}
                                            style={styles.fileItem}
                                        >
                                            <Text
                                                style={styles.fileName}
                                                numberOfLines={1}
                                            >
                                                {file.name}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    removeOtherFile(index)
                                                }
                                            >
                                                <Ionicons
                                                    name="close-circle"
                                                    size={20}
                                                    color="#E4002B"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

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
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    formContainer: {
        padding: 20,
    },
    campaignInfo: {
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    retailerInfo: {
        backgroundColor: "#e3f2fd",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#90caf9",
    },
    infoLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
        textTransform: "uppercase",
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    infoSubtext: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    required: {
        color: "#dc3545",
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: "#333",
        minHeight: 50,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    stockSection: {
        backgroundColor: "#f5f5f5",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#E4002B",
        marginBottom: 16,
    },
    fileSection: {
        marginBottom: 16,
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 20,
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 14,
        color: "#666",
    },
    fileList: {
        marginTop: 12,
        gap: 8,
    },
    fileItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    fileName: {
        flex: 1,
        fontSize: 13,
        color: "#333",
        marginRight: 8,
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

export default RetailerSubmitReportScreen;
