import { ClientStore } from './store/client-store';
import { ChannelStore } from './store/channel-store';
// import { UserStore } from './store/user-store';

export class Store {
    #clients = new ClientStore();
    #channels = new ChannelStore();

    get clients(): ClientStore {
        return this.#clients;
    }

    get channels(): ChannelStore {
        return this.#channels;
    }
}
