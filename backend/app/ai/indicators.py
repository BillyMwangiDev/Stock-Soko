from typing import List


def simple_moving_average(series: List[float], window: int) -> List[float]:
    if window <= 0 or window > len(series):
        return []
    result: List[float] = []
    for i in range(window - 1, len(series)):
        window_slice = series[i - window + 1 : i + 1]
        result.append(sum(window_slice) / window)
    return result


def _ema(series: List[float], period: int) -> List[float]:
    if period <= 0 or period > len(series):
        return []
    k = 2 / (period + 1)
    ema: List[float] = []
    # start with SMA for first period as seed
    seed = sum(series[:period]) / period
    ema.append(seed)
    for price in series[period:]:
        prev = ema[-1]
        ema.append(price * k + prev * (1 - k))
    return ema


def rsi(prices: List[float], period: int = 14) -> List[float]:
    if period <= 0 or len(prices) < period + 1:
        return []
    gains: List[float] = []
    losses: List[float] = []
    for i in range(1, len(prices)):
        delta = prices[i] - prices[i - 1]
        gains.append(max(delta, 0))
        losses.append(max(-delta, 0))
    # initial averages
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    rsi_values: List[float] = []
    # Wilder's smoothing
    for i in range(period, len(gains)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        if avg_loss == 0:
            rsi_values.append(100.0)
            continue
        rs = avg_gain / avg_loss
        rsi_values.append(100 - (100 / (1 + rs)))
    return rsi_values


def macd(
    prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9
) -> tuple[List[float], List[float], List[float]]:
    if len(prices) < slow + signal:
        return [], [], []
    ema_fast = _ema(prices, fast)
    ema_slow = _ema(prices, slow)
    # align lengths: ema_fast len = len(prices) - fast + 1; ema_slow len = len(prices) - slow + 1
    offset = len(ema_fast) - len(ema_slow)
    if offset < 0:
        # shouldn't happen if fast < slow
        return [], [], []
    macd_line: List[float] = []
    for i in range(len(ema_slow)):
        macd_line.append(ema_fast[i + offset] - ema_slow[i])
    signal_line = _ema(macd_line, signal)
    if not signal_line:
        return macd_line, [], []
    # align macd_line to signal_line length
    macd_tail = macd_line[-len(signal_line) :]
    histogram = [m - s for m, s in zip(macd_tail, signal_line)]
    return macd_tail, signal_line, histogram
