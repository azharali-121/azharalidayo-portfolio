# Visual Testing Guide - Quick Reference

## How to Test Locally

### 1. Test Boot Loader
```
1. Open: http://127.0.0.1:5500/index.html
2. Clear localStorage: F12 → Application → Local Storage → Clear
3. Refresh page
4. Loader should appear with typewriter animation
5. Refresh again → loader should be skipped
```

### 2. Test Responsive Breakpoints

**Chrome DevTools:**
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Test these widths:
- 360px × 640px (Galaxy Fold)
- 375px × 667px (iPhone SE)
- 390px × 844px (iPhone 12/13/14)
- 428px × 926px (iPhone 14 Pro Max)
- 768px × 1024px (iPad)
- 1024px × 768px (iPad Landscape)
- 1440px × 900px (Desktop)
```

### 3. Test Touch Targets (Mobile)

**All buttons should be ≥ 44x44px:**
```
Inspect elements and verify computed dimensions:
- Hero Primary Button: ≥ 48px height
- Hero Secondary Button: ≥ 48px height
- Footer Social Icons: ≥ 44px
- Footer Action Button: ≥ 44px
- Hamburger Menu: ≥ 44px
- FAB Button: ≥ 56px (52px mobile)
```

### 4. Test Accessibility

**Skip-to-Content:**
```
1. Focus browser
2. Press Tab key
3. "Skip to main content" should appear at top
4. Press Enter → should jump to #home section
```

**Keyboard Navigation:**
```
Tab through all interactive elements:
✓ Skip link
✓ Navigation links
✓ Hero buttons
✓ Footer links
✓ Footer social icons
✓ Footer action button
✓ FAB button
```

**Screen Reader Test (Optional):**
```
Windows: NVDA (free)
Mac: VoiceOver (Cmd+F5)
Test: All buttons should announce their purpose
```

**Reduced Motion:**
```
Windows: Settings → Accessibility → Visual effects → Animations
Mac: System Preferences → Accessibility → Display → Reduce motion
Result: Loader should show instantly, no animations
```

### 5. Test Layout Shift

**CLS Test:**
```
1. Clear localStorage
2. Open page
3. Watch loader animation
4. When loader fades, content should NOT jump
5. Hero section should remain stable (min-height: 100vh)
```

### 6. Test Footer Layout

**Mobile (360-480px):**
```
✓ Copyright text centered
✓ Action button below copyright
✓ Gap between: 1.25rem (20px)
✓ Both elements centered
```

**Desktop (769px+):**
```
✓ Copyright text left
✓ Action button right
✓ Single horizontal line
✓ Proper spacing between
```

### 7. Test Hero Buttons

**Mobile (≤480px):**
```
✓ Buttons stack vertically
✓ Full width
✓ Gap between: 12px (0.75rem)
✓ Each button: 48px min height
```

**Desktop (≥769px):**
```
✓ Buttons side-by-side
✓ Gap between: 16px (1rem)
✓ Each button: 44px min height
```

### 8. Test Horizontal Overflow

**Scroll Test:**
```
For each breakpoint (360px, 768px, 1440px):
1. Check for horizontal scrollbar
2. Result: Should NOT exist
3. All content should fit viewport width
```

### 9. Test Hero Spacing

**Measure vertical gaps:**
```
Hero Title → Separator: 1rem
Separator → Subtitle: 1.25rem
Subtitle → Description: 1.5rem
Description → Buttons: 2rem
```

**Mobile adjustments:**
```
Hero Title → Separator: 0.75rem
Separator → Subtitle: 1rem
Subtitle → Description: 1.25rem
```

### 10. Performance Test

**Lighthouse Test:**
```
F12 → Lighthouse tab
Select:
- Device: Mobile
- Categories: Performance, Accessibility, Best Practices
Run Test

Target Scores:
- Performance: > 90
- Accessibility: 100
- Best Practices: > 90
```

## Quick Visual Checklist

### ✅ Desktop (1440px)
- [ ] Loader appears with typewriter animation
- [ ] Hero section full height, no layout shift
- [ ] Buttons side-by-side, proper spacing
- [ ] About text max-width 70ch, centered
- [ ] Education cards alternate left/right
- [ ] Footer copyright and action on same line
- [ ] No horizontal scroll

### ✅ Tablet (768px)
- [ ] Navigation collapses to hamburger
- [ ] Hero buttons still side-by-side
- [ ] Education cards full-width, vertical
- [ ] Footer layout adjusts properly
- [ ] Touch targets ≥ 44px

### ✅ Mobile (360px)
- [ ] Loader fits screen, no overflow
- [ ] Hero buttons stack vertically, 12px gap
- [ ] All text readable, no cut-off
- [ ] Education timeline vertical with markers
- [ ] Footer elements stack, centered
- [ ] All buttons minimum 48px height
- [ ] No horizontal scroll

## Common Issues & Fixes

### Issue: Horizontal scroll on mobile
**Fix:** Check `assets/styles/components/qa-optimizations.css` is loaded

### Issue: Buttons too close together
**Fix:** Verify `.hero-buttons` has `gap: 0.75rem` on mobile

### Issue: Loader appears every time
**Fix:** Check localStorage in DevTools → should show `azhar_portfolio_visited: true`

### Issue: Layout jumps after loader
**Fix:** Hero section should have `min-height: 100vh` in global-layout-spacing.css

### Issue: Touch targets too small
**Fix:** All interactive elements should have `min-height: 44px; min-width: 44px;`

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Primary |
| Firefox | Latest | ✅ Test |
| Safari | Latest | ✅ Test |
| Edge | Latest | ✅ Test |
| Mobile Safari | iOS 14+ | ✅ Critical |
| Chrome Mobile | Latest | ✅ Critical |

## Files to Check

If issues occur, verify these files are loaded:
1. `assets/styles/components/boot-loader.css`
2. `assets/styles/components/qa-optimizations.css`
3. `assets/styles/base/global-layout-spacing.css`
4. `assets/styles/components/mobile-ux-fixes.css`
5. `assets/scripts/boot-loader.js`

## Clear Cache & Test Fresh

```bash
# Chrome
Ctrl+Shift+Delete → Clear cached images and files

# Or Hard Refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

**Testing Complete When:**
- ✅ All breakpoints render correctly
- ✅ No horizontal overflow anywhere
- ✅ All touch targets meet 44x44px minimum
- ✅ Loader only appears once
- ✅ No layout shift after loader
- ✅ Accessibility features work
- ✅ Footer layout clean on all devices
- ✅ Buttons have proper spacing
