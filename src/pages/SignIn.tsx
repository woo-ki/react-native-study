import React, {useCallback, useRef, useState} from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../App";

type SignInScreenProps = NativeStackScreenProps<RootStackParamList, "SignIn">;

const SignIn = ({navigation}: SignInScreenProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const emailRef = useRef<TextInput | null>(null);
    const passwordRef = useRef<TextInput | null>(null);

    const onChangeEmail = useCallback((text: string) => {
        setEmail(text.trim());
    }, []);
    const onChangePassword = useCallback((text: string) => {
        setPassword(text.trim());
    }, []);
    const onSubmit = useCallback(() => {
        if (!email) {
            return Alert.alert("알림", "이메일을 입력해주세요.");
        }
        if (!password) {
            return Alert.alert("알림", "비밀번호를 입력해주세요.");
        }
        Alert.alert("알림", "로그인이 되었습니다.");
    }, [email, password]);

    const moveToSignUp = useCallback(() => {
        navigation.navigate("SignUp");
    }, [navigation]);

    const validate = email && password;

    return (
        <View>
            <View style={styles.inputWrapper}>
                <Text style={styles.label}>이메일</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="이메일을 입력해주세요."
                    value={email}
                    onChangeText={onChangeEmail}
                    importantForAutofill="yes"
                    autoComplete="email"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    returnKeyType="next"
                    ref={emailRef}
                    onSubmitEditing={() => {
                        passwordRef.current?.focus();
                    }}
                    blurOnSubmit={false}
                />
            </View>
            <View style={styles.inputWrapper}>
                <Text style={styles.label}>비밀번호</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="비밀번호를 입력해주세요."
                    value={password}
                    secureTextEntry
                    onChangeText={onChangePassword}
                    importantForAutofill="yes"
                    autoComplete="password"
                    textContentType="password"
                    ref={passwordRef}
                    onSubmitEditing={onSubmit}
                />
            </View>
            <View style={styles.buttonZone}>
                <Pressable
                    onPress={onSubmit}
                    style={
                        !validate
                            ? styles.loginButton
                            : [styles.loginButton, styles.loginButtonActive]
                    }>
                    <Text style={styles.loginButtonText}>로그인</Text>
                </Pressable>
                <Pressable onPress={moveToSignUp}>
                    <Text>회원가입하기</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        padding: 20,
    },
    buttonZone: {
        alignItems: "center",
    },
    loginButton: {
        backgroundColor: "gray",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        marginBottom: 10,
    },
    loginButtonActive: {
        backgroundColor: "blue",
    },
    loginButtonText: {
        color: "white",
        fontSize: 16,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 20,
    },
    textInput: {
        padding: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});

export default SignIn;
