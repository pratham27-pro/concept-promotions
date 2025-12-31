import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
    const [imageLoading, setImageLoading] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

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
                setImageError(false);
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

    // ✅ Helper to get image URI - MUST return a string, not an object
    const getImageUri = () => {
        if (!photo) return null;

        // If photo is a string (direct URL from backend)
        if (typeof photo === "string") {
            return photo;
        }

        // If photo is an object with uri property
        if (photo && photo.uri) {
            return photo.uri;
        }

        return null;
    };

    const imageUri = getImageUri();
    const hasPhoto = !!imageUri;

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
                {hasPhoto ? (
                    <>
                        {/* ✅ FIXED: Pass uri as string, not object */}
                        <Image
                            source={{ uri: imageUri }}
                            style={[styles.photo, getShapeStyle()]}
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={() => {
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />

                        {/* ✅ Loading indicator while image loads */}
                        {imageLoading && (
                            <View
                                style={[styles.loadingOverlay, getShapeStyle()]}
                            >
                                <ActivityIndicator
                                    size="small"
                                    color="#007AFF"
                                />
                            </View>
                        )}

                        {/* ✅ Error state if image fails to load */}
                        {imageError && (
                            <View
                                style={[styles.errorOverlay, getShapeStyle()]}
                            >
                                <Ionicons
                                    name="alert-circle"
                                    size={30}
                                    color="#dc3545"
                                />
                                <Text style={styles.errorOverlayText}>
                                    Failed to load
                                </Text>
                            </View>
                        )}

                        {/* ✅ Remove button - only show if not disabled and callback exists */}
                        {!disabled && onPhotoRemove && !imageLoading && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setImageError(false);
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

                        {/* ✅ Edit icon overlay to indicate it's editable */}
                        {!disabled && !imageLoading && (
                            <View style={styles.editOverlay}>
                                <Ionicons
                                    name="camera"
                                    size={20}
                                    color="#fff"
                                />
                            </View>
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
        textAlign: "center",
    },
    removeButton: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    editOverlay: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "rgba(0, 122, 255, 0.8)",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    errorOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "rgba(220, 53, 69, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#dc3545",
    },
    errorOverlayText: {
        fontSize: 10,
        color: "#dc3545",
        marginTop: 4,
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
