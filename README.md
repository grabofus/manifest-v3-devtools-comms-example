# Manifest V3 - DevTools communication

Show-case a simple Content Script - DevTools Panel communication without the use of background scripts.

## How to use

```js
// devtools.js and content.js
const connection = new ExtensionConnection();

// when both the content and devtools page has the connection instantiated, the connection will open
console.log('Connected?', connection.isConnected);
connection.addListener('isconnectedchanged', ({ isConnected }) => { /* ... */ });

// send a message from either side
connection.sendMessage({ whatever: 'data' });

// listen to messages from either side
connection.addListener('message', (message) => {
    console.log('Message received!', message.whatever);
});
```

## How to run

- `npm install` dependencies
- Build the extension with `npm run build`
- Load the `/dist` folder as an unpacked extension in `chrome://extensions`
- Open the `index.html` with `npx http-server` 