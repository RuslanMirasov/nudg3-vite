interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LOGO_DEV_TOKEN?: string;
  readonly VITE_BRANDFETCH_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
