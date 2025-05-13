import { WebSocket } from "ws";

export type ROOM = {
  id: string;
  clients: Set<CLIENT>;
  createdAt: Date;
};

export type CLIENT = WebSocket & {
  id: string;
  roomId?: string;
  isAlive: boolean;
};

export type TYPE =
  | "join-room"
  | "leave-room"
  | "send-chat"
  | "stop-session"
  | "camera-status"
  | "mic-status"
  | "notification"
  | "fetch-action"
  | "offer"
  | "answer"
  | "ice-candidate"
  | "voice-recognition-result";

export type MESSAGE = {
  type: TYPE;
  payload: any;
};
