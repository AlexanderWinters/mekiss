import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';

// Create HTTP server
const server = createServer((req, res) => {
    res.writeHead(404);
    res.end();
});

// Create WebSocket server with more detailed options
const wss = new WebSocketServer({
    server: server,
    clientTracking: true,
    handleProtocols: () => {
        return 'echo-protocol';
    }
});

const clients = new Set();

wss.on('listening', () => {
    console.log('WebSocket server is running on port 8080');
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

wss.on('connection', (ws, request) => {
    const ip = request.socket.remoteAddress;
    console.log(`New client connected from ${ip}`);

    clients.add(ws);

    // Send immediate confirmation of connection
    try {
        ws.send(JSON.stringify({
            type: 'system',
            message: 'Connected to server',
            timestamp: new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }

    ws.on('message', (message) => {
        try {
            console.log('Received:', message.toString());
            const parsedMessage = JSON.parse(message.toString());

            // Broadcast to other clients
            clients.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('Client connection error:', error);
    });
});

// Start server
server.listen(8080, '0.0.0.0', () => {
    console.log('HTTP/WS Server is running on port 8080');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});