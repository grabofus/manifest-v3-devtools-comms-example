import { ExtensionConnection } from "./utils/ExtensionConnection";

const sendButton = document.getElementById('send');
const input = document.getElementById('input');

const connection = new ExtensionConnection();
(self as any).connection = connection;


if (sendButton && input) {
    sendButton.addEventListener("click", () => {
        const message = { data: input.value };
        console.log("Sending message to Content:", { message });
        connection.sendMessage(message);
    });
}
