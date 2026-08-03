import { createContext, useContext } from "react";

export const AppContext = createContext({
  showAlert: (_message: string, good = true, time = 3000) => {},
  setShowDisconnectIndicator: (bool: boolean) => {},
  signOut: () => {},
});

export const useAppContext = () => useContext(AppContext);
