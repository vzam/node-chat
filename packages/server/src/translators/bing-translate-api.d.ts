declare module 'bing-translate-api' {
    function translate(
        text: string,
        from: string = 'auto-detect',
        to: string = 'en',
        correct: boolean = false,
        raw: boolean = false,
        userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    ): Promise<{
        text: string;
        userLang: string;
        translation: string;
        language: string;
        from: string;
        to: string;
        score: number;
    }>;
    const lang: {
        LANGS: {
            [key: string]: string;
        };

        getLangCode(lang: string);
        isSupported(lang: string);
        canCorrect(lang: string);
    };
}
