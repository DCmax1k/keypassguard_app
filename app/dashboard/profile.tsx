import greenlock from "@/assets/graphics/greenlock.svg";
import exportImg from "@/assets/icons/export.svg";
import ImageContain from "@/components/ImageContain";
import Spacer from "@/components/Spacer";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import TitleWithBack from "@/components/TitleWithBack";
import { DOMAIN } from "@/constants/ServerConstants";
import { AppContext } from "@/context/AppContext";
import { useUserStore } from "@/stores/useUserStore";
import * as WebBrowser from "expo-web-browser";
import { useContext, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Animated, {
    FadeInUp,
    FadeOut,
    LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Profile = () => {
  const { signOut, showAlert } = useContext(AppContext);
  const insets = useSafeAreaInsets();

  const user = useUserStore((store) => store.user);

  //   Inputs
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleOpenBrowser = async (url: string) => {
    console.log("Attempting to open browser...");
    try {
      let result = await WebBrowser.openBrowserAsync(url, {
        presentationStyle:
          WebBrowser.WebBrowserPresentationStyle.OVER_FULL_SCREEN,
      });
      console.log("Browser closed, result:", result);
    } catch (error) {
      console.error("Failed to open browser:", error);
    }
  };

  const exportSites = () => {
    if (user.settings.emailVerified) {
      return handleOpenBrowser(`${DOMAIN}/export?auth=${user.jsonWebToken}`);
    }
    return showAlert("Please verify your email before exporting!", false);
  };

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", backgroundColor: "#232323" }}
    >
      {/* <SafeAreaView> */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ paddingTop: insets.top }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <TitleWithBack
            style={undefined}
            backBtnStyles={undefined}
            actionBtnStyles={undefined}
            actionBtnIconStyles={undefined}
            leftActionBtnIconStyles={undefined}
          />

          {/* Logo and username */}
          <View style={{ alignItems: "center" }}>
            <ImageContain
              source={greenlock}
              size={100}
              style={{ opacity: 0.5, position: "absolute", top: 0 }}
            />
            <Spacer height={55} />
            <Text
              style={{ fontSize: 20, color: "#8fbc9d", fontFamily: "IBMMono" }}
            >
              {user.username}
            </Text>
          </View>
          <Spacer height={50} />
          {/* Settings */}
          <ThemedText style={{ color: "#6c6c6c", textAlign: "center" }}>
            Settings
          </ThemedText>
          {/* Logout */}
          <Pressable
            onPress={signOut}
            style={{
              backgroundColor: "#d9d9d9",
              alignSelf: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
              margin: 20,
              borderRadius: 15,
            }}
          >
            <ThemedText style={{ color: "#000", fontSize: 18 }}>
              Logout
            </ThemedText>
          </Pressable>
          {/* Export sites */}
          <Pressable
            onPress={exportSites}
            style={{
              alignSelf: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderRadius: 15,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ImageContain source={exportImg} />
            <ThemedText style={{ color: "#d9d9d9", fontSize: 18 }}>
              Export sites
            </ThemedText>
          </Pressable>

          <Spacer height={20} />
          {/* Personal information */}
          <ThemedText
            style={{ color: "#6c6c6c", textAlign: "center", marginBottom: 10 }}
          >
            Personal information
          </ThemedText>

          {/* Change username */}
          <Animated.View layout={LinearTransition} style={{ padding: 10 }}>
            <ThemedText style={{ color: "#a9a9a9" }}>
              Change username
            </ThemedText>
            <View style={{ gap: 10 }}>
              <TextInput
                value={username}
                onChangeText={(v) => setUsername(v)}
                placeholder="Username"
                style={{
                  height: 60,
                  color: "#adadad",
                  fontSize: 20,
                  padding: 10,
                  fontFamily: "IBMMono",
                  backgroundColor: "#313131",
                  borderRadius: 10,
                }}
              />
              {user.username !== username && (
                <Animated.View entering={FadeInUp} exiting={FadeOut}>
                  <Pressable
                    onPress={() => console.log("Save username")}
                    style={{
                      backgroundColor: "#1e70bc",
                      alignSelf: "flex-end",
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                    }}
                  >
                    <ThemedText style={{ color: "white" }}>Save</ThemedText>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Change email */}
          <Animated.View
            layout={LinearTransition}
            style={{ paddingHorizontal: 10 }}
          >
            <ThemedText style={{ color: "#a9a9a9" }}>Change email</ThemedText>
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(v) => setEmail(v)}
                style={{
                  height: 60,
                  color: "#adadad",
                  fontSize: 17,
                  padding: 10,
                  fontFamily: "IBMMono",
                  backgroundColor: "#313131",
                  borderRadius: 10,
                }}
              />
              {user.email !== email && (
                <Animated.View>
                  <Pressable
                    onPress={() => console.log("Save email")}
                    style={{
                      backgroundColor: "#1e70bc",
                      alignSelf: "flex-end",
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                    }}
                  >
                    <ThemedText style={{ color: "white" }}>Save</ThemedText>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          </Animated.View>
          <Animated.View
            layout={LinearTransition}
            style={{ paddingHorizontal: 10 }}
          >
            {user.settings.emailVerified ? (
              <ThemedText style={{ color: "#40714f" }}>Verified</ThemedText>
            ) : (
              <ThemedText>
                Please verify your email to enhance account security and
                safeguard your valuable KeypassGuard account.{" "}
                {/* <Pressable onPress={() => console.log("Resend")}> */}
                <ThemedText
                  onPress={() => console.log("Resend")}
                  style={{
                    color: "#1e70bc",
                    textDecorationLine: "underline",
                  }}
                >
                  Resend email
                </ThemedText>
                {/* </Pressable> */}
              </ThemedText>
            )}
          </Animated.View>

          {/* Change password */}
          <Animated.View layout={LinearTransition} style={{ padding: 10 }}>
            <ThemedText style={{ color: "#a9a9a9" }}>
              Change password
            </ThemedText>
            {/* old password */}
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="Old password"
                secureTextEntry={true}
                value={password}
                onChangeText={(v) => setPassword(v)}
                style={{
                  height: 60,
                  color: "#adadad",
                  fontSize: 20,
                  padding: 10,
                  fontFamily: "IBMMono",
                  backgroundColor: "#313131",
                  borderRadius: 10,
                }}
              />
            </View>
            <Spacer height={5} />
            {/* new password */}
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="New password"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={(v) => setNewPassword(v)}
                style={{
                  height: 60,
                  color: "#adadad",
                  fontSize: 20,
                  padding: 10,
                  fontFamily: "IBMMono",
                  backgroundColor: "#313131",
                  borderRadius: 10,
                }}
              />
              {newPassword.length >= 8 && newPassword !== password && (
                <Animated.View entering={FadeInUp} exiting={FadeOut}>
                  <Pressable
                    onPress={() => console.log("Save password")}
                    style={{
                      backgroundColor: "#1e70bc",
                      alignSelf: "flex-end",
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                    }}
                  >
                    <ThemedText style={{ color: "white" }}>Save</ThemedText>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* </SafeAreaView> */}
    </ThemedView>
  );
};

export default Profile;

const styles = StyleSheet.create({});
