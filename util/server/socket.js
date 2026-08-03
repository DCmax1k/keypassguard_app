import { DOMAIN } from '../../constants/ServerConstants';

import { io } from "socket.io-client";

export const socket = io(DOMAIN, {
    transports: ["websocket"],
    autoConnect: false,
});