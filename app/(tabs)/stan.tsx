import {
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    TouchableOpacity, Dimensions, Modal as RNModal, KeyboardAvoidingView, Platform

} from 'react-native';
import {Text, View} from '@/components/Themed';
import {
    ActivityIndicator,
    Avatar,
    Button,
    Card,
    Dialog,
    Divider,
    FAB, HelperText,
    IconButton,
    List, MD2Colors,
    Portal,
    TextInput, Modal, Surface
} from "react-native-paper";
import {useCallback, useRef, useState} from "react";
import {useFocusEffect} from "expo-router";
import validbarcode from "barcode-validator";
import {useSettings} from '@/components/SettingsContext';
import AwesomeGallery from 'react-native-awesome-gallery';
import {FetchDataResponse, ProductData} from "@/Interfaces/ProductData";
import {AccordionSection} from "@/components/AccordionSection";
import {Toast} from 'toastify-react-native'
import {useColorScheme} from "@/components/useColorScheme";

export default function StockScreen() {
    const {settings} = useSettings();
    const colorScheme = useColorScheme();

    const [data, setData] = useState<ProductData | null>(null);

    const [text, setText] = useState<string>("");
    const refEanInput = useRef<TextInput | null>(null);
    const [showKeyboard, setShowKeyboard] = useState(false);

    const [visibleLoadingDialog, setVisibleLoadingDialog] = useState(false);


    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;


    const [isGalleryVisible, setIsGalleryVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [infoModalVisible, setInfoModalVisible] = useState(false);

// Przygotuj tablicę zdjęć
    const galleryImages = data?.product?.images
        ? data.product.images
            .sort((a, b) => a.order - b.order)
            .map(img => (
                `${settings.serverAddress}/images/basic/${img.slug}`
            ))
        : [];


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
        setData(null)
        refEanInput.current?.blur(); // najpierw blur
        setTimeout(() => {
            refEanInput.current?.focus(); // fokus po małym opóźnieniu
        }, 100);
    };


    const handleDismissKeyboard = () => {
        Keyboard.dismiss();
        setShowKeyboard(false);
    };


    const fetchProductData = async (barcode: string): Promise<FetchDataResponse<ProductData>> => {
        const searchParams = new URLSearchParams({barcode});
        const url = `${settings.serverAddress}/api/warehouse/barcode-searching?${searchParams}`;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`,
        };

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (response.status === 401) {
            return {
                error: "Niepoprawny klucz API",
                status: response.status
            };
        }

        if (!response.ok) {
            const errorData = await response.json();
            return {
                error: errorData.error || 'Wystąpił błąd podczas wyszukiwania produktu.',
                status: response.status
            };
        }

        const data = await response.json();
        return {
            data,
            status: response.status
        };
    };

    const handleSubmit = async () => {
        const barcode = text.trim();

        if (!barcode) return;

        if (barcode.length !== 13) {
            Toast.show({
                type: "error",
                text1: "Kod EAN musi mieć 13 cyfr",
                visibilityTime: 5000,
            });
            return;
        }

        if (!validbarcode(barcode)) {
            Toast.show({
                type: "error",
                text1: "Niepoprawny kod EAN",
                visibilityTime: 5000,
            });
            return;
        }
        setVisibleLoadingDialog(true);

        fetchProductData(barcode)
            .then((response) => {
                if (response.error) {
                    Toast.show({
                        type: "error",
                        text1: response.error,
                        visibilityTime: 5000,
                    });
                    return;
                }
                if (response.data) {
                    setData(response.data);
                    console.log(response.data);
                }
            })
            .catch((error) => {
                console.error('Błąd:', error);
                Toast.show({
                    type: "error",
                    text1: "Wystąpił nieoczekiwany błąd",
                    visibilityTime: 5000,
                });
            })
            .finally(() => {
                setVisibleLoadingDialog(false);
                setText('');
            });
    };


    return (
        <View style={styles.mainContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                  style={{flex: 1}}
                                  onTouchStart={handleDismissKeyboard}
            >
                <View style={{flex: 1}}>
                    <View style={styles.inputContainerBlock}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={refEanInput}
                                mode={"outlined"}
                                keyboardType={'numeric'}
                                value={text}
                                placeholder={"Zeskanuj/wpisz kod EAN"}
                                onChangeText={text => setText(text)}
                                showSoftInputOnFocus={showKeyboard}
                                style={styles.input}
                                contextMenuHidden={true}
                                onSubmitEditing={handleSubmit} // obsługa wciśnięcia Enter
                                blurOnSubmit={false} // zapobiega utracie fokusu po wciśnięciu Enter
                                // submitBehavior={""}
                                returnKeyType="send" // zmienia tekst na przycisku Enter
                                theme={{roundness: 12}} // zaokrąglenie
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
                    </View>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollViewContent}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}

                    >
                        {data &&
                            (
                                <View style={styles.container}>
                                    <Card style={styles.card}>
                                        <Card.Content>
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                                gap: 10,
                                                backgroundColor: "transparent",
                                                position: "relative",
                                            }}>
                                                <View>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            if (galleryImages.length === 0) return;
                                                            setCurrentImageIndex(0);
                                                            setIsGalleryVisible(true);
                                                        }}
                                                    >
                                                        <Image
                                                            source={{
                                                                uri: data?.product.images?.length > 0
                                                                    ? `${settings.serverAddress}/images/basic/${data.product.images.find(image => image.order === 0)?.slug || data.product.images[0].slug}`
                                                                    : `${settings.serverAddress}/images/basic/brak.jpg`
                                                            }}
                                                            style={{
                                                                minWidth: 80,
                                                                minHeight: 120,
                                                                backgroundColor: MD2Colors.white,
                                                                resizeMode: 'contain'
                                                            }}
                                                        />
                                                    </TouchableOpacity>


                                                </View>
                                                <View style={{backgroundColor: "transparent"}}>
                                                    <Text style={{
                                                        fontSize: 20,
                                                        fontWeight: "bold"
                                                    }}>{data?.product?.product?.symbol}</Text>
                                                    <View style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        gap: 5,
                                                        alignItems: "center",
                                                        backgroundColor: "transparent"
                                                    }}>
                                                        <Text>Model: </Text>
                                                        <Text style={{
                                                            fontSize: 18,
                                                            fontWeight: "bold"
                                                        }}>{data?.product?.model?.symbol}</Text>
                                                    </View>
                                                    <View style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        gap: 5,
                                                        alignItems: "center",
                                                        backgroundColor: "transparent"
                                                    }}>
                                                        <Text>Kolor: </Text>
                                                        <Text style={{
                                                            fontSize: 18,
                                                            fontWeight: "bold"
                                                        }}>{data?.product?.color?.shortcut}</Text>
                                                        <Text>-</Text>
                                                        <Text style={{
                                                            fontSize: 16,
                                                            fontWeight: "bold"
                                                        }}>{data?.product?.color?.name}</Text>
                                                    </View>
                                                    <View style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        gap: 5,
                                                        alignItems: "center",
                                                        backgroundColor: "transparent"
                                                    }}>
                                                        <Text>Rozmiar: </Text>
                                                        <Text style={{
                                                            fontSize: 18,
                                                            fontWeight: "bold"
                                                        }}>{data?.product?.product?.size}</Text>
                                                    </View>
                                                    <View style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        gap: 5,
                                                        alignItems: "center",
                                                        backgroundColor: "transparent"
                                                    }}>
                                                        <Text>Zarezerwowane: </Text>
                                                        <Text style={{
                                                            fontSize: 18,
                                                            fontWeight: "bold"
                                                        }}>{data?.product?.product?.quantity - data?.product?.product?.available}</Text>
                                                    </View>
                                                </View>
                                                <View
                                                    style={{
                                                        position: "absolute",
                                                        bottom: -8,
                                                        right: -8,
                                                        backgroundColor: "transparent",
                                                    }}>
                                                    <IconButton
                                                        icon="information"
                                                        size={24}
                                                        onPress={() => setInfoModalVisible(true)}
                                                        style={{backgroundColor: "#0a1f3cbf", margin: 0}}
                                                        iconColor="#fff"
                                                    />
                                                </View>
                                            </View>


                                        </Card.Content>
                                    </Card>
                                    <Card style={styles.card}>
                                        <Card.Content>
                                            {/*stan dostawcy*/}
                                            <AccordionSection
                                                title="Dostawcy"
                                                type="suppliers"
                                                data={data}
                                            />
                                            <AccordionSection
                                                title="Sklepy"
                                                type="shops"
                                                data={data}
                                            />
                                            <AccordionSection
                                                title="Inne"
                                                type="other"
                                                data={data}
                                            />
                                        </Card.Content>
                                    </Card>
                                </View>
                            )
                        }
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <FAB
                icon="refresh"
                style={styles.fab}
                onPress={handleClearAndFocus}
            />
            <Portal>
                <Dialog visible={visibleLoadingDialog} style={styles.loadingDialog}>
                    <Dialog.Content>
                        <ActivityIndicator animating={true} size={'large'} color={'#0a1f3c'}/>
                    </Dialog.Content>
                </Dialog>
            </Portal>
            <Portal>
                <Modal
                    visible={infoModalVisible}
                    onDismiss={() => setInfoModalVisible(false)}
                    contentContainerStyle={{
                        marginHorizontal: 20,
                        borderRadius: 20,
                        position: "relative"
                    }}
                >
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setInfoModalVisible(false)}
                        style={{
                            position: 'absolute',
                            right: 5,
                            top: 5,
                            zIndex: 1,
                        }}
                        iconColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
                    />
                    {data &&
                        (
                            <View
                                style={{
                                    backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#fafafa',
                                    padding: 20,
                                    borderRadius: 20,
                                }}>
                                <Text style={{fontSize: 20, fontWeight: 'bold'}}>Informacje o produkcie</Text>
                                <Text style={{marginTop: 10, fontSize: 15, fontWeight: 'bold'}}>Ceny:</Text>
                                <Surface elevation={2} style={styles.table}>
                                    {/* Nagłówek tabeli */}
                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableHeader, {flex: 1}]}>
                                            <Text style={styles.headerText}>Cena</Text>
                                        </View>
                                        <View style={[styles.tableHeader, {flex: 1}]}>
                                            <Text style={styles.headerText}>Netto</Text>
                                        </View>
                                        <View style={[styles.tableHeader, {flex: 1}]}>
                                            <Text style={styles.headerText}>Brutto</Text>
                                        </View>
                                    </View>

                                    {/* Wiersze tabeli */}
                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>Hurtowa</Text>
                                        </View>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>
                                                {(data?.product?.prices?.wholesale_net_price / 100).toLocaleString("pl-PL", {
                                                    style: "currency",
                                                    currency: data?.product?.prices?.currency
                                                })}
                                            </Text>
                                        </View>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>
                                                {(data?.product?.prices?.wholesale_gross_price / 100).toLocaleString("pl-PL", {
                                                    style: "currency",
                                                    currency: data?.product?.prices?.currency
                                                })}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>Detaliczna</Text>
                                        </View>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>
                                                {(data?.product?.prices?.retail_net_price / 100).toLocaleString("pl-PL", {
                                                    style: "currency",
                                                    currency: data?.product?.prices?.currency
                                                })}
                                            </Text>
                                        </View>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>
                                                {(data?.product?.prices?.retail_gross_price / 100).toLocaleString("pl-PL", {
                                                    style: "currency",
                                                    currency: data?.product?.prices?.currency
                                                })}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>B2C</Text>
                                        </View>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>
                                                {(data?.product?.prices?.b2c_net_price / 100).toLocaleString("pl-PL", {
                                                    style: "currency",
                                                    currency: data?.product?.prices?.currency
                                                })}
                                            </Text>
                                        </View>
                                        <View style={[styles.tableCell, {flex: 1}]}>
                                            <Text style={styles.cellText}>
                                                {(data?.product?.prices?.b2c_gross_price / 100).toLocaleString("pl-PL", {
                                                    style: "currency",
                                                    currency: data?.product?.prices?.currency
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                </Surface>


                                <Text style={{marginTop: 10, fontSize: 15, fontWeight: 'bold'}}>Kody kreskowe:</Text>
                                <Surface elevation={2} style={styles.table}>
                                    {data?.product?.product?.barcodes.map((barcode, index) => (
                                        <View style={styles.tableRow} key={barcode.barcode}>
                                            {barcode.main ?
                                                (
                                                    <View style={[styles.tableHeader, {flex: 1}]}>
                                                        <Text style={styles.headerText}>{barcode.barcode}</Text>
                                                    </View>
                                                )
                                                :
                                                (
                                                    <View style={[styles.tableCell, {flex: 1}]}>
                                                        <Text style={styles.cellText}>{barcode.barcode} </Text>
                                                    </View>
                                                )
                                            }
                                        </View>
                                    ))}
                                </Surface>

                            </View>
                        )
                    }


                </Modal>
            </Portal>
            <RNModal
                visible={isGalleryVisible}
                transparent={true}
                onRequestClose={() => setIsGalleryVisible(false)}
            >
                <View style={{flex: 1, backgroundColor: 'black'}}>
                    <View style={{
                        position: 'absolute',

                        top: 0,
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 20,
                        zIndex: 1,
                        backgroundColor: 'transparent',
                    }}>
                        <Text style={{color: 'white', fontSize: 16}}>
                            {currentImageIndex + 1} / {galleryImages.length}
                        </Text>
                        <TouchableOpacity onPress={() => setIsGalleryVisible(false)}>
                            <Text style={{color: 'white', fontSize: 24}}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <AwesomeGallery
                        // images={galleryImages}
                        data={galleryImages}
                        initialIndex={currentImageIndex}
                        onIndexChange={(index) => setCurrentImageIndex(index)}
                        onSwipeToClose={() => setIsGalleryVisible(false)}
                        containerDimensions={{
                            width: windowWidth,
                            height: windowHeight
                        }}
                    />
                </View>
            </RNModal>

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1, // Dodane
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 80, // dodaje przestrzeń na dole dla FAB
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        marginTop: 10
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
    },
    inputContainerBlock: {
        width: '100%',
        marginTop: -15,
        paddingTop: 25,
        paddingEnd: 10,
        paddingStart: 10,
        paddingBottom: 10,
        backgroundColor: '#0a1f3cc0',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        zIndex: 1, // Dodane
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
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
    loadingDialog: {
        width: 100,
        alignSelf: 'center', // centrowanie w poziomie
        justifyContent: 'center', // centrowanie w pionie
        position: 'absolute',
        top: '50%', // pozycjonowanie na środku ekranu
        left: '50%', // pozycjonowanie na środku ekranu
        transform: [
            {translateX: -50}, // przesunięcie o połowę szerokości
            {translateY: -50}  // przesunięcie o połowę wysokości
        ]
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    modalHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        zIndex: 1
    },
    modalNavigation: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    modalNavigationButton: {
        padding: 10
    },
    modalCloseButton: {
        color: 'white',
        fontSize: 24
    },
    modalPageIndicator: {
        color: 'white',
        fontSize: 16
    },
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeader: {
        backgroundColor: '#0a1f3cbf',
        padding: 10,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    tableCell: {
        padding: 10,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    headerText: {
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff'
    },
    cellText: {
        textAlign: 'center',
    },

});
