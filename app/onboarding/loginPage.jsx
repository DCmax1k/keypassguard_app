import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import checkIcon from "../../assets/icons/check.png";
import appleIconWhite from "../../assets/onboarding/appleIconWhite.png";
import googleIcon from "../../assets/onboarding/googleIcon.png";
import AlertNotification from "../../components/AlertNotification";
import ImageContain from "../../components/ImageContain";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedView from "../../components/ThemedView";
import Colors from "../../constants/Colors";
import { TestUsers } from "../../constants/TestUsers";
import { AppContext } from "../../context/AppContext";
import { useUserStore } from "../../stores/useUserStore";
import { useBiometricLabel } from "../../util/authBiometrics";
import auth from "../../util/server/auth";
import sendData from "../../util/server/sendData";
import { generateUniqueId } from "../../util/uniqueId";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const USER = TestUsers[0]; // Default user

const LoginPage = () => {
  // const users = useUserStore((state) => state.users);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const updateOptions = useUserStore((state) => state.updateOptions);
  const router = useRouter();

  const { showAlert } = useContext(AppContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hardwareLogin, setHardwareLogin] = useState(false);

  const [loading, setLoading] = useState(false);

  const alertRef = useRef(null);

  const goToSignUp = () => {
    router.replace("/onboarding/signUpPage");
  };

  // const loginToTestUser = () => {
  //   // ReLogin user
  //   if (Object.keys(users).length > 0) {
  //     setUser(JSON.parse(JSON.stringify(users[Object.keys(users)[0]])));
  //   } else {
  //     setUser(JSON.parse(JSON.stringify(USER)));
  //   }
  //   updateOptions({ animateDashboard: true });
  //   router.replace("/dashboard");
  // };

  const login = async () => {
    if (loading) return;

    // Login with /login - get jsonWebToken,
    if (username.length === 0 || password.length === 0) return;
    setLoading(true);
    const response = await sendData("/login", {
      username,
      password,
      hardwareLogin,
    });
    if (response.status !== "success") {
      setLoading(false);
      //console.log("Error: ", response.message);
      showAlert(response.message, false);
      return;
    }
    // Hardware login setup
    if (hardwareLogin) {
      const { refresh_token } = response;
      await SecureStore.setItemAsync("user_refresh_token", refresh_token);
    } else {
      await SecureStore.setItemAsync("user_refresh_token", "");
    }

    const { jsonWebToken } = response;
    // BELOW CODE IS COPIED TO THIRDPARTYLOGIN
    //then call auth which will get userInfo to set with user
    const authResponse = await auth(jsonWebToken);
    if (authResponse.status !== "success") {
      setLoading(false);
      //console.log("Error: ", authResponse.message);
      showAlert(authResponse.message, false);
      return;
    }

    const { userInfo, user: fullLocalUser } = authResponse;
    // Find user in users and set. NO LONGER DO BECAUSE ALL DATA IS FROM SERVER
    // const localUserIds = Object.keys(users);
    // const idx = localUserIds.findIndex(
    //   (localId) => users[localId]._id === userInfo._id,
    // );
    let userToSet;
    // if (idx > -1) {
    //   // Local user found
    //   const localU = users[localUserIds[idx]];
    //   userToSet = { ...localU, ...userInfo, jsonWebToken };
    // } else {
    // Steal more data from db to complete user
    const dbId = fullLocalUser._id;
    const newLocalUser = {
      ...fullLocalUser,
      localId: generateUniqueId(),
      _id: dbId,
      jsonWebToken,
    };
    userToSet = newLocalUser;
    // }
    setLoading(false);
    setUser(userToSet);
    // updateOptions({ animateDashboard: true });
    router.replace("/dashboard");
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
                  color: Colors.primaryAccent,
                  fontSize: 30,
                  fontFamily: "Bals-Bold",
                }}
              >
                Login Now
              </Text>
              <Spacer height={10} />
              <Text
                style={{
                  color: "white",
                  fontSize: 17,
                  fontFamily: "Exo2-ExtraLight",
                }}
              >
                Please login to continue using Keypass Guard.
              </Text>

              <Spacer height={20} />

              {/* Third party logins */}
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={() => router.back()}
                  style={{
                    backgroundColor: "white",
                    flexDirection: "row",
                    alignItems: "center",
                    height: 50,
                    paddingRight: 20,
                    paddingLeft: 10,
                    borderRadius: 999999,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      style={{
                        height: 40,
                        width: 40,
                        marginRight: 15,
                        objectFit: "contain",
                        tintColor: "black",
                        marginRight: -3,
                        transform: [{ translateY: -2 }],
                      }}
                      source={appleIconWhite}
                    />
                    <Image
                      style={{
                        height: 27,
                        width: 27,
                        marginRight: 15,
                        objectFit: "contain",
                      }}
                      source={googleIcon}
                    />
                  </View>

                  <Text style={{ fontSize: 17 }}>Use 3rd party sign in</Text>
                </Pressable>

                {/* <Spacer height={20} />

                        <View style={{backgroundColor: "black", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999999, borderColor: "white", borderWidth: 1}}>
                            <Image style={{height: 30, width: 30, marginRight: 15, objectFit: "contain"}} source={appleIconWhite} />
                            <Text style={{fontSize: 17, color: "white"}}>Sign in with Apple </Text>
                        </View> */}
              </View>

              <Spacer height={20} />

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontFamily: "DoppioOne-Regular",
                  }}
                >
                  or login with email
                </Text>

                <Spacer height={20} />

                {/* Inputs */}
                <View
                  style={{
                    width: screenWidth,
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <ThemedTextInput
                    placeholder="Username or Email"
                    value={username}
                    onChange={(value) => setUsername(value)}
                  />
                  <Spacer height={20} />
                  <ThemedTextInput
                    placeholder="Password"
                    value={password}
                    onChange={(value) => setPassword(value)}
                    type="password"
                  />
                </View>

                {/* Use Face ID */}
                <View
                  style={{
                    width: "100%",
                    padding: 5,
                    marginTop: 5,
                  }}
                >
                  <Pressable
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      width: "100%",
                    }}
                    onPress={() => {
                      setHardwareLogin(!hardwareLogin);
                    }}
                  >
                    <View
                      style={{
                        position: "relative",
                        justifyContent: "center",
                        alignItems: "center",
                        borderColor: Colors.dark.text,
                        borderWidth: 3,
                        height: 20,
                        width: 20,
                        borderRadius: 5,
                        marginRight: 10,
                        backgroundColor: hardwareLogin
                          ? Colors.dark.text
                          : "transparent",
                      }}
                    >
                      <ImageContain
                        size={18}
                        source={checkIcon}
                        style={{
                          paddingBottom: 2,
                          opacity: hardwareLogin ? 1 : 0,
                        }}
                        imgStyle={{
                          tintColor: Colors.dark.background,
                        }}
                      />
                    </View>
                    <ThemedText style={{ fontFamily: "DoppioOne-Regular" }}>
                      Use {useBiometricLabel()} to sign in?
                    </ThemedText>
                  </Pressable>
                </View>

                <Spacer height={20} />

                {/* Big blue button */}
                <Pressable
                  onPress={login}
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
                    {loading ? "Loading..." : "Login"}
                  </Text>
                </Pressable>
              </View>

              <Spacer height={20} />

              {/* Don't have an account? */}
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontFamily: "DoppioOne-Regular",
                  }}
                >
                  Don't have an account?
                </Text>
                <Pressable style={{ marginLeft: 5 }} onPress={goToSignUp}>
                  <Text
                    style={{
                      color: Colors.primaryAccent,
                      fontSize: 13,
                      fontFamily: "DoppioOne-Regular",
                    }}
                  >
                    Sign up
                  </Text>
                </Pressable>
              </View>
              <Spacer height={60} />
              {/* Forget password */}
              <View style={{ alignItems: "center", width: "100%", padding: 5 }}>
                <Pressable
                  onPress={() => {
                    router.push("/onboarding/forgotPassword");
                  }}
                >
                  <ThemedText style={{ fontFamily: "DoppioOne-Regular" }}>
                    Forgot Password?
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({});
