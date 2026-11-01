export type AppDialogButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AppDialogButton {
  text: string;
  style?: AppDialogButtonStyle;
  onPress?: () => void;
}

export interface AppDialogOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

export interface AppDialogRequest {
  id: number;
  title: string;
  message?: string;
  buttons: AppDialogButton[];
  options: AppDialogOptions;
}

type Listener = (request: AppDialogRequest | null) => void;

let current: AppDialogRequest | null = null;
let nextId = 1;
const queue: AppDialogRequest[] = [];
const listeners = new Set<Listener>();

function publish() {
  listeners.forEach((listener) => listener(current));
}

function showNext() {
  current = queue.shift() ?? null;
  publish();
}

export const appDialog = {
  alert(
    title: string,
    message?: string,
    buttons: AppDialogButton[] = [],
    options: AppDialogOptions = {}
  ) {
    const request: AppDialogRequest = {
      id: nextId++,
      title,
      message,
      buttons,
      options,
    };
    if (current) queue.push(request);
    else {
      current = request;
      publish();
    }
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(current);
    return () => {
      listeners.delete(listener);
    };
  },
  dismiss(id: number, button?: AppDialogButton) {
    if (current?.id !== id) return;
    const dismissed = current;
    current = null;
    publish();
    queueMicrotask(() => {
      showNext();
      button?.onPress?.();
      if (!button) dismissed.options.onDismiss?.();
    });
  },
};
