import React, {useCallback, useEffect} from "react";
import {Alert, FlatList, Pressable, StyleSheet, Text, View} from "react-native";
import axios, {AxiosError} from "axios";
import Config from "react-native-config";
import {useAppDispatch} from "../store";
import userSlice from "../slices/user";
import {useSelector} from "react-redux";
import {RootState} from "../store/reducer";
import EncryptedStorage from "react-native-encrypted-storage";
import orderSlice, {Order} from "../slices/order";
import CompleteOrder from "../components/CompleteOrder";

function Settings() {
    const {accessToken, name, money, completes} = useSelector(
        (state: RootState) => {
            return {
                accessToken: state.user.accessToken,
                name: state.user.name,
                money: state.user.money,
                completes: state.order.completes,
            };
        },
    );
    const dispatch = useAppDispatch();

    useEffect(() => {
        async function getMoney() {
            const response = await axios.get<{data: number}>(
                `${Config.API_URL}/showmethemoney`,
                {
                    headers: {authorization: `Bearer ${accessToken}`},
                },
            );
            dispatch(userSlice.actions.setMoney(response.data.data));
        }
        getMoney().then();
    }, [accessToken]);

    useEffect(() => {
        async function getCompletes() {
            const response = await axios.get<{data: Order[]}>(
                `${Config.API_URL}/completes`,
                {
                    headers: {authorization: `Bearer ${accessToken}`},
                },
            );
            dispatch(orderSlice.actions.setCompletes(response.data.data));
        }
        getCompletes().then();
    }, [accessToken]);

    const onLogout = useCallback(async () => {
        try {
            await axios.post(
                `${Config.API_URL}/logout`,
                {},
                {
                    headers: {
                        authorization: `Bearer ${accessToken}`,
                    },
                },
            );
            Alert.alert("알림", "로그아웃 되었습니다.");
            dispatch(
                userSlice.actions.setUser({
                    name: "",
                    email: "",
                    accessToken: "",
                }),
            );
            await EncryptedStorage.removeItem("refreshToken");
        } catch (error) {
            const errorResponse = (error as AxiosError).response;
            console.error(errorResponse);
        }
    }, [accessToken]);

    const renderItem = useCallback(({item}: {item: Order}) => {
        return <CompleteOrder order={item} />;
    }, []);

    return (
        <View>
            <View style={styles.money}>
                <Text style={styles.moneyText}>
                    {name}님의 수익금{" "}
                    <Text style={{fontWeight: "bold"}}>
                        {money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </Text>
                    원
                </Text>
            </View>
            <View>
                <FlatList
                    data={completes}
                    keyExtractor={o => o.orderId}
                    numColumns={3}
                    renderItem={renderItem}
                />
            </View>
            <View style={styles.buttonZone}>
                <Pressable
                    style={StyleSheet.compose(
                        styles.loginButton,
                        styles.loginButtonActive,
                    )}
                    onPress={onLogout}>
                    <Text style={styles.loginButtonText}>로그아웃</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    money: {
        padding: 20,
    },
    moneyText: {
        fontSize: 16,
    },
    buttonZone: {
        alignItems: "center",
        paddingTop: 20,
    },
    loginButton: {
        backgroundColor: "gray",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    loginButtonActive: {
        backgroundColor: "blue",
    },
    loginButtonText: {
        color: "white",
        fontSize: 16,
    },
});

export default Settings;
