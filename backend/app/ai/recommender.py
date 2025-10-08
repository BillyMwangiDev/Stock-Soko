from typing import Literal, List
from .indicators import simple_moving_average

Recommendation = Literal["buy", "sell", "hold"]


def sma_crossover_signal(prices: List[float], fast: int = 5, slow: int = 10) -> Recommendation:
	if len(prices) < slow or fast <= 0 or slow <= 0 or fast >= slow:
		return "hold"
	fast_sma = simple_moving_average(prices, fast)
	slow_sma = simple_moving_average(prices, slow)
	if not fast_sma or not slow_sma:
		return "hold"
	# align tails
	offset = len(fast_sma) - len(slow_sma)
	fast_tail = fast_sma[offset:] if offset > 0 else fast_sma
	if len(fast_tail) != len(slow_sma):
		return "hold"
	if fast_tail[-1] > slow_sma[-1] and fast_tail[-2] <= slow_sma[-2]:
		return "buy"
	if fast_tail[-1] < slow_sma[-1] and fast_tail[-2] >= slow_sma[-2]:
		return "sell"
	return "hold"
