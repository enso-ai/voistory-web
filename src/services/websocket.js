export default class WebSocketClient {
    constructor(url) {
        this.messages = [];
        this.ws = null;
        this.url = url;
    }

    connect({ streamSid, recvHandler, onOpen, onClose}) {
        // Create WebSocket connection.
        this.ws = new WebSocket(this.url);

        // Connection opened
        this.ws.addEventListener('open', (event) => {
            console.log('Connected to WS Server, sending dummy payload to set streamSid');

            const dummyPayload = {
                'event': 'media',
                'streamSid': streamSid,
                'media': { 'payload': '' }
            }
            this.ws.send(JSON.stringify(dummyPayload));

            onOpen();
        });

        this.ws.addEventListener('message', (event) => {
            let jsonData = JSON.parse(event.data);
            recvHandler(jsonData);
        });

        this.ws.addEventListener('close', (event) => {
            console.log('Disconnected from WS Server');
            this.ws.close();
            onClose();
        });
    }

    send(payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
