import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the global object in development to prevent
// exhausting database connection limit

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  lastCleanupTime?: number;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Add middleware for opportunistic cleanup of expired pastes
if (!globalForPrisma.prisma) {
  globalForPrisma.lastCleanupTime = Date.now();
  const CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour
  
  type MiddlewareParams = {
    action: string;
    model: string;
    args: Record<string, unknown>;
    dataPath: string[];
    runInTransaction: boolean;
  };
  
  prisma.$use(async (params: MiddlewareParams, next: (params: MiddlewareParams) => Promise<unknown>) => {
    // Run cleanup occasionally on read operations to minimize impact
    if (
      (params.action === 'findUnique' || params.action === 'findMany') && 
      params.model === 'Paste' &&
      Date.now() - (globalForPrisma.lastCleanupTime || 0) > CLEANUP_INTERVAL &&
      Math.random() < 0.2 // 20% chance when the interval has passed
    ) {
      globalForPrisma.lastCleanupTime = Date.now();
      
      // Perform cleanup in the background
      prisma.paste.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        },
        take: 1000
      }).then((result: { count: number }) => {
        if (result.count > 0) {
          console.log(`Background cleanup: Deleted ${result.count} expired pastes`);
        }
      }).catch((err: unknown) => console.error('Error cleaning up expired pastes:', err));
    }
    
    return next(params);
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
