// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API_BASE_URL = "https://supreme-419p.onrender.com/api";

const AuthContext = createContext();

const mapBackendRoleToAppRole = (backendRole) => {
    // Map all client admin roles to "client"
    const clientRoles = ["national", "regional", "district", "client"];

    if (clientRoles.includes(backendRole)) {
        return "client";
    }

    // Return original role for employee and retailer
    return backendRole;
};

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    // Check login status on app start
    useEffect(() => {
        checkLoginStatus();
    }, []);

    // Check if user is logged in and if profile is complete
    const checkLoginStatus = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem("userToken");
            const role = await AsyncStorage.getItem("userRole");
            const id = await AsyncStorage.getItem("userId");

            if (token && role && id) {
                setUserToken(token);
                setUserRole(role);
                setUserId(id);

                // Check if we have cached profile completion status
                const cachedStatus = await AsyncStorage.getItem(
                    `profileComplete_${id}`
                );

                if (cachedStatus === "true") {
                    // Profile is complete, go directly to dashboard
                    setNeedsProfileCompletion(false);
                } else {
                    // Need to verify profile completeness from backend
                    await checkProfileCompleteness(token, role);
                }
            }
        } catch (error) {
            console.error("Error checking login status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Login function
    const login = async (token, role, id, profileData = null) => {
        try {
            console.log("🔍 Login - Backend role:", role);

            // ✅ Map backend role to app role
            const appRole = mapBackendRoleToAppRole(role);
            console.log("✅ Login - Mapped app role:", appRole);

            // Save MAPPED role to AsyncStorage
            await AsyncStorage.setItem("userToken", token);
            await AsyncStorage.setItem("userRole", appRole); // ✅ Save mapped role
            await AsyncStorage.setItem("userId", id);

            // Update state with mapped role
            setUserToken(token);
            setUserRole(appRole);
            setUserId(id);

            // Check if profile is complete
            if (appRole === "client") {
                setNeedsProfileCompletion(false);
                await AsyncStorage.setItem(`profileComplete_${id}`, "true");
                console.log("✅ Client role - skipping profile check");
            } else {
                // For employee and retailer, check completeness
                await checkProfileCompleteness(token, appRole);
            }
            console.log("🎯 Final auth state:", {
                userToken: token,
                userRole: appRole,
                needsProfileCompletion:
                    appRole === "client" ? false : undefined,
            });
        } catch (error) {
            console.error("Error saving login data:", error);
            throw error;
        }
    };

    // Check if profile is complete based on user role
    const checkProfileCompleteness = async (token, role) => {
        try {
            let endpoint;
            switch (role) {
                case "employee":
                    endpoint = `${API_BASE_URL}/employee/profile`;
                    break;
                case "retailer":
                    endpoint = `${API_BASE_URL}/retailer/retailer/me`;
                    break;
                case "client":
                    setNeedsProfileCompletion(false);
                    return;
                default:
                    console.warn("Unknown role:", role);
                    return;
            }

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }

            const responseData = await response.json();
            console.log("🔍 Full profile data from API:", responseData);

            // ✅ Extract actual profile from nested structure
            let profileData;
            if (role === "employee" && responseData.employee) {
                profileData = responseData.employee;
            } else if (role === "retailer" && responseData.retailer) {
                profileData = responseData.retailer;
            } else if (role === "client" && responseData.client) {
                profileData = responseData.client;
            } else {
                // Fallback: maybe it's not nested
                profileData = responseData;
            }

            console.log("🔍 Extracted profile:", profileData);
            setUserProfile(profileData); // ✅ Store unwrapped profile

            const isComplete = checkIfProfileComplete(profileData, role);

            setNeedsProfileCompletion(!isComplete);

            if (isComplete) {
                await AsyncStorage.setItem(
                    `profileComplete_${profileData._id || profileData.id}`,
                    "true"
                );
            }

            console.log(
                `✅ Profile completeness check: ${
                    isComplete ? "Complete" : "Incomplete"
                }`
            );
        } catch (error) {
            console.error("Error checking profile completeness:", error);
            setNeedsProfileCompletion(true);
        }
    };

    // Check if profile is complete based on user type
    const checkIfProfileComplete = (profile, role) => {
        if (!profile) return false;

        try {
            if (role === "employee") {
                const isContractual = profile.employeeType === "Contractual";

                // Common checks for both permanent and contractual
                const hasBasicInfo = !!(
                    profile.gender &&
                    profile.dob &&
                    profile.aadhaarNumber
                );

                const hasAddress = !!(
                    (profile.correspondenceAddress?.addressLine1 ||
                        profile.correspondenceAddress?.address1) &&
                    profile.correspondenceAddress?.city &&
                    profile.correspondenceAddress?.state &&
                    profile.correspondenceAddress?.pincode
                );

                const hasBankDetails = !!(
                    profile.bankDetails?.accountNumber &&
                    profile.bankDetails?.IFSC
                );

                if (isContractual) {
                    // Contractual employee requirements
                    return hasBasicInfo && hasAddress && hasBankDetails;
                } else {
                    // Permanent employee requirements (stricter)
                    const hasPermanentFields = !!(
                        profile.panNumber &&
                        profile.highestQualification &&
                        profile.maritalStatus
                    );

                    return (
                        hasBasicInfo &&
                        hasAddress &&
                        hasBankDetails &&
                        hasPermanentFields
                    );
                }
            } else if (role === "retailer") {
                // Retailer profile requirements
                const hasShopDetails = !!(
                    profile.shopDetails?.shopName &&
                    profile.shopDetails?.shopAddress?.address &&
                    profile.shopDetails?.shopAddress?.city &&
                    profile.shopDetails?.shopAddress?.state &&
                    profile.shopDetails?.shopAddress?.pincode
                );

                const hasGovtId = !!(
                    profile.govtIdType && profile.govtIdNumber
                );

                const hasBankDetails = !!(
                    profile.bankDetails?.accountNumber &&
                    profile.bankDetails?.IFSC
                );

                return hasShopDetails && hasGovtId && hasBankDetails;
            } else if (role === "client") {
                // Clients don't need profile completion
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error in checkIfProfileComplete:", error);
            return false;
        }
    };

    // Mark profile as complete after successful submission
    const markProfileComplete = async () => {
        try {
            if (userId) {
                await AsyncStorage.setItem(`profileComplete_${userId}`, "true");
                setNeedsProfileCompletion(false);
                console.log("✅ Profile marked as complete");
            }
        } catch (error) {
            console.error("Error marking profile complete:", error);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(["userToken", "userRole", "userId"]);

            // Clear profile completion cache for this user
            if (userId) {
                await AsyncStorage.removeItem(`profileComplete_${userId}`);
            }

            setUserToken(null);
            setUserRole(null);
            setUserId(null);
            setNeedsProfileCompletion(false);
            setUserProfile(null);

            console.log("✅ Logged out successfully");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // Refresh profile data
    const refreshProfile = async () => {
        if (userToken && userRole) {
            await checkProfileCompleteness(userToken, userRole);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                userToken,
                userRole,
                userId,
                isLoading,
                needsProfileCompletion,
                userProfile,
                login,
                logout,
                markProfileComplete,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
