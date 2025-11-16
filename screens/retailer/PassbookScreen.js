import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PassbookScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Passbook Screen</Text>
            <Text style={styles.subtext}>Coming Soon...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D9D9D9",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    subtext: {
        fontSize: 16,
        color: "#666",
        marginTop: 10,
    },
});

export default PassbookScreen;
