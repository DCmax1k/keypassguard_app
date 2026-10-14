// import {
//   GoogleSignin,
//   isErrorWithCode,
//   isSuccessResponse,
//   statusCodes,
// } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import womanlock from "../../assets/graphics/womanlock.png";
import appleIconWhite from "../../assets/onboarding/appleIconWhite.png";
import googleIcon from "../../assets/onboarding/googleIcon.png";
import AlertNotification from "../../components/AlertNotification";
import ImageContain from "../../components/ImageContain";
import Spacer from "../../components/Spacer";
import ThemedView from "../../components/ThemedView";
import Colors from "../../constants/Colors";
import { useUserStore } from "../../stores/useUserStore";
import auth from "../../util/server/auth";
import sendData from "../../util/server/sendData";

const isExpoGo = Constants.executionEnvironment === "storeClient";

let GoogleSignin = null;
let isSuccessResponse = null;
let isErrorWithCode = null;
let statusCodes = null;

if (!isExpoGo) {
  ({
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
  } = require("@react-native-google-signin/google-signin"));
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const OnboardingIndex = () => {
  const insets = useSafeAreaInsets();

  const users = useUserStore((state) => state.users);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const updateOptions = useUserStore((state) => state.updateOptions);
  const router = useRouter();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Login automatically
  useEffect(() => {
    if (isExpoGo || !GoogleSignin) return;
    GoogleSignin.configure({
      webClientId:
        "379288000176-g8o27grgrv03sv0oqp220bfhbkfrpdvs.apps.googleusercontent.com",
      iosClientId:
        "379288000176-pfttrjo0a62mlcgghmfgaa3fjtsru5s8.apps.googleusercontent.com",
      profileImageSize: 120,
    });
  }, []);

  const alertRef = useRef(null);

  const goToLogin = () => {
    router.push("/onboarding/loginPage");
  };
  const goToSignUp = () => {
    router.push("/onboarding/signUpPage");
  };

  const loginThirdPartyCredentials = async (data) => {
    try {
      const loginThirdParty = await sendData("/login/loginthirdparty", data);
      if (loginThirdParty.status !== "success") {
        alertRef.current.showAlert(loginThirdParty.message, false);
        setAppleLoading(false);
        return;
      }
      const { jsonWebToken } = loginThirdParty;
      // Check auth
      const authResponse = await auth(jsonWebToken);
      if (authResponse.status !== "success") {
        alertRef.current.showAlert(
          "Auth Failed: " + authResponse.message,
          false,
        );
        setAppleLoading(false);
        return;
      }
      // Check username
      const { userInfo } = authResponse;
      // If no username, send jsonWebToken with data to createUsername
      const { username } = userInfo;
      if (!username) {
        // Create username flow
        return router.push({
          pathname: "/onboarding/createUsername",
          params: {
            data: JSON.stringify({ jsonWebToken }),
          },
        });
      }

      let userToSet;

      userToSet = {
        ...userInfo,
        jsonWebToken,
      };

      setUser(userToSet);
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isExpoGo || !GoogleSignin) return;
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      // debugging - send server the response to display
      //sendData("/debuglog", {response: JSON.stringify(response)});

      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { name, email, photo } = user;
        // Send info to create username page that will create the user if username defined
        const data = {
          partyType: "google",
          idToken,
          email,
        };
        await loginThirdPartyCredentials(data);
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      // This extracts the properties that JSON.stringify misses
      const detailedError = JSON.stringify(
        {
          code: error.code,
          message: error.message,
          name: error.name,
        },
        null,
        2,
      );

      alertRef.current.showAlert("DEBUG: " + detailedError);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
            break;
        }
      } else {
      }
    }
    setGoogleLoading(false);
  };

  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      // Ping my server to ensure its operating
      const checkPing = await sendData("/checkping", {});
      if (checkPing.status !== "success") {
        alertRef.current.showAlert(
          "Error contacting server. Please try again later.",
          false,
        );
        setAppleLoading(false);
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
      console.log(credential);
      const data = {
        partyType: "apple",
        idToken: credential.identityToken,
        email: credential.email,
      };
      await loginThirdPartyCredentials(data);
    } catch (e) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
        console.log("Err request canceled");
        console.log(e);
        setAppleLoading(false);
      } else {
        // handle other errors
        console.log(e);
        setAppleLoading(false);
      }
    }
    setAppleLoading(false);
  };

  //return;
  // user ? (
  //   <Redirect href={"/dashboard"} />
  // ) :
  return (
    <ThemedView style={{ flex: 1, height: screenHeight, width: screenWidth }}>
      <AlertNotification ref={alertRef} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ScrollView
          style={{ flex: 1, padding: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "column" }}>
            <Spacer height={20} />

            <Text
              style={{
                color: "white",
                fontSize: 30,
                fontFamily: "Bals-Bold",
              }}
            >
              Welcome
            </Text>
            <Text
              style={{
                color: "#A1A1A1",
                fontSize: 17,
                fontFamily: "Exo2-ExtraLight",
              }}
            >
              Please login or sign up to start securing your passwords.
            </Text>

            <View>
              <ImageContain
                style={{
                  width: "100%",
                  height: 250,
                  objectFit: "contain",
                  paddingTop: 20,
                }}
                source={womanlock}
              />
            </View>

            {/* Third party logins */}
            <View style={{ alignItems: "center" }}>
              <Pressable
                onPress={handleGoogleSignIn}
                style={{
                  backgroundColor: "white",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 999999,
                }}
              >
                <Image
                  style={{
                    height: 30,
                    width: 30,
                    marginRight: 15,
                    objectFit: "contain",
                  }}
                  source={googleIcon}
                />
                <Text style={{ fontSize: 17 }}>
                  {googleLoading ? "Signing in..." : "Sign in with Google"}
                </Text>
              </Pressable>
              <Spacer height={20} />
              {Platform.OS === "ios" && (
                <Pressable
                  onPress={handleAppleSignIn}
                  style={{
                    backgroundColor: "black",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 999999,
                    borderColor: "white",
                    borderWidth: 1,
                  }}
                >
                  <Image
                    style={{
                      height: 35,
                      width: 35,
                      marginRight: 15,
                      objectFit: "contain",
                    }}
                    source={appleIconWhite}
                  />
                  <Text style={{ fontSize: 17, color: "white" }}>
                    {appleLoading ? "Signing in..." : "Sign in with Apple"}
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 13,
                  fontFamily: "DoppioOne-Regular",
                }}
              >
                {/* or continue with email */}
              </Text>

              <Spacer />

              <Pressable
                onPress={goToSignUp}
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
                  Sign up
                </Text>
              </Pressable>
            </View>

            <Spacer height={20} />

            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: "white",
                  fontSize: 13,
                  fontFamily: "DoppioOne-Regular",
                }}
              >
                You already have an account?
              </Text>
              <Pressable style={{ marginLeft: 5 }} onPress={goToLogin}>
                <Text
                  style={{
                    color: Colors.primaryAccent,
                    fontSize: 13,
                    fontFamily: "DoppioOne-Regular",
                  }}
                >
                  Login
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
};

export default OnboardingIndex;

const styles = StyleSheet.create({});
