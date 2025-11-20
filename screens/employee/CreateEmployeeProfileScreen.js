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
import { Ionicons } from "@expo/vector-icons";

// Import reusable components
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import FileUpload from "../../components/common/FileUpload";
import PhotoPicker from "../../components/common/PhotoPicker";
import GradientButton from "../../components/common/GradientButton";

// Import modals
import PennyTransferModal from "../../components/PennyTransferModal";
import SuccessModal from "../../components/SuccessModal";

const API_URL = "https://supreme-419p.onrender.com/api/admin/employees";

const CreateEmployeeProfileScreen = ({ navigation }) => {
    // Worker Type Selection
    const [workerType, setWorkerType] = useState(""); // 'Permanent' or 'Contractual'

    // === PERMANENT EMPLOYEE STATES ===
    // Personal Details
    const [p_name, setPName] = useState("");
    const [p_email, setPEmail] = useState("");
    const [p_dob, setPDob] = useState("");
    const [p_phone, setPPhone] = useState("");
    const [p_highestQualification, setPHighestQualification] = useState("");
    const [p_alternatePhone, setPAlternatePhone] = useState("");

    // Gender & Marital Status Dropdowns
    const [genderOpen, setGenderOpen] = useState(false);
    const [p_gender, setPGender] = useState(null);
    const [genderOptions] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
        { label: "Prefer not to say", value: "Prefer not to say" },
    ]);

    const [maritalOpen, setMaritalOpen] = useState(false);
    const [p_maritalStatus, setPMaritalStatus] = useState(null);
    const [maritalOptions] = useState([
        { label: "Unmarried", value: "Unmarried" },
        { label: "Married", value: "Married" },
    ]);

    // Correspondence Address
    const [co_address1, setCoAddress1] = useState("");
    const [co_address2, setCoAddress2] = useState("");
    const [co_state, setCoState] = useState("");
    const [co_city, setCoCity] = useState("");
    const [co_pincode, setCoPincode] = useState("");

    // Permanent Address
    const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);
    const [p_address1, setPAddress1] = useState("");
    const [p_address2, setPAddress2] = useState("");
    const [p_state, setPState] = useState("");
    const [p_city, setPCity] = useState("");
    const [p_pincode, setPPincode] = useState("");

    // Family Background
    const [p_fathersName, setPFathersName] = useState("");
    const [p_fatherDob, setPFatherDob] = useState("");
    const [p_motherName, setPMotherName] = useState("");
    const [p_motherDob, setPMotherDob] = useState("");
    const [p_spouseName, setPSpouseName] = useState("");
    const [p_spouseDob, setPSpouseDob] = useState("");
    const [p_child1Name, setPChild1Name] = useState("");
    const [p_child1Dob, setPChild1Dob] = useState("");
    const [p_child2Name, setPChild2Name] = useState("");
    const [p_child2Dob, setPChild2Dob] = useState("");

    // Identification & Bank
    const [p_aadhaar, setPAadhaar] = useState("");
    const [p_pan, setPPan] = useState("");
    const [p_uan, setPUan] = useState("");
    const [p_pf, setPPf] = useState("");
    const [p_esi, setPEsi] = useState("");
    const [p_esiDispensary, setPEsiDispensary] = useState("");
    const [p_bankAccount, setPBankAccount] = useState("");
    const [p_ifsc, setPIfsc] = useState("");
    const [p_branchName, setPBranchName] = useState("");
    const [p_bankName, setPBankName] = useState("");

    // Work Experience
    const [experiences, setExperiences] = useState([
        {
            organization: "",
            designation: "",
            from: "",
            to: "",
            currentlyWorking: false,
        },
    ]);

    // Permanent Files
    const [p_personPhoto, setPPersonPhoto] = useState(null);
    const [p_aadhaarFile1, setPAadhaarFile1] = useState(null);
    const [p_aadhaarFile2, setPAadhaarFile2] = useState(null);
    const [p_panFile, setPPanFile] = useState(null);
    const [p_bankProofFile, setPBankProofFile] = useState(null);
    const [p_familyPhoto, setPFamilyPhoto] = useState(null);
    const [p_pfForm, setPPfForm] = useState(null);
    const [p_esiForm, setPEsiForm] = useState(null);
    const [p_employmentForm, setPEmploymentForm] = useState(null);
    const [p_cv, setPCv] = useState(null);

    // === CONTRACTUAL EMPLOYEE STATES ===
    const [c_name, setCName] = useState("");
    const [c_dob, setCDob] = useState("");
    const [c_phone, setCPhone] = useState("");
    const [c_aadhaar, setCAadhaar] = useState("");
    const [c_pan, setCPan] = useState("");
    const [c_contractLength, setCContractLength] = useState("");

    // Contractual Address
    const [c_address1, setCAddress1] = useState("");
    const [c_address2, setCAddress2] = useState("");
    const [c_state, setCState] = useState("");
    const [c_city, setCCity] = useState("");
    const [c_pincode, setCPincode] = useState("");

    // Contractual Bank
    const [c_bankAccount, setCBankAccount] = useState("");
    const [c_ifsc, setCIfsc] = useState("");
    const [c_branchName, setCBranchName] = useState("");
    const [c_bankName, setCBankName] = useState("");

    // Contractual Files
    const [c_personPhoto, setCPersonPhoto] = useState(null);
    const [c_aadhaarFile1, setCAadhaarFile1] = useState(null);
    const [c_aadhaarFile2, setCAadhaarFile2] = useState(null);
    const [c_panFile, setCPanFile] = useState(null);
    const [c_bankProofFile, setCBankProofFile] = useState(null);

    // Form states
    const [submitting, setSubmitting] = useState(false);
    const [showPennyModal, setShowPennyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Handle checkbox for same address
    const handleCheckboxChange = () => {
        const newValue = !sameAsCorrespondence;
        setSameAsCorrespondence(newValue);

        if (newValue) {
            setPAddress1(co_address1);
            setPAddress2(co_address2);
            setPState(co_state);
            setPCity(co_city);
            setPPincode(co_pincode);
        } else {
            setPAddress1("");
            setPAddress2("");
            setPState("");
            setPCity("");
            setPPincode("");
        }
    };

    // Work Experience handlers
    const addExperience = () => {
        setExperiences([
            ...experiences,
            {
                organization: "",
                designation: "",
                from: "",
                to: "",
                currentlyWorking: false,
            },
        ]);
    };

    const removeExperience = (index) => {
        if (experiences.length === 1) return;
        setExperiences(experiences.filter((_, i) => i !== index));
    };

    const updateExperience = (index, field, value) => {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setExperiences(updated);
    };

    // Notify Employee
    const handleNotify = () => {
        Alert.alert("Success", "Notification sent to employee!");
    };

    // Validate and submit
    const handleSubmit = async () => {
        if (!workerType) {
            Alert.alert("Error", "Please select worker type");
            return;
        }

        if (workerType === "Permanent") {
            if (!p_name || !p_email || !p_phone) {
                Alert.alert(
                    "Error",
                    "Please fill all required fields (Name, Email, Phone)"
                );
                return;
            }
            if (!p_personPhoto || !p_aadhaarFile1 || !p_panFile) {
                Alert.alert(
                    "Error",
                    "Please upload required documents (Photo, Aadhaar, PAN)"
                );
                return;
            }
        } else {
            if (!c_name || !c_phone) {
                Alert.alert(
                    "Error",
                    "Please fill all required fields (Name, Phone)"
                );
                return;
            }
            if (!c_personPhoto || !c_aadhaarFile1) {
                Alert.alert(
                    "Error",
                    "Please upload required documents (Photo, Aadhaar)"
                );
                return;
            }
        }

        setSubmitting(true);

        try {
            // Build payload
            const payload = {
                name: workerType === "Permanent" ? p_name : c_name,
                email: p_email,
                contactNo: workerType === "Permanent" ? p_phone : c_phone,
                gender: workerType === "Permanent" ? p_gender : "",
                address:
                    workerType === "Permanent"
                        ? `${co_address1}, ${co_city}, ${co_state}, ${co_pincode}`
                        : `${c_address1}, ${c_city}, ${c_state}, ${c_pincode}`,
                dob: workerType === "Permanent" ? p_dob : c_dob,
                employeeType: workerType,
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                // Show penny transfer modal
                setShowPennyModal(true);
            } else {
                Alert.alert(
                    "Error",
                    result.message || "Failed to create employee profile"
                );
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Server error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePennyConfirm = (received) => {
        if (received) {
            setShowSuccessModal(true);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <Header showBackButton={false} />

            {/* Add heading below header */}
            <View style={styles.headingContainer}>
                <Text style={styles.pageHeading}>Employee Registration</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                <View style={styles.formContainer}>
                    {/* Title */}
                    <Text style={styles.mainTitle}>
                        Create Employee Profile
                    </Text>

                    {/* Worker Type Selection */}
                    <View style={styles.workerTypeSection}>
                        <Text style={styles.sectionLabel}>
                            Select Type of Worker
                        </Text>

                        <View style={styles.workerTypeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.workerTypeCard,
                                    workerType === "Permanent" &&
                                        styles.workerTypeCardActive,
                                ]}
                                onPress={() => setWorkerType("Permanent")}
                            >
                                <Ionicons
                                    name="briefcase"
                                    size={32}
                                    color={
                                        workerType === "Permanent"
                                            ? "#E4002B"
                                            : "#666"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.workerTypeTitle,
                                        workerType === "Permanent" &&
                                            styles.workerTypeTitleActive,
                                    ]}
                                >
                                    Permanent
                                </Text>
                                <Text style={styles.workerTypeSubtitle}>
                                    Full-time employee
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.workerTypeCard,
                                    workerType === "Contractual" &&
                                        styles.workerTypeCardActive,
                                ]}
                                onPress={() => setWorkerType("Contractual")}
                            >
                                <Ionicons
                                    name="document-text"
                                    size={32}
                                    color={
                                        workerType === "Contractual"
                                            ? "#E4002B"
                                            : "#666"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.workerTypeTitle,
                                        workerType === "Contractual" &&
                                            styles.workerTypeTitleActive,
                                    ]}
                                >
                                    Contractual
                                </Text>
                                <Text style={styles.workerTypeSubtitle}>
                                    Fixed-term / temporary
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* PERMANENT EMPLOYEE FORM */}
                    {workerType === "Permanent" && (
                        <>
                            {/* Personal Details */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Personal Details
                                </Text>

                                <PhotoPicker
                                    label="Passport Size Photograph"
                                    photo={p_personPhoto}
                                    onPhotoSelect={setPPersonPhoto}
                                    onPhotoRemove={() => setPPersonPhoto(null)}
                                    required={true}
                                    size="large"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name (as per Aadhaar) *"
                                    placeholderTextColor="#999"
                                    value={p_name}
                                    onChangeText={setPName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Email *"
                                    placeholderTextColor="#999"
                                    value={p_email}
                                    onChangeText={setPEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number *"
                                    placeholderTextColor="#999"
                                    value={p_phone}
                                    onChangeText={(text) =>
                                        setPPhone(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />

                                <GradientButton
                                    title="Notify Employee"
                                    onPress={handleNotify}
                                    colors={["#E4002B", "#c82333"]}
                                    icon="notifications-outline"
                                    size="small"
                                    style={{ marginBottom: 15 }}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Highest Qualification *"
                                    placeholderTextColor="#999"
                                    value={p_highestQualification}
                                    onChangeText={setPHighestQualification}
                                />

                                <SearchableDropdown
                                    label="Gender"
                                    placeholder="Select gender"
                                    open={genderOpen}
                                    value={p_gender}
                                    items={genderOptions}
                                    setOpen={setGenderOpen}
                                    setValue={setPGender}
                                    required={true}
                                    zIndex={6000}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Date of Birth *"
                                    placeholderTextColor="#999"
                                    value={p_dob}
                                    onChangeText={setPDob}
                                    onFocus={() =>
                                        Alert.alert(
                                            "Date Format",
                                            "Please enter date as DD/MM/YYYY"
                                        )
                                    }
                                />

                                <SearchableDropdown
                                    label="Marital Status"
                                    placeholder="Select marital status"
                                    open={maritalOpen}
                                    value={p_maritalStatus}
                                    items={maritalOptions}
                                    setOpen={setMaritalOpen}
                                    setValue={setPMaritalStatus}
                                    required={true}
                                    zIndex={5000}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Alternate Phone Number"
                                    placeholderTextColor="#999"
                                    value={p_alternatePhone}
                                    onChangeText={(text) =>
                                        setPAlternatePhone(
                                            text.replace(/\D/g, "")
                                        )
                                    }
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

                            {/* Address Details */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Correspondence Address
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 1 *"
                                    placeholderTextColor="#999"
                                    value={co_address1}
                                    onChangeText={setCoAddress1}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 2"
                                    placeholderTextColor="#999"
                                    value={co_address2}
                                    onChangeText={setCoAddress2}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="State *"
                                        placeholderTextColor="#999"
                                        value={co_state}
                                        onChangeText={setCoState}
                                    />

                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="City *"
                                        placeholderTextColor="#999"
                                        value={co_city}
                                        onChangeText={setCoCity}
                                    />
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Pincode *"
                                    placeholderTextColor="#999"
                                    value={co_pincode}
                                    onChangeText={(text) =>
                                        setCoPincode(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />

                                {/* Checkbox */}
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={handleCheckboxChange}
                                >
                                    <Ionicons
                                        name={
                                            sameAsCorrespondence
                                                ? "checkbox"
                                                : "square-outline"
                                        }
                                        size={24}
                                        color="#E4002B"
                                    />
                                    <Text style={styles.checkboxLabel}>
                                        Same as Correspondence Address
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.sectionTitle}>
                                    Permanent Address
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 1 *"
                                    placeholderTextColor="#999"
                                    value={p_address1}
                                    onChangeText={setPAddress1}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 2"
                                    placeholderTextColor="#999"
                                    value={p_address2}
                                    onChangeText={setPAddress2}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="State *"
                                        placeholderTextColor="#999"
                                        value={p_state}
                                        onChangeText={setPState}
                                    />

                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="City *"
                                        placeholderTextColor="#999"
                                        value={p_city}
                                        onChangeText={setPCity}
                                    />
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Pincode *"
                                    placeholderTextColor="#999"
                                    value={p_pincode}
                                    onChangeText={(text) =>
                                        setPPincode(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            {/* Family Background */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Family Background
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Father's Name *"
                                    placeholderTextColor="#999"
                                    value={p_fathersName}
                                    onChangeText={setPFathersName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Father's DOB (DD/MM/YYYY) *"
                                    placeholderTextColor="#999"
                                    value={p_fatherDob}
                                    onChangeText={setPFatherDob}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Mother's Name *"
                                    placeholderTextColor="#999"
                                    value={p_motherName}
                                    onChangeText={setPMotherName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Mother's DOB (DD/MM/YYYY) *"
                                    placeholderTextColor="#999"
                                    value={p_motherDob}
                                    onChangeText={setPMotherDob}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Spouse Name (if applicable)"
                                    placeholderTextColor="#999"
                                    value={p_spouseName}
                                    onChangeText={setPSpouseName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Spouse DOB (DD/MM/YYYY)"
                                    placeholderTextColor="#999"
                                    value={p_spouseDob}
                                    onChangeText={setPSpouseDob}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Child 1 Name"
                                    placeholderTextColor="#999"
                                    value={p_child1Name}
                                    onChangeText={setPChild1Name}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Child 1 DOB (DD/MM/YYYY)"
                                    placeholderTextColor="#999"
                                    value={p_child1Dob}
                                    onChangeText={setPChild1Dob}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Child 2 Name"
                                    placeholderTextColor="#999"
                                    value={p_child2Name}
                                    onChangeText={setPChild2Name}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Child 2 DOB (DD/MM/YYYY)"
                                    placeholderTextColor="#999"
                                    value={p_child2Dob}
                                    onChangeText={setPChild2Dob}
                                />
                            </View>

                            {/* Identification & Bank */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Identification & Bank Details
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Aadhaar Number *"
                                    placeholderTextColor="#999"
                                    value={p_aadhaar}
                                    onChangeText={(text) =>
                                        setPAadhaar(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                    maxLength={12}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="PAN Number *"
                                    placeholderTextColor="#999"
                                    value={p_pan}
                                    onChangeText={(text) =>
                                        setPPan(text.toUpperCase())
                                    }
                                    autoCapitalize="characters"
                                    maxLength={10}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="UAN Number *"
                                    placeholderTextColor="#999"
                                    value={p_uan}
                                    onChangeText={setPUan}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="PF Number *"
                                    placeholderTextColor="#999"
                                    value={p_pf}
                                    onChangeText={setPPf}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="ESI Number *"
                                    placeholderTextColor="#999"
                                    value={p_esi}
                                    onChangeText={setPEsi}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="ESI Dispensary Location"
                                    placeholderTextColor="#999"
                                    value={p_esiDispensary}
                                    onChangeText={setPEsiDispensary}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Bank Account Number *"
                                    placeholderTextColor="#999"
                                    value={p_bankAccount}
                                    onChangeText={(text) =>
                                        setPBankAccount(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="IFSC Code *"
                                    placeholderTextColor="#999"
                                    value={p_ifsc}
                                    onChangeText={(text) =>
                                        setPIfsc(text.toUpperCase())
                                    }
                                    autoCapitalize="characters"
                                    maxLength={11}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Bank Name *"
                                    placeholderTextColor="#999"
                                    value={p_bankName}
                                    onChangeText={setPBankName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Branch Name *"
                                    placeholderTextColor="#999"
                                    value={p_branchName}
                                    onChangeText={setPBranchName}
                                />
                            </View>

                            {/* Work Experience */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Prior Work Experience
                                </Text>

                                {experiences.map((exp, index) => (
                                    <View
                                        key={index}
                                        style={styles.experienceCard}
                                    >
                                        {experiences.length > 1 && (
                                            <TouchableOpacity
                                                style={styles.removeExpButton}
                                                onPress={() =>
                                                    removeExperience(index)
                                                }
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={20}
                                                    color="#dc3545"
                                                />
                                            </TouchableOpacity>
                                        )}

                                        <TextInput
                                            style={styles.input}
                                            placeholder="Organization Name *"
                                            placeholderTextColor="#999"
                                            value={exp.organization}
                                            onChangeText={(text) =>
                                                updateExperience(
                                                    index,
                                                    "organization",
                                                    text
                                                )
                                            }
                                        />

                                        <TextInput
                                            style={styles.input}
                                            placeholder="Designation *"
                                            placeholderTextColor="#999"
                                            value={exp.designation}
                                            onChangeText={(text) =>
                                                updateExperience(
                                                    index,
                                                    "designation",
                                                    text
                                                )
                                            }
                                        />

                                        <View style={styles.row}>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    styles.halfInput,
                                                ]}
                                                placeholder="From (DD/MM/YYYY) *"
                                                placeholderTextColor="#999"
                                                value={exp.from}
                                                onChangeText={(text) =>
                                                    updateExperience(
                                                        index,
                                                        "from",
                                                        text
                                                    )
                                                }
                                            />

                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    styles.halfInput,
                                                ]}
                                                placeholder="To (DD/MM/YYYY)"
                                                placeholderTextColor="#999"
                                                value={exp.to}
                                                onChangeText={(text) =>
                                                    updateExperience(
                                                        index,
                                                        "to",
                                                        text
                                                    )
                                                }
                                                editable={!exp.currentlyWorking}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.checkboxContainer}
                                            onPress={() =>
                                                updateExperience(
                                                    index,
                                                    "currentlyWorking",
                                                    !exp.currentlyWorking
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    exp.currentlyWorking
                                                        ? "checkbox"
                                                        : "square-outline"
                                                }
                                                size={24}
                                                color="#E4002B"
                                            />
                                            <Text style={styles.checkboxLabel}>
                                                Currently Working Here
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    style={styles.addExpButton}
                                    onPress={addExperience}
                                >
                                    <Ionicons
                                        name="add-circle-outline"
                                        size={24}
                                        color="#E4002B"
                                    />
                                    <Text style={styles.addExpText}>
                                        Add Another Experience
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* File Uploads */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    File Uploads
                                </Text>
                                <Text style={styles.uploadHint}>
                                    * Accepted formats: PNG, JPG, JPEG, PDF —
                                    less than 1 MB
                                </Text>

                                <FileUpload
                                    label="Aadhaar (Front)"
                                    file={p_aadhaarFile1}
                                    onFileSelect={setPAadhaarFile1}
                                    onFileRemove={() => setPAadhaarFile1(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Aadhaar (Back)"
                                    file={p_aadhaarFile2}
                                    onFileSelect={setPAadhaarFile2}
                                    onFileRemove={() => setPAadhaarFile2(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="PAN Card"
                                    file={p_panFile}
                                    onFileSelect={setPPanFile}
                                    onFileRemove={() => setPPanFile(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Family Photo"
                                    file={p_familyPhoto}
                                    onFileSelect={setPFamilyPhoto}
                                    onFileRemove={() => setPFamilyPhoto(null)}
                                    accept="image"
                                    required={true}
                                />

                                <FileUpload
                                    label="Bank Proof (Cancelled Cheque/Passbook)"
                                    file={p_bankProofFile}
                                    onFileSelect={setPBankProofFile}
                                    onFileRemove={() => setPBankProofFile(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="ESI Form"
                                    file={p_esiForm}
                                    onFileSelect={setPEsiForm}
                                    onFileRemove={() => setPEsiForm(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="PF Form"
                                    file={p_pfForm}
                                    onFileSelect={setPPfForm}
                                    onFileRemove={() => setPPfForm(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Employment Form"
                                    file={p_employmentForm}
                                    onFileSelect={setPEmploymentForm}
                                    onFileRemove={() =>
                                        setPEmploymentForm(null)
                                    }
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Copy of CV"
                                    file={p_cv}
                                    onFileSelect={setPCv}
                                    onFileRemove={() => setPCv(null)}
                                    accept="all"
                                    required={true}
                                />
                            </View>
                        </>
                    )}

                    {/* CONTRACTUAL EMPLOYEE FORM */}
                    {workerType === "Contractual" && (
                        <>
                            {/* Personal Details */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Personal Details
                                </Text>

                                <PhotoPicker
                                    label="Person Photo"
                                    photo={c_personPhoto}
                                    onPhotoSelect={setCPersonPhoto}
                                    onPhotoRemove={() => setCPersonPhoto(null)}
                                    required={true}
                                    size="large"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name *"
                                    placeholderTextColor="#999"
                                    value={c_name}
                                    onChangeText={setCName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Date of Birth (DD/MM/YYYY) *"
                                    placeholderTextColor="#999"
                                    value={c_dob}
                                    onChangeText={setCDob}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Email *"
                                    placeholderTextColor="#999"
                                    value={p_email}
                                    onChangeText={setPEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number *"
                                    placeholderTextColor="#999"
                                    value={c_phone}
                                    onChangeText={(text) =>
                                        setCPhone(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Aadhaar Number *"
                                    placeholderTextColor="#999"
                                    value={c_aadhaar}
                                    onChangeText={(text) =>
                                        setCAadhaar(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                    maxLength={12}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="PAN Number *"
                                    placeholderTextColor="#999"
                                    value={c_pan}
                                    onChangeText={(text) =>
                                        setCPan(text.toUpperCase())
                                    }
                                    autoCapitalize="characters"
                                    maxLength={10}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Length of Contract (e.g., 6 months) *"
                                    placeholderTextColor="#999"
                                    value={c_contractLength}
                                    onChangeText={setCContractLength}
                                />
                            </View>

                            {/* Address Details */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Address Details
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 1 *"
                                    placeholderTextColor="#999"
                                    value={c_address1}
                                    onChangeText={setCAddress1}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Address Line 2"
                                    placeholderTextColor="#999"
                                    value={c_address2}
                                    onChangeText={setCAddress2}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="State *"
                                        placeholderTextColor="#999"
                                        value={c_state}
                                        onChangeText={setCState}
                                    />

                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="City *"
                                        placeholderTextColor="#999"
                                        value={c_city}
                                        onChangeText={setCCity}
                                    />
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Pincode *"
                                    placeholderTextColor="#999"
                                    value={c_pincode}
                                    onChangeText={(text) =>
                                        setCPincode(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            {/* Bank Details */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    Bank Details
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Bank Account Number *"
                                    placeholderTextColor="#999"
                                    value={c_bankAccount}
                                    onChangeText={(text) =>
                                        setCBankAccount(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="number-pad"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="IFSC Code *"
                                    placeholderTextColor="#999"
                                    value={c_ifsc}
                                    onChangeText={(text) =>
                                        setCIfsc(text.toUpperCase())
                                    }
                                    autoCapitalize="characters"
                                    maxLength={11}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Bank Name *"
                                    placeholderTextColor="#999"
                                    value={c_bankName}
                                    onChangeText={setCBankName}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Branch Name *"
                                    placeholderTextColor="#999"
                                    value={c_branchName}
                                    onChangeText={setCBranchName}
                                />
                            </View>

                            {/* File Uploads */}
                            <View style={[styles.section, { zIndex: 1 }]}>
                                <Text style={styles.sectionTitle}>
                                    File Uploads
                                </Text>
                                <Text style={styles.uploadHint}>
                                    * Accepted formats: PNG, JPG, JPEG, PDF —
                                    less than 1 MB
                                </Text>

                                <FileUpload
                                    label="Aadhaar (Front)"
                                    file={c_aadhaarFile1}
                                    onFileSelect={setCAadhaarFile1}
                                    onFileRemove={() => setCAadhaarFile1(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Aadhaar (Back)"
                                    file={c_aadhaarFile2}
                                    onFileSelect={setCAadhaarFile2}
                                    onFileRemove={() => setCAadhaarFile2(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="PAN Card"
                                    file={c_panFile}
                                    onFileSelect={setCPanFile}
                                    onFileRemove={() => setCPanFile(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Bank Proof (Cancelled Cheque/Passbook)"
                                    file={c_bankProofFile}
                                    onFileSelect={setCBankProofFile}
                                    onFileRemove={() => setCBankProofFile(null)}
                                    accept="all"
                                    required={true}
                                />
                            </View>
                        </>
                    )}

                    {/* Submit Button */}
                    {workerType && (
                        <GradientButton
                            title={
                                submitting ? "Creating..." : "Create Employee"
                            }
                            onPress={handleSubmit}
                            colors={["#E4002B", "#c82333"]}
                            icon="checkmark-circle-outline"
                            fullWidth={true}
                            loading={submitting}
                            disabled={submitting}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Penny Transfer Modal */}
            <PennyTransferModal
                visible={showPennyModal}
                onClose={() => setShowPennyModal(false)}
                onConfirm={handlePennyConfirm}
                bankDetails={{
                    bankName:
                        workerType === "Permanent" ? p_bankName : c_bankName,
                    accountNumber:
                        workerType === "Permanent"
                            ? p_bankAccount
                            : c_bankAccount,
                    ifsc: workerType === "Permanent" ? p_ifsc : c_ifsc,
                }}
            />

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.navigate("EmployeeDashboard");
                }}
                title="Employee Created!"
                message="Employee profile has been created and bank account verified successfully."
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollContent: {
        paddingBottom: Platform.OS === "ios" ? 40 : 30,
    },
    formContainer: {
        padding: 20,
    },
    headingContainer: {
        backgroundColor: "#fff",
        paddingVertical: 15,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    pageHeading: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E4002B",
    },

    mainTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#E4002B",
        textAlign: "center",
        marginBottom: 25,
    },
    workerTypeSection: {
        marginBottom: 30,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 15,
    },
    workerTypeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 15,
    },
    workerTypeCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#E0E0E0",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        minHeight: 140,
        justifyContent: "center",
    },
    workerTypeCardActive: {
        borderColor: "#E4002B",
        backgroundColor: "#FFF5F5",
    },
    workerTypeTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#666",
        marginTop: 10,
    },
    workerTypeTitleActive: {
        color: "#E4002B",
    },
    workerTypeSubtitle: {
        fontSize: 12,
        color: "#999",
        marginTop: 5,
        textAlign: "center",
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#E4002B",
        marginBottom: 15,
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 15,
        fontSize: 15,
        color: "#333",
        marginBottom: 15,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        gap: 10,
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#333",
    },
    experienceCard: {
        backgroundColor: "#F9F9F9",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        position: "relative",
    },
    removeExpButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    },
    addExpButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 15,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#E4002B",
        borderRadius: 10,
    },
    addExpText: {
        color: "#E4002B",
        fontSize: 15,
        fontWeight: "600",
    },
    uploadHint: {
        fontSize: 12,
        color: "#666",
        marginBottom: 15,
        fontStyle: "italic",
    },
});

export default CreateEmployeeProfileScreen;
