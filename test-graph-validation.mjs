import { validateJsonLd } from './src/app/utils/validator.js';

// Example JSON-LD with @graph from Yoast SEO
const yoastGraphExample = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Company",
      "url": "https://example.com",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://example.com/#logo",
        "url": "https://example.com/logo.png",
        "width": 600,
        "height": 60,
        "caption": "Example Company"
      },
      "sameAs": [
        "https://www.facebook.com/example",
        "https://twitter.com/example"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Example Website",
      "description": "The official website of Example Company",
      "publisher": {
        "@id": "https://example.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://example.com/?s={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/products/awesome-widget/#webpage",
      "url": "https://example.com/products/awesome-widget/",
      "name": "Awesome Widget - Example Company",
      "isPartOf": {
        "@id": "https://example.com/#website"
      },
      "datePublished": "2024-01-15T10:00:00+00:00",
      "dateModified": "2024-06-20T14:30:00+00:00",
      "description": "Learn about our Awesome Widget product",
      "breadcrumb": {
        "@id": "https://example.com/products/awesome-widget/#breadcrumb"
      },
      "primaryImageOfPage": {
        "@id": "https://example.com/products/awesome-widget/#primaryimage"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://example.com/products/awesome-widget/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://example.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://example.com/products/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Awesome Widget"
        }
      ]
    },
    {
      "@type": "Product",
      "@id": "https://example.com/products/awesome-widget/#product",
      "name": "Awesome Widget",
      "description": "The most awesome widget you'll ever use",
      "image": [
        "https://example.com/images/widget-1.jpg",
        "https://example.com/images/widget-2.jpg"
      ],
      "sku": "AWW-001",
      "brand": {
        "@type": "Brand",
        "name": "Example Brand"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/products/awesome-widget/",
        "priceCurrency": "USD",
        "price": "99.99",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@id": "https://example.com/#organization"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "89"
      }
    }
  ]
};

// Example with HTTP URL that should trigger an error
const graphWithHttpError = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "http://example.com/#organization", // This should trigger HTTP error
      "name": "Example Company",
      "url": "http://example.com" // This should also trigger HTTP error
    }
  ]
};

async function runTests() {
  console.log('Testing Yoast-style @graph validation...\n');
  
  // Test 1: Valid @graph structure
  console.log('Test 1: Valid @graph structure');
  const result1 = await validateJsonLd(JSON.stringify(yoastGraphExample, null, 2));
  console.log('Errors:', result1.errors.length);
  console.log('Warnings:', result1.warnings.length);
  if (result1.warnings.length > 0) {
    console.log('Warning details:', result1.warnings);
  }
  console.log('');
  
  // Test 2: @graph with HTTP errors
  console.log('Test 2: @graph with HTTP URLs (should have errors)');
  const result2 = await validateJsonLd(JSON.stringify(graphWithHttpError, null, 2));
  console.log('Errors:', result2.errors.length);
  result2.errors.forEach(err => {
    console.log(`- ${err.path}: ${err.message}`);
  });
  console.log('');
  
  // Test 3: @graph without @context
  console.log('Test 3: @graph without @context');
  const graphNoContext = {
    "@graph": [
      {
        "@type": "Organization",
        "name": "Test Org"
      }
    ]
  };
  const result3 = await validateJsonLd(JSON.stringify(graphNoContext));
  console.log('Errors:', result3.errors.length);
  result3.errors.forEach(err => {
    console.log(`- ${err.path}: ${err.message}`);
  });
}

runTests().catch(console.error);
