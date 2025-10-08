from backend.app.ai.recommender import sma_crossover_signal


def test_sma_crossover_signal_basic():
	prices = [1,2,3,4,5,6,7,8,9,10]
	rec = sma_crossover_signal(prices, fast=3, slow=5)
	assert rec in {"buy", "sell", "hold"}
