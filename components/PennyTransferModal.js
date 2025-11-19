import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Linking,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PennyTransferModal = ({ visible, onClose, onConfirm, bankDetails }) => {
    const [showSupportModal, setShowSupportModal] = useState(false);
    const SUPPORT_NUMBER = "1800123456"; // Replace with your actual support number

    const handleYesReceived = () => {
        onConfirm(true);
        onClose();
    };

    const handleNotReceived = () => {
        setShowSupportModal(true);
    };

    const handleCallSupport = () => {
        let phoneNumber = "";
        if (Platform.OS === "android") {
            phoneNumber = `tel:${SUPPORT_NUMBER}`;
        } else {
            phoneNumber = `telprompt:${SUPPORT_NUMBER}`;
        }

        Linking.canOpenURL(phoneNumber)
            .then((supported) => {
                if (!supported) {
                    alert("Phone number is not available");
                } else {
                    return Linking.openURL(phoneNumber);
                }
            })
            .catch((err) => console.error("Error opening phone:", err));
    };

    const handleCloseSupportModal = () => {
        setShowSupportModal(false);
        onClose();
    };

    return (
        <>
            {/* Main Penny Transfer Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible && !showSupportModal}
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header with Icon */}
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={["#007AFF", "#0051D5"]}
                                style={styles.iconGradient}
                            >
                                <Ionicons
                                    name="cash-outline"
                                    size={40}
                                    color="#fff"
                                />
                            </LinearGradient>
                        </View>

                        {/* Title */}
                        <Text style={styles.modalTitle}>
                            Penny Transfer Verification
                        </Text>

                        {/* Message */}
                        <Text style={styles.modalMessage}>
                            We have initiated a penny transfer (₹1) to verify
                            your bank account.
                        </Text>

                        {/* Bank Details */}
                        {bankDetails && (
                            <View style={styles.bankDetailsBox}>
                                <Text style={styles.bankDetailsTitle}>
                                    Bank Account Details:
                                </Text>
                                <Text style={styles.bankDetailsText}>
                                    Bank: {bankDetails.bankName}
                                </Text>
                                <Text style={styles.bankDetailsText}>
                                    A/C: ****
                                    {bankDetails.accountNumber?.slice(-4)}
                                </Text>
                                <Text style={styles.bankDetailsText}>
                                    IFSC: {bankDetails.ifsc}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.questionText}>
                            Have you received the penny transfer?
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.yesButton]}
                                onPress={handleYesReceived}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={["#28a745", "#20c997"]}
                                    style={styles.buttonGradient}
                                >
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={22}
                                        color="#fff"
                                    />
                                    <Text style={styles.buttonText}>
                                        Yes, Received
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.noButton]}
                                onPress={handleNotReceived}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={["#FFA500", "#FF8C00"]}
                                    style={styles.buttonGradient}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={22}
                                        color="#fff"
                                    />
                                    <Text style={styles.buttonText}>
                                        Not Yet
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Support Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSupportModal}
                onRequestClose={handleCloseSupportModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Support Icon */}
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={["#dc3545", "#c82333"]}
                                style={styles.iconGradient}
                            >
                                <Ionicons
                                    name="headset-outline"
                                    size={40}
                                    color="#fff"
                                />
                            </LinearGradient>
                        </View>

                        {/* Title */}
                        <Text style={styles.modalTitle}>Contact Support</Text>

                        {/* Message */}
                        <Text style={styles.modalMessage}>
                            Don't worry! Our support team will help you verify
                            your bank account.
                        </Text>

                        {/* Support Number */}
                        <View style={styles.supportNumberBox}>
                            <Ionicons name="call" size={24} color="#007AFF" />
                            <Text style={styles.supportNumber}>
                                {SUPPORT_NUMBER}
                            </Text>
                        </View>

                        <Text style={styles.supportHint}>
                            Tap the button below to call our support team
                        </Text>

                        {/* Call Button */}
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={handleCallSupport}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={["#007AFF", "#0051D5"]}
                                style={styles.buttonGradient}
                            >
                                <Ionicons name="call" size={22} color="#fff" />
                                <Text style={styles.buttonText}>
                                    Call Support
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseSupportModal}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        alignSelf: "center",
        marginBottom: 20,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 15,
    },
    modalMessage: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 20,
    },
    bankDetailsBox: {
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    bankDetailsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    bankDetailsText: {
        fontSize: 13,
        color: "#666",
        marginBottom: 5,
    },
    questionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        overflow: "hidden",
    },
    buttonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        gap: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
    },
    closeButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#999",
        fontSize: 15,
        fontWeight: "600",
    },
    supportNumberBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8F4FF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        gap: 10,
    },
    supportNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
    },
    supportHint: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    callButton: {
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 15,
    },
});

export default PennyTransferModal;
