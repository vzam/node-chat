/**
 * Client request to join a channel.
 */
export type JoinChannelRequest = {
    nickname: string;
};

/**
 * Server event after a user has joined a channel.
 * Only the client who has joined the channel will receive this event.
 */
export type JoinedChannelEvent = {
    nickname: string;
    clientId: number;
    token: string;
};

/**
 * Client request to leave a channel.
 */
export type LeaveChannelRequest = Record<string, unknown>;

/**
 * Server event after a user has left a channel.
 * Only the client who has left the channel will receive this event.
 */
export type LeftChannelEvent = Record<string, unknown>;

/**
 * Client request to send a text message to other clients.
 */
export type SendMessageRequest = {
    text: string;
};

/**
 * Server event after a user has send a message.
 * All users, including the sender within the same channel will receive this event.
 */
export type TextMessageEvent = {
    text: string;
    nickname: string;
    clientId: number;
};

/**
 * Possible messages which the client may send.
 */
export type ClientMessage = 'join-channel' | 'leave-channel' | 'send-message';

/**
 * Possible messages which the server may send.
 */
export type ServerMessage = 'joined-channel' | 'left-channel' | 'message';
