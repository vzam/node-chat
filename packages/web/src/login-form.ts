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
    </div>
    <button type="submit" class="submit">Ok</button>
</form>`;

export type LoginData = {
    nickname: string;
};

export class LoginForm extends HTMLElement {
    public constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
    }

    #root: ShadowRoot;

    #form: HTMLFormElement | null = null;
    #nickname: HTMLInputElement | null = null;
    #submit: HTMLButtonElement | null = null;

    get nickname(): string {
        return this.#nickname?.value ?? '';
    }

    get allowSubmit(): boolean {
        return !this.#submit?.disabled;
    }

    set allowSubmit(value: boolean) {
        if (!!this.#submit) {
            this.#submit.disabled = !value;
        }
    }

    connectedCallback(): void {
        this.#root.appendChild(templateLoginForm.content.cloneNode(true));
        this.#form = this.#root.querySelector('.login-form');
        this.#nickname = this.#root.querySelector('.nickname');
        this.#submit = this.#root.querySelector('.submit');

        this.#nickname?.addEventListener('keyup', (e) => {
            this.allowSubmit = Array.from(this.#formErrors()).length === 0;
        });
        this.#form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const err = Array.from(this.#formErrors());
            if (err.length > 0) {
                console.warn(err);
                return;
            }

            const loginData: LoginData = { nickname: this.nickname };
            this.dispatchEvent(new CustomEvent('submit', { detail: loginData }));
        });

        this.allowSubmit = Array.from(this.#formErrors()).length === 0;
    }

    *#formErrors(): Iterable<Error> {
        if ((this.nickname.length ?? 0) === 0) {
            yield new Error(`nickname must not be empty`);
        }
    }
}

window.customElements.define('x-login-form', LoginForm);
