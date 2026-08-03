import React, { useRef } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  BounceInRight,
  FadeIn,
  FadeOut,
  SlideOutRight,
} from "react-native-reanimated";
import greyX from "../assets/icons/greyX.png";
import keyboardIcon from "../assets/icons/keyboard.png";
import searchIcon from "../assets/icons/search.png";
import Colors from "../constants/Colors";
import ActionMenu from "./ActionMenu";

const Search = ({
  style = {},
  backgroundColor = "#222222",
  actionMenuData = false,
  dismissKeyboard = false,
  autoCorrect = false,
  placeholder = "Search",
  setValue = (v) => {},
  value = "",
  ...props
}) => {
  const [showDisKeyboard, setShowDisKeyboard] = React.useState(false);

  const textInputRef = useRef(null);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchCont, { flex: 1, backgroundColor }]}>
        <Pressable
          style={styles.searchIconCont}
          onPress={() => {
            if (textInputRef.current) {
              textInputRef.current.focus();
            }
          }}
        >
          <Image style={styles.searchIcon} source={searchIcon} />
        </Pressable>

        <TextInput
          ref={textInputRef}
          {...props}
          value={value}
          onChangeText={setValue}
          autoCorrect={autoCorrect}
          style={[styles.search, { flex: 1, fontFamily: "IBMMono" }]}
          placeholder={placeholder}
          placeholderTextColor={"#A6A6A6"}
          onFocus={() => setShowDisKeyboard(true)}
          onBlur={() => setShowDisKeyboard(false)}
        />
        {/* Dismiss keyboard */}
        {dismissKeyboard && showDisKeyboard && (
          <Animated.View
            style={[styles.disKeyboard]}
            entering={BounceInRight}
            exiting={SlideOutRight}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <Image
                style={{ height: 30, width: 30, objectFit: "contain" }}
                source={keyboardIcon}
              />
            </Pressable>
          </Animated.View>
        )}

        {/* Clear input */}
        {props.value && setValue && (
          <Animated.View
            style={[styles.disKeyboard]}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                setValue("");
              }}
            >
              <Image
                style={{ height: 30, width: 30, objectFit: "contain" }}
                source={greyX}
              />
            </Pressable>
          </Animated.View>
        )}
      </View>

      {actionMenuData && (
        <ActionMenu style={{ marginLeft: 10 }} data={actionMenuData} />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    postion: "relative",
  },
  searchIconCont: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    zIndex: 1,
  },
  searchIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    tintColor: "#A6A6A6",
  },
  searchCont: {
    position: "relative",
    height: 50,
    borderRadius: 99999,
    paddingLeft: 50,
    paddingRight: 10,
  },
  search: {
    fontSize: 17,
    color: "white",
  },
  disKeyboard: {
    height: 40,
    width: 50,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    borderRadius: 10,
    borderColor: Colors.dark.background,
    borderWidth: 0,

    position: "absolute",
    right: 10,
    top: 5,
  },
});
