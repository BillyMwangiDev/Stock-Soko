from celery import shared_task
from typing import List
from datetime import datetime
from ..services.markets_service import get_live_quotes, get_market_movers
from ..services.news_service import news_service
from ..services.cache_service import cache_service
from ..utils.logging import get_logger

logger = get_logger("market_data_tasks")

NSE_POPULAR_STOCKS = [
    "NSE:SCOM",
    "NSE:EQTY",
    "NSE:KCB",
    "NSE:COOP",
    "NSE:BAT",
    "NSE:EABL",
    "NSE:ABSA",
    "NSE:SCBK",
    "NSE:DTBK",
    "NSE:NCBA",
]


@shared_task(name="app.tasks.market_data_tasks.fetch_and_cache_prices")
def fetch_and_cache_prices():
    """
    Periodic task to fetch and cache prices for popular NSE stocks
    Runs every 30 seconds
    """
    logger.info("Starting price fetch task for popular stocks")

    try:
        quotes = get_live_quotes(NSE_POPULAR_STOCKS)

        for quote in quotes:
            cache_key = f"price_{quote['symbol']}"
            cache_service.set(cache_key, quote, ttl=30)

        cache_service.set("popular_stocks_prices", quotes, ttl=30)

        logger.info(f"Cached prices for {len(quotes)} stocks")
        return {"success": True, "cached": len(quotes)}

    except Exception as e:
        logger.error(f"Error in fetch_and_cache_prices task: {e}")
        return {"success": False, "error": str(e)}


@shared_task(name="app.tasks.market_data_tasks.update_market_movers")
def update_market_movers():
    """
    Periodic task to update market gainers and losers
    Runs every 60 seconds
    """
    logger.info("Starting market movers update task")

    try:
        movers = get_market_movers()

        cache_service.set("market_gainers", movers.get("gainers", []), ttl=60)
        cache_service.set("market_losers", movers.get("losers", []), ttl=60)

        logger.info(
            f"Updated market movers: {len(movers.get('gainers', []))} gainers, {len(movers.get('losers', []))} losers"
        )
        return {"success": True, "movers": movers}

    except Exception as e:
        logger.error(f"Error in update_market_movers task: {e}")
        return {"success": False, "error": str(e)}


@shared_task(name="app.tasks.market_data_tasks.fetch_news")
def fetch_news():
    """
    Periodic task to fetch and cache latest market news
    Runs every 5 minutes
    """
    logger.info("Starting news fetch task")

    try:
        news = news_service.get_combined_news(limit=20)

        cache_service.set("latest_market_news", news, ttl=300)

        logger.info(f"Cached {len(news)} news articles")
        return {"success": True, "articles": len(news)}

    except Exception as e:
        logger.error(f"Error in fetch_news task: {e}")
        return {"success": False, "error": str(e)}


@shared_task(name="app.tasks.market_data_tasks.warm_cache_for_stock")
def warm_cache_for_stock(symbol: str):
    """
    On-demand task to warm cache for a specific stock
    Called when a user views a stock detail page
    """
    logger.info(f"Warming cache for {symbol}")

    try:
        from ..services.markets_service import get_quote, get_historical_data

        quote = get_quote(symbol)
        cache_service.set(f"price_{symbol}", quote, ttl=30)

        historical = get_historical_data(symbol, days=30)
        cache_service.set(f"historical_{symbol}_30", historical, ttl=300)

        logger.info(f"Cache warmed for {symbol}")
        return {"success": True, "symbol": symbol}

    except Exception as e:
        logger.error(f"Error warming cache for {symbol}: {e}")
        return {"success": False, "error": str(e)}


@shared_task(name="app.tasks.market_data_tasks.generate_report_async")
def generate_report_async(user_id: int, report_type: str, date_range: dict):
    """
    Background task to generate user reports (statements, tax reports)
    """
    logger.info(f"Generating {report_type} report for user {user_id}")

    try:
        from ..services.report_service import (
            generate_transaction_statement,
            generate_tax_report,
            generate_portfolio_summary,
        )
        from ..database import SessionLocal

        db = SessionLocal()

        if report_type == "transactions":
            filename = generate_transaction_statement(
                db, user_id, date_range.get("start"), date_range.get("end")
            )
        elif report_type == "tax":
            filename = generate_tax_report(db, user_id, date_range.get("year"))
        elif report_type == "portfolio":
            filename = generate_portfolio_summary(db, user_id)
        else:
            raise ValueError(f"Unknown report type: {report_type}")

        db.close()

        logger.info(f"Generated report: {filename}")
        return {"success": True, "filename": filename}

    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return {"success": False, "error": str(e)}
