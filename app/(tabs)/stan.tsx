import {Keyboard, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {Text, View} from '@/components/Themed';
import {Avatar, Button, Card, Divider, FAB, IconButton, List, TextInput} from "react-native-paper";
import {useCallback, useRef, useState} from "react";
import {useFocusEffect} from "expo-router";
import validbarcode from "barcode-validator";

export default function StockScreen() {
    const [text, setText] = useState("");
    const refEanInput = useRef(null);
    const [showKeyboard, setShowKeyboard] = useState(false);

    const quantities = [
        {
            name: "Belibe",
            quantity: 5,
            type: "supplier",
        },
        {
            name: "Interprint",
            quantity: 3,
            type: "supplier",
        },
        {
            name: "Sora",
            quantity: 1,
            type: "supplier",
        },
        {
            name: "Miraggio",
            quantity: 0,
            type: "supplier",
        },
        {
            name: "Ruda Śląska",
            quantity: 2,
            type: "store",
        },
        {
            name: "Tychy",
            quantity: 1,
            type: "store",
        },
        {
            name: "Dąbrowa Górnicza",
            quantity: 4,
            type: "store",
        },
        {
            name: "Błonie",
            quantity: 2,
            type: "store",
        },
        {
            name: "Inne1",
            quantity: 10,
            type: "other",
        },
        {
            name: "Inne2",
            quantity: 20,
            type: "other",
        },
    ]

    // const LeftContent = props => <Avatar.Icon {...props} icon="folder"/>

    useFocusEffect(
        useCallback(() => {
            setShowKeyboard(false); // upewniamy się, że klawiatura będzie ukryta
            setTimeout(() => {
                if (refEanInput.current) {
                    refEanInput.current?.blur(); // najpierw blur dla pewności
                    refEanInput.current?.focus(); // ustawiamy fokus
                }
            }, 100);
        }, [])
    );

    const handleClearAndFocus = () => {
        setText(""); // czyścimy tekst
        refEanInput.current?.blur(); // najpierw blur
        setTimeout(() => {
            refEanInput.current?.focus(); // fokus po małym opóźnieniu
        }, 100);
    };


    const handleDismissKeyboard = () => {
        Keyboard.dismiss();
        setShowKeyboard(false);
    };

    // Funkcja do wysyłania zapytania
    const handleSubmit = async () => {
        if (!text.trim()) return; // nie wysyłaj pustego tekstu
        if (text.length === 13) return;
        if (!validbarcode(text)) return;
        
        console.log(text);
        return;
        try {
            const response = await fetch('https://twoj-adres-serwera/api/endpoint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ean: text.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Błąd sieciowy');
            }

            const data = await response.json();
            // Tutaj możesz obsłużyć odpowiedź, np. zaktualizować stan
            console.log(data);

            // Opcjonalnie: wyczyść pole po udanym zapytaniu
            setText('');
            handleClearAndFocus();
        } catch (error) {
            console.error('Błąd:', error);
            // Tutaj możesz dodać obsługę błędów, np. wyświetlić alert
        }
    };


    const AccordionSection = ({title, type}: { title: string, type: string }) => {

        return (
            <List.Section>
                <List.Accordion
                    title={title + ": " + quantities.filter(item => item.type === type)
                        .reduce((sum, item) => sum + item.quantity, 0)}

                >
                    {quantities.filter(item => item.type === type).map((item, index) => (
                        <List.Item
                            key={item.name + index}
                            title={() => (
                                <View style={styles.listItemContainer}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                                </View>
                            )}
                            style={styles.listItem}
                        />
                    ))}

                </List.Accordion>
            </List.Section>
        );
    }


    return (
        <View style={styles.mainContainer}>

            <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>

                    <View style={styles.container}>
                        <Card style={styles.card} mode={"contained"}>
                            {/*<Card.Title title="Card Title" subtitle="Card Subtitle" left={LeftContent}/>*/}
                            <Card.Content>
                                <View style={styles.inputContainer}>

                                    <TextInput
                                        label="Podaj kod EAN"
                                        ref={refEanInput}
                                        keyboardType={'numeric'}
                                        value={text}
                                        onChangeText={text => setText(text)}
                                        showSoftInputOnFocus={showKeyboard}
                                        style={styles.input}
                                        contextMenuHidden={true}
                                        onSubmitEditing={handleSubmit} // obsługa wciśnięcia Enter
                                        blurOnSubmit={false} // zapobiega utracie fokusu po wciśnięciu Enter
                                        returnKeyType="send" // zmienia tekst na przycisku Enter
                                    />

                                    <IconButton
                                        icon={showKeyboard ? "keyboard" : "keyboard-off"}
                                        onPress={() => {
                                            refEanInput.current?.blur(); // najpierw odbieramy fokus
                                            setShowKeyboard(prev => !prev); // przełączamy stan klawiatury
                                            setTimeout(() => {
                                                refEanInput.current?.focus(); // ponownie ustawiamy fokus po małym opóźnieniu
                                            }, 100);
                                        }}

                                    />
                                </View>
                            </Card.Content>
                        </Card>
                        <Divider/>

                        <Card style={styles.card}>
                            <Card.Title title="Product"/>
                            <Card.Content>

                            </Card.Content>
                        </Card>


                        <Card style={styles.card}>
                            <Card.Content>
                                {/*stan dostawcy*/}
                                <AccordionSection title={"Dostawcy"} type={"supplier"}/>
                                <Divider/>
                                {/*stan sklepy*/}
                                <AccordionSection title={"Sklepy"} type={"store"}/>
                                <Divider/>
                                {/*stan inne*/}
                                <AccordionSection title={"Inne"} type={"other"}/>
                            </Card.Content>
                        </Card>


                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
            <FAB
                icon="refresh"
                style={styles.fab}
                onPress={handleClearAndFocus}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 80, // dodaje przestrzeń na dole dla FAB
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    card: {
        width: '90%',
        marginTop: 10,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    listItem: {
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    listItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
        borderRadius: 12,
    },
    itemName: {
        flex: 1,
        fontSize: 16,
    },
    itemQuantity: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: 'bold',
    },

});
