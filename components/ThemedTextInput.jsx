import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import eyeIcon from "../assets/icons/eye.png"
import noEyeIcon from "../assets/icons/noEye.png"

const ThemedTextInput = ({height = 80, width = "100%", backgroundColor = "#252525", placeholder = "Placeholder", color="#7D7D7D", fontSize = 18, autoCorrect = false, value = "", type="text", locked=false, onChange=(e) => {}, ...props}) => {

  const initialFontSize = fontSize;
  const activeFontSize = fontSize - 5;

  const initialPlaceholderPositionTop = height/2;
  const activePlaceholderPositionTop = 0;

  const [focused, setFocused] = React.useState(false);
  const [hidePassword, setHidePassword] = React.useState(type === "password" ? true : false);

  useEffect(() => {
    if (focused || value) {
      placeholderFontSize.value = withTiming(activeFontSize, { duration: 200 });
      placeholderPosition.value = withTiming(activePlaceholderPositionTop, { duration: 200 });
    } else {
      placeholderFontSize.value = withTiming(initialFontSize, { duration: 200 });
      placeholderPosition.value = withTiming(initialPlaceholderPositionTop, { duration: 200 });
    }
  }, [focused, value]);

  // Animations
  const placeholderFontSize = useSharedValue(initialFontSize);
  const placeholderAnimationStyle = useAnimatedStyle(() => {
    return {

      fontSize: placeholderFontSize.value,
    }
  }, [])

  const placeholderPosition = useSharedValue(0);
  const placeholderPositionStyle = useAnimatedStyle(() => {
    return {
      top: placeholderPosition.value,
    }
  }, [])


  return (
    <View style={{height: height, width: width, overflow: "visible", position: "relative"}}>
      {/* Background */}
      <View style={{backgroundColor: backgroundColor, height: "100%",flex: 1, borderRadius: 15, marginHorizontal: 30, zIndex: 0 }}></View>
      {/* Placeholder */}
      <Animated.View style={[{position: "absolute", top: initialPlaceholderPositionTop, transform: [{translateY: "-50%"}], left: 40,paddingHorizontal: 10, paddingVertical: 5, backgroundColor: backgroundColor, borderRadius: 9999, zIndex: 1}, placeholderPositionStyle]} >
        <Animated.Text style={[{color: color, fontSize: fontSize, fontFamily: "DoppioOne-Regular"}, placeholderAnimationStyle]}>{placeholder}</Animated.Text>
      </Animated.View>
      
      {/* Input */}
      <View style={{zIndex: 2, position: "absolute", top: 0, left: 0, height: "100%", width: "100%",}}>
        <TextInput
          autoCorrect={autoCorrect}
          style={{height: "100%", width: "100%", color: locked ? "#7D7D7D" : "white", fontSize: fontSize, paddingHorizontal: 50, paddingVertical: 20, paddingRight: type==='password' ? 80 : 50, fontFamily: "DoppioOne-Regular", backgroundColor: "transparent"}}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={hidePassword}
          value={value}
          editable={!locked}
          onChange={(e) => {
            onChange(e.nativeEvent.text);
          }}
        />
      </View>
      {/* Eye */}
      {(type === "password") === true ? 
          <View style={{position: "absolute", top: "50%", right: 30, height: height, width: 50, transform: [{translateY: "-50%"}],  zIndex: 3}}>
              <Pressable style={{height: "100%", width: 40, justifyContent: "center", alignItems: "center",}} onPress={() => setHidePassword(!hidePassword)} >
                  <Image style={{height: 25, width: 25, objectFit: "contain",}} source={hidePassword ? eyeIcon : noEyeIcon} />
              </Pressable>
          </View>
      : null}
    </View>
  )
}

export default ThemedTextInput

const styles = StyleSheet.create({})