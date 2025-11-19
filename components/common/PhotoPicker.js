import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const PhotoPicker = ({
    label,
    photo,
    onPhotoSelect,
    onPhotoRemove,
    required = false,
    disabled = false,
    size = "medium", // 'small', 'medium', 'large'
    shape = "circle", // 'circle', 'square', 'rounded'
    placeholder = "Upload Photo",
    style,
    error,
    allowEditing = true,
    quality = 0.8,
}) => {
    const pickPhoto = async () => {
        if (disabled) return;

        try {
            // Request permissions
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Please grant camera roll permissions to upload photos."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: allowEditing,
                aspect: shape === "circle" ? [1, 1] : [4, 3],
                quality: quality,
            });

            if (!result.canceled) {
                onPhotoSelect(result.assets[0]);
            }
        } catch (error) {
            console.error("Error picking photo:", error);
            Alert.alert("Error", "Failed to pick photo");
        }
    };

    const getSize = () => {
        switch (size) {
            case "small":
                return 80;
            case "large":
                return 150;
            default:
                return 100;
        }
    };

    const getShapeStyle = () => {
        const dimension = getSize();
        const baseStyle = {
            width: dimension,
            height: dimension,
        };

        switch (shape) {
            case "circle":
                return { ...baseStyle, borderRadius: dimension / 2 };
            case "rounded":
                return { ...baseStyle, borderRadius: 15 };
            default:
                return { ...baseStyle, borderRadius: 0 };
        }
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}

            <TouchableOpacity
                style={[
                    styles.photoContainer,
                    getShapeStyle(),
                    disabled && styles.disabled,
                ]}
                onPress={pickPhoto}
                disabled={disabled}
                activeOpacity={0.7}
            >
                {photo ? (
                    <>
                        <Image
                            source={{
                                uri:
                                    typeof photo === "string"
                                        ? photo
                                        : photo.uri,
                            }}
                            style={[styles.photo, getShapeStyle()]}
                        />
                        {!disabled && onPhotoRemove && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onPhotoRemove();
                                }}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={24}
                                    color="#dc3545"
                                />
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <View style={[styles.placeholder, getShapeStyle()]}>
                        <Ionicons
                            name="camera"
                            size={getSize() / 3}
                            color="#999"
                        />
                        <Text style={styles.placeholderText}>
                            {placeholder}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    required: {
        color: "#dc3545",
    },
    photoContainer: {
        position: "relative",
    },
    photo: {
        resizeMode: "cover",
    },
    placeholder: {
        backgroundColor: "#f0f0f0",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 12,
        color: "#666",
    },
    removeButton: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    disabled: {
        opacity: 0.5,
    },
    errorText: {
        color: "#dc3545",
        fontSize: 12,
        marginTop: 5,
    },
});

export default PhotoPicker;
