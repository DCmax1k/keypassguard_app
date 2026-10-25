import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { useUserStore } from "@/stores/useUserStore";
import { authenticateWithBiometrics } from "@/util/authBiometrics";
import auth from "@/util/server/auth";
import { Redirect, Stack, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { AppContext } from "../../context/AppContext";
import sendData from "../../util/server/sendData";

export default function DashboardLayout() {
  const user = useUserStore((state: any) => state.user);
  const users = useUserStore((state: any) => state.users);
  const updateOptions = useUserStore((state: any) => state.updateOptions);
  const setUser = useUserStore((state: any) => state.setUser);
  const { signOut } = React.useContext(AppContext);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!user) {
      // If user is null, redirect to login page
      router.replace("/onboarding");
    }
  }, [user]);

  const updateUserData = (authResponse: any) => {
    const { userInfo } = authResponse;
    // Find user in users and set - DONT USE USERS ANYMORE
    // const localUserIds = Object.keys(users);
    // const idx = localUserIds.findIndex(
    //   (localId) => users[localId]._id === userInfo._id,
    // );

    // if (idx > -1) {
    //   let userToSet;
    //   const localU = users[localUserIds[idx]];
    //   userToSet = { ...localU, ...userInfo };
    //   setUser(userToSet);
    // }
    let userToSet = { ...user, ...userInfo };
    setUser(userToSet);
  };

  // useEffect(() => {
  //   // Initially check auth
  //   checkAuth();
  // }, []);

  const checkAuth = async () => {
    let passedAuth = false;

    const currentToken = useUserStore.getState().user.jsonWebToken;
    console.log("Auth ", currentToken);
    const pingAuth = await auth(currentToken);

    if (pingAuth.status === "success") {
      passedAuth = true;
      updateUserData(pingAuth);
      console.log("updated user data");
    }

    // If authtoken expired, do a Face ID here
    if (!passedAuth) {
      console.log("Try face id");
      const checkBio = await authenticateWithBiometrics();
      //console.log("After face id", checkBio);

      if (checkBio.success) {
        const newToken = checkBio.accessToken;
        //console.log("Most current token");
        //console.log(newToken);

        // 2. Update the store with the fresh token
        useUserStore.getState().updateUser({ jsonWebToken: newToken });
        passedAuth = true;
      } else {
        signOut();
        return; // Stop execution immediately on failure
      }
    }

    if (!passedAuth) return signOut();

    // 3. Grab a fresh snapshot of the user object to check missed HTTP requests
    const freshUser = useUserStore.getState().user;

    //console.log("Checking for missed HTTP responses...");
    if (
      freshUser.missedHttpResponses &&
      freshUser.missedHttpResponses.length > 0
    ) {
      console.log(
        "Catching up on missed HTTP responses: ",
        freshUser.missedHttpResponses,
      );

      await Promise.all(
        freshUser.missedHttpResponses.map(
          async ({ path, data }: { path: string; data: any }) => {
            await sendData(path, data);
          },
        ),
      );
      console.log("Finished catching up on missed HTTP responses");
      useUserStore.getState().updateUser({ missedHttpResponses: [] });
    }

    setAuthenticated(true);
  };

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current?.match(/inactive|background/) &&
        nextState === "active"
      ) {
        console.log("📲 App has come back to foreground!");
        // Run your function here
        checkAuth();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [user]);

  if (!user) return <Redirect href={"/onboarding"} />;
  return (
    <ThemedView style={{ flex: 1 }}>
      {!authenticated && (
        <Animated.View exiting={FadeOut}>
          <ThemedView
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 5,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ThemedText>Authenticating</ThemedText>
          </ThemedView>
        </Animated.View>
      )}

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      ></Stack>
    </ThemedView>
  );
}
