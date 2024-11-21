export function mountDebugUI() {
    let sendMessageFn: ((message: unknown) => void) | null = null;

    const messageInput = document.createElement('input');
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    })

    const sendButton = document.createElement('button');
    sendButton.innerText = 'Send Message';
    sendButton.addEventListener('click', () => {
        sendMessageFn?.({ message: messageInput.value });
        messageInput.value = '';
        messageInput.focus();
    })

    const connectedState = document.createElement('input');
    connectedState.id = 'connectedState';
    connectedState.type = 'checkbox';

    const labelForConnectedState = document.createElement('label');
    labelForConnectedState.htmlFor = connectedState.id;
    labelForConnectedState.innerText = 'Connected';

    const messageTable = document.createElement('table');
    messageTable.style.borderCollapse = 'collapse';
    messageTable.style.border = '1px solid';
    messageTable.style.marginTop = '16px';

    document.body.appendChild(messageInput);
    document.body.appendChild(sendButton);
    document.body.appendChild(connectedState);
    document.body.appendChild(labelForConnectedState);
    document.body.appendChild(messageTable);

    const addMessageEntry = (messageEntry: string, backgroundColor?: string) => {
        const row = document.createElement('tr');
        const dateColumn = document.createElement('td');
        const textColumn = document.createElement('td');

        if (backgroundColor) {
            row.style.backgroundColor = backgroundColor;
        }

        dateColumn.innerText = new Date().toLocaleTimeString();
        dateColumn.style.border = '1px solid';
        dateColumn.style.width = '200px';
        textColumn.innerText = messageEntry;
        textColumn.style.border = '1px solid';
        textColumn.style.width = '500px';

        row.appendChild(dateColumn);
        row.appendChild(textColumn);
        messageTable.prepend(row);
    };

    const setConnectedState = (isConnected: boolean) => {
        connectedState.checked = isConnected;
        addMessageEntry(isConnected ? 'Connected' : 'Disconnected', isConnected ? '#539b51' : '#ff6767');
    };

    const setSendMessageCallback = (sendMessage: (message: unknown) => void) => {
        sendMessageFn = sendMessage;
    }

    return {
        addMessageEntry,
        setConnectedState,
        setSendMessageCallback
    }
} 