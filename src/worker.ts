import { redis, CHAT_QUEUE_KEY } from "./utils/redis.js";
import prisma from "./utils/prisma.js";

const BATCH_SIZE = 50;
const MAX_WAIT_TIME = 5000; // 5 Seconds in milliseconds

async function startWorker() {
    console.log("-----------------------------------------");
    console.log("👷 Worker Service Started");
    console.log("-----------------------------------------");

    let lastFlushTime = Date.now();

    while (true) {
        try {
            const queueLength = await redis.llen(CHAT_QUEUE_KEY);
            const timeSinceLastFlush = Date.now() - lastFlushTime;

            // 🟢 LOGIC CHANGE:
            // Process if Queue is full OR if we have waited too long (and there is data)
            const isBatchFull = queueLength >= BATCH_SIZE;
            const isTimeout = queueLength > 0 && timeSinceLastFlush > MAX_WAIT_TIME;

            if (isBatchFull || isTimeout) {
                
                // Determine how many to fetch (up to 50)
                const fetchCount = Math.min(queueLength, BATCH_SIZE);
                
                console.log(`📦 Processing ${fetchCount} messages... (Trigger: ${isBatchFull ? 'Batch Full' : 'Timeout'})`);

                const rawMessages = await redis.lpop(CHAT_QUEUE_KEY, BATCH_SIZE);

                if (rawMessages && rawMessages.length > 0) {
                    const dataToInsert = rawMessages.map((msg) => {
                        const parsed = JSON.parse(msg);
                        return {
                            text: parsed.text,
                            roomId: parsed.roomId,
                            userId: parsed.userId
                        };
                    });

                    await prisma.chat.createMany({
                        data: dataToInsert
                    });

                    console.log(`✅ Saved ${dataToInsert.length} messages to DB.`);
                    
                    // Reset the timer only after a successful save
                    lastFlushTime = Date.now();
                }
            } else {
                // If queue is empty or not ready to flush yet, sleep briefly
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error("❌ Worker Error:", error);
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}

startWorker();