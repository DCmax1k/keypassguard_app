import { DOMAIN } from "../../constants/ServerConstants";

export default async function sendData(path, data) {
  //console.log("Sending data to server:", {path, data});
  // const { user, updateUser } = useUserStore.getState();
  try {
    const response = await fetch(DOMAIN + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Handle HTTP-level errors (server reachable but bad status)
    if (!response.ok) {
      return {
        status: "error",
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const json = await response.json();

    // Ensure it's an object (defensive check)
    if (typeof json !== "object" || json === null) {
      return { status: "error", message: "Invalid JSON from server" };
    }

    return json;
  } catch (err) {
    console.log("Network error:", err.message);

    //return { status: "network_error", message: "No internet connection or server unreachable" };
    // Instead of returning error, save request to retry later, except checkAuth requests
    // if (path !== "/auth" && user && user?.missedHttpResponses) {
    //   updateUser({
    //     missedHttpResponses: [
    //       ...(user.missedHttpResponses || []),
    //       { path, data },
    //     ],
    //   });
    // }
    return {
      network_error: true,
      status: "success",
      message: "Request saved for retrying later",
    };
  }
}
