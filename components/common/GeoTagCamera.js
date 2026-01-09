import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GeoTagCamera = ({
    label = "Take Geotagged Photo",
    photos = [],
    onPhotosChange,
    maxPhotos = 5,
    required = false,
    disabled = false,
}) => {
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Request permissions
    const requestPermissions = async () => {
        try {
            // Request camera permission
            const cameraStatus =
                await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Camera permission is required to take geotagged photos."
                );
                return false;
            }

            // Request location permission
            const locationStatus =
                await Location.requestForegroundPermissionsAsync();
            if (locationStatus.status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Location permission is required for geotagging."
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error("Permission error:", error);
            Alert.alert("Error", "Failed to get permissions");
            return false;
        }
    };

    // Get current location
    const getCurrentLocation = async () => {
        try {
            console.log("📍 Getting current location...");

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            });

            const { latitude, longitude, altitude, accuracy } = location.coords;

            console.log("✅ Location obtained:", {
                latitude,
                longitude,
                altitude,
                accuracy,
            });

            return {
                latitude,
                longitude,
                altitude: altitude || 0,
                accuracy: accuracy || 0,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Location error:", error);
            throw new Error(
                "Failed to get location. Please enable location services."
            );
        }
    };

    // Take photo with geotag
    const takePhoto = async () => {
        if (disabled) return;

        if (photos.length >= maxPhotos) {
            Alert.alert("Limit Reached", `Maximum ${maxPhotos} photos allowed`);
            return;
        }

        try {
            setLoading(true);

            // Check permissions
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) {
                setLoading(false);
                return;
            }

            // Get location first
            const locationData = await getCurrentLocation();

            // Take photo
            console.log("📸 Launching camera...");
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
                exif: true, // Get EXIF data
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                // Create geotagged photo object
                const geotaggedPhoto = {
                    uri: asset.uri,
                    type: "image/jpeg",
                    name: `geotagged_${Date.now()}.jpg`,
                    geotag: locationData,
                    exif: asset.exif || null,
                    width: asset.width,
                    height: asset.height,
                };

                console.log("✅ Geotagged photo created:", {
                    name: geotaggedPhoto.name,
                    location: `${locationData.latitude}, ${locationData.longitude}`,
                });

                // Add to photos array
                const updatedPhotos = [...photos, geotaggedPhoto];
                onPhotosChange(updatedPhotos);

                Alert.alert(
                    "Success",
                    `Photo captured with location:\nLat: ${locationData.latitude.toFixed(
                        6
                    )}\nLon: ${locationData.longitude.toFixed(6)}`
                );
            }
        } catch (error) {
            console.error("Camera error:", error);
            Alert.alert("Error", error.message || "Failed to capture photo");
        } finally {
            setLoading(false);
        }
    };

    // Remove photo
    const removePhoto = (index) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        onPhotosChange(updatedPhotos);
    };

    // View photo details
    const viewPhoto = (photo) => {
        setSelectedImage(photo);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            {/* Take Photo Button */}
            <TouchableOpacity
                style={[
                    styles.cameraButton,
                    disabled && styles.buttonDisabled,
                    loading && styles.buttonLoading,
                ]}
                onPress={takePhoto}
                disabled={disabled || loading || photos.length >= maxPhotos}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text style={styles.buttonText}>
                            Take Geotagged Photo ({photos.length}/{maxPhotos})
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Photo Grid */}
            {photos.length > 0 && (
                <View style={styles.photoGrid}>
                    {photos.map((photo, index) => (
                        <View key={index} style={styles.photoItem}>
                            <TouchableOpacity
                                onPress={() => viewPhoto(photo)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: photo.uri }}
                                    style={styles.photoPreview}
                                />
                            </TouchableOpacity>

                            {/* Location Badge */}
                            <View style={styles.locationBadge}>
                                <Ionicons
                                    name="location-sharp"
                                    size={10}
                                    color="#fff"
                                />
                            </View>

                            {/* Remove Button */}
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removePhoto(index)}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={24}
                                    color="#E4002B"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Info Text */}
            <Text style={styles.infoText}>
                📍 Photos will be automatically tagged with your location
            </Text>

            {/* Photo Details Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedImage && (
                            <>
                                {/* Close Button */}
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Ionicons
                                        name="close"
                                        size={28}
                                        color="#333"
                                    />
                                </TouchableOpacity>

                                {/* Image */}
                                <Image
                                    source={{ uri: selectedImage.uri }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />

                                {/* Location Details */}
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.detailTitle}>
                                        📍 Location Details
                                    </Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Latitude:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedImage.geotag.latitude.toFixed(
                                                6
                                            )}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Longitude:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {selectedImage.geotag.longitude.toFixed(
                                                6
                                            )}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Accuracy:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            ±
                                            {selectedImage.geotag.accuracy.toFixed(
                                                0
                                            )}
                                            m
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Time:
                                        </Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(
                                                selectedImage.geotag.timestamp
                                            ).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    required: {
        color: "#dc3545",
    },
    cameraButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007AFF",
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonLoading: {
        backgroundColor: "#5a9fd4",
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    photoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
    },
    photoItem: {
        width: "48%",
        aspectRatio: 1,
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
    },
    photoPreview: {
        width: "100%",
        height: "100%",
    },
    locationBadge: {
        position: "absolute",
        bottom: 8,
        left: 8,
        backgroundColor: "rgba(0, 122, 255, 0.9)",
        borderRadius: 12,
        padding: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    removeButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "white",
        borderRadius: 12,
    },
    infoText: {
        fontSize: 12,
        color: "#666",
        marginTop: 8,
        fontStyle: "italic",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "90%",
        maxHeight: "90%",
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
    },
    modalCloseButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 20,
        padding: 4,
    },
    modalImage: {
        width: "100%",
        height: 300,
        backgroundColor: "#000",
    },
    detailsContainer: {
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    detailLabel: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
});

export default GeoTagCamera;
