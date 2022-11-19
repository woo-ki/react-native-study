import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface LoginData {
    name: string;
    email: string;
    accessToken: string;
}

const initialState = {
    name: "",
    email: "",
    money: 0,
    accessToken: "",
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<LoginData>) {
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.accessToken = action.payload.accessToken;
        },
        setMoney(state, action: PayloadAction<number>) {
            state.money = action.payload;
        },
    },
    extraReducers: builder => {},
});

export default userSlice;
