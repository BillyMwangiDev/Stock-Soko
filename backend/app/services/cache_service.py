import json
from typing import Any, Optional

from ..config import REDIS_URL
from ..constants import DEFAULT_CACHE_TTL
from ..exceptions import (
    CacheConnectionException,
    CacheException,
    CacheSerializationException,
)
from ..utils.logging import get_logger

logger = get_logger("cache_service")

try:
    import redis

    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not installed, using in-memory cache fallback")


class CacheService:
    def __init__(self):
        self.redis_client = None
        self.use_redis = False
        self.memory_cache = {}

        if REDIS_AVAILABLE and REDIS_URL:
            try:
                self.redis_client = redis.from_url(
                    REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_keepalive=True,
                    health_check_interval=30,
                )
                # Test connection without blocking
                self.redis_client.ping()
                self.use_redis = True
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(
                    f"Redis connection failed, using in-memory fallback: {e}"
                )
                self.use_redis = False
                self.redis_client = None
        else:
            logger.info("Using in-memory cache (Redis not configured)")

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache by key"""
        if self.use_redis and self.redis_client:
            try:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value)
            except json.JSONDecodeError as e:
                logger.error(f"Cache deserialization error for key '{key}': {e}")
                # Don't raise - just return None and continue
                return None
            except redis.RedisError as e:
                logger.warning(
                    f"Redis get error for key '{key}': {e}, falling back to memory"
                )
                # Switch to memory cache on Redis failure
                self.use_redis = False
                return None
            except Exception as e:
                logger.error(f"Unexpected cache get error for key '{key}': {e}")
                return None
        return self.memory_cache.get(key)

    def set(self, key: str, value: Any, ttl: int = DEFAULT_CACHE_TTL):
        """Set value in cache with TTL (in seconds)"""
        if self.use_redis and self.redis_client:
            try:
                serialized = json.dumps(value)
                self.redis_client.setex(key, ttl, serialized)
            except (TypeError, ValueError) as e:
                logger.error(f"Cache serialization error for key '{key}': {e}")
                # Fall back to memory cache
                self.memory_cache[key] = value
            except redis.RedisError as e:
                logger.warning(
                    f"Redis set error for key '{key}': {e}, using memory cache"
                )
                # Switch to memory cache on Redis failure
                self.use_redis = False
                self.memory_cache[key] = value
            except Exception as e:
                logger.error(f"Unexpected cache set error for key '{key}': {e}")
                self.memory_cache[key] = value
        else:
            self.memory_cache[key] = value

    def delete(self, key: str):
        """Delete value from cache"""
        if self.use_redis and self.redis_client:
            try:
                self.redis_client.delete(key)
            except redis.RedisError as e:
                logger.warning(f"Redis delete error for key '{key}': {e}")
                self.use_redis = False
            except Exception as e:
                logger.error(f"Unexpected cache delete error for key '{key}': {e}")
        # Also delete from memory cache
        self.memory_cache.pop(key, None)

    def clear(self):
        """Clear all cache entries"""
        if self.use_redis:
            try:
                self.redis_client.flushdb()
                logger.info("Redis cache cleared")
            except redis.RedisError as e:
                logger.error(f"Redis clear error: {e}")
                raise CacheException("Failed to clear Redis cache")
            except Exception as e:
                logger.error(f"Unexpected cache clear error: {e}")
                raise CacheException("Failed to clear cache")
        else:
            self.memory_cache.clear()
            logger.info("Memory cache cleared")

    def get_stats(self):
        if self.use_redis:
            try:
                info = self.redis_client.info()
                return {
                    "type": "redis",
                    "connected": True,
                    "keys": self.redis_client.dbsize(),
                    "memory_used": info.get("used_memory_human"),
                    "hits": info.get("keyspace_hits", 0),
                    "misses": info.get("keyspace_misses", 0),
                }
            except Exception as e:
                return {"type": "redis", "connected": False, "error": str(e)}
        else:
            return {
                "type": "memory",
                "keys": len(self.memory_cache),
                "memory_used": "N/A",
            }


cache_service = CacheService()
