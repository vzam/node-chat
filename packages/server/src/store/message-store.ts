type TransformFunc = (text: string) => string;

export class MessageStore {
    #transforms: TransformFunc[] = [];

    addTransform(transformFunc: TransformFunc): void {
        this.#transforms.push(transformFunc);
    }

    applyTransforms(text: string): string {
        return this.#transforms.reduce((previous, transform) => transform(previous), text);
    }
}
