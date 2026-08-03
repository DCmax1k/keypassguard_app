import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { TestUsers } from "../constants/TestUsers";
import deepMerge from "../util/deepMerge";

const DSTORAGE_KEY = "keypassguard-data-storage";

const structuredClone = (value) => JSON.parse(JSON.stringify(value));

const fillMissingKeys = (base, user) => {
  const filled = deepMerge(structuredClone(base), user || {});

  return filled;
};

const USER = TestUsers[0]; // Default user

export const useUserStore = create((set, get) => {
  // Initial state
  const initialState = {
    options: {
      loading: false,
      showOnboarding: false, // Still need to Add onboarding screens
    },
    user: null,
    users: {},
  };

  // Async rehydration from DSTORAGE_KEY
  AsyncStorage.getItem(DSTORAGE_KEY).then((stored) => {
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.user) {
          const userData = fillMissingKeys(structuredClone(USER), data.user);
          const options = {
            ...initialState.options,
            ...data.options,
            loading: false,
          };
          const newUsers = { ...data.users, [userData._id]: userData };
          set({ options, users: newUsers, user: userData });
        } else {
          const options = {
            ...initialState.options,
            ...data.options,
            loading: false,
          };
          const newUsers = { ...data.users };
          set({ options, users: newUsers, user: null });
        }
      } catch (e) {
        console.error("Failed to rehydrate user store:", e);
      }
    }
  });

  return {
    ...initialState,

    setUser: (user) => {
      if (user === null) {
        const newState = {
          ...get(),
          user: null,
          /* SETTING ALL USERS BLANK BECAUSE THIS IS A PASS MANAGER, DONT WANT USERS LOCAL SAVED AT ALL -> */ users:
            {},
        };
        set(newState);
        AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
        return;
      }
      const fillUser = fillMissingKeys(USER, user);
      const newUsers = { ...get().users, [user._id]: fillUser };
      const newState = { ...get(), user: fillUser, users: newUsers };
      set(newState);
      AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
    },

    hardSetUsers: (users) => {
      const newState = { ...get(), users };
      set(newState);
      AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
    },

    updateUser: (updates) => {
      const state = get();
      if (!state.user) return;
      const newUser = deepMerge(structuredClone(state.user), updates);
      const newUsers = { ...state.users, [newUser._id]: newUser };
      const newState = { ...state, user: newUser, users: newUsers };
      set(newState);
      AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
    },

    clearUser: () => {
      const newState = { ...get(), user: null };
      set(newState);
      AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
    },

    updateOptions: (updates) => {
      const options = { ...get().options, ...updates };
      const newState = { ...get(), options };
      set(newState);
      AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
    },
  };
});
