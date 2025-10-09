/**
 * Portfolio Performance Chart
 * Visual representation of portfolio value over time
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

interface PortfolioChartProps {
  currentValue: number;
  historicalData?: Array<{ date: string; value: number }>;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

const PortfolioChart: React.FC<PortfolioChartProps> = ({ currentValue, historicalData }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [compareToIndex, setCompareToIndex] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const generateMockData = (range: TimeRange) => {
    const config = {
      '1D': { points: 24, startDaysAgo: 1 },
      '1W': { points: 7, startDaysAgo: 7 },
      '1M': { points: 30, startDaysAgo: 30 },
      '3M': { points: 90, startDaysAgo: 90 },
      '1Y': { points: 365, startDaysAgo: 365 },
      'ALL': { points: 730, startDaysAgo: 730 },
    };

    const { points, startDaysAgo } = config[range];
    const data: number[] = [];
    const labels: string[] = [];
    let value = currentValue * 0.85; // Start lower for upward trend

    for (let i = points; i >= 0; i--) {
      const change = (Math.random() - 0.45) * (currentValue * 0.02); // Slightly upward bias
      value = Math.max(value + change, currentValue * 0.7);
      data.push(value);

      const date = new Date();
      date.setDate(date.getDate() - i);

      if (range === '1D') {
        labels.push(i % 6 === 0 ? `${date.getHours()}h` : '');
      } else if (range === '1W') {
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      } else if (range === '1M' || range === '3M') {
        labels.push(i % 10 === 0 ? date.getDate().toString() : '');
      } else {
        labels.push(i % 60 === 0 ? date.toLocaleDateString('en-US', { month: 'short' }) : '');
      }
    }

    // Ensure last value matches current
    data[data.length - 1] = currentValue;

    return { values: data, labels };
  };

  const { values, labels } = generateMockData(selectedRange);
  const change = values[values.length - 1] - values[0];
  const changePercent = (change / values[0]) * 100;
  const isPositive = change >= 0;

  // NSE 20 mock comparison data
  const generateIndexData = () => {
    return values.map(() => currentValue * (0.95 + Math.random() * 0.1));
  };

  const datasets = compareToIndex
    ? [
        {
          data: values,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2.5,
        },
        {
          data: generateIndexData(),
          color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
          strokeWidth: 2,
        },
      ]
    : [
        {
          data: values,
          color: (opacity = 1) => isPositive
            ? `rgba(22, 163, 74, ${opacity})`
            : `rgba(246, 70, 93, ${opacity})`,
          strokeWidth: 2.5,
        },
      ];

  return (
    <View style={styles.container}>
      {/* Header with Performance */}
      <View style={styles.header}>
        <View>
          <Text style={styles.performanceLabel}>Performance ({selectedRange})</Text>
          <View style={styles.performanceRow}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={20}
              color={isPositive ? colors.success : colors.error}
            />
            <Text style={[styles.performanceValue, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </Text>
            <Text style={styles.performanceAmount}>
              ({isPositive ? '+' : ''}KES {change.toFixed(2)})
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.compareButton, compareToIndex && styles.compareButtonActive]}
          onPress={() => setCompareToIndex(!compareToIndex)}
        >
          <Ionicons
            name="git-compare-outline"
            size={16}
            color={compareToIndex ? colors.primary.contrast : colors.primary.main}
          />
          <Text style={[styles.compareText, compareToIndex && styles.compareTextActive]}>
            vs NSE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels,
            datasets,
            legend: compareToIndex ? ['Portfolio', 'NSE 20'] : undefined,
          }}
          width={screenWidth - spacing.lg * 2}
          height={220}
          chartConfig={{
            backgroundColor: colors.background.card,
            backgroundGradientFrom: colors.background.card,
            backgroundGradientTo: colors.background.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.6})`,
            labelColor: (opacity = 1) => colors.text.tertiary,
            style: {
              borderRadius: borderRadius.md,
            },
            propsForBackgroundLines: {
              stroke: colors.border.main,
              strokeWidth: 0.5,
              strokeDasharray: '5,5',
            },
            propsForDots: {
              r: '0',
            },
          }}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
        />
      </View>

      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.rangeButton, selectedRange === range && styles.rangeButtonActive]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.rangeText,
                selectedRange === range && styles.rangeTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      {compareToIndex && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary.main }]} />
            <Text style={styles.legendText}>Your Portfolio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.text.tertiary }]} />
            <Text style={styles.legendText}>NSE 20 Index</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  performanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  performanceValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  performanceAmount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: 'transparent',
  },
  compareButtonActive: {
    backgroundColor: colors.primary.main,
  },
  compareText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  compareTextActive: {
    color: colors.primary.contrast,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  rangeButtonActive: {
    backgroundColor: colors.primary.main,
  },
  rangeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  rangeTextActive: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});

export default PortfolioChart;