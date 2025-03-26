import { RATE_LIMIT } from '../constants';

interface RequestRecord {
  timestamps: number[];
  blocked: boolean;
  blockedUntil?: number;
}

interface PasteCreationRecord {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}

export class RateLimitService {
  private static instance: RateLimitService;
  private requestRecords = new Map<string, RequestRecord>();
  private pasteCreationRecords = new Map<string, PasteCreationRecord>();
  private cleanupInterval = 5 * 60 * 1000;

  private constructor() {
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  public static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }
  public checkRequestLimit(ip: string): {
    limited: boolean;
    headers: Record<string, string>;
    resetTime?: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    let record = this.requestRecords.get(ip);
    if (!record) {
      record = { timestamps: [], blocked: false };
      this.requestRecords.set(ip, record);
    }

    if (record.blocked && record.blockedUntil) {
      if (now >= record.blockedUntil) {
        record.blocked = false;
        record.blockedUntil = undefined;
        record.timestamps = [];
      } else {
        return {
          limited: true,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS_PER_MINUTE.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(record.blockedUntil / 1000).toString(),
            'Retry-After': Math.ceil((record.blockedUntil - now) / 1000).toString(),
          },
          resetTime: record.blockedUntil,
        };
      }
    }

    record.timestamps = record.timestamps.filter(timestamp => timestamp > oneMinuteAgo);

    const requestCount = record.timestamps.length;
    const remaining = Math.max(0, RATE_LIMIT.MAX_REQUESTS_PER_MINUTE - requestCount);

    if (requestCount >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
      const blockUntil = now + 60 * 1000;
      record.blocked = true;
      record.blockedUntil = blockUntil;

      return {
        limited: true,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS_PER_MINUTE.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(blockUntil / 1000).toString(),
          'Retry-After': '60',
        },
        resetTime: blockUntil,
      };
    }

    record.timestamps.push(now);

    return {
      limited: false,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS_PER_MINUTE.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil((now + 60 * 1000) / 1000).toString(),
      },
    };
  }

  public checkPasteCreationLimit(ip: string): {
    limited: boolean;
    headers: Record<string, string>;
    resetTime?: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    let record = this.pasteCreationRecords.get(ip);
    if (!record) {
      record = { count: 0, windowStart: now, blocked: false };
      this.pasteCreationRecords.set(ip, record);
    }

    if (record.blocked && record.blockedUntil) {
      if (now >= record.blockedUntil) {
        record.blocked = false;
        record.blockedUntil = undefined;
        record.count = 0;
        record.windowStart = now;
      } else {
        return {
          limited: true,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.MAX_PASTES_PER_HOUR.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(record.blockedUntil / 1000).toString(),
            'Retry-After': Math.ceil((record.blockedUntil - now) / 1000).toString(),
          },
          resetTime: record.blockedUntil,
        };
      }
    }

    if (record.windowStart < oneHourAgo) {
      record.count = 0;
      record.windowStart = now;
    }

    const remaining = Math.max(0, RATE_LIMIT.MAX_PASTES_PER_HOUR - record.count);

    if (record.count >= RATE_LIMIT.MAX_PASTES_PER_HOUR) {
      const blockUntil = record.windowStart + 60 * 60 * 1000;
      record.blocked = true;
      record.blockedUntil = blockUntil;

      return {
        limited: true,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.MAX_PASTES_PER_HOUR.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(blockUntil / 1000).toString(),
          'Retry-After': Math.ceil((blockUntil - now) / 1000).toString(),
        },
        resetTime: blockUntil,
      };
    }

    record.count++;

    return {
      limited: false,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.MAX_PASTES_PER_HOUR.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil((record.windowStart + 60 * 60 * 1000) / 1000).toString(),
      },
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [ip, record] of this.requestRecords.entries()) {
      if (record.blocked && record.blockedUntil && now >= record.blockedUntil) {
        record.blocked = false;
        record.blockedUntil = undefined;
        record.timestamps = [];
      }

      record.timestamps = record.timestamps.filter(timestamp => timestamp > now - 60 * 1000);

      if (record.timestamps.length === 0 && !record.blocked) {
        this.requestRecords.delete(ip);
      }
    }

    for (const [ip, record] of this.pasteCreationRecords.entries()) {
      if (record.blocked && record.blockedUntil && now >= record.blockedUntil) {
        record.blocked = false;
        record.blockedUntil = undefined;
        record.count = 0;
        record.windowStart = now;
      }

      if (record.windowStart < oneHourAgo && record.count === 0) {
        this.pasteCreationRecords.delete(ip);
      }
    }
  }
}

// Export singleton instance
export const rateLimitService = RateLimitService.getInstance();
