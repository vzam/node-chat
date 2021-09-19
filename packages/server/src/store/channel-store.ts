type Client = {
    clientId: number;
    nickname: string;
};

type Channel = {
    name: string;
    clients: Client[];
};

export class ChannelStore {
    /**
     * The client ids within this channel.
     */
    #channels: Channel[] = [];

    /**
     * Returns all clients currently being members of a channel.
     */
    getClients(channelName: string): Client[] {
        const index = this.#channels.findIndex((e) => e.name === channelName);
        if (index === -1) {
            return [];
        }
        return this.#channels[index].clients.map((client) => ({ ...client }));
    }

    getClient(clientId: number): Client | undefined {
        for (const channel of this.#channels) {
            const client = channel.clients.find((e) => e.clientId === clientId);
            if (client !== undefined) {
                return client;
            }
        }
        return undefined;
    }

    /**
     * Adds a client to the channel.
     * @param clientId The client id.
     * @param nickname The nickname of the client.
     * @param channelName The channel name.
     */
    addClient(clientId: number, nickname: string, channelName: string): void {
        const [channel] = this.#findOrCreateChannel(channelName);
        this.#findOrAddClientToChannel(channel, clientId, nickname);
    }

    /**
     * Removes a client from all channels.
     * @param clientId
     */
    removeClient(clientId: number): void;

    /**
     * Removes a client from a channel.
     * @param clientId The client id.
     * @param name The channel name.
     */
    removeClient(clientId: number, name?: string): void {
        let channels = this.#channels;
        if (name !== undefined) {
            channels = channels.filter((e) => e.name === name);
        }

        channels.forEach((e) => this.#removeClientFromChannel(e, clientId));
        this.#removeEmptyChannels();
    }

    #removeEmptyChannels(): void {
        const channels: Channel[] = [];

        this.#channels.forEach((e) => {
            if (e.clients.length > 0) {
                channels.push(e);
            }
        });
        this.#channels = channels;
    }

    #findOrCreateChannel(name: string): [Channel, number] {
        const index = this.#channels.findIndex((e) => e.name === name);
        if (index !== -1) {
            return [this.#channels[index], index];
        }
        const channel: Channel = {
            name,
            clients: [],
        };
        return [channel, this.#channels.push(channel) - 1];
    }

    #findOrAddClientToChannel(channel: Channel, clientId: number, nickname: string): number {
        const index = channel.clients.findIndex((e) => e.clientId === clientId);
        if (index !== -1) {
            return index;
        }
        return channel.clients.push({ clientId, nickname }) - 1;
    }

    #removeClientFromChannel(channel: Channel, clientId: number): void {
        const index = channel.clients.findIndex((e) => e.clientId === clientId);
        if (index === -1) {
            return;
        }
        channel.clients.splice(index, 1);
    }
}
