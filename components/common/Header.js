import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Header = ({
    showBackButton = true,
    onBackPress,
    showLogo = true,
    logoSource = require("../../assets/supreme.jpg"),
    logoComponent,
    title,
    rightComponent,
    backgroundColor = "#fff",
    navigation: propNavigation, // Accept navigation as prop
}) => {
    // Use hook navigation as fallback
    const hookNavigation = useNavigation();
    const navigation = propNavigation || hookNavigation;

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        } else {
            console.warn("Cannot go back - no navigation history");
        }
    };

    return (
        <View style={[styles.header, { backgroundColor }]}>
            {/* Left Side - Back Button */}
            <View style={styles.leftContainer}>
                {showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                )}
                {!showBackButton && <View style={styles.placeholder} />}
            </View>

            {/* Center - Logo or Title */}
            <View style={styles.centerContainer}>
                {/* Custom logo component takes priority */}
                {logoComponent && logoComponent}

                {/* Show image logo if no custom component and showLogo is true */}
                {!logoComponent && showLogo && (
                    <Image
                        source={logoSource}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                )}

                {/* Show title only if no logo */}
                {!logoComponent && !showLogo && title && (
                    <Text style={styles.headerTitle}>{title}</Text>
                )}
            </View>

            {/* Right Side - Optional Component */}
            <View style={styles.rightContainer}>
                {rightComponent || <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leftContainer: {
        width: 40,
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
    },
    rightContainer: {
        width: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    logoImage: {
        width: 120,
        height: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    placeholder: {
        width: 40,
    },
});

export default Header;
