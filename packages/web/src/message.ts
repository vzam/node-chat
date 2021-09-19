const templateMessage = document.createElement('template');
templateMessage.innerHTML = `
<style>

</style>
<blockquote>
    <cite class="author"></cite>
    <p class="text"></p>
</blockquote>`;

export class TextMessage extends HTMLElement {
    #root: ShadowRoot;
    #author: HTMLElement | null = null;
    #text: HTMLElement | null = null;

    get userId(): number {
        const attr = this.getAttribute('userId');
        if (!attr) return 0;
        return +attr;
    }

    set userId(value: number) {
        this.setAttribute('userId', value.toString());
    }

    get text(): string {
        return this.getAttribute('text') ?? '';
    }

    set text(value: string) {
        this.setAttribute('text', value);
    }

    get nickname(): string {
        return this.getAttribute('nickname') ?? '';
    }

    set nickname(value: string) {
        this.setAttribute('nickname', value);
    }

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        this.#root.appendChild(templateMessage.content.cloneNode(true));
        this.#author = this.#root.querySelector('.author');
        this.#text = this.#root.querySelector('.text');

        if (!!this.#author) this.#author.textContent = this.nickname;
        if (!!this.#text) this.#text.textContent = this.text;
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (oldValue !== newValue) return;

        switch (name) {
            case 'text':
                if (!!this.#text) this.#text.textContent = newValue;
                break;
            case 'nickname':
                if (!!this.#author) this.#author.textContent = newValue;
                break;
        }
    }
}

window.customElements.define('x-message', TextMessage);
