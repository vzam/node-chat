import { Message, ServerMux } from '@vichat/lib';
import ws from 'ws';

/**
 * Converts the interface of a ws to work with a server mux.
 */
export class ServerMuxAdapter {
    #wss: ws.Server;
    #mux: ServerMux;

    constructor(mux: ServerMux, wss: ws.Server) {
        this.#wss = wss;
        this.#mux = mux;
    }

    /**
     * Subscribes to the websocket server and emits incoming events to the mux.
     */
    connect(): void {
        this.#wss.removeListener('connection', this.#handleConnection);
        this.#wss.on('connection', this.#handleConnection);
    }

    #handleConnection = (ws: ws): void => {
        console.log('client connected');

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        ws.on('message', function (data: string) {
            self.#handleMessage(this, data);
        });
    };

    #handleMessage = (ws: ws, jsonMessage: string): void => {
        console.log(`received message: ${ws}`);

        try {
            const message = JSON.parse(jsonMessage) as Message;
            if (!message) {
                return;
            }

            try {
                this.#mux.handle(ws, message);
            } catch (err) {
                console.error(`error handling message: ${err}`);
            }
        } catch (err) {
            return;
        }
    };
}
