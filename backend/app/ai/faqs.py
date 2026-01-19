"""
Comprehensive FAQ System for Stock Trading Platform
Pre-defined answers for common questions
"""

import re
from typing import Dict, List, Optional


class FAQSystem:
    """FAQ system with pre-defined answers for common questions"""

    def __init__(self):
        self.faqs = self._initialize_faqs()
        self.quick_responses = self._initialize_quick_responses()
        self.educational_content = self._initialize_educational_content()

    def _initialize_faqs(self) -> List[Dict[str, str]]:
        """Initialize comprehensive FAQ database"""
        return [
            # Getting Started
            {
                "category": "Getting Started",
                "question": "How do I start trading stocks?",
                "keywords": ["start trading", "begin", "get started", "new investor"],
                "answer": """**Starting Your Trading Journey**

1. **Create Account**: Complete registration and KYC verification
2. **Deposit Funds**: Minimum KES 100 via M-Pesa
3. **Learn Basics**: Understand stock types, market hours, and fees
4. **Start Small**: Begin with blue-chip stocks (SCOM, KCB, EQTY)
5. **Diversify**: Don't put all eggs in one basket

**First Stock Recommendations**:
- Safaricom (SCOM) - Stable, liquid, good for beginners
- KCB Group (KCB) - Banking sector leader
- Equity Bank (EQTY) - Consistent performer

**Tips for Beginners**:
✓ Start with KES 5,000-10,000
✓ Invest only what you can afford to lose
✓ Focus on long-term (1-2 years minimum)
✓ Keep learning and stay patient

Ready to start? Click 'Markets' to explore available stocks!""",
            },
            {
                "category": "Getting Started",
                "question": "What is the minimum amount to invest?",
                "keywords": ["minimum", "how much", "start with"],
                "answer": """**Minimum Investment Requirements**

**Deposit**: KES 100 minimum via M-Pesa

**Stock Purchase**: Varies by stock price
- Safaricom (SCOM): ~KES 28.50 per share (min 100 shares = KES 2,850)
- KenGen (KEGN): ~KES 3.85 per share (min 100 shares = KES 385)
- Premium stocks: May require more capital

**Recommended Starting Amount**: KES 5,000 - 10,000
- Allows for diversification
- Covers trading fees
- Provides learning buffer

**Trading Fees**:
- Brokerage: 1.3% of transaction value
- NSE Fee: 0.12%
- CDS Fee: 0.06%
- Total: ~1.5% per trade

**Pro Tip**: Start small, learn the platform, then gradually increase investment as you gain confidence.""",
            },
            {
                "category": "Getting Started",
                "question": "How long does it take to see returns?",
                "keywords": ["how long", "returns", "profit", "when"],
                "answer": """**Investment Timeline & Returns**

**Short-term (1-3 months)**:
- Day trading: Possible but risky
- Quick gains: 5-15% possible in bull markets
- Risk: High volatility
- Not recommended for beginners

**Medium-term (6-12 months)**:
- Reasonable expectation: 10-20% returns
- Dividend income: 2-4 payments per year
- Risk: Moderate
- Better for learning

**Long-term (2+ years)**:
- Historical NSE returns: 15-25% annually
- Compound growth advantage
- Risk: Lower
- **Recommended for most investors**

**Example** (KES 10,000 investment):
- 1 year @ 15%: KES 11,500
- 3 years @ 15%: KES 15,200
- 5 years @ 15%: KES 20,100

**Important**: Past performance doesn't guarantee future results. Market timing is difficult - focus on time IN the market, not timing the market.

**Reality Check**: Some months you'll gain, some you'll lose. Patience is key!""",
            },
            # Stock Market Basics
            {
                "category": "Market Basics",
                "question": "What is P/E ratio and why is it important?",
                "keywords": ["p/e ratio", "pe ratio", "price earnings"],
                "answer": """**P/E Ratio (Price-to-Earnings) Explained**

**Definition**: Shows how much investors pay for each shilling of profit

**Formula**: 
```
P/E Ratio = Stock Price ÷ Earnings Per Share (EPS)
```

**Example**:
- KCB trades at KES 38.25
- Earnings per share: KES 9.10
- P/E Ratio = 38.25 ÷ 9.10 = 4.2x

**Interpretation**:

**Low P/E (below 8)**:
✓ Potentially undervalued
✓ May indicate value opportunity
✗ Could signal problems or slow growth

**Medium P/E (8-15)**:
✓ Fair valuation for NSE stocks
✓ Average for Kenyan market
✓ Generally safe range

**High P/E (above 20)**:
✗ Potentially overvalued
✗ High growth expectations priced in
✓ May be growth stocks

**NSE Average**: 8-12

**Important**: 
- Compare P/E within same sector
- KCB (4.2) vs EQTY (5.8) - both banks
- Don't compare banks to breweries

**Real Example**:
- Safaricom P/E: 12.8 (fair value, growth priced in)
- KCB P/E: 4.2 (undervalued or concerns?)
- BAT P/E: 8.5 (declining sector, dividend play)

Want to see P/E ratios for all stocks? Check the Markets page!""",
            },
            {
                "category": "Market Basics",
                "question": "What is dividend yield?",
                "keywords": ["dividend", "yield", "income"],
                "answer": """**Dividend Yield Explained**

**Definition**: Annual dividend income as % of stock price

**Formula**:
```
Dividend Yield = (Annual Dividend ÷ Stock Price) × 100
```

**Example** (Safaricom):
- Annual dividend: KES 1.65 per share
- Stock price: KES 28.50
- Yield = (1.65 ÷ 28.50) × 100 = 5.8%

**What It Means**:
For every KES 100 invested, you get KES 5.80 per year in dividends

**Yield Ranges on NSE**:

**High Yield (7%+)**:
- Examples: BAT (8.5%), SCBK (7.0%)
- Good for income investors
- Check if sustainable

**Medium Yield (4-7%)**:
- Examples: SCOM (5.8%), EQTY (6.5%)
- Balanced growth + income
- Most reliable

**Low Yield (0-4%)**:
- Examples: Growth stocks
- Reinvesting in business
- Focus on capital gains

**Dividend Payment Schedule**:
- **Interim** (Mid-year): August-September
- **Final** (Year-end): March-April
- **Ex-dividend date**: Must own shares before this
- **Payment date**: When you receive money

**Top Dividend Stocks**:
1. BAT Kenya: 8.5%
2. Total Energies: 8.5%
3. Kenya Re: 7.5%
4. Standard Chartered: 7.0%
5. Equity Bank: 6.5%

**Pro Tip**: High yield isn't always good - check if company can sustain it. Declining business with high yield is a red flag!

**Tax**: 5% withholding tax on dividends""",
            },
            {
                "category": "Market Basics",
                "question": "What is market cap and why does it matter?",
                "keywords": ["market cap", "capitalization", "size"],
                "answer": """**Market Capitalization (Market Cap) Explained**

**Definition**: Total value of all company shares

**Formula**:
```
Market Cap = Share Price × Total Shares Outstanding
```

**Example** (Safaricom):
- Price: KES 28.50
- Shares: 40 billion
- Market Cap: KES 1.14 trillion

**Categories**:

**Large Cap (KES 50B+)**:
- Examples: SCOM, EQTY, KCB, EABL
- Characteristics:
  ✓ Stable, established companies
  ✓ Lower risk
  ✓ Good liquidity
  ✓ Slower growth
- Best for: Conservative investors, beginners

**Mid Cap (KES 10B-50B)**:
- Examples: NCBA, DTBK, SBIC
- Characteristics:
  ✓ Growth potential
  ✓ Moderate risk
  ✓ Decent liquidity
- Best for: Balanced portfolios

**Small Cap (Below KES 10B)**:
- Examples: TOTL, TPSE, KAPC
- Characteristics:
  ✓ High growth potential
  ✗ Higher risk
  ✗ Lower liquidity
  ✗ More volatile
- Best for: Aggressive investors

**NSE Top 5 by Market Cap**:
1. Safaricom: KES 1.14T
2. Equity Group: KES 173B
3. KCB Group: KES 151B
4. EABL: KES 142B
5. BAT Kenya: KES 85B

**Why It Matters**:
- Shows company size and stability
- Affects liquidity (ease of buying/selling)
- Influences volatility
- Determines index inclusion (NSE 20)

**Portfolio Strategy**:
- 60% Large cap (stability)
- 30% Mid cap (growth)
- 10% Small cap (high risk/reward)

**Pro Tip**: Bigger isn't always better, but it's usually safer!""",
            },
            # Trading & Orders
            {
                "category": "Trading",
                "question": "What's the difference between market and limit orders?",
                "keywords": ["market order", "limit order", "order types"],
                "answer": """**Market Order vs Limit Order**

**Market Order**:
📍 **What**: Buy/sell immediately at current price
⚡ **Speed**: Executes instantly
💰 **Price**: Get whatever price is available
✓ **Use when**: You want to enter/exit NOW
✗ **Risk**: Price might move before execution

**Example**:
- SCOM trading at KES 28.50
- You place market buy order
- May execute at KES 28.50, 28.55, or 28.45
- Depends on available sellers

**Limit Order**:
📍 **What**: Buy/sell only at your specified price or better
⏳ **Speed**: May take time or never execute
💰 **Price**: You control exact price
✓ **Use when**: You have target entry/exit price
✗ **Risk**: Might miss the opportunity

**Example**:
- SCOM trading at KES 28.50
- You set limit buy at KES 28.00
- Order sits until price drops to 28.00
- If it doesn't drop, order stays open

**Which to Use?**

**Use Market Order**:
✓ Liquid stocks (SCOM, KCB, EQTY)
✓ Normal market hours
✓ Need to execute quickly
✓ Small price movements acceptable

**Use Limit Order**:
✓ Illiquid stocks (low volume)
✓ You have target price
✓ Volatile market conditions
✓ Patient investor
✓ Buying dips / selling rallies

**Pro Strategy**:
```
Stock at KES 30:
- Want to buy at KES 28 (limit)
- If breaks KES 32 (market buy)
- Stop loss at KES 26 (limit sell)
```

**NSE Note**: Orders expire end of day if not filled. You can place again next day.

**Our Recommendation**: Start with market orders on liquid stocks, graduate to limit orders as you learn.

Want to place your first order? Head to Markets → Select Stock → Trade!""",
            },
            {
                "category": "Trading",
                "question": "What are the trading hours for NSE?",
                "keywords": ["trading hours", "market hours", "when", "time"],
                "answer": """**NSE Trading Hours**

**Regular Trading**:
🕐 **Open**: 9:00 AM EAT
🕒 **Close**: 3:00 PM EAT
📅 **Days**: Monday - Friday

**Pre-Open Session**:
🕘 8:00 AM - 9:00 AM
- Order placement only
- No execution
- Good for setting opening orders

**Trading Breaks**:
🕛 No lunch break
- Continuous trading 9 AM - 3 PM

**Market Closed**:
❌ Weekends (Saturday-Sunday)
❌ Public Holidays
❌ Special closures (announced)

**Kenyan Public Holidays 2025**:
- New Year: Jan 1
- Good Friday: Apr 18
- Easter Monday: Apr 21
- Labour Day: May 1
- Madaraka Day: June 1
- Eid al-Fitr: Mar 31 (varies)
- Mashujaa Day: Oct 20
- Jamhuri Day: Dec 12
- Christmas: Dec 25
- Boxing Day: Dec 26

**Best Trading Times**:

**9:00-10:00 AM**:
- Highest volume
- Most volatile
- Good for active traders

**10:00 AM-2:00 PM**:
- Steady trading
- Good for placing orders
- More predictable

**2:00-3:00 PM**:
- Late activity
- Position adjustments
- Settlement orders

**Order Validity**:
- Day orders: Expire at 3 PM
- Can resubmit next trading day
- No overnight orders

**After Hours**:
- Can view prices/charts
- Cannot place orders
- Use time for research

**Time Zone**: East Africa Time (EAT = UTC+3)

**Pro Tip**: Place limit orders in pre-open (8-9 AM) to catch opening price movements!

**Settlement**: T+3 (trade + 3 business days)""",
            },
            {
                "category": "Trading",
                "question": "What fees do I pay when trading?",
                "keywords": ["fees", "charges", "cost", "commission"],
                "answer": """**NSE Trading Fees Breakdown**

**For Each Trade** (Buy OR Sell):

1. **Brokerage Fee**: 1.3% (negotiable)
2. **NSE Fee**: 0.12%
3. **CDS Fee**: 0.06%
4. **CDSC Fee**: 0.03%
5. **Stamp Duty**: 0.01% (sell only)

**Total Cost**: ~1.5% per trade

**Example Trade** (KES 10,000):
```
Buy Order:
Stock Value:      KES 10,000.00
Brokerage (1.3%): KES    130.00
NSE (0.12%):      KES     12.00
CDS (0.06%):      KES      6.00
CDSC (0.03%):     KES      3.00
─────────────────────────────────
Total Debit:      KES 10,151.00

Sell Order:
Stock Value:      KES 10,000.00
Brokerage (1.3%): KES    130.00
NSE (0.12%):      KES     12.00
CDS (0.06%):      KES      6.00
CDSC (0.03%):     KES      3.00
Stamp Duty (0.01%): KES    1.00
─────────────────────────────────
Total Credit:     KES  9,848.00
```

**Round Trip Cost**: 3% (buy + sell)
**Break-Even**: Need 3%+ gain to profit

**Other Fees**:

**Dividend Income**:
- Withholding Tax: 5%
- Example: KES 1,000 dividend = KES 950 paid

**Account Maintenance**:
- Monthly: KES 0 (no maintenance fee)
- CDS Levy: KES 50/year (auto-deducted)

**Deposit/Withdrawal**:
- M-Pesa Deposit: Free
- M-Pesa Withdrawal: ~1% M-Pesa charges
- Minimum: KES 100

**Fee Comparison**:

**Small Trades** (KES 1,000):
- Fees: KES 15
- % Cost: 1.5%
- High relative cost

**Medium Trades** (KES 10,000):
- Fees: KES 151
- % Cost: 1.5%
- Standard

**Large Trades** (KES 100,000):
- Fees: KES 1,510
- % Cost: 1.5%
- Same % but more absolute

**Tips to Reduce Costs**:

1. **Trade Less Often**
   - Long-term beats frequent trading
   - Each trade = 1.5%

2. **Larger Trades**
   - Avoid multiple small trades
   - Bundle purchases

3. **Hold for Dividends**
   - 5% dividend - 0.25% tax = 4.75% net
   - Beats short-term trading

4. **Plan Entries/Exits**
   - Don't panic sell
   - Have strategy

**Fee Calculator**:
Visit Markets → Select Stock → See fee breakdown before confirming

**Pro Tip**: Frequent trading kills returns! Aim for 2-4 trades per month maximum.""",
            },
            # Stock Analysis
            {
                "category": "Analysis",
                "question": "How do I analyze if a stock is good to buy?",
                "keywords": ["analyze", "research", "evaluate", "good stock"],
                "answer": """**Stock Analysis Framework**

**1. FUNDAMENTAL ANALYSIS** (Company Health)

**Key Metrics to Check**:

✓ **P/E Ratio** (Below 12 = good for NSE)
  - Shows if stock is cheap/expensive
  - Compare within sector

✓ **ROE** (Above 15% = good)
  - Return on Equity
  - Profitability indicator

✓ **Profit Margin** (Above 15% = healthy)
  - How much profit from sales
  - Higher = better

✓ **Debt/Equity** (Below 0.5 = safe)
  - How much debt vs equity
  - Lower = less risk

✓ **Dividend Yield** (5%+ = good income)
  - Annual dividend income
  - Steady is important

**2. TECHNICAL ANALYSIS** (Price Movement)

✓ **Price Trend**
  - Uptrend = Series of higher highs
  - Downtrend = Series of lower lows
  - Sideways = Ranging

✓ **Volume**
  - High volume = More interest
  - Low volume = Risky

✓ **Support/Resistance**
  - Support = Price floor
  - Resistance = Price ceiling

**3. QUALITATIVE FACTORS**

✓ **Business Model**
  - Do you understand it?
  - Is it sustainable?

✓ **Management**
  - Track record
  - Governance

✓ **Competitive Position**
  - Market leader?
  - Unique advantages?

✓ **Growth Prospects**
  - Expanding markets?
  - New products?

**4. SECTOR ANALYSIS**

✓ **Industry Trends**
  - Growing or declining?
  - Regulatory changes?

✓ **Economic Factors**
  - Interest rates
  - Currency
  - GDP growth

**SIMPLE 5-STEP CHECK**:

**Step 1**: Check P/E Ratio
- Below 10 = Cheap
- 10-15 = Fair
- Above 20 = Expensive

**Step 2**: Check Profitability
- ROE above 15%
- Consistent profits

**Step 3**: Check Debt
- Low debt/equity
- Can handle downturns

**Step 4**: Check Trend
- Price going up?
- Breaking resistance?

**Step 5**: Check Sector
- Industry doing well?
- Future growth?

**EXAMPLE ANALYSIS**: Safaricom (SCOM)

✓ P/E: 12.8 (Fair value)
✓ ROE: 32.5% (Excellent)
✓ Profit Margin: 31.2% (Strong)
✓ Debt/Equity: 0.35 (Healthy)
✓ Dividend: 5.8% (Good)
✓ Trend: Upward
✓ Volume: Very high
✓ Business: Telecom + M-Pesa (Strong)
✓ Position: Market leader 65%+
✓ Sector: Growing digital payments

**Verdict**: BUY (Strong fundamentals, good value)

**WHERE TO FIND DATA**:
- Our app: Markets → Stock Detail
- NSE website: www.nse.co.ke
- Company reports: Annual/Quarterly
- News: Business Daily, Nation

**RED FLAGS** (Avoid):

❌ Declining revenue for 2+ quarters
❌ Very high P/E (30+) without growth
❌ Debt/Equity above 1.5
❌ Negative ROE
❌ No dividends + no growth
❌ Management scandals
❌ Declining market share

**GREEN FLAGS** (Consider):

✓ Growing revenue 10%+ yearly
✓ Low P/E (5-10) with profits
✓ ROE above 20%
✓ Consistent dividends
✓ Strong cash flow
✓ Market leader
✓ New growth opportunities

**BEGINNER'S SHORTCUT**:

Focus on these 5 stocks (well analyzed, safe):
1. Safaricom (SCOM) - Telecom leader
2. Equity Bank (EQTY) - Banking leader
3. KCB Group (KCB) - Value play
4. EABL - Consumer staple
5. Standard Chartered (SCBK) - Quality bank

Want detailed analysis on any stock? Just ask "Analyze [STOCK]" or check Markets page!""",
            },
            # Risk Management
            {
                "category": "Risk",
                "question": "How do I manage risk when investing?",
                "keywords": ["risk", "risk management", "protect", "safe"],
                "answer": """**Risk Management Strategies**

**1. DIVERSIFICATION** (Don't Put All Eggs in One Basket)

**By Sector**:
```
Banking:     30% (KCB, EQTY, NCBA)
Telecom:     20% (SCOM)
Consumer:    20% (EABL)
Utilities:   15% (KEGN)
Others:      15% (Mixed)
```

**By Market Cap**:
- Large cap: 60% (Safe, stable)
- Mid cap: 30% (Growth)
- Small cap: 10% (High risk/reward)

**By Stock Count**:
- Minimum: 5 stocks
- Optimal: 8-12 stocks
- Maximum: 20 stocks (too many)

**2. POSITION SIZING** (How Much Per Stock)

**Rule**: No more than 10-15% in any single stock

**Example** (KES 50,000 portfolio):
```
SCOM:  KES 7,500  (15%)
EQTY:  KES 7,500  (15%)
KCB:   KES 6,000  (12%)
EABL:  KES 5,000  (10%)
NCBA:  KES 5,000  (10%)
Others: KES 19,000 (38%)
```

**3. STOP LOSS** (Know When to Exit)

**What**: Automatic sell if price drops to level

**How to Set**:
- Conservative: 5-7% below buy price
- Moderate: 10-12% below
- Aggressive: 15-20% below

**Example**:
```
Buy SCOM at KES 30
Stop Loss at KES 27 (10% down)
If drops to 27, sell automatically
Limits loss to 10%
```

**4. TAKE PROFIT** (Lock in Gains)

**Strategy**:
- Target 1: Sell 30% at +15%
- Target 2: Sell 30% at +25%
- Target 3: Let 40% ride

**Example** (1000 shares @ KES 30):
```
Price hits KES 34.50 (+15%)
→ Sell 300 shares
→ Lock KES 1,350 profit
→ Keep 700 shares for more upside
```

**5. PORTFOLIO REBALANCING**

**When**: Every 3-6 months

**How**:
- Sell winners that grew too large
- Buy losers that shrunk
- Maintain target allocation

**6. DON'T INVEST WHAT YOU CAN'T LOSE**

**Smart Allocation**:
```
Emergency Fund: 6 months expenses
Short-term needs: Savings account
Medium-term: Bonds/fixed
Long-term: Stocks ← Invest here
```

**7. AVOID THESE RISKS**:

❌ **Emotional Trading**
- Don't panic sell in red days
- Don't FOMO buy in green days
- Stick to plan

❌ **Overtrading**
- Fees eat returns
- More trades = more risk
- Be patient

❌ **Margin/Debt**
- Don't borrow to invest
- No loans for stocks
- Use only your money

❌ **All-in on One Stock**
- Even Safaricom can fall
- Diversify always

❌ **Ignoring News**
- Stay informed
- Read quarterly reports
- Monitor sector trends

**8. RISK ASSESSMENT BY STOCK**

**Low Risk** (Suitable for all):
- Safaricom (SCOM): 2.5/10
- Standard Chartered (SCBK): 2.5/10
- Equity Bank (EQTY): 3.5/10

**Medium Risk** (Experienced):
- KCB Group: 3.0/10
- EABL: 2.8/10
- Co-op Bank: 3.2/10

**High Risk** (Aggressive only):
- Kenya Power (KPLC): 8.5/10
- Bamburi (BAMB): 5.5/10
- Small caps: 6-8/10

**9. EMERGENCY EXIT PLAN**

**Sell immediately if**:
- Company fraud discovered
- Major litigation
- Regulatory ban
- Bankruptcy risk

**10. REVIEW & ADJUST**

**Monthly**:
- Check portfolio value
- Review news

**Quarterly**:
- Read company results
- Rebalance if needed

**Yearly**:
- Full portfolio review
- Adjust strategy

**RISK RULES SUMMARY**:

✓ Diversify across 8-12 stocks
✓ Max 15% per stock
✓ Set 10% stop losses
✓ Take profits at +15%, +25%
✓ Rebalance every 6 months
✓ Only invest spare money
✓ Stay informed
✓ Be patient
✓ Don't panic
✓ Learn continuously

**REMEMBER**: 
- Risk and reward go together
- Higher returns = Higher risk
- Slow and steady wins
- Preservation > quick gains

**Your Risk Tolerance**:
- Conservative: Large cap, dividends
- Moderate: Mix of blue chips + growth
- Aggressive: Small caps, growth stocks

Want help assessing your risk tolerance? Ask "What's my risk profile?""",
            },
            # M-Pesa & Payments
            {
                "category": "Payments",
                "question": "How do I deposit money via M-Pesa?",
                "keywords": ["mpesa", "deposit", "add money", "fund"],
                "answer": """**M-Pesa Deposit Guide**

**METHOD 1: In-App Deposit** (Recommended)

**Step 1**: Open Stock Soko app
**Step 2**: Go to Wallet → Deposit
**Step 3**: Enter amount (Min: KES 100)
**Step 4**: Click "Deposit via M-Pesa"
**Step 5**: Enter M-Pesa PIN on your phone
**Step 6**: Confirm transaction
**Step 7**: Money appears in wallet (instant)

**METHOD 2: M-Pesa Menu**

**Step 1**: Open M-Pesa menu
**Step 2**: Select Lipa na M-Pesa
**Step 3**: Select Pay Bill
**Step 4**: Enter Business Number: **888888**
**Step 5**: Enter Account: Your email or phone
**Step 6**: Enter amount
**Step 7**: Enter PIN
**Step 8**: Wait for confirmation

**DETAILS**:

**Limits**:
- Minimum: KES 100
- Maximum: KES 150,000/day (M-Pesa limit)
- No limit on frequency

**Fees**:
- Deposit: FREE (we cover M-Pesa charges)
- Processing time: Instant

**Business Details**:
```
Name: Stock Soko
Paybill: 888888
Account: Your registered email/phone
```

**WITHDRAWAL**:

**Step 1**: Go to Wallet → Withdraw
**Step 2**: Enter amount (Min: KES 100)
**Step 3**: Click "Withdraw to M-Pesa"
**Step 4**: Confirm request
**Step 5**: Money sent to M-Pesa (1-5 minutes)

**Withdrawal Fees**:
- M-Pesa charges apply (KES 30-150)
- Processing: 1-5 minutes
- Available: 24/7

**IMPORTANT NOTES**:

✓ **Instant Deposits**: Money available immediately
✓ **Safe & Secure**: Bank-grade encryption
✓ **24/7 Available**: Deposit anytime
✓ **No Hidden Fees**: What you deposit = what you get

❌ **Common Issues**:

**"Transaction Failed"**:
- Check M-Pesa balance
- Ensure PIN is correct
- Check network connection
- Wait 30 seconds, try again

**"Money Deducted But Not Credited"**:
- Wait 15 minutes
- Check transaction history
- Contact support with M-Pesa code
- We'll resolve within 24 hours

**"Withdrawal Delayed"**:
- Normal: Up to 5 minutes
- Check M-Pesa messages
- Contact support if >1 hour

**TRANSACTION HISTORY**:
- View all deposits/withdrawals
- In Wallet → Transaction History
- Download statements

**SECURITY TIPS**:

✓ Never share M-Pesa PIN
✓ Verify paybill number (888888)
✓ Keep confirmation messages
✓ Use secure network
✓ Enable app fingerprint lock

**SUPPORT**:
Issue with M-Pesa? 
- In-app: Profile → Support
- WhatsApp: +254 700 000 000
- Email: support@stocksoko.com
- Response: Within 2 hours

**READY TO DEPOSIT?**
Go to Wallet → Deposit → Enter Amount → Confirm!

First deposit bonus: Trade fee discount on first 3 trades!""",
            },
            # Dividends
            {
                "category": "Dividends",
                "question": "When do I get paid dividends?",
                "keywords": ["dividend", "payment", "when paid"],
                "answer": """**Dividend Payment Guide**

**WHAT ARE DIVIDENDS?**
Share of company profits paid to shareholders

**PAYMENT SCHEDULE** (Most NSE companies):

**Interim Dividend**:
📅 **Announcement**: July-August
📅 **Ex-Dividend Date**: August
📅 **Payment**: September

**Final Dividend**:
📅 **Announcement**: February-March
📅 **Ex-Dividend Date**: March
📅 **Payment**: April-May

**KEY DATES EXPLAINED**:

**1. Declaration Date**:
- Board announces dividend
- Example: "KES 2.50 per share"

**2. Ex-Dividend Date** (MOST IMPORTANT):
- Must own shares BEFORE this date
- Buy 1 day before to qualify
- Example: Ex-div = March 15, buy by March 14

**3. Record Date**:
- Company checks shareholder list
- Usually 1-2 days after ex-div

**4. Payment Date**:
- Money hits your account
- Usually 2-4 weeks after record date
- Paid to M-Pesa or bank

**EXAMPLE TIMELINE**:
```
Feb 28: Announcement (KES 2.50/share)
Mar 15: Ex-Dividend Date ← Buy before this
Mar 17: Record Date
Apr 10: Payment Date ← Money received
```

**HOW MUCH WILL I GET?**

**Formula**:
```
Dividend Payment = Shares Owned × Dividend Per Share
```

**Example**:
- You own: 1,000 SCOM shares
- Dividend: KES 1.65 per share
- Gross: 1,000 × 1.65 = KES 1,650
- Tax (5%): KES 82.50
- Net: KES 1,567.50 (what you receive)

**TAX**:
- Withholding tax: 5%
- Automatic deduction
- No action needed from you

**TOP DIVIDEND PAYERS** (2024):

1. **BAT Kenya**: 8.5% yield
   - KES 36.00 per share
   - 2 payments/year

2. **Total Energies**: 8.5% yield
   - KES 0.75 per share
   - 2 payments/year

3. **Kenya Re**: 7.5% yield
   - KES 0.20 per share
   - 2 payments/year

4. **Standard Chartered**: 7.0% yield
   - KES 10.00 per share
   - 2 payments/year

5. **Equity Bank**: 6.5% yield
   - KES 3.00 per share
   - 2 payments/year

**PAYMENT METHOD**:

**Option 1**: M-Pesa (Instant)
- Recommended
- Free
- Same day

**Option 2**: Bank Transfer
- Takes 1-3 days
- Must link bank

**DIVIDEND REINVESTMENT**:

**Manual Reinvestment**:
- Receive cash dividend
- Use to buy more shares
- Compounds returns

**Example** (10 years):
```
Initial: 1,000 shares @ KES 30
Dividend: KES 1.50/year (5%)

Without Reinvestment:
→ 10 years: KES 15,000 dividends
→ Total: KES 30,000 + KES 15,000 = KES 45,000

With Reinvestment:
→ 10 years: KES 24,350 dividends
→ 1,490 total shares
→ Total value: KES 63,000 (40% more!)
```

**DIVIDEND ARISTOCRATS** (Consistent payers):

✓ Safaricom: 14 years increasing
✓ Equity Bank: 18 years paying
✓ KCB: 20+ years paying
✓ EABL: 25+ years paying

**DIVIDEND WARNINGS**:

❌ **Dividend Cuts**:
- Company struggling
- Preserving cash
- Check quarterly results

❌ **Unsustainable Yields** (10%+):
- May signal trouble
- Check if affordable
- Payout ratio >80% risky

✓ **Healthy Signs**:
- Payout ratio 40-60%
- Growing dividends
- Strong cash flow
- Profitable company

**2025 DIVIDEND CALENDAR** (Estimated):

**Q1 (Jan-Mar)**:
- Most final dividends paid

**Q2 (Apr-Jun)**:
- AGMs held
- Next dividends declared

**Q3 (Jul-Sep)**:
- Interim dividends paid

**Q4 (Oct-Dec)**:
- Year-end preparations
- Final dividend announcements

**TRACKING DIVIDENDS**:

**In-App**:
- Portfolio → Dividend Tracker
- Upcoming payments
- Payment history
- Yield calculator

**HOW TO QUALIFY**:

1. Buy shares before ex-div date
2. Hold through record date
3. Can sell after ex-div (still get dividend)
4. Payment automatic 2-4 weeks later

**EXAMPLE STRATEGY**:

**Income Portfolio** (KES 100,000):
```
SCBK:  KES 20,000 × 7.0% = KES 1,400/year
EQTY:  KES 20,000 × 6.5% = KES 1,300/year
SCOM:  KES 20,000 × 5.8% = KES 1,160/year
KRRE:  KES 20,000 × 7.5% = KES 1,500/year
BAT:   KES 20,000 × 8.5% = KES 1,700/year

Total: KES 7,060/year (7.06% yield)
Monthly: KES 588
After tax: KES 6,707/year
```

**PRO TIPS**:

✓ Reinvest small dividends
✓ Track ex-div dates
✓ Focus on dividend growth, not just yield
✓ Check payout ratio
✓ Diversify dividend stocks

**COMMON QUESTIONS**:

**Q**: Do I get dividends if I bought yesterday?
**A**: Only if before ex-dividend date

**Q**: What if company doesn't pay dividend?
**A**: No payment - growth stock strategy

**Q**: Can dividend be reduced?
**A**: Yes, based on company performance

**Q**: How often are dividends paid?
**A**: Usually twice a year (interim + final)

Want to see upcoming dividends? Check Portfolio → Dividend Tracker!""",
            },
        ]

    def _initialize_quick_responses(self) -> Dict[str, str]:
        """Initialize quick responses for common queries"""
        return {
            "hello": "Hi! 👋 I'm your AI trading assistant. I can help with stock analysis, market insights, trading strategies, and learning. What would you like to know?",
            "help": "I can assist you with:\n\n📊 Stock Analysis & Recommendations\n📈 Market Trends & Insights\n💡 Investment Strategies\n📚 Learning Trading Concepts\n💰 Portfolio Management\n\nWhat specific topic interests you?",
            "thanks": "You're welcome! Happy to help. Feel free to ask anytime you need assistance with your investments. Good luck! 📈",
            "bye": "Goodbye! Remember to review your portfolio regularly and stay informed. Happy investing! 🚀",
        }

    def _initialize_educational_content(self) -> Dict[str, str]:
        """Initialize educational content for common topics"""
        return {
            "diversification": """**Diversification Strategy**

**What**: Spreading investments across different stocks/sectors to reduce risk

**Why**: "Don't put all eggs in one basket"
- If one stock falls, others may rise
- Reduces portfolio volatility
- Balances risk-reward

**How to Diversify**:

1. **By Sector**:
   - Banking: 30%
   - Telecom: 20%
   - Consumer goods: 20%
   - Utilities: 15%
   - Others: 15%

2. **By Risk**:
   - Low risk: 50% (SCOM, SCBK)
   - Medium risk: 35% (KCB, EQTY)
   - High risk: 15% (growth stocks)

3. **By Size**:
   - Large cap: 60%
   - Mid cap: 30%
   - Small cap: 10%

**Example Portfolio (KES 50,000)**:
- SCOM: KES 10,000 (Telecom)
- EQTY: KES 8,000 (Banking)
- KCB: KES 7,000 (Banking)
- EABL: KES 8,000 (Consumer)
- KEGN: KES 7,000 (Utilities)
- NCBA: KES 5,000 (Banking)
- KAPC: KES 5,000 (Agriculture)

**Benefits**:
✓ Reduces risk by 40-60%
✓ More stable returns
✓ Sleep better at night

**Optimal**: 8-12 different stocks across 4-5 sectors""",
            "market_timing": """**Market Timing: Truth vs Myth**

**The Myth**:
"Buy at the bottom, sell at the top"

**The Reality**:
Nobody can consistently predict market movements

**Why It's Hard**:
- Markets are unpredictable
- Emotions cloud judgment
- News is already priced in
- Professionals also fail

**Better Approach: Dollar-Cost Averaging**

**What**: Invest fixed amount regularly regardless of price

**Example**:
Instead of KES 12,000 once:
- Month 1: KES 1,000 @ KES 30 = 33 shares
- Month 2: KES 1,000 @ KES 28 = 36 shares
- Month 3: KES 1,000 @ KES 32 = 31 shares
- ...
- Month 12: 400 shares @ KES 30 average

**Benefits**:
✓ Removes emotion
✓ Averages entry price
✓ Disciplined approach
✓ Less stressful

**Golden Rule**:
"Time IN the market beats TIMING the market"

**Research Shows**:
- Missing best 10 days: -50% returns
- Staying invested: 100% returns
- Perfect timing: +5% only

**Focus On**:
✓ Long-term trends (2+ years)
✓ Company fundamentals
✓ Regular investing
✓ Patience

**Avoid**:
❌ Daily trading
❌ Panic selling
❌ FOMO buying
❌ Following tips""",
        }

    def find_answer(self, question: str) -> Optional[Dict[str, str]]:
        """Find best matching FAQ answer"""
        question_lower = question.lower()

        # Check quick responses first
        for key, response in self.quick_responses.items():
            if key in question_lower:
                return {"type": "quick", "answer": response, "category": "General"}

        # Check FAQs
        best_match = None
        best_score = 0

        for faq in self.faqs:
            score = 0
            for keyword in faq["keywords"]:
                if keyword in question_lower:
                    score += 1

            if score > best_score:
                best_score = score
                best_match = faq

        if best_match and best_score > 0:
            return {
                "type": "faq",
                "question": best_match["question"],
                "answer": best_match["answer"],
                "category": best_match["category"],
            }

        # Check educational content
        for topic, content in self.educational_content.items():
            if topic in question_lower or topic.replace("_", " ") in question_lower:
                return {
                    "type": "educational",
                    "answer": content,
                    "category": "Education",
                }

        return None

    def get_all_categories(self) -> List[str]:
        """Get all FAQ categories"""
        return list(set(faq["category"] for faq in self.faqs))

    def get_faqs_by_category(self, category: str) -> List[Dict[str, str]]:
        """Get all FAQs in a category"""
        return [
            {"question": faq["question"], "category": faq["category"]}
            for faq in self.faqs
            if faq["category"] == category
        ]

    def get_popular_questions(self, limit: int = 10) -> List[str]:
        """Get popular/recommended questions"""
        return [faq["question"] for faq in self.faqs[:limit]]


# Singleton instance
faq_system = FAQSystem()
