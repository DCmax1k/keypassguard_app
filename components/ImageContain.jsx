import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import exIcon from "../assets/icons/aiSparkle.png";

const ImageContain = ({
  style = {},
  imgStyle = {},
  source = exIcon,
  cover = false,
  size = 20,
  width = 0,
  height = 0,
  ...props
}) => {
  return (
    <View
      style={[
        { height: height ? height : size, width: width ? width : size },
        style,
      ]}
      {...props}
    >
      <Image
        source={source}
        contentFit={cover ? "cover" : "contain"}
        style={[{ height: "100%", width: "100%" }, imgStyle]}
      />
    </View>
  );
};

export default ImageContain;

const styles = StyleSheet.create({});
