import thickarrow from "@/assets/icons/thickarrow.svg";
import ImageContain from "@/components/ImageContain";
import Search from "@/components/Search";
import Spacer from "@/components/Spacer";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import ThinThemedButton from "@/components/ThinThemedButton";
import Colors from "@/constants/Colors";
import { useUserStore } from "@/stores/useUserStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import namelogo from "../../assets/graphics/namelogo.svg";
import profileImg from "../../assets/icons/profileIcon.png";
import { AppContext } from "../../context/AppContext";

const screenwidth = Dimensions.get("screen").width;

interface Site {
  id: string;
  name: string;
  username: string;
  password: string;
  note: string;
}

export default function HomeScreen() {
  const user = useUserStore((store) => store.user);
  const { signOut } = React.useContext(AppContext);
  const insets = useSafeAreaInsets();

  const [selectedSiteId, setSelectedSiteId] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const filterSites = user.sites
    .filter((site: Site) => {
      if (searchValue) {
        if (site.name.toLowerCase().includes(searchValue.toLowerCase()))
          return true;
        else return false;
      } else {
        return true;
      }
    })
    .sort((a: any, b: any) =>
      a.name === b.name ? 0 : a.name < b.name ? -1 : 1,
    );

  const pressSite = (siteId: string) => {
    // Visual
    setSelectedSiteId(siteId);
    setTimeout(() => {
      setSelectedSiteId("");
    }, 500);
    // Collect data
    const site = user.sites.find((s: Site) => s.id === siteId);
    const data = {
      site,
    };
    // Open existing site
    router.push({
      pathname: "/dashboard/addSite",
      params: {
        data: JSON.stringify(data),
      },
    });
  };

  const openNewSite = () => {
    // Create new data
    const newSite: Site = {
      id: "",
      name: "",
      username: "",
      password: "",
      note: "",
    };
    const data = {
      site: newSite,
      newSite: true,
    };
    // Open existing site
    router.push({
      pathname: "/dashboard/addSite",
      params: {
        data: JSON.stringify(data),
      },
    });
  };

  return (
    <ThemedView
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View
        style={{
          width: screenwidth,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <View style={{ width: screenwidth - 150, height: 60 }}>
          <Image source={namelogo} style={{ flex: 1 }} contentFit="contain" />
          <ThemedText style={{ marginTop: -10, color: "#a1a1a1" }}>
            {user.sites.length} site key{user.sites.length === 1 ? "" : "s"}{" "}
            secure
          </ThemedText>
        </View>

        <Pressable onPress={signOut}>
          <ImageContain source={profileImg} size={40} />
        </Pressable>
      </View>
      {/* Search */}
      <Spacer height={20} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingRight: 20,
          gap: 0,
        }}
      >
        <Search
          placeholder="Search site"
          style={{ paddingHorizontal: 10, zIndex: 1, flex: 1 }}
          setValue={setSearchValue}
          value={searchValue}
        />

        <ThinThemedButton text={"Add site"} onPress={openNewSite} />
      </View>

      {/* Sites */}
      <FlatList
        style={{
          flex: 1,
          // borderColor: "red",
          // borderWidth: 1,
          marginBottom: -50,
          paddingBottom: 80,
          marginTop: -25,
          paddingTop: 40,
          paddingHorizontal: 10,
        }}
        contentContainerStyle={{ paddingBottom: 50 }}
        data={filterSites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => pressSite(item.id)}
            style={{
              borderBottomColor: "#646464a2",
              borderBottomWidth: 0.2,
              paddingVertical: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 5,
                borderRadius: 15,
                backgroundColor:
                  selectedSiteId === item.id ? "#ffffff17" : "transparent",
              }}
            >
              <ThemedText
                style={{
                  color: Colors.dark.text,
                  fontSize: 20,
                  maxWidth: screenwidth - (40 + 40),
                }}
              >
                {item.name}
              </ThemedText>
              <ImageContain
                source={thickarrow}
                imgStyle={{ opacity: 0.2 }}
                size={40}
              />
            </View>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
