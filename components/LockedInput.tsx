import copyToCB from "@/assets/icons/copy.svg";
import eye from "@/assets/icons/eye.png";
import noEye from "@/assets/icons/noEye.png";
import wandImg from "@/assets/icons/wand.svg";

import Colors from "@/constants/Colors";
import generateSecurePassword from "@/util/generateSecurePassword";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import ImageContain from "./ImageContain";

interface LockedInputProps {
  type?: "text" | "password" | "textarea";
  value?: string;
  setValue?: (text: string) => void;
  placeholder?: string;
  locked?: boolean;
  copy?: boolean;
  copyCallback?: () => void;
  requestView?: () => string | Promise<string>;
  wand?: boolean;
  onFocus?: (e: any) => void;
}

export interface LockedInputRef {
  hideText: () => void;
}

const fixedInputHeight = 60;

const LockedInput = forwardRef<LockedInputRef, LockedInputProps>(
  (
    {
      type = "text",
      value = "",
      setValue = (e: string) => {},
      placeholder = "",
      locked = false,
      copy = false,
      copyCallback = () => {
        console.log("Need copy callback");
      },
      requestView = () => {},
      wand = false,
      onFocus = () => {},
    },
    ref,
  ) => {
    const [canView, setCanView] = useState(type === "password" ? false : true);

    const toggleView = async () => {
      if (!canView) await requestView();
      setCanView(!canView);
    };

    const hideText = () => {
      setCanView(false);
    };

    useImperativeHandle(ref, () => ({
      hideText,
    }));

    const fillSecurePassword = () => {
      const pass = generateSecurePassword();
      setValue(pass);
    };

    return (
      <View
        style={[
          {
            width: "100%",
            backgroundColor: "#053147",
            borderRadius: 10,
          },
          type !== "textarea" && { height: fixedInputHeight },
        ]}
      >
        {/* Locked cover */}
        {locked && <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} />}
        {/* Buttons */}
        <View
          style={[
            { position: "absolute", top: 0, left: 0 },
            {
              pointerEvents: "box-none",
              width: "100%",
              height: fixedInputHeight,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              paddingHorizontal: 10,
              zIndex: 11,
            },
          ]}
        >
          {wand && !locked && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Pressable onPress={fillSecurePassword}>
                <ImageContain
                  source={wandImg}
                  size={20}
                  imgStyle={{ tintColor: "#bebebe" }}
                />
              </Pressable>
            </Animated.View>
          )}
          {type === "password" && (
            <Pressable onPress={toggleView}>
              <ImageContain
                source={canView ? noEye : eye}
                size={25}
                imgStyle={{ tintColor: "#bebebe" }}
              />
            </Pressable>
          )}
          {copy && (
            <Pressable onPress={copyCallback}>
              <ImageContain
                source={copyToCB}
                size={20}
                imgStyle={{ tintColor: "#bebebe" }}
              />
            </Pressable>
          )}
        </View>
        {/* Actual input */}
        <TextInput
          secureTextEntry={canView ? false : type === "password" ? true : false}
          style={[
            {
              width: "100%",
              padding: 20,
              color: locked ? "rgb(73, 132, 164)" : Colors.dark.text,
              fontSize: 17,
              fontFamily: "IBMMono",
            },
            type === "textarea"
              ? { minHeight: fixedInputHeight * 2 }
              : { height: fixedInputHeight },
          ]}
          multiline={type === "textarea"}
          numberOfLines={4}
          onChangeText={(e) => !locked && setValue(e)}
          placeholder={placeholder}
          value={value}
          onFocus={onFocus}
        />
      </View>
    );
  },
);

export default LockedInput;

const styles = StyleSheet.create({});
