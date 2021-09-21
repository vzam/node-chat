import {
    AuthorizedMessage,
    ClientMux,
    GetLanguagesRequest,
    JoinedChannelEvent,
    LeftChannelEvent,
    Message,
    MuxHandler,
    TextMessageEvent,
} from '@vichat/lib';
import { Store } from './store';
import { ClientMuxAdapter } from './client-mux-adapter';

const ws = new WebSocket('ws://localhost:8080');
const mux = new ClientMux();
const muxAdapter = new ClientMuxAdapter(ws, mux);

muxAdapter.connect();

export const store = new Store(muxAdapter, ws);

ws.addEventListener('open', () => {
    store.send<GetLanguagesRequest>('get-languages', {});
});
