import {Keyboard, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {Text, View} from '@/components/Themed';
import {
    ActivityIndicator,
    Avatar,
    Button,
    Card,
    Dialog,
    Divider,
    FAB,
    IconButton,
    List, MD2Colors,
    Portal,
    TextInput
} from "react-native-paper";
import {useCallback, useRef, useState} from "react";
import {useFocusEffect} from "expo-router";
import validbarcode from "barcode-validator";
import {useSettings} from '@/components/SettingsContext';


export default function StockScreen() {
    const {settings} = useSettings();

    const [data, setData] = useState(null);

    const [text, setText] = useState("");
    const refEanInput = useRef(null);
    const [showKeyboard, setShowKeyboard] = useState(false);

    const [visibleLoadingDialog, setVisibleLoadingDialog] = useState(false);
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
        console.log("handleSubmit");
        const barcode = text.trim();

        if (!barcode) return; // nie wysyłaj pustego tekstu
        if (barcode.length !== 13) return;
        if (!validbarcode(barcode)) return;


        console.log(barcode);
        // return;
        try {
            const searchParams = new URLSearchParams({
                barcode: barcode
            });
            setVisibleLoadingDialog(true)

            const response = await fetch(`${settings.serverAddress}/api/warehouse/barcode-searching?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`,
                },
                // body: JSON.stringify({
                //     ean: text.trim()
                // })
            });

            if (!response.ok) {
                console.log(response.status, await response.json());

                throw new Error('Błąd sieciowy');
            }

            const data = await response.json();
            // Tutaj możesz obsłużyć odpowiedź, np. zaktualizować stan
            console.log(data);
            setData(data);

            // Opcjonalnie: wyczyść pole po udanym zapytaniu
            // setText('');
            // handleClearAndFocus();
        } catch (error) {
            console.error('Błąd:', error);
            // Tutaj możesz dodać obsługę błędów, np. wyświetlić alert
        }
        finally {
            setVisibleLoadingDialog(false);
        }
    };


    const AccordionSection = ({title, type}: { title: string, type: string }) => {

        return (
            <List.Section>
                <List.Accordion
                    title={title + ": " +
                        (data ?
                                data?.stock[type].reduce((sum, item) => sum + item.quantity, 0)
                                :
                                "0"
                        )
                    }

                >
                    {data?.stock[type].map((item, index) => (
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
                            <Card.Title title={data?
                                data.product.product.symbol
                                :
                                "Produkt"
                            }/>
                            <Card.Content>
                                <View>
                                    <Avatar.Image
                                        size={80}
                                        source={{
                                            uri: `${settings.serverAddress}/images/basic/`+ data?.product.images.filter(image => image.main===1)[0].slug,
                                        }}
                                        style={{backgroundColor: MD2Colors.grey300}}
                                    />
                                </View>
                                <Text>Model: {data?.product.model.symbol}</Text>
                                <Text>Kolor: {data?.product.color.shortcut} - {data?.product.color.name}</Text>
                                <Text>Rozmiar: {data?.product.product.size}</Text>
                            </Card.Content>
                        </Card>


                        <Card style={styles.card}>
                            <Card.Content>
                                {/*stan dostawcy*/}
                                <AccordionSection title={"Dostawcy"} type={"suppliers"}/>
                                <Divider/>
                                {/*stan sklepy*/}
                                <AccordionSection title={"Sklepy"} type={"shops"}/>
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
            <Portal>
                <Dialog visible={visibleLoadingDialog} style={styles.loadingDialog}>
                    <Dialog.Content>
                        <ActivityIndicator animating={true} size={'large'}  color={'#0a1f3c'}/>
                    </Dialog.Content>
                </Dialog>
            </Portal>
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
    loadingDialog:{
        width: 100,
        alignSelf: 'center', // centrowanie w poziomie
        justifyContent: 'center', // centrowanie w pionie
        position: 'absolute',
        top: '50%', // pozycjonowanie na środku ekranu
        left: '50%', // pozycjonowanie na środku ekranu
        transform: [
            { translateX: -50 }, // przesunięcie o połowę szerokości
            { translateY: -50 }  // przesunięcie o połowę wysokości
        ]
    },
});
