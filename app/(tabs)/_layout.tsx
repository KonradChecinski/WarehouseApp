import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Link, Tabs} from 'expo-router';
import {Pressable, View, Image, Text} from 'react-native';

import Colors from '@/constants/Colors';
import {useColorScheme} from '@/components/useColorScheme';
import {useClientOnlyValue} from '@/components/useClientOnlyValue';
import {SettingsProvider, useSettings} from "@/components/SettingsContext";
import {SettingsModal} from "@/app/modal/SettingsModal";
import {GestureHandlerRootView} from "react-native-gesture-handler";


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const {incrementClickCount} = useSettings();


    const HeaderTitle = ({title}: { title: string }) => {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20, // odstęp między logo a tekstem
                width: "100%",
            }}>
                <Pressable
                    onPress={() => incrementClickCount()}
                    // onPressIn={() => incrementClickCount()}
                    // onTouchStart={() => incrementClickCount()}
                    style={({pressed}) => [
                        {
                            opacity: pressed ? 0.8 : 1,
                            padding: 10, // zwiększamy obszar dotykowy
                        }
                    ]}
                >

                    <Image
                        style={{
                            width: 80,
                            height: 30,
                            resizeMode: 'contain'
                        }}
                        source={require('../../assets/images/logo.png')}
                    />
                </Pressable>
                <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#ffffff', // biały tekst
                }}>
                    {title}
                </Text>
            </View>
        );
    };


    return (
        <Tabs
            initialRouteName={'stan'}
            screenOptions={{
                // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                // Disable the static render of the header on web
                // to prevent a hydration error in React Navigation v6.
                headerShown: useClientOnlyValue(false, true),
                // Dodajemy style dla nagłówka
                headerStyle: {
                    backgroundColor: '#0a1f3c', // ciemny granatowy
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                },
                headerTintColor: '#ffffff', // biały tekst w nagłówku
                // Style dla dolnego paska
                tabBarStyle: {
                    backgroundColor: '#0a1f3c', // ciemny granatowy
                    borderTopColor: '#0a1f3c', // usunięcie linii oddzielającej
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                },
                tabBarActiveTintColor: '#12a0ff', // kolor logo dla aktywnej zakładki
                tabBarInactiveTintColor: '#ffffff', // jaśniejszy niebieski dla nieaktywnych
            }}>

            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dokument',
                    headerTitle: () => <HeaderTitle title="Dokument"/>,
                    tabBarIcon: ({color}) => <TabBarIcon name="file-text-o" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="stan"
                options={{
                    title: 'Stan',
                    headerTitle: () => <HeaderTitle title="Stan"/>,
                    tabBarIcon: ({color}) => <TabBarIcon name="database" color={color}/>,
                }}
            />
        </Tabs>
    );
}
