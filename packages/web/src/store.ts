import { AuthorizedMessage, ClientMessage, ClientMux } from '@vichat/lib';
import { ClientMuxAdapter } from './client-mux-adapter';

type TextMessage = {
    userId: number;
    nickname: string;
    text: string;
};

export class Store {
    #ws: WebSocket;
    #muxAdapter: ClientMuxAdapter;

    #userId: number | undefined;
    #nickname: string | undefined;
    #token: string | undefined;

    #messages: TextMessage[] = [];

    get mux(): ClientMux {
        return this.#muxAdapter.mux;
    }

    get userId(): number | undefined {
        return this.#userId;
    }

    get nickname(): string | undefined {
        return this.#nickname;
    }

    get token(): string | undefined {
        return this.#token;
    }

    constructor(muxAdapter: ClientMuxAdapter, ws: WebSocket) {
        this.#muxAdapter = muxAdapter;
        this.#ws = ws;
    }

    setLoggedIn(userId: number, nickname: string, token: string): void {
        this.#token = token;
        this.#userId = userId;
        this.#nickname = nickname;
    }

    setLoggedOut(): void {
        this.#token = undefined;
        this.#userId = undefined;
        this.#nickname = undefined;
        this.#messages = [];
    }

    addMessage(userId: number, nickname: string, text: string): void {
        this.#messages.push({
            userId,
            nickname,
            text,
        });
    }

    send<T>(event: ClientMessage, data: T): void {
        this.#ws.send(
            JSON.stringify({
                // the token may be undefined, but it is the responsibility
                // of the server to validate that for certain events
                token: this.token,
                type: event,
                data,
            } as AuthorizedMessage<T>),
        );
    }
}
