import { ClientStore } from './store/client-store';
import { ChannelStore } from './store/channel-store';
// import { UserStore } from './store/user-store';
import { MessageStore } from './store/message-store';

export class Store {
    #clients = new ClientStore();
    #channels = new ChannelStore();
    #messages = new MessageStore();

    get clients(): ClientStore {
        return this.#clients;
    }

    get channels(): ChannelStore {
        return this.#channels;
    }

    get messages(): MessageStore {
        return this.#messages;
    }
}
