
import io from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = 'http://localhost:5000';

async function registerUser(username, email) {
    try {
        const res = await axios.post(`${SERVER_URL}/api/users/register`, {
            username,
            email,
            password: 'password123',
            name: username
        });
        return res.data.n._id;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message === "User already exists") {
            // Login if exists or just try to find?
            // For simplicity, let's assume we use unique emails/usernames or handle this.
            console.log(`User ${username} might already exist.`);
            // Try login? Or just create unique one.
            return null;
        }
        console.error("Register failed:", err.message);
        return null;
    }
}

async function simulate() {
    const timestamp = Date.now();
    const user1Id = await registerUser(`user_${timestamp}_1`, `user_${timestamp}_1@example.com`);
    const user2Id = await registerUser(`user_${timestamp}_2`, `user_${timestamp}_2@example.com`);

    if (!user1Id || !user2Id) {
        console.log("Failed to create users.");
        return;
    }

    console.log(`User 1: ${user1Id}`);
    console.log(`User 2: ${user2Id}`);

    const socket1 = io(SERVER_URL, {
        query: { userId: user1Id }
    });

    const socket2 = io(SERVER_URL, {
        query: { userId: user2Id }
    });

    socket1.on('connect', () => {
        console.log('Socket 1 connected');
        socket1.emit('joinQueue', { userId: user1Id, mode: 'dsa', topic: 'arrays' });
    });

    socket2.on('connect', () => {
        console.log('Socket 2 connected');
        setTimeout(() => {
            socket2.emit('joinQueue', { userId: user2Id, mode: 'dsa', topic: 'arrays' });
        }, 2000);
    });

    socket1.on('battleStart', (data) => {
        console.log('Socket 1: Battle Started!', data);
    });

    socket2.on('battleStart', (data) => {
        console.log('Socket 2: Battle Started!', data);
    });
}

simulate();
