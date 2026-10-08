import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import ThemedText from "./ThemedText";

import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import rightArrow from "../assets/icons/rightArrow.png";
import threeEllipses from "../assets/icons/threeEllipses.png";
import trash from "../assets/icons/trash.png";
import { Colors } from "../constants/Colors";
import ActionMenu from "./ActionMenu";

const screenWidth = Dimensions.get("window").width;

const TitleWithBack = ({
  style,
  backBtn = true,
  backBtnStyles,
  actionBtnStyles,
  fontSize = 20,
  leftBtnNotificationAmount = 2,
  actionBtnIconStyles,
  leftActionBtnIconStyles,
  backFunction = () => router.back(),
  actionBtn = {
    active: false,
    actionMenu: false,
    image: threeEllipses,
    options: [
      {
        title: "Delete workout",
        icon: trash,
        onPress: () => console.log("Pressed"),
      },
    ],
  },
  leftActionBtn = {
    active: false,
    actionMenu: false,
    image: threeEllipses,
    options: [
      {
        title: "Delete workout",
        icon: trash,
        onPress: () => console.log("Pressed"),
      },
    ],
  },
  ...props
}) => {
  return (
    <View
      style={[
        { position: "relative", marginTop: 20, width: screenWidth },
        style,
      ]}
      {...props}
    >
      {leftActionBtn.active ? (
        <Pressable onPress={leftActionBtn.action} style={[styles.backBtn]}>
          {leftBtnNotificationAmount > 0 && (
            <View
              style={{
                position: "absolute",
                minWidth: 17,
                height: 17,
                paddingHorizontal: 3,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.protein,
                borderRadius: 9999,
                top: 0,
                right: 0,
              }}
            >
              <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
                {leftBtnNotificationAmount}
              </Text>
            </View>
          )}
          <Image
            style={[styles.actionBtnIcon, leftActionBtnIconStyles]}
            source={leftActionBtn.image}
          />
        </Pressable>
      ) : backBtn ? (
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            backFunction();
          }}
          style={[styles.backBtn, backBtnStyles]}
        >
          <Image style={styles.backBtnIcon} source={rightArrow} />
        </Pressable>
      ) : null}
      {/* {backBtn &&
        <Pressable onPress={() => {backFunction() }} style={styles.backBtn}>
            <Image style={styles.backBtnIcon} source={rightArrow} />
        </Pressable>} */}

      <View style={{ width: "100%", alignItems: "center" }}>
        <View style={{ maxWidth: "70%" }}>
          <ThemedText
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontSize, fontWeight: 700, textAlign: "center" }}
          >
            {props.title}
          </ThemedText>
        </View>
      </View>

      {actionBtn.actionMenu === true && actionBtn.options.length > 0 ? (
        <ActionMenu
          pressableStyle={styles.actionBtn}
          data={actionBtn.options}
        />
      ) : null}
      {actionBtn.active && (
        <Pressable
          onPress={actionBtn.action}
          style={[styles.actionBtn, actionBtnStyles]}
        >
          <Image
            style={[styles.actionBtnIcon, actionBtnIconStyles]}
            source={actionBtn.image}
          />
        </Pressable>
      )}
    </View>
  );
};

export default TitleWithBack;

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: "50%",
    left: 6,
    transform: [{ translateY: -25 }],
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
    zIndex: 10,
  },
  backBtnIcon: {
    width: 20,
    height: 20,
    transform: [{ rotate: "180deg" }],
    objectFit: "contain",
    // backgroundColor: "white",
  },
  actionBtn: {
    position: "absolute",
    top: "50%",
    right: 6,
    transform: [{ translateY: -25 }],
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    //backgroundColor: "red",
    zIndex: 1,
  },
  actionBtnIcon: {
    width: 20,
    height: 20,
    objectFit: "contain",
    // backgroundColor: "white",
  },
});
