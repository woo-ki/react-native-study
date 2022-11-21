import React from "react";
import FastImage from "react-native-fast-image";
import {Order} from "../slices/order";
import Config from "react-native-config";
import {Dimensions} from "react-native";

const CompleteOrder = ({order}: {order: Order}) => {
    return (
        <FastImage
            source={{uri: `${Config.API_URL}/${order.image}`}}
            resizeMode={"contain"}
            style={{
                height: Dimensions.get("window").width / 3,
                width: Dimensions.get("window").width / 3,
            }}
        />
    );
};

export default CompleteOrder;
