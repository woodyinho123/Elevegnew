
//handling the WebSocket connection and forwarding the packets to the firmware over the serial port

const WebSocket = require('ws');
const SerialPort = require('serialport');

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Open the serial port (adjust port to your device's port name)
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

port.on('open', () => {
    console.log('Serial port open');
});

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Handle incoming messages from frontend (React app)
    ws.on('message', (message) => {
        try {
            const packet = new Uint8Array(message);
            console.log('Received packet:', packet);

            // Parse the packet (same logic as before)
            parsePacket(packet);

            // Send the packet to the firmware via serial port
            port.write(packet, (err) => {
                if (err) {
                    console.error('Error writing to serial port:', err);
                } else {
                    console.log('Packet sent to firmware over serial');
                }
            });
        } catch (err) {
            console.error('Error processing the message:', err);
        }
    });

    // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Function to parse the packet (same logic as before)
function parsePacket(packet) {
    if (packet[0] !== 0xAA || packet[packet.length - 1] !== 0xFF) {
        console.error("Invalid packet received");
        return;
    }

    const commandId = packet[1];
    const payload = packet.slice(2, packet.length - 2);
    const checksum = packet[packet.length - 2];

    if (checksum !== calculateChecksum(commandId, payload)) {
        console.error("Checksum mismatch");
        return;
    }

    executeCommand(commandId, payload);
}

// Checksum calculation
function calculateChecksum(commandId, payload) {
    return (payload.reduce((sum, byte) => sum + byte, commandId) & 0xFF);
}

// Command execution logic (example)
function executeCommand(commandId, payload) {
    switch (commandId) {
        case 0x01:
            console.log(`Turning on with intensity ${payload[0]}`);
            break;
        case 0x02:
            console.log("Turning off");
            break;
        default:
            console.log(`Unknown command: ${commandId}`);
    }
}
