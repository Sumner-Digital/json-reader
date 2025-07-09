# JSON-LD @graph Validation Support

This validator now fully supports the `@graph` syntax used by WordPress SEO plugins like Yoast SEO and RankMath.

## What is @graph?

The `@graph` property is a standard JSON-LD construct that allows multiple related entities to be expressed in a single JSON-LD block. It's commonly used by WordPress SEO tools to create interconnected structured data.

## How it Works

When the validator encounters a JSON-LD document with `@graph`:

1. **Structure Validation**: It first checks that the root document has a `@context`
2. **Individual Entity Validation**: Each item in the `@graph` array is validated independently
3. **Context Inheritance**: Items in the graph inherit the root `@context` if they don't have their own
4. **Error Aggregation**: All errors and warnings from all entities are collected and reported

## Example @graph Structure

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Company",
      "url": "https://example.com"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "publisher": {
        "@id": "https://example.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/page/#webpage",
      "isPartOf": {
        "@id": "https://example.com/#website"
      }
    }
  ]
}
```

## Key Features

1. **NOT an Error**: The validator correctly recognizes `@graph` as valid JSON-LD syntax
2. **Cross-References**: Items can reference each other using `@id` properties
3. **WordPress SEO Compatible**: Fully compatible with Yoast SEO, RankMath, and other WordPress SEO tools
4. **Individual Validation**: Each entity in the graph is validated according to its specific schema type

## Supported Schema Types

The validator now includes schemas commonly used in @graph structures:

- **WebSite**: For website-level structured data
- **WebPage**: For individual page structured data (including subtypes like ItemPage, AboutPage, etc.)
- **Person**: For author and personal profiles
- **BreadcrumbList**: For breadcrumb navigation
- **Organization**: For business/company information
- All previously supported types (Product, Article, FAQPage, etc.)

## Testing

Run the test file to see @graph validation in action:

```bash
node test-graph-validation.mjs
```

This demonstrates:
- Valid @graph structures pass validation
- Each entity is validated independently
- HTTP URL errors are still caught within graph items
- Missing @context errors are properly reported
