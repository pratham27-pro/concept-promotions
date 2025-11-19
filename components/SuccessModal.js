import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SuccessModal = ({ visible, onClose, title, message }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={["#28a745", "#20c997"]}
                            style={styles.iconGradient}
                        >
                            <Ionicons name="checkmark" size={50} color="#fff" />
                        </LinearGradient>
                    </View>

                    {/* Title */}
                    <Text style={styles.modalTitle}>{title || "Success!"}</Text>

                    {/* Message */}
                    <Text style={styles.modalMessage}>
                        {message ||
                            "Your bank account has been verified successfully."}
                    </Text>

                    {/* OK Button */}
                    <TouchableOpacity
                        style={styles.okButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={["#28a745", "#20c997"]}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
        padding: 30,
        width: "100%",
        maxWidth: 350,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        alignItems: "center",
    },
    iconContainer: {
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
        fontSize: 24,
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
        marginBottom: 25,
    },
    okButton: {
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default SuccessModal;
