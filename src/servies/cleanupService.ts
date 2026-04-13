import prisma from "../utils/prisma.js";

const MESSAGE_TTL_MS = 2 * 60 * 60 * 1000; // 2 Hours
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // Run every 10 Minutes

export const startCleanupService = () => {
  console.log(
    "⏳ Cleanup Service Started: Auto-deleting messages > 2 hours old."
  );

  // Run immediately on startup
  runCleanup();

  // Schedule the loop
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);
};

const runCleanup = async () => {
  try {
    const cutoffDate = new Date(Date.now() - MESSAGE_TTL_MS);

    // Prisma batch delete
    const deleted = await prisma.chat.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate, // 'lt' = Older than cutoff
        },
      },
    });

    if (deleted.count > 0) {
      console.log(`🧹 Cleanup: Deleted ${deleted.count} expired messages.`);
    }
  } catch (error) {
    console.error("❌ Cleanup Service Failed:", error);
  }
};
