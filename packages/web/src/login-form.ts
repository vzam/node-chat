import { Language } from '@vichat/lib';

const templateLoginForm = document.createElement('template');
templateLoginForm.innerHTML = `
<style>
.login-form {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 1em;
}

.login-form > * {
    margin-bottom: 0.5em;
}
</style>
<form class="login-form">
    <div class="field">
        <input type="text" name="nickname" class="nickname" />
        <label for="nickname">Nickname</label>

        <select name="languageCode" class="languageCode">
        </select>
        <label for="languageCode">Language</label>
        </div>
    <button type="submit" class="submit">Ok</button>
</form>`;

export type LoginData = {
    nickname: string;
    languageCode: string;
};

export class LoginForm extends HTMLElement {
    public constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
    }

    #root: ShadowRoot;

    #form: HTMLFormElement | null = null;
    #nickname: HTMLInputElement | null = null;
    #languageCode: HTMLSelectElement | null = null;
    #submit: HTMLButtonElement | null = null;

    get nickname(): string {
        return this.#nickname?.value ?? '';
    }

    get languageCode(): string | undefined {
        const index = this.#languageCode?.selectedIndex;
        if (index === undefined || index === -1) return undefined;

        return (this.#languageCode!.children[index] as HTMLOptionElement).value;
    }

    get allowSubmit(): boolean {
        return !this.#submit?.disabled;
    }

    set allowSubmit(value: boolean) {
        if (!!this.#submit) {
            this.#submit.disabled = !value;
        }
    }

    set languages(langs: Language[]) {
        if (!this.#languageCode) return;

        const options = langs.map((lang) => {
            const el = document.createElement('option');
            el.setAttribute('value', lang.code);
            el.textContent = lang.name;
            return el;
        });
        this.#languageCode.replaceChildren(...options);
    }

    connectedCallback(): void {
        this.#root.appendChild(templateLoginForm.content.cloneNode(true));
        this.#form = this.#root.querySelector('.login-form');
        this.#nickname = this.#root.querySelector('.nickname');
        this.#languageCode = this.#root.querySelector('.languageCode');
        this.#submit = this.#root.querySelector('.submit');

        this.#nickname?.addEventListener('keyup', (e) => {
            this.allowSubmit = Array.from(this.#formErrors()).length === 0;
        });
        this.#languageCode?.addEventListener('change', (e) => {
            this.allowSubmit = Array.from(this.#formErrors()).length === 0;
        });
        this.#form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const err = Array.from(this.#formErrors());
            if (err.length > 0) {
                console.warn(err);
                return;
            }

            const loginData: LoginData = { nickname: this.nickname, languageCode: this.languageCode! };
            this.dispatchEvent(new CustomEvent('submit', { detail: loginData }));
        });

        this.allowSubmit = Array.from(this.#formErrors()).length === 0;
    }

    *#formErrors(): Iterable<Error> {
        if ((this.nickname.length ?? 0) === 0) {
            yield new Error(`nickname must not be empty`);
        }
        if (this.languageCode === undefined) {
            yield new Error(`language code must be selected`);
        }
    }
}

window.customElements.define('x-login-form', LoginForm);
