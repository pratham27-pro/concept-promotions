import React, { useState, useEffect, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

// Import reusable components
import Header from "../../components/common/Header";
import SearchableDropdown from "../../components/common/SearchableDropdown";
import FileUpload from "../../components/common/FileUpload";
import PhotoPicker from "../../components/common/PhotoPicker";
import GradientButton from "../../components/common/GradientButton";

// Import modals
import PennyTransferModal from "../../components/PennyTransferModal";
import SuccessModal from "../../components/SuccessModal";

// Import AuthContext
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const CompleteEmployeeProfileScreen = ({ navigation }) => {
    const { markProfileComplete, userProfile, refreshProfile } = useAuth();

    // Loading states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [employeeType, setEmployeeType] = useState(""); // Permanent or Contractual
    const [profileData, setProfileData] = useState(null);

    // Personal Details (Read-only from admin)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Personal Details (Employee fills)
    const [dob, setDob] = useState("");
    const [highestQualification, setHighestQualification] = useState("");
    const [alternatePhone, setAlternatePhone] = useState("");

    // Gender & Marital Status Dropdowns
    const [genderOpen, setGenderOpen] = useState(false);
    const [gender, setGender] = useState(null);
    const [genderOptions] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
    ]);

    const [maritalOpen, setMaritalOpen] = useState(false);
    const [maritalStatus, setMaritalStatus] = useState(null);
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

    // Family Background (Only for Permanent)
    const [fathersName, setFathersName] = useState("");
    const [fatherDob, setFatherDob] = useState("");
    const [motherName, setMotherName] = useState("");
    const [motherDob, setMotherDob] = useState("");
    const [spouseName, setSpouseName] = useState("");
    const [spouseDob, setSpouseDob] = useState("");
    const [child1Name, setChild1Name] = useState("");
    const [child1Dob, setChild1Dob] = useState("");
    const [child2Name, setChild2Name] = useState("");
    const [child2Dob, setChild2Dob] = useState("");

    // Identification & Bank
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [uanNumber, setUanNumber] = useState("");
    const [pfNumber, setPfNumber] = useState("");
    const [esiNumber, setEsiNumber] = useState("");
    const [esiDispensary, setEsiDispensary] = useState("");
    const [contractLength, setContractLength] = useState("");

    // Bank Details
    const [bankAccount, setBankAccount] = useState("");
    const [confirmBankAccount, setConfirmBankAccount] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [branchName, setBranchName] = useState("");
    const [bankName, setBankName] = useState("");

    // Work Experience (Only for Permanent)
    const [experiences, setExperiences] = useState([
        {
            organization: "",
            designation: "",
            from: "",
            to: "",
            currentlyWorking: false,
        },
    ]);

    // Files
    const [personPhoto, setPersonPhoto] = useState(null);
    const [aadhaarFile1, setAadhaarFile1] = useState(null);
    const [aadhaarFile2, setAadhaarFile2] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [bankProofFile, setBankProofFile] = useState(null);
    const [familyPhoto, setFamilyPhoto] = useState(null);
    const [pfForm, setPfForm] = useState(null);
    const [esiForm, setEsiForm] = useState(null);
    const [employmentForm, setEmploymentForm] = useState(null);
    const [cv, setCv] = useState(null);

    // Modals
    const [showPennyModal, setShowPennyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Password Change
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Fetch employee profile on mount
    useFocusEffect(
        useCallback(() => {
            fetchEmployeeProfile();
        }, [])
    );

    const fetchEmployeeProfile = async () => {
        try {
            setLoading(true);

            // ✅ Use profile from context if available
            if (userProfile) {
                console.log("📋 Using profile from context:", userProfile);

                // ✅ Now userProfile should have the data at root level
                if (userProfile.name) setName(userProfile.name);
                if (userProfile.email) setEmail(userProfile.email);
                if (userProfile.phone) setPhone(userProfile.phone);

                setEmployeeType(userProfile.employeeType || "");
                prefillForm(userProfile);
                setLoading(false);
                return;
            }

            // Otherwise fetch from API
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            console.log("🔍 Fetching profile from API...");
            const response = await fetch(`${API_BASE_URL}/employee/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const responseData = await response.json();
            console.log("🔍 Profile API response:", responseData);

            if (response.ok && responseData) {
                // ✅ Extract employee from nested response
                const data = responseData.employee || responseData;

                setProfileData(data);

                // Set all fields including basic ones
                if (data.name) setName(data.name);
                if (data.email) setEmail(data.email);
                if (data.phone) setPhone(data.phone);

                setEmployeeType(data.employeeType || "");
                prefillForm(data);

                console.log("✅ Employee profile loaded");
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

    const prefillForm = (data) => {
        // Pre-fill existing data from admin
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.dob) setDob(data.dob);
        if (data.gender) setGender(data.gender);
        if (data.alternatePhone) setAlternatePhone(data.alternatePhone);
        if (data.highestQualification)
            setHighestQualification(data.highestQualification);
        if (data.maritalStatus) setMaritalStatus(data.maritalStatus);

        // Addresses
        if (data.correspondenceAddress) {
            setCoAddress1(data.correspondenceAddress.addressLine1 || "");
            setCoAddress2(data.correspondenceAddress.addressLine2 || "");
            setCoState(data.correspondenceAddress.state || "");
            setCoCity(data.correspondenceAddress.city || "");
            setCoPincode(data.correspondenceAddress.pincode || "");
        }

        if (data.permanentAddress) {
            setPAddress1(data.permanentAddress.addressLine1 || "");
            setPAddress2(data.permanentAddress.addressLine2 || "");
            setPState(data.permanentAddress.state || "");
            setPCity(data.permanentAddress.city || "");
            setPPincode(data.permanentAddress.pincode || "");
        }

        // Family (Permanent only)
        if (data.employeeType === "Permanent") {
            if (data.fathersName) setFathersName(data.fathersName);
            if (data.fatherDob) setFatherDob(data.fatherDob);
            if (data.motherName) setMotherName(data.motherName);
            if (data.motherDob) setMotherDob(data.motherDob);
            if (data.spouseName) setSpouseName(data.spouseName);
            if (data.spouseDob) setSpouseDob(data.spouseDob);
            if (data.child1Name) setChild1Name(data.child1Name);
            if (data.child1Dob) setChild1Dob(data.child1Dob);
            if (data.child2Name) setChild2Name(data.child2Name);
            if (data.child2Dob) setChild2Dob(data.child2Dob);

            if (data.experiences && Array.isArray(data.experiences)) {
                setExperiences(data.experiences);
            }
        }

        // IDs
        if (data.aadhaarNumber) setAadhaarNumber(data.aadhaarNumber);
        if (data.panNumber) setPanNumber(data.panNumber);
        if (data.uanNumber) setUanNumber(data.uanNumber);
        if (data.pfNumber) setPfNumber(data.pfNumber);
        if (data.esiNumber) setEsiNumber(data.esiNumber);
        if (data.esiDispensary) setEsiDispensary(data.esiDispensary);
        if (data.contractLength) setContractLength(data.contractLength);

        // Bank
        if (data.bankDetails) {
            setBankName(data.bankDetails.bankName || "");
            setBankAccount(data.bankDetails.accountNumber || "");
            setConfirmBankAccount(data.bankDetails.accountNumber || "");
            setIfsc(data.bankDetails.IFSC || "");
            setBranchName(data.bankDetails.branchName || "");
        }

        // Photos (if already uploaded)
        if (data.personPhoto) {
            setPersonPhoto({ uri: data.personPhoto });
        }
    };

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

    // Validate form
    const validateForm = () => {
        // Basic validation
        if (!gender) {
            Alert.alert("Error", "Please select your gender");
            return false;
        }
        if (!dob) {
            Alert.alert("Error", "Please enter your date of birth");
            return false;
        }
        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            Alert.alert("Error", "Please enter valid 12-digit Aadhaar number");
            return false;
        }

        // Address validation
        if (!co_address1 || !co_city || !co_state || !co_pincode) {
            Alert.alert(
                "Error",
                "Please fill correspondence address completely"
            );
            return false;
        }
        if (!p_address1 || !p_city || !p_state || !p_pincode) {
            Alert.alert("Error", "Please fill permanent address completely");
            return false;
        }

        // Bank validation
        if (!bankAccount) {
            Alert.alert("Error", "Please enter bank account number");
            return false;
        }
        if (bankAccount !== confirmBankAccount) {
            Alert.alert("Error", "Bank account numbers do not match");
            return false;
        }
        if (!ifsc || ifsc.length !== 11) {
            Alert.alert("Error", "Please enter valid 11-character IFSC code");
            return false;
        }
        if (!bankName || !branchName) {
            Alert.alert("Error", "Please fill all bank details");
            return false;
        }

        // Permanent employee specific validation
        if (employeeType === "Permanent") {
            if (!panNumber || panNumber.length !== 10) {
                Alert.alert(
                    "Error",
                    "Please enter valid 10-character PAN number"
                );
                return false;
            }
            if (!highestQualification) {
                Alert.alert("Error", "Please enter highest qualification");
                return false;
            }
            if (!maritalStatus) {
                Alert.alert("Error", "Please select marital status");
                return false;
            }
            if (!fathersName || !motherName) {
                Alert.alert("Error", "Please enter parents' names");
                return false;
            }
            if (!uanNumber || !pfNumber || !esiNumber) {
                Alert.alert("Error", "Please enter UAN, PF, and ESI numbers");
                return false;
            }
        }

        // Password validation (optional but recommended)
        if (newPassword) {
            if (newPassword.length < 6) {
                Alert.alert("Error", "Password must be at least 6 characters");
                return false;
            }
            if (newPassword !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return false;
            }
        }

        // File validation
        if (!personPhoto) {
            Alert.alert("Error", "Please upload your photo");
            return false;
        }
        if (!aadhaarFile1 || !aadhaarFile2) {
            Alert.alert("Error", "Please upload both sides of Aadhaar");
            return false;
        }
        if (!bankProofFile) {
            Alert.alert("Error", "Please upload bank proof");
            return false;
        }

        if (employeeType === "Permanent") {
            if (!panFile) {
                Alert.alert("Error", "Please upload PAN card");
                return false;
            }
            if (!pfForm || !esiForm) {
                Alert.alert("Error", "Please upload PF and ESI forms");
                return false;
            }
        }

        return true;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            // Debug: Log all file states
            console.log("📸 personPhoto:", personPhoto);
            console.log("📄 aadhaarFile1:", aadhaarFile1);
            console.log("📄 aadhaarFile2:", aadhaarFile2);
            console.log("📄 panFile:", panFile);
            console.log("📄 bankProofFile:", bankProofFile);
            console.log("📄 familyPhoto:", familyPhoto);
            console.log("📄 pfForm:", pfForm);
            console.log("📄 esiForm:", esiForm);
            console.log("📄 employmentForm:", employmentForm);
            console.log("📄 cv:", cv);

            const formData = new FormData();

            // Basic fields
            formData.append("gender", gender);
            formData.append("dob", dob);
            if (alternatePhone)
                formData.append("alternatePhone", alternatePhone);
            formData.append("aadhaarNumber", aadhaarNumber);

            // ✅ Correspondence Address
            formData.append("correspondenceAddress.addressLine1", co_address1);
            if (co_address2)
                formData.append(
                    "correspondenceAddress.addressLine2",
                    co_address2
                );
            formData.append("correspondenceAddress.state", co_state);
            formData.append("correspondenceAddress.city", co_city);
            formData.append("correspondenceAddress.pincode", co_pincode);

            // ✅ Permanent Address - FIXED field names
            formData.append("permanentAddress.addressLine1", p_address1);
            if (p_address2)
                formData.append("permanentAddress.addressLine2", p_address2);
            formData.append("permanentAddress.state", p_state);
            formData.append("permanentAddress.city", p_city);
            formData.append("permanentAddress.pincode", p_pincode);

            // Bank details
            formData.append("bankDetails.bankName", bankName);
            formData.append("bankDetails.accountNumber", bankAccount);
            formData.append("bankDetails.ifsc", ifsc);
            formData.append("bankDetails.branchName", branchName);

            // Permanent employee specific fields
            if (employeeType === "Permanent") {
                formData.append("highestQualification", highestQualification);
                formData.append("maritalStatus", maritalStatus);
                formData.append("panNumber", panNumber);
                formData.append("fathersName", fathersName);
                if (fatherDob) formData.append("fatherDob", fatherDob);
                formData.append("motherName", motherName);
                if (motherDob) formData.append("motherDob", motherDob);
                if (spouseName) formData.append("spouseName", spouseName);
                if (spouseDob) formData.append("spouseDob", spouseDob);
                if (child1Name) formData.append("child1Name", child1Name);
                if (child1Dob) formData.append("child1Dob", child1Dob);
                if (child2Name) formData.append("child2Name", child2Name);
                if (child2Dob) formData.append("child2Dob", child2Dob);
                formData.append("uanNumber", uanNumber);
                formData.append("pfNumber", pfNumber);
                formData.append("esiNumber", esiNumber);
                if (esiDispensary)
                    formData.append("esiDispensary", esiDispensary);
                formData.append("experiences", JSON.stringify(experiences));
            }

            // Contractual specific
            if (employeeType === "Contractual" && contractLength) {
                formData.append("contractLength", contractLength);
            }

            // Password change
            if (newPassword) {
                formData.append("newPassword", newPassword);
            }

            // ✅ Helper function to append files
            const appendFile = (
                fieldName,
                file,
                defaultType = "application/pdf"
            ) => {
                if (!file || !file.uri) {
                    console.log(`⚠️ Skipping ${fieldName} - no file or uri`);
                    return;
                }

                // Don't upload if it's an existing URL
                if (file.uri.startsWith("http")) {
                    console.log(`⚠️ Skipping ${fieldName} - already uploaded`);
                    return;
                }

                console.log(`✅ Appending ${fieldName}:`, file);

                formData.append(fieldName, {
                    uri: file.uri,
                    name:
                        file.name ||
                        `${fieldName}.${
                            defaultType === "image/jpeg" ? "jpg" : "pdf"
                        }`,
                    type: file.mimeType || file.type || defaultType,
                });
            };

            // ✅ Append all files
            appendFile("personPhoto", personPhoto, "image/jpeg");
            appendFile("aadhaarFront", aadhaarFile1, "application/pdf");
            appendFile("aadhaarBack", aadhaarFile2, "application/pdf");

            if (employeeType === "Permanent") {
                appendFile("panCard", panFile, "application/pdf");
                appendFile("familyPhoto", familyPhoto, "image/jpeg");
                appendFile("pfForm", pfForm, "application/pdf");
                appendFile("esiForm", esiForm, "application/pdf");
                appendFile("employmentForm", employmentForm, "application/pdf");
                appendFile("cv", cv, "application/pdf");
            }

            appendFile("bankProof", bankProofFile, "application/pdf");

            console.log("📤 Submitting profile update...");

            const response = await fetch(
                `${API_BASE_URL}/employee/employee/profile`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // Don't set Content-Type - let FormData set it
                    },
                    body: formData,
                }
            );

            console.log("📥 Response status:", response.status);

            const responseText = await response.text();
            console.log("📥 Raw response:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("❌ Failed to parse JSON:", e);
                throw new Error("Server did not return valid JSON");
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            console.log("✅ Profile updated successfully:", data);
            setShowPennyModal(true);
        } catch (error) {
            console.error("❌ Error:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to update profile. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handlePennyConfirm = (received) => {
        setShowPennyModal(false);
        if (received) setShowSuccessModal(true);
    };

    const handleSuccessClose = async () => {
        setShowSuccessModal(false);

        // ✅ Mark profile as completed in context
        await markProfileComplete();

        // Navigation will happen automatically via AppNavigator
        console.log("✅ Profile completed");
    };

    if (loading) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#E4002B" />
                <Text style={{ marginTop: 10, color: "#666" }}>
                    Loading profile...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            <Header showBackButton={false} />

            <View style={styles.headingContainer}>
                <Text style={styles.pageHeading}>Complete Your Profile</Text>
                <Text style={styles.pageSubheading}>
                    {employeeType} Employee
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                <View style={styles.formContainer}>
                    {/* Read-only basic info */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>
                            Name: <Text style={styles.infoValue}>{name}</Text>
                        </Text>
                        <Text style={styles.infoLabel}>
                            Email: <Text style={styles.infoValue}>{email}</Text>
                        </Text>
                        <Text style={styles.infoLabel}>
                            Phone: <Text style={styles.infoValue}>{phone}</Text>
                        </Text>
                    </View>

                    {/* Personal Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Personal Details
                        </Text>

                        <PhotoPicker
                            label="Upload Your Photo"
                            photo={personPhoto}
                            onPhotoSelect={setPersonPhoto}
                            onPhotoRemove={() => setPersonPhoto(null)}
                            required={true}
                            size="large"
                        />

                        <SearchableDropdown
                            label="Gender"
                            placeholder="Select gender"
                            open={genderOpen}
                            value={gender}
                            items={genderOptions}
                            setOpen={setGenderOpen}
                            setValue={setGender}
                            required={true}
                            zIndex={6000}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Date of Birth (DD/MM/YYYY) *"
                            placeholderTextColor="#999"
                            value={dob}
                            onChangeText={setDob}
                        />

                        {employeeType === "Permanent" && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Highest Qualification *"
                                    placeholderTextColor="#999"
                                    value={highestQualification}
                                    onChangeText={setHighestQualification}
                                />

                                <SearchableDropdown
                                    label="Marital Status"
                                    placeholder="Select marital status"
                                    open={maritalOpen}
                                    value={maritalStatus}
                                    items={maritalOptions}
                                    setOpen={setMaritalOpen}
                                    setValue={setMaritalStatus}
                                    required={true}
                                    zIndex={5000}
                                />
                            </>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Alternate Phone Number"
                            placeholderTextColor="#999"
                            value={alternatePhone}
                            onChangeText={(text) =>
                                setAlternatePhone(text.replace(/\D/g, ""))
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

                    {/* Family Background - Only for Permanent */}
                    {employeeType === "Permanent" && (
                        <View style={[styles.section, { zIndex: 1 }]}>
                            <Text style={styles.sectionTitle}>
                                Family Background
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Father's Name *"
                                placeholderTextColor="#999"
                                value={fathersName}
                                onChangeText={setFathersName}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Father's DOB (DD/MM/YYYY)"
                                placeholderTextColor="#999"
                                value={fatherDob}
                                onChangeText={setFatherDob}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Mother's Name *"
                                placeholderTextColor="#999"
                                value={motherName}
                                onChangeText={setMotherName}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Mother's DOB (DD/MM/YYYY)"
                                placeholderTextColor="#999"
                                value={motherDob}
                                onChangeText={setMotherDob}
                            />

                            {maritalStatus === "Married" && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Spouse Name"
                                        placeholderTextColor="#999"
                                        value={spouseName}
                                        onChangeText={setSpouseName}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Spouse DOB (DD/MM/YYYY)"
                                        placeholderTextColor="#999"
                                        value={spouseDob}
                                        onChangeText={setSpouseDob}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Child 1 Name"
                                        placeholderTextColor="#999"
                                        value={child1Name}
                                        onChangeText={setChild1Name}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Child 1 DOB (DD/MM/YYYY)"
                                        placeholderTextColor="#999"
                                        value={child1Dob}
                                        onChangeText={setChild1Dob}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Child 2 Name"
                                        placeholderTextColor="#999"
                                        value={child2Name}
                                        onChangeText={setChild2Name}
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Child 2 DOB (DD/MM/YYYY)"
                                        placeholderTextColor="#999"
                                        value={child2Dob}
                                        onChangeText={setChild2Dob}
                                    />
                                </>
                            )}
                        </View>
                    )}

                    {/* Identification & Bank */}
                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionTitle}>
                            Identification Details
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Aadhaar Number (12 digits) *"
                            placeholderTextColor="#999"
                            value={aadhaarNumber}
                            onChangeText={(text) =>
                                setAadhaarNumber(text.replace(/\D/g, ""))
                            }
                            keyboardType="number-pad"
                            maxLength={12}
                        />

                        {employeeType === "Permanent" && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="PAN Number (10 characters) *"
                                    placeholderTextColor="#999"
                                    value={panNumber}
                                    onChangeText={(text) =>
                                        setPanNumber(text.toUpperCase())
                                    }
                                    autoCapitalize="characters"
                                    maxLength={10}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="UAN Number *"
                                    placeholderTextColor="#999"
                                    value={uanNumber}
                                    onChangeText={setUanNumber}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="PF Number *"
                                    placeholderTextColor="#999"
                                    value={pfNumber}
                                    onChangeText={setPfNumber}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="ESI Number *"
                                    placeholderTextColor="#999"
                                    value={esiNumber}
                                    onChangeText={setEsiNumber}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="ESI Dispensary Location"
                                    placeholderTextColor="#999"
                                    value={esiDispensary}
                                    onChangeText={setEsiDispensary}
                                />
                            </>
                        )}

                        {employeeType === "Contractual" && (
                            <TextInput
                                style={styles.input}
                                placeholder="Contract Length (e.g., 6 months)"
                                placeholderTextColor="#999"
                                value={contractLength}
                                onChangeText={setContractLength}
                            />
                        )}
                    </View>

                    {/* Bank Details */}
                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionTitle}>Bank Details</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Bank Name *"
                            placeholderTextColor="#999"
                            value={bankName}
                            onChangeText={setBankName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Account Number *"
                            placeholderTextColor="#999"
                            value={bankAccount}
                            onChangeText={(text) =>
                                setBankAccount(text.replace(/\D/g, ""))
                            }
                            keyboardType="number-pad"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Account Number *"
                            placeholderTextColor="#999"
                            value={confirmBankAccount}
                            onChangeText={(text) =>
                                setConfirmBankAccount(text.replace(/\D/g, ""))
                            }
                            keyboardType="number-pad"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="IFSC Code (11 characters) *"
                            placeholderTextColor="#999"
                            value={ifsc}
                            onChangeText={(text) => setIfsc(text.toUpperCase())}
                            autoCapitalize="characters"
                            maxLength={11}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Branch Name *"
                            placeholderTextColor="#999"
                            value={branchName}
                            onChangeText={setBranchName}
                        />
                    </View>

                    {/* Work Experience - Only for Permanent */}
                    {employeeType === "Permanent" && (
                        <View style={[styles.section, { zIndex: 1 }]}>
                            <Text style={styles.sectionTitle}>
                                Prior Work Experience
                            </Text>

                            {experiences.map((exp, index) => (
                                <View key={index} style={styles.experienceCard}>
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
                                        placeholder="Organization Name"
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
                                        placeholder="Designation"
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
                                            placeholder="From (DD/MM/YYYY)"
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
                    )}

                    {/* File Uploads */}
                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionTitle}>File Uploads</Text>
                        <Text style={styles.uploadHint}>
                            * Accepted formats: PNG, JPG, JPEG, PDF — less than
                            1 MB
                        </Text>

                        <FileUpload
                            label="Aadhaar (Front)"
                            file={aadhaarFile1}
                            onFileSelect={setAadhaarFile1}
                            onFileRemove={() => setAadhaarFile1(null)}
                            accept="all"
                            required={true}
                        />

                        <FileUpload
                            label="Aadhaar (Back)"
                            file={aadhaarFile2}
                            onFileSelect={setAadhaarFile2}
                            onFileRemove={() => setAadhaarFile2(null)}
                            accept="all"
                            required={true}
                        />

                        {employeeType === "Permanent" && (
                            <FileUpload
                                label="PAN Card"
                                file={panFile}
                                onFileSelect={setPanFile}
                                onFileRemove={() => setPanFile(null)}
                                accept="all"
                                required={true}
                            />
                        )}

                        <FileUpload
                            label="Bank Proof (Cancelled Cheque/Passbook)"
                            file={bankProofFile}
                            onFileSelect={setBankProofFile}
                            onFileRemove={() => setBankProofFile(null)}
                            accept="all"
                            required={true}
                        />

                        {employeeType === "Permanent" && (
                            <>
                                <FileUpload
                                    label="Family Photo"
                                    file={familyPhoto}
                                    onFileSelect={setFamilyPhoto}
                                    onFileRemove={() => setFamilyPhoto(null)}
                                    accept="image"
                                />

                                <FileUpload
                                    label="PF Form"
                                    file={pfForm}
                                    onFileSelect={setPfForm}
                                    onFileRemove={() => setPfForm(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="ESI Form"
                                    file={esiForm}
                                    onFileSelect={setEsiForm}
                                    onFileRemove={() => setEsiForm(null)}
                                    accept="all"
                                    required={true}
                                />

                                <FileUpload
                                    label="Employment Form"
                                    file={employmentForm}
                                    onFileSelect={setEmploymentForm}
                                    onFileRemove={() => setEmploymentForm(null)}
                                    accept="all"
                                />

                                <FileUpload
                                    label="Copy of CV"
                                    file={cv}
                                    onFileSelect={setCv}
                                    onFileRemove={() => setCv(null)}
                                    accept="all"
                                />
                            </>
                        )}
                    </View>

                    {/* Password Change Section */}
                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionTitle}>
                            Change Password (Optional)
                        </Text>

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="New Password (min 6 characters)"
                                placeholderTextColor="#999"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Submit Button */}
                    <GradientButton
                        title={
                            submitting ? "Submitting..." : "Complete Profile"
                        }
                        onPress={handleSubmit}
                        colors={["#E4002B", "#c82333"]}
                        icon="checkmark-circle-outline"
                        fullWidth={true}
                        loading={submitting}
                        disabled={submitting}
                    />
                </View>
            </ScrollView>

            {/* Penny Transfer Modal */}
            <PennyTransferModal
                visible={showPennyModal}
                onClose={() => setShowPennyModal(false)}
                onConfirm={handlePennyConfirm}
                bankDetails={{
                    bankName,
                    accountNumber: bankAccount,
                    ifsc,
                }}
            />

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessClose}
                title="Profile Completed!"
                message="Your profile has been completed and verified successfully. You can now access your dashboard."
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
    pageSubheading: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#E4002B",
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    infoValue: {
        fontWeight: "600",
        color: "#333",
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
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        marginBottom: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
    },
    eyeIcon: {
        padding: 15,
    },
});

export default CompleteEmployeeProfileScreen;
