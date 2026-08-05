import Ably from "ably";

let client;

export function getAblyRest() {
  if (!client) {
    client = new Ably.Rest(process.env.ABLY_API_KEY);
  }
  return client;
}

// Channel name for a conversation — same string on both users' browsers.
export function conversationChannel(conversationId) {
  return `conversation:${conversationId}`;
}