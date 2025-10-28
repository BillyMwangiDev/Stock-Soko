/**
 * Educational Content Screen - REVAMPED
 * Comprehensive learning center with organized modules, progress tracking, and interactive content
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigation/types';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EducationalContentScreenProp = StackNavigationProp<ProfileStackParamList, 'EducationalContent'>;

interface Props {
  navigation: EducationalContentScreenProp;
}

interface Module {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  icon: string;
  color: string;
  progress: number;
  category: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  icon: string;
  color: string;
  difficulty: string;
}

// Mapping of learning paths to their module IDs
const PATH_TO_MODULES: Record<string, string[]> = {
  complete_beginner: [
    'L1-001', // Understanding Stock Prices
    'L1-002', // Reading Financial Statements
    'L1-003', // P/E Ratio
    'L1-004', // How to Place Your First Trade
    'L1-005', // Risk Management Basics
    'L1-006', // Dividends and Income Investing
    'L1-007', // Market vs Limit Orders
    'L1-008', // Understanding Brokers & Fees
  ],
  value_investing: [
    'L1-001', // Understanding Stock Prices (foundation)
    'L1-002', // Reading Financial Statements
    'L1-003', // P/E Ratio
    'L2-001', // Profitability Metrics: ROE & ROA
    'L2-002', // Cash Flow vs Profit
    'L2-005', // Sector Analysis & Rotation
    'L2-007', // Earnings Reports Deep Dive
    'L2-008', // Portfolio Diversification
    'L3-001', // DCF Valuation Mastery
    'L3-003', // Portfolio Theory & Optimization
    'L3-006', // Competitive Advantage Analysis
    'L3-007', // Market Cycles & Timing
  ],
  technical_trading: [
    'L1-001', // Understanding Stock Prices (foundation)
    'L1-004', // How to Place Your First Trade
    'L1-007', // Market vs Limit Orders
    'L2-003', // Moving Averages - Find the Trend
    'L2-004', // Position Sizing & Stop Losses
    'L2-006', // Support & Resistance Levels
    'L3-002', // RSI & MACD Advanced Strategies
    'L3-007', // Market Cycles & Timing
    'L3-008', // Backtesting Trading Strategies
  ],
  fundamental_analysis: [
    'L1-002', // Reading Financial Statements
    'L1-003', // P/E Ratio
    'L2-001', // Profitability Metrics: ROE & ROA
    'L2-002', // Cash Flow vs Profit
    'L2-005', // Sector Analysis & Rotation
    'L2-007', // Earnings Reports Deep Dive
    'L3-001', // DCF Valuation Mastery
    'L3-003', // Portfolio Theory & Optimization
    'L3-004', // Building Quantitative Models
    'L3-006', // Competitive Advantage Analysis
  ],
};

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'complete_beginner',
    title: 'Complete Beginner Track',
    description: 'Start from zero and become a confident investor in 8 weeks',
    duration: '8 weeks',
    modules: PATH_TO_MODULES.complete_beginner.length,
    icon: 'rocket-outline',
    color: colors.success,
    difficulty: 'Beginner',
  },
  {
    id: 'value_investing',
    title: 'Value Investing Mastery',
    description: 'Learn Warren Buffett principles adapted for NSE stocks',
    duration: '10 weeks',
    modules: PATH_TO_MODULES.value_investing.length,
    icon: 'trending-up-outline',
    color: colors.primary.main,
    difficulty: 'Intermediate',
  },
  {
    id: 'technical_trading',
    title: 'Technical Trading Specialist',
    description: 'Master charts, indicators, and timing for active trading',
    duration: '5 weeks',
    modules: PATH_TO_MODULES.technical_trading.length,
    icon: 'analytics-outline',
    color: '#FF6B35',
    difficulty: 'Intermediate',
  },
  {
    id: 'fundamental_analysis',
    title: 'Fundamental Analysis Pro',
    description: 'Deep dive into financial statements and valuation models',
    duration: '6 weeks',
    modules: PATH_TO_MODULES.fundamental_analysis.length,
    icon: 'calculator-outline',
    color: '#8B5CF6',
    difficulty: 'Advanced',
  },
];

const MODULES: Module[] = [
  // BEGINNER MODULES
  {
    id: 'L1-001',
    title: 'Understanding Stock Prices',
    description: 'Learn what stocks are and how prices move with supply and demand',
    level: 'beginner',
    duration: '10 min',
    lessons: 1,
    icon: 'pricetag-outline',
    color: colors.success,
    progress: 0,
    category: 'Stock Basics',
  },
  {
    id: 'L1-002',
    title: 'Reading Financial Statements',
    description: 'Master the 3 core financial statements every investor must know',
    level: 'beginner',
    duration: '15 min',
    lessons: 1,
    icon: 'document-text-outline',
    color: colors.success,
    progress: 0,
    category: 'Financial Literacy',
  },
  {
    id: 'L1-003',
    title: 'P/E Ratio - Your First Tool',
    description: 'Master the most widely used valuation metric for stocks',
    level: 'beginner',
    duration: '12 min',
    lessons: 1,
    icon: 'calculator-outline',
    color: colors.success,
    progress: 0,
    category: 'Valuation',
  },
  {
    id: 'L1-004',
    title: 'How to Place Your First Trade',
    description: 'Understand order types and execute trades safely',
    level: 'beginner',
    duration: '8 min',
    lessons: 1,
    icon: 'swap-horizontal-outline',
    color: colors.success,
    progress: 0,
    category: 'Trading',
  },
  {
    id: 'L1-005',
    title: 'Risk Management Basics',
    description: 'Learn to protect your capital with proper risk controls',
    level: 'beginner',
    duration: '10 min',
    lessons: 1,
    icon: 'shield-checkmark-outline',
    color: colors.success,
    progress: 0,
    category: 'Risk Management',
  },
  {
    id: 'L1-006',
    title: 'Dividends and Income Investing',
    description: 'Earn regular income from your stock investments',
    level: 'beginner',
    duration: '12 min',
    lessons: 1,
    icon: 'cash-outline',
    color: colors.success,
    progress: 0,
    category: 'Income Investing',
  },
  {
    id: 'L1-007',
    title: 'Market vs Limit Orders',
    description: 'Choose the right order type for every situation',
    level: 'beginner',
    duration: '8 min',
    lessons: 1,
    icon: 'options-outline',
    color: colors.success,
    progress: 0,
    category: 'Trading',
  },
  {
    id: 'L1-008',
    title: 'Understanding Brokers & Fees',
    description: 'Navigate brokerage fees and choose the right broker',
    level: 'beginner',
    duration: '10 min',
    lessons: 1,
    icon: 'business-outline',
    color: colors.success,
    progress: 0,
    category: 'Investing Basics',
  },
  
  // INTERMEDIATE MODULES
  {
    id: 'L2-001',
    title: 'Profitability Metrics: ROE & ROA',
    description: 'Deep dive into return ratios and margin analysis',
    level: 'intermediate',
    duration: '18 min',
    lessons: 1,
    icon: 'stats-chart-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Financial Analysis',
  },
  {
    id: 'L2-002',
    title: 'Cash Flow vs Profit',
    description: 'Learn why Free Cash Flow matters more than profit',
    level: 'intermediate',
    duration: '20 min',
    lessons: 1,
    icon: 'water-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Financial Analysis',
  },
  {
    id: 'L2-003',
    title: 'Moving Averages - Find the Trend',
    description: 'Use SMA and EMA to identify market trends',
    level: 'intermediate',
    duration: '15 min',
    lessons: 1,
    icon: 'trending-up-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Technical Analysis',
  },
  {
    id: 'L2-004',
    title: 'Position Sizing & Stop Losses',
    description: 'Protect capital with proper position sizing',
    level: 'intermediate',
    duration: '16 min',
    lessons: 1,
    icon: 'shield-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Risk Management',
  },
  {
    id: 'L2-005',
    title: 'Sector Analysis & Rotation',
    description: 'Understand sector cycles and rotate into winners',
    level: 'intermediate',
    duration: '18 min',
    lessons: 1,
    icon: 'pie-chart-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Sector Analysis',
  },
  {
    id: 'L2-006',
    title: 'Support & Resistance Levels',
    description: 'Identify key price levels for better entries and exits',
    level: 'intermediate',
    duration: '14 min',
    lessons: 1,
    icon: 'git-compare-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Technical Analysis',
  },
  {
    id: 'L2-007',
    title: 'Earnings Reports Deep Dive',
    description: 'Analyze quarterly earnings and find hidden insights',
    level: 'intermediate',
    duration: '22 min',
    lessons: 1,
    icon: 'newspaper-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Financial Analysis',
  },
  {
    id: 'L2-008',
    title: 'Portfolio Diversification',
    description: 'Build a resilient portfolio across sectors and assets',
    level: 'intermediate',
    duration: '16 min',
    lessons: 1,
    icon: 'grid-outline',
    color: colors.primary.main,
    progress: 0,
    category: 'Portfolio Management',
  },

  // ADVANCED MODULES
  {
    id: 'L3-001',
    title: 'DCF Valuation Mastery',
    description: 'Calculate intrinsic value like professional analysts',
    level: 'advanced',
    duration: '30 min',
    lessons: 1,
    icon: 'calculator-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Valuation',
  },
  {
    id: 'L3-002',
    title: 'RSI & MACD Advanced Strategies',
    description: 'Master momentum indicators for precise timing',
    level: 'advanced',
    duration: '22 min',
    lessons: 1,
    icon: 'pulse-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Technical Analysis',
  },
  {
    id: 'L3-003',
    title: 'Portfolio Theory & Optimization',
    description: 'Sharpe ratio, Beta, and risk-adjusted returns',
    level: 'advanced',
    duration: '25 min',
    lessons: 1,
    icon: 'trophy-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Portfolio Management',
  },
  {
    id: 'L3-004',
    title: 'Building Quantitative Models',
    description: 'Create systematic trading strategies with scoring models',
    level: 'advanced',
    duration: '28 min',
    lessons: 1,
    icon: 'code-slash-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Quantitative Analysis',
  },
  {
    id: 'L3-005',
    title: 'Options Trading Fundamentals',
    description: 'Calls, puts, and basic options strategies',
    level: 'advanced',
    duration: '26 min',
    lessons: 1,
    icon: 'git-branch-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Advanced Trading',
  },
  {
    id: 'L3-006',
    title: 'Competitive Advantage Analysis',
    description: 'Identify companies with sustainable moats',
    level: 'advanced',
    duration: '24 min',
    lessons: 1,
    icon: 'medal-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Business Analysis',
  },
  {
    id: 'L3-007',
    title: 'Market Cycles & Timing',
    description: 'Understand economic cycles and market psychology',
    level: 'advanced',
    duration: '20 min',
    lessons: 1,
    icon: 'refresh-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Market Analysis',
  },
  {
    id: 'L3-008',
    title: 'Backtesting Trading Strategies',
    description: 'Test your strategies on historical data',
    level: 'advanced',
    duration: '30 min',
    lessons: 1,
    icon: 'time-outline',
    color: '#8B5CF6',
    progress: 0,
    category: 'Strategy Development',
  },
];

export default function EducationalContent({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'paths' | 'modules' | 'progress'>('paths');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('learning_progress');
      if (saved) {
        setCompletedModules(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const filteredModules = MODULES.filter(module => {
    // Filter by selected learning path
    const matchesPath = !selectedPath || PATH_TO_MODULES[selectedPath]?.includes(module.id);
    const matchesLevel = selectedLevel === 'all' || module.level === selectedLevel;
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPath && matchesLevel && matchesSearch;
  });

  const handleModulePress = (module: Module) => {
    navigation.navigate('LessonDetail', { lessonId: module.id, lessonTitle: module.title });
  };

  const handlePathPress = (path: LearningPath) => {
    // Set selected path and switch to modules tab
    setSelectedPath(path.id);
    setActiveTab('modules');
    setSearchQuery(''); // Clear search
    setSelectedLevel('all'); // Reset level filter
  };

  const calculateOverallProgress = () => {
    if (MODULES.length === 0) return 0;
    return Math.round((completedModules.length / MODULES.length) * 100);
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'beginner': return 'leaf-outline';
      case 'intermediate': return 'fitness-outline';
      case 'advanced': return 'rocket-outline';
      default: return 'book-outline';
    }
  };

  const renderLearningPaths = () => (
    <View style={styles.pathsContainer}>
      <Text style={styles.sectionTitle}>Choose Your Learning Journey</Text>
      <Text style={styles.sectionSubtitle}>
        Structured paths to guide you from beginner to expert
      </Text>

      {LEARNING_PATHS.map((path) => (
        <TouchableOpacity
          key={path.id}
          style={styles.pathCard}
          onPress={() => handlePathPress(path)}
          activeOpacity={0.7}
        >
          <View style={[styles.pathIconContainer, { backgroundColor: path.color + '20' }]}>
            <Ionicons name={path.icon as any} size={32} color={path.color} />
          </View>
          
          <View style={styles.pathContent}>
            <View style={styles.pathHeader}>
              <Text style={styles.pathTitle}>{path.title}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: path.color + '20' }]}>
                <Text style={[styles.difficultyText, { color: path.color }]}>
                  {path.difficulty}
                </Text>
              </View>
            </View>
            
            <Text style={styles.pathDescription}>{path.description}</Text>
            
            <View style={styles.pathMeta}>
              <View style={styles.pathMetaItem}>
                <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.pathMetaText}>{path.duration}</Text>
              </View>
              <View style={styles.pathMetaItem}>
                <Ionicons name="book-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.pathMetaText}>{path.modules} modules</Text>
              </View>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderModules = () => {
    const selectedPathData = selectedPath ? LEARNING_PATHS.find(p => p.id === selectedPath) : null;
    
    return (
    <View style={styles.modulesContainer}>
      {/* Active Learning Path Banner */}
      {selectedPath && selectedPathData && (
        <View style={[styles.activePathBanner, { borderColor: selectedPathData.color }]}>
          <View style={styles.activePathContent}>
            <View style={[styles.activePathIcon, { backgroundColor: selectedPathData.color + '20' }]}>
              <Ionicons name={selectedPathData.icon as any} size={20} color={selectedPathData.color} />
            </View>
            <View style={styles.activePathInfo}>
              <Text style={styles.activePathLabel}>Active Learning Path</Text>
              <Text style={styles.activePathTitle}>{selectedPathData.title}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.clearPathButton}
            onPress={() => setSelectedPath(null)}
          >
            <Ionicons name="close-circle" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search modules..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Level Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelFilterContainer}>
        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              selectedLevel === level && styles.levelButtonActive
            ]}
            onPress={() => setSelectedLevel(level as any)}
          >
            <Text style={[
              styles.levelButtonText,
              selectedLevel === level && styles.levelButtonTextActive
            ]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modules Grid */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredModules.length} {filteredModules.length === 1 ? 'module' : 'modules'} {selectedPath ? 'in this path' : 'found'}
        </Text>
        {selectedPath && (
          <TouchableOpacity onPress={() => setSelectedPath(null)} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Modules</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.modulesGrid}>
        {filteredModules.map((module) => {
          const isCompleted = completedModules.includes(module.id);
          return (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(module)}
              activeOpacity={0.8}
            >
              <View style={[styles.moduleIconContainer, { backgroundColor: module.color + '20' }]}>
                <Ionicons name={module.icon as any} size={24} color={module.color} />
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  </View>
                )}
              </View>

              <Text style={styles.moduleCategory}>{module.category}</Text>
              <Text style={styles.moduleTitle} numberOfLines={2}>{module.title}</Text>
              <Text style={styles.moduleDescription} numberOfLines={2}>
                {module.description}
              </Text>

              <View style={styles.moduleFooter}>
                <View style={styles.moduleMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.text.tertiary} />
                  <Text style={styles.moduleMetaText}>{module.duration}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: module.color + '15' }]}>
                  <Ionicons name={getLevelIcon(module.level)} size={10} color={module.color} />
                  <Text style={[styles.levelBadgeText, { color: module.color }]}>
                    {module.level.charAt(0).toUpperCase() + module.level.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredModules.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyStateText}>No modules found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
        </View>
      )}
    </View>
  );
  };

  const renderProgress = () => {
    const beginnerCompleted = completedModules.filter(id => MODULES.find(m => m.id === id)?.level === 'beginner').length;
    const intermediateCompleted = completedModules.filter(id => MODULES.find(m => m.id === id)?.level === 'intermediate').length;
    const advancedCompleted = completedModules.filter(id => MODULES.find(m => m.id === id)?.level === 'advanced').length;

    const beginnerTotal = MODULES.filter(m => m.level === 'beginner').length;
    const intermediateTotal = MODULES.filter(m => m.level === 'intermediate').length;
    const advancedTotal = MODULES.filter(m => m.level === 'advanced').length;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Your Learning Progress</Text>
        
        <View style={styles.overallProgressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Completion</Text>
            <Text style={styles.progressPercentage}>{calculateOverallProgress()}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${calculateOverallProgress()}%` }]} />
          </View>
          <Text style={styles.progressStats}>
            {completedModules.length} of {MODULES.length} modules completed
          </Text>
        </View>

        {/* Level Breakdown */}
        <Text style={styles.subsectionTitle}>Progress by Level</Text>

        <View style={styles.levelProgressCard}>
          <View style={styles.levelProgressHeader}>
            <Ionicons name="leaf-outline" size={20} color={colors.success} />
            <Text style={styles.levelProgressTitle}>Beginner</Text>
            <Text style={styles.levelProgressCount}>{beginnerCompleted}/{beginnerTotal}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { 
              width: `${beginnerTotal > 0 ? (beginnerCompleted / beginnerTotal) * 100 : 0}%`,
              backgroundColor: colors.success 
            }]} />
          </View>
        </View>

        <View style={styles.levelProgressCard}>
          <View style={styles.levelProgressHeader}>
            <Ionicons name="fitness-outline" size={20} color={colors.primary.main} />
            <Text style={styles.levelProgressTitle}>Intermediate</Text>
            <Text style={styles.levelProgressCount}>{intermediateCompleted}/{intermediateTotal}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { 
              width: `${intermediateTotal > 0 ? (intermediateCompleted / intermediateTotal) * 100 : 0}%`,
              backgroundColor: colors.primary.main 
            }]} />
          </View>
        </View>

        <View style={styles.levelProgressCard}>
          <View style={styles.levelProgressHeader}>
            <Ionicons name="rocket-outline" size={20} color="#8B5CF6" />
            <Text style={styles.levelProgressTitle}>Advanced</Text>
            <Text style={styles.levelProgressCount}>{advancedCompleted}/{advancedTotal}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { 
              width: `${advancedTotal > 0 ? (advancedCompleted / advancedTotal) * 100 : 0}%`,
              backgroundColor: '#8B5CF6' 
            }]} />
          </View>
        </View>

        {/* Achievements */}
        <Text style={styles.subsectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          <View style={[styles.achievementCard, completedModules.length >= 1 && styles.achievementUnlocked]}>
            <Ionicons 
              name="ribbon-outline" 
              size={32} 
              color={completedModules.length >= 1 ? colors.success : colors.text.disabled} 
            />
            <Text style={styles.achievementTitle}>First Steps</Text>
            <Text style={styles.achievementDesc}>Complete 1 module</Text>
          </View>

          <View style={[styles.achievementCard, completedModules.length >= 5 && styles.achievementUnlocked]}>
            <Ionicons 
              name="star-outline" 
              size={32} 
              color={completedModules.length >= 5 ? colors.warning : colors.text.disabled} 
            />
            <Text style={styles.achievementTitle}>Dedicated Learner</Text>
            <Text style={styles.achievementDesc}>Complete 5 modules</Text>
          </View>

          <View style={[styles.achievementCard, completedModules.length >= 10 && styles.achievementUnlocked]}>
            <Ionicons 
              name="trophy-outline" 
              size={32} 
              color={completedModules.length >= 10 ? '#FFD700' : colors.text.disabled} 
            />
            <Text style={styles.achievementTitle}>Expert Investor</Text>
            <Text style={styles.achievementDesc}>Complete 10 modules</Text>
          </View>

          <View style={[styles.achievementCard, completedModules.length === MODULES.length && styles.achievementUnlocked]}>
            <Ionicons 
              name="medal-outline" 
              size={32} 
              color={completedModules.length === MODULES.length ? '#FF6B35' : colors.text.disabled} 
            />
            <Text style={styles.achievementTitle}>Master Trader</Text>
            <Text style={styles.achievementDesc}>Complete all modules</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Center</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'paths' && styles.tabActive]}
          onPress={() => setActiveTab('paths')}
        >
          <Ionicons 
            name="map-outline" 
            size={20} 
            color={activeTab === 'paths' ? colors.primary.main : colors.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'paths' && styles.tabTextActive]}>
            Paths
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'modules' && styles.tabActive]}
          onPress={() => setActiveTab('modules')}
        >
          <Ionicons 
            name="library-outline" 
            size={20} 
            color={activeTab === 'modules' ? colors.primary.main : colors.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'modules' && styles.tabTextActive]}>
            Modules
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
          onPress={() => setActiveTab('progress')}
        >
          <Ionicons 
            name="trending-up-outline" 
            size={20} 
            color={activeTab === 'progress' ? colors.primary.main : colors.text.secondary} 
          />
          <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'paths' && renderLearningPaths()}
        {activeTab === 'modules' && renderModules()}
        {activeTab === 'progress' && renderProgress()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.main,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  
  // Paths Section
  pathsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  pathIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pathContent: {
    flex: 1,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  pathTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  pathDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  pathMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pathMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pathMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  
  // Modules Section
  modulesContainer: {
    padding: spacing.lg,
  },
  activePathBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
  },
  activePathContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activePathIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  activePathInfo: {
    flex: 1,
  },
  activePathLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  activePathTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  clearPathButton: {
    padding: spacing.xs,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
  },
  levelFilterContainer: {
    marginBottom: spacing.md,
  },
  levelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.main,
    marginRight: spacing.sm,
  },
  levelButtonActive: {
    backgroundColor: colors.primary.main + '20',
    borderColor: colors.primary.main,
  },
  levelButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  levelButtonTextActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moduleCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  moduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
  },
  moduleCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  moduleTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  moduleDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  
  // Progress Section
  progressContainer: {
    padding: spacing.lg,
  },
  overallProgressCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  progressPercentage: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  progressStats: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  subsectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  levelProgressCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  levelProgressTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  levelProgressCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    borderColor: colors.success + '50',
    backgroundColor: colors.success + '10',
  },
  achievementTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
