from celery import Celery
from celery.schedules import crontab

from ..config import REDIS_URL

celery_app = Celery(
    "stocksoko",
    broker=REDIS_URL or "redis://localhost:6379/0",
    backend=REDIS_URL or "redis://localhost:6379/0",
    include=[
        "app.tasks.market_data_tasks",
        "app.tasks.alert_tasks",
        "app.tasks.order_monitoring_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Nairobi",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

celery_app.conf.beat_schedule = {
    "fetch-and-cache-prices": {
        "task": "app.tasks.market_data_tasks.fetch_and_cache_prices",
        "schedule": 30.0,
    },
    "update-market-movers": {
        "task": "app.tasks.market_data_tasks.update_market_movers",
        "schedule": 60.0,
    },
    "monitor-price-alerts": {
        "task": "app.tasks.alert_tasks.monitor_price_alerts",
        "schedule": 30.0,
    },
    "monitor-pending-orders": {
        "task": "monitor_pending_orders",
        "schedule": 60.0,  # Every minute
    },
    "fetch-news": {
        "task": "app.tasks.market_data_tasks.fetch_news",
        "schedule": 300.0,
    },
}
