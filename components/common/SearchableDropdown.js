// SearchableDropdown.js - PERFECTED VERSION
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

const SearchableDropdown = ({
    label,
    placeholder = "Select an option",
    open, // Kept for API compatibility
    value,
    items,
    setOpen, // Kept for API compatibility
    setValue,
    setItems, // Kept for API compatibility
    required = false,
    disabled = false,
    searchable = true,
    multiple = false,
    zIndex = 1000, // Not needed but kept for compatibility
    style,
    dropDownContainerStyle,
    labelStyle,
    error,
    onOpen,
    onClose,
    onChangeValue,
}) => {
    // Internal focus state for styling
    const [isFocus, setIsFocus] = useState(false);

    // ✅ Clear selection
    const handleClear = useCallback(() => {
        if (multiple) {
            setValue([]);
        } else {
            setValue(null);
        }
        if (onChangeValue) {
            onChangeValue(multiple ? [] : null);
        }
    }, [multiple, setValue, onChangeValue]);

    // ✅ Handle change for single select
    const handleChange = useCallback(
        (item) => {
            setValue(item.value);
            if (onChangeValue) {
                onChangeValue(item.value);
            }
        },
        [setValue, onChangeValue]
    );

    // ✅ Handle change for multi select
    const handleMultiChange = useCallback(
        (selectedValues) => {
            setValue(selectedValues);
            if (onChangeValue) {
                onChangeValue(selectedValues);
            }
        },
        [setValue, onChangeValue]
    );

    // ✅ Handle focus
    const handleFocus = useCallback(() => {
        setIsFocus(true);
        if (setOpen) setOpen(true);
        if (onOpen) onOpen();
    }, [setOpen, onOpen]);

    // ✅ Handle blur
    const handleBlur = useCallback(() => {
        setIsFocus(false);
        if (setOpen) setOpen(false);
        if (onClose) onClose();
    }, [setOpen, onClose]);

    // ✅ Custom search input renderer for better control
    const renderInputSearch = useCallback((onSearch) => {
        return (
            <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#999"
                onChangeText={onSearch}
                autoCorrect={false}
                autoCapitalize="none"
            />
        );
    }, []);

    // ✅ Render dropdown items with proper styling
    const renderItem = useCallback((item, selected) => {
        return (
            <View
                style={[styles.itemContainer, selected && styles.itemSelected]}
            >
                <Text style={styles.itemText} numberOfLines={1}>
                    {item.label}
                </Text>
                {selected && (
                    <Ionicons name="checkmark" size={20} color="#E4002B" />
                )}
            </View>
        );
    }, []);

    // ✅ Render selected badges for multi-select
    const renderSelectedItem = useCallback((item, unSelect) => {
        return (
            <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                <View style={styles.selectedBadge}>
                    <Text style={styles.badgeText}>{item.label}</Text>
                    <Ionicons name="close" size={14} color="#fff" />
                </View>
            </TouchableOpacity>
        );
    }, []);

    // ✅ Common props for both Dropdown and MultiSelect
    const commonProps = {
        data: items,
        labelField: "label",
        valueField: "value",
        placeholder: placeholder,
        value: value,
        disable: disabled,
        search: searchable,
        maxHeight: 250,
        onFocus: handleFocus,
        onBlur: handleBlur,
        style: [
            styles.dropdown,
            isFocus && styles.dropdownFocused,
            error && styles.dropdownError,
            style,
        ],
        containerStyle: [styles.dropdownContainer, dropDownContainerStyle],
        placeholderStyle: styles.placeholderStyle,
        selectedTextStyle: styles.selectedTextStyle,
        inputSearchStyle: styles.inputSearchStyle,
        iconStyle: styles.iconStyle,
        activeColor: "#FFE5E9",
        iconColor: isFocus ? "#E4002B" : "#666",
        searchPlaceholder: "Search...",
        dropdownPosition: "auto",
        renderInputSearch: searchable ? renderInputSearch : undefined,
        renderItem: renderItem,
        renderRightIcon: () => (
            <Ionicons
                name={isFocus ? "chevron-up" : "chevron-down"}
                size={20}
                color={isFocus ? "#E4002B" : "#666"}
            />
        ),
    };

    // ✅ Render appropriate dropdown based on multiple prop
    const renderDropdown = () => {
        if (multiple) {
            return (
                <MultiSelect
                    {...commonProps}
                    onChange={handleMultiChange}
                    selectedStyle={styles.selectedBadge}
                    selectedTextStyle={styles.badgeText}
                    renderSelectedItem={renderSelectedItem}
                    visibleSelectedItem={true}
                />
            );
        }

        return <Dropdown {...commonProps} onChange={handleChange} />;
    };

    return (
        <View style={styles.container}>
            {/* Label */}
            {label && (
                <Text style={[styles.label, labelStyle]}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}

            {/* Dropdown Component */}
            {renderDropdown()}

            {/* ✅ Clear Button */}
            {((multiple && Array.isArray(value) && value.length > 0) ||
                (!multiple && value)) &&
                !disabled && (
                    <TouchableOpacity
                        style={[styles.clearButton, { top: label ? 42 : 14 }]}
                        onPress={handleClear}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={22} color="#999" />
                    </TouchableOpacity>
                )}

            {/* ✅ Error Message */}
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
        color: "#E4002B",
    },
    dropdown: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 10,
        minHeight: 50,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    dropdownFocused: {
        borderColor: "#E4002B",
        borderWidth: 1.5,
    },
    dropdownError: {
        borderColor: "#dc3545",
        borderWidth: 1.5,
    },
    selectedTextStyle: {
        fontSize: 14,
        color: "#333",
    },
    placeholderStyle: {
        fontSize: 14,
        color: "#999",
    },
    dropdownContainer: {
        backgroundColor: "#fff",
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    // ✅ FIXED: Reduced padding for items
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10, // Reduced from 12
        paddingHorizontal: 12, // Reduced from 16
        minHeight: 40, // Ensure consistent height
    },
    itemSelected: {
        backgroundColor: "#FFE5E9",
    },
    itemText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    // ✅ FIXED: Proper search input styling
    searchInput: {
        height: 40,
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginHorizontal: 12,
        marginVertical: 8,
        fontSize: 14,
        color: "#333",
        backgroundColor: "#F9F9F9",
    },
    inputSearchStyle: {
        // Fallback if renderInputSearch is not used
        height: 40,
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    // ✅ Multi-select badge styling
    selectedBadge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "#E4002B",
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginTop: 4,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        color: "#fff",
        fontWeight: "600",
    },
    clearButton: {
        position: "absolute",
        right: 40,
        zIndex: 10001,
        padding: 4,
    },
    errorText: {
        color: "#dc3545",
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
});

export default SearchableDropdown;
