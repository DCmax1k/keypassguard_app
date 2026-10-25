import keyboardIcon from "@/assets/icons/keyboard.png";
import AlertNotification, {
  AlertNotificationHandle,
} from "@/components/AlertNotification";
import ImageContain from "@/components/ImageContain";
import Colors from "@/constants/Colors";
import { AppContext } from "@/context/AppContext";
import { useUserStore } from "@/stores/useUserStore";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Keyboard, LogBox, Platform, Pressable, View } from "react-native";
import { Portal, Provider } from "react-native-paper";
import "react-native-reanimated";
import Animated, { FadeOutDown, SlideInDown } from "react-native-reanimated";
import ThemedView from "../components/ThemedView";

const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Dependencies should only be used on the web")
  ) {
    return; // Suppress this specific warning log
  }
  originalWarn(...args);
};

// Standard LogBox fallback
LogBox.ignoreAllLogs(false);

const isExpoGo = Constants.executionEnvironment === "storeClient";

let GoogleSignin: any = null;

if (!isExpoGo) {
  ({ GoogleSignin } = require("@react-native-google-signin/google-signin"));
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    IBMMono: require("@/assets/fonts/IBMPlexMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const setUser = useUserStore((state: any) => state.setUser);
  const updateOptions = useUserStore((state: any) => state.updateOptions);

  const signOut = async () => {
    try {
      if (GoogleSignin) {
        const isSignedIn = await GoogleSignin.getCurrentUser();
        // console.log("issignedin", isSignedIn);
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      }
      await SecureStore.deleteItemAsync("user_refresh_token");
    } catch (error) {
      console.error(error);
    }
    // Set push notifications inactive on server for this token
    // registerPushNotifications({jsonWebToken: user.jsonWebToken, active: false});
    setUser(null);
  };

  const alertRef = useRef<AlertNotificationHandle>(null);
  const showAlert: any = (message: string, good: boolean) => {
    alertRef.current?.showAlert(message, good);
  };

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const onKeyboardShow = (e: any) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onKeyboardHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };
    const onKeyboardChange = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
    };

    const willShowSub = Keyboard.addListener(
      "keyboardWillShow",
      onKeyboardShow,
    );
    const didShowSub = Keyboard.addListener("keyboardDidShow", onKeyboardShow);
    const willHideSub = Keyboard.addListener(
      "keyboardWillHide",
      onKeyboardHide,
    );
    const didHideSub = Keyboard.addListener("keyboardDidHide", onKeyboardHide);
    const changeSub = Keyboard.addListener(
      "keyboardDidChangeFrame",
      onKeyboardChange,
    );

    return () => {
      willShowSub.remove();
      didShowSub.remove();
      willHideSub.remove();
      didHideSub.remove();
      changeSub.remove();
    };
  }, []);

  const appContextValue = {
    showAlert,
    setShowDisconnectIndicator: (value: boolean) =>
      updateOptions({ showDisconnectIndicator: value }),
    signOut,
  };

  let keyboardDismissButtonStayActive = true;
  // Logic to prevent it if needed here

  return (
    <AppContext.Provider value={appContextValue}>
      <Provider>
        <ThemedView style={{ flex: 1 }}>
          <AlertNotification ref={alertRef} />
          <Stack screenOptions={{}}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: false,
                animation: "fade",
                animationDuration: 200,
              }}
            />
          </Stack>

          {/* Dismiss Keyboard button */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <Portal.Host>
              <Portal>
                {/* Using absolute position and animated transition */}
                {keyboardVisible && keyboardDismissButtonStayActive && (
                  <Animated.View
                    entering={SlideInDown.springify().damping(90)}
                    exiting={FadeOutDown.duration(100)}
                    style={{
                      position: "absolute",
                      right: 20,
                      bottom:
                        keyboardHeight + (Platform.OS === "ios" ? 10 : 30),
                      zIndex: 99999999,
                    }}
                  >
                    <Pressable
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        backgroundColor: Colors.primaryAccent,
                        borderRadius: 10,
                        borderColor: Colors.dark.background,
                        borderWidth: 2,
                      }}
                      onPress={() => Keyboard.dismiss()}
                    >
                      <ImageContain size={30} source={keyboardIcon} />
                    </Pressable>
                  </Animated.View>
                )}
              </Portal>
            </Portal.Host>
          </View>
        </ThemedView>
      </Provider>
    </AppContext.Provider>
  );
}
