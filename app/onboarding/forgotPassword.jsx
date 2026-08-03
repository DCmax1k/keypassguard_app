import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertNotification from "../../components/AlertNotification";
import ConfirmMenu from "../../components/ConfirmMenu";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedView from "../../components/ThemedView";
import Colors from "../../constants/Colors";
import { useUserStore } from "../../stores/useUserStore";
import sendData from "../../util/server/sendData";

const isExpoGo = Constants.executionEnvironment === "storeClient";

let GoogleSignin = null;

// if (!isExpoGo) {
//   ({
//     GoogleSignin,
//   } = require("@react-native-google-signin/google-signin"));
// }

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ForgotPasswordPage = () => {
  const [page, setPage] = useState(0); // 0: request code with email, 1: type code in, 2: reset password

  const users = useUserStore((state) => state.users);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const updateOptions = useUserStore((state) => state.updateOptions);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmMenuActive, setConfirmMenuActive] = useState(false);
  const [confirmMenuData, setConfirmMenuData] = useState();

  const alertRef = useRef(null);

  const goBack = () => {
    // Potentially have to log out of the google/apple account here
    router.back();
  };

  const requestCode = async () => {
    if (!email) return;
    setLoading(true);
    const response = await sendData("/dashboard/requesttemperarycode", {
      email,
    });
    if (response.status !== "success") {
      setLoading(false);
      return alertRef.current.showAlert(response.message, false);
    }
    setLoading(false);
    setPage(1);
    alertRef.current.showAlert("Code successfully sent to your inbox.");
  };

  const verifyCode = async () => {
    if (!email || !code) return;
    setLoading(true);
    const response = await sendData("/dashboard/requestchecktemperarycode", {
      email,
      code,
    });
    if (response.status !== "success") {
      setLoading(false);
      return alertRef.current.showAlert(response.message, false);
    }
    setLoading(false);
    setPage(2);
  };

  const resetPassword = async () => {
    if (!email || !code || !newPassword || !confirmNewPassword) return;
    if (newPassword !== confirmNewPassword)
      return alertRef.current.showAlert("Passwords must match.", false);
    setLoading(true);
    const response = await sendData("/dashboard/requestchangepassword", {
      email,
      code,
      password: newPassword,
    });
    if (response.status !== "success") {
      setLoading(false);
      return alertRef.current.showAlert(response.message, false);
    }
    setLoading(false);
    setPage(3);
  };

  // const requestResend = async () => {
  //   setLoading(true);
  //   const response = await sendData("/login/forgotpassword/requestresendcode", {
  //     email,
  //   });
  //   if (response.status !== "success") {
  //     setLoading(false);
  //     return alertRef.current.showAlert(response.message, false);
  //   }
  //   setLoading(false);
  // };

  const confirmRequestResend = () => {
    setConfirmMenuData({
      title: "Request Resend Code?",
      subTitle: "Codes are resendable 60 seconds after each attempt.",
      subTitle2: "",
      option1: "Resend",
      option1color: "#546FDB",
      option2: "Cancel",
      confirm: () => requestResend(),
    });
    setConfirmMenuActive(true);
  };

  return (
    <ThemedView style={{ flex: 1, height: screenHeight, width: screenWidth }}>
      <AlertNotification ref={alertRef} />
      <ConfirmMenu
        active={confirmMenuActive}
        setActive={setConfirmMenuActive}
        data={confirmMenuData}
      />
      <SafeAreaView style={{ flex: 1, marginBottom: -50 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={{ flex: 1, padding: 30 }}
            contentContainerStyle={{ paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flexDirection: "column" }}>
              <Spacer height={20} />

              <Text
                style={{
                  color: Colors.primaryAccent,
                  fontSize: 30,
                  fontFamily: "Bals-Bold",
                }}
              >
                Forgot Password
              </Text>
              <Spacer height={10} />

              {page === 0 ? (
                <View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 17,
                      fontFamily: "Exo2-ExtraLight",
                    }}
                  >
                    Please enter the email associated with your account.
                  </Text>

                  <Spacer height={20} />

                  <View style={{ alignItems: "center" }}>
                    {/* Inputs */}
                    <View
                      style={{
                        width: screenWidth,
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <ThemedTextInput
                        placeholder="Email"
                        value={email}
                        onChange={(value) => setEmail(value)}
                      />
                    </View>

                    <Spacer />

                    {/* Big blue button */}
                    <Pressable
                      onPress={requestCode}
                      style={{
                        height: 80,
                        backgroundColor: Colors.primaryAccent,
                        width: "100%",
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 30,
                          fontFamily: "Bals-Bold",
                        }}
                      >
                        {loading ? "Loading..." : "Request Code"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : page === 1 ? (
                <View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 17,
                      fontFamily: "Exo2-ExtraLight",
                    }}
                  >
                    Please enter the 6 digit code sent to your inbox.
                  </Text>

                  <Spacer height={20} />

                  <View style={{ alignItems: "center" }}>
                    {/* Inputs */}
                    <View
                      style={{
                        width: screenWidth,
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <ThemedTextInput
                        placeholder="6 Digit Code"
                        value={code}
                        onChange={(value) => setCode(value)}
                      />
                    </View>
                    <View
                      style={{
                        alignItems: "flex-end",
                        width: "100%",
                        padding: 5,
                      }}
                    >
                      {/* <Pressable onPress={confirmRequestResend}>
                        <ThemedText style={{ fontFamily: "DoppioOne-Regular" }}>
                          Resend Code
                        </ThemedText>
                      </Pressable> */}
                    </View>

                    <Spacer />

                    {/* Big blue button */}
                    <Pressable
                      onPress={verifyCode}
                      style={{
                        height: 80,
                        backgroundColor: Colors.primaryAccent,
                        width: "100%",
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 30,
                          fontFamily: "Bals-Bold",
                        }}
                      >
                        {loading ? "Verifying..." : "Verify Code"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : page === 2 ? (
                <View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 17,
                      fontFamily: "Exo2-ExtraLight",
                    }}
                  >
                    Reset your password with a new password.
                  </Text>

                  <Spacer height={20} />

                  <View style={{ alignItems: "center" }}>
                    {/* Inputs */}
                    <View
                      style={{
                        width: screenWidth,
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <ThemedTextInput
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(value) => setNewPassword(value)}
                        type="password"
                      />
                    </View>
                    <Spacer height={20} />
                    <View
                      style={{
                        width: screenWidth,
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <ThemedTextInput
                        placeholder="Confirm Password"
                        value={confirmNewPassword}
                        onChange={(value) => setConfirmNewPassword(value)}
                        type="password"
                      />
                    </View>

                    <Spacer />

                    {/* Big blue button */}
                    <Pressable
                      onPress={resetPassword}
                      style={{
                        height: 80,
                        backgroundColor: Colors.primaryAccent,
                        width: "100%",
                        borderRadius: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 30,
                          fontFamily: "Bals-Bold",
                        }}
                      >
                        {loading ? "Loading..." : "Reset Password"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <ThemedText style={{ textAlign: "center" }}>
                    Successfully reset password! Go back to login to continue.
                  </ThemedText>
                </View>
              )}

              <Spacer height={40} />
              {/* go back */}
              <View style={{ flexDirection: "row" }}>
                <Pressable style={{ marginLeft: 5 }} onPress={goBack}>
                  <Text
                    style={{
                      color: Colors.primaryAccent,
                      fontSize: 13,
                      fontFamily: "DoppioOne-Regular",
                    }}
                  >
                    Leave
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ForgotPasswordPage;

const styles = StyleSheet.create({});
