import app from './app.js';
import config from './config/index.js';
import prisma from './lib/prisma.js';

const PORT = config.port;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
        await prisma.$disconnect();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎓 ScholarHub API Server                               ║
║                                                          ║
║   Environment: ${config.env.padEnd(40)}║
║   Port: ${PORT.toString().padEnd(47)}║
║   URL: http://localhost:${PORT.toString().padEnd(32)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);

            console.log('📚 API Endpoints:');
            console.log('   GET  /api/health              - Health check');
            console.log('   POST /api/auth/register       - Register');
            console.log('   POST /api/auth/login          - Login');
            console.log('   GET  /api/scholarships        - List scholarships');
            console.log('   GET  /api/categories          - List categories');
            console.log('   ... and more!\n');
        });

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();
