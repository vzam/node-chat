import { LoginData, LoginForm } from './login-form';
import { Channel } from './channel';
import {
    JoinChannelRequest,
    JoinedChannelEvent,
    LeaveChannelRequest,
    LeftChannelEvent,
    Message,
    SendMessageRequest,
    TextMessageEvent,
} from '@vichat/lib';
import { store } from '.';

const templateApp = document.createElement('template');
templateApp.innerHTML = `
<style>
</style>
<div class="app">
</div>`;

class App extends HTMLElement {
    #root: ShadowRoot;

    #app: HTMLElement | null = null;
    #loginForm: LoginForm | null = null;
    #channel: Channel | null = null;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        this.#root.appendChild(templateApp.content.cloneNode(true));

        this.#app = this.#root.querySelector('.app');

        store.mux.onMessage<JoinedChannelEvent>('joined-channel', this.#handleJoinedChannel);
        store.mux.onMessage<LeftChannelEvent>('left-channel', this.#handleLeftChannel);
        store.mux.onMessage<TextMessageEvent>('message', this.#handleMessageReceived);

        this.#loginForm = document.createElement('x-login-form') as LoginForm;
        this.#loginForm.addEventListener('submit', this.#joinChannel as EventListener);
        this.#app?.appendChild(this.#loginForm);
    }

    #joinChannel = (ev: CustomEvent<LoginData>): void => {
        store.send<JoinChannelRequest>('join-channel', {
            nickname: ev.detail.nickname,
        });
    };

    #sendMessage = (ev: CustomEvent<string>): void => {
        store.send<SendMessageRequest>('send-message', {
            text: ev.detail,
        });
    };

    #leaveChannel = (ev: CustomEvent): void => {
        store.send<LeaveChannelRequest>('leave-channel', {});
    };

    #handleJoinedChannel = (message: Message<JoinedChannelEvent>) => {
        if (!!this.#loginForm) {
            this.#app?.removeChild(this.#loginForm);
        }
        this.#loginForm = null;
        this.#channel = document.createElement('x-channel') as Channel;
        this.#channel.addEventListener('submit', this.#sendMessage as EventListener);
        this.#channel.addEventListener('leave', this.#leaveChannel as EventListener);
        this.#app?.appendChild(this.#channel);
        store.setLoggedIn(message.data.clientId, message.data.nickname, message.data.token);
    };

    #handleLeftChannel = (message: Message<LeftChannelEvent>) => {
        if (!!this.#channel) {
            this.#app?.removeChild(this.#channel);
        }
        this.#channel = null;
        this.#loginForm = document.createElement('x-login-form') as LoginForm;
        this.#loginForm.addEventListener('submit', this.#joinChannel as EventListener);
        this.#app?.appendChild(this.#loginForm);
        store.setLoggedOut();
    };

    #handleMessageReceived = (message: Message<TextMessageEvent>) => {
        if (!!this.#channel) {
            this.#channel.addMessage(message.data.clientId, message.data.nickname, message.data.text);
        }
    };
}

window.customElements.define('x-app', App);
