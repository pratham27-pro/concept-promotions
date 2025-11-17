import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import DropDownPicker from "react-native-dropdown-picker";

const CreateRetailerProfileScreen = ({ navigation }) => {
    // Personal Details
    const [name, setName] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [altContactNo, setAltContactNo] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState(null);
    const [govtIdType, setGovtIdType] = useState(null);
    const [govtIdNumber, setGovtIdNumber] = useState("");

    // Shop Details
    const [shopName, setShopName] = useState("");
    const [businessType, setBusinessType] = useState(null);
    const [ownershipType, setOwnershipType] = useState(null);
    const [gstNo, setGstNo] = useState("");
    const [panCard, setPanCard] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState(null);
    const [pincode, setPincode] = useState("");

    // Bank Details
    const [bankName, setBankName] = useState(null);
    const [accountNumber, setAccountNumber] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [branchName, setBranchName] = useState("");

    // Files/Photos
    const [personPhoto, setPersonPhoto] = useState(null);
    const [govtIdPhoto, setGovtIdPhoto] = useState(null);
    const [outletPhoto, setOutletPhoto] = useState(null);
    const [registrationFormFile, setRegistrationFormFile] = useState(null);

    // Dropdown states
    const [genderOpen, setGenderOpen] = useState(false);
    const [idTypeOpen, setIdTypeOpen] = useState(false);
    const [businessTypeOpen, setBusinessTypeOpen] = useState(false);
    const [ownershipTypeOpen, setOwnershipTypeOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const [bankOpen, setBankOpen] = useState(false);

    // Loading state
    const [submitting, setSubmitting] = useState(false);

    // otp and verification
    const [otp, setOtp] = useState("");
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [contactError, setContactError] = useState("");

    // regex
    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const GST_REGEX =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const PHONE_REGEX = /^[6-9][0-9]{9}$/;
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

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

    const validatePhone = (value) => {
        setContactNo(value);
        if (value && !PHONE_REGEX.test(value)) {
            setContactError("Invalid phone number (must start with 6-9)");
        } else {
            setContactError("");
        }
        // Reset verification if number changes
        if (isPhoneVerified) {
            setIsPhoneVerified(false);
            setShowOtpInput(false);
        }
    };

    const validateIFSC = (value) => {
        const upperValue = value.toUpperCase();
        setIfsc(upperValue);
        if (value && !IFSC_REGEX.test(upperValue)) {
            setIfscError("Invalid IFSC code (e.g., SBIN0001234)");
        } else {
            setIfscError("");
        }
    };

    const sendOTP = () => {
        if (!PHONE_REGEX.test(contactNo)) {
            setContactError("Please enter a valid 10-digit mobile number");
            return;
        }
        // TODO: Implement actual OTP sending logic here
        setShowOtpInput(true);
        // Simulate OTP sent
        alert("OTP sent to " + contactNo);
    };

    const verifyOTP = () => {
        // TODO: Implement actual OTP verification logic here
        if (otp.length === 6) {
            setIsPhoneVerified(true);
            alert("Phone number verified successfully!");
        } else {
            alert("Please enter a valid 6-digit OTP");
        }
    };

    // Dropdown options
    const [genderOptions] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
        { label: "Prefer not to say", value: "Prefer not to say" },
    ]);

    const [idTypeOptions] = useState([
        { label: "Aadhaar", value: "Aadhaar" },
        { label: "PAN", value: "PAN" },
        { label: "Voter ID", value: "Voter ID" },
        { label: "Driving License", value: "Driving License" },
        { label: "Other", value: "Other" },
    ]);

    const [businessTypeOptions] = useState([
        { label: "Grocery Retailer", value: "Grocery Retailer" },
        { label: "Wholesale", value: "Wholesale" },
        { label: "Key Accounts", value: "Key Accounts" },
        { label: "Salon / Beauty Parlour", value: "Salon / Beauty Parlour" },
        { label: "Self Service Outlet", value: "Self Service Outlet" },
        { label: "Chemist Outlet", value: "Chemist Outlet" },
        { label: "Other", value: "Other" },
    ]);

    const [ownershipTypeOptions] = useState([
        { label: "Sole Proprietorship", value: "Sole Proprietorship" },
        { label: "Partnership", value: "Partnership" },
        { label: "Private Ltd", value: "Private Ltd" },
        { label: "LLP", value: "LLP" },
    ]);

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
        { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
        { label: "Ladakh", value: "Ladakh" },
        { label: "Puducherry", value: "Puducherry" },
        { label: "Chandigarh", value: "Chandigarh" },
        {
            label: "Andaman and Nicobar Islands",
            value: "Andaman and Nicobar Islands",
        },
        {
            label: "Dadra and Nagar Haveli and Daman and Diu",
            value: "Dadra and Nagar Haveli and Daman and Diu",
        },
        { label: "Lakshadweep", value: "Lakshadweep" },
    ]);

    const [bankOptions] = useState([
        { label: "HDFC Bank", value: "HDFC Bank" },
        { label: "State Bank of India", value: "State Bank of India" },
        { label: "ICICI Bank", value: "ICICI Bank" },
        { label: "Axis Bank", value: "Axis Bank" },
        { label: "Kotak Mahindra Bank", value: "Kotak Mahindra Bank" },
        { label: "Punjab National Bank", value: "Punjab National Bank" },
        { label: "Other", value: "Other" },
    ]);

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert(
                        "Permission Required",
                        "Camera roll permissions are required!"
                    );
                }
            }
        })();
    }, []);

    // Pick profile photo
    const pickPersonPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setPersonPhoto(result.assets[0]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    // Pick govt ID photo
    const pickGovtIdPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled) {
                setGovtIdPhoto(result.assets[0]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    // Pick outlet photo
    const pickOutletPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled) {
                setOutletPhoto(result.assets[0]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    // Pick registration form document
    const pickRegistrationForm = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.type !== "cancel") {
                setRegistrationFormFile(result);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    // Validate form
    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert("Validation Error", "Please enter your name");
            return false;
        }
        if (!contactNo.trim() || contactNo.length !== 10) {
            Alert.alert(
                "Validation Error",
                "Please enter a valid 10-digit contact number"
            );
            return false;
        }
        // if (!email.trim() || !email.includes("@")) {
        //     Alert.alert("Validation Error", "Please enter a valid email");
        //     return false;
        // }
        // if (!dob) {
        //     Alert.alert("Validation Error", "Please enter your date of birth");
        //     return false;
        // }
        // if (!gender) {
        //     Alert.alert("Validation Error", "Please select your gender");
        //     return false;
        // }
        if (!govtIdType) {
            Alert.alert("Validation Error", "Please select ID type");
            return false;
        }
        if (!govtIdNumber.trim()) {
            Alert.alert("Validation Error", "Please enter ID number");
            return false;
        }
        if (!shopName.trim()) {
            Alert.alert("Validation Error", "Please enter shop name");
            return false;
        }
        if (!businessType) {
            Alert.alert("Validation Error", "Please select business type");
            return false;
        }
        if (!ownershipType) {
            Alert.alert("Validation Error", "Please select ownership type");
            return false;
        }
        if (!address1.trim()) {
            Alert.alert("Validation Error", "Please enter address");
            return false;
        }
        if (!city.trim()) {
            Alert.alert("Validation Error", "Please enter city");
            return false;
        }
        if (!state) {
            Alert.alert("Validation Error", "Please select state");
            return false;
        }
        if (!pincode.trim() || pincode.length !== 6) {
            Alert.alert(
                "Validation Error",
                "Please enter a valid 6-digit pincode"
            );
            return false;
        }
        if (!bankName) {
            Alert.alert("Validation Error", "Please select bank name");
            return false;
        }
        if (!accountNumber.trim()) {
            Alert.alert("Validation Error", "Please enter account number");
            return false;
        }
        if (!ifsc.trim()) {
            Alert.alert("Validation Error", "Please enter IFSC code");
            return false;
        }
        if (!personPhoto) {
            Alert.alert("Validation Error", "Please upload your photo");
            return false;
        }
        return true;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // TODO: Replace with your actual API endpoint
            const formData = new FormData();

            // Personal details
            formData.append("name", name);
            formData.append("contactNo", contactNo);
            formData.append("altContactNo", altContactNo || "");
            formData.append("email", email);
            formData.append("dob", dob);
            formData.append("gender", gender);
            formData.append("govtIdType", govtIdType);
            formData.append("govtIdNumber", govtIdNumber);

            // Shop details
            formData.append("shopDetails.shopName", shopName);
            formData.append("shopDetails.businessType", businessType);
            formData.append("shopDetails.ownershipType", ownershipType);
            formData.append("shopDetails.GSTNo", gstNo);
            formData.append("shopDetails.PANCard", panCard);
            formData.append("shopDetails.shopAddress.address", address1);
            formData.append("shopDetails.shopAddress.city", city);
            formData.append("shopDetails.shopAddress.state", state);

            // Bank details
            formData.append("bankDetails.bankName", bankName);
            formData.append("bankDetails.accountNumber", accountNumber);
            formData.append("bankDetails.IFSC", ifsc);
            formData.append("bankDetails.branchName", branchName);

            // Photos/Documents
            if (personPhoto) {
                formData.append("personPhoto", {
                    uri: personPhoto.uri,
                    type: "image/jpeg",
                    name: "person_photo.jpg",
                });
            }

            if (govtIdPhoto) {
                formData.append("govtIdPhoto", {
                    uri: govtIdPhoto.uri,
                    type: "image/jpeg",
                    name: "govt_id.jpg",
                });
            }

            if (outletPhoto) {
                formData.append("outletPhoto", {
                    uri: outletPhoto.uri,
                    type: "image/jpeg",
                    name: "outlet_photo.jpg",
                });
            }

            // Simulated API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            Alert.alert("Success", "Profile created successfully!", [
                {
                    text: "OK",
                    onPress: () => {
                        // Navigate to dashboard or next screen
                        // navigation.replace('RetailerDashboard');
                    },
                },
            ]);
        } catch (error) {
            console.error("Error submitting form:", error);
            Alert.alert("Error", "Failed to create profile. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Image
                            source={require("../../assets/cpLogo.jpg")}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Profile Photo Upload */}
                <TouchableOpacity
                    style={styles.photoUploadContainer}
                    onPress={pickPersonPhoto}
                >
                    {personPhoto ? (
                        <Image
                            source={{ uri: personPhoto.uri }}
                            style={styles.profilePhoto}
                        />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>+</Text>
                            <Text style={styles.photoLabel}>Upload Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Full Name<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter full name"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                    {/* Contact Number with OTP Verification */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Contact Number
                            <Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <View style={styles.phoneContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.phoneInput,
                                    contactError ? styles.inputError : null,
                                ]}
                                placeholder="Enter 10-digit mobile number"
                                placeholderTextColor="#999"
                                value={contactNo}
                                onChangeText={validatePhone}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!isPhoneVerified}
                            />
                            {!isPhoneVerified && (
                                <TouchableOpacity
                                    style={[
                                        styles.otpButton,
                                        contactNo.length === 10 && !contactError
                                            ? styles.otpButtonActive
                                            : styles.otpButtonDisabled,
                                    ]}
                                    onPress={sendOTP}
                                    disabled={
                                        contactNo.length !== 10 || contactError
                                    }
                                >
                                    <Text style={styles.otpButtonText}>
                                        {showOtpInput
                                            ? "Resend OTP"
                                            : "Send OTP"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {isPhoneVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedText}>
                                        ✓ Verified
                                    </Text>
                                </View>
                            )}
                        </View>
                        {contactError ? (
                            <Text style={styles.errorText}>{contactError}</Text>
                        ) : null}

                        {showOtpInput && !isPhoneVerified && (
                            <View style={styles.otpContainer}>
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="Enter 6-digit OTP"
                                    placeholderTextColor="#999"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.verifyButton,
                                        otp.length === 6
                                            ? styles.verifyButtonActive
                                            : styles.verifyButtonDisabled,
                                    ]}
                                    onPress={verifyOTP}
                                    disabled={otp.length !== 6}
                                >
                                    <Text style={styles.verifyButtonText}>
                                        Verify
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {/* Alternate Contact */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Alternate Contact</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter alternate number"
                            placeholderTextColor="#999"
                            value={altContactNo}
                            onChangeText={setAltContactNo}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>
                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email address"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {/* Date of Birth */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Date of Birth (DD/MM/YYYY)
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor="#999"
                            value={dob}
                            onChangeText={setDob}
                            maxLength={10}
                        />
                    </View>
                    {/* Gender Dropdown */}
                    <View style={[styles.inputGroup, { zIndex: 6000 }]}>
                        <Text style={styles.label}>Gender</Text>
                        <DropDownPicker
                            open={genderOpen}
                            value={gender}
                            items={genderOptions}
                            setOpen={setGenderOpen}
                            setValue={setGender}
                            placeholder="Select gender"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            searchable={true}
                            searchPlaceholder="Search gender..."
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>
                    {/* Govt ID Type */}
                    <View style={[styles.inputGroup, { zIndex: 5000 }]}>
                        <Text style={styles.label}>
                            Government ID Type
                            <Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <DropDownPicker
                            open={idTypeOpen}
                            value={govtIdType}
                            items={idTypeOptions}
                            setOpen={setIdTypeOpen}
                            setValue={setGovtIdType}
                            placeholder="Select ID type"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            searchable={true}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>
                    {/* Govt ID Number */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            ID Number<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter ID number"
                            placeholderTextColor="#999"
                            value={govtIdNumber}
                            onChangeText={setGovtIdNumber}
                            autoCapitalize="characters"
                        />
                    </View>
                    {/* Upload Govt ID Photo */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            Government ID Photo
                            <Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.fileUploadButton}
                            onPress={pickGovtIdPhoto}
                        >
                            <Text style={styles.fileUploadText}>
                                {govtIdPhoto
                                    ? "✓ ID Photo Selected"
                                    : "+ Upload ID Photo"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* Shop Details Section */}
                    <Text
                        style={[
                            styles.sectionTitle,
                            { marginTop: 30, zIndex: 1 },
                        ]}
                    >
                        Shop Details
                    </Text>
                    {/* Shop Name */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            Shop Name<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter shop name"
                            placeholderTextColor="#999"
                            value={shopName}
                            onChangeText={setShopName}
                        />
                    </View>
                    {/* Business Type */}
                    <View style={[styles.inputGroup, { zIndex: 4000 }]}>
                        <Text style={styles.label}>
                            Business Type
                            <Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <DropDownPicker
                            open={businessTypeOpen}
                            value={businessType}
                            items={businessTypeOptions}
                            setOpen={setBusinessTypeOpen}
                            setValue={setBusinessType}
                            placeholder="Select business type"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            searchable={true}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>
                    {/* Ownership Type */}
                    <View style={[styles.inputGroup, { zIndex: 3000 }]}>
                        <Text style={styles.label}>
                            Ownership Type
                            <Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <DropDownPicker
                            open={ownershipTypeOpen}
                            value={ownershipType}
                            items={ownershipTypeOptions}
                            setOpen={setOwnershipTypeOpen}
                            setValue={setOwnershipType}
                            placeholder="Select ownership type"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>
                    // FIXME: Implement a regex for this GST no
                    {/* GST Number */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>GST Number</Text>
                        <TextInput
                            style={[
                                styles.input,
                                panError ? styles.inputError : null,
                            ]}
                            placeholder="Enter GST number"
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
                    // FIXME: Implement a regex for this PAN card
                    {/* PAN Card */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>PAN Card</Text>
                        <TextInput
                            style={[
                                styles.input,
                                gstError ? styles.inputError : null,
                            ]}
                            placeholder="Enter PAN card number"
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
                    {/* Address Line 1 */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            Address Line 1
                            <Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter address"
                            placeholderTextColor="#999"
                            value={address1}
                            onChangeText={setAddress1}
                        />
                    </View>
                    {/* Address Line 2 */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Address Line 2</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter address line 2"
                            placeholderTextColor="#999"
                            value={address2}
                            onChangeText={setAddress2}
                        />
                    </View>
                    {/* City */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            City<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter city"
                            placeholderTextColor="#999"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                    {/* State */}
                    <View style={[styles.inputGroup, { zIndex: 2000 }]}>
                        <Text style={styles.label}>
                            State<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <DropDownPicker
                            open={stateOpen}
                            value={state}
                            items={stateOptions}
                            setOpen={setStateOpen}
                            setValue={setState}
                            placeholder="Select state"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            searchable={true}
                            searchPlaceholder="Search state..."
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>
                    {/* Pincode */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            Pincode<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 6-digit pincode"
                            placeholderTextColor="#999"
                            value={pincode}
                            onChangeText={setPincode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>
                    {/* Upload Outlet Photo */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Outlet Photo</Text>
                        <TouchableOpacity
                            style={styles.fileUploadButton}
                            onPress={pickOutletPhoto}
                        >
                            <Text style={styles.fileUploadText}>
                                {outletPhoto
                                    ? "✓ Outlet Photo Selected"
                                    : "+ Upload Outlet Photo"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* Upload Registration Form */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Registration Form</Text>
                        <TouchableOpacity
                            style={styles.fileUploadButton}
                            onPress={pickRegistrationForm}
                        >
                            <Text style={styles.fileUploadText}>
                                {registrationFormFile
                                    ? "✓ Form Selected"
                                    : "+ Upload Registration Form"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* Bank Details Section */}
                    <Text
                        style={[
                            styles.sectionTitle,
                            { marginTop: 30, zIndex: 1 },
                        ]}
                    >
                        Bank Details
                    </Text>
                    {/* Bank Name */}
                    <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                        <Text style={styles.label}>
                            Bank Name<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <DropDownPicker
                            open={bankOpen}
                            value={bankName}
                            items={bankOptions}
                            setOpen={setBankOpen}
                            setValue={setBankName}
                            placeholder="Select bank"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            searchable={true}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                    </View>
                    {/* // TODO: Do a penny check box */}
                    {/* Account Number */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            Account Number
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
                    {/* // TODO: Implement IFSC check using regex */}
                    {/* IFSC Code */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>
                            IFSC Code<Text style={{ color: "red" }}> *</Text>
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                ifscError ? styles.inputError : null,
                            ]}
                            placeholder="Enter IFSC code"
                            placeholderTextColor="#999"
                            value={ifsc}
                            onChangeText={validateIFSC}
                            autoCapitalize="characters"
                            maxLength={11}
                        />
                        {ifscError ? (
                            <Text style={styles.errorText}>{ifscError}</Text>
                        ) : null}
                    </View>
                    {/* Branch Name */}
                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Branch Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter branch name"
                            placeholderTextColor="#999"
                            value={branchName}
                            onChangeText={setBranchName}
                        />
                    </View>
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
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Create Profile
                            </Text>
                            // TODO: Terms & conditions ka checkbox ek
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        paddingBottom: 50,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: "#fff",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        letterSpacing: 0.5,
    },
    logoSubtext: {
        fontSize: 8,
        color: "#666",
        marginTop: 2,
        letterSpacing: 1,
    },
    photoUploadContainer: {
        alignSelf: "center",
        marginBottom: 30,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#fff",
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E53935",
    },
    photoPlaceholderText: {
        fontSize: 36,
        color: "#E53935",
        fontWeight: "300",
    },
    photoLabel: {
        fontSize: 10,
        color: "#666",
        marginTop: 5,
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: "#333",
    },
    dropdown: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        minHeight: 45,
    },
    dropdownContainer: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        maxHeight: 200,
        position: "relative",
        top: 0,
    },
    fileUploadButton: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        borderStyle: "dashed",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    fileUploadText: {
        color: "#E53935",
        fontSize: 14,
        fontWeight: "500",
    },
    submitButton: {
        backgroundColor: "#E53935",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 30,
    },
    submitButtonDisabled: {
        backgroundColor: "#f5a0a0ff",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    inputError: {
        borderColor: "#ff4444",
        borderWidth: 1,
    },
    errorText: {
        color: "#ff4444",
        fontSize: 12,
        marginTop: 4,
    },
    phoneContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    phoneInput: {
        flex: 1,
    },
    otpButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: "center",
    },
    otpButtonActive: {
        backgroundColor: "#007AFF",
    },
    otpButtonDisabled: {
        backgroundColor: "#ccc",
    },
    otpButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    verifiedBadge: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    verifiedText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    otpContainer: {
        flexDirection: "row",
        marginTop: 12,
        gap: 8,
    },
    otpInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    verifyButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 90,
        alignItems: "center",
        justifyContent: "center",
    },
    verifyButtonActive: {
        backgroundColor: "#4CAF50",
    },
    verifyButtonDisabled: {
        backgroundColor: "#ccc",
    },
    verifyButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});

export default CreateRetailerProfileScreen;
