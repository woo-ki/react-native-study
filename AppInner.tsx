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
import usePermissions from "./src/hooks/usePermissions";
import SplashScreen from "react-native-splash-screen";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

export type LoggedInParamList = {
    Orders: undefined;
    Settings: undefined;
    Delivery: undefined;
    Ing: undefined;
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
    usePermissions();

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
                Alert.alert("??????", "?????? ????????? ????????????.");
            }
        } finally {
            SplashScreen.hide();
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            // ??? ?????? ??? ?????? ????????? ??????????????? ??????
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
                            console.log("???????????? ?????????");
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
                        options={{
                            title: "?????? ??????",
                            tabBarIcon: () => (
                                <FontAwesome5Icon name="list" size={20} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Delivery"
                        component={Delivery}
                        options={{
                            title: "??????",
                            headerShown: false,
                            tabBarIcon: () => (
                                <FontAwesome5Icon name="map" size={20} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Settings"
                        component={Settings}
                        options={{
                            title: "??? ??????",
                            unmountOnBlur: true,
                            tabBarIcon: () => (
                                <FontAwesomeIcon name="gear" size={20} />
                            ),
                        }}
                    />
                </Tab.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen
                        name="SignIn"
                        component={SignIn}
                        options={{title: "?????????"}}
                    />
                    <Stack.Screen
                        name="SignUp"
                        component={SignUp}
                        options={{title: "????????????"}}
                    />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppInner;
