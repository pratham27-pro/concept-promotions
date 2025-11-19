import React from "react";
import { StyleSheet, View, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const SearchableDropdown = ({
    label,
    placeholder = "Select an option",
    open,
    value,
    items,
    setOpen,
    setValue,
    setItems,
    required = false,
    disabled = false,
    searchable = true,
    multiple = false,
    zIndex = 1000,
    style,
    dropDownContainerStyle,
    labelStyle,
    error,
    onSelectItem,
}) => {
    return (
        <View style={[styles.container, { zIndex }]}>
            {label && (
                <Text style={[styles.label, labelStyle]}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder={placeholder}
                searchable={searchable}
                disabled={disabled}
                multiple={multiple}
                style={[styles.dropdown, style]}
                dropDownContainerStyle={[
                    styles.dropdownContainer,
                    dropDownContainerStyle,
                ]}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                    nestedScrollEnabled: true,
                }}
                searchPlaceholder="Search..."
                onSelectItem={onSelectItem}
                theme="LIGHT"
            />
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
    dropdown: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        minHeight: 50,
    },
    dropdownContainer: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderRadius: 10,
        maxHeight: 200,
    },
    errorText: {
        color: "#dc3545",
        fontSize: 12,
        marginTop: 5,
    },
});

export default SearchableDropdown;
