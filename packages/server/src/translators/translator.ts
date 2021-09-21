import { Language } from '@vichat/lib';

export interface Translator {
    getSupportedLanguages(): Promise<Language[]>;
    translate(text: string, from: string, to: string): Promise<string>;
}
