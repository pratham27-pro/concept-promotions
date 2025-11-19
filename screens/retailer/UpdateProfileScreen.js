import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import * as RootNavigation from "../../navigation/RootNavigation";
import PennyTransferModal from "../../components/PennyTransferModal";
import SuccessModal from "../../components/SuccessModal";

const UpdateProfileScreen = ({ route }) => {
    const { retailer } = route.params;
    const [showPennyModal, setShowPennyModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Personal Details (changeable)
    const [personPhoto, setPersonPhoto] = useState(retailer.photo);
    const [altContactNo, setAltContactNo] = useState(
        retailer.altContactNo || ""
    );
    const [dob, setDob] = useState(retailer.dob || "");
    const [gender, setGender] = useState(retailer.gender || null);

    // Bank Details (changeable)
    const [bankName, setBankName] = useState(
        retailer.bankDetails?.bankName || null
    );
    const [accountNumber, setAccountNumber] = useState(
        retailer.bankDetails?.accountNumber || ""
    );
    const [ifsc, setIfsc] = useState(retailer.bankDetails?.ifsc || "");
    const [branchName, setBranchName] = useState(
        retailer.bankDetails?.branchName || ""
    );

    // Dropdown states
    const [genderOpen, setGenderOpen] = useState(false);
    const [bankOpen, setBankOpen] = useState(false);

    // Loading
    const [submitting, setSubmitting] = useState(false);

    // Dropdown options
    const [genderOptions] = useState([
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
    ]);

    const [bankOptions] = useState([
        { label: "HDFC Bank", value: "HDFC Bank" },
        { label: "State Bank of India", value: "State Bank of India" },
        { label: "ICICI Bank", value: "ICICI Bank" },
        { label: "Axis Bank", value: "Axis Bank" },
        { label: "Other", value: "Other" },
    ]);

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
                setPersonPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            // TODO: API call to update profile
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setShowPennyModal(true);
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
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
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => RootNavigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Update Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled={true}
            >
                {/* Profile Photo Upload */}
                <TouchableOpacity
                    style={styles.photoUploadContainer}
                    onPress={pickPersonPhoto}
                >
                    {personPhoto ? (
                        <Image
                            source={{ uri: personPhoto }}
                            style={styles.profilePhoto}
                        />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>+</Text>
                            <Text style={styles.photoLabel}>Update Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    {/* Non-editable Fields */}
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Full Name (Cannot be changed)
                        </Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={retailer.name}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Email (Cannot be changed)
                        </Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={retailer.email}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Contact Number (Cannot be changed)
                        </Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={retailer.contactNo}
                            editable={false}
                        />
                    </View>

                    {/* Editable Fields */}
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor="#999"
                            value={dob}
                            onChangeText={setDob}
                            maxLength={10}
                        />
                    </View>

                    <View style={[styles.inputGroup, { zIndex: 2000 }]}>
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
                            listMode="SCROLLVIEW"
                            scrollViewProps={{ nestedScrollEnabled: true }}
                        />
                    </View>

                    {/* Shop Details (Non-editable) */}
                    <Text
                        style={[
                            styles.sectionTitle,
                            { marginTop: 30, zIndex: 1 },
                        ]}
                    >
                        Shop Details (Cannot be changed)
                    </Text>

                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Shop Name</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={retailer.shopName}
                            editable={false}
                        />
                    </View>

                    {/* Bank Details (Editable) */}
                    <Text
                        style={[
                            styles.sectionTitle,
                            { marginTop: 30, zIndex: 1 },
                        ]}
                    >
                        Bank Details
                    </Text>

                    <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                        <Text style={styles.label}>Bank Name</Text>
                        <DropDownPicker
                            open={bankOpen}
                            value={bankName}
                            items={bankOptions}
                            setOpen={setBankOpen}
                            setValue={setBankName}
                            placeholder="Select bank"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{ nestedScrollEnabled: true }}
                        />
                    </View>

                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter account number"
                            placeholderTextColor="#999"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            keyboardType="number-pad"
                        />
                    </View>

                    <View style={[styles.inputGroup, { zIndex: 1 }]}>
                        <Text style={styles.label}>IFSC Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter IFSC code"
                            placeholderTextColor="#999"
                            value={ifsc}
                            onChangeText={setIfsc}
                            autoCapitalize="characters"
                            maxLength={11}
                        />
                    </View>

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

                    {/* Update Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            submitting && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {submitting ? "Updating..." : "Update Profile"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <PennyTransferModal
                visible={showPennyModal}
                onClose={() => setShowPennyModal(false)}
                onConfirm={handlePennyConfirm}
                bankDetails={{
                    bankName: bankName,
                    accountNumber: accountNumber,
                    ifsc: ifsc,
                }}
            />

            <SuccessModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    RootNavigation.goBack();
                }}
                title="Profile Updated!"
                message="Your profile has been updated and bank account verified successfully."
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
        paddingHorizontal: 20,
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
        color: "#007AFF",
    },
    placeholder: {
        width: 40,
    },
    photoUploadContainer: {
        alignSelf: "center",
        marginVertical: 20,
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
        borderColor: "#007AFF",
    },
    photoPlaceholderText: {
        fontSize: 36,
        color: "#007AFF",
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
        fontSize: 18,
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
    disabledInput: {
        backgroundColor: "#E8E8E8",
        color: "#999",
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
    },
    submitButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 30,
    },
    submitButtonDisabled: {
        backgroundColor: "#A0C9F5",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default UpdateProfileScreen;
