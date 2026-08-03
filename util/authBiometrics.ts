import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import sendData from "./server/sendData";

interface BiometricAuthResult {
  success: boolean;
  accessToken?: string;
  error?:
    | "NO_HARDWARE"
    | "NOT_ENROLLED"
    | "BIOMETRICS_FAILED"
    | "NO_TOKEN"
    | "SERVER_ERROR";
  message?: string;
}

/**
 * Triggers FaceID/TouchID and exchanges the secured refresh token for a fresh access token.
 */
export async function authenticateWithBiometrics(): Promise<BiometricAuthResult> {
  try {
    // 1. Hardware verification
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      return {
        success: false,
        error: "NO_HARDWARE",
        message: "Device does not support biometrics.",
      };
    }
    if (!isEnrolled) {
      return {
        success: false,
        error: "NOT_ENROLLED",
        message: "No biometric data enrolled on this device.",
      };
    }

    // 3. Retrieve the long-lived 30-day Refresh Token from secure hardware storage
    const storedRefreshToken =
      await SecureStore.getItemAsync("user_refresh_token");

    if (!storedRefreshToken) {
      return {
        success: false,
        error: "NO_TOKEN",
        message: "No refresh token found. Manual login required.",
      };
    }

    // 2. Trigger the native Face ID / Touch ID prompt
    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: "Log in securely with Face ID",
      fallbackLabel: "Use Passcode",
    });

    if (!biometricResult.success) {
      return {
        success: false,
        error: "BIOMETRICS_FAILED",
        message: "Authentication canceled or failed.",
      };
    }

    // // 3. Retrieve the long-lived 30-day Refresh Token from secure hardware storage
    // const storedRefreshToken =
    //   await SecureStore.getItemAsync("user_refresh_token");

    // if (!storedRefreshToken) {
    //   return {
    //     success: false,
    //     error: "NO_TOKEN",
    //     message: "No refresh token found. Manual login required.",
    //   };
    // }

    // 4. Hit your Node server's refresh endpoint
    const data = await sendData("/auth/refresh", {
      refreshToken: storedRefreshToken,
    });
    // console.log(data);
    if (data.status === "success" && data.accessToken) {
      // Success! Return the new 15-minute Access Token to the caller
      return {
        success: true,
        accessToken: data.accessToken,
      };
    } else {
      // The server rejected the token (expired 30-day limit, banned user, etc.)
      return {
        success: false,
        error: "SERVER_ERROR",
        message: data.error || "Server authentication failed.",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "SERVER_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}

export function useBiometricLabel() {
  const [biometricName, setBiometricName] = useState("Biometrics");

  useEffect(() => {
    async function checkHardwareTypes() {
      // 1. Get the list of supported types from the device hardware
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Mapping rules:
      // 1 = FINGERPRINT (Touch ID / Android Fingerprint)
      // 2 = FACIAL_RECOGNITION (Face ID / Android Face Unlock)
      // 3 = IRIS (Android Iris Scan)
      if (types.includes(2)) {
        setBiometricName("Face ID");
      } else if (types.includes(1)) {
        setBiometricName("Touch ID"); // Or 'Fingerprint' depending on your design preference
      } else if (types.includes(3)) {
        setBiometricName("Iris Scan");
      } else {
        setBiometricName("Biometrics");
      }
    }

    checkHardwareTypes();
  }, []);

  return biometricName;
}
