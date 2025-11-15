export interface IElectronAPI {
  getAppData: () => Promise<{ ip: string; qrCodeDataUrl: string }>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
