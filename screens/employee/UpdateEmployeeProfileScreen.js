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
import SuccessModal from "../../components/SuccessModal";

// Import AuthContext
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const UpdateEmployeeProfileScreen = ({ navigation }) => {
    const { refreshProfile, userProfile } = useAuth();

    // Loading states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [employeeType, setEmployeeType] = useState(""); // Read-only
    const [profileData, setProfileData] = useState(null);

    // 🔒 LOCKED FIELDS (Read-only, set by admin)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [panNumber, setPanNumber] = useState("");

    // ✏️ EDITABLE FIELDS
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

    // Bank & Other IDs
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

    // Files (only allow updating, not viewing)
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

            // Use profile from context if available
            if (userProfile) {
                console.log("📋 Using profile from context");
                setEmployeeType(userProfile.employeeType);
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

            const response = await fetch(
                `${API_BASE_URL}/employee/employee/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data) {
                setProfileData(data);
                setEmployeeType(data.employeeType);
                prefillForm(data);
                console.log("✅ Employee profile loaded");
            } else {
                throw new Error(data.message || "Failed to fetch profile");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const prefillForm = (data) => {
        // 🔒 Locked fields (read-only)
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.aadhaarNumber) setAadhaarNumber(data.aadhaarNumber);
        if (data.panNumber) setPanNumber(data.panNumber);

        // ✏️ Editable fields
        if (data.dob) setDob(data.dob);
        if (data.gender) setGender(data.gender);
        if (data.alternatePhone) setAlternatePhone(data.alternatePhone);
        if (data.highestQualification)
            setHighestQualification(data.highestQualification);
        if (data.maritalStatus) setMaritalStatus(data.maritalStatus);

        // Addresses
        if (data.correspondenceAddress) {
            setCoAddress1(
                data.correspondenceAddress.address1 ||
                    data.correspondenceAddress.address ||
                    ""
            );
            setCoAddress2(data.correspondenceAddress.address2 || "");
            setCoState(data.correspondenceAddress.state || "");
            setCoCity(data.correspondenceAddress.city || "");
            setCoPincode(data.correspondenceAddress.pincode || "");
        }

        if (data.permanentAddress) {
            setPAddress1(
                data.permanentAddress.address1 ||
                    data.permanentAddress.address ||
                    ""
            );
            setPAddress2(data.permanentAddress.address2 || "");
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

        // Photos (show existing but allow update)
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

        // Password validation (optional)
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

        return true;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;

        Alert.alert(
            "Update Profile",
            "Are you sure you want to update your profile?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Update",
                    onPress: async () => {
                        setSubmitting(true);

                        try {
                            const token = await AsyncStorage.getItem(
                                "userToken"
                            );
                            if (!token) {
                                Alert.alert("Error", "Please login again.");
                                navigation.replace("Login");
                                return;
                            }

                            const formData = new FormData();

                            // Basic fields (editable)
                            formData.append("gender", gender);
                            formData.append("dob", dob);
                            if (alternatePhone)
                                formData.append(
                                    "alternatePhone",
                                    alternatePhone
                                );

                            // Addresses using dot notation
                            formData.append(
                                "correspondenceAddress.address1",
                                co_address1
                            );
                            if (co_address2)
                                formData.append(
                                    "correspondenceAddress.address2",
                                    co_address2
                                );
                            formData.append(
                                "correspondenceAddress.state",
                                co_state
                            );
                            formData.append(
                                "correspondenceAddress.city",
                                co_city
                            );
                            formData.append(
                                "correspondenceAddress.pincode",
                                co_pincode
                            );

                            formData.append(
                                "permanentAddress.address1",
                                p_address1
                            );
                            if (p_address2)
                                formData.append(
                                    "permanentAddress.address2",
                                    p_address2
                                );
                            formData.append("permanentAddress.state", p_state);
                            formData.append("permanentAddress.city", p_city);
                            formData.append(
                                "permanentAddress.pincode",
                                p_pincode
                            );

                            // Bank details using dot notation
                            formData.append("bankDetails.bankName", bankName);
                            formData.append(
                                "bankDetails.accountNumber",
                                bankAccount
                            );
                            formData.append("bankDetails.IFSC", ifsc);
                            formData.append(
                                "bankDetails.branchName",
                                branchName
                            );

                            // Permanent employee specific fields
                            if (employeeType === "Permanent") {
                                formData.append(
                                    "highestQualification",
                                    highestQualification
                                );
                                formData.append("maritalStatus", maritalStatus);
                                formData.append("fathersName", fathersName);
                                if (fatherDob)
                                    formData.append("fatherDob", fatherDob);
                                formData.append("motherName", motherName);
                                if (motherDob)
                                    formData.append("motherDob", motherDob);
                                if (spouseName)
                                    formData.append("spouseName", spouseName);
                                if (spouseDob)
                                    formData.append("spouseDob", spouseDob);
                                if (child1Name)
                                    formData.append("child1Name", child1Name);
                                if (child1Dob)
                                    formData.append("child1Dob", child1Dob);
                                if (child2Name)
                                    formData.append("child2Name", child2Name);
                                if (child2Dob)
                                    formData.append("child2Dob", child2Dob);
                                formData.append("uanNumber", uanNumber);
                                formData.append("pfNumber", pfNumber);
                                formData.append("esiNumber", esiNumber);
                                if (esiDispensary)
                                    formData.append(
                                        "esiDispensary",
                                        esiDispensary
                                    );
                                formData.append(
                                    "experiences",
                                    JSON.stringify(experiences)
                                );
                            }

                            // Contractual specific
                            if (
                                employeeType === "Contractual" &&
                                contractLength
                            ) {
                                formData.append(
                                    "contractLength",
                                    contractLength
                                );
                            }

                            // Password change
                            if (newPassword) {
                                formData.append("newPassword", newPassword);
                            }

                            // Files - Only add if updated (not existing URL)
                            if (
                                personPhoto &&
                                !personPhoto.uri?.startsWith("http")
                            ) {
                                formData.append("personPhoto", {
                                    uri: personPhoto.uri,
                                    type: personPhoto.type || "image/jpeg",
                                    name: "person_photo.jpg",
                                });
                            }

                            if (aadhaarFile1) {
                                formData.append("aadhaarFront", {
                                    uri: aadhaarFile1.uri,
                                    type:
                                        aadhaarFile1.mimeType ||
                                        "application/pdf",
                                    name:
                                        aadhaarFile1.name ||
                                        "aadhaar_front.pdf",
                                });
                            }

                            if (aadhaarFile2) {
                                formData.append("aadhaarBack", {
                                    uri: aadhaarFile2.uri,
                                    type:
                                        aadhaarFile2.mimeType ||
                                        "application/pdf",
                                    name:
                                        aadhaarFile2.name || "aadhaar_back.pdf",
                                });
                            }

                            if (panFile && employeeType === "Permanent") {
                                formData.append("panCard", {
                                    uri: panFile.uri,
                                    type: panFile.mimeType || "application/pdf",
                                    name: panFile.name || "pan_card.pdf",
                                });
                            }

                            if (bankProofFile) {
                                formData.append("bankProof", {
                                    uri: bankProofFile.uri,
                                    type:
                                        bankProofFile.mimeType ||
                                        "application/pdf",
                                    name:
                                        bankProofFile.name || "bank_proof.pdf",
                                });
                            }

                            if (familyPhoto && employeeType === "Permanent") {
                                formData.append("familyPhoto", {
                                    uri: familyPhoto.uri,
                                    type: familyPhoto.type || "image/jpeg",
                                    name: "family_photo.jpg",
                                });
                            }

                            if (pfForm && employeeType === "Permanent") {
                                formData.append("pfForm", {
                                    uri: pfForm.uri,
                                    type: pfForm.mimeType || "application/pdf",
                                    name: pfForm.name || "pf_form.pdf",
                                });
                            }

                            if (esiForm && employeeType === "Permanent") {
                                formData.append("esiForm", {
                                    uri: esiForm.uri,
                                    type: esiForm.mimeType || "application/pdf",
                                    name: esiForm.name || "esi_form.pdf",
                                });
                            }

                            if (
                                employmentForm &&
                                employeeType === "Permanent"
                            ) {
                                formData.append("employmentForm", {
                                    uri: employmentForm.uri,
                                    type:
                                        employmentForm.mimeType ||
                                        "application/pdf",
                                    name:
                                        employmentForm.name ||
                                        "employment_form.pdf",
                                });
                            }

                            if (cv && employeeType === "Permanent") {
                                formData.append("cv", {
                                    uri: cv.uri,
                                    type: cv.mimeType || "application/pdf",
                                    name: cv.name || "cv.pdf",
                                });
                            }

                            console.log("📤 Submitting profile update...");

                            const response = await fetch(
                                `${API_BASE_URL}/employee/employee/profile`,
                                {
                                    method: "PUT",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: formData,
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(
                                    data.message || "Failed to update profile"
                                );
                            }

                            console.log("✅ Profile updated successfully");

                            // Refresh profile in context
                            await refreshProfile();

                            setShowSuccessModal(true);
                        } catch (error) {
                            console.error("Error:", error);
                            Alert.alert(
                                "Error",
                                error.message ||
                                    "Failed to update profile. Please try again."
                            );
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigation.goBack();
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

            <Header
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.headingContainer}>
                <Text style={styles.pageHeading}>Update Profile</Text>
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
                    {/* 🔒 Locked Fields Card */}
                    <View style={styles.lockedCard}>
                        <View style={styles.lockedHeader}>
                            <Ionicons
                                name="lock-closed"
                                size={20}
                                color="#666"
                            />
                            <Text style={styles.lockedTitle}>
                                Locked Information
                            </Text>
                        </View>
                        <Text style={styles.lockedSubtitle}>
                            These fields cannot be edited. Contact admin if
                            changes are needed.
                        </Text>

                        <View style={styles.lockedField}>
                            <Text style={styles.lockedLabel}>Name</Text>
                            <Text style={styles.lockedValue}>{name}</Text>
                        </View>

                        <View style={styles.lockedField}>
                            <Text style={styles.lockedLabel}>Email</Text>
                            <Text style={styles.lockedValue}>{email}</Text>
                        </View>

                        <View style={styles.lockedField}>
                            <Text style={styles.lockedLabel}>Phone</Text>
                            <Text style={styles.lockedValue}>{phone}</Text>
                        </View>

                        <View style={styles.lockedField}>
                            <Text style={styles.lockedLabel}>Worker Type</Text>
                            <Text style={styles.lockedValue}>
                                {employeeType}
                            </Text>
                        </View>

                        <View style={styles.lockedField}>
                            <Text style={styles.lockedLabel}>
                                Aadhaar Number
                            </Text>
                            <Text style={styles.lockedValue}>
                                {aadhaarNumber
                                    ? `XXXX XXXX ${aadhaarNumber.slice(-4)}`
                                    : "Not provided"}
                            </Text>
                        </View>

                        {employeeType === "Permanent" && panNumber && (
                            <View style={styles.lockedField}>
                                <Text style={styles.lockedLabel}>
                                    PAN Number
                                </Text>
                                <Text style={styles.lockedValue}>
                                    {panNumber
                                        ? `${panNumber.slice(
                                              0,
                                              3
                                          )}XXXXXX${panNumber.slice(-1)}`
                                        : "Not provided"}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* ✏️ Personal Details (Editable) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Personal Details
                        </Text>

                        <PhotoPicker
                            label="Update Your Photo"
                            photo={personPhoto}
                            onPhotoSelect={setPersonPhoto}
                            onPhotoRemove={() => setPersonPhoto(null)}
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
                    {employeeType === "Permanent" && (
                        <View style={[styles.section, { zIndex: 1 }]}>
                            <Text style={styles.sectionTitle}>
                                Additional IDs
                            </Text>

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
                        </View>
                    )}

                    {employeeType === "Contractual" && (
                        <View style={[styles.section, { zIndex: 1 }]}>
                            <Text style={styles.sectionTitle}>
                                Contract Details
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Contract Length (e.g., 6 months)"
                                placeholderTextColor="#999"
                                value={contractLength}
                                onChangeText={setContractLength}
                            />
                        </View>
                    )}

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
                                Work Experience
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
                        <Text style={styles.sectionTitle}>
                            Update Documents (Optional)
                        </Text>
                        <Text style={styles.uploadHint}>
                            * Only upload if you need to update existing
                            documents
                        </Text>

                        <FileUpload
                            label="Aadhaar (Front)"
                            file={aadhaarFile1}
                            onFileSelect={setAadhaarFile1}
                            onFileRemove={() => setAadhaarFile1(null)}
                            accept="all"
                        />

                        <FileUpload
                            label="Aadhaar (Back)"
                            file={aadhaarFile2}
                            onFileSelect={setAadhaarFile2}
                            onFileRemove={() => setAadhaarFile2(null)}
                            accept="all"
                        />

                        {employeeType === "Permanent" && (
                            <FileUpload
                                label="PAN Card"
                                file={panFile}
                                onFileSelect={setPanFile}
                                onFileRemove={() => setPanFile(null)}
                                accept="all"
                            />
                        )}

                        <FileUpload
                            label="Bank Proof"
                            file={bankProofFile}
                            onFileSelect={setBankProofFile}
                            onFileRemove={() => setBankProofFile(null)}
                            accept="all"
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
                                />

                                <FileUpload
                                    label="ESI Form"
                                    file={esiForm}
                                    onFileSelect={setEsiForm}
                                    onFileRemove={() => setEsiForm(null)}
                                    accept="all"
                                />

                                <FileUpload
                                    label="Employment Form"
                                    file={employmentForm}
                                    onFileSelect={setEmploymentForm}
                                    onFileRemove={() => setEmploymentForm(null)}
                                    accept="all"
                                />

                                <FileUpload
                                    label="CV"
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
                        title={submitting ? "Updating..." : "Update Profile"}
                        onPress={handleSubmit}
                        colors={["#E4002B", "#c82333"]}
                        icon="save-outline"
                        fullWidth={true}
                        loading={submitting}
                        disabled={submitting}
                    />
                </View>
            </ScrollView>

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessClose}
                title="Profile Updated!"
                message="Your profile has been updated successfully."
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
    lockedCard: {
        backgroundColor: "#FFF9E6",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderStyle: "dashed",
    },
    lockedHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    lockedTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#666",
    },
    lockedSubtitle: {
        fontSize: 12,
        color: "#999",
        marginBottom: 15,
        fontStyle: "italic",
    },
    lockedField: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#FFE082",
    },
    lockedLabel: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    lockedValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "400",
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

export default UpdateEmployeeProfileScreen;
