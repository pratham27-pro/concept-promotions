import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActionSheetIOS,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import ImageView from "react-native-image-viewing";

const FileUpload = ({
    label,
    file,
    onFileSelect,
    onFileRemove,
    accept = "all", // 'image', 'document', 'all', 'imageOrDocument'
    multiple = false,
    required = false,
    disabled = false,
    placeholder = "Click to upload file",
    style,
    error,
    enablePreview = true, // Enable/disable fullscreen preview
}) => {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    // ✅ Show action sheet to let user choose between Image/Document
    const showPickerOptions = () => {
        if (disabled) return;

        // If accept is specific, just pick that type
        if (accept === "image") {
            pickImage();
            return;
        }
        if (accept === "document") {
            pickDocument();
            return;
        }

        // ✅ For 'all' or 'imageOrDocument', show choices
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ["Cancel", "Choose Image", "Choose Document"],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) pickImage();
                    if (buttonIndex === 2) pickDocument();
                }
            );
        } else {
            // Android: Show custom alert
            Alert.alert("Choose File Type", "Select where to pick file from", [
                { text: "Cancel", style: "cancel" },
                { text: "Image Gallery", onPress: pickImage },
                { text: "Document", onPress: pickDocument },
            ]);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: multiple,
                quality: 0.8,
                allowsEditing: false,
            });

            console.log("📸 Image picker result:", result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                if (multiple) {
                    const normalizedFiles = result.assets.map((asset) => ({
                        uri: asset.uri,
                        name: asset.fileName || `image_${Date.now()}.jpg`,
                        mimeType: "image/jpeg",
                        type: "image/jpeg",
                    }));
                    onFileSelect(normalizedFiles);
                } else {
                    const asset = result.assets[0];
                    const normalizedFile = {
                        uri: asset.uri,
                        name: asset.fileName || `image_${Date.now()}.jpg`,
                        mimeType: "image/jpeg",
                        type: "image/jpeg",
                    };
                    onFileSelect(normalizedFile);
                }
            }
        } catch (error) {
            console.error("❌ Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: accept === "document" ? "application/pdf" : "*/*",
                copyToCacheDirectory: true,
                multiple: multiple,
            });

            console.log("📄 Document picker result:", result);

            // ✅ Handle both old and new DocumentPicker API
            if (!result.canceled && result.assets && result.assets.length > 0) {
                // New API (expo-document-picker v11+)
                if (multiple) {
                    const normalizedFiles = result.assets.map((asset) => ({
                        uri: asset.uri,
                        name: asset.name || "file",
                        mimeType: asset.mimeType || "application/octet-stream",
                        type: asset.mimeType || "application/octet-stream",
                    }));
                    onFileSelect(normalizedFiles);
                } else {
                    const asset = result.assets[0];
                    const normalizedFile = {
                        uri: asset.uri,
                        name: asset.name || "file",
                        mimeType: asset.mimeType || "application/octet-stream",
                        type: asset.mimeType || "application/octet-stream",
                    };
                    onFileSelect(normalizedFile);
                }
            } else if (result.type !== "cancel" && result.uri) {
                // Old API (expo-document-picker v10 and below)
                const normalizedFile = {
                    uri: result.uri,
                    name: result.name || "file",
                    mimeType: result.mimeType || "application/octet-stream",
                    type: result.mimeType || "application/octet-stream",
                };
                onFileSelect(normalizedFile);
            }
        } catch (error) {
            console.error("❌ Error picking document:", error);
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const isImage = (fileItem) => {
        if (!fileItem) return false;
        const mimeType = fileItem.mimeType || fileItem.type || "";
        return (
            mimeType.includes("image") ||
            fileItem.uri?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
        );
    };

    // ✅ Open image preview in fullscreen
    const openImagePreview = (index = 0) => {
        if (!enablePreview) return;
        setPreviewIndex(index);
        setPreviewVisible(true);
    };

    // ✅ Get all images for preview modal
    const getImageList = () => {
        if (!file) return [];
        const files = Array.isArray(file) ? file : [file];
        return files.filter(isImage).map((f) => ({ uri: f.uri }));
    };

    const renderFilePreview = () => {
        if (!file) return null;

        // Handle single file
        if (!Array.isArray(file)) {
            return (
                <View style={styles.previewContainer}>
                    {isImage(file) ? (
                        <TouchableOpacity
                            onPress={() => enablePreview && openImagePreview(0)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: file.uri }}
                                style={styles.previewImage}
                            />
                            {enablePreview && (
                                <View style={styles.zoomIconContainer}>
                                    <Ionicons
                                        name="expand-outline"
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.documentPreview}>
                            <Ionicons
                                name="document"
                                size={40}
                                color="#007AFF"
                            />
                            <Text style={styles.fileName} numberOfLines={1}>
                                {file.name || "Document"}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => onFileRemove && onFileRemove()}
                    >
                        <Ionicons
                            name="close-circle"
                            size={24}
                            color="#dc3545"
                        />
                    </TouchableOpacity>
                </View>
            );
        }

        // Handle multiple files
        return (
            <View style={styles.multipleFilesContainer}>
                {file.map((item, index) => {
                    const imageIndex = file
                        .slice(0, index)
                        .filter(isImage).length;

                    return (
                        <View key={index} style={styles.fileItem}>
                            {isImage(item) ? (
                                <TouchableOpacity
                                    onPress={() =>
                                        enablePreview &&
                                        openImagePreview(imageIndex)
                                    }
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.thumbnailImage}
                                    />
                                    {enablePreview && (
                                        <View style={styles.zoomIconSmall}>
                                            <Ionicons
                                                name="expand-outline"
                                                size={14}
                                                color="#fff"
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.documentThumbnail}>
                                    <Ionicons
                                        name="document"
                                        size={30}
                                        color="#007AFF"
                                    />
                                    <Text
                                        style={styles.fileNameSmall}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={styles.removeIconSmall}
                                onPress={() => {
                                    const newFiles = file.filter(
                                        (_, i) => i !== index
                                    );
                                    onFileRemove && onFileRemove(newFiles);
                                }}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#dc3545"
                                />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    };

    // ✅ Get appropriate hint text
    const getHintText = () => {
        if (accept === "image") return "Images only (JPG, PNG)";
        if (accept === "document") return "Documents only (PDF)";
        return "Images or Documents (JPG, PNG, PDF)";
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}

            {!file || (Array.isArray(file) && file.length === 0) ? (
                <TouchableOpacity
                    style={[styles.uploadBox, disabled && styles.disabled]}
                    onPress={showPickerOptions}
                    disabled={disabled}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="cloud-upload-outline"
                        size={40}
                        color="#999"
                    />
                    <Text style={styles.uploadText}>{placeholder}</Text>
                    <Text style={styles.uploadHint}>{getHintText()}</Text>
                </TouchableOpacity>
            ) : (
                <>
                    {renderFilePreview()}
                    {multiple && (
                        <TouchableOpacity
                            style={styles.addMoreButton}
                            onPress={showPickerOptions}
                            disabled={disabled}
                        >
                            <Ionicons
                                name="add-circle-outline"
                                size={20}
                                color="#007AFF"
                            />
                            <Text style={styles.addMoreText}>
                                Add more files
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* ✅ Fullscreen Image Preview Modal */}
            <ImageView
                images={getImageList()}
                imageIndex={previewIndex}
                visible={previewVisible}
                onRequestClose={() => setPreviewVisible(false)}
                swipeToCloseEnabled={true}
                doubleTapToZoomEnabled={true}
                presentationStyle="overFullScreen"
            />
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
    uploadBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
    },
    disabled: {
        opacity: 0.5,
    },
    uploadText: {
        marginTop: 10,
        color: "#666",
        fontSize: 14,
        fontWeight: "500",
    },
    uploadHint: {
        marginTop: 5,
        color: "#999",
        fontSize: 12,
    },
    previewContainer: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        position: "relative",
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginBottom: 10,
    },
    documentPreview: {
        alignItems: "center",
        padding: 20,
    },
    fileName: {
        marginTop: 10,
        fontSize: 14,
        color: "#333",
        maxWidth: 200,
    },
    fileNameSmall: {
        marginTop: 4,
        fontSize: 10,
        color: "#333",
        textAlign: "center",
        paddingHorizontal: 4,
    },
    removeButton: {
        marginTop: 10,
    },
    multipleFilesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    fileItem: {
        position: "relative",
        width: 100,
        height: 100,
    },
    thumbnailImage: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    documentThumbnail: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    removeIconSmall: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#fff",
        borderRadius: 10,
    },
    addMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        padding: 10,
        gap: 5,
    },
    addMoreText: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "500",
    },
    errorText: {
        color: "#dc3545",
        fontSize: 12,
        marginTop: 5,
    },
    zoomIconContainer: {
        position: "absolute",
        bottom: 15,
        right: 5,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 15,
        padding: 5,
    },
    zoomIconSmall: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 10,
        padding: 3,
    },
});

export default FileUpload;
