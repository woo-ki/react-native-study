import React from "react";
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
import {RootStackParamList} from "./App";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppInner = () => {
    const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
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
