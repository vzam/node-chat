declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // the secret which is being used to encrypt jwt tokens
            JWT_SECRET?: string;
        }
    }
}

export {};
