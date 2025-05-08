import React, {createContext, useState, useContext, useEffect, useRef, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
    serverAddress: string;
    apiKey: string;
    username: string;
    password: string;
}

interface SettingsContextType {
    isSettingsVisible: boolean;
    setIsSettingsVisible: (visible: boolean) => void;
    clickCount: number;
    incrementClickCount: () => void;
    resetClickCount: () => void;
    settings: Settings;
    saveSettings: (newSettings: Settings) => Promise<void>;
    loadSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
    serverAddress: '',
    apiKey: '',
    username: '',
    password: '',
};

const SETTINGS_STORAGE_KEY = '@app_settings';
const CLICK_TIMEOUT = 3000; // 3 sekundy na wykonanie sekwencji kliknięć
const REQUIRED_CLICKS = 10;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastClickTime = useRef<number>(0);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    // Ładowanie ustawień przy starcie
    useEffect(() => {
        loadSettings();
    }, []);

    const saveSettings = async (newSettings: Settings) => {
        try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Błąd podczas zapisywania ustawień:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('Błąd podczas wczytywania ustawień:', error);
        }
    };


    const resetClickCount = useCallback(() => {
        setClickCount(0);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const incrementClickCount = useCallback(() => {
        const now = Date.now();
        console.log(clickCount);
        // Jeśli to pierwsze kliknięcie lub minęło zbyt dużo czasu, resetujemy licznik
        if (clickCount === 0 || (now - lastClickTime.current) > CLICK_TIMEOUT) {
            setClickCount(1);
            lastClickTime.current = now;

            // Ustawiamy timeout do zresetowania licznika
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(resetClickCount, CLICK_TIMEOUT);
        } else {
            // Zwiększamy licznik
            setClickCount(prev => {
                const newCount = prev + 1;
                if (newCount === REQUIRED_CLICKS) {
                    setIsSettingsVisible(true);
                    resetClickCount();
                    return 0;
                }
                return newCount;
            });
            lastClickTime.current = now;
        }
    }, [clickCount, resetClickCount]);

    return (
        <SettingsContext.Provider
            value={{
                isSettingsVisible,
                setIsSettingsVisible,
                clickCount,
                incrementClickCount,
                resetClickCount,
                settings,
                saveSettings,
                loadSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );

};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
