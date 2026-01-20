import { Server, Socket } from "socket.io";
import { redis, CHAT_QUEUE_KEY } from "../utils/redis.js";

export const chatHandler = (io: Server, socket: Socket) => {
  socket.on("send_message", async (data) => {
    // Extract Data from Frontend
    // Expected: { roomId: "123", message: "Hello", userId: "u-1", userName: "Ashis" }
    const { roomId, message, userId, userName } = data;

    // Prepare the object (This is what goes into Redis)
    const chatPayload = {
      text: message, // <--- We use 'text' to match your DB schema
      roomId,
      userId,
      userName,
      createdAt: new Date().toISOString(),
    };

    try {
      // Optimistic Update: Send to everyone in the room IMMEDIATELY
      // We don't wait for the DB. We assume it will succeed.
      io.to(roomId).emit("receive_message", chatPayload);

      //Queue for Database: Push to Redis List
      await redis.rpush(CHAT_QUEUE_KEY, JSON.stringify(chatPayload));

<<<<<<< HEAD
      console.log(`📨 Queued message for Room ${roomId}`);
    } catch (error) {
      console.error("Redis Error:", error);
      socket.emit("error", { message: "Message failed to queue" });
    }
  });
};
=======
        // 4. Queue for Database: Push to Redis List
        await redis.rpush(CHAT_QUEUE_KEY, JSON.stringify(chatPayload));
        
        console.log(`📨 Queued message for Room ${roomId}`);
        
        } catch (error) {
        console.error("Redis Error:", error);
        socket.emit("error", { message: "Message failed to queue" });
        }
    })
};
>>>>>>> 06f03ad45dea5a3be480f0cd4ff3b97e7ee9debe
