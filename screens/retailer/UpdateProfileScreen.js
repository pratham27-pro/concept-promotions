import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import PennyTransferModal from "../../components/PennyTransferModal";
import SuccessModal from "../../components/SuccessModal";
import PhotoPicker from "../../components/common/PhotoPicker";
import Header from "../../components/common/Header";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const CreateRetailerProfileScreen = ({ navigation }) => {
    // Loading & Profile States
    const [loading, setLoading] = useState(true);
    const [profileExists, setProfileExists] = useState(false);
    const [retailerId, setRetailerId] = useState(null);

    // Personal Details
    const [name, setName] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [altContactNo, setAltContactNo] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState("");

    // Gender Dropdown
    const [genderOpen, setGenderOpen] = useState(false);
    const [gender, setGender] = useState(null);
    const [genderOptions] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
    ]);

    // Govt ID Type Dropdown
    const [govtIdTypeOpen, setGovtIdTypeOpen] = useState(false);
    const [govtIdType, setGovtIdType] = useState(null);
    const [govtIdOptions] = useState([
        { label: "Aadhaar", value: "aadhaar" },
        { label: "PAN", value: "pan" },
        { label: "Voter ID", value: "voter_id" },
        { label: "Driving License", value: "driving_license" },
    ]);
    const [govtIdNumber, setGovtIdNumber] = useState("");
    const [govtIdError, setGovtIdError] = useState("");

    // Shop Details
    const [shopName, setShopName] = useState("");

    // Business Type Dropdown
    const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
    const [businessType, setBusinessType] = useState(null);
    const [businessTypeOptions] = useState([
        { label: "Retail", value: "retail" },
        { label: "Wholesale", value: "wholesale" },
        { label: "Both", value: "both" },
    ]);

    // Ownership Type Dropdown
    const [ownershipTypeOpen, setOwnershipTypeOpen] = useState(false);
    const [ownershipType, setOwnershipType] = useState(null);
    const [ownershipTypeOptions] = useState([
        { label: "Owned", value: "owned" },
        { label: "Rented", value: "rented" },
        { label: "Leased", value: "leased" },
    ]);

    const [gstNo, setGstNo] = useState("");
    const [gstError, setGstError] = useState("");
    const [panCard, setPanCard] = useState("");
    const [panError, setPanError] = useState("");

    // Shop Address
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");

    // State Dropdown
    const [stateOpen, setStateOpen] = useState(false);
    const [state, setState] = useState(null);
    const [stateOptions] = useState([
        { label: "Andhra Pradesh", value: "Andhra Pradesh" },
        { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
        { label: "Assam", value: "Assam" },
        { label: "Bihar", value: "Bihar" },
        { label: "Chhattisgarh", value: "Chhattisgarh" },
        { label: "Goa", value: "Goa" },
        { label: "Gujarat", value: "Gujarat" },
        { label: "Haryana", value: "Haryana" },
        { label: "Himachal Pradesh", value: "Himachal Pradesh" },
        { label: "Jharkhand", value: "Jharkhand" },
        { label: "Karnataka", value: "Karnataka" },
        { label: "Kerala", value: "Kerala" },
        { label: "Madhya Pradesh", value: "Madhya Pradesh" },
        { label: "Maharashtra", value: "Maharashtra" },
        { label: "Manipur", value: "Manipur" },
        { label: "Meghalaya", value: "Meghalaya" },
        { label: "Mizoram", value: "Mizoram" },
        { label: "Nagaland", value: "Nagaland" },
        { label: "Odisha", value: "Odisha" },
        { label: "Punjab", value: "Punjab" },
        { label: "Rajasthan", value: "Rajasthan" },
        { label: "Sikkim", value: "Sikkim" },
        { label: "Tamil Nadu", value: "Tamil Nadu" },
        { label: "Telangana", value: "Telangana" },
        { label: "Tripura", value: "Tripura" },
        { label: "Uttar Pradesh", value: "Uttar Pradesh" },
        { label: "Uttarakhand", value: "Uttarakhand" },
        { label: "West Bengal", value: "West Bengal" },
        { label: "Delhi", value: "Delhi" },
    ]);

    const [pincode, setPincode] = useState("");
    const [pincodeError, setPincodeError] = useState("");

    // Bank Details with Dropdown
    const [bankNameOpen, setBankNameOpen] = useState(false);
    const [bankName, setBankName] = useState(null);
    const [bankOptions] = useState([
        { label: "State Bank of India", value: "State Bank of India" },
        { label: "HDFC Bank", value: "HDFC Bank" },
        { label: "ICICI Bank", value: "ICICI Bank" },
        { label: "Axis Bank", value: "Axis Bank" },
        { label: "Kotak Mahindra Bank", value: "Kotak Mahindra Bank" },
        { label: "Punjab National Bank", value: "Punjab National Bank" },
        { label: "Bank of Baroda", value: "Bank of Baroda" },
        { label: "Canara Bank", value: "Canara Bank" },
        { label: "Union Bank of India", value: "Union Bank of India" },
        { label: "IndusInd Bank", value: "IndusInd Bank" },
        { label: "Yes Bank", value: "Yes Bank" },
        { label: "IDFC First Bank", value: "IDFC First Bank" },
        { label: "Other", value: "Other" },
    ]);
    const [otherBankName, setOtherBankName] = useState("");

    const [accountNumber, setAccountNumber] = useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
    const [accountError, setAccountError] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [ifscError, setIfscError] = useState("");
    const [branchName, setBranchName] = useState("");

    // OTP Verification
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Photos/Documents
    const [personPhoto, setPersonPhoto] = useState(null);
    const [govtIdPhoto, setGovtIdPhoto] = useState(null);
    const [outletPhoto, setOutletPhoto] = useState(null);
    const [registrationForm, setRegistrationForm] = useState(null);

    // Modals
    const [showPennyModal, setShowPennyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Regex patterns
    const AADHAAR_REGEX = /^\d{12}$/;
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const GST_REGEX =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const PINCODE_REGEX = /^\d{6}$/;

    // Sanitize profile for AsyncStorage
    const sanitizeProfile = (data) => {
        return {
            _id: data._id,
            uniqueId: data.uniqueId,
            retailerCode: data.retailerCode,
            name: data.name,
            contactNo: data.contactNo,
            email: data.email,
            gender: data.gender,
            govtIdType: data.govtIdType,
            govtIdNumber: data.govtIdNumber,
            phoneVerified: data.phoneVerified,

            // Only URLs, never binary
            personPhoto:
                typeof data.personPhoto === "string" ? data.personPhoto : null,
            govtIdPhoto:
                typeof data.govtIdPhoto === "string" ? data.govtIdPhoto : null,

            shopDetails: data.shopDetails
                ? {
                      shopName: data.shopDetails.shopName,
                      businessType: data.shopDetails.businessType,
                      ownershipType: data.shopDetails.ownershipType,
                      GSTNo: data.shopDetails.GSTNo,
                      PANCard: data.shopDetails.PANCard,
                      outletPhoto:
                          typeof data.shopDetails.outletPhoto === "string"
                              ? data.shopDetails.outletPhoto
                              : null,
                      shopAddress: data.shopDetails.shopAddress
                          ? {
                                address: data.shopDetails.shopAddress.address,
                                address2: data.shopDetails.shopAddress.address2,
                                city: data.shopDetails.shopAddress.city,
                                state: data.shopDetails.shopAddress.state,
                                pincode: data.shopDetails.shopAddress.pincode,
                            }
                          : null,
                  }
                : null,

            bankDetails: data.bankDetails
                ? {
                      bankName: data.bankDetails.bankName,
                      accountNumber: data.bankDetails.accountNumber,
                      IFSC: data.bankDetails.IFSC,
                      branchName: data.bankDetails.branchName,
                  }
                : null,
        };
    };

    // Fetch profile on mount
    useFocusEffect(
        useCallback(() => {
            fetchRetailerProfile();
        }, [])
    );

    const [lockedFields, setLockedFields] = useState([]);

    const NON_EDITABLE_FIELDS = [
        "name",
        "govtIdType",
        "govtIdNumber",
        "shopDetails",
        "shopName",
        "businessType",
        "ownershipType",
        "shopAddress",
    ];

    const fetchRetailerProfile = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                Alert.alert("Error", "Please login again.");
                navigation.replace("Login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/retailer/retailer/me`,
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
                const clean = sanitizeProfile(data);

                try {
                    await AsyncStorage.setItem(
                        "retailerProfile",
                        JSON.stringify(clean)
                    );
                } catch (storageError) {
                    console.warn("AsyncStorage error:", storageError);
                }

                setProfileExists(true);
                setLockedFields(NON_EDITABLE_FIELDS);
                setRetailerId(clean._id);
                prefillForm(clean);
                console.log("✅ Profile loaded");
            } else {
                setProfileExists(false);
                console.log("📝 New user");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfileExists(false);
        } finally {
            setLoading(false);
        }
    };

    const prefillForm = (data) => {
        if (data.name) setName(data.name);
        if (data.contactNo) setContactNo(data.contactNo);
        if (data.email) setEmail(data.email);
        if (data.gender) setGender(data.gender);
        if (data.govtIdType) setGovtIdType(data.govtIdType);
        if (data.govtIdNumber) setGovtIdNumber(data.govtIdNumber);
        if (data.phoneVerified) setOtpVerified(true);

        if (data.shopDetails) {
            if (data.shopDetails.shopName)
                setShopName(data.shopDetails.shopName);
            if (data.shopDetails.businessType)
                setBusinessType(data.shopDetails.businessType);
            if (data.shopDetails.ownershipType)
                setOwnershipType(data.shopDetails.ownershipType);
            if (data.shopDetails.GSTNo) setGstNo(data.shopDetails.GSTNo);
            if (data.shopDetails.PANCard) setPanCard(data.shopDetails.PANCard);

            if (data.shopDetails.shopAddress) {
                if (data.shopDetails.shopAddress.address)
                    setAddress1(data.shopDetails.shopAddress.address);
                if (data.shopDetails.shopAddress.address2)
                    setAddress2(data.shopDetails.shopAddress.address2);
                if (data.shopDetails.shopAddress.city)
                    setCity(data.shopDetails.shopAddress.city);
                if (data.shopDetails.shopAddress.state)
                    setState(data.shopDetails.shopAddress.state);
                if (data.shopDetails.shopAddress.pincode) {
                    console.log(
                        "Setting pincode:",
                        data.shopDetails.shopAddress.pincode
                    );
                    setPincode(data.shopDetails.shopAddress.pincode);
                }
            }

            if (data.shopDetails.outletPhoto)
                setOutletPhoto({ uri: data.shopDetails.outletPhoto });
        }

        if (data.bankDetails) {
            if (data.bankDetails.bankName) {
                if (
                    bankOptions.find(
                        (b) => b.value === data.bankDetails.bankName
                    )
                ) {
                    setBankName(data.bankDetails.bankName);
                } else {
                    setBankName("Other");
                    setOtherBankName(data.bankDetails.bankName);
                }
            }
            if (data.bankDetails.accountNumber) {
                setAccountNumber(data.bankDetails.accountNumber);
                setConfirmAccountNumber(data.bankDetails.accountNumber);
            }
            if (data.bankDetails.IFSC) setIfsc(data.bankDetails.IFSC);
            if (data.bankDetails.branchName)
                setBranchName(data.bankDetails.branchName);
        }

        if (data.personPhoto) setPersonPhoto({ uri: data.personPhoto });
        if (data.govtIdPhoto) setGovtIdPhoto({ uri: data.govtIdPhoto });
    };

    // Validation Functions
    const validateGovtId = (value) => {
        setGovtIdNumber(value);
        if (!value) {
            setGovtIdError("");
            return;
        }

        if (govtIdType === "aadhaar" && !AADHAAR_REGEX.test(value)) {
            setGovtIdError("Aadhaar must be 12 digits");
        } else if (
            govtIdType === "pan" &&
            !PAN_REGEX.test(value.toUpperCase())
        ) {
            setGovtIdError("Invalid PAN format (e.g., ABCDE1234F)");
        } else {
            setGovtIdError("");
        }
    };

    const validatePAN = (value) => {
        const upperValue = value.toUpperCase();
        setPanCard(upperValue);
        if (value && !PAN_REGEX.test(upperValue)) {
            setPanError("Invalid PAN format (e.g., ABCDE1234F)");
        } else {
            setPanError("");
        }
    };

    const validateGST = (value) => {
        const upperValue = value.toUpperCase();
        setGstNo(upperValue);
        if (value && !GST_REGEX.test(upperValue)) {
            setGstError("Invalid GST format (15 characters)");
        } else {
            setGstError("");
        }
    };

    const validatePincode = (value) => {
        setPincode(value);
        if (value && !PINCODE_REGEX.test(value)) {
            setPincodeError("Pincode must be 6 digits");
        } else {
            setPincodeError("");
        }
    };

    const validateIFSC = (value) => {
        const upperValue = value.toUpperCase();
        setIfsc(upperValue);
        if (value && !IFSC_REGEX.test(upperValue)) {
            setIfscError("Invalid IFSC code format");
        } else {
            setIfscError("");
        }
    };

    const validateAccountNumber = (value) => {
        setConfirmAccountNumber(value);
        if (accountNumber && value !== accountNumber) {
            setAccountError("Account numbers do not match");
        } else {
            setAccountError("");
        }
    };

    // File Pickers
    const pickGovtIdPhoto = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
            });

            if (result.type !== "cancel") {
                setGovtIdPhoto(result);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const pickOutletPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setOutletPhoto(result.assets[0]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const pickRegistrationForm = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
            });

            if (result.type !== "cancel") {
                setRegistrationForm(result);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    // OTP Functions
    const handleSendOTP = async () => {
        if (!contactNo || contactNo.length !== 10) {
            Alert.alert(
                "Error",
                "Please enter a valid 10-digit contact number"
            );
            return;
        }

        try {
            // API call to send OTP
            Alert.alert("Success", "OTP sent to your contact number");
            setShowOtpInput(true);
            setResendTimer(60);

            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            Alert.alert("Error", "Failed to send OTP");
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit OTP");
            return;
        }

        try {
            // API call to verify OTP
            setOtpVerified(true);
            Alert.alert("Success", "Contact number verified successfully");
        } catch (error) {
            Alert.alert("Error", "Invalid OTP");
        }
    };

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return false;
        }
        if (!contactNo || contactNo.length !== 10) {
            Alert.alert("Error", "Please enter a valid contact number");
            return false;
        }
        if (!otpVerified && !profileExists) {
            Alert.alert("Error", "Please verify your contact number");
            return false;
        }
        if (!govtIdType) {
            Alert.alert("Error", "Please select government ID type");
            return false;
        }
        if (!govtIdNumber.trim() || govtIdError) {
            Alert.alert("Error", "Please enter valid government ID");
            return false;
        }
        if (!shopName.trim()) {
            Alert.alert("Error", "Please enter shop name");
            return false;
        }
        if (!businessType) {
            Alert.alert("Error", "Please select business type");
            return false;
        }
        if (!ownershipType) {
            Alert.alert("Error", "Please select ownership type");
            return false;
        }
        if (panError || gstError) {
            Alert.alert("Error", "Please fix validation errors");
            return false;
        }
        if (!address1.trim()) {
            Alert.alert("Error", "Please enter address");
            return false;
        }
        if (!city.trim()) {
            Alert.alert("Error", "Please enter city");
            return false;
        }
        if (!state) {
            Alert.alert("Error", "Please select state");
            return false;
        }
        if (!pincode || pincodeError) {
            Alert.alert("Error", "Please enter valid pincode");
            return false;
        }
        if (!bankName) {
            Alert.alert("Error", "Please select bank");
            return false;
        }
        if (bankName === "Other" && !otherBankName.trim()) {
            Alert.alert("Error", "Please enter bank name");
            return false;
        }
        if (!accountNumber.trim() || accountError) {
            Alert.alert("Error", "Please enter valid account number");
            return false;
        }
        if (!ifsc.trim() || ifscError) {
            Alert.alert("Error", "Please enter valid IFSC code");
            return false;
        }
        if (!branchName.trim()) {
            Alert.alert("Error", "Please enter branch name");
            return false;
        }

        if (!profileExists) {
            if (!personPhoto) {
                Alert.alert("Error", "Please upload your photo");
                return false;
            }
            if (!govtIdPhoto) {
                Alert.alert("Error", "Please upload government ID");
                return false;
            }
            if (!outletPhoto) {
                Alert.alert("Error", "Please upload outlet photo");
                return false;
            }
        }

        return true;
    };

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

            const formData = new FormData();

            formData.append("name", name.trim());
            formData.append("contactNo", contactNo);
            formData.append("email", email.trim());
            formData.append("gender", gender);
            formData.append("govtIdType", govtIdType);
            formData.append("govtIdNumber", govtIdNumber.trim());

            formData.append("shopDetails[shopName]", shopName.trim());
            formData.append("shopDetails[businessType]", businessType);
            formData.append("shopDetails[ownershipType]", ownershipType);
            formData.append("shopDetails[GSTNo]", gstNo.trim());
            formData.append("shopDetails[PANCard]", panCard.trim());
            formData.append(
                "shopDetails[shopAddress][address]",
                address1.trim()
            );
            formData.append(
                "shopDetails[shopAddress][address2]",
                address2.trim()
            );
            formData.append("shopDetails[shopAddress][city]", city.trim());
            formData.append("shopDetails[shopAddress][state]", state);
            formData.append("shopDetails[shopAddress][pincode]", pincode);

            const finalBankName =
                bankName === "Other" ? otherBankName : bankName;
            formData.append("bankDetails[bankName]", finalBankName);
            formData.append("bankDetails[accountNumber]", accountNumber.trim());
            formData.append("bankDetails[IFSC]", ifsc.trim());
            formData.append("bankDetails[branchName]", branchName.trim());

            // Upload files only if new
            if (personPhoto && !personPhoto.uri?.startsWith("http")) {
                formData.append("personPhoto", {
                    uri: personPhoto.uri,
                    type: personPhoto.type || "image/jpeg",
                    name: personPhoto.fileName || "person.jpg",
                });
            }

            if (govtIdPhoto && !govtIdPhoto.uri?.startsWith("http")) {
                formData.append("govtIdPhoto", {
                    uri: govtIdPhoto.uri,
                    type:
                        govtIdPhoto.mimeType ||
                        govtIdPhoto.type ||
                        "application/pdf",
                    name: govtIdPhoto.name || "govtid.pdf",
                });
            }

            if (outletPhoto && !outletPhoto.uri?.startsWith("http")) {
                formData.append("outletPhoto", {
                    uri: outletPhoto.uri,
                    type: outletPhoto.type || "image/jpeg",
                    name: outletPhoto.fileName || "outlet.jpg",
                });
            }

            if (registrationForm) {
                formData.append("registrationForm", {
                    uri: registrationForm.uri,
                    type: registrationForm.mimeType || "application/pdf",
                    name: registrationForm.name || "registration.pdf",
                });
            }

            const endpoint = profileExists
                ? `${API_BASE_URL}/retailer/me`
                : `${API_BASE_URL}/admin/retailers`;

            const method = profileExists ? "PATCH" : "POST";

            console.log(
                `📤 ${profileExists ? "Updating" : "Creating"} profile...`
            );

            const response = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ API Error:", data);
                Alert.alert("Error", data.message || "Failed to save profile");
                setSubmitting(false);
                return;
            }

            console.log("✅ Profile saved");
            setShowPennyModal(true);
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to save profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePennyConfirm = (received) => {
        setShowPennyModal(false);
        if (received) setShowSuccessModal(true);
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigation.replace("RetailerDashboard");
    };

    if (loading) {
        return (
            <SafeAreaView
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={{ marginTop: 10, color: "#666" }}>
                    Loading profile...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar style="dark" />

            {/* Header */}
            <Header />

            <View style={styles.headingContainer}>
                <Text style={styles.headingText}>
                    Update Profile
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                <View style={styles.formContainer}>
                    {/* PERSONAL DETAILS */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Personal Details
                        </Text>

                        <PhotoPicker
                            label="Upload Your Photo"
                            photo={personPhoto}
                            onPhotoSelect={setPersonPhoto}
                            onPhotoRemove={() => setPersonPhoto(null)}
                            required={!profileExists}
                        />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Full Name{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                                editable={!lockedFields.includes("name")}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Contact Number{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <View style={styles.otpContainer}>
                                <TextInput
                                    style={[styles.input, styles.otpInput]}
                                    placeholder="10-digit mobile number"
                                    placeholderTextColor="#999"
                                    value={contactNo}
                                    onChangeText={(text) =>
                                        setContactNo(text.replace(/\D/g, ""))
                                    }
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    editable={!otpVerified && !profileExists}
                                />
                                {!otpVerified && !profileExists && (
                                    <TouchableOpacity
                                        style={styles.otpButton}
                                        onPress={handleSendOTP}
                                        disabled={contactNo.length !== 10}
                                    >
                                        <Text style={styles.otpButtonText}>
                                            {resendTimer > 0
                                                ? `Resend (${resendTimer}s)`
                                                : "Send OTP"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {otpVerified && (
                                    <View style={styles.verifiedBadge}>
                                        <Text style={styles.verifiedText}>
                                            ✓ Verified
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {showOtpInput && !otpVerified && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Enter OTP{" "}
                                    <Text style={{ color: "red" }}> *</Text>
                                </Text>
                                <View style={styles.otpContainer}>
                                    <TextInput
                                        style={[styles.input, styles.otpInput]}
                                        placeholder="6-digit OTP"
                                        placeholderTextColor="#999"
                                        value={otp}
                                        onChangeText={(text) =>
                                            setOtp(text.replace(/\D/g, ""))
                                        }
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                    <TouchableOpacity
                                        style={styles.otpButton}
                                        onPress={handleVerifyOTP}
                                        disabled={otp.length !== 6}
                                    >
                                        <Text style={styles.otpButtonText}>
                                            Verify
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 5000 }]}>
                            <Text style={styles.label}>Gender</Text>
                            <DropDownPicker
                                open={genderOpen}
                                value={gender}
                                items={genderOptions}
                                setOpen={setGenderOpen}
                                setValue={setGender}
                                placeholder="Select gender"
                                style={styles.dropdown}
                                dropDownContainerStyle={
                                    styles.dropdownContainer
                                }
                                listMode="SCROLLVIEW"
                                scrollViewProps={{ nestedScrollEnabled: true }}
                            />
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 4000 }]}>
                            <Text style={styles.label}>
                                Government ID Type{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <DropDownPicker
                                open={govtIdTypeOpen}
                                value={govtIdType}
                                items={govtIdOptions}
                                setOpen={setGovtIdTypeOpen}
                                setValue={setGovtIdType}
                                editable={!lockedFields.includes("govtIdType")}
                                placeholder="Select ID type"
                                style={styles.dropdown}
                                dropDownContainerStyle={
                                    styles.dropdownContainer
                                }
                                listMode="SCROLLVIEW"
                                scrollViewProps={{ nestedScrollEnabled: true }}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Government ID Number{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    govtIdError && styles.inputError,
                                ]}
                                placeholder={
                                    govtIdType === "aadhaar"
                                        ? "12-digit Aadhaar"
                                        : govtIdType === "pan"
                                        ? "10-character PAN"
                                        : "Enter ID number"
                                }
                                placeholderTextColor="#999"
                                value={govtIdNumber}
                                onChangeText={validateGovtId}
                                editable={
                                    !lockedFields.includes("govtIdNumber")
                                }
                                autoCapitalize="characters"
                                maxLength={govtIdType === "aadhaar" ? 12 : 20}
                            />
                            {govtIdError ? (
                                <Text style={styles.errorText}>
                                    {govtIdError}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.uploadGroup}>
                            <Text style={styles.label}>
                                Government ID Photo
                            </Text>
                            {!govtIdPhoto ? (
                                <TouchableOpacity
                                    style={styles.uploadButton}
                                    onPress={pickGovtIdPhoto}
                                >
                                    <Text style={styles.uploadButtonText}>
                                        + Upload Document
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.uploadedFile}>
                                    <Text
                                        style={styles.fileName}
                                        numberOfLines={1}
                                    >
                                        {govtIdPhoto.name || "Government ID"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setGovtIdPhoto(null)}
                                    >
                                        <Text style={styles.removeText}>
                                            ✕ Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* SHOP DETAILS */}
                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionTitle}>Shop Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Shop Name{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter shop name"
                                placeholderTextColor="#999"
                                value={shopName}
                                onChangeText={setShopName}
                                editable={!lockedFields.includes("shopName")}
                            />
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 3000 }]}>
                            <Text style={styles.label}>
                                Business Type{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <DropDownPicker
                                open={businessTypeOpen}
                                value={businessType}
                                items={businessTypeOptions}
                                setOpen={setBusinessTypeOpen}
                                setValue={setBusinessType}
                                placeholder="Select business type"
                                editable={
                                    !lockedFields.includes("businessType")
                                }
                                style={styles.dropdown}
                                dropDownContainerStyle={
                                    styles.dropdownContainer
                                }
                                listMode="SCROLLVIEW"
                                scrollViewProps={{ nestedScrollEnabled: true }}
                            />
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                            <Text style={styles.label}>
                                Ownership Type{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <DropDownPicker
                                open={ownershipTypeOpen}
                                value={ownershipType}
                                items={ownershipTypeOptions}
                                setOpen={setOwnershipTypeOpen}
                                setValue={setOwnershipType}
                                editable={
                                    !lockedFields.includes("ownershipType")
                                }
                                placeholder="Select ownership type"
                                style={styles.dropdown}
                                dropDownContainerStyle={
                                    styles.dropdownContainer
                                }
                                listMode="SCROLLVIEW"
                                scrollViewProps={{ nestedScrollEnabled: true }}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>GST Number</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    gstError && styles.inputError,
                                ]}
                                placeholder="Enter 15-character GST (optional)"
                                placeholderTextColor="#999"
                                value={gstNo}
                                onChangeText={validateGST}
                                autoCapitalize="characters"
                                maxLength={15}
                            />
                            {gstError ? (
                                <Text style={styles.errorText}>{gstError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PAN Card Number</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    panError && styles.inputError,
                                ]}
                                placeholder="Enter 10-character PAN (optional)"
                                placeholderTextColor="#999"
                                value={panCard}
                                onChangeText={validatePAN}
                                autoCapitalize="characters"
                                maxLength={10}
                            />
                            {panError ? (
                                <Text style={styles.errorText}>{panError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.uploadGroup}>
                            <Text style={styles.label}>Outlet Photo</Text>
                            {!outletPhoto ? (
                                <TouchableOpacity
                                    style={styles.uploadButton}
                                    onPress={pickOutletPhoto}
                                >
                                    <Text style={styles.uploadButtonText}>
                                        + Upload Photo
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.uploadedFile}>
                                    {outletPhoto.uri?.startsWith("http") ? (
                                        <Image
                                            source={{ uri: outletPhoto.uri }}
                                            style={styles.thumbnail}
                                        />
                                    ) : (
                                        <Image
                                            source={{ uri: outletPhoto.uri }}
                                            style={styles.thumbnail}
                                        />
                                    )}
                                    <TouchableOpacity
                                        onPress={() => setOutletPhoto(null)}
                                    >
                                        <Text style={styles.removeText}>
                                            ✕ Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <Text style={styles.subsectionTitle}>Shop Address</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Address Line 1{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter address"
                                placeholderTextColor="#999"
                                value={address1}
                                onChangeText={setAddress1}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address Line 2</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Landmark, area (optional)"
                                placeholderTextColor="#999"
                                value={address2}
                                onChangeText={setAddress2}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                City <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter city"
                                placeholderTextColor="#999"
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                            <Text style={styles.label}>
                                State <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <DropDownPicker
                                open={stateOpen}
                                value={state}
                                items={stateOptions}
                                setOpen={setStateOpen}
                                setValue={setState}
                                placeholder="Select state"
                                style={styles.dropdown}
                                dropDownContainerStyle={
                                    styles.dropdownContainer
                                }
                                listMode="SCROLLVIEW"
                                scrollViewProps={{ nestedScrollEnabled: true }}
                                searchable={true}
                                searchPlaceholder="Search state..."
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Pincode <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    pincodeError && styles.inputError,
                                ]}
                                placeholder="6-digit pincode"
                                placeholderTextColor="#999"
                                value={pincode}
                                onChangeText={validatePincode}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            {pincodeError ? (
                                <Text style={styles.errorText}>
                                    {pincodeError}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.uploadGroup}>
                            <Text style={styles.label}>
                                Registration Form (Optional)
                            </Text>
                            {!registrationForm ? (
                                <TouchableOpacity
                                    style={styles.uploadButton}
                                    onPress={pickRegistrationForm}
                                >
                                    <Text style={styles.uploadButtonText}>
                                        + Upload Form
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.uploadedFile}>
                                    <Text
                                        style={styles.fileName}
                                        numberOfLines={1}
                                    >
                                        {registrationForm.name ||
                                            "Registration Form"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setRegistrationForm(null)
                                        }
                                    >
                                        <Text style={styles.removeText}>
                                            ✕ Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* BANK DETAILS */}
                    <View style={[styles.section, { zIndex: 1 }]}>
                        <Text style={styles.sectionTitle}>Bank Details</Text>

                        <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                            <Text style={styles.label}>
                                Bank Name{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <DropDownPicker
                                open={bankNameOpen}
                                value={bankName}
                                items={bankOptions}
                                setOpen={setBankNameOpen}
                                setValue={setBankName}
                                placeholder="Select bank"
                                style={styles.dropdown}
                                dropDownContainerStyle={
                                    styles.dropdownContainer
                                }
                                listMode="SCROLLVIEW"
                                scrollViewProps={{ nestedScrollEnabled: true }}
                                searchable={true}
                                searchPlaceholder="Search bank..."
                            />
                        </View>

                        {bankName === "Other" && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Enter Bank Name{" "}
                                    <Text style={{ color: "red" }}> *</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your bank name"
                                    placeholderTextColor="#999"
                                    value={otherBankName}
                                    onChangeText={setOtherBankName}
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Account Number{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account number"
                                placeholderTextColor="#999"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Confirm Account Number{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    accountError && styles.inputError,
                                ]}
                                placeholder="Re-enter account number"
                                placeholderTextColor="#999"
                                value={confirmAccountNumber}
                                onChangeText={validateAccountNumber}
                                keyboardType="number-pad"
                            />
                            {accountError ? (
                                <Text style={styles.errorText}>
                                    {accountError}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                IFSC Code{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    ifscError && styles.inputError,
                                ]}
                                placeholder="11-character IFSC code"
                                placeholderTextColor="#999"
                                value={ifsc}
                                onChangeText={validateIFSC}
                                autoCapitalize="characters"
                                maxLength={11}
                            />
                            {ifscError ? (
                                <Text style={styles.errorText}>
                                    {ifscError}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Branch Name{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter branch name"
                                placeholderTextColor="#999"
                                value={branchName}
                                onChangeText={setBranchName}
                            />
                        </View>
                    </View>

                    {/* SUBMIT */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            submitting && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Update Profile
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* MODALS */}
            <PennyTransferModal
                visible={showPennyModal}
                onClose={() => setShowPennyModal(false)}
                onConfirm={handlePennyConfirm}
                bankDetails={{
                    bankName: bankName === "Other" ? otherBankName : bankName,
                    accountNumber,
                    ifsc,
                }}
            />

            <SuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessClose}
                title="Profile Updated!!"
                message={`Your retailer profile has been updated successfully.`}
            />
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
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "#fff",
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: "#f0f0f0",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    logoSubtext: {
        fontSize: 8,
        color: "#666",
        marginTop: 2,
    },
    headingContainer: {
        backgroundColor: "#fff",
        paddingVertical: 15,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    headingText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#E53935",
    },
    formContainer: {
        padding: 20,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#E53935",
        marginBottom: 15,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginTop: 15,
        marginBottom: 10,
    },
    inputGroup: {
        marginBottom: 15,
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
    inputError: {
        borderColor: "#dc3545",
        borderWidth: 2,
    },
    errorText: {
        color: "#dc3545",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    textArea: {
        height: 70,
        textAlignVertical: "top",
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
        maxHeight: 250,
    },
    otpContainer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    otpInput: {
        flex: 1,
    },
    otpButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
    },
    otpButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    verifiedBadge: {
        backgroundColor: "#28a745",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    verifiedText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    uploadGroup: {
        marginBottom: 15,
    },
    uploadButton: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        backgroundColor: "#fafafa",
    },
    uploadButtonText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "500",
    },
    uploadedFile: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F5F5F5",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    removeText: {
        color: "#dc3545",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 10,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    submitButton: {
        backgroundColor: "#E53935",
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#E53935",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDisabled: {
        backgroundColor: "#FFCDD2",
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CreateRetailerProfileScreen;
