import { useState, useEffect } from 'react'
import './App.css'

const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

function App() {
    const [notifications, setNotifications] = useState([]);
    const [wsInstance, setWsInstance] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            setNotifications(prev => [...prev, notification]);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        setWsInstance(ws);

        return () => {
            ws.close();
        };
    }, []);

    const sendRequest = (type) => {
        if (wsInstance?.readyState === WebSocketStates.OPEN) {
            wsInstance.send(JSON.stringify({
                type: type,
                timestamp: new Date().toISOString()
            }));
        } else {
            console.log('WebSocket is not connected. Current state:', wsInstance?.readyState);
        }

    };


    return (
        <div className="app">
            <h1>ME KISS</h1>

            <div className="button-container">
                <button onClick={() => sendRequest('attention')}>
                    Request Attention
                </button>
                <button onClick={() => sendRequest('presence')}>
                    Request Presence
                </button>
                <button onClick={() => sendRequest('time-together')}>
                    Request Time Together
                </button>
            </div>

            <div className="notifications">
                <h2>Notifications</h2>
                {notifications.map((notif, index) => (
                    <div key={index} className="notification">
                        {notif.type} requested at {new Date(notif.timestamp).toLocaleTimeString()}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App