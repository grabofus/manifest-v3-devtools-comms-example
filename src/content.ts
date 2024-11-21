import { ExtensionConnection } from "./utils/ExtensionConnection";
import { mountDebugUI } from "./utils/mountDebugUI";

const { addMessageEntry, setConnectedState, setSendMessageCallback } = mountDebugUI();

const connection = new ExtensionConnection();

// Mounting to window for debugging
(self as any).connection = connection;

connection.addListener('isconnectedchanged', ({ isConnected }) => setConnectedState(isConnected));
connection.addListener('message', ({ message }) => addMessageEntry(`Message received: ${JSON.stringify(message)}`));

setSendMessageCallback((message) => {
    connection.sendMessage(message);
});
