interface HandshakeMessage {
    type: '__handshake';
    nonce: number;
}
const isHandshakeMessage = (message: unknown): message is HandshakeMessage => {
    return typeof message === 'object'
        && message != null &&
        'type' in message &&
        message.type === '__handshake' &&
        'nonce' in message;
}

interface HandshakeAckMessage {
    type: '__handshakeAck';
    nonce: number;
}
const isHandshakeAckMessage = (message: unknown): message is HandshakeAckMessage => {
    return typeof message === 'object'
        && message != null &&
        'type' in message &&
        message.type === '__handshakeAck' &&
        'nonce' in message;
}

export class ExtensionConnection {
    #isConnected: boolean = false;
    #port: chrome.runtime.Port | null = null;

    constructor() {
        chrome.runtime.onConnect.addListener(this.#onRuntimeConnect);
        this.connect();
        window.addEventListener('beforeunload', this.#onWindowBeforeUnload);
    }

    get isConnected(): boolean {
        return this.#isConnected;
    }

    get port(): chrome.runtime.Port | null {
        return this.#port;
    }

    async connect(): Promise<void> {
        const port = chrome.devtools
            ? chrome.tabs.connect(chrome.devtools.inspectedWindow.tabId)
            : chrome.runtime.connect();
        const success = await this.#registerPort(port, true);
        if (success) {
            console.log(`[connect] Connected`);
        } else {
            console.log(`[connect] Failed to connect`);
        }
    }

    sendMessage(message: unknown) {
        if (!this.#port || !this.#isConnected) {
            throw new Error('Failed to send message, not connected!');
        }
        this.#port.postMessage(message);
    }

    #handshake = (port: chrome.runtime.Port): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            console.log(`[#handshake] Handshake`);

            const nonce = Math.random();

            const listenForAck = (message: unknown) => {
                if (isHandshakeAckMessage(message) && message.nonce === nonce) {
                    console.log(`[#handshake] Handshake success (ACK received)`);
                    port.onDisconnect.removeListener(listenForDisconnect);
                    port.onMessage.removeListener(listenForAck);
                    resolve(true);
                }
            }
            const listenForDisconnect = () => {
                console.log(`[#handshake] Handshake failed`);
                port.onDisconnect.removeListener(listenForDisconnect);
                port.onMessage.removeListener(listenForAck);
                resolve(false);
            }

            port.onMessage.addListener(listenForAck);
            port.onDisconnect.addListener(listenForDisconnect);

            const handshake: HandshakeMessage = {
                type: '__handshake',
                nonce
            }
            port.postMessage(handshake);
        });
    }

    #onPortDisconnect = () => {
        console.log('[#onPortDisconnect] Disconnected', { lastError: chrome.runtime.lastError });
        if (this.#port) {
            this.#unregisterPort(this.#port);
        }
    }

    #onPortMessage = (message: unknown) => {
        console.log('[#onPortMessage] Message:', { message });
        if (isHandshakeMessage(message)) {
            const handshakeAck: HandshakeAckMessage = {
                type: '__handshakeAck',
                nonce: message.nonce
            }
            this.#port?.postMessage(handshakeAck);
            return;
        }
        // TODO: Emit event
    }

    #onRuntimeConnect = (port: chrome.runtime.Port) => {
        if (chrome.devtools && chrome.devtools.inspectedWindow.tabId !== port.sender?.tab?.id) {
            console.log('[#onRuntimeConnect] Ignoring port connection, it is not from the inspected tab.');
            return;
        }
        console.log('[#onRuntimeConnect] Connected', port);
        this.#registerPort(port);
    }

    #onWindowBeforeUnload = () => {
        if (this.#port) {
            // Manually disconnecting the port to get around an edge-case where the content script is connected
            // to two different DevTools panels - if the DevTools panel that belongs to the tab is closed,
            // the other DevTools panel could keep the Port object open, even though it's ignoring it.
            this.#port.disconnect();
        }
    }

    #registerPort = async (port: chrome.runtime.Port, requiresHandshake: boolean = false): Promise<boolean> => {
        if (this.#port) {
            console.warn('[#registerPort] Closing active port, this might be sign of a bug where multiple communication channels are opened at the same time!');
            this.#port.disconnect();
        }

        port.onMessage.addListener(this.#onPortMessage);
        port.onDisconnect.addListener(this.#onPortDisconnect);
        const success = !requiresHandshake || await this.#handshake(port);
        if (success) {
            this.#isConnected = true;
            this.#port = port;
        }
        return success;
    }

    #unregisterPort = (port: chrome.runtime.Port) => {
        this.#isConnected = false;
        port.onMessage.removeListener(this.#onPortMessage);
        port.onDisconnect.removeListener(this.#onPortDisconnect);
        this.#port = null;
    }
}