import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const TermsAndConditions = ({
    accepted,
    onAcceptChange,
    locked = false,
    required = true,
    style,
}) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {/* Checkbox with label */}
            <View style={[styles.checkboxContainer, style]}>
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {
                        if (!locked) {
                            onAcceptChange(!accepted);
                        }
                    }}
                    disabled={locked}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={accepted ? "checkbox" : "square-outline"}
                        size={24}
                        color={locked ? "#28a745" : "#E53935"}
                    />
                </TouchableOpacity>

                <Text style={styles.checkboxLabel}>
                    I agree to the{" "}
                    <Text
                        style={styles.linkText}
                        onPress={() => setShowModal(true)}
                    >
                        Terms & Conditions
                    </Text>
                    {required && <Text style={styles.required}> *</Text>}
                    {locked && (
                        <Text style={styles.verifiedText}> ✓ Accepted</Text>
                    )}
                </Text>
            </View>

            {/* Terms Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Terms & Conditions
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowModal(false)}
                            >
                                <Ionicons name="close" size={28} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalText}>
                                <Text style={styles.boldText}>
                                    Concept Promotions and Events (CPE)
                                </Text>{" "}
                                respects your privacy and is committed to
                                protecting your personal data. This request for
                                consent ("Notice") will inform you about how the
                                CPE proposes to collect, handle, store, use,
                                disclose and transfer ("Process") your personal
                                data.
                            </Text>

                            <Text
                                style={[styles.modalText, styles.sectionText]}
                            >
                                <Text style={styles.boldText}>
                                    1. Categories of Personal Data:
                                </Text>{" "}
                                We may Process the following types of your
                                personal data:
                            </Text>

                            <Text style={styles.modalText}>
                                a) Identity and/or contact information and other
                                details for you or your outlet such as name,
                                physical address, mobile number, email address,
                                signatures, date of birth, copy of identity and
                                residence identifiers such as Aadhaar or other
                                officially valid documents.
                            </Text>

                            <Text
                                style={[styles.modalText, styles.sectionText]}
                            >
                                <Text style={styles.boldText}>
                                    2. Purposes of Processing:
                                </Text>{" "}
                                We Process your personal data for compliance,
                                eligibility assessment, service provision,
                                customer service, and fraud prevention.
                            </Text>

                            <Text
                                style={[styles.modalText, styles.sectionText]}
                            >
                                <Text style={styles.boldText}>
                                    3. Data Sharing:
                                </Text>{" "}
                                We may share your personal data with our
                                affiliates or third parties such as credit
                                information companies, bureaus and vendors.
                            </Text>

                            <Text
                                style={[styles.modalText, styles.sectionText]}
                            >
                                <Text style={styles.boldText}>
                                    4. Withdrawal of Consent:
                                </Text>{" "}
                                You have the right to withdraw your consent
                                anytime by following the process provided under
                                the 'Consent Withdrawal' section of the Privacy
                                Policy.
                            </Text>

                            <Text
                                style={[styles.modalText, styles.sectionText]}
                            >
                                <Text style={styles.boldText}>
                                    5. Grievances:
                                </Text>{" "}
                                If you believe that you have concerns regarding
                                how we Process your personal data, contact:
                            </Text>

                            <Text
                                style={[
                                    styles.modalText,
                                    {
                                        color: "#E53935",
                                        fontWeight: "600",
                                        paddingBottom: 20,
                                    },
                                ]}
                            >
                                manager@conceptpromotions.in
                            </Text>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View style={styles.modalFooter}>
                            {!locked && (
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => {
                                        onAcceptChange(true);
                                        setShowModal(false);
                                    }}
                                >
                                    <Text style={styles.acceptButtonText}>
                                        Accept & Close
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.closeButton,
                                    locked && styles.closeButtonFull,
                                ]}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.closeButtonText}>
                                    {locked
                                        ? "Close"
                                        : "Close Without Accepting"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    checkbox: {
        marginRight: 10,
        marginTop: 2,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    linkText: {
        color: "#E53935",
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    required: {
        color: "#E53935",
        fontWeight: "bold",
    },
    verifiedText: {
        color: "#28a745",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#E53935",
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    modalText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 22,
        marginBottom: 12,
        textAlign: "justify",
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#E53935",
        marginTop: 20,
        marginBottom: 10,
    },
    boldText: {
        fontWeight: "bold",
        color: "#333",
    },
    bulletText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 22,
        marginBottom: 8,
        paddingLeft: 10,
        textAlign: "justify",
    },
    contactBox: {
        backgroundColor: "#FFF5F5",
        borderLeftWidth: 4,
        borderLeftColor: "#E53935",
        padding: 15,
        borderRadius: 8,
        marginVertical: 15,
    },
    contactText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 22,
        marginBottom: 8,
    },
    consentText: {
        fontSize: 13,
        color: "#666",
        lineHeight: 20,
        marginTop: 20,
        marginBottom: 10,
        fontStyle: "italic",
        textAlign: "center",
        paddingHorizontal: 10,
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        gap: 10,
    },
    acceptButton: {
        backgroundColor: "#E53935",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center",
    },
    acceptButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    closeButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#E53935",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    closeButtonFull: {
        backgroundColor: "#E53935",
        borderWidth: 0,
    },
    closeButtonText: {
        color: "#000000ff",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default TermsAndConditions;
