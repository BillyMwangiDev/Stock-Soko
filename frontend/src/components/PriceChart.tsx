import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, typography } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface PriceChartProps {
  symbol: string;
  currentPrice: number;
}

type TimeRange = '1D' | '1W' | '1M' | '6M' | '1Y';

interface ChartDataPoint {
  timestamp: string;
  price: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, currentPrice }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');
  const screenWidth = Dimensions.get('window').width;

  const generateMockData = (range: TimeRange): ChartDataPoint[] => {
    const dataPoints: number = range === '1D' ? 24 : range === '1W' ? 7 : range === '1M' ? 30 : range === '6M' ? 180 : 365;
    const data: ChartDataPoint[] = [];
    let price = currentPrice;
    const volatility = range === '1D' ? 0.005 : range === '1W' ? 0.01 : 0.02;

    for (let i = dataPoints; i >= 0; i--) {
      const change = (Math.random() - 0.5) * volatility * price;
      price = Math.max(price + change, currentPrice * 0.85);
      
      const timestamp = new Date();
      if (range === '1D') {
        timestamp.setHours(timestamp.getHours() - i);
      } else {
        timestamp.setDate(timestamp.getDate() - i);
      }
      
      data.push({
        timestamp: timestamp.toISOString(),
        price: parseFloat(price.toFixed(2))
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

  const handleRangeChange = (range: TimeRange) => {
    hapticFeedback.selection();
    setSelectedRange(range);
  };

  return (
    <View style={styles.container}>
      {/* Chart Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Change</Text>
          <Text style={[styles.statValue, { color: isPositive ? colors.gain : colors.loss }]}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Range</Text>
          <Text style={styles.statValue}>
            {minPrice.toFixed(2)} - {maxPrice.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels,
            datasets: [{
              data: prices,
              color: (opacity = 1) => isPositive 
                ? `rgba(22, 163, 74, ${opacity})` 
                : `rgba(246, 70, 93, ${opacity})`,
              strokeWidth: 2,
            }]
          }}
          width={screenWidth - (spacing.base * 2)}
          height={220}
          chartConfig={{
            backgroundColor: colors.background.card,
            backgroundGradientFrom: colors.background.card,
            backgroundGradientTo: colors.background.card,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(132, 142, 156, ${opacity})`,
            style: {
              borderRadius: borderRadius.lg,
            },
            propsForDots: {
              r: '0',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: colors.border.light,
              strokeWidth: 0.5,
            },
          }}
          bezier
          style={styles.chart}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={false}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={false}
          segments={4}
        />
      </View>

      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        {(['1D', '1W', '1M', '6M', '1Y'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              selectedRange === range && styles.rangeButtonActive
            ]}
            onPress={() => handleRangeChange(range)}
          >
            <Text style={[
              styles.rangeText,
              selectedRange === range && styles.rangeTextActive
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  rangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  rangeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    minWidth: 48,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: colors.primary.main,
  },
  rangeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  rangeTextActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default PriceChart;

