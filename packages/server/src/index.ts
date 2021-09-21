import ws from 'ws';
import { Store } from './store';
import { ServerMuxAdapter } from './server-mux-adapter';
import {
    AuthorizedMessage,
    GetLanguagesRequest,
    JoinChannelRequest,
    JoinedChannelEvent,
    LeaveChannelRequest,
    LeftChannelEvent,
    SendMessageRequest,
    ServerMux,
    SupportedLanguagesEvent,
    TextMessageEvent,
    Language,
    Message,
} from '@vichat/lib';
import dotenv from 'dotenv';
import { BingTranslator } from './translators/bing-translator';

dotenv.config();

const wss = new ws.Server({
    port: 8080,
});

const mux = new ServerMux();

const muxAdapter = new ServerMuxAdapter(mux, wss);
const store = new Store();
const translator = new BingTranslator();

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

mux.onMessage<GetLanguagesRequest>('get-languages', async (message, ws) => {
    const response: Message<SupportedLanguagesEvent> = {
        type: 'supported-languages',
        data: {
            languages: await translator.getSupportedLanguages(),
        },
    };

    ws.send(JSON.stringify(response));
});

mux.onAuthenticatedMessage<JoinChannelRequest>('join-channel', (message, ws) => {
    const clientId = store.clients.add(ws);
    const token = store.clients.sign(clientId);

    store.channels.addClient(clientId, message.data.nickname, message.data.languageCode, 'default');

    store.clients.send<JoinedChannelEvent>(clientId, 'joined-channel', {
        nickname: message.data.nickname,
        languageCode: message.data.languageCode,
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

    const translatedTexts: {
        [languageCode: string]: string;
    } = {};

    clientsInChannel.forEach(async (client) => {
        const text =
            translatedTexts[client.languageCode] ??
            (await translator.translate(message.data.text, sender.languageCode, client.languageCode));

        store.clients.send<TextMessageEvent>(client.clientId, 'message', {
            nickname: sender.nickname,
            clientId: sender.clientId,
            text,
        });
    });
});

muxAdapter.connect();
