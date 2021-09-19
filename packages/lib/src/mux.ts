import { AuthorizedMessage, ClientMessage, Message, ServerMessage } from '@vichat/lib';
import ws from 'ws';

/**
 * Handles incoming messages.
 */
export type MuxHandler<TWebSocket, TMessage extends Message> = (message: TMessage, ws: TWebSocket) => void;

/**
 * A multiplexer for websocket messages.
 */
class Mux<TWebSocket, TEventName extends string> {
    #messageHandlers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: MuxHandler<TWebSocket, any>[];
    } = {};

    /**
     * Invokes the event handlers subscribed to the message type in data.
     * @param ws The origin of the message.
     */
    public handle<TMessage extends Message = Message>(ws: TWebSocket, message: TMessage): void {
        const handlers = this.#messageHandlers[message.type];
        if (!handlers) {
            return;
        }

        handlers.forEach((handler) => {
            handler(message, ws);
        });
    }

    /**
     * Adds an event handler to the specified event.
     */
    public on<TMessage extends Message = Message<unknown>>(
        event: TEventName,
        handler: MuxHandler<TWebSocket, TMessage>,
    ): void {
        this.#messageHandlers[event] ??= [];
        this.#messageHandlers[event].push(handler as MuxHandler<TWebSocket, TMessage>);
    }

    /**
     * Shortcut for on() with a message which does not have a token.
     */
    public onMessage<TEvent>(event: TEventName, handler: MuxHandler<TWebSocket, Message<TEvent>>) {
        this.on<Message<TEvent>>(event, handler);
    }

    /**
     * Shortcut for on() with a message containing a token.
     */
    public onAuthenticatedMessage<TEvent>(
        event: TEventName,
        handler: MuxHandler<TWebSocket, AuthorizedMessage<TEvent>>,
    ) {
        this.on<AuthorizedMessage<TEvent>>(event, handler);
    }
}

export class ServerMux extends Mux<ws, ClientMessage> {}
export class ClientMux extends Mux<WebSocket, ServerMessage> {}
