import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}

export function goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
    }
}

export function resetRoot(name) {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [{ name }],
        });
    }
}

export function resetToRetailerHome() {
    if (navigationRef.isReady()) {
        navigationRef.reset({
            index: 0,
            routes: [
                {
                    name: "RetailerStack", // MUST match RootNavigator
                    state: {
                        index: 0,
                        routes: [
                            {
                                name: "RetailerTabs",
                                state: {
                                    index: 0,
                                    routes: [{ name: "Home" }],
                                },
                            },
                        ],
                    },
                },
            ],
        });
    }
}
