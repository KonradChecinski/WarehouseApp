import React, {useState} from 'react';
import {LayoutChangeEvent, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Surface, Text,} from 'react-native-paper';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    interpolate,
    withSpring
} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import type {AccordionProps} from './AccordionProps';
import {StockItem} from "@/Interfaces/ProductData";

export const AccordionSection: React.FC<AccordionProps> = ({title, type, data}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const rotateAnimation = useSharedValue(0);
    const heightAnimation = useSharedValue(0);

    const items: Array<StockItem> = data?.stock[type] || [];
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity.quantity, 0);
    const totalInDelivery = items.reduce((sum, item) => sum + (item.quantity.currently_in_delivery || 0), 0);

    const onContentLayout = (event: LayoutChangeEvent) => {
        const {height} = event.nativeEvent.layout;
        setContentHeight(height);
    };

    const toggleAccordion = () => {
        setIsExpanded(!isExpanded);
        rotateAnimation.value = withSpring(isExpanded ? 0 : 1);
        heightAnimation.value = withTiming(isExpanded ? 0 : 1, {duration: 300});
    };

    const arrowStyle = useAnimatedStyle(() => {
        const rotation = interpolate(
            rotateAnimation.value,
            [0, 1],
            [0, 180]
        );

        return {
            transform: [
                {rotateZ: `${rotation}deg`}
            ]
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(
                heightAnimation.value,
                [0, 1],
                [0, contentHeight]
            ),
            opacity: heightAnimation.value
        };
    });


    return (
        <View style={styles.container}>
            <Surface elevation={5}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={toggleAccordion}
                        style={styles.header}
                    >

                        <View style={styles.titleContainer}>

                            <Text style={styles.title}>
                                {title}: {totalQuantity} {totalInDelivery != 0 ? "(+" + totalInDelivery + ")" : ""}
                            </Text>

                        </View>
                        <Animated.View style={arrowStyle}>
                            <Ionicons
                                name="chevron-down"
                                size={24}
                                color="#fff"
                            />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <Animated.View style={[styles.content, contentStyle]}>
                    <View style={styles.measureContainer} onLayout={onContentLayout}>
                        {items.sort((a, b) => a.symbol.localeCompare(b.symbol)).map((item, index) => (
                            <View
                                key={item.name + index}
                                style={styles.itemContainer}
                            >
                                <Text style={styles.itemName}>{item.symbol} - {item.name}</Text>
                                <Text
                                    style={styles.itemQuantity}>
                                    {item.quantity.currently_in_delivery != 0 ? "(+" + item.quantity.currently_in_delivery + ") " : ""}
                                    {item.quantity.quantity}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </Surface>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
        borderColor: "#0a1f3cbf",
        borderWidth: 2,
    },
    headerContainer: {
        backgroundColor: '#0a1f3cbf',
        marginLeft: -1,
        marginRight: -1,
        marginTop: -1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        // backgroundColor: '#f5f5f5',
    },
    titleContainer: {
        flex: 1,
        backgroundColor: "transparent"
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        overflow: 'hidden',
    },
    measureContainer: {
        position: 'absolute',
        width: '100%',
    },

    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemName: {
        flex: 1,
        fontSize: 14,
    },
    itemQuantity: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});