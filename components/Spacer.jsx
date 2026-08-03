import React from "react";
import { StyleSheet, View } from "react-native";

const Spacer = ({
  height = 40,
  bar = false,
  barColor = "#ffffff56",
  barWidth = 1,
  width = "100%",
  style = {},
}) => {
  return (
    <View
      style={[
        {
          width: "100%",
          height,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      {bar && (
        <View
          style={{
            backgroundColor: barColor,
            height: barWidth,
            borderRadius: 9999,
            width,
          }}
        ></View>
      )}
    </View>
  );
};

export default Spacer;

const styles = StyleSheet.create({});
