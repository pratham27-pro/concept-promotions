import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchableDropdown from "../../components/common/SearchableDropdown";

import { readAsStringAsync } from "expo-file-system/legacy";
import PennyTransferModal from "../../components/PennyTransferModal";
import SuccessModal from "../../components/SuccessModal";
import DatePicker from "../../components/common/DatePicker";
import FileUpload from "../../components/common/FileUpload";
import Header from "../../components/common/Header";
import PhotoPicker from "../../components/common/PhotoPicker";
import TermsAndConditions from "../../components/data/TermsAndConditions";
import { bankOptions, stateOptions } from "../../components/data/common";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../url/base";

const CreateRetailerProfileScreen = ({ navigation }) => {
    const { markProfileComplete, refreshProfile } = useAuth(); // ✅ Get these from context

    // Loading & Profile States
    const [loading, setLoading] = useState(true);
    const [profileExists, setProfileExists] = useState(false);
    const [retailerId, setRetailerId] = useState(null);

    // Personal Details
    const [name, setName] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [altContactNo, setAltContactNo] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState(null);

    // Gender Dropdown
    const [genderOpen, setGenderOpen] = useState(false);
    const [gender, setGender] = useState(null);
    const [genderOptions] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
        { label: "Prefer not to say", value: "Prefer not to say" },
    ]);

    // Govt ID Type Dropdown
    const [govtIdTypeOpen, setGovtIdTypeOpen] = useState(false);
    const [govtIdType, setGovtIdType] = useState(null);
    const [govtIdOptions] = useState([
        { label: "Aadhaar", value: "aadhaar" },
        { label: "PAN", value: "pan" },
        { label: "Voter ID", value: "voter_id" },
        { label: "Driving License", value: "driving_license" },
        { label: "Other", value: "Other" },
    ]);
    const [govtIdNumber, setGovtIdNumber] = useState("");
    const [govtIdError, setGovtIdError] = useState("");

    // Shop Details
    const [shopName, setShopName] = useState("");

    // Business Type Dropdown
    const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
    const [businessType, setBusinessType] = useState(null);
    const [businessTypeOptions] = useState([
        { label: "Grocery Retailer", value: "Grocery Retailer" },
        { label: "Wholesale", value: "Wholesale" },
        { label: "Key Accounts", value: "Key Accounts" },
        { label: "Salon / Beauty Parlour", value: "Salon / Beauty Parlour" },
        { label: "Self Service Outlet", value: "Self Service Outlet" },
        { label: "Chemist Outlet", value: "Chemist Outlet" },
        { label: "Other", value: "Other" },
    ]);

    // Ownership Type Dropdown
    const [ownershipTypeOpen, setOwnershipTypeOpen] = useState(false);
    const [ownershipType, setOwnershipType] = useState(null);
    const [ownershipTypeOptions] = useState([
        { label: "Sole Proprietorship", value: "Sole Proprietorship" },
        { label: "Partnership", value: "Partnership" },
        { label: "Private Ltd", value: "Private Ltd" },
        { label: "LLP", value: "LLP" },
    ]);

    const [gstNo, setGstNo] = useState("");
    const [gstError, setGstError] = useState("");
    const [panCard, setPanCard] = useState("");
    const [panError, setPanError] = useState("");

    // Shop Address
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [pincodeError, setPincodeError] = useState("");

    // State Dropdown
    const [stateOpen, setStateOpen] = useState(false);
    const [state, setState] = useState(null);

    // Bank Details with Dropdown
    const [bankNameOpen, setBankNameOpen] = useState(false);
    const [bankName, setBankName] = useState(null);
    const [otherBankName, setOtherBankName] = useState("");

    const [accountNumber, setAccountNumber] = useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
    const [accountError, setAccountError] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [ifscError, setIfscError] = useState("");
    const [branchName, setBranchName] = useState("");

    // Track original bank details to detect changes
    const [originalBankDetails, setOriginalBankDetails] = useState({
        bankName: "",
        accountNumber: "",
        ifsc: "",
        branchName: "",
    });
    const isUpdatingFromBackend = useRef(false);

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

    // Penny Check and T&C
    const [pennyCheck, setPennyCheck] = useState(false);
    const [pennyCheckLocked, setPennyCheckLocked] = useState(false);
    const [tnc, setTnc] = useState(false);
    const [tncLocked, setTncLocked] = useState(false);

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

    const [existingPersonPhoto, setExistingPersonPhoto] = useState(null);
    const [existingGovtIdPhoto, setExistingGovtIdPhoto] = useState(null);
    const [existingOutletPhoto, setExistingOutletPhoto] = useState(null);
    const [existingRegistrationForm, setExistingRegistrationForm] =
        useState(null);

    // Format date for input
    const formatDateForInput = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    // Format date for API
    const formatDateForAPI = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    // Sanitize profile for AsyncStorage
    const sanitizeProfile = (data) => {
        return {
            _id: data._id,
            uniqueId: data.uniqueId,
            retailerCode: data.retailerCode,
            name: data.name,
            contactNo: data.contactNo,
            altContactNo: data.altContactNo,
            email: data.email,
            dob: data.dob,
            gender: data.gender,
            govtIdType: data.govtIdType,
            govtIdNumber: data.govtIdNumber,
            phoneVerified: data.phoneVerified,
            tnc: data.tnc,
            pennyCheck: data.pennyCheck,

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
                setRetailerId(clean._id);
                prefillForm(clean);

                // ✅ Fetch images using the backend endpoint
                await fetchImages(token);

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

    // ✅ NEW: Simplified image fetching (Cloudinary URLs)
    const fetchImages = async (token) => {
        try {
            console.log("🔍 Fetching retailer images...");

            // Define all image types
            const imageTypes = [
                "personPhoto",
                "govtIdPhoto",
                "outletPhoto",
                "registrationFormFile",
            ];

            for (const imageType of imageTypes) {
                try {
                    const response = await fetch(
                        `${API_BASE_URL}/retailer/retailer/image/${imageType}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();

                        // ✅ Backend returns { url, fileName, contentType }
                        if (data.url) {
                            console.log(`✅ ${imageType} loaded`);

                            // Set the appropriate state
                            switch (imageType) {
                                case "personPhoto":
                                    setPersonPhoto({
                                        uri: data.url,
                                        fromBackend: true,
                                    });
                                    setExistingPersonPhoto(data.url);
                                    break;
                                case "govtIdPhoto":
                                    setGovtIdPhoto({
                                        uri: data.url,
                                        fromBackend: true,
                                    });
                                    setExistingGovtIdPhoto(data.url);
                                    break;
                                case "outletPhoto":
                                    setOutletPhoto({
                                        uri: data.url,
                                        fromBackend: true,
                                    });
                                    setExistingOutletPhoto(data.url);
                                    break;
                                case "registrationFormFile":
                                    setRegistrationForm({
                                        uri: data.url,
                                        fromBackend: true,
                                    });
                                    setExistingRegistrationForm(data.url);
                                    break;
                            }
                        }
                    } else if (response.status === 404) {
                        console.log(`ℹ️ ${imageType} not found`);
                    } else {
                        console.log(
                            `⚠️ ${imageType} returned status ${response.status}`
                        );
                    }
                } catch (err) {
                    console.error(`❌ Error fetching ${imageType}:`, err);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching images:", error);
        }
    };

    const prefillForm = (data) => {
        isUpdatingFromBackend.current = true;

        if (data.name) setName(data.name);
        if (data.contactNo) setContactNo(data.contactNo);
        if (data.altContactNo) setAltContactNo(data.altContactNo);
        if (data.email) setEmail(data.email);
        if (data.dob) setDob(formatDateForInput(data.dob));
        if (data.gender) setGender(data.gender);
        if (data.govtIdType) setGovtIdType(data.govtIdType);
        if (data.govtIdNumber) setGovtIdNumber(data.govtIdNumber);
        if (data.phoneVerified) setOtpVerified(true);

        // T&C and Penny Check
        const tncValue = data.tnc || false;
        const pennyValue = data.pennyCheck || false;
        setTnc(tncValue);
        setPennyCheck(pennyValue);
        if (tncValue) setTncLocked(true);
        if (pennyValue) setPennyCheckLocked(true);

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
                    setPincode(data.shopDetails.shopAddress.pincode);
                }
            }

            // ❌ REMOVE IMAGE PREFILLING - Images will be fetched separately
            // if (data.shopDetails.outletPhoto)
            //     setOutletPhoto({ uri: data.shopDetails.outletPhoto });
        }

        if (data.bankDetails) {
            const bankDetails = {
                bankName: data.bankDetails.bankName || "",
                accountNumber: data.bankDetails.accountNumber || "",
                ifsc: data.bankDetails.IFSC || "",
                branchName: data.bankDetails.branchName || "",
            };

            if (
                bankOptions.find((b) => b.value === data.bankDetails.bankName)
            ) {
                setBankName(data.bankDetails.bankName);
            } else {
                setBankName("Other");
                setOtherBankName(data.bankDetails.bankName);
            }

            if (data.bankDetails.accountNumber) {
                setAccountNumber(data.bankDetails.accountNumber);
                setConfirmAccountNumber(data.bankDetails.accountNumber);
            }
            if (data.bankDetails.IFSC) setIfsc(data.bankDetails.IFSC);
            if (data.bankDetails.branchName)
                setBranchName(data.bankDetails.branchName);

            setOriginalBankDetails(bankDetails);
        }

        // ❌ REMOVE IMAGE PREFILLING
        // if (data.personPhoto) setPersonPhoto({ uri: data.personPhoto });
        // if (data.govtIdPhoto) setGovtIdPhoto({ uri: data.govtIdPhoto });

        setTimeout(() => {
            isUpdatingFromBackend.current = false;
        }, 100);
    };

    // Detect bank detail changes and unlock penny check
    useEffect(() => {
        if (isUpdatingFromBackend.current) {
            return;
        }
        const bankChanged =
            bankName !== originalBankDetails.bankName ||
            accountNumber !== originalBankDetails.accountNumber ||
            ifsc !== originalBankDetails.ifsc ||
            branchName !== originalBankDetails.branchName;

        if (bankChanged && pennyCheckLocked) {
            setPennyCheck(false);
            setPennyCheckLocked(false);
        }
    }, [
        bankName,
        accountNumber,
        ifsc,
        branchName,
        originalBankDetails,
        pennyCheckLocked,
    ]);

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
        const GST_REGEX =
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (value === "") {
            setGstError("");
        } else if (!GST_REGEX.test(upperValue)) {
            setGstError("Invalid GST Number format (e.g., 29ABCDE1234F1Z5)");
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
        const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (value === "") {
            setIfscError("");
        } else if (!IFSC_REGEX.test(upperValue)) {
            setIfscError("Invalid IFSC Code format (e.g., HDFC0001234)");
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

            if (!result.canceled && result.assets) {
                setGovtIdPhoto(result.assets[0]);
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

            if (!result.canceled && result.assets) {
                setRegistrationForm(result.assets[0]);
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
            setOtpVerified(true);
            Alert.alert("Success", "Contact number verified successfully");
        } catch (error) {
            Alert.alert("Error", "Invalid OTP");
        }
    };

    // Validations
    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return false;
        }
        if (!contactNo || contactNo.length !== 10) {
            Alert.alert("Error", "Please enter a valid contact number");
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

        // T&C validation
        if (!tnc) {
            Alert.alert("Error", "Please accept Terms & Conditions");
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

            const endpoint = `${API_BASE_URL}/retailer/me`;
            const method = "PATCH";
            console.log(method, endpoint);

            const formData = new FormData();

            // Personal details
            formData.append("name", name.trim());
            formData.append("contactNo", contactNo);
            formData.append("email", email.trim());
            formData.append("altContactNo", altContactNo);
            formData.append("dob", dob ? formatDateForAPI(dob) : "");
            formData.append("gender", gender);
            formData.append("govtIdType", govtIdType);
            formData.append("govtIdNumber", govtIdNumber.trim());

            // Shop details
            formData.append("shopName", shopName.trim());
            formData.append("businessType", businessType);
            formData.append("ownershipType", ownershipType);
            formData.append("GSTNo", gstNo.trim());
            formData.append("PANCard", panCard.trim());

            // Shop address
            formData.append("address", address1.trim());
            formData.append("address2", address2.trim());
            formData.append("city", city.trim());
            formData.append("state", state);
            formData.append("pincode", String(pincode.trim()));

            // Bank details
            formData.append(
                "bankName",
                bankName === "Other" ? otherBankName : bankName
            );
            formData.append("accountNumber", accountNumber.trim());
            formData.append("IFSC", ifsc.trim());
            formData.append("branchName", branchName.trim());

            // TC and Penny Check
            formData.append("tnc", tnc.toString());
            formData.append("pennyCheck", pennyCheck.toString());

            // ✅ UPDATED: File upload helper (React Native compatible)
            const addFile = async (fieldName, file, existingUrl) => {
                if (!file) return;

                // Skip if it's an existing backend URL
                if (file.fromBackend || file.uri === existingUrl) {
                    console.log(`⏭️ Skipping ${fieldName} - already uploaded`);
                    return;
                }

                try {
                    let base64Content;

                    if (file.base64) {
                        base64Content = file.base64;
                    } else if (file.uri) {
                        base64Content = await readAsStringAsync(file.uri, {
                            encoding: "base64",
                        });
                    } else {
                        return;
                    }

                    const fileName =
                        file.name ||
                        file.fileName ||
                        `${fieldName}_${Date.now()}.jpg`;
                    const fileType = file.mimeType || file.type || "image/jpeg";

                    // ✅ React Native FormData format
                    formData.append(fieldName, {
                        uri: `data:${fileType};base64,${base64Content}`,
                        type: fileType,
                        name: fileName,
                    });

                    console.log(`✅ Added ${fieldName}`);
                } catch (error) {
                    console.error(`❌ Error adding ${fieldName}:`, error);
                }
            };

            // Add files
            await addFile("personPhoto", personPhoto, existingPersonPhoto);
            await addFile("govtIdPhoto", govtIdPhoto, existingGovtIdPhoto);
            await addFile("outletPhoto", outletPhoto, existingOutletPhoto);
            await addFile(
                "registrationFormFile",
                registrationForm,
                existingRegistrationForm
            );

            console.log("🚀 Sending request...");

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type - FormData sets it automatically
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

            if (!response.ok) {
                throw new Error(
                    data.message || `Server error (${response.status})`
                );
            }

            console.log("✅ Profile saved successfully!");

            // Update state with response
            isUpdatingFromBackend.current = true;
            const r = data.retailer || data;

            // ... (keep all your existing state update logic)
            if (r.name) setName(r.name);
            if (r.email) setEmail(r.email);
            if (r.altContactNo) setAltContactNo(r.altContactNo);
            if (r.dob) setDob(formatDateForInput(r.dob));
            if (r.gender) setGender(r.gender);
            if (r.govtIdType) setGovtIdType(r.govtIdType);
            if (r.govtIdNumber) setGovtIdNumber(r.govtIdNumber);

            if (r.shopDetails) {
                if (r.shopDetails.shopName) setShopName(r.shopDetails.shopName);
                if (r.shopDetails.businessType)
                    setBusinessType(r.shopDetails.businessType);
                if (r.shopDetails.ownershipType)
                    setOwnershipType(r.shopDetails.ownershipType);
                if (r.shopDetails.GSTNo) setGstNo(r.shopDetails.GSTNo);
                if (r.shopDetails.PANCard) setPanCard(r.shopDetails.PANCard);

                if (r.shopDetails.shopAddress) {
                    if (r.shopDetails.shopAddress.address)
                        setAddress1(r.shopDetails.shopAddress.address);
                    if (r.shopDetails.shopAddress.address2)
                        setAddress2(r.shopDetails.shopAddress.address2);
                    if (r.shopDetails.shopAddress.city)
                        setCity(r.shopDetails.shopAddress.city);
                    if (r.shopDetails.shopAddress.state)
                        setState(r.shopDetails.shopAddress.state);
                    if (r.shopDetails.shopAddress.pincode)
                        setPincode(r.shopDetails.shopAddress.pincode);
                }
            }

            if (r.bankDetails) {
                const newBankDetails = {
                    bankName: r.bankDetails.bankName,
                    accountNumber: r.bankDetails.accountNumber,
                    ifsc: r.bankDetails.IFSC,
                    branchName: r.bankDetails.branchName,
                };

                if (
                    bankOptions.find((b) => b.value === r.bankDetails.bankName)
                ) {
                    setBankName(r.bankDetails.bankName);
                    setOtherBankName("");
                } else {
                    setBankName("Other");
                    setOtherBankName(r.bankDetails.bankName);
                }
                setOriginalBankDetails(newBankDetails);
            }

            const tncValue = r.tnc || false;
            const pennyValue = r.pennyCheck || false;

            setTnc(tncValue);
            setPennyCheck(pennyValue);

            if (tncValue) setTncLocked(true);
            if (pennyValue) setPennyCheckLocked(true);

            setProfileExists(true);
            if (r.id) setRetailerId(r.id);

            setTimeout(() => {
                isUpdatingFromBackend.current = false;
            }, 100);

            if (!pennyValue) {
                setShowPennyModal(true);
            } else {
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to save profile. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Penny Transfer confirmation
    const handlePennyConfirm = async (received) => {
        setShowPennyModal(false);

        if (received) {
            // Update penny check status in backend
            try {
                const token = await AsyncStorage.getItem("userToken");

                const response = await fetch(`${API_BASE_URL}/retailer/me`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ pennyCheck: true }),
                });

                if (response.ok) {
                    setPennyCheck(true);
                    setPennyCheckLocked(true);
                    setShowSuccessModal(true);
                    console.log("✅ Penny check verified");
                } else {
                    Alert.alert("Error", "Failed to verify penny transfer");
                }
            } catch (error) {
                console.error("Error updating penny check:", error);
                Alert.alert("Error", "Failed to verify penny transfer");
            }
        }
    };

    const handleSuccessClose = async () => {
        setShowSuccessModal(false);
        await markProfileComplete();
        await refreshProfile();

        navigation.replace("RetailerTabs");
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

            <Header showBackButton={false} />

            <View style={styles.headingContainer}>
                <Text style={styles.headingText}>
                    {profileExists ? "Update Profile" : "Retailer Registration"}
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
                            <Text style={styles.label}>
                                Alternate Contact Number
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="10-digit mobile number"
                                placeholderTextColor="#999"
                                value={altContactNo}
                                onChangeText={(text) =>
                                    setAltContactNo(text.replace(/\D/g, ""))
                                }
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>

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

                        <DatePicker
                            label="Date of Birth"
                            value={dob}
                            onChange={setDob}
                            placeholder="Select date of birth"
                            maximumDate={new Date()}
                            mode="date"
                            format="date"
                        />

                        <View style={[styles.inputGroup, { zIndex: 5000 }]}>
                            <Text style={styles.label}>Gender</Text>
                            <SearchableDropdown
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
                            <SearchableDropdown
                                open={govtIdTypeOpen}
                                value={govtIdType}
                                items={govtIdOptions}
                                setOpen={setGovtIdTypeOpen}
                                setValue={setGovtIdType}
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
                            />
                        </View>

                        <View style={[styles.inputGroup, { zIndex: 3000 }]}>
                            <Text style={styles.label}>
                                Business Type{" "}
                                <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <SearchableDropdown
                                open={businessTypeOpen}
                                value={businessType}
                                items={businessTypeOptions}
                                setOpen={setBusinessTypeOpen}
                                setValue={setBusinessType}
                                placeholder="Select business type"
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
                            <SearchableDropdown
                                open={ownershipTypeOpen}
                                value={ownershipType}
                                items={ownershipTypeOptions}
                                setOpen={setOwnershipTypeOpen}
                                setValue={setOwnershipType}
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

                        <FileUpload
                            label="Outlet Photo"
                            file={outletPhoto}
                            onFileSelect={setOutletPhoto}
                            onFileRemove={() => setOutletPhoto(null)}
                            accept="image"
                            required={!profileExists}
                        />

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

                        <View style={[styles.inputGroup, { zIndex: 5000 }]}>
                            <Text style={styles.label}>
                                State <Text style={{ color: "red" }}> *</Text>
                            </Text>
                            <SearchableDropdown
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
                                maxHeight={250}
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
                            <SearchableDropdown
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

                        {/* Penny Check Status Display */}
                        {pennyCheckLocked && (
                            <View style={styles.verificationBadge}>
                                <Text style={styles.verificationText}>
                                    ✓ Bank account verified with penny transfer
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Terms & Conditions */}
                    <TermsAndConditions
                        accepted={tnc}
                        onAcceptChange={setTnc}
                        locked={tncLocked}
                        required={true}
                    />

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
                                {profileExists
                                    ? "Update Profile"
                                    : "Create Profile"}
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
                title={profileExists ? "Profile Updated!" : "Profile Created!"}
                message={`Your retailer profile has been ${
                    profileExists ? "updated" : "created"
                } successfully.`}
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
    verificationBadge: {
        backgroundColor: "#E8F5E9",
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#28a745",
        marginTop: 10,
    },
    verificationText: {
        color: "#28a745",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
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
