import ws from 'ws';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Message } from '@vichat/lib';

type Client = {
    id: number;
    ws: ws;
};

type Token = {
    clientId: number;
};

export class ClientStore {
    #cursor = 0;
    #clients: Client[] = [];
    #secret = process.env.JWT_SECRET ?? crypto.randomBytes(256).toString('base64');

    /**
     * Adds a client by web socket.
     * @param ws
     * @throws When the web socket is already registered.
     * @returns The client id.
     */
    add(ws: ws): number {
        if (!!this.findByWs(ws)) throw new Error(`the web socket is already registered as a client`);

        this.#clients.push({
            id: ++this.#cursor,
            ws,
        });
        return this.#cursor;
    }

    /**
     * Removes a client by id.
     * @param id The client id.
     */
    remove(id: number): void {
        const index = this.#clients.findIndex((e) => e.id == id);
        if (index === -1) return;

        this.#clients.splice(index, 1);
    }

    /**
     * Finds the ws by client id.
     * @returns The ws or undefined when not registered.
     */
    findById(id: number): ws | undefined {
        return this.#clients.find((e) => e.id == id)?.ws;
    }

    /**
     * Finds the client id by ws.
     * @returns The client id or undefined when not registered.
     */
    findByWs(ws: ws): number | undefined {
        return this.#clients.find((e) => e.ws == ws)?.id;
    }

    /**
     * Creates a jwt for a client.
     * @param clientId The client id.
     * @returns The jwt.
     */
    sign(clientId: number): string {
        const token: Token = {
            clientId: clientId,
        };
        return jwt.sign(token, this.#secret, {});
    }

    /**
     * Verifies the given token.
     * @param token The jwt to verify.
     * @throws When the token is invalid.
     * @returns The id of the client.
     */
    verify(token: string, ws?: ws): number {
        try {
            const decoded = jwt.verify(token, this.#secret, {}) as Token;

            if (ws === undefined) {
                return decoded.clientId;
            }

            const id = this.findByWs(ws);
            if (id !== undefined && id !== decoded.clientId) {
                throw new Error(`mismatch of registered id and encoded id`);
            }
            return decoded.clientId;
        } catch (err) {
            console.error(err);
            throw new Error(`failed to verify jwt ${token}`);
        }
    }

    /**
     * Sends a new message to the websocket of the client.
     */
    send<T>(clientId: number, type: string, data: T): void {
        const ws = this.findById(clientId);
        if (ws === undefined) {
            return;
        }

        ws.send(JSON.stringify({ data, type } as Message<T>));
    }
}
