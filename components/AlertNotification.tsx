import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Portal } from "react-native-paper";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInUp,
  SlideOutUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import checkIcon from "../assets/icons/check.png";
import greyX from "../assets/icons/greyX.png";
import Colors from "../constants/Colors";
import { generateUniqueId } from "../util/uniqueId";
import ImageContain from "./ImageContain";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

// 1. Explicitly type what an individual Alert instance looks like
class Alert {
  color: string;
  message: string;
  icon: any; // Change to your specific ImageSource type if needed
  id: string;
  imgStyle: ViewStyle;

  constructor(message = "No message provided", good = true) {
    this.color = good ? "#31AC6E" : Colors.bad;
    this.message = message;
    this.icon = good ? checkIcon : greyX;
    this.id = generateUniqueId();
    this.imgStyle = good ? { marginTop: -4 } : {};
  }
}

// 2. Define the methods exposed to the parent component via the ref
export interface AlertNotificationHandle {
  showAlert: (message: string, good?: boolean, time?: number) => void;
  clearAlerts: () => void;
}

// 3. Define props if there are any custom ones you pass down
interface AlertNotificationProps {
  style?: ViewStyle;
  [key: string]: any; // Allows other unstructured props (...props)
}

// 4. Wrap forwardRef with your types: forwardRef<HandleType, PropsType>
const AlertNotification = forwardRef<
  AlertNotificationHandle,
  AlertNotificationProps
>(({ style, ...props }, ref) => {
  // Specify that state holds an array of our Alert instances
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  const showAlert = (message: string, good = true, time = 3000) => {
    const alert = new Alert(message, good);
    setAlerts((prev) => [...prev, alert]);
    if (time === 3000 && message.length > 60) {
      time = 6000;
    }

    const timeout = setTimeout(() => {
      removeAlert(alert.id);
    }, time);

    timeoutsRef.current.push(timeout);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    showAlert,
    clearAlerts,
  }));

  return (
    <Portal>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.fullScreenOverlay}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            {alerts.map((alert) => (
              <Animated.View
                key={alert.id}
                layout={LinearTransition.springify().damping(90)}
                entering={SlideInUp.springify().damping(90)}
                exiting={SlideOutUp}
                style={{ pointerEvents: "auto", marginBottom: 5 }}
              >
                <Pressable
                  onPress={() => removeAlert(alert.id)}
                  style={{
                    backgroundColor: alert.color,
                    borderRadius: 20,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#00000049",
                      height: 30,
                      width: 30,
                      borderRadius: 30,
                      marginRight: 10,
                    }}
                  >
                    <ImageContain
                      source={alert.icon}
                      size={20}
                      imgStyle={[{ tintColor: "white" }]}
                      style={[alert.imgStyle]}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      color: "white",
                      maxWidth: screenWidth - 100,
                    }}
                  >
                    {alert.message}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </SafeAreaView>
      </Animated.View>
    </Portal>
  );
});

export default AlertNotification;

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    pointerEvents: "none",
  },
});
