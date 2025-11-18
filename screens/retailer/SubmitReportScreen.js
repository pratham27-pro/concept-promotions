import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";

const SubmitReportScreen = ({ route }) => {
    const { campaign } = route.params;

    // Report Type
    const [reportTypeOpen, setReportTypeOpen] = useState(false);
    const [reportType, setReportType] = useState(null);
    const [reportTypeOptions] = useState([
        { label: "Window Display", value: "window" },
        { label: "Stock", value: "stock" },
        { label: "Others", value: "others" },
    ]);

    // Frequency
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

    // Files for window and others
    const [files, setFiles] = useState([]);

    // Pick multiple images
    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setFiles([...files, ...result.assets]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick images");
        }
    };

    // Pick single file for others
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (result.type !== "cancel") {
                setFiles([result]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    // Pick bill copy
    const pickBillCopy = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
            });

            if (result.type !== "cancel") {
                setBillCopy(result);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick bill copy");
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!reportType) {
            Alert.alert("Error", "Please select report type");
            return;
        }
        if (!frequency) {
            Alert.alert("Error", "Please select frequency");
            return;
        }

        Alert.alert("Success", "Report submitted successfully!", [
            {
                text: "OK",
                onPress: () => RootNavigation.goBack(),
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => RootNavigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Submit Report</Text>
                <View style={styles.placeholder} />
            </View>

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
                    <View style={[styles.inputGroup, { zIndex: 7000 }]}>
                        <Text style={styles.label}>Type of Report *</Text>
                        <DropDownPicker
                            open={reportTypeOpen}
                            value={reportType}
                            items={reportTypeOptions}
                            setOpen={setReportTypeOpen}
                            setValue={setReportType}
                            placeholder="Select Report Type"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{ nestedScrollEnabled: true }}
                        />
                    </View>

                    {/* Frequency */}
                    <View style={[styles.inputGroup, { zIndex: 6000 }]}>
                        <Text style={styles.label}>Frequency *</Text>
                        <DropDownPicker
                            open={frequencyOpen}
                            value={frequency}
                            items={frequencyOptions}
                            setOpen={setFrequencyOpen}
                            setValue={setFrequency}
                            placeholder="Select Frequency"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{ nestedScrollEnabled: true }}
                            onSelectItem={(item) => {
                                setShowCustomDate(item.value === "custom");
                            }}
                        />
                    </View>

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
                    <View style={[styles.inputGroup, { zIndex: 5000 }]}>
                        <Text style={styles.label}>Extra (Future)</Text>
                        <DropDownPicker
                            open={futureOpen}
                            value={future}
                            items={futureOptions}
                            setOpen={setFutureOpen}
                            setValue={setFuture}
                            placeholder="Select future use"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{ nestedScrollEnabled: true }}
                        />
                    </View>

                    {/* STOCK SECTION */}
                    {reportType === "stock" && (
                        <View style={[styles.stockSection, { zIndex: 1 }]}>
                            <Text style={styles.sectionTitle}>
                                Stock Details
                            </Text>

                            <View style={{ zIndex: 4000 }}>
                                <Text style={styles.label}>Type of Stock</Text>
                                <DropDownPicker
                                    open={stockTypeOpen}
                                    value={stockType}
                                    items={stockTypeOptions}
                                    setOpen={setStockTypeOpen}
                                    setValue={setStockType}
                                    placeholder="Select Stock Type"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={
                                        styles.dropdownContainer
                                    }
                                    listMode="SCROLLVIEW"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                />
                            </View>

                            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
                                <Text style={styles.label}>Brand</Text>
                                <DropDownPicker
                                    open={brandOpen}
                                    value={brand}
                                    items={brandOptions}
                                    setOpen={setBrandOpen}
                                    setValue={setBrand}
                                    placeholder="Select Brand"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={
                                        styles.dropdownContainer
                                    }
                                    listMode="SCROLLVIEW"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                />
                            </View>

                            <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                                <Text style={styles.label}>Product</Text>
                                <DropDownPicker
                                    open={productOpen}
                                    value={product}
                                    items={productOptions}
                                    setOpen={setProductOpen}
                                    setValue={setProduct}
                                    placeholder="Select Product"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={
                                        styles.dropdownContainer
                                    }
                                    listMode="SCROLLVIEW"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                />
                            </View>

                            <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                                <Text style={styles.label}>SKU</Text>
                                <DropDownPicker
                                    open={skuOpen}
                                    value={sku}
                                    items={skuOptions}
                                    setOpen={setSkuOpen}
                                    setValue={setSku}
                                    placeholder="Select SKU"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={
                                        styles.dropdownContainer
                                    }
                                    listMode="SCROLLVIEW"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                />
                            </View>

                            <View style={[styles.inputGroup, { zIndex: 500 }]}>
                                <Text style={styles.label}>Product Type</Text>
                                <DropDownPicker
                                    open={productTypeOpen}
                                    value={productType}
                                    items={productTypeOptions}
                                    setOpen={setProductTypeOpen}
                                    setValue={setProductType}
                                    placeholder="Select Product Type"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={
                                        styles.dropdownContainer
                                    }
                                    listMode="SCROLLVIEW"
                                    scrollViewProps={{
                                        nestedScrollEnabled: true,
                                    }}
                                />
                            </View>

                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>Quantity *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter quantity"
                                    placeholderTextColor="#999"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Bill Copy */}
                            <View style={[styles.inputGroup, { zIndex: 1 }]}>
                                <Text style={styles.label}>Bill Copy</Text>
                                {!billCopy ? (
                                    <TouchableOpacity
                                        style={styles.uploadBox}
                                        onPress={pickBillCopy}
                                    >
                                        <Ionicons
                                            name="add-circle-outline"
                                            size={40}
                                            color="#999"
                                        />
                                        <Text style={styles.uploadText}>
                                            Click to upload bill copy
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.filePreview}>
                                        {billCopy.mimeType?.includes(
                                            "image"
                                        ) ? (
                                            <Image
                                                source={{ uri: billCopy.uri }}
                                                style={styles.previewImage}
                                            />
                                        ) : (
                                            <Text style={styles.fileName}>
                                                {billCopy.name}
                                            </Text>
                                        )}
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => setBillCopy(null)}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={24}
                                                color="#dc3545"
                                            />
                                            <Text style={styles.removeText}>
                                                Remove
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* WINDOW SECTION */}
                    {reportType === "window" && (
                        <View style={[styles.inputGroup, { zIndex: 1 }]}>
                            <Text style={styles.label}>
                                Upload Shop Display
                            </Text>
                            <TouchableOpacity
                                style={styles.uploadBox}
                                onPress={pickImages}
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={40}
                                    color="#999"
                                />
                                <Text style={styles.uploadText}>
                                    Click to add more images
                                </Text>
                            </TouchableOpacity>

                            {files.length > 0 && (
                                <View style={styles.imagesGrid}>
                                    {files.map((file, index) => (
                                        <View
                                            key={index}
                                            style={styles.imageCard}
                                        >
                                            <Image
                                                source={{ uri: file.uri }}
                                                style={styles.gridImage}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeIcon}
                                                onPress={() =>
                                                    removeFile(index)
                                                }
                                            >
                                                <Ionicons
                                                    name="close-circle"
                                                    size={24}
                                                    color="#dc3545"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {files.length > 0 && (
                                <Text style={styles.fileCount}>
                                    {files.length} image
                                    {files.length !== 1 ? "s" : ""} uploaded
                                </Text>
                            )}
                        </View>
                    )}

                    {/* OTHERS SECTION */}
                    {reportType === "others" && (
                        <View style={[styles.inputGroup, { zIndex: 1 }]}>
                            <Text style={styles.label}>Upload File</Text>
                            {files.length === 0 ? (
                                <TouchableOpacity
                                    style={styles.uploadBox}
                                    onPress={pickDocument}
                                >
                                    <Ionicons
                                        name="add-circle-outline"
                                        size={40}
                                        color="#999"
                                    />
                                    <Text style={styles.uploadText}>
                                        Click to upload file
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.filePreview}>
                                    {files[0].mimeType?.includes("image") ? (
                                        <Image
                                            source={{ uri: files[0].uri }}
                                            style={styles.previewImage}
                                        />
                                    ) : (
                                        <Text style={styles.fileName}>
                                            {files[0].name}
                                        </Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => setFiles([])}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={24}
                                            color="#dc3545"
                                        />
                                        <Text style={styles.removeText}>
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>
                            Submit Report
                        </Text>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#E4002B",
    },
    placeholder: {
        width: 40,
    },
    formContainer: {
        padding: 20,
    },
    campaignInfo: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
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
    dropdown: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        minHeight: 50,
    },
    dropdownContainer: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 10,
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
    uploadBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
    },
    uploadText: {
        marginTop: 10,
        color: "#666",
        fontSize: 14,
    },
    imagesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 15,
        gap: 10,
    },
    imageCard: {
        width: "48%",
        height: 120,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
    },
    gridImage: {
        width: "100%",
        height: "100%",
    },
    removeIcon: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    filePreview: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginBottom: 10,
    },
    fileName: {
        fontSize: 14,
        color: "#333",
        marginBottom: 10,
    },
    removeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    removeText: {
        color: "#dc3545",
        fontSize: 14,
        fontWeight: "600",
    },
    fileCount: {
        marginTop: 10,
        fontSize: 13,
        color: "#666",
    },
    submitButton: {
        backgroundColor: "#E4002B",
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SubmitReportScreen;
