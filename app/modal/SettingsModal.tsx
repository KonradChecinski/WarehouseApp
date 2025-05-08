import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Modal, Portal, TextInput, Button, Text} from 'react-native-paper';
import {useColorScheme} from '@/components/useColorScheme';
import {useSettings} from '@/components/SettingsContext';

export const SettingsModal: React.FC = () => {
    const colorScheme = useColorScheme();
    const {isSettingsVisible, setIsSettingsVisible, settings, saveSettings} = useSettings();

    // Stan lokalny formularza
    const [formData, setFormData] = useState({
        serverAddress: '',
        apiKey: '',
        username: '',
        password: '',
    });

    // Aktualizacja formularza gdy settings się zmienią
    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleSave = async () => {
        await saveSettings(formData);
        setIsSettingsVisible(false);
    };

    const handleCancel = () => {
        setFormData(settings); // Przywróć poprzednie wartości
        setIsSettingsVisible(false);
    };

    return (
        <Portal>
            <Modal
                visible={isSettingsVisible}
                onDismiss={handleCancel}
                contentContainerStyle={[
                    styles.container,
                    {backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#ffffff'}
                ]}
            >
                <ScrollView style={styles.scrollView}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Ustawienia zaawansowane
                    </Text>

                    <TextInput
                        mode="outlined"
                        label="Adres serwera"
                        value={formData.serverAddress}
                        onChangeText={(text) => setFormData(prev => ({...prev, serverAddress: text}))}
                        style={styles.input}
                        autoCapitalize="none"
                    />

                    <TextInput
                        mode="outlined"
                        label="Klucz API"
                        value={formData.apiKey}
                        onChangeText={(text) => setFormData(prev => ({...prev, apiKey: text}))}
                        style={styles.input}
                        autoCapitalize="none"
                    />

                    <TextInput
                        mode="outlined"
                        label="Nazwa użytkownika"
                        value={formData.username}
                        onChangeText={(text) => setFormData(prev => ({...prev, username: text}))}
                        style={styles.input}
                        autoCapitalize="none"
                    />

                    <TextInput
                        mode="outlined"
                        label="Hasło"
                        value={formData.password}
                        onChangeText={(text) => setFormData(prev => ({...prev, password: text}))}
                        style={styles.input}
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={styles.button}
                        >
                            Zapisz
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={handleCancel}
                            style={styles.button}
                        >
                            Anuluj
                        </Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
};


const styles = StyleSheet.create({
    scrollView: {
        width: '100%',
    },
    title: {
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        gap: 10,
    },
    button: {
        flex: 1,
    }
});