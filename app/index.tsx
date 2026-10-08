import { authenticateWithBiometrics } from "@/util/authBiometrics";
import auth from "@/util/server/auth";
import { generateUniqueId } from "@/util/uniqueId";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Loading from "../components/Loading";
import ThemedView from "../components/ThemedView";
import { useUserStore } from "../stores/useUserStore";

// Blank screen that fades away to the current state screen.

const RootIndex = () => {
  const options = useUserStore((state: any) => state.options);
  const user = useUserStore((state: any) => state.user);
  const setUser = useUserStore((state: any) => state.setUser);

  // useEffect(() => {

  //   router.replace("/onboarding");

  // }, [user]);

  useEffect(() => {
    const autoLogin = async () => {
      // Auto login if user
      if (!user) {
        await SecureStore.setItemAsync("user_refresh_token", "");
        return router.replace("/onboarding");
      }
      const checkBio = await authenticateWithBiometrics();

      if (checkBio.success) {
        const newToken = checkBio.accessToken;
        const authResponse = await auth(newToken);
        if (authResponse.status !== "success") {
          //setLoading(false);
          //console.log("Error: ", authResponse.message);
          //alertRef.current.showAlert(authResponse.message, false);
          await SecureStore.setItemAsync("user_refresh_token", "");
          return router.replace("/onboarding");
        }

        const { userInfo, user: fullLocalUser } = authResponse;
        let userToSet;
        // Steal more data from db to complete user
        const dbId = fullLocalUser._id;
        const newLocalUser = {
          ...fullLocalUser,
          localId: generateUniqueId(),
          _id: dbId,
          jsonWebToken: newToken,
        };
        userToSet = newLocalUser;

        //setLoading(false);
        setUser(userToSet);
        // updateOptions({ animateDashboard: true });
        router.replace("/dashboard");
      } else {
        await SecureStore.setItemAsync("user_refresh_token", "");
        return router.replace("/onboarding");
      }
    };

    autoLogin();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* <Text>Redirecting...</Text> */}
      <Loading />
    </ThemedView>
  );
};

export default RootIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
