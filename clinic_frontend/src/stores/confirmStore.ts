import { create } from 'zustand';

export type ConfirmVariant = 'danger' | 'warning' | 'success' | 'primary';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolver: ((value: boolean) => void) | null;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
}

const DEFAULT_OPTIONS: ConfirmOptions = {
  title: 'Konfirmasi Aksi',
  description: 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText: 'Lanjutkan',
  cancelText: 'Batal',
  variant: 'primary',
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: DEFAULT_OPTIONS,
  resolver: null,

  openConfirm: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: {
          ...DEFAULT_OPTIONS,
          ...options,
        },
        resolver: resolve,
      });
    });
  },

  closeConfirm: (result: boolean) => {
    const { resolver } = get();
    if (resolver) {
      resolver(result);
    }
    set({
      isOpen: false,
      options: DEFAULT_OPTIONS,
      resolver: null,
    });
  },
}));

/**
 * Helper pemanggil konfirmasi berbasis Promise.
 * Menggantikan window.confirm() bawaan browser dengan modal elegan.
 */
export const confirmDialog = (options: ConfirmOptions): Promise<boolean> => {
  return useConfirmStore.getState().openConfirm(options);
};
