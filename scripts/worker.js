#!/usr/bin/env node

/**
 * Build Worker Process
 * Run this separately from the Next.js app to process builds
 * Usage: node scripts/worker.js
 */

require('dotenv').config();

async function startWorker() {
  console.log('[Worker] Starting build worker...');
  
  try {
    // Import and start the worker
    const { buildQueue } = require('../src/workers/buildWorker.ts');
    
    console.log('[Worker] Build worker started and listening for jobs');
    console.log('[Worker] Press Ctrl+C to stop');
    
    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n[Worker] Shutting down gracefully...');
      await buildQueue.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[Worker] Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();
