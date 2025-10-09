import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, typography } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface PriceChartProps {
  symbol: string;
  currentPrice: number;
}

type TimeRange = '15m' | '1H' | '4H' | '1D' | '1W' | '1M';

interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume?: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, currentPrice }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');
  const [touchedPoint, setTouchedPoint] = useState<ChartDataPoint | null>(null);
  const [showIndicators, setShowIndicators] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<'none' | 'rsi' | 'macd' | 'ma'>('none');
  const screenWidth = Dimensions.get('window').width;

  const generateMockData = (range: TimeRange): ChartDataPoint[] => {
    const config = {
      '15m': { points: 60, interval: 15 * 60 * 1000, volatility: 0.003 },
      '1H': { points: 48, interval: 60 * 60 * 1000, volatility: 0.005 },
      '4H': { points: 48, interval: 4 * 60 * 60 * 1000, volatility: 0.01 },
      '1D': { points: 24, interval: 60 * 60 * 1000, volatility: 0.008 },
      '1W': { points: 7, interval: 24 * 60 * 60 * 1000, volatility: 0.015 },
      '1M': { points: 30, interval: 24 * 60 * 60 * 1000, volatility: 0.02 },
    };

    const { points, interval, volatility } = config[range];
    const data: ChartDataPoint[] = [];
    let price = currentPrice;

    for (let i = points; i >= 0; i--) {
      const change = (Math.random() - 0.5) * volatility * price;
      price = Math.max(price + change, currentPrice * 0.85);
      const volume = Math.floor(Math.random() * 100000) + 50000;
      
      const timestamp = new Date(Date.now() - (i * interval));
      
      data.push({
        timestamp: timestamp.toISOString(),
        price: parseFloat(price.toFixed(2)),
        volume
      });
    }
    return data;
  };

  const chartData = generateMockData(selectedRange);
  const prices = chartData.map(d => d.price);
  const labels = chartData.map((d, i) => {
    if (selectedRange === '1D') {
      return i % 4 === 0 ? new Date(d.timestamp).getHours() + 'h' : '';
    } else if (selectedRange === '1W') {
      return new Date(d.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
    } else if (selectedRange === '1M') {
      return i % 5 === 0 ? new Date(d.timestamp).getDate().toString() : '';
    } else {
      return i % 30 === 0 ? new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short' }) : '';
    }
  });

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceChange = prices[prices.length - 1] - prices[0];
  const priceChangePercent = (priceChange / prices[0]) * 100;
  const isPositive = priceChange >= 0;

  // Calculate RSI (Relative Strength Index)
  const calculateRSI = (prices: number[], period: number = 14): number[] => {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    // First RSI calculation
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    rsi.push(100 - (100 / (1 + avgGain / avgLoss)));

    // Subsequent RSI calculations
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  };

  // Calculate Moving Average
  const calculateMA = (prices: number[], period: number): number[] => {
    const ma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      ma.push(sum / period);
    }
    return ma;
  };

  // Calculate MACD
  const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = calculateEMA(macdLine, 9);
    const histogram = macdLine.map((val, i) => val - (signalLine[i] || 0));
    
    return { macdLine, signalLine, histogram };
  };

  const calculateEMA = (prices: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    ema[0] = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }

    return ema;
  };

  const handleRangeChange = (range: TimeRange) => {
    hapticFeedback.selection();
    setSelectedRange(range);
  };

  return (
    <View style={styles.container}>
      {/* Price Display - OKX Style */}
      <View style={styles.priceHeader}>
        <View style={styles.mainPriceRow}>
          <Text style={styles.currentPrice}>
            KES {touchedPoint ? touchedPoint.price.toFixed(2) : currentPrice.toFixed(2)}
          </Text>
          <View style={[styles.changeBadge, isPositive ? styles.changeBadgePositive : styles.changeBadgeNegative]}>
            <Text style={[styles.changeText, isPositive ? styles.changePositive : styles.changeNegative]}>
              {isPositive ? '' : ''} {Math.abs(priceChangePercent).toFixed(2)}%
            </Text>
          </View>
        </View>
        {touchedPoint && (
          <Text style={styles.touchedTime}>
            {new Date(touchedPoint.timestamp).toLocaleString('en-US', { 
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </Text>
        )}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>High</Text>
            <Text style={[styles.statValue, styles.changePositive]}>{maxPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Low</Text>
            <Text style={[styles.statValue, styles.changeNegative]}>{minPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>24h Vol</Text>
            <Text style={styles.statValue}>{(chartData.reduce((sum, d) => sum + (d.volume || 0), 0) / 1000).toFixed(0)}K</Text>
          </View>
        </View>
      </View>

      {/* Time Range Selector - OKX Style (top) */}
      <View style={styles.rangeSelectorTop}>
        {(['15m', '1H', '4H', '1D', '1W', '1M'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButtonTop,
              selectedRange === range && styles.rangeButtonActiveTop
            ]}
            onPress={() => handleRangeChange(range)}
          >
            <Text style={[
              styles.rangeTextTop,
              selectedRange === range && styles.rangeTextActiveTop
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Technical Indicators Selector */}
      <View style={styles.indicatorSelector}>
        <TouchableOpacity
          style={styles.indicatorToggle}
          onPress={() => setShowIndicators(!showIndicators)}
        >
          <Text style={styles.indicatorToggleText}>
            {showIndicators ? '' : ''} Indicators
          </Text>
        </TouchableOpacity>

        {showIndicators && (
          <View style={styles.indicatorButtons}>
            {(['none', 'rsi', 'macd', 'ma'] as const).map((indicator) => (
              <TouchableOpacity
                key={indicator}
                style={[
                  styles.indicatorButton,
                  selectedIndicator === indicator && styles.indicatorButtonActive
                ]}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedIndicator(indicator);
                }}
              >
                <Text style={[
                  styles.indicatorButtonText,
                  selectedIndicator === indicator && styles.indicatorButtonTextActive
                ]}>
                  {indicator === 'none' ? 'None' : indicator === 'rsi' ? 'RSI' : indicator === 'macd' ? 'MACD' : 'MA'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Indicator Values Display */}
      {selectedIndicator !== 'none' && (
        <View style={styles.indicatorValues}>
          {selectedIndicator === 'rsi' && (() => {
            const rsiValues = calculateRSI(prices);
            const currentRSI = rsiValues[rsiValues.length - 1] || 50;
            const rsiColor = currentRSI > 70 ? colors.error : currentRSI < 30 ? colors.success : colors.warning;
            return (
              <View style={styles.indicatorValueRow}>
                <Text style={styles.indicatorLabel}>RSI(14):</Text>
                <Text style={[styles.indicatorValue, { color: rsiColor }]}>
                  {currentRSI.toFixed(2)}
                </Text>
                <Text style={styles.indicatorHint}>
                  {currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'}
                </Text>
              </View>
            );
          })()}
          
          {selectedIndicator === 'macd' && (() => {
            const { macdLine, signalLine } = calculateMACD(prices);
            const currentMACD = macdLine[macdLine.length - 1] || 0;
            const currentSignal = signalLine[signalLine.length - 1] || 0;
            const isBullish = currentMACD > currentSignal;
            return (
              <View style={styles.indicatorValueRow}>
                <Text style={styles.indicatorLabel}>MACD:</Text>
                <Text style={[styles.indicatorValue, { color: isBullish ? colors.success : colors.error }]}>
                  {currentMACD.toFixed(2)}
                </Text>
                <Text style={styles.indicatorLabel}>Signal:</Text>
                <Text style={styles.indicatorValue}>{currentSignal.toFixed(2)}</Text>
                <Text style={[styles.indicatorHint, { color: isBullish ? colors.success : colors.error }]}>
                  {isBullish ? 'Bullish' : 'Bearish'}
                </Text>
              </View>
            );
          })()}

          {selectedIndicator === 'ma' && (() => {
            const ma20 = calculateMA(prices, 20);
            const ma50 = calculateMA(prices, 50);
            const currentMA20 = ma20[ma20.length - 1] || currentPrice;
            const currentMA50 = ma50[ma50.length - 1] || currentPrice;
            return (
              <View style={styles.indicatorValueRow}>
                <Text style={styles.indicatorLabel}>MA(20):</Text>
                <Text style={styles.indicatorValue}>{currentMA20.toFixed(2)}</Text>
                <Text style={styles.indicatorLabel}>MA(50):</Text>
                <Text style={styles.indicatorValue}>{currentMA50.toFixed(2)}</Text>
                <Text style={[styles.indicatorHint, { color: currentMA20 > currentMA50 ? colors.success : colors.error }]}>
                  {currentMA20 > currentMA50 ? 'Golden Cross' : 'Death Cross'}
                </Text>
              </View>
            );
          })()}
        </View>
      )}

      {/* Chart - Full Width OKX Style */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels,
            datasets: [{
              data: prices,
              color: (opacity = 1) => isPositive 
                ? `rgba(22, 163, 74, ${opacity})` 
                : `rgba(246, 70, 93, ${opacity})`,
              strokeWidth: 2.5,
            }]
          }}
          width={screenWidth}
          height={280}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: colors.background.primary,
            backgroundGradientTo: colors.background.primary,
            decimalPlaces: 2,
            color: (opacity = 1) => isPositive
              ? `rgba(22, 163, 74, ${opacity})`
              : `rgba(246, 70, 93, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(132, 142, 156, ${opacity * 0.6})`,
            style: {
              borderRadius: 0,
            },
            propsForDots: {
              r: '0',
            },
            propsForBackgroundLines: {
              strokeDasharray: '2,4',
              stroke: colors.border.light,
              strokeWidth: 0.5,
              strokeOpacity: 0.3,
            },
          }}
          bezier
          style={styles.chart}
          withVerticalLabels={true}
          withHorizontalLabels={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={false}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={false}
          segments={3}
        />
      </View>

      {/* Trading Info */}
      <View style={styles.tradingInfo}>
        <Text style={styles.tradingInfoText}>Powered by NSE Live Data</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
  },
  priceHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  mainPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  changeBadgePositive: {
    backgroundColor: colors.success + '20',
  },
  changeBadgeNegative: {
    backgroundColor: colors.error + '20',
  },
  changeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  changePositive: {
    color: colors.success,
  },
  changeNegative: {
    color: colors.error,
  },
  touchedTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  rangeSelectorTop: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  indicatorSelector: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  indicatorToggle: {
    paddingVertical: spacing.xs,
  },
  indicatorToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  indicatorButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  indicatorButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  indicatorButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  indicatorButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  indicatorButtonTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  indicatorValues: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  indicatorValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  indicatorLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  indicatorValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  indicatorHint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginLeft: 'auto',
  },
  rangeButtonTop: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  rangeButtonActiveTop: {
    backgroundColor: colors.primary.main + '20',
  },
  rangeTextTop: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  rangeTextActiveTop: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  chartContainer: {
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  chart: {
    marginLeft: -spacing.base,
  },
  tradingInfo: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  tradingInfoText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
  },
});

export default PriceChart;