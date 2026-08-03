import rightArrow from "@/assets/icons/rightArrow.png";
import trash from "@/assets/icons/trash.png";
import ConfirmMenu from "@/components/ConfirmMenu";
import ImageContain from "@/components/ImageContain";
import LockedInput, { LockedInputRef } from "@/components/LockedInput";
import Spacer from "@/components/Spacer";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThinThemedButton from "@/components/ThinThemedButton";
import Colors from "@/constants/Colors";
import { AppContext } from "@/context/AppContext";
import { useUserStore } from "@/stores/useUserStore";
import sendData from "@/util/server/sendData";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddSite() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert } = useContext(AppContext);
  const passwordInputRef = useRef<LockedInputRef>(null);
  const user = useUserStore((store) => store.user);
  const updateUser = useUserStore((store) => store.updateUser);

  // Get passed data
  const params = useLocalSearchParams();
  const dataString = params.data as string;
  const data = dataString ? JSON.parse(dataString) : null;
  if (data === null) return null;
  const site = data.site;

  //console.log(site);
  //

  const [editMode, setEditMode] = useState(data.newSite ? true : false);
  const [decrypted, setDecrypted] = useState(data.newSite ? true : false);

  const [confirmMenuActive, setConfirmMenuActive] = useState(false);
  const [confirmMenuData, setConfirmMenuData] = useState({
    title: "The title",
    subTitle: "The description for the confirmation",
    subTitle2: "Another one here",
    option1: "Update",
    option1color: "",
    option2: "Cancel",
    confirm: () => {},
  });

  ////// Prevent swipe out nav
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
      headerBackButtonMenuEnabled: false,
    });

    // Block Android hardware back button
    const onBackPress = () => {
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [navigation]);

  const handleGoBack = () => {
    router.back();
  };
  ////////

  const [name, setName] = useState(site.name);
  const [username, setUsername] = useState(site.username);
  const [password, setPassword] = useState("");
  const [note, setNote] = useState(site.note);

  const cancelEdits = () => {
    // Set back data, set decrypted false, set edit mode false
    setName(site.name);
    setUsername(site.username);
    setPassword("");
    setNote(site.note);
    setDecrypted(false);
    setEditMode(false);
    // Hide Password because should be encrypted again
    passwordInputRef?.current?.hideText();
  };

  const enableEdit = async () => {
    await fetchDecrypt();
    setEditMode(true);
  };

  const handleCancel = () => {
    // Confirm discard changes and cancel if so, set data back to what is was originally
    if (name || username || password || note) {
      // Confirm
      setConfirmMenuData({
        title: "Discard Changes?",
        subTitle: "Any changes made will not be saved",
        subTitle2: "",
        option1: "Discard changes",
        option1color: Colors.bad,
        option2: "Go back",
        confirm: () => {
          cancelEdits();
        },
      });
      setConfirmMenuActive(true);
    } else {
      if (data.newSite) {
        return handleGoBack();
      }
      cancelEdits();
    }
  };

  const handleSave = async () => {
    // Upload all current data to db and if success set edit mode false
    const newSite = {
      id: site.id,
      name,
      username,
      password,
      note,
    };
    const response = await sendData("/dashboard/savesite", { site: newSite });
    if (response.status !== "success") {
      showAlert(response.message, false);
      return;
    }
    if (!site.id) {
      const userSites = user.sites;
      userSites.push(response.site);
      updateUser({ sites: userSites });
    } else {
      const ind = user.sites.findIndex((s: any) => {
        return s.id === site.id;
      });
      if (ind > -1) {
        const newSites = user.sites;
        newSites[ind] = response.site;
        updateUser({ sites: newSites });
      } else {
        showAlert("Site id not found, nothing was saved", false);
      }
    }

    setEditMode(false);
    showAlert("Site successfully saved!");
  };

  const fetchDecrypt = async () => {
    // Get new password and set it to state
    if (!decrypted) {
      if (!site.id) {
        setPassword("");
        setDecrypted(true);
        return "";
      }
      const response = await sendData("/dashboard/requestdecrypt", {
        site: { id: site.id },
      });
      if (response.status !== "success") {
        showAlert(response.message, false);
        return "";
      }
      const decryptPass = atob(response.data);
      setPassword(decryptPass);
      setDecrypted(true);
      return decryptPass;
    }
    return password;
  };

  const trashSite = async () => {
    const siteId = site.id;
    const response = await sendData("/dashboard/deletesite", {
      site: { id: siteId },
    });
    if (response.status !== "success") {
      return showAlert(response.message, false);
    }
    // Update local
    const allSites = user.sites;
    const ind = allSites.findIndex((s: any) => {
      return s.id === siteId;
    });
    if (ind > -1) {
      allSites.splice(ind, 1);
    }
    updateUser({ sites: allSites });
    handleGoBack();
  };

  const requestTrashSite = () => {
    setConfirmMenuData({
      title: "Delete site",
      subTitle: "Remove all data associated with this site record?",
      subTitle2: "This action cannot be undone.",
      option1: "Confirm Delete",
      option1color: Colors.bad,
      option2: "Cancel",
      confirm: () => {
        trashSite();
      },
    });
    setConfirmMenuActive(true);
  };

  const copyPassToCB = async () => {
    let pass = "";
    if (!decrypted) {
      pass = await fetchDecrypt();
    } else {
      pass = password;
    }
    copyToClipboard(pass);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showAlert("Copied to clipboard!", true);
  };

  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const scrollToInput = (reactNode: any) => {
    if (scrollRef.current && reactNode) {
      // This is the package's internal scroll injection method
      scrollRef.current.scrollToFocusedInput(reactNode);
    }
  };

  return (
    <ThemedView
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ConfirmMenu
        active={confirmMenuActive}
        setActive={setConfirmMenuActive}
        data={confirmMenuData}
      />
      {/* Header - edit mode ? (Cancel - (trash-save)) : (Back - Edit) */}
      <View
        style={{ width: "100%", paddingHorizontal: 20, paddingVertical: 10 }}
      >
        {editMode ? (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            key={"edit-mode-true"}
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThinThemedButton text="Cancel" onPress={handleCancel} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <Pressable
                onPress={requestTrashSite}
                style={{
                  borderColor: Colors.bad,
                  borderWidth: 1,
                  borderRadius: 999999,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                }}
              >
                <ImageContain
                  size={15}
                  source={trash}
                  imgStyle={{ tintColor: Colors.bad }}
                />
              </Pressable>
              <ThinThemedButton
                style={{ paddingHorizontal: 25 }}
                text="Save"
                onPress={handleSave}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            key={"edit-mode-false"}
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Pressable
              style={{
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleGoBack}
            >
              <ImageContain
                source={rightArrow}
                imgStyle={{ transform: [{ rotate: "180deg" }] }}
              />
            </Pressable>

            <ThinThemedButton text="Edit" onPress={enableEdit} />
          </Animated.View>
        )}
      </View>
      {/* Body */}

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={{
          flex: 1,
          marginBottom: -50,
        }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 170 }} // 1. Extra bottom padding gives the scroll area room to slide up
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120} // 2. Increase from 20/50 to 120 (adds explicit padding above the keyboard layout)
        extraHeight={180} // 3. Tells the calculation engine to lift elements even higher
        showsVerticalScrollIndicator={false}
      >
        <Spacer height={10} />
        {/* Inputs */}
        <ThemedText
          style={{ paddingHorizontal: 10, paddingVertical: 5, fontSize: 18 }}
        >
          Site Label
        </ThemedText>
        <LockedInput
          type={"text"}
          value={name}
          setValue={setName}
          placeholder={"ex. Keypass Guard"}
          locked={!editMode}
        />
        <Spacer height={20} />

        <ThemedText
          style={{ paddingHorizontal: 10, paddingVertical: 5, fontSize: 18 }}
        >
          Username
        </ThemedText>
        <LockedInput
          type={"text"}
          value={username}
          setValue={setUsername}
          placeholder={""}
          locked={!editMode}
          copy={true}
          copyCallback={() => copyToClipboard(username)}
        />
        <Spacer height={20} />

        <ThemedText
          style={{ paddingHorizontal: 10, paddingVertical: 5, fontSize: 18 }}
        >
          Password
        </ThemedText>
        <LockedInput
          ref={passwordInputRef}
          type={"password"}
          value={decrypted ? password : password || "passwordpassword"}
          setValue={setPassword}
          placeholder={""}
          locked={!editMode}
          copy={true}
          copyCallback={copyPassToCB}
          requestView={fetchDecrypt}
          wand={true}
        />
        <Spacer height={20} />

        <ThemedText
          style={{ paddingHorizontal: 10, paddingVertical: 5, fontSize: 18 }}
        >
          Note
        </ThemedText>
        <LockedInput
          type={"textarea"}
          value={note}
          setValue={setNote}
          placeholder={""}
          locked={!editMode}
          copy={true}
          copyCallback={() => copyToClipboard(note)}
          onFocus={(event: any) => scrollToInput(event.target)}
        />
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
