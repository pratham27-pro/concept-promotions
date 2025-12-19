import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    // onSelectItem,
}) => {
    // const handleSelectItem = (item) => {
    //     onSelectItem && onSelectItem(item);
    // };

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
                mode="BADGE"
                style={[styles.dropdown, style]}
                dropDownContainerStyle={[
                    styles.dropdownContainer,
                    dropDownContainerStyle,
                ]}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                    nestedScrollEnabled: true,
                    scrollEnabled: true,
                    showsVerticalScrollIndicator: true,
                }}
                dropDownDirection="AUTO"
                searchPlaceholder="Search..."
                // onSelectItem={handleSelectItem}
                theme="LIGHT"
            />
            {((multiple && Array.isArray(value) && value.length > 0) ||
                (!multiple && value)) &&
                !disabled && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            if (multiple) {
                                setValue((prev) => []);
                            } else {
                                setValue((prev) => null);
                            }
                        }}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
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
        maxHeight: 220, // ensures scroll
    },
    errorText: {
        color: "#dc3545",
        fontSize: 12,
        marginTop: 5,
    },
    clearButton: {
        position: "absolute",
        right: 35,
        top: 40,
        zIndex: 9999,
    },
});

export default SearchableDropdown;
