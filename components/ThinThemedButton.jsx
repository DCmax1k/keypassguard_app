import Colors from "@/constants/Colors";
import { Pressable, StyleSheet } from "react-native";
import ThemedText from "./ThemedText";

const ThinThemedButton = ({ style = {}, onPress = () => {}, text = "" }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          borderColor: "#75b2d6",
          backgroundColor: Colors.dark.background,
          borderWidth: 1,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          zIndex: 1,
        },
        style,
      ]}
    >
      <ThemedText>{text}</ThemedText>
    </Pressable>
  );
};

export default ThinThemedButton;

const styles = StyleSheet.create({});
