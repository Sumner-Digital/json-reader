# JSON-LD Validator Configuration

## Validation Options

The validator now supports several configuration options to control its behavior:

### Options

- **`checkRecommendedProperties`** (boolean, default: `true`)
  - Whether to check for Google-recommended properties and show warnings
  
- **`checkHttpUrls`** (boolean, default: `true`) 
  - Whether to check for insecure HTTP URLs and show errors

- **`graphItemsNeedRecommended`** (boolean, default: `false`)
  - Whether items within @graph structures need all recommended properties
  - Only applies when `checkRecommendedProperties` is true

### Default Behavior

By default, the validator:
1. Shows warnings for missing recommended properties on standalone entities
2. **Does NOT** show warnings for entities within @graph structures
3. **Does NOT** show warnings for reference nodes (entities with only @id and a few properties)
4. Shows errors for HTTP URLs (should use HTTPS)

### Usage Examples

```typescript
// Basic usage with defaults
const result = await validateJsonLd(jsonString);

// Disable all warnings
const result = await validateJsonLd(jsonString, {
  checkRecommendedProperties: false
});

// Strict mode - check everything including @graph items
const result = await validateJsonLd(jsonString, {
  checkRecommendedProperties: true,
  graphItemsNeedRecommended: true
});

// Only check for errors, no warnings
const result = await validateJsonLd(jsonString, {
  checkRecommendedProperties: false,
  checkHttpUrls: true
});
```

### Using with React Component

```tsx
<JsonLdValidator 
  jsonString={jsonString}
  onValidationComplete={handleValidation}
  options={{
    checkRecommendedProperties: true,
    graphItemsNeedRecommended: false
  }}
/>
```

### Why These Defaults?

1. **@graph structures** often contain reference nodes that don't need full entity details
2. **Reference nodes** (like `{"@id": "#org", "@type": "Organization"}`) are valid without all properties
3. **Recommended properties** are suggestions for better SEO, not requirements for valid JSON-LD
