// src/server.ts
import "dotenv/config";
import "express-async-errors";
import app from "./app";
import { prisma } from "./config/database";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Test DB connection
    await prisma.$connect();
    logger.info("✅ Database connected");

    const server = app.listen(PORT, () => {
      logger.info(`🚀 DropOS API running on port ${PORT}`);
      logger.info(`   Environment: ${process.env.NODE_ENV}`);
      logger.info(`   Docs: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled rejection:", err);
    });

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught exception:", err);
      process.exit(1);
    });

  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
