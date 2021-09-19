export type Observer<T = never> = (data: T) => unknown;

export interface Observable<T = never> {
    subscribe(observer: Observer<T>): void;
    unsubscribe(observer: Observer<T>): void;
}

export class Subject<T = never> implements Observable<T> {
    #observers: Observer<T>[] = [];

    public subscribe(observer: Observer<T>): void {
        this.#observers = [...this.#observers, observer];
    }

    public unsubscribe(observer: Observer<T>): void {
        const index = this.#observers.indexOf(observer);
        if (index === -1) return;
        this.#observers.splice(index, 1);
    }

    public fire(data: T): void {
        this.#observers.forEach((observer) => observer(data));
    }
}
