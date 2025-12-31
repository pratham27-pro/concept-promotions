import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
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

// Import reusable components
import FileUpload from "../../components/common/FileUpload";
import GradientButton from "../../components/common/GradientButton";
import Header from "../../components/common/Header";
import PhotoPicker from "../../components/common/PhotoPicker";
import SearchableDropdown from "../../components/common/SearchableDropdown";

// Import modals
import PennyTransferModal from "../../components/PennyTransferModal";
import SuccessModal from "../../components/SuccessModal";
import TermsAndConditions from "../../components/data/TermsAndConditions";

// Import AuthContext
import DatePicker from "../../components/common/DatePicker";
import { bankOptions, stateOptions } from "../../components/data/common";
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
    const [co_stateOpen, setCoStateOpen] = useState(false);
    const [co_state, setCoState] = useState("");
    const [co_city, setCoCity] = useState("");
    const [co_pincode, setCoPincode] = useState("");

    // Permanent Address
    const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);
    const [p_address1, setPAddress1] = useState("");
    const [p_address2, setPAddress2] = useState("");
    const [p_stateOpen, setPStateOpen] = useState(false);
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

    // Bank Details with Dropdown
    const [bankNameOpen, setBankNameOpen] = useState(false);
    const [bankName, setBankName] = useState(null);
    const [otherBankName, setOtherBankName] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [confirmBankAccount, setConfirmBankAccount] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [branchName, setBranchName] = useState("");

    // Track original bank details to detect changes
    const [originalBankDetails, setOriginalBankDetails] = useState({
        bankName: "",
        accountNumber: "",
        ifsc: "",
        branchName: "",
    });
    const isUpdatingFromBackend = useRef(false);

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

    // Penny Check and T&C
    const [pennyCheck, setPennyCheck] = useState(false);
    const [pennyCheckLocked, setPennyCheckLocked] = useState(false);
    const [tnc, setTnc] = useState(false);
    const [tncLocked, setTncLocked] = useState(false);

    // Modals
    const [showPennyModal, setShowPennyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Password Change
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loadingImages, setLoadingImages] = useState(false);

    // Fetch employee profile on mount
    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                await fetchEmployeeProfile();
                // After profile loads, fetch documents
                await fetchEmployeeDocuments();
            };
            loadProfile();
        }, [])
    );

    // useEffect(() => {
    //     return () => {
    //         Object.values(imageUrls).forEach((url) => {
    //             if (url && url.startsWith("blob:")) {
    //                 URL.revokeObjectURL(url);
    //             }
    //         });
    //     };
    // }, [imageUrls]);

    // ✅ FINAL PRODUCTION VERSION - Fetch employee documents
    // ✅ FINAL WORKING VERSION - Fetch employee documents
    const fetchEmployeeDocuments = async () => {
        try {
            setLoadingImages(true);
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                console.error("❌ No token found");
                return;
            }

            console.log("🔍 Attempting to fetch employee documents...");

            const documentMap = {
                personPhoto: { setter: setPersonPhoto, name: "Person Photo" },
                aadhaarFront: {
                    setter: setAadhaarFile1,
                    name: "Aadhaar Front",
                },
                aadhaarBack: { setter: setAadhaarFile2, name: "Aadhaar Back" },
                panCard: { setter: setPanFile, name: "PAN Card" },
                bankProof: { setter: setBankProofFile, name: "Bank Proof" },
                familyPhoto: { setter: setFamilyPhoto, name: "Family Photo" },
                pfForm: { setter: setPfForm, name: "PF Form" },
                esiForm: { setter: setEsiForm, name: "ESI Form" },
                employmentForm: {
                    setter: setEmploymentForm,
                    name: "Employment Form",
                },
                cv: { setter: setCv, name: "CV" },
            };

            // Helper function to fetch using XMLHttpRequest
            const fetchDocument = (url, token) => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = "blob";

                    xhr.onload = () => {
                        console.log(`📥 Response for ${url}: ${xhr.status}`);

                        if (xhr.status === 200) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                resolve({
                                    success: true,
                                    base64: reader.result,
                                    status: xhr.status,
                                });
                            };
                            reader.onerror = () =>
                                reject(new Error("FileReader error"));
                            reader.readAsDataURL(xhr.response);
                        } else if (xhr.status === 404) {
                            resolve({ success: false, status: 404 });
                        } else {
                            console.error(
                                `❌ Unexpected status ${xhr.status} for ${url}`
                            );
                            resolve({ success: false, status: xhr.status });
                        }
                    };

                    xhr.onerror = () => {
                        console.error(`❌ Network error for ${url}`);
                        reject(new Error("Network error"));
                    };

                    xhr.open("GET", url);
                    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                    xhr.send();
                });
            };

            for (const [type, config] of Object.entries(documentMap)) {
                try {
                    const url = `${API_BASE_URL}/employee/employee/document/${type}`;
                    console.log(`🔍 Fetching: ${url}`);

                    const result = await fetchDocument(url, token);

                    if (result.success) {
                        config.setter({
                            uri: result.base64,
                            name: config.name,
                            fromBackend: true,
                        });
                        console.log(`✅ ${type} loaded successfully`);
                    } else if (result.status === 404) {
                        console.log(`ℹ️ ${type} not found (not uploaded yet)`);
                    } else {
                        console.log(
                            `⚠️ ${type} returned status ${result.status}`
                        );
                    }
                } catch (err) {
                    console.error(`❌ Error fetching ${type}:`, err);
                }
            }

            console.log("✅ Document fetch complete");
        } catch (error) {
            console.error("❌ Error in fetchEmployeeDocuments:", error);
        } finally {
            setLoadingImages(false);
        }
    };

    const fetchEmployeeProfile = async () => {
        try {
            setLoading(true);

            if (userProfile) {
                if (userProfile.name) setName(userProfile.name);
                if (userProfile.email) setEmail(userProfile.email);
                if (userProfile.phone) setPhone(userProfile.phone);

                setEmployeeType(userProfile.employeeType || "");
                prefillForm(userProfile);
                setLoading(false);

                // ✅ Fetch documents after profile loads from context
                await fetchEmployeeDocuments();
                return;
            }

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

            if (response.ok && responseData) {
                const data = responseData.employee || responseData;

                setProfileData(data);

                if (data.name) setName(data.name);
                if (data.email) setEmail(data.email);
                if (data.phone) setPhone(data.phone);

                setEmployeeType(data.employeeType || "");
                prefillForm(data);

                console.log("✅ Employee profile loaded");
                setLoading(false);

                // ✅ Fetch documents after profile loads from API
                await fetchEmployeeDocuments();
            } else {
                throw new Error(
                    responseData.message || "Failed to fetch profile"
                );
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile. Please try again.");
            setLoading(false);
        }
    };

    const prefillForm = (data) => {
        isUpdatingFromBackend.current = true;

        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.dob) setDob(data.dob);
        if (data.gender) setGender(data.gender);
        if (data.alternatePhone) setAlternatePhone(data.alternatePhone);
        if (data.highestQualification)
            setHighestQualification(data.highestQualification);
        if (data.maritalStatus) setMaritalStatus(data.maritalStatus);

        // T&C and Penny Check
        const tncValue = data.tnc || false;
        const pennyValue = data.pennyCheck || false;
        setTnc(tncValue);
        setPennyCheck(pennyValue);
        if (tncValue) setTncLocked(true);
        if (pennyValue) setPennyCheckLocked(true);

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
                setBankAccount(data.bankDetails.accountNumber);
                setConfirmBankAccount(data.bankDetails.accountNumber);
            }
            if (data.bankDetails.IFSC) setIfsc(data.bankDetails.IFSC);
            if (data.bankDetails.branchName)
                setBranchName(data.bankDetails.branchName);

            setOriginalBankDetails(bankDetails);
        }

        // ✅ Files - Convert backend URLs to proper format
        // if (data.personPhoto) {
        //     setPersonPhoto(data.personPhoto); // Just the string URL
        // }

        // if (data.aadhaarFront) {
        //     setAadhaarFile1({ uri: data.aadhaarFront, name: "Aadhaar Front" });
        // }

        // if (data.aadhaarBack) {
        //     setAadhaarFile2({ uri: data.aadhaarBack, name: "Aadhaar Back" });
        // }

        // if (data.panCard) {
        //     setPanFile({ uri: data.panCard, name: "PAN Card" });
        // }

        // if (data.bankProof) {
        //     setBankProofFile({ uri: data.bankProof, name: "Bank Proof" });
        // }

        // if (data.familyPhoto) {
        //     setFamilyPhoto({ uri: data.familyPhoto, name: "Family Photo" });
        // }

        // if (data.pfForm) {
        //     setPfForm({ uri: data.pfForm, name: "PF Form" });
        // }

        // if (data.esiForm) {
        //     setEsiForm({ uri: data.esiForm, name: "ESI Form" });
        // }

        // if (data.employmentForm) {
        //     setEmploymentForm({
        //         uri: data.employmentForm,
        //         name: "Employment Form",
        //     });
        // }

        // if (data.cv) {
        //     setCv({ uri: data.cv, name: "CV" });
        // }

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
            bankAccount !== originalBankDetails.accountNumber ||
            ifsc !== originalBankDetails.ifsc ||
            branchName !== originalBankDetails.branchName;

        if (bankChanged && pennyCheckLocked) {
            setPennyCheck(false);
            setPennyCheckLocked(false);
        }
    }, [
        bankName,
        bankAccount,
        ifsc,
        branchName,
        originalBankDetails,
        pennyCheckLocked,
    ]);

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
        if (!bankName) {
            Alert.alert("Error", "Please select bank");
            return false;
        }
        if (bankName === "Other" && !otherBankName.trim()) {
            Alert.alert("Error", "Please enter bank name");
            return false;
        }
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
        if (!branchName) {
            Alert.alert("Error", "Please enter branch name");
            return false;
        }

        // T&C validation
        if (!tnc) {
            Alert.alert("Error", "Please accept Terms & Conditions");
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

            const endpoint = `${API_BASE_URL}/employee/employee/profile`;

            console.log(`📤 PUT ${endpoint}`);

            // ✅ Build multipart form data manually
            const boundary = `----WebKitFormBoundary${Math.random()
                .toString(36)
                .substring(2)}`;
            let bodyParts = [];

            // Helper to add text field
            const addField = (name, value) => {
                bodyParts.push(
                    `--${boundary}\r\n` +
                        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
                        `${value}`
                );
            };

            // ✅ UPDATED: Helper to add file field with proper skip logic
            const addFile = async (fieldName, file) => {
                if (!file) {
                    console.log(`⚠️ Skipping ${fieldName} - no file`);
                    return false;
                }

                // ✅ Skip if it's from backend (already uploaded)
                if (file.fromBackend) {
                    console.log(
                        `⚠️ Skipping ${fieldName} - already uploaded (from backend)`
                    );
                    return false;
                }

                // ✅ Skip if it's a string URL
                if (typeof file === "string") {
                    console.log(
                        `⚠️ Skipping ${fieldName} - already uploaded (string URL)`
                    );
                    return false;
                }

                // ✅ Skip if it's an HTTP URL
                if (file.uri && file.uri.startsWith("http")) {
                    console.log(
                        `⚠️ Skipping ${fieldName} - already uploaded (HTTP URL)`
                    );
                    return false;
                }

                // ✅ It's a new local file, upload it
                try {
                    const fileContent = await FileSystem.readAsStringAsync(
                        file.uri,
                        {
                            encoding: "base64",
                        }
                    );

                    const fileName =
                        file.name ||
                        file.fileName ||
                        `${fieldName}.${
                            file.mimeType?.includes("image") ? "jpg" : "pdf"
                        }`;
                    const fileType =
                        file.mimeType || file.type || "application/pdf";

                    bodyParts.push(
                        `--${boundary}\r\n` +
                            `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n` +
                            `Content-Type: ${fileType}\r\n` +
                            `Content-Transfer-Encoding: base64\r\n\r\n` +
                            fileContent
                    );

                    console.log(`✅ Added ${fieldName}`);
                    return true;
                } catch (error) {
                    console.error(`❌ Error reading file ${fieldName}:`, error);
                    Alert.alert(
                        "Error",
                        `Failed to read ${fieldName}. Please try again.`
                    );
                    return false;
                }
            };

            // Add all text fields
            addField("gender", gender);
            addField("dob", dob);
            if (alternatePhone) addField("alternatePhone", alternatePhone);
            addField("aadhaarNumber", aadhaarNumber);

            // Correspondence Address
            addField("correspondenceAddress.addressLine1", co_address1);
            if (co_address2)
                addField("correspondenceAddress.addressLine2", co_address2);
            addField("correspondenceAddress.state", co_state);
            addField("correspondenceAddress.city", co_city);
            addField("correspondenceAddress.pincode", co_pincode);

            // Permanent Address
            addField("permanentAddress.addressLine1", p_address1);
            if (p_address2)
                addField("permanentAddress.addressLine2", p_address2);
            addField("permanentAddress.state", p_state);
            addField("permanentAddress.city", p_city);
            addField("permanentAddress.pincode", p_pincode);

            // Bank details
            const finalBankName =
                bankName === "Other" ? otherBankName : bankName;
            addField("bankDetails.bankName", finalBankName);
            addField("bankDetails.accountNumber", bankAccount);
            addField("bankDetails.ifsc", ifsc);
            addField("bankDetails.branchName", branchName);

            // T&C and Penny Check
            addField("tnc", tnc.toString());
            addField("pennyCheck", pennyCheck.toString());

            // Permanent employee specific fields
            if (employeeType === "Permanent") {
                addField("highestQualification", highestQualification);
                addField("maritalStatus", maritalStatus);
                addField("panNumber", panNumber);
                addField("fathersName", fathersName);
                if (fatherDob) addField("fatherDob", fatherDob);
                addField("motherName", motherName);
                if (motherDob) addField("motherDob", motherDob);
                if (spouseName) addField("spouseName", spouseName);
                if (spouseDob) addField("spouseDob", spouseDob);
                if (child1Name) addField("child1Name", child1Name);
                if (child1Dob) addField("child1Dob", child1Dob);
                if (child2Name) addField("child2Name", child2Name);
                if (child2Dob) addField("child2Dob", child2Dob);
                addField("uanNumber", uanNumber);
                addField("pfNumber", pfNumber);
                addField("esiNumber", esiNumber);
                if (esiDispensary) addField("esiDispensary", esiDispensary);
                addField("experiences", JSON.stringify(experiences));
            }

            // Contractual specific
            if (employeeType === "Contractual" && contractLength) {
                addField("contractLength", contractLength);
            }

            // Password change
            if (newPassword) {
                addField("newPassword", newPassword);
            }

            // Add files
            console.log("📸 Adding person photo");
            await addFile("personPhoto", personPhoto);

            console.log("📄 Adding aadhaar files");
            await addFile("aadhaarFront", aadhaarFile1);
            await addFile("aadhaarBack", aadhaarFile2);

            console.log("📄 Adding bank proof");
            await addFile("bankProof", bankProofFile);

            if (employeeType === "Permanent") {
                console.log("📄 Adding permanent employee files");
                await addFile("panCard", panFile);
                if (familyPhoto) await addFile("familyPhoto", familyPhoto);
                await addFile("pfForm", pfForm);
                await addFile("esiForm", esiForm);
                if (employmentForm)
                    await addFile("employmentForm", employmentForm);
                if (cv) await addFile("cv", cv);
            }

            // Combine all parts and close boundary
            const body = bodyParts.join("\r\n") + `\r\n--${boundary}--\r\n`;

            console.log("🚀 Sending request...");

            // Send with fetch
            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": `multipart/form-data; boundary=${boundary}`,
                },
                body: body,
            });

            console.log("📥 Response status:", response.status);

            const responseText = await response.text();
            // console.log("📄 Response:", responseText.substring(0, 200));

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("❌ JSON parse error:", e);
                throw new Error("Invalid server response");
            }

            if (!response.ok) {
                throw new Error(
                    data.message || `Server error: ${response.status}`
                );
            }

            console.log("✅ Profile saved successfully!");

            // Update state with response
            isUpdatingFromBackend.current = true;

            const r = data.employee || data;

            if (r.bankDetails) {
                const newBankDetails = {
                    bankName: r.bankDetails.bankName || "",
                    accountNumber: r.bankDetails.accountNumber || "",
                    ifsc: r.bankDetails.IFSC || "",
                    branchName: r.bankDetails.branchName || "",
                };

                if (
                    bankOptions.find((b) => b.value === r.bankDetails.bankName)
                ) {
                    setBankName(r.bankDetails.bankName);
                    setOtherBankName("");
                } else {
                    setBankName("Other");
                    setOtherBankName(r.bankDetails.bankName || "");
                }
                setOriginalBankDetails(newBankDetails);
            }

            const tncValue = r.tnc || false;
            const pennyValue = r.pennyCheck || false;
            setTnc(tncValue);
            setPennyCheck(pennyValue);

            if (tncValue) setTncLocked(true);
            if (pennyValue) setPennyCheckLocked(true);

            setTimeout(() => {
                isUpdatingFromBackend.current = false;
            }, 100);

            // Show Penny Modal if not already verified
            if (!pennyValue) {
                setShowPennyModal(true);
            } else {
                setShowSuccessModal(true);
            }
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

    const handlePennyConfirm = async (received) => {
        setShowPennyModal(false);

        if (received) {
            // Update penny check status in backend
            try {
                const token = await AsyncStorage.getItem("userToken");

                const response = await fetch(
                    `${API_BASE_URL}/employee/employee/profile`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ pennyCheck: true }),
                    }
                );

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

                        <DatePicker
                            label="Date of Birth"
                            value={dob}
                            onChange={setDob}
                            placeholder="Select date of birth"
                            maximumDate={new Date()}
                            mode="date"
                            format="date"
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

                        <SearchableDropdown
                            label="State"
                            placeholder="Select state"
                            open={co_stateOpen}
                            value={co_state}
                            items={stateOptions}
                            setOpen={setCoStateOpen}
                            setValue={setCoState}
                            required={true}
                            zIndex={4000}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="City *"
                            placeholderTextColor="#999"
                            value={co_city}
                            onChangeText={setCoCity}
                        />

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

                        <SearchableDropdown
                            label="State"
                            placeholder="Select state"
                            open={p_stateOpen}
                            value={p_state}
                            items={stateOptions}
                            setOpen={setPStateOpen}
                            setValue={setPState}
                            required={true}
                            zIndex={3000}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="City *"
                            placeholderTextColor="#999"
                            value={p_city}
                            onChangeText={setPCity}
                        />

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

                            <DatePicker
                                label="Father's DOB"
                                value={fatherDob}
                                onChange={setFatherDob}
                                placeholder="Select date of birth"
                                maximumDate={new Date()}
                                mode="date"
                                format="date"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Mother's Name *"
                                placeholderTextColor="#999"
                                value={motherName}
                                onChangeText={setMotherName}
                            />

                            <DatePicker
                                label="Mother's DOB"
                                value={motherDob}
                                onChange={setMotherDob}
                                placeholder="Select date of birth"
                                maximumDate={new Date()}
                                mode="date"
                                format="date"
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

                                    <DatePicker
                                        label="Spouse's DOB"
                                        value={spouseDob}
                                        onChange={setSpouseDob}
                                        placeholder="Select date of birth"
                                        maximumDate={new Date()}
                                        mode="date"
                                        format="date"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Child 1 Name"
                                        placeholderTextColor="#999"
                                        value={child1Name}
                                        onChangeText={setChild1Name}
                                    />

                                    <DatePicker
                                        label="Child 1 DOB"
                                        value={child1Dob}
                                        onChange={setChild1Dob}
                                        placeholder="Select date of birth"
                                        maximumDate={new Date()}
                                        mode="date"
                                        format="date"
                                    />

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Child 2 Name"
                                        placeholderTextColor="#999"
                                        value={child2Name}
                                        onChangeText={setChild2Name}
                                    />

                                    <DatePicker
                                        label="Child 2 DOB"
                                        value={child2Dob}
                                        onChange={setChild2Dob}
                                        placeholder="Select date of birth"
                                        maximumDate={new Date()}
                                        mode="date"
                                        format="date"
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

                        <SearchableDropdown
                            label="Bank Name"
                            placeholder="Select bank"
                            open={bankNameOpen}
                            value={bankName}
                            items={bankOptions}
                            setOpen={setBankNameOpen}
                            setValue={setBankName}
                            required={true}
                            zIndex={2000}
                        />

                        {bankName === "Other" && (
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Bank Name *"
                                placeholderTextColor="#999"
                                value={otherBankName}
                                onChangeText={setOtherBankName}
                            />
                        )}

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

                    {/* Terms & Conditions */}
                    <TermsAndConditions
                        accepted={tnc}
                        onAcceptChange={setTnc}
                        locked={tncLocked}
                        required={true}
                    />

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
                    bankName: bankName === "Other" ? otherBankName : bankName,
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
    tncContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        gap: 10,
    },
    tncText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    lockedText: {
        fontSize: 12,
        color: "#28a745",
        fontWeight: "600",
        marginBottom: 10,
    },
});

export default CompleteEmployeeProfileScreen;
