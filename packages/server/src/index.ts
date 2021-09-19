import ws from 'ws';
import { Store } from './store';
import { ServerMuxAdapter } from './server-mux-adapter';
import {
    AuthorizedMessage,
    JoinChannelRequest,
    JoinedChannelEvent,
    LeaveChannelRequest,
    LeftChannelEvent,
    SendMessageRequest,
    ServerMux,
    TextMessageEvent,
} from '@vichat/lib';

const wss = new ws.Server({
    port: 8080,
});

const mux = new ServerMux();

const muxAdapter = new ServerMuxAdapter(mux, wss);
const store = new Store();

store.messages.addTransform((text) => text.replace('lebowsky', 'the dude'));

const authenticate = (message: AuthorizedMessage<unknown>, ws: ws): number => {
    if (message.token === undefined) {
        throw new Error(`token is not set`);
    }
    return store.clients.verify(message.token, ws);
};

wss.on('connection', function (ws) {
    ws.on('close', function (ws: ws, code: number, reason: string) {
        console.log(`connection was closed, reason: ${reason}`);
        const clientId = store.clients.findByWs(ws);
        if (clientId !== undefined) {
            store.clients.remove(clientId);
        }
    });
    ws.on('error', function (err) {
        console.log(`connection had an error: ${err}`);
    });
});

mux.onAuthenticatedMessage<JoinChannelRequest>('join-channel', (message, ws) => {
    const clientId = store.clients.add(ws);
    const token = store.clients.sign(clientId);

    store.channels.addClient(clientId, message.data.nickname, 'default');

    store.clients.send<JoinedChannelEvent>(clientId, 'joined-channel', {
        nickname: message.data.nickname,
        token,
        clientId,
    });
});

mux.onAuthenticatedMessage<LeaveChannelRequest>('leave-channel', (message, ws) => {
    const clientId = authenticate(message, ws);

    store.channels.removeClient(clientId);
    store.clients.send<LeftChannelEvent>(clientId, 'left-channel', {});
    store.clients.remove(clientId);
});

mux.onAuthenticatedMessage<SendMessageRequest>('send-message', (message, ws) => {
    const clientId = authenticate(message, ws);
    const sender = store.channels.getClient(clientId);
    if (sender === undefined) {
        return;
    }

    const clientsInChannel = store.channels.getClients('default');

    clientsInChannel.forEach((client) => {
        store.clients.send<TextMessageEvent>(client.clientId, 'message', {
            nickname: sender.nickname,
            clientId: sender.clientId,
            text: store.messages.applyTransforms(message.data.text),
        });
    });
});

muxAdapter.connect();
