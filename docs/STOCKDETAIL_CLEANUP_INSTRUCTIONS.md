# StockDetail Screen - Duplicate Removal & Reorganization

## Identified Duplicates

### 1. **P/E Ratio** - Appears 2x
- **Location 1**: Line ~568 in "Key Metrics" section
- **Location 2**: Line ~709 in "Profitability Metrics" section
- **Action**: Keep in Fundamentals section only, remove from Key Metrics

### 2. **Market Cap** - Appears 2x
- **Location 1**: Line ~576 in "Key Metrics" section  
- **Location 2**: Likely in another section
- **Action**: Keep in Overview section only

### 3. **ROE (Return on Equity)** - Appears 2x
- **Location 1**: Line ~668 in "Profitability Metrics" (detailed with formula)
- **Location 2**: Line ~934 in "Profitability Ratios" section
- **Action**: Consolidate into single "Profitability Analysis" section

### 4. **ROA (Return on Assets)** - Appears 2x
- **Location 1**: Line ~690 in "Profitability Metrics"
- **Location 2**: Line ~961 in "Profitability Ratios"
- **Action**: Consolidate into single section

### 5. **Company Profile** - Appears 2x
- **Location 1**: Line ~639 (within fundamentalsWrapper)
- **Location 2**: Line ~905 (separate profileCard)
- **Action**: Keep only one instance

## Proposed Clean Structure

```

 HEADER (Sticky)                     
 • Back | Stock Name | Watchlist     



 PRICE OVERVIEW                      
 • Symbol, Name                      
 • Current Price                     
 • Today's Change                    



 INTERACTIVE CHART                   
 • Price chart with indicators       
 • Timeframe selector                



 ORDER BOOK & TRADING                
 • Order depth visualization         
 • Quick trade controls              



 TAB NAVIGATION                      
 [Overview] [Fundamentals] [Risk] [AI]


 TAB 1: OVERVIEW 
 Company Profile                     
 • Sector, Industry                  
 • Employees, Founded                
                                     
 Quick Stats                         
 • Market Cap                        
 • EPS                               
 • Dividend Yield                    


 TAB 2: FUNDAMENTALS 
 Valuation Ratios                    
 • P/E Ratio (with interpretation)   
 • P/B Ratio                         
 • EV/EBITDA                         
                                     
 Profitability Metrics               
 • ROE (formula + rating)            
 • ROA (formula + rating)            
 • Profit Margin                     
 • Revenue Growth                    
                                     
 Historical Performance              
 • 4-Year Revenue Chart              
 • 4-Year Profit Chart               
 • Dividend History Chart            
                                     
 Market Context                      
 • Kenya Market Trend                
 • Global Market Impact              


 TAB 3: RISK & TECHNICAL 
 Risk Profile                        
 • Risk Rating Badge                 
 • Beta (with explanation)           
 • Volatility                        
 • Sharpe Ratio                      
 • Debt/Equity                       
                                     
 Technical Indicators                
 • RSI                               
 • MACD                              
 • Moving Averages                   
 • Volume Trends                     


 TAB 4: AI ANALYSIS 
 Recommendation Badge                
 • BUY / SELL / HOLD                 
 • Confidence %                      
 • Target Price                      
                                     
 Key Reasons                         
 • Bulleted list of reasoning        
                                     
 Technical Signals                   
 • Indicator summary table           
                                     
 Fundamental Factors                 
 • Positive factors list             
                                     
 Risk Considerations                 
 • Risk factors list                 
                                     
 Disclaimer                          

```

## Implementation Steps

### Step 1: Add Tab Navigation Component
```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'fundamentals' | 'risk' | 'ai'>('overview');
```

### Step 2: Consolidate Sections

**Remove These Duplicate Sections:**
1. Delete duplicate "Key Metrics" card (lines ~564-584)
2. Delete second "Company Profile" instance (lines ~902-923)
3. Delete duplicate "Profitability Ratios" (lines ~925-985)
4. Keep only one ROE display with full formula
5. Keep only one ROA display with full formula

**Organize Into Tabs:**
1. Move Company Profile + Quick Stats → Overview Tab
2. Move all Profitability + Historical → Fundamentals Tab
3. Move Risk Profile + Technical Indicators → Risk Tab
4. Keep AI Analysis as is → AI Tab

### Step 3: Remove Redundant Styling

Delete duplicate style definitions for:
- `profitabilityCard` (if duplicate of `fundamentalCard`)
- `ratioRow` (if duplicate of `metricRow`)
- `profileCard` (if duplicate of `fundamentalCard`)

### Step 4: Add Tab Styling

```typescript
tabContainer: {
  flexDirection: 'row',
  backgroundColor: colors.background.card,
  borderRadius: borderRadius.md,
  padding: spacing.xs,
  marginBottom: spacing.md,
},
tab: {
  flex: 1,
  paddingVertical: spacing.sm,
  alignItems: 'center',
  borderRadius: borderRadius.sm,
},
tabActive: {
  backgroundColor: colors.primary.main,
},
tabText: {
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
},
tabTextActive: {
  color: colors.primary.contrast,
  fontWeight: typography.fontWeight.semibold,
},
```

## Expected Outcome

### Before Cleanup:
- **Sections**: ~15 different sections scattered throughout
- **Duplicates**: 8+ repeated metrics/sections
- **Scroll Length**: Very long, difficult to find specific info
- **Organization**: Chaotic, no clear categorization

### After Cleanup:
- **Sections**: 4 clear tabs (Overview, Fundamentals, Risk, AI)
- **Duplicates**: 0 (all consolidated)
- **Navigation**: Easy tab switching
- **Organization**: Logical, category-based

## Metrics Consolidation Reference

| Metric | Keep In Section | Remove From |
|--------|----------------|-------------|
| P/E Ratio | Fundamentals Tab (Valuation) | Key Metrics card |
| Market Cap | Overview Tab (Quick Stats) | Duplicate location |
| EPS | Overview Tab (Quick Stats) | - |
| Dividend Yield | Overview Tab (Quick Stats) | - |
| ROE | Fundamentals Tab (Profitability) | Profitability Ratios duplicate |
| ROA | Fundamentals Tab (Profitability) | Profitability Ratios duplicate |
| Profit Margin | Fundamentals Tab (Profitability) | - |
| Revenue Growth | Fundamentals Tab (Profitability) | - |
| Beta | Risk Tab (Risk Profile) | - |
| Volatility | Risk Tab (Risk Profile) | - |
| Sharpe Ratio | Risk Tab (Risk Profile) | - |
| Debt/Equity | Risk Tab (Risk Profile) | - |

## Benefits of New Structure

1. **No Duplicates**: Each metric appears exactly once
2. **Easy Navigation**: Tab-based organization
3. **Logical Grouping**: Related metrics grouped together
4. **Better UX**: Less scrolling, faster access to info
5. **Cleaner Code**: Fewer lines, better maintainability
6. **Consistent Styling**: Unified design across tabs

## File Size Reduction

- **Before**: ~2400 lines
- **After**: ~1800 lines (25% reduction)
- **Duplicate Removals**: ~600 lines

