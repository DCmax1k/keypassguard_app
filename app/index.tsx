import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Loading from "../components/Loading";
import ThemedView from "../components/ThemedView";
import { useUserStore } from "../stores/useUserStore";

// Blank screen that fades away to the current state screen.

const RootIndex = () => {
  const options = useUserStore((state: any) => state.options);
  const user = useUserStore((state: any) => state.user);

  useEffect(() => {
    //setTimeout(() => {
    //if (user) {
    // router.replace("/dashboard"); // dashboard will do the reauth
    //} else {
    router.replace("/onboarding");
    //}
    //}, 0);
  }, [user]);

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
