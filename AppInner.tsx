import React, {useCallback, useEffect} from "react";
import Orders from "./src/pages/Orders";
import Delivery from "./src/pages/Delivery";
import Settings from "./src/pages/Settings";
import SignIn from "./src/pages/SignIn";
import SignUp from "./src/pages/SignUp";
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {useSelector} from "react-redux";
import {RootState} from "./src/store/reducer";
import useSocket from "./src/hooks/useSocket";
import {useAppDispatch} from "./src/store";
import EncryptedStorage from "react-native-encrypted-storage";
import axios, {AxiosError} from "axios";
import Config from "react-native-config";
import userSlice from "./src/slices/user";
import {Alert} from "react-native";
import orderSlice from "./src/slices/order";

export type LoggedInParamList = {
    Orders: undefined;
    Settings: undefined;
    Delivery: undefined;
    Complete: {orderId: string};
};

export type RootStackParamList = {
    SignIn: undefined;
    SignUp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppInner = () => {
    const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
    const [socket, disconnect] = useSocket();
    const dispatch = useAppDispatch();

    const tokenRefresh = useCallback(async () => {
        try {
            const token = await EncryptedStorage.getItem("refreshToken");
            if (!token) {
                return;
            }
            const response = await axios.post(
                `${Config.API_URL}/refreshToken`,
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                },
            );
            dispatch(
                userSlice.actions.setUser({
                    name: response.data.data.name,
                    email: response.data.data.email,
                    accessToken: response.data.data.accessToken,
                }),
            );
            return response.data.data.accessToken;
        } catch (error) {
            console.error(error);
            if (
                ((error as AxiosError).response?.data as {code?: string})
                    .code === "expired"
            ) {
                Alert.alert("알림", "다시 로그인 해주세요.");
            }
        } finally {
            // wooki 스플래시 스크린 제거
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            // 앱 실행 시 토큰 있으면 로그인하는 코드
            await tokenRefresh();
            axios.interceptors.response.use(
                res => res,
                error => {
                    const {
                        config,
                        response: {status},
                    } = error;

                    if (status === 419) {
                        if (error.response.data.code === "expired") {
                            console.log("만료되서 갱신함");
                            tokenRefresh().then(r => {
                                const origin = config;
                                origin.headers.authorization = `Bearer ${r}`;
                                return axios(origin);
                            });
                        } else {
                            return Promise.reject(error);
                        }
                    } else {
                        return Promise.reject(error);
                    }
                },
            );
        };
        init().then();
        return () => {};
    }, []);

    useEffect(() => {
        const callback = (data: any) => {
            console.log(data);
            dispatch(orderSlice.actions.addOrder(data));
        };

        if (socket && isLoggedIn) {
            socket.emit("acceptOrder", "hello");
            socket.on("order", callback);
        }
        return () => {
            if (socket) {
                socket.off("order", callback);
            }
        };
    }, [isLoggedIn, socket]);

    useEffect(() => {
        if (!isLoggedIn) {
            console.log("!isLoggedIn", !isLoggedIn);
            disconnect();
        }
    }, [isLoggedIn, disconnect]);
    return (
        <NavigationContainer>
            {isLoggedIn ? (
                <Tab.Navigator>
                    <Tab.Screen
                        name="Orders"
                        component={Orders}
                        options={{title: "오더 목록"}}
                    />
                    <Tab.Screen
                        name="Delivery"
                        component={Delivery}
                        options={{headerShown: false}}
                    />
                    <Tab.Screen
                        name="Settings"
                        component={Settings}
                        options={{title: "내 정보"}}
                    />
                </Tab.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen
                        name="SignIn"
                        component={SignIn}
                        options={{title: "로그인"}}
                    />
                    <Stack.Screen
                        name="SignUp"
                        component={SignUp}
                        options={{title: "회원가입"}}
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppInner;
