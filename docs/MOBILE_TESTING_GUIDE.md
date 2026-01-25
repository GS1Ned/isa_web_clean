# Mobile Testing Guide for Dropdown Components

## Overview

This guide provides instructions for testing dropdown (Select) components on mobile devices to ensure touch interactions work correctly.

## Test Scenarios

### 1. Basic Touch Interaction
- **Action:** Tap on a Select trigger (e.g., filter dropdown on News Hub or Events Overview)
- **Expected:** Dropdown menu opens immediately without delay
- **Verify:** Menu stays open and doesn't close unexpectedly

### 2. Menu Item Selection
- **Action:** Tap on an item in the opened dropdown menu
- **Expected:** Item is selected, menu closes, selected value is displayed in trigger
- **Verify:** No accidental selections or double-taps required

### 3. Outside Tap Dismissal
- **Action:** Open dropdown, then tap outside the menu area
- **Expected:** Menu closes without selecting any item
- **Verify:** Original selection (if any) remains unchanged

## Testing Devices

### Priority Devices
1. **iPhone (iOS Safari)** - Most common iOS device
2. **Samsung Galaxy (Chrome)** - Most common Android device
3. **iPad (Safari)** - Tablet experience

### Screen Sizes to Test
- **Small phones:** ≤375px width (iPhone SE, older Android)
- **Standard phones:** 375-428px width (iPhone 12-15, most Android)
- **Tablets:** ≥768px width (iPad, Android tablets)

## Testing Checklist

- [ ] News Hub page - Filter dropdowns
- [ ] Events Overview page - All filter dropdowns
- [ ] Test on iPhone (Safari)
- [ ] Test on Android phone (Chrome)
- [ ] Test in portrait and landscape orientation

## Browser DevTools Mobile Emulation

Chrome DevTools: Ctrl+Shift+M → Select device preset → Test with mouse (simulates touch)

**Note:** Always test on real devices for production validation.
