# Stock Soko - Product Requirements Document (PRD)

Wireframes: [Stitch project](https://stitch.withgoogle.com/projects/2721751293655150395)

This document is the single source of truth for scope, priorities, and constraints. It mirrors the YAML specification shared by the team and is intended for engineering, product, and stakeholders.

---

```yaml
name: "Stock Soko"
tagline: "Intelligent Stock Trading Platform for African Markets"
version: "1.0"
type: "FinTech Mobile Application"

metadata:
  created_date: "2024-01-15"
  author: "Stock Soko Team"
  target_market: "Kenyan Retail Investors"
  compliance: "CMA Regulatory Framework"

# PROJECT OVERVIEW
project_overview:
  vision: "Democratize stock market investing in Africa by making it as accessible and efficient as crypto trading"
  mission: "Build an all-in-one platform that combines AI-powered research, seamless trading, and portfolio management for African investors"
  
  problem_statement: |
    Kenyan retail investors face significant barriers:
    - Fragmented research across multiple platforms (8+ hours weekly)
    - Complex 5-7 day account opening process
    - High brokerage fees (1.5-2%) eating into returns
    - Lack of intelligent, data-driven investment tools
    - No unified platform for research → analysis → execution

  solution_summary: |
    Stock Soko integrates the entire investment journey into one mobile app:
    - AI-powered stock recommendations with 75% accuracy
    - Real-time NSE charts and trading data
    - One-click trading through integrated broker APIs
    - Automated portfolio management and tax calculations
    - Fractional share trading from KES 100

# TARGET AUDIENCE
target_audience:
  primary:
    - "Kenyan retail investors (25-45 years)"
    - "Tech-savvy individuals with KES 10K-500K investment capacity"
    - "Mobile-first users familiar with M-Pesa and digital apps"

  secondary:
    - "Diaspora investors interested in Kenyan markets"
    - "Investment clubs and SACCOs"
    - "Young professionals starting investment journeys"

  market_size:
    total_addressable_market: "500,000+ investors"
    serviceable_market: "200,000 active retail investors"
    growth_rate: "25% annually"

# CORE FEATURES
features:
  research_analytics:
    - "AI-powered stock recommendations (LSTM models)"
    - "Real-time NSE price charts with technical indicators"
    - "News sentiment analysis from local sources"
    - "Fundamental analysis with Kenyan-specific metrics"
    - "Corporate action alerts and dividend tracking"

  trading_execution:
    - "Integrated broker API connectivity"
    - "One-click buy/sell orders"
    - "Fractional share trading (KES 100 minimum)"
    - "Real-time order status updates"
    - "Multiple order types (market, limit, stop-loss)"

  portfolio_management:
    - "Automated portfolio tracking"
    - "Tax calculation and KRA reporting"
    - "Performance analytics and benchmarking"
    - "Alert system for price movements"
    - "Document storage and statement generation"

  user_experience:
    - "Mobile-first design optimized for African networks"
    - "Swahili and English language support"
    - "Offline functionality for poor connectivity"
    - "M-Pesa integration for deposits/withdrawals"
    - "Educational content and trading courses"

# TECHNOLOGY REQUIREMENTS
technology_stack:
  frontend:
    framework: "React Native"
    state_management: "Redux Toolkit"
    navigation: "React Navigation"
    charting: "React Native Charts Wrapper"
    payment_integration: "M-Pesa Daraja API"

  backend:
    language: "Python 3.9+"
    framework: "FastAPI"
    database_primary: "PostgreSQL"
    database_timeseries: "TimescaleDB"
    cache: "Redis"
    queue: "Celery with Redis"
    real_time: "WebSockets"

  ai_ml:
    machine_learning: "TensorFlow/Keras"
    natural_language: "spaCy + NLTK"
    data_processing: "Pandas + NumPy"
    forecasting: "LSTM Neural Networks"
    sentiment_analysis: "Custom Kenyan news corpus"

  infrastructure:
    cloud_provider: "AWS Africa (Nairobi)"
    containerization: "Docker"
    orchestration: "Kubernetes"
    monitoring: "Prometheus + Grafana"
    cdn: "CloudFront for static assets"

# API INTEGRATIONS
api_integrations:
  market_data:
    - "NSE Kenya Real-time Data Feed (MITCH)"
    - "NSE Delayed Data (15-minute fallback)"
    - "Central Bank of Kenya Exchange Rates"
    - "Yahoo Finance API (international stocks)"

  broker_apis:
    priority_1:
      - "Faida Investment Bank API"
      - "Dyer & Blair Trading API"
      - "Genghis Capital API"
    future:
      - "NCBA Investment Bank"
      - "ABC Capital"
      - "Sterling Capital"

  news_sources:
    - "Business Daily RSS Feeds"
    - "Nation Media API"
    - "Reuters Africa News"
    - "Twitter API for market sentiment"

  payment_processing:
    - "M-Pesa Daraja API"
    - "Stripe for international payments"
    - "Flutterwave for card processing"

# USER JOURNEY FLOW
user_journey:
  onboarding:
    - "Splash screen with value proposition"
    - "Risk assessment questionnaire"
    - "Broker selection and CDS account opening"
    - "M-Pesa verification and initial deposit"
    - "Educational walkthrough of features"

  daily_usage:
    - "Dashboard with portfolio overview"
    - "Market news and AI recommendations"
    - "Stock research with charts and analysis"
    - "One-click trading execution"
    - "Portfolio performance tracking"

  advanced_flows:
    - "Fractional share investment planning"
    - "Tax optimization suggestions"
    - "Corporate action participation"
    - "Investment club collaboration"

# MONETIZATION STRATEGY
monetization:
  revenue_streams:
    transaction_fees:
      description: "25-30% revenue share from broker commissions"
      model: "Per-trade percentage"
      projection_year1: "KES 1,125,000/month"
      projection_year3: "KES 4,500,000/month"

    subscriptions:
      tiers:
        basic: "Free (ad-supported)"
        pro: "KES 500/month (real-time data + basic alerts)"
        premium: "KES 1,500/month (AI insights + advanced features)"
      conversion_rate: "5% free to paid"
      projection_year1: "KES 1,250,000/month"

    broker_platform_fees:
      description: "White-label solutions for brokers"
      pricing: "KES 250,000-500,000/month per broker"
      target: "5 broker partners by year 2"

  pricing_strategy:
    customer_acquisition_cost: "KES 15 per user"
    lifetime_value: "KES 180 per user"
    payback_period: "3 months"

# DEVELOPMENT ROADMAP
development_roadmap:
  phase_1: "Months 1-3 - MVP Launch"
    deliverables:
      - "Basic React Native app with NSE data integration"
      - "Python backend with FastAPI"
      - "Integration with 1-2 broker APIs"
      - "Basic AI recommendation engine"
      - "M-Pesa payment integration"

  phase_2: "Months 4-9 - Feature Enhancement"
    deliverables:
      - "Advanced AI/ML models for predictions"
      - "Real-time trading with multiple brokers"
      - "Advanced charting and technical analysis"
      - "Portfolio management features"
      - "News sentiment analysis"

  phase_3: "Months 10-18 - Scale & Expand"
    deliverables:
      - "East African market expansion"
      - "Institutional product offerings"
      - "White-label broker solutions"
      - "Advanced analytics and reporting"

# SUCCESS METRICS
success_metrics:
  user_metrics:
    - "Monthly Active Users (MAU)"
    - "Daily Active Users (DAU)"
    - "User Retention Rate (30-day)"
    - "Session Duration"
    - "Feature Adoption Rate"

  business_metrics:
    - "Monthly Recurring Revenue (MRR)"
    - "Customer Acquisition Cost (CAC)"
    - "Lifetime Value (LTV)"
    - "Churn Rate"
    - "Average Revenue Per User (ARPU)"

  product_metrics:
    - "Order Execution Speed"
    - "AI Prediction Accuracy"
    - "App Crash Rate"
    - "API Response Time"
    - "User Satisfaction (NPS)"

# COMPLIANCE & SECURITY
compliance:
  regulatory:
    - "CMA licensing through broker partnerships"
    - "Data protection under Kenya Data Protection Act"
    - "Anti-money laundering (AML) compliance"
    - "Know Your Customer (KYC) verification"

  security:
    - "Bank-grade encryption (AES-256)"
    - "Two-factor authentication"
    - "Regular security audits"
    - "SOC 2 compliance target"
    - "Secure API key management"

# TEAM REQUIREMENTS
team_structure:
  phase_1:
    - "React Native Developer (2)"
    - "Python Backend Developer (2)"
    - "UI/UX Designer (1)"
    - "Product Manager (1)"

  phase_2:
    - "Data Scientist/AI Engineer (1)"
    - "DevOps Engineer (1)"
    - "Quality Assurance Engineer (1)"
    - "Business Development Manager (1)"

  phase_3:
    - "Mobile Developers (additional 2)"
    - "Backend Developers (additional 2)"
    - "Data Analyst (1)"
    - "Customer Support Team (3)"

# BUDGET & FUNDING
budget_requirements:
  seed_funding: "$500,000"
  allocation:
    product_development: "40% ($200,000)"
    growth_marketing: "30% ($150,000)"
    team_operations: "20% ($100,000)"
    contingency: "10% ($50,000)"

  runway: "18 months"
  profitability_target: "Month 15"

# RISK ASSESSMENT
risk_assessment:
  high_risk:
    - "Regulatory compliance with CMA"
    - "Broker partnership negotiations"
    - "Market data licensing costs"

  medium_risk:
    - "User adoption and retention"
    - "Technology scalability"
    - "Competitive response"

  mitigation_strategies:
    - "Early engagement with regulators"
    - "Multiple broker partnerships"
    - "Phased feature rollout"
    - "Continuous user feedback loops"

# EXIT STRATEGY
exit_strategy:
  potential_acquirers:
    - "International fintech companies expanding to Africa"
    - "African banks digitizing their offerings"
    - "Global financial data providers"
    - "Large brokerages looking for technology upgrade"

  timeline:
    series_a: "Year 2 - $3-5M valuation"
    series_b: "Year 3 - $10-15M valuation"
    exit: "Year 5-7 - Acquisition or IPO"

  comparable_exits:
    - "Paystack acquisition by Stripe: $200M"
    - "Flutterwave valuation: $3B+"
    - "Chipper Cash valuation: $2B+"

# INTELLECTUAL PROPERTY
intellectual_property:
  proprietary_assets:
    - "AI stock prediction algorithms"
    - "Kenyan market sentiment analysis models"
    - "Mobile trading platform codebase"
    - "Broker API integration framework"
    - "User interface design system"

  protection_strategy:
    - "Patent pending for AI algorithms"
    - "Trademark registration for brand"
    - "Source code copyright protection"
    - "Trade secret protection for data models"

---
# USAGE INSTRUCTIONS
usage_instructions: |
  This YAML specification serves as the single source of truth for the Stock Soko project.
  
  Development teams should reference this document for:
  - Feature prioritization and implementation
  - Technology stack decisions
  - API integration requirements
  - User experience guidelines
  
  Investors and stakeholders can use this document to understand:
  - Project scope and vision
  - Business model and revenue projections
  - Development timeline and milestones
  - Risk assessment and mitigation strategies

  This document should be updated regularly as the project evolves and new requirements emerge.

project:
  name: "Stock Soko - African Stock Trading Platform"
  description: |
    A mobile trading platform for African markets that allows users to explore stocks, view market data, and manage their investment portfolio.
    The mockup serves as the visual reference, and this YAML describes the full application specification for generation in Cursor AI or similar environments.

  tech_stack:
    - React Native (Expo)
    - TypeScript
    - React Navigation (stack + bottom tabs)
    - Redux Toolkit or Zustand for state management
    - Axios for API calls
    - Recharts / Victory Native for charts
    - Tailwind (NativeWind) for styling
    - AsyncStorage for local persistence
    - Firebase Authentication (placeholder)

  build_instructions: |
    1. Create Expo project: `npx create-expo-app stock-soko`
    2. Install dependencies:
       ```
       npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
       npm install react-native-safe-area-context react-native-screens react-native-svg react-native-reanimated
       npm install axios @reduxjs/toolkit react-redux victory-native nativewind
       ```
    3. Configure Tailwind (NativeWind) for styling.
    4. Implement screens as defined below.

  navigation:
    type: "BottomTabNavigation"
    tabs:
      - name: Home
        icon: "home"
      - name: Markets
        icon: "bar-chart-2"
      - name: Portfolio
        icon: "pie-chart"
      - name: News
        icon: "newspaper"
      - name: Profile
        icon: "user"

  screens:

    - name: SplashScreen
      description: |
        Shows app logo and tagline with a professional Nairobi skyline background.
        Automatically navigates to Onboarding after 2 seconds.
      code_snippet: |
        import React, { useEffect } from 'react';
        import { View, ImageBackground, Text } from 'react-native';

        export default function SplashScreen({ navigation }) {
          useEffect(() => {
            setTimeout(() => navigation.replace('Onboarding'), 2000);
          }, []);
          return (
            <ImageBackground
              source={require('../assets/nairobi-skyline.jpg')}
              className="flex-1 justify-center items-center bg-black"
            >
              <Text className="text-white text-4xl font-bold">Stock Soko</Text>
              <Text className="text-gray-300 mt-2">Empowering African Investors</Text>
            </ImageBackground>
          );
        }

    - name: Onboarding
      description: |
        Swipable screens introducing Stock Soko’s value:
        - Invest across African markets
        - Real-time data and insights
        - Simple and secure transactions
        Ends with “Get Started” button → Login/Register.
      code_snippet: |
        import React from 'react';
        import { View, Text, Button, ScrollView } from 'react-native';

        export default function Onboarding({ navigation }) {
          return (
            <ScrollView horizontal pagingEnabled>
              {['Invest Smart', 'Real-Time Insights', 'Secure Trading'].map((title, i) => (
                <View key={i} className="w-screen h-full justify-center items-center bg-gray-100">
                  <Text className="text-2xl font-bold mb-2">{title}</Text>
                  <Text className="text-gray-600 text-center px-6">
                    {title === 'Invest Smart'
                      ? 'Trade stocks seamlessly across African exchanges.'
                      : title === 'Real-Time Insights'
                      ? 'Access live data, charts, and market analysis.'
                      : 'Your data and transactions are protected by top-grade security.'}
                  </Text>
                  {i === 2 && (
                    <Button title="Get Started" onPress={() => navigation.navigate('Login')} />
                  )}
                </View>
              ))}
            </ScrollView>
          );
        }

    - name: Login
      description: |
        Allows users to log in with email/password or continue with Google.
      code_snippet: |
        import React, { useState } from 'react';
        import { View, TextInput, Button, Text } from 'react-native';

        export default function Login({ navigation }) {
          const [email, setEmail] = useState('');
          const [password, setPassword] = useState('');

          const handleLogin = () => navigation.replace('HomeTabs');

          return (
            <View className="flex-1 justify-center px-6 bg-white">
              <Text className="text-3xl font-bold mb-6">Welcome Back</Text>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="border p-3 mb-3 rounded" />
              <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} className="border p-3 mb-3 rounded" />
              <Button title="Login" onPress={handleLogin} />
              <Text className="text-center mt-4 text-blue-500" onPress={() => navigation.navigate('Register')}>
                Create Account
              </Text>
            </View>
          );
        }

    - name: Home
      description: |
        Shows key market summary, top movers, and featured African stocks.
      code_snippet: |
        import React from 'react';
        import { View, Text, ScrollView } from 'react-native';

        export default function Home() {
          const topMovers = [
            { symbol: 'NSE:KCB', change: '+3.2%' },
            { symbol: 'JSE:MTN', change: '-1.1%' },
          ];
          return (
            <ScrollView className="flex-1 p-4 bg-gray-50">
              <Text className="text-xl font-bold mb-4">Market Overview</Text>
              {topMovers.map((stock, i) => (
                <View key={i} className="flex-row justify-between bg-white p-3 rounded mb-2">
                  <Text>{stock.symbol}</Text>
                  <Text className={stock.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                    {stock.change}
                  </Text>
                </View>
              ))}
            </ScrollView>
          );
        }

    - name: Markets
      description: |
        Lists markets like NSE, JSE, and NGX with live data and charts.
      code_snippet: |
        import React from 'react';
        import { ScrollView, View, Text } from 'react-native';
        import { VictoryLine } from 'victory-native';

        export default function Markets() {
          const data = [{ x: 1, y: 120 }, { x: 2, y: 140 }, { x: 3, y: 130 }];
          return (
            <ScrollView className="p-4 bg-gray-100">
              <Text className="text-xl font-bold mb-4">Markets</Text>
              <View className="bg-white p-4 rounded">
                <Text className="font-semibold mb-2">Nairobi Securities Exchange</Text>
                <VictoryLine data={data} />
              </View>
            </ScrollView>
          );
        }

    - name: Portfolio
      description: |
        Displays user holdings, performance chart, and portfolio value.
      code_snippet: |
        import React from 'react';
        import { View, Text } from 'react-native';
        import { VictoryPie } from 'victory-native';

        export default function Portfolio() {
          const holdings = [
            { x: 'KCB', y: 40 },
            { x: 'Safaricom', y: 30 },
            { x: 'EABL', y: 30 },
          ];
          return (
            <View className="flex-1 justify-center items-center bg-white">
              <Text className="text-xl font-bold mb-4">Your Portfolio</Text>
              <VictoryPie data={holdings} colorScale={['#10b981', '#3b82f6', '#f59e0b']} />
            </View>
          );
        }

    - name: News
      description: |
        Aggregates African financial and stock market news from APIs.
      code_snippet: |
        import React, { useEffect, useState } from 'react';
        import { ScrollView, Text, View } from 'react-native';
        import axios from 'axios';

        export default function News() {
          const [articles, setArticles] = useState([]);
          useEffect(() => {
            axios.get('https://newsapi.org/v2/everything?q=africa+stocks&apiKey=demo')
              .then(res => setArticles(res.data.articles))
              .catch(console.error);
          }, []);
          return (
            <ScrollView className="p-4 bg-gray-50">
              {articles.map((a, i) => (
                <View key={i} className="mb-3 bg-white p-3 rounded">
                  <Text className="font-semibold">{a.title}</Text>
                  <Text className="text-gray-500 text-sm">{a.source?.name}</Text>
                </View>
              ))}
            </ScrollView>
          );
        }

    - name: Profile
      description: |
        User profile with settings and logout option.
      code_snippet: |
        import React from 'react';
        import { View, Text, Button } from 'react-native';

        export default function Profile({ navigation }) {
          return (
            <View className="flex-1 justify-center items-center bg-white">
              <Text className="text-xl mb-3 font-bold">User Profile</Text>
              <Button title="Logout" onPress={() => navigation.replace('Login')} />
            </View>
          );
        }

  future_enhancements:
    - Enable real API integration (NSE, JSE, NGX)
    - Add payment gateway for funding accounts
    - Include stock watchlist and alert notifications
    - Add AI-driven insights and portfolio optimization tools
```