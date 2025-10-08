"""
Charts Router - Stock price history and chart data
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/charts", tags=["charts"])


@router.get("/{symbol}")
async def get_chart_data(
    symbol: str,
    timeframe: str = Query("1D", description="1D, 1W, 1M, 3M, 1Y, 5Y"),
    interval: str = Query("1h", description="1m, 5m, 15m, 1h, 1d")
):
    """
    Get historical price data for charts
    
    - **symbol**: Stock symbol (e.g., KCB, SCOM)
    - **timeframe**: Data range (1D, 1W, 1M, 3M, 1Y, 5Y)
    - **interval**: Data interval (1m, 5m, 15m, 1h, 1d)
    
    Returns OHLCV (Open, High, Low, Close, Volume) data
    """
    
    # Map timeframe to number of data points
    timeframe_map = {
        "1D": 24,
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "1Y": 365,
        "5Y": 365 * 5
    }
    
    if timeframe not in timeframe_map:
        raise HTTPException(status_code=400, detail="Invalid timeframe")
    
    # Generate mock OHLCV data
    num_points = timeframe_map[timeframe]
    base_price = random.uniform(30, 100)  # Random base price
    
    data_points = []
    current_time = datetime.utcnow()
    
    # Determine time delta based on interval
    interval_delta = {
        "1m": timedelta(minutes=1),
        "5m": timedelta(minutes=5),
        "15m": timedelta(minutes=15),
        "1h": timedelta(hours=1),
        "1d": timedelta(days=1)
    }.get(interval, timedelta(hours=1))
    
    for i in range(num_points):
        # Generate realistic OHLCV data
        volatility = base_price * 0.02  # 2% volatility
        
        open_price = base_price + random.uniform(-volatility, volatility)
        close_price = open_price + random.uniform(-volatility, volatility)
        high_price = max(open_price, close_price) + random.uniform(0, volatility)
        low_price = min(open_price, close_price) - random.uniform(0, volatility)
        volume = random.randint(100000, 1000000)
        
        timestamp = current_time - (interval_delta * (num_points - i))
        
        data_points.append({
            "timestamp": timestamp.isoformat(),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume
        })
        
        # Update base price for next iteration (trend)
        base_price = close_price
    
    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "interval": interval,
        "data": data_points,
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/{symbol}/indicators")
async def get_technical_indicators(
    symbol: str,
    indicators: str = Query("sma,ema,rsi", description="Comma-separated list: sma,ema,rsi,macd")
):
    """
    Get technical indicators for a stock
    
    - **symbol**: Stock symbol
    - **indicators**: Comma-separated list (sma, ema, rsi, macd, bollinger)
    
    Returns calculated technical indicators
    """
    
    indicator_list = [i.strip().lower() for i in indicators.split(",")]
    
    result = {
        "symbol": symbol,
        "timestamp": datetime.utcnow().isoformat(),
        "indicators": {}
    }
    
    # Mock indicator values (use TA-Lib or similar in production)
    if "sma" in indicator_list:
        result["indicators"]["sma_20"] = round(random.uniform(30, 100), 2)
        result["indicators"]["sma_50"] = round(random.uniform(30, 100), 2)
    
    if "ema" in indicator_list:
        result["indicators"]["ema_12"] = round(random.uniform(30, 100), 2)
        result["indicators"]["ema_26"] = round(random.uniform(30, 100), 2)
    
    if "rsi" in indicator_list:
        result["indicators"]["rsi"] = round(random.uniform(30, 70), 2)
    
    if "macd" in indicator_list:
        result["indicators"]["macd"] = {
            "macd_line": round(random.uniform(-2, 2), 2),
            "signal_line": round(random.uniform(-2, 2), 2),
            "histogram": round(random.uniform(-1, 1), 2)
        }
    
    if "bollinger" in indicator_list:
        middle = random.uniform(40, 60)
        result["indicators"]["bollinger"] = {
            "upper": round(middle + 5, 2),
            "middle": round(middle, 2),
            "lower": round(middle - 5, 2)
        }
    
    return result

