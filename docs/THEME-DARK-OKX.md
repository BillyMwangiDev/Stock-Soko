# Stock Soko - Dark Theme (OKX-Inspired)

## 🌙 Professional Dark Trading Theme

The Stock Soko app now uses a sleek dark theme inspired by OKX (one of the world's leading cryptocurrency exchanges), optimized for extended trading sessions and reduced eye strain.

---

## 🎨 Color Palette

### Background Colors
```typescript
primary: '#0B0E11'      // Very dark, almost black (main background)
secondary: '#161A1E'    // Dark grey (sections)
tertiary: '#1E2329'     // Medium dark (cards) - OKX signature color
elevated: '#2B3139'     // Lighter grey (hover states)
```

### Text Colors
```typescript
primary: '#EAECEF'      // Off-white (main text)
secondary: '#B7BDC6'    // Light grey (secondary text)
tertiary: '#848E9C'     // Medium grey (muted text)
disabled: '#5E6673'     // Dark grey (disabled)
```

### Accent Colors
```typescript
success/buy: '#2EBD85'  // OKX Green
error/sell: '#F6465D'   // OKX Red
warning: '#F0B90B'      // OKX Yellow
info: '#3861FB'         // Blue
```

---

## 🎯 OKX Design Principles Applied

### 1. **Professional Dark Background**
- Very dark base (#0B0E11) reduces eye strain
- Layered greys create depth without harsh contrast
- Similar to OKX's signature dark interface

### 2. **Clear Visual Hierarchy**
- Card backgrounds (#1E2329) stand out against main background
- Elevated elements (#2B3139) indicate interactive states
- Consistent spacing and elevation

### 3. **Trading-Optimized Colors**
- **Green (#2EBD85)**: Buy orders, gains, positive changes
- **Red (#F6465D)**: Sell orders, losses, negative changes
- **Yellow (#F0B90B)**: Warnings, pending states
- Colors chosen for clear differentiation even in low light

### 4. **Minimal Eye Strain**
- Reduced blue light from dark backgrounds
- Softer text colors (#EAECEF vs pure white)
- Comfortable for hours of trading

---

## 📱 Component Appearance

### Buttons
- **Primary**: Green (#2EBD85) with dark text
- **Secondary**: Dark grey (#2B3139) with light text
- **Destructive**: Red (#F6465D) with light text

### Cards
- **Background**: Dark grey (#1E2329)
- **Border**: Subtle (#2B3139)
- **Elevated**: Lighter on hover

### Inputs
- **Background**: Dark grey (#1E2329)
- **Border**: Medium grey (#2B3139)
- **Focus**: Green border (#2EBD85)
- **Placeholder**: Muted grey (#5E6673)

### Badges
- **Success**: Green background with bright green text
- **Error**: Red background with bright red text
- **Warning**: Yellow background with bright yellow text

---

## 🔄 Comparison: Light vs Dark

| Element | Light Theme | Dark Theme (OKX) |
|---------|-------------|------------------|
| **Background** | #F5F6F8 (Light grey) | #0B0E11 (Very dark) |
| **Cards** | #FFFFFF (White) | #1E2329 (Dark grey) |
| **Text** | #111827 (Dark) | #EAECEF (Light) |
| **Primary** | #10B981 | #2EBD85 |
| **Error** | #EF4444 | #F6465D |

---

## 🌟 OKX-Specific Features

### Color Precision
- OKX Green: `#2EBD85` - Exact shade used by OKX
- OKX Red: `#F6465D` - Matches OKX error/sell color
- OKX Yellow: `#F0B90B` - Warning color
- Background layers match OKX's depth system

### Typography
- Maintains same Inter/Calibri font system
- Adjusted for better readability on dark backgrounds
- Higher contrast ratios for accessibility

### Borders & Dividers
- Subtle borders (#2B3139) don't overwhelm
- Similar to OKX's minimalist approach
- Clear section separation without harsh lines

---

## 💯 Benefits of Dark Theme

### For Users
1. ✅ **Reduced Eye Strain** - Easier on eyes during long trading sessions
2. ✅ **Better Focus** - Dark UI keeps attention on data
3. ✅ **Battery Saving** - Uses less power on OLED screens
4. ✅ **Professional Look** - Modern fintech aesthetic
5. ✅ **Night Trading** - Comfortable in low-light environments

### For Trading
1. ✅ **Clear Data Visualization** - Charts pop against dark background
2. ✅ **Color Differentiation** - Green/red clearly visible
3. ✅ **Reduced Glare** - Better for screen visibility
4. ✅ **Industry Standard** - Matches major exchanges (OKX, Binance, etc.)

---

## 🎨 Visual Examples

### Home Screen
```
Background: #0B0E11 (Very dark)
├── Header Text: #EAECEF (Light)
├── Cards: #1E2329 (Dark grey)
│   ├── Title: #EAECEF
│   ├── Subtitle: #848E9C
│   └── Gain/Loss: #2EBD85 / #F6465D
└── Tab Bar: #161A1E
```

### Markets Screen
```
Background: #0B0E11
├── Search Bar: #1E2329
├── Stock Cards: #1E2329
│   ├── Symbol: #EAECEF
│   ├── Price: #B7BDC6
│   └── Change: #2EBD85 (green) or #F6465D (red)
└── Buttons: #2EBD85 (Buy) / #F6465D (Sell)
```

### Trading Screen
```
Background: #161A1E
├── Price Display: #2EBD85 (large, prominent)
├── Input Fields: #1E2329
├── Order Form: #1E2329
└── Confirm Button: #2EBD85 (green glow effect)
```

---

## 🔧 Implementation

All components automatically use the dark theme through the centralized theme system:

```typescript
import { colors } from '../theme';

// Usage in components
<View style={{ backgroundColor: colors.background.primary }}>
  <Text style={{ color: colors.text.primary }}>Trading</Text>
  <Button backgroundColor={colors.success}>Buy</Button>
</View>
```

---

## ✅ Theme Compliance

- [x] OKX color palette applied
- [x] Dark backgrounds throughout
- [x] Light text on dark surfaces
- [x] Proper contrast ratios (WCAG AA)
- [x] Consistent component theming
- [x] All screens updated
- [x] Navigation bars themed
- [x] No linter errors

---

## 🚀 Result

Stock Soko now features a **professional dark theme** inspired by OKX, providing:
- ✅ Sleek, modern fintech appearance
- ✅ Comfortable extended trading sessions
- ✅ Clear data visualization
- ✅ Industry-standard color scheme
- ✅ Professional trading platform aesthetics

**Perfect for serious traders! 🌙📈**

