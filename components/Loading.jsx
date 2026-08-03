import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import loaderIcon from "../assets/icons/loader.png";
import ImageContain from "./ImageContain";

const Loading = ({ style = {}, text = "Loading...", ...props }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[style]} {...props}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View style={[{ marginRight: 10 }, animatedStyle]}>
          <ImageContain size={20} source={loaderIcon} />
        </Animated.View>
        {/* <ThemedText>{text}</ThemedText> */}
      </View>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({});
