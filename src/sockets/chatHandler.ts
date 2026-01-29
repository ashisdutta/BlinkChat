import { Server, Socket } from "socket.io";
import { redis, CHAT_QUEUE_KEY, CACHE_TTL } from "../utils/redis.js";
import { type AuthSocket } from "../middleware/socketAuth.middleware.js";

export const chatHandler = (io: Server, socket: Socket) => {
  // Cast socket to our custom type so TypeScript knows about .data.user
  const authSocket = socket as AuthSocket;

  authSocket.on("send_message", async (data) => {
    //  REMOVE userId/userName from the incoming data
    const { roomId, message } = data;

    //  GET USER FROM SECURE SOCKET DATA
    // The middleware ensures this exists
    const currentUser = authSocket.data.user!;

    const userId = currentUser.userId;
    const userName = currentUser.userName;

    // 3. Generate Timestamp
    const timestamp = Date.now();

    const chatPayload = {
      text: message,
      roomId,
      userId, // Securely obtained
      userName, // Securely obtained
      createdAt: new Date(timestamp).toISOString(),
    };

    const payloadString = JSON.stringify(chatPayload);
    const roomCacheKey = `chat:room:${roomId}`;

    try {
      // Optimistic Update
      io.to(roomId).emit("receive_message", chatPayload);

      // Redis Pipeline
      const pipeline = redis.pipeline();
      pipeline.zadd(roomCacheKey, timestamp, payloadString);
      pipeline.expire(roomCacheKey, CACHE_TTL);
      pipeline.rpush(CHAT_QUEUE_KEY, payloadString);

      await pipeline.exec();

      console.log(`📨 Message sent in ${roomId} by ${userName}`);
    } catch (error) {
      console.error("Redis Error:", error);
      socket.emit("error", { message: "Message failed to process" });
    }
  });
};
