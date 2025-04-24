import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/components/useColorScheme';
import {PaperProvider} from "react-native-paper";

import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
    ThemeProvider
} from '@react-navigation/native';
import {
    MD3DarkTheme,
    MD3LightTheme,
    adaptNavigationTheme,
} from 'react-native-paper';
import merge from 'deepmerge';

const extendDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        "primary": "rgb(154, 203, 255)",
        "onPrimary": "rgb(0, 51, 85)",
        "primaryContainer": "rgb(0, 74, 121)",
        "onPrimaryContainer": "rgb(208, 228, 255)",
        "secondary": "rgb(130, 219, 126)",
        "onSecondary": "rgb(0, 57, 10)",
        "secondaryContainer": "rgb(0, 83, 18)",
        "onSecondaryContainer": "rgb(157, 248, 152)",
        "tertiary": "rgb(187, 195, 255)",
        "onTertiary": "rgb(17, 34, 134)",
        "tertiaryContainer": "rgb(45, 60, 156)",
        "onTertiaryContainer": "rgb(223, 224, 255)",
        "error": "rgb(255, 180, 171)",
        "onError": "rgb(105, 0, 5)",
        "errorContainer": "rgb(147, 0, 10)",
        "onErrorContainer": "rgb(255, 180, 171)",
        "background": "rgb(26, 28, 30)",
        "onBackground": "rgb(226, 226, 230)",
        "surface": "rgb(26, 28, 30)",
        "onSurface": "rgb(226, 226, 230)",
        "surfaceVariant": "rgb(66, 71, 78)",
        "onSurfaceVariant": "rgb(194, 199, 207)",
        "outline": "rgb(140, 145, 153)",
        "outlineVariant": "rgb(66, 71, 78)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(226, 226, 230)",
        "inverseOnSurface": "rgb(47, 48, 51)",
        "inversePrimary": "rgb(0, 98, 159)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(32, 37, 41)",
            "level2": "rgb(36, 42, 48)",
            "level3": "rgb(40, 47, 55)",
            "level4": "rgb(41, 49, 57)",
            "level5": "rgb(44, 53, 62)"
        },
        "surfaceDisabled": "rgba(226, 226, 230, 0.12)",
        "onSurfaceDisabled": "rgba(226, 226, 230, 0.38)",
        "backdrop": "rgba(44, 49, 55, 0.4)"
    }
};

const extendLightTheme = {
    ...MD3LightTheme,
    colors: {
        "primary": "rgb(0, 98, 159)",
        "onPrimary": "rgb(255, 255, 255)",
        "primaryContainer": "rgb(208, 228, 255)",
        "onPrimaryContainer": "rgb(0, 29, 52)",
        "secondary": "rgb(16, 109, 32)",
        "onSecondary": "rgb(255, 255, 255)",
        "secondaryContainer": "rgb(157, 248, 152)",
        "onSecondaryContainer": "rgb(0, 34, 4)",
        "tertiary": "rgb(71, 85, 182)",
        "onTertiary": "rgb(255, 255, 255)",
        "tertiaryContainer": "rgb(223, 224, 255)",
        "onTertiaryContainer": "rgb(0, 13, 95)",
        "error": "rgb(186, 26, 26)",
        "onError": "rgb(255, 255, 255)",
        "errorContainer": "rgb(255, 218, 214)",
        "onErrorContainer": "rgb(65, 0, 2)",
        "background": "rgb(252, 252, 255)",
        "onBackground": "rgb(26, 28, 30)",
        "surface": "rgb(252, 252, 255)",
        "onSurface": "rgb(26, 28, 30)",
        "surfaceVariant": "rgb(222, 227, 235)",
        "onSurfaceVariant": "rgb(66, 71, 78)",
        "outline": "rgb(115, 119, 127)",
        "outlineVariant": "rgb(194, 199, 207)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(47, 48, 51)",
        "inverseOnSurface": "rgb(241, 240, 244)",
        "inversePrimary": "rgb(154, 203, 255)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(239, 244, 250)",
            "level2": "rgb(232, 240, 247)",
            "level3": "rgb(224, 235, 244)",
            "level4": "rgb(222, 234, 244)",
            "level5": "rgb(217, 230, 242)"
        },
        "surfaceDisabled": "rgba(26, 28, 30, 0.12)",
        "onSurfaceDisabled": "rgba(26, 28, 30, 0.38)",
        "backdrop": "rgba(44, 49, 55, 0.4)"
    }
};

const {LightTheme, DarkTheme} = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(extendLightTheme, LightTheme);
const CombinedDarkTheme = merge(extendDarkTheme, DarkTheme);

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav/>;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <PaperProvider theme={colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme}>
            <ThemeProvider value={colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    <Stack.Screen name="modal" options={{presentation: 'modal'}}/>
                </Stack>
            </ThemeProvider>
        </PaperProvider>
    );
}
