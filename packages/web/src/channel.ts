import { TextMessage } from './message';

const templateChannel = document.createElement('template');
templateChannel.innerHTML = `
<style>
</style>
<div class="portal">
    <div class="messages">
    </div>
    <form class="message-form">
        <div class="field">
            <input type="text" name="message" class="message-field" />
            <label for="message">Message</label>
        </div>
        <button type="submit" class="message-submit">Send</button>
    </form>
    <button class="leave-btn">Leave Channel</button>
</div>`;

export class Channel extends HTMLElement {
    #root: ShadowRoot;

    #messages: HTMLElement | null = null;

    #messageForm: HTMLFormElement | null = null;
    #messageField: HTMLInputElement | null = null;
    #messageSubmitButton: HTMLButtonElement | null = null;

    #leaveButton: HTMLButtonElement | null = null;

    addMessage(userId: number, nickname: string, text: string): void {
        if (!this.#messages) return;

        const message = document.createElement('x-message') as TextMessage;
        message.userId = userId;
        message.text = text;
        message.nickname = nickname;

        this.#messages.appendChild(message);
    }

    get #message(): string {
        return this.#messageField?.value ?? '';
    }

    set #allowSubmit(value: boolean) {
        if (!!this.#messageSubmitButton) {
            this.#messageSubmitButton.disabled = !value;
        }
    }

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        this.#root.appendChild(templateChannel.content.cloneNode(true));

        this.#messages = this.#root.querySelector('.messages');

        this.#messageForm = this.#root.querySelector('.message-form');
        this.#messageField = this.#root.querySelector('.message-field');
        this.#messageSubmitButton = this.#root.querySelector('.message-submit');

        this.#leaveButton = this.#root.querySelector('.leave-btn');

        this.#allowSubmit = false;
        this.#messageField?.addEventListener('keyup', (e) => {
            this.#allowSubmit = Array.from(this.#formErrors()).length === 0;
        });
        this.#messageForm?.addEventListener('submit', (e) => {
            e.preventDefault();

            const errs = Array.from(this.#formErrors());
            if (errs.length > 0) {
                console.warn(errs);
                return;
            }

            const text = this.#message;
            this.dispatchEvent(new CustomEvent('submit', { detail: text }));
        });

        this.#leaveButton?.addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('leave'));
        });
    }

    *#formErrors(): Iterable<Error> {
        if ((this.#message?.length ?? 0) === 0) {
            yield new Error(`message must not be empty`);
        }
    }
}

window.customElements.define('x-channel', Channel);
