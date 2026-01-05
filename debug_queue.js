import { createClient } from 'redis';

async function checkQueue() {
    const client = createClient({
        url: "redis://localhost:6379"
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    const keys = await client.keys('*');
    console.log('All keys:', keys);

    for (const key of keys) {
        if (key.includes(':') && !key.startsWith("leaderboard")) { // Simple heuristic for queue keys like "cp:arrays"
            const type = await client.type(key);
            if (type === 'list') {
                const items = await client.lRange(key, 0, -1);
                console.log(`Queue ${key}:`, items);
            }
        }
    }

    await client.disconnect();
}

checkQueue();
