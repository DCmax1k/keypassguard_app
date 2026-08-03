import { StyleSheet, Text, useColorScheme } from "react-native";
import Colors from "../constants/Colors";

const ThemedText = ({ style = {}, title = false, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.dark;

  const textStyle = title ? theme.title : theme.text;
  return (
    <Text
      style={[
        { color: props.color || textStyle, fontFamily: "IBMMono" },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedText;

const styles = StyleSheet.create({});
