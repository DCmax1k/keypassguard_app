import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const TouchableScale = ({ children, style, parentStyle=null, friction=8, tension=100, activeScale = 1.05, ...props }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: true,
      friction,
      tension,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction,
      tension,
    }).start();
  };

  return (
    <Pressable
    style={parentStyle}
      {...props}
      onPressIn={(e) => {
        onPressIn();
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        onPressOut();
        props.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default TouchableScale;
