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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";

// Import reusable components
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import FileUpload from "../../components/common/FileUpload";
import GradientButton from "../../components/common/GradientButton";

const EmployeeSubmitReportScreen = ({ route }) => {
    const { campaign } = route.params;

    // Visit Details
    const [visitTypeOpen, setVisitTypeOpen] = useState(false);
    const [visitType, setVisitType] = useState(null);
    const [visitTypeOptions] = useState([
        { label: "Scheduled", value: "scheduled" },
        { label: "Unscheduled", value: "unscheduled" },
    ]);

    const [attendedOpen, setAttendedOpen] = useState(false);
    const [attended, setAttended] = useState(null);
    const [attendedOptions] = useState([
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ]);

    const [reasonOpen, setReasonOpen] = useState(false);
    const [notVisitedReason, setNotVisitedReason] = useState(null);
    const [notVisitedReasons] = useState([
        { label: "Outlet Closed", value: "closed" },
        { label: "Retailer Not Available", value: "retailerUnavailable" },
        { label: "Others", value: "others" },
    ]);

    const [otherReasonText, setOtherReasonText] = useState("");

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

    const handleSubmit = () => {
        if (!visitType) {
            Alert.alert("Error", "Please select type of visit");
            return;
        }
        if (!attended) {
            Alert.alert("Error", "Please select if visit was attended");
            return;
        }

        // If not attended, only reason is required
        if (attended === "no") {
            if (!notVisitedReason) {
                Alert.alert("Error", "Please select reason for not attending");
                return;
            }
            if (notVisitedReason === "others" && !otherReasonText.trim()) {
                Alert.alert("Error", "Please enter reason");
                return;
            }
        } else {
            // If attended, check report fields
            if (!reportType) {
                Alert.alert("Error", "Please select report type");
                return;
            }
            if (!frequency) {
                Alert.alert("Error", "Please select frequency");
                return;
            }
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
                        <Text style={styles.retailerInfoText}>
                            Retailer: {campaign.retailerName}
                        </Text>
                    </View>

                    {/* Type of Visit */}
                    <SearchableDropdown
                        label="Type of Visit"
                        placeholder="Select type of visit"
                        open={visitTypeOpen}
                        value={visitType}
                        items={visitTypeOptions}
                        setOpen={setVisitTypeOpen}
                        setValue={setVisitType}
                        required={true}
                        zIndex={8000}
                        onSelectItem={(item) => {
                            setAttended(null);
                            setNotVisitedReason(null);
                        }}
                    />

                    {/* Attended Visit */}
                    {visitType && (
                        <SearchableDropdown
                            label="Attended Visit?"
                            placeholder="Select"
                            open={attendedOpen}
                            value={attended}
                            items={attendedOptions}
                            setOpen={setAttendedOpen}
                            setValue={setAttended}
                            required={true}
                            zIndex={7000}
                            onSelectItem={(item) => {
                                setNotVisitedReason(null);
                            }}
                        />
                    )}

                    {/* If NOT Attended - Show Reason */}
                    {attended === "no" && (
                        <View
                            style={[styles.notAttendedSection, { zIndex: 1 }]}
                        >
                            <SearchableDropdown
                                label="Select Reason"
                                placeholder="Select reason"
                                open={reasonOpen}
                                value={notVisitedReason}
                                items={notVisitedReasons}
                                setOpen={setReasonOpen}
                                setValue={setNotVisitedReason}
                                required={true}
                                zIndex={6000}
                            />

                            {notVisitedReason === "others" && (
                                <View
                                    style={[styles.inputGroup, { zIndex: 1 }]}
                                >
                                    <Text style={styles.label}>
                                        Enter Reason *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter reason"
                                        placeholderTextColor="#999"
                                        value={otherReasonText}
                                        onChangeText={setOtherReasonText}
                                        multiline
                                    />
                                </View>
                            )}

                            <GradientButton
                                title="Submit"
                                onPress={handleSubmit}
                                colors={["#E4002B", "#c82333"]}
                                icon="checkmark-circle-outline"
                                fullWidth={true}
                                style={{ marginTop: 10 }}
                            />
                        </View>
                    )}

                    {/* If Attended YES - Show Full Form */}
                    {attended === "yes" && (
                        <>
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

                            {/* Frequency */}
                            <SearchableDropdown
                                label="Frequency"
                                placeholder="Select Frequency"
                                open={frequencyOpen}
                                value={frequency}
                                items={frequencyOptions}
                                setOpen={setFrequencyOpen}
                                setValue={setFrequency}
                                required={true}
                                zIndex={6000}
                                onSelectItem={(item) => {
                                    setShowCustomDate(item.value === "custom");
                                }}
                            />

                            {/* Custom Date Range */}
                            {showCustomDate && (
                                <View
                                    style={[
                                        styles.dateRangeContainer,
                                        { zIndex: 1 },
                                    ]}
                                >
                                    <View style={styles.dateInputWrapper}>
                                        <Text style={styles.label}>From *</Text>
                                        <TouchableOpacity
                                            style={styles.dateInput}
                                            onPress={() =>
                                                setShowFromPicker(true)
                                            }
                                        >
                                            <Text>
                                                {fromDate.toLocaleDateString()}
                                            </Text>
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
                                                onChange={(
                                                    event,
                                                    selectedDate
                                                ) => {
                                                    setShowFromPicker(false);
                                                    if (selectedDate)
                                                        setFromDate(
                                                            selectedDate
                                                        );
                                                }}
                                            />
                                        )}
                                    </View>

                                    <View style={styles.dateInputWrapper}>
                                        <Text style={styles.label}>To *</Text>
                                        <TouchableOpacity
                                            style={styles.dateInput}
                                            onPress={() =>
                                                setShowToPicker(true)
                                            }
                                        >
                                            <Text>
                                                {toDate.toLocaleDateString()}
                                            </Text>
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
                                                onChange={(
                                                    event,
                                                    selectedDate
                                                ) => {
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
                                label="Extra (Future)"
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
                                <View
                                    style={[styles.stockSection, { zIndex: 1 }]}
                                >
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

                                    <View
                                        style={[
                                            styles.inputGroup,
                                            { zIndex: 1 },
                                        ]}
                                    >
                                        <Text style={styles.label}>
                                            Quantity *
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter quantity"
                                            placeholderTextColor="#999"
                                            value={quantity}
                                            onChangeText={setQuantity}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <FileUpload
                                        label="Bill Copy"
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
                                        accept="image"
                                        multiple={true}
                                        placeholder="Click to add more images"
                                    />
                                    <Text style={styles.uploadNote}>
                                        * Multiple images can be uploaded
                                    </Text>
                                </View>
                            )}

                            {/* OTHERS SECTION */}
                            {reportType === "others" && (
                                <FileUpload
                                    label="Upload File"
                                    file={files.length > 0 ? files[0] : null}
                                    onFileSelect={(file) => setFiles([file])}
                                    onFileRemove={() => setFiles([])}
                                    accept="all"
                                    placeholder="Click to upload file"
                                />
                            )}

                            <GradientButton
                                title="Submit Report"
                                onPress={handleSubmit}
                                colors={["#E4002B", "#c82333"]}
                                icon="cloud-upload-outline"
                                fullWidth={true}
                                style={{ marginTop: 20 }}
                            />
                        </>
                    )}
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
    },
    campaignInfoText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    retailerInfoText: {
        fontSize: 14,
        color: "#666",
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
    notAttendedSection: {
        backgroundColor: "#fff5f5",
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#E4002B",
        marginBottom: 20,
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
    uploadNote: {
        fontSize: 12,
        color: "#E4002B",
        marginTop: 5,
        fontStyle: "italic",
    },
});

export default EmployeeSubmitReportScreen;
