import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Portal } from 'react-native-paper';
import threeEllipses from '../assets/icons/threeEllipses.png';
import Animated, { FadeIn, FadeOut, LightSpeedInRight, withDelay, withSpring, withTiming, ZoomInRight, ZoomOutRight } from 'react-native-reanimated';
import { transform } from 'typescript';
import * as Haptics from 'expo-haptics';

// For android pressable fix
import { TouchableOpacity } from '@gorhom/bottom-sheet';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');
const MENU_WIDTH = 250;
const ITEM_HEIGHT = 40;
const MAX_MENU_WIDTH = screenWidth - 80;

const MeasureMenuItems = ({ data, onMeasured }) => {
  const handleLayout = (e) => {
    const { width } = e.nativeEvent.layout;
    onMeasured(width > MAX_MENU_WIDTH ? MAX_MENU_WIDTH : width);
  };

  return (
    <View style={{ position: 'absolute', opacity: 0, left: -1000, top: -1000 }} onLayout={handleLayout}>
      {data.map((item, i) => (
        <Text key={i}  style={{ fontSize: 14 }}>
          {item.title}
        </Text>
      ))}
    </View>
  );
};


const ActionMenu = ({ data, backgroundColor, icon=threeEllipses, title="", style, pressableStyle, offset = false, touchablePressable = false, ...props }) => { // TouchablePressable is for android for active workout bug not registering
  const [active, setActive] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const [upperHalf, setUpperHalf] = useState(true);
  // const [menuWidth, setMenuWidth] = useState(0); // Dynamic width

  const MENU_HEIGHT = ITEM_HEIGHT*data.length;

  const [menuWidth, setMenuWidth] = useState(0);
  const [menuMeasured, setMenuMeasured] = useState(false);

  const openMenu = () => {

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (!menuMeasured) {
      console.log("Menu not measured"); // Recreate by holding grip drag but no moving
      
      return;
     } 

    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const isLowerHalf = pageY > screenHeight / 2;
      const menuPos = {
        x: (pageX) - menuWidth + width,
        y: isLowerHalf
          ? pageY - ITEM_HEIGHT * data.length
          : pageY + height
      };
      setMenuPos(menuPos);
      setUpperHalf(!isLowerHalf);
      setActive(true);
    });
  };

  useEffect(() => {
    setMenuMeasured(false);
    setMenuWidth(0);
  }, [data.length]);
  

  return (
    <>
    {!menuMeasured && (
      <MeasureMenuItems
        key={data.length}
        data={data}
        onMeasured={(width) => {
          setMenuWidth((prev) => Math.max(prev, width)+60); // optional padding
          setMenuMeasured(true);
        }}
      />
    )}
    <View 
      ref={buttonRef} 
      collapsable={false} // Crucial: prevents Android from optimizing away the view
      style={[{ zIndex: 2 }, pressableStyle]}
    >

    {touchablePressable ? (
      <TouchableOpacity
        // ref={buttonRef}
        onPress={openMenu}
        // style={[{zIndex: 2,}, pressableStyle]}
        
      >
        {props.children ? (
          {...props.children}
        ) : (
          <View style={[{
                paddingVertical: 0,
                paddingHorizontal: 5,
                backgroundColor,
                borderRadius: 5,
                flexDirection: "row",
              }, style]}>
            <Image style={{ width: 20, height: 20, resizeMode: 'contain',  }} source={icon} />
            {title && <Text style={{fontSize: 15, color: "white", fontWeight: 600, marginLeft: 10}}>{title}</Text>}
          </View>
        )}
      </TouchableOpacity>
    ) : (
      <Pressable
        // ref={buttonRef}
        onPress={openMenu}
        // style={[{zIndex: 2,}, pressableStyle]}
        
      >
        {props.children ? (
          {...props.children}
        ) : (
          <View style={[{
                paddingVertical: 0,
                paddingHorizontal: 5,
                backgroundColor,
                borderRadius: 5,
                flexDirection: "row",
              }, style]}>
            <Image style={{ width: 20, height: 20, resizeMode: 'contain',  }} source={icon} />
            {title && <Text style={{fontSize: 15, color: "white", fontWeight: 600, marginLeft: 10}}>{title}</Text>}
          </View>
        )}
      </Pressable>
    )}
      





    </View>

      <Portal>
          {active && menuMeasured && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.fullScreenOverlay}>
            {/* BACKDROP - dismisses when tapped */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                setActive(false);
              }}
            />

            {/* MENU */}
            <Animated.View
              entering={ZoomInRight.duration(200)}
              exiting={ZoomOutRight.duration(400)}
              style={[
                styles.menu,
                {
                  top: menuPos.y,
                  left: menuPos.x,
                  width: menuWidth || 0,
                  maxHeight: ITEM_HEIGHT * 7.5, // max height so scroll works for >7
                },
              ]}
            >
              <ScrollView scrollEnabled={data.length > 7}>
                {data.map((item, i) => (
                  <Pressable
                    key={i}
                    onPress={() => {
                      setActive(false);
                      item.onPress();
                    }}
                    style={[styles.menuItem, { height: ITEM_HEIGHT }]}
                  >
                    {item.icon ? (
                      <Image
                        style={{
                          height: 15,
                          width: 15,
                          objectFit: 'contain',
                          tintColor: item.color || 'white',
                        }}
                        source={item.icon}
                      />
                    ) : (
                      <View
                        style={{
                          width: 10,
                          height: 2,
                          borderRadius: 99,
                          backgroundColor: 'white',
                        }}
                      />
                    )}
                    <View style={styles.menuItemText}>
                      <Text style={{ color: item.color || 'white' }}>{item.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        )}
      </Portal>
    </>
  );
};

export default ActionMenu;

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  menu: {
    position: 'absolute',
    // width: MENU_WIDTH,
    maxWidth: MAX_MENU_WIDTH,
    backgroundColor: '#444444',
    borderRadius: 15,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: "center",
    paddingHorizontal: 10,
  },
  menuItemText: {
    paddingVertical: 8,
    paddingHorizontal: 16,

    
  },
});

