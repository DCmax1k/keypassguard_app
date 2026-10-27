import greenlock from "@/assets/graphics/greenlock.svg";
import exportImg from "@/assets/icons/export.svg";
import ConfirmMenu from "@/components/ConfirmMenu";
import ImageContain from "@/components/ImageContain";
import Spacer from "@/components/Spacer";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import TitleWithBack from "@/components/TitleWithBack";
import Colors from "@/constants/Colors";
import { DOMAIN } from "@/constants/ServerConstants";
import { AppContext } from "@/context/AppContext";
import { useUserStore } from "@/stores/useUserStore";
import sendData from "@/util/server/sendData";
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
  const updateUser = useUserStore((store) => store.updateUser);

  //   Inputs
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Delete account
  const [focusOnDeleteAccount, setFocusOnDeleteAccount] = useState(false);

  const [confirmMenuActive, setConfirmMenuActive] = useState(false);
  const [confirmMenuData, setConfirmMenuData] = useState({
    title: "The title",
    subTitle: "The description for the confirmation",
    subTitle2: "Another one here",
    option1: "Update",
    option1color: "",
    option3: "No",
    option3onPress: () => {},
    option2: "Go back",
    confirm: () => {},
  });

  const saveNewUsername = async () => {
    if (username.length <= 0)
      return showAlert("Please enter a username", false);
    if (username === user.username)
      return showAlert("Please enter a different username");
    const response = await sendData("/dashboard/changeusername", {
      newValue: username,
      jsonWebToken: user.jsonWebToken,
    });
    if (response.status !== "success") {
      return showAlert(response.message, false);
    }
    updateUser({ username });
  };
  const saveNewEmail = async () => {
    if (email.length <= 0) return showAlert("Please enter an email", false);
    if (email === user.email)
      return showAlert("Please enter a different email");
    const response = await sendData("/dashboard/changeemail", {
      newValue: email,
      jsonWebToken: user.jsonWebToken,
    });
    if (response.status !== "success") {
      return showAlert(response.message, false);
    }
    updateUser({
      email,
      settings: { emailVerified: false, emailChanged: Date.now() },
    });
  };
  const saveNewPassword = async () => {
    const newValue = newPassword;
    try {
      const response = await sendData("/login/changepassword", {
        password,
        newValue,
        jsonWebToken: user.jsonWebToken,
      });
      if (response.status === "success") {
        showAlert("Password successfully changed.", true);
      } else {
        showAlert(response.message, false);
      }
      setPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
    }
  };
  const requestResendVerification = async () => {
    const response = await sendData("/dashboard/resendemail", {
      jsonWebToken: user.jsonWebToken,
    });
    if (response.status === "success") {
      showAlert("Email sent.", true);
    } else {
      showAlert(response.message, false);
    }
  };

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

  const handleDeleteAccount = () => {
    setConfirmMenuData({
      title: "Delete Account",
      subTitle: "Remove all data associated with this account?",
      subTitle2: "This action cannot be undone.",
      option1: "Confirm Delete",
      option1color: Colors.bad,
      option3: "",
      option3onPress: () => {},
      option2: "Cancel",
      confirm: () => {
        requestDeleteAccount();
      },
    });
    setConfirmMenuActive(true);
  };

  const requestDeleteAccount = async () => {
    const response = await sendData("/dashboard/deleteaccount", {
      jsonWebToken: user.jsonWebToken,
    });
    if (response.status === "success") {
      signOut();
    } else {
      showAlert(response.message, false);
    }
  };

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", backgroundColor: "#232323" }}
    >
      <ConfirmMenu
        active={confirmMenuActive}
        setActive={setConfirmMenuActive}
        data={confirmMenuData}
      />

      {/* <SafeAreaView> */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ paddingTop: insets.top }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
              style={{ position: "absolute", top: 0 }}
              imgStyle={{ opacity: 0.5 }}
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
                placeholderTextColor={"#555555"}
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
              {user.username !== username && username.length >= 1 && (
                <Animated.View entering={FadeInUp} exiting={FadeOut}>
                  <Pressable
                    onPress={saveNewUsername}
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
                placeholderTextColor={"#555555"}
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
                    onPress={saveNewEmail}
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
                  onPress={requestResendVerification}
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
                placeholderTextColor={"#555555"}
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
                placeholderTextColor={"#555555"}
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
                    onPress={saveNewPassword}
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

          <Spacer />
          <Spacer />
          <Spacer />

          <Pressable
            onPress={() =>
              focusOnDeleteAccount
                ? handleDeleteAccount()
                : setFocusOnDeleteAccount(true)
            }
            style={{ width: "100%" }}
          >
            <Text
              style={{
                textAlign: "center",
                color: focusOnDeleteAccount ? "#7D4747" : "#5c3333",
              }}
            >
              Delete Account
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* </SafeAreaView> */}
    </ThemedView>
  );
};

export default Profile;

const styles = StyleSheet.create({});
