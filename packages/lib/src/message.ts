/**
 * The deserialized message form a websocket for further processing by a mux.
 */
export type Message<T = unknown> = {
    type: string;
    data: T;
};

/**
 * The deserialized message form a websocket for further processing by a mux.
 * Contains a jwt token for authentication at the server.
 */
export type AuthorizedMessage<T> = Message<T> & {
    token: string | undefined;
};
