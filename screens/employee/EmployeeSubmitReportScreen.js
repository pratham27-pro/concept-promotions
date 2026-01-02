import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchableDropdown from "../../components/common/SearchableDropdown";

const API_BASE_URL = "https://conceptpromotions.in/api";

const EmployeeSubmitReportScreen = ({ route, navigation }) => {
    // Get campaign from route params
    const campaign = route.params?.campaign;
    const passedCampaignId = route.params?.campaignId;

    // Employee & Campaign Info
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [campaignId, setCampaignId] = useState(
        passedCampaignId || campaign?._id || campaign?.id || null
    );

    // Loading States
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Dropdown States - Retailer
    const [assignedRetailers, setAssignedRetailers] = useState([]);
    const [selectedRetailer, setSelectedRetailer] = useState(null);
    const [openRetailerDropdown, setOpenRetailerDropdown] = useState(false);

    // Visit Type
    const [visitTypeOptions, setVisitTypeOptions] = useState([
        { label: "Scheduled", value: "scheduled" },
        { label: "Unscheduled", value: "unscheduled" },
    ]);
    const [visitType, setVisitType] = useState(null);
    const [openVisitTypeDropdown, setOpenVisitTypeDropdown] = useState(false);

    // Attended
    const [attendedOptions, setAttendedOptions] = useState([
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ]);
    const [attended, setAttended] = useState(null);
    const [openAttendedDropdown, setOpenAttendedDropdown] = useState(false);

    // Not Visited Reason
    const [notVisitedReasonOptions, setNotVisitedReasonOptions] = useState([
        { label: "Outlet Closed", value: "outlet closed" },
        { label: "Retailer Not Available", value: "retailer not available" },
        { label: "Others", value: "others" },
    ]);
    const [notVisitedReason, setNotVisitedReason] = useState(null);
    const [openNotVisitedReasonDropdown, setOpenNotVisitedReasonDropdown] =
        useState(false);
    const [otherReasonText, setOtherReasonText] = useState("");

    // Visit Schedule (for scheduled visits)
    const [visitScheduleOptions, setVisitScheduleOptions] = useState([]);
    const [visitScheduleId, setVisitScheduleId] = useState(null);
    const [openVisitScheduleDropdown, setOpenVisitScheduleDropdown] =
        useState(false);

    // Report Type
    const [reportTypeOptions, setReportTypeOptions] = useState([
        { label: "Window Display", value: "Window Display" },
        { label: "Stock", value: "Stock" },
        { label: "Others", value: "Others" },
    ]);
    const [reportType, setReportType] = useState(null);
    const [openReportTypeDropdown, setOpenReportTypeDropdown] = useState(false);

    // Frequency
    const [frequencyOptions, setFrequencyOptions] = useState([
        { label: "Daily", value: "Daily" },
        { label: "Weekly", value: "Weekly" },
        { label: "Fortnightly", value: "Fortnightly" },
        { label: "Monthly", value: "Monthly" },
        { label: "Adhoc", value: "Adhoc" },
    ]);
    const [frequency, setFrequency] = useState(null);
    const [openFrequencyDropdown, setOpenFrequencyDropdown] = useState(false);

    // Stock Fields
    const [stockTypeOptions, setStockTypeOptions] = useState([
        { label: "Opening Stock", value: "Opening Stock" },
        { label: "Closing Stock", value: "Closing Stock" },
        { label: "Purchase Stock", value: "Purchase Stock" },
        { label: "Sold Stock", value: "Sold Stock" },
    ]);
    const [stockType, setStockType] = useState(null);
    const [openStockTypeDropdown, setOpenStockTypeDropdown] = useState(false);

    const [productTypeOptions, setProductTypeOptions] = useState([
        { label: "Focus", value: "Focus" },
        { label: "All", value: "All" },
    ]);
    const [productType, setProductType] = useState(null);
    const [openProductTypeDropdown, setOpenProductTypeDropdown] =
        useState(false);

    const [brand, setBrand] = useState("");
    const [product, setProduct] = useState("");
    const [sku, setSku] = useState("");
    const [quantity, setQuantity] = useState("");

    // Common Fields
    const [dateOfSubmission, setDateOfSubmission] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [remarks, setRemarks] = useState("");

    // Files
    const [shopDisplayImages, setShopDisplayImages] = useState([]);
    const [billCopies, setBillCopies] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);

    // ===============================
    // FETCH DATA ON MOUNT
    // ===============================
    useEffect(() => {
        if (!campaign) {
            Alert.alert("Error", "No campaign data provided", [
                { text: "Go Back", onPress: () => navigation.goBack() },
            ]);
            return;
        }

        const id = passedCampaignId || campaign._id || campaign.id;
        if (id) {
            setCampaignId(id);
        }

        fetchEmployeeInfo();

        if (!id) {
            fetchCampaignId();
        }
    }, []);

    const fetchEmployeeInfo = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again");
                navigation.replace("Login");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/employee/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to load employee profile");
            }

            const data = await response.json();
            setEmployeeInfo(data.employee);
        } catch (err) {
            console.error("Error fetching employee info:", err);
            Alert.alert("Error", "Failed to load employee information");
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaignId = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.get(
                `${API_BASE_URL}/employee/employee/campaigns`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const matchedCampaign = response.data.campaigns?.find(
                (c) =>
                    c._id === campaign._id ||
                    c._id === campaign.id ||
                    c.id === campaign._id ||
                    c.id === campaign.id ||
                    c.name === campaign.name
            );

            if (matchedCampaign) {
                const id = matchedCampaign._id || matchedCampaign.id;
                setCampaignId(id);
            } else {
                Alert.alert("Error", "This campaign is not assigned to you.", [
                    { text: "Go Back", onPress: () => navigation.goBack() },
                ]);
            }
        } catch (err) {
            console.error("Error fetching campaign ID:", err);
        }
    };

    // ===============================
    // FETCH ASSIGNED RETAILERS
    // ===============================
    useEffect(() => {
        if (!campaignId || !employeeInfo) return;

        fetchAssignedRetailers();
    }, [campaignId, employeeInfo]);

    const fetchAssignedRetailers = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.get(
                `${API_BASE_URL}/admin/campaign/${campaignId}/employee-retailer-mapping`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.data.employees || !Array.isArray(res.data.employees)) {
                setAssignedRetailers([]);
                return;
            }

            const currentEmployee = res.data.employees.find(
                (emp) =>
                    emp._id === employeeInfo._id || emp.id === employeeInfo._id
            );

            if (currentEmployee && currentEmployee.retailers) {
                const mapped = currentEmployee.retailers.map((r) => ({
                    label: `${r.uniqueId || r.retailerCode || ""} - ${
                        r.shopDetails?.shopName || r.name
                    }`,
                    value: r._id || r.id,
                    data: r,
                }));

                setAssignedRetailers(mapped);
            } else {
                setAssignedRetailers([]);
            }
        } catch (err) {
            console.error("Error fetching assigned retailers:", err);
            Alert.alert("Error", "Failed to load assigned retailers");
        }
    };

    // ===============================
    // FETCH VISIT SCHEDULES
    // ===============================
    useEffect(() => {
        if (!selectedRetailer || !campaignId) return;

        fetchSchedules();
    }, [selectedRetailer, campaignId]);

    const fetchSchedules = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.get(
                `${API_BASE_URL}/employee/schedules/all`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const filteredSchedules = res.data.schedules.filter(
                (sch) =>
                    (sch.campaignId?._id === campaignId ||
                        sch.campaignId === campaignId) &&
                    (sch.retailerId?._id === selectedRetailer.value ||
                        sch.retailerId === selectedRetailer.value)
            );

            const options = filteredSchedules.map((sch) => ({
                value: sch._id,
                label: `${new Date(sch.visitDate).toLocaleDateString()} - ${
                    sch.retailerId?.shopDetails?.shopName ||
                    sch.retailerId?.name ||
                    "N/A"
                }`,
                full: sch,
            }));

            setVisitScheduleOptions(options);
        } catch (err) {
            console.error("Error fetching schedules:", err);
        }
    };

    // ===============================
    // FILE HANDLERS
    // ===============================
    const pickShopDisplayImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setShopDisplayImages((prev) => [...prev, ...result.assets]);
        }
    };

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

    const removeShopImage = (index) => {
        setShopDisplayImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeBillCopy = (index) => {
        setBillCopies((prev) => prev.filter((_, i) => i !== index));
    };

    const removeOtherFile = (index) => {
        setOtherFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ===============================
    // HANDLE FORM SUBMISSION
    // ===============================
    const handleSubmit = async () => {
        // Validation
        if (!selectedRetailer) {
            Alert.alert("Validation Error", "Please select a retailer");
            return;
        }
        if (!visitType) {
            Alert.alert("Validation Error", "Please select visit type");
            return;
        }
        if (!attended) {
            Alert.alert("Validation Error", "Please select attendance status");
            return;
        }

        if (attended.value === "no") {
            if (!notVisitedReason) {
                Alert.alert(
                    "Validation Error",
                    "Please select reason for non-attendance"
                );
                return;
            }
            if (
                notVisitedReason.value === "others" &&
                !otherReasonText.trim()
            ) {
                Alert.alert("Validation Error", "Please specify other reason");
                return;
            }
        }

        if (attended.value === "yes") {
            if (visitType.value === "scheduled" && !visitScheduleId) {
                Alert.alert(
                    "Validation Error",
                    "Please select a visit schedule"
                );
                return;
            }
            if (!reportType) {
                Alert.alert("Validation Error", "Please select report type");
                return;
            }
            if (!frequency) {
                Alert.alert("Validation Error", "Please select frequency");
                return;
            }

            if (reportType.value === "Stock") {
                if (
                    !stockType ||
                    !brand.trim() ||
                    !product.trim() ||
                    !sku.trim() ||
                    !productType ||
                    !quantity
                ) {
                    Alert.alert(
                        "Validation Error",
                        "Please fill all stock fields"
                    );
                    return;
                }
            }
        }

        try {
            setSubmitting(true);
            const formData = new FormData();

            let retailerIdToSubmit = selectedRetailer.value;
            let campaignIdToSubmit = campaignId;

            // If schedule selected, use its campaign ID
            if (visitScheduleId && visitScheduleId.full) {
                campaignIdToSubmit =
                    visitScheduleId.full?.campaignId?._id ||
                    visitScheduleId.full?.campaignId ||
                    campaignId;
                formData.append("visitScheduleId", visitScheduleId.value);
            }

            formData.append("campaignId", campaignIdToSubmit);
            formData.append("typeOfVisit", visitType.value);
            formData.append("attendedVisit", attended.value);

            formData.append("submittedBy[role]", "Employee");
            formData.append(
                "submittedBy[userId]",
                employeeInfo._id || employeeInfo.id
            );

            formData.append(
                "employee[employeeId]",
                employeeInfo._id || employeeInfo.id
            );
            formData.append("employee[employeeName]", employeeInfo.name);
            formData.append("employee[employeeCode]", employeeInfo.employeeId);

            // Retailer info
            const retailerData = selectedRetailer.data;
            formData.append(
                "retailer[retailerId]",
                retailerData._id || retailerData.id
            );
            formData.append(
                "retailer[outletName]",
                retailerData.shopDetails?.shopName || retailerData.name
            );
            formData.append(
                "retailer[retailerName]",
                retailerData.name || retailerData.shopDetails?.shopName
            );
            formData.append(
                "retailer[outletCode]",
                retailerData.uniqueId || retailerData.retailerCode
            );

            if (attended.value === "no") {
                formData.append(
                    "reasonForNonAttendance[reason]",
                    notVisitedReason.value
                );
                if (notVisitedReason.value === "others") {
                    formData.append(
                        "reasonForNonAttendance[otherReason]",
                        otherReasonText
                    );
                }
            }

            if (attended.value === "yes") {
                formData.append("reportType", reportType.value);
                formData.append("frequency", frequency.value);
                formData.append("dateOfSubmission", dateOfSubmission);

                if (remarks) {
                    formData.append("remarks", remarks);
                }

                if (reportType.value === "Stock") {
                    formData.append("stockType", stockType.value);
                    formData.append("brand", brand);
                    formData.append("product", product);
                    formData.append("sku", sku);
                    formData.append("productType", productType.value);
                    formData.append("quantity", quantity);

                    billCopies.forEach((file) => {
                        formData.append("billCopies", {
                            uri: file.uri,
                            type: file.mimeType || "application/pdf",
                            name: file.name || "bill.pdf",
                        });
                    });
                }

                if (reportType.value === "Window Display") {
                    shopDisplayImages.forEach((file) => {
                        formData.append("shopDisplayImages", {
                            uri: file.uri,
                            type: file.mimeType || "image/jpeg",
                            name: file.fileName || "image.jpg",
                        });
                    });
                }

                if (reportType.value === "Others") {
                    otherFiles.forEach((file) => {
                        formData.append("files", {
                            uri: file.uri,
                            type: file.mimeType || "application/octet-stream",
                            name: file.name || "file",
                        });
                    });
                }
            }

            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                `${API_BASE_URL}/reports/create`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                Alert.alert("Success", "Report submitted successfully!", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]);
            }
        } catch (err) {
            console.error("Submission error:", err);
            Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to submit report"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ===============================
    // HEADER COMPONENT
    // ===============================
    const Header = () => (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Submit Report</Text>
            <View style={styles.placeholder} />
        </View>
    );

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
                <Header />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                {/* Campaign Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Campaign</Text>
                    <Text style={styles.infoValue}>
                        {campaign?.name || campaign?.title || "N/A"}
                    </Text>
                </View>

                {/* Employee Info */}
                {employeeInfo && (
                    <View style={[styles.infoCard, styles.employeeCard]}>
                        <Text style={styles.infoLabel}>Employee</Text>
                        <Text style={styles.infoValue}>
                            {employeeInfo.name}
                        </Text>
                        <Text style={styles.infoSubtext}>
                            Code: {employeeInfo.employeeId}
                        </Text>
                        <Text style={styles.infoSubtext}>
                            {employeeInfo.phone}
                        </Text>
                    </View>
                )}

                {/* Form Section */}
                <View style={styles.formContainer}>
                    {/* STEP 1: Retailer */}
                    <SearchableDropdown
                        label="Select Retailer"
                        placeholder="Select a retailer"
                        open={openRetailerDropdown}
                        value={selectedRetailer?.value || null}
                        items={assignedRetailers}
                        setOpen={setOpenRetailerDropdown}
                        setValue={(callback) => {
                            const val =
                                typeof callback === "function"
                                    ? callback(selectedRetailer?.value)
                                    : callback;
                            const retailer = assignedRetailers.find(
                                (r) => r.value === val
                            );
                            setSelectedRetailer(retailer || null);
                            // Reset all subsequent fields
                            setVisitType(null);
                            setAttended(null);
                            setNotVisitedReason(null);
                            setVisitScheduleId(null);
                            setReportType(null);
                            setFrequency(null);
                        }}
                        setItems={setAssignedRetailers}
                        required
                        disabled={assignedRetailers.length === 0}
                        zIndex={9000}
                    />

                    {/* STEP 2: Visit Type */}
                    {selectedRetailer && (
                        <SearchableDropdown
                            label="Type of Visit"
                            placeholder="Select visit type"
                            open={openVisitTypeDropdown}
                            value={visitType?.value || null}
                            items={visitTypeOptions}
                            setOpen={setOpenVisitTypeDropdown}
                            setValue={(callback) => {
                                const val =
                                    typeof callback === "function"
                                        ? callback(visitType?.value)
                                        : callback;
                                const type = visitTypeOptions.find(
                                    (t) => t.value === val
                                );
                                setVisitType(type || null);
                                setAttended(null);
                                setVisitScheduleId(null);
                            }}
                            setItems={setVisitTypeOptions}
                            required
                            zIndex={8000}
                        />
                    )}

                    {/* STEP 3: Attended */}
                    {selectedRetailer && visitType && (
                        <SearchableDropdown
                            label="Attended Visit?"
                            placeholder="Select"
                            open={openAttendedDropdown}
                            value={attended?.value || null}
                            items={attendedOptions}
                            setOpen={setOpenAttendedDropdown}
                            setValue={(callback) => {
                                const val =
                                    typeof callback === "function"
                                        ? callback(attended?.value)
                                        : callback;
                                const att = attendedOptions.find(
                                    (a) => a.value === val
                                );
                                setAttended(att || null);
                                setNotVisitedReason(null);
                                setOtherReasonText("");
                            }}
                            setItems={setAttendedOptions}
                            required
                            zIndex={7000}
                        />
                    )}

                    {/* BRANCH A: If Not Attended */}
                    {attended?.value === "no" && (
                        <View style={styles.nonAttendanceSection}>
                            <SearchableDropdown
                                label="Reason for Non-Attendance"
                                placeholder="Select reason"
                                open={openNotVisitedReasonDropdown}
                                value={notVisitedReason?.value || null}
                                items={notVisitedReasonOptions}
                                setOpen={setOpenNotVisitedReasonDropdown}
                                setValue={(callback) => {
                                    const val =
                                        typeof callback === "function"
                                            ? callback(notVisitedReason?.value)
                                            : callback;
                                    const reason = notVisitedReasonOptions.find(
                                        (r) => r.value === val
                                    );
                                    setNotVisitedReason(reason || null);
                                }}
                                setItems={setNotVisitedReasonOptions}
                                required
                                zIndex={6000}
                            />

                            {notVisitedReason?.value === "others" && (
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>
                                        Specify Other Reason{" "}
                                        <Text style={styles.required}>*</Text>
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter reason details..."
                                        value={otherReasonText}
                                        onChangeText={setOtherReasonText}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>
                            )}
                        </View>
                    )}

                    {/* BRANCH B: If Attended */}
                    {attended?.value === "yes" && (
                        <>
                            {/* Visit Schedule (for scheduled visits only) */}
                            {visitType?.value === "scheduled" && (
                                <SearchableDropdown
                                    label="Select Visit Schedule"
                                    placeholder="Select schedule"
                                    open={openVisitScheduleDropdown}
                                    value={visitScheduleId?.value || null}
                                    items={visitScheduleOptions}
                                    setOpen={setOpenVisitScheduleDropdown}
                                    setValue={(callback) => {
                                        const val =
                                            typeof callback === "function"
                                                ? callback(
                                                      visitScheduleId?.value
                                                  )
                                                : callback;
                                        const schedule =
                                            visitScheduleOptions.find(
                                                (s) => s.value === val
                                            );
                                        setVisitScheduleId(schedule || null);
                                    }}
                                    setItems={setVisitScheduleOptions}
                                    required
                                    zIndex={6000}
                                />
                            )}

                            {/* Show rest of form if unscheduled OR schedule is selected */}
                            {(visitType?.value === "unscheduled" ||
                                (visitType?.value === "scheduled" &&
                                    visitScheduleId)) && (
                                <>
                                    {/* Report Type */}
                                    <SearchableDropdown
                                        label="Type of Report"
                                        placeholder="Select report type"
                                        open={openReportTypeDropdown}
                                        value={reportType?.value || null}
                                        items={reportTypeOptions}
                                        setOpen={setOpenReportTypeDropdown}
                                        setValue={(callback) => {
                                            const val =
                                                typeof callback === "function"
                                                    ? callback(
                                                          reportType?.value
                                                      )
                                                    : callback;
                                            const type = reportTypeOptions.find(
                                                (t) => t.value === val
                                            );
                                            setReportType(type || null);
                                        }}
                                        setItems={setReportTypeOptions}
                                        required
                                        zIndex={5000}
                                    />

                                    {/* Frequency */}
                                    <SearchableDropdown
                                        label="Frequency"
                                        placeholder="Select frequency"
                                        open={openFrequencyDropdown}
                                        value={frequency?.value || null}
                                        items={frequencyOptions}
                                        setOpen={setOpenFrequencyDropdown}
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
                                        setItems={setFrequencyOptions}
                                        required
                                        zIndex={4000}
                                    />

                                    {/* Date of Submission */}
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>
                                            Date of Submission{" "}
                                            <Text style={styles.required}>
                                                *
                                            </Text>
                                        </Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={dateOfSubmission}
                                            onChangeText={setDateOfSubmission}
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </View>

                                    {/* Remarks */}
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>
                                            Remarks (Optional)
                                        </Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Add any additional notes..."
                                            value={remarks}
                                            onChangeText={setRemarks}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>

                                    {/* STOCK REPORT FIELDS */}
                                    {reportType?.value === "Stock" && (
                                        <View style={styles.stockSection}>
                                            <Text style={styles.sectionTitle}>
                                                Stock Details
                                            </Text>

                                            <SearchableDropdown
                                                label="Type of Stock"
                                                placeholder="Select stock type"
                                                open={openStockTypeDropdown}
                                                value={stockType?.value || null}
                                                items={stockTypeOptions}
                                                setOpen={
                                                    setOpenStockTypeDropdown
                                                }
                                                setValue={(callback) => {
                                                    const val =
                                                        typeof callback ===
                                                        "function"
                                                            ? callback(
                                                                  stockType?.value
                                                              )
                                                            : callback;
                                                    const type =
                                                        stockTypeOptions.find(
                                                            (t) =>
                                                                t.value === val
                                                        );
                                                    setStockType(type || null);
                                                }}
                                                setItems={setStockTypeOptions}
                                                required
                                                zIndex={3000}
                                            />

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>
                                                    Brand{" "}
                                                    <Text
                                                        style={styles.required}
                                                    >
                                                        *
                                                    </Text>
                                                </Text>
                                                <TextInput
                                                    style={styles.textInput}
                                                    placeholder="Enter brand name"
                                                    value={brand}
                                                    onChangeText={setBrand}
                                                />
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>
                                                    Product{" "}
                                                    <Text
                                                        style={styles.required}
                                                    >
                                                        *
                                                    </Text>
                                                </Text>
                                                <TextInput
                                                    style={styles.textInput}
                                                    placeholder="Enter product name"
                                                    value={product}
                                                    onChangeText={setProduct}
                                                />
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>
                                                    SKU{" "}
                                                    <Text
                                                        style={styles.required}
                                                    >
                                                        *
                                                    </Text>
                                                </Text>
                                                <TextInput
                                                    style={styles.textInput}
                                                    placeholder="Enter SKU"
                                                    value={sku}
                                                    onChangeText={setSku}
                                                />
                                            </View>

                                            <SearchableDropdown
                                                label="Product Type"
                                                placeholder="Select product type"
                                                open={openProductTypeDropdown}
                                                value={
                                                    productType?.value || null
                                                }
                                                items={productTypeOptions}
                                                setOpen={
                                                    setOpenProductTypeDropdown
                                                }
                                                setValue={(callback) => {
                                                    const val =
                                                        typeof callback ===
                                                        "function"
                                                            ? callback(
                                                                  productType?.value
                                                              )
                                                            : callback;
                                                    const type =
                                                        productTypeOptions.find(
                                                            (t) =>
                                                                t.value === val
                                                        );
                                                    setProductType(
                                                        type || null
                                                    );
                                                }}
                                                setItems={setProductTypeOptions}
                                                required
                                                zIndex={2000}
                                            />

                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>
                                                    Quantity{" "}
                                                    <Text
                                                        style={styles.required}
                                                    >
                                                        *
                                                    </Text>
                                                </Text>
                                                <TextInput
                                                    style={styles.textInput}
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
                                                    <Text
                                                        style={
                                                            styles.uploadButtonText
                                                        }
                                                    >
                                                        Upload Bill Copies
                                                    </Text>
                                                </TouchableOpacity>

                                                {billCopies.length > 0 && (
                                                    <View
                                                        style={styles.fileList}
                                                    >
                                                        {billCopies.map(
                                                            (file, index) => (
                                                                <View
                                                                    key={index}
                                                                    style={
                                                                        styles.fileItem
                                                                    }
                                                                >
                                                                    <Text
                                                                        style={
                                                                            styles.fileName
                                                                        }
                                                                        numberOfLines={
                                                                            1
                                                                        }
                                                                    >
                                                                        {
                                                                            file.name
                                                                        }
                                                                    </Text>
                                                                    <TouchableOpacity
                                                                        onPress={() =>
                                                                            removeBillCopy(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        <Ionicons
                                                                            name="close-circle"
                                                                            size={
                                                                                20
                                                                            }
                                                                            color="#E4002B"
                                                                        />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {/* WINDOW DISPLAY */}
                                    {reportType?.value === "Window Display" && (
                                        <View style={styles.fileSection}>
                                            <Text style={styles.label}>
                                                Shop Display Images
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.uploadButton}
                                                onPress={pickShopDisplayImages}
                                            >
                                                <Ionicons
                                                    name="images-outline"
                                                    size={24}
                                                    color="#666"
                                                />
                                                <Text
                                                    style={
                                                        styles.uploadButtonText
                                                    }
                                                >
                                                    Upload Images
                                                </Text>
                                            </TouchableOpacity>

                                            {shopDisplayImages.length > 0 && (
                                                <View style={styles.imageGrid}>
                                                    {shopDisplayImages.map(
                                                        (file, index) => (
                                                            <View
                                                                key={index}
                                                                style={
                                                                    styles.imageItem
                                                                }
                                                            >
                                                                <Image
                                                                    source={{
                                                                        uri: file.uri,
                                                                    }}
                                                                    style={
                                                                        styles.imagePreview
                                                                    }
                                                                />
                                                                <TouchableOpacity
                                                                    style={
                                                                        styles.imageRemoveButton
                                                                    }
                                                                    onPress={() =>
                                                                        removeShopImage(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="close-circle"
                                                                        size={
                                                                            24
                                                                        }
                                                                        color="#E4002B"
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>
                                                        )
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    {/* OTHERS */}
                                    {reportType?.value === "Others" && (
                                        <View style={styles.fileSection}>
                                            <Text style={styles.label}>
                                                Upload Files
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.uploadButton}
                                                onPress={pickOtherFiles}
                                            >
                                                <Ionicons
                                                    name="document-attach-outline"
                                                    size={24}
                                                    color="#666"
                                                />
                                                <Text
                                                    style={
                                                        styles.uploadButtonText
                                                    }
                                                >
                                                    Upload Files
                                                </Text>
                                            </TouchableOpacity>

                                            {otherFiles.length > 0 && (
                                                <View style={styles.fileList}>
                                                    {otherFiles.map(
                                                        (file, index) => (
                                                            <View
                                                                key={index}
                                                                style={
                                                                    styles.fileItem
                                                                }
                                                            >
                                                                <Text
                                                                    style={
                                                                        styles.fileName
                                                                    }
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    {file.name}
                                                                </Text>
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        removeOtherFile(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <Ionicons
                                                                        name="close-circle"
                                                                        size={
                                                                            20
                                                                        }
                                                                        color="#E4002B"
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>
                                                        )
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            submitting && styles.submitButtonDisabled,
                            { marginTop: 50 },
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {submitting ? "Submitting..." : "Submit Report"}
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
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    infoCard: {
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    employeeCard: {
        backgroundColor: "#e3f2fd",
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
    formContainer: {
        marginTop: 8,
    },
    inputContainer: {
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
    textInput: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: "#333",
        minHeight: 50,
        textAlignVertical: "top",
    },
    nonAttendanceSection: {
        backgroundColor: "#fffbf0",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ffd54f",
        marginBottom: 16,
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
    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
    },
    imageItem: {
        width: "48%",
        aspectRatio: 1,
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#ddd",
    },
    imagePreview: {
        width: "100%",
        height: "100%",
    },
    imageRemoveButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "white",
        borderRadius: 12,
    },
    submitButton: {
        backgroundColor: "#E4002B",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 24,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
        elevation: 0,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EmployeeSubmitReportScreen;
