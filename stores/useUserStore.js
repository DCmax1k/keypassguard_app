// This is the optimized, using original dependencies and old data storage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { TestUsers } from "../constants/TestUsers";
import deepMerge from "../util/deepMerge";

const DSTORAGE_KEY = "data-storage";

const structuredClone = (value) => JSON.parse(JSON.stringify(value));

const fillMissingKeys = (base, user) => {
  const filled = deepMerge(structuredClone(base), user || {});

  return filled;
};

const USER = TestUsers[0]; // Default user

// Helper to persist only light payload to disk to prevent storage crashes
const saveToDisk = async (user, options) => {
  try {
    const payload = JSON.stringify({ user, options });
    await AsyncStorage.setItem(DSTORAGE_KEY, payload);
  } catch (e) {
    console.error("Failed to write state to AsyncStorage:", e);
  }
};

export const useUserStore = create((set, get) => {
  //   // Initial state
  const initialState = {
    options: {
      loading: false,
      showOnboarding: false, // Still need to Add onboarding screens
    },
    user: null,
    users: {},
    hasRehydrated: false,
  };

  // Async rehydration from DSTORAGE_KEY
  AsyncStorage.getItem(DSTORAGE_KEY).then((stored) => {
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.user) {
          const userData = fillMissingKeys(USER, data.user);
          const options = {
            ...initialState.options,
            ...data.options,
            loading: false,
          };
          set({ options, user: userData, hasRehydrated: true });

          // to overwrite the file and permanently delete 'users' from storage.
          if (data.users && Object.keys(data.users).length > 0) {
            saveToDisk(userData, options);
          }
        } else {
          const options = {
            ...initialState.options,
            ...data.options,
            loading: false,
          };
          set({ options, user: null, hasRehydrated: true });
        }
      } catch (e) {
        console.error("Failed to rehydrate user store:", e);
        set({ hasRehydrated: true });
      }
    } else {
      set({ hasRehydrated: true });
    }
  });

  return {
    ...initialState,

    setUser: (user) => {
      if (user === null) {
        const currentOptions = get().options;
        set({ user: null });
        saveToDisk(null, currentOptions);
        return;
      }
      const fillUser = fillMissingKeys(USER, user);
      const currentOptions = get().options;
      set({ user: fillUser });
      saveToDisk(fillUser, currentOptions);
    },

    hardSetUsers: (users) => {
      // Retained for compatibility without saving duplicates
      set({ users: {} });
    },

    updateUser: (updates) => {
      const state = get();
      if (!state.user) return;
      const newUser = deepMerge(structuredClone(state.user), updates);
      set({ user: newUser });
      saveToDisk(newUser, state.options);
    },

    clearUser: () => {
      const currentOptions = get().options;
      set({ user: null });
      saveToDisk(null, currentOptions);
    },

    updateOptions: (updates) => {
      const options = { ...get().options, ...updates };
      set({ options });
      saveToDisk(get().user, options);
    },
  };
});

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { create } from "zustand";
// import { TestUsers } from "../constants/TestUsers";
// import deepMerge from "../util/deepMerge";

// const DSTORAGE_KEY = "keypassguard-data-storage";

// const structuredClone = (value) => JSON.parse(JSON.stringify(value));

// const fillMissingKeys = (base, user) => {
//   const filled = deepMerge(structuredClone(base), user || {});

//   return filled;
// };

// const USER = TestUsers[0]; // Default user

// export const useUserStore = create((set, get) => {
//   // Initial state
//   const initialState = {
//     options: {
//       loading: false,
//       showOnboarding: false, // Still need to Add onboarding screens
//     },
//     user: null,
//     users: {},
//   };

//   // Async rehydration from DSTORAGE_KEY
//   AsyncStorage.getItem(DSTORAGE_KEY).then((stored) => {
//     if (stored) {
//       try {
//         const data = JSON.parse(stored);
//         if (data.user) {
//           const userData = fillMissingKeys(structuredClone(USER), data.user);
//           const options = {
//             ...initialState.options,
//             ...data.options,
//             loading: false,
//           };
//           const newUsers = { ...data.users, [userData._id]: userData };
//           set({ options, users: newUsers, user: userData });
//         } else {
//           const options = {
//             ...initialState.options,
//             ...data.options,
//             loading: false,
//           };
//           const newUsers = { ...data.users };
//           set({ options, users: newUsers, user: null });
//         }
//       } catch (e) {
//         console.error("Failed to rehydrate user store:", e);
//       }
//     }
//   });

//   return {
//     ...initialState,

//     setUser: (user) => {
//       if (user === null) {
//         const newState = {
//           ...get(),
//           user: null,
//           /* SETTING ALL USERS BLANK BECAUSE THIS IS A PASS MANAGER, DONT WANT USERS LOCAL SAVED AT ALL -> */ users:
//             {},
//         };
//         set(newState);
//         AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
//         return;
//       }
//       const fillUser = fillMissingKeys(USER, user);
//       const newUsers = { ...get().users, [user._id]: fillUser };
//       const newState = { ...get(), user: fillUser, users: newUsers };
//       set(newState);
//       AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
//     },

//     hardSetUsers: (users) => {
//       const newState = { ...get(), users };
//       set(newState);
//       AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
//     },

//     updateUser: (updates) => {
//       const state = get();
//       if (!state.user) return;
//       const newUser = deepMerge(structuredClone(state.user), updates);
//       const newUsers = { ...state.users, [newUser._id]: newUser };
//       const newState = { ...state, user: newUser, users: newUsers };
//       set(newState);
//       AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
//     },

//     clearUser: () => {
//       const newState = { ...get(), user: null };
//       set(newState);
//       AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
//     },

//     updateOptions: (updates) => {
//       const options = { ...get().options, ...updates };
//       const newState = { ...get(), options };
//       set(newState);
//       AsyncStorage.setItem(DSTORAGE_KEY, JSON.stringify(newState));
//     },
//   };
// });
