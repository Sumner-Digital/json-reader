# JSON-LD Viewer Updates

## New Features Added

### 1. **Expandable Arrays**
- Arrays with more than 3 items now show a preview of the first 3 items
- Click on the array value to expand and see all items
- The "(+N)" indicator shows how many more items are hidden
- Works for all primitive arrays (strings, numbers, booleans)

### 2. **Clickable URLs**
- All URLs in arrays are now clickable
- Clicking opens the URL in a new tab
- URLs are styled in blue with underline to indicate they're clickable

### 3. **Social Media Icons**
- Recognized social media platforms show their icons:
  - 📘 Facebook
  - 🐦 Twitter/X
  - 📷 Instagram
  - 💼 LinkedIn
  - 📺 YouTube
  - 📌 Pinterest
  - 🎵 TikTok
  - 🐙 GitHub
  - 📚 Wikipedia

### 4. **Expand/Collapse All**
- "Expand All" button now expands all arrays and objects
- "Collapse All" collapses everything back to compact view

### 5. **Visual Indicators**
- Expandable arrays have a dotted underline
- Hover effect changes the color and underline style
- Cursor changes to pointer on hover

## How to Use

1. **Expand a specific array**: Click on any array that shows "... ⊕ N more"
2. **Expand everything**: Click "Expand All" button in the header
3. **Open URLs**: Click on any URL (shown in blue) to open in a new tab
4. **Collapse arrays**: Click on expanded arrays to collapse them back

## Example

For the `sameAs` field with multiple social media URLs:
- **Collapsed**: `["https://www.facebook.com/...", "https://x.com/...", "https://instagram.com/..." ... ⊕ 2 more]`
- **Expanded**: Shows all 5 URLs as individual clickable items with social media icons
