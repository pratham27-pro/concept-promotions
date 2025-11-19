import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const FileUpload = ({
    label,
    file,
    onFileSelect,
    onFileRemove,
    accept = "all", // 'image', 'document', 'all'
    multiple = false,
    required = false,
    disabled = false,
    placeholder = "Click to upload file",
    style,
    error,
}) => {
    const pickFile = async () => {
        if (disabled) return;

        try {
            let result;

            if (accept === "image") {
                // Use Image Picker for images
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsMultipleSelection: multiple,
                    quality: 0.8,
                });

                if (!result.canceled) {
                    if (multiple) {
                        onFileSelect(result.assets);
                    } else {
                        onFileSelect(result.assets[0]);
                    }
                }
            } else {
                // Use Document Picker for documents
                result = await DocumentPicker.getDocumentAsync({
                    type: accept === "document" ? "application/pdf" : "*/*",
                    copyToCacheDirectory: true,
                    multiple: multiple,
                });

                if (result.type !== "cancel") {
                    onFileSelect(result);
                }
            }
        } catch (error) {
            console.error("Error picking file:", error);
            Alert.alert("Error", "Failed to pick file");
        }
    };

    const isImage = (fileItem) => {
        if (!fileItem) return false;
        const mimeType = fileItem.mimeType || fileItem.type || "";
        return mimeType.includes("image") || fileItem.uri?.includes("image");
    };

    const renderFilePreview = () => {
        if (!file) return null;

        // Handle single file
        if (!Array.isArray(file)) {
            return (
                <View style={styles.previewContainer}>
                    {isImage(file) ? (
                        <Image
                            source={{ uri: file.uri }}
                            style={styles.previewImage}
                        />
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
                {file.map((item, index) => (
                    <View key={index} style={styles.fileItem}>
                        {isImage(item) ? (
                            <Image
                                source={{ uri: item.uri }}
                                style={styles.thumbnailImage}
                            />
                        ) : (
                            <View style={styles.documentThumbnail}>
                                <Ionicons
                                    name="document"
                                    size={30}
                                    color="#007AFF"
                                />
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
                ))}
            </View>
        );
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
                    onPress={pickFile}
                    disabled={disabled}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="cloud-upload-outline"
                        size={40}
                        color="#999"
                    />
                    <Text style={styles.uploadText}>{placeholder}</Text>
                    <Text style={styles.uploadHint}>
                        {accept === "image"
                            ? "Images only"
                            : accept === "document"
                            ? "PDF only"
                            : "Any file type"}
                    </Text>
                </TouchableOpacity>
            ) : (
                <>
                    {renderFilePreview()}
                    {multiple && (
                        <TouchableOpacity
                            style={styles.addMoreButton}
                            onPress={pickFile}
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
});

export default FileUpload;
