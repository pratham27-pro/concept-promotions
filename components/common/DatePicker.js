import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";

const DatePicker = ({
    label,
    value,
    onChange,
    placeholder = "Select date",
    required = false,
    disabled = false,
    error,
    mode = "date", // 'date', 'time', 'datetime'
    minimumDate,
    maximumDate,
    style,
    format = "date", // 'date', 'datetime', 'time'
}) => {
    const [isPickerVisible, setPickerVisible] = useState(false);

    const showPicker = () => {
        if (!disabled) {
            setPickerVisible(true);
        }
    };

    const hidePicker = () => {
        setPickerVisible(false);
    };

    const handleConfirm = (selectedDate) => {
        hidePicker();
        onChange(selectedDate);
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return null;

        const dateObj = new Date(date);

        if (format === "time") {
            return dateObj.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }

        if (format === "datetime") {
            return dateObj.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }

        // Default date format
        return dateObj.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const displayValue = value ? formatDate(value) : null;

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}

            <TouchableOpacity
                style={[
                    styles.inputContainer,
                    disabled && styles.disabled,
                    error && styles.inputError,
                ]}
                onPress={showPicker}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={disabled ? "#ccc" : "#666"}
                    style={styles.icon}
                />

                <Text
                    style={[
                        styles.inputText,
                        !displayValue && styles.placeholderText,
                        disabled && styles.disabledText,
                    ]}
                >
                    {displayValue || placeholder}
                </Text>

                {value && !disabled && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onChange(null);
                        }}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}

                {!value && (
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color={disabled ? "#ccc" : "#666"}
                    />
                )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <DateTimePickerModal
                isVisible={isPickerVisible}
                mode={mode}
                date={value ? new Date(value) : new Date()}
                onConfirm={handleConfirm}
                onCancel={hidePicker}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                // iOS specific styling
                confirmTextIOS="Confirm"
                cancelTextIOS="Cancel"
                buttonTextColorIOS="#E53935"
                // Android specific
                isDarkModeEnabled={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    required: {
        color: "#E53935",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
        minHeight: 50,
    },
    disabled: {
        backgroundColor: "#FAFAFA",
        opacity: 0.6,
    },
    inputError: {
        borderColor: "#E53935",
        borderWidth: 2,
    },
    icon: {
        marginRight: 10,
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        color: "#333",
    },
    placeholderText: {
        color: "#999",
    },
    disabledText: {
        color: "#999",
    },
    clearButton: {
        marginRight: 5,
        padding: 2,
    },
    errorText: {
        color: "#E53935",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
});

export default DatePicker;
