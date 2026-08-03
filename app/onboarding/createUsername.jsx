import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertNotification from "../../components/AlertNotification";
import Spacer from "../../components/Spacer";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedView from "../../components/ThemedView";
import { useUserStore } from "../../stores/useUserStore";
import sendData from "../../util/server/sendData";
import { generateUniqueId } from "../../util/uniqueId";

const isExpoGo = Constants.executionEnvironment === "storeClient";

let GoogleSignin = null;

// if (!isExpoGo) {
//   ({
//     GoogleSignin,
//   } = require("@react-native-google-signin/google-signin"));
// }

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CreateUsernamePage = () => {
  const users = useUserStore((state) => state.users);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const updateOptions = useUserStore((state) => state.updateOptions);
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const alertRef = useRef(null);

  const params = useLocalSearchParams();
  const data = JSON.parse(params.data);
  const { jsonWebToken } = data;

  const goBack = () => {
    // Potentially have to log out of the google/apple account here
    router.back();
  };

  const checkUsername = async () => {
    const check = await sendData("/login/checkusername", { username });
    if (check.status !== "success") {
      setLoading(false);
      alertRef.current.showAlert(check.message, false);
      return;
    }
    return check.status === "success";
  };

  const signup = async () => {
    if (username.length === 0) return;
    setLoading(true);
    /////////////////////////////////// can remove this check username section at some point
    const check = await checkUsername();
    if (!check) {
      return;
    }
    // The create username also checks for username
    const response = await sendData("/login/createusername", {
      jsonWebToken,
      username,
    });
    if (response.status !== "success") {
      setLoading(false);
      alertRef.current.showAlert(response.message, false);
      return;
    }
    const userInfo = response.userInfo;
    const newUser = {
      _id: generateUniqueId(),
      username: userInfo.username,
      email: userInfo.email,
      dbId: userInfo.dbId,
      jsonWebToken: jsonWebToken,
    };
    setUser(newUser);
    updateOptions({ animateDashboard: true });
    router.replace("/dashboard");
  };

  // Not using yet but may be moved to profile to actually sign out google user
  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      // setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedView style={{ flex: 1, height: screenHeight, width: screenWidth }}>
      <AlertNotification ref={alertRef} />
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
                  color: "#6684FF",
                  fontSize: 30,
                  fontFamily: "Bals-Bold",
                }}
              >
                3rd party sign in
              </Text>
              <Spacer height={10} />
              <Text
                style={{
                  color: "white",
                  fontSize: 17,
                  fontFamily: "Exo2-ExtraLight",
                }}
              >
                Please create a username to start.
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
                    placeholder="Username"
                    value={username}
                    onChange={(value) => setUsername(value)}
                  />
                </View>

                <Spacer />

                {/* Big blue button */}
                <Pressable
                  onPress={signup}
                  style={{
                    height: 80,
                    backgroundColor: "#6684FF",
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
                    {loading ? "Loading..." : "Create"}
                  </Text>
                </Pressable>
              </View>

              <Spacer height={20} />

              {/* go back */}
              <View style={{ flexDirection: "row" }}>
                <Pressable style={{ marginLeft: 5 }} onPress={goBack}>
                  <Text
                    style={{
                      color: "#8FA6FF",
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

export default CreateUsernamePage;

const styles = StyleSheet.create({});
