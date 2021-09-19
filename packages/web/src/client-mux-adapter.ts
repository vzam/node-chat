import { Message, ClientMux } from '@vichat/lib';

/**
 * Converts the interface of a websocket to work with the client mux.
 */
export class ClientMuxAdapter {
    #mux: ClientMux;
    #ws: WebSocket;

    get mux(): ClientMux {
        return this.#mux;
    }

    constructor(ws: WebSocket, mux: ClientMux) {
        this.#mux = mux;
        this.#ws = ws;
    }

    connect(): void {
        this.#ws.removeEventListener('open', this.#handleConnectionOpened);
        this.#ws.removeEventListener('message', this.#handleMessageReceived);
        this.#ws.removeEventListener('close', this.#handleConnectionClosed);

        this.#ws.addEventListener('open', this.#handleConnectionOpened);
        this.#ws.addEventListener('message', this.#handleMessageReceived);
        this.#ws.addEventListener('close', this.#handleConnectionClosed);
    }

    #handleConnectionOpened = (ev: Event): void => {
        console.log(`server api connection established`);
    };

    #handleConnectionClosed = (ev: CloseEvent): void => {
        console.log(`server api connection closed: ${ev.reason}`);
    };

    #handleMessageReceived = (ev: MessageEvent<string>): unknown => {
        console.log(`received message ${ev.data}`);

        const message = JSON.parse(ev.data) as Message;
        if (!message || !this.#ws) {
            return;
        }

        this.#mux.handle(this.#ws, message);
    };
}
