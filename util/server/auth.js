import { VSN } from "../../constants/ServerConstants";
import sendData from "./sendData";

const auth = async (jsonWebToken) => {
  // Send data to page /auth
  const response = await sendData("/auth", { jsonWebToken });
  if (response.status !== "success") return response;
  // Get user data and server version
  // const { userInfo } = response;
  console.log("Good version: ", `${response.vsn} <= ${VSN}`);
  return { goodVersion: response.vsn <= VSN, ...response };
  // return {status: "success", userInfo}
};

export default auth;
