// Schema definitions for Google-supported structured data types
// Based on Google Search Central documentation

// Common schema.org context variations
const schemaOrgContext = {
  oneOf: [
    { const: "https://schema.org" },
    { const: "http://schema.org" },
    { const: "https://schema.org/" },
    { const: "http://schema.org/" },
    { const: "https://www.schema.org" },
    { const: "http://www.schema.org" },
    { const: "https://www.schema.org/" },
    { const: "http://www.schema.org/" }
  ]
};

// Documentation URLs for each schema type
export const schemaDocUrls: Record<string, string> = {
  Product: "https://developers.google.com/search/docs/appearance/structured-data/product",
  ProductGroup: "https://developers.google.com/search/docs/appearance/structured-data/product-variants",
  Organization: "https://developers.google.com/search/docs/appearance/structured-data/organization",
  OnlineStore: "https://developers.google.com/search/docs/appearance/structured-data/organization",
  LocalBusiness: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
  Article: "https://developers.google.com/search/docs/appearance/structured-data/article",
  FAQPage: "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
  QAPage: "https://developers.google.com/search/docs/appearance/structured-data/qapage",
  HowTo: "https://developers.google.com/search/docs/appearance/structured-data/how-to",
  Event: "https://developers.google.com/search/docs/appearance/structured-data/event",
  SoftwareApplication: "https://developers.google.com/search/docs/appearance/structured-data/software-app",
  MerchantReturnPolicy: "https://developers.google.com/search/docs/appearance/structured-data/merchant-return-policy",
  MemberProgram: "https://developers.google.com/search/docs/appearance/structured-data/loyalty-program",
  Offer: "https://developers.google.com/search/docs/appearance/structured-data/product#offers",
  AggregateOffer: "https://developers.google.com/search/docs/appearance/structured-data/product#aggregate-offers",
  WebSite: "https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox",
  WebPage: "https://schema.org/WebPage",
  Person: "https://schema.org/Person",
  ImageObject: "https://schema.org/ImageObject",
  BreadcrumbList: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb"
};

export const schemas: Record<string, any> = {
  Product: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { 
        oneOf: [
          { const: "Product" },
          { type: "array", items: { type: "string" } }
        ]
      },
      "@id": { type: "string" },
      name: { type: "string" },
      image: { 
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              url: { type: "string" },
              contentUrl: { type: "string" }
            }
          }
        ]
      },
      description: { type: "string" },
      sku: { type: "string" },
      gtin: { type: "string" },
      gtin8: { type: "string" },
      gtin12: { type: "string" },
      gtin13: { type: "string" },
      gtin14: { type: "string" },
      isbn: { type: "string" },
      mpn: { type: "string" },
      brand: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Brand" },
              name: { type: "string" }
            }
          }
        ]
      },
      review: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Review" },
              reviewRating: {
                type: "object",
                properties: {
                  "@type": { const: "Rating" },
                  ratingValue: { type: ["number", "string"] },
                  bestRating: { type: ["number", "string"] },
                  worstRating: { type: ["number", "string"] }
                }
              },
              author: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "Person" },
                      name: { type: "string" }
                    }
                  }
                ]
              },
              positiveNotes: {
                type: "object",
                properties: {
                  "@type": { const: "ItemList" },
                  itemListElement: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        "@type": { const: "ListItem" },
                        position: { type: "number" },
                        name: { type: "string" }
                      }
                    }
                  }
                }
              },
              negativeNotes: {
                type: "object",
                properties: {
                  "@type": { const: "ItemList" },
                  itemListElement: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        "@type": { const: "ListItem" },
                        position: { type: "number" },
                        name: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/review/oneOf/0" }
          }
        ]
      },
      aggregateRating: {
        type: "object",
        properties: {
          "@type": { const: "AggregateRating" },
          ratingValue: { type: ["number", "string"] },
          bestRating: { type: ["number", "string"] },
          worstRating: { type: ["number", "string"] },
          reviewCount: { type: ["number", "string"] },
          ratingCount: { type: ["number", "string"] }
        }
      },
      offers: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Offer" },
                  { const: "AggregateOffer" }
                ]
              },
              url: { type: "string" },
              priceCurrency: { type: "string" },
              price: { type: ["string", "number"] },
              lowPrice: { type: ["string", "number"] },
              highPrice: { type: ["string", "number"] },
              offerCount: { type: ["number", "string"] },
              priceSpecification: {
                oneOf: [
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "PriceSpecification" },
                      price: { type: ["string", "number"] },
                      priceCurrency: { type: "string" },
                      priceType: { type: "string" },
                      validForMemberTier: { type: "object" }
                    }
                  },
                  { type: "array", items: { type: "object" } }
                ]
              },
              itemCondition: { type: "string" },
              availability: { type: "string" },
              priceValidUntil: { type: "string" },
              seller: {
                type: "object",
                properties: {
                  "@type": { const: "Organization" },
                  name: { type: "string" }
                }
              },
              hasMerchantReturnPolicy: { type: "object" },
              shippingDetails: { type: "object" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/offers/oneOf/0" }
          }
        ]
      },
      audience: {
        type: "object",
        properties: {
          "@type": { const: "PeopleAudience" },
          suggestedGender: { type: "string" },
          suggestedMaxAge: { 
            oneOf: [
              { type: "number" },
              {
                type: "object",
                properties: {
                  "@type": { const: "QuantitativeValue" },
                  value: { type: "number" },
                  unitCode: { type: "string" }
                }
              }
            ]
          },
          suggestedMinAge: { 
            oneOf: [
              { type: "number" },
              {
                type: "object",
                properties: {
                  "@type": { const: "QuantitativeValue" },
                  value: { type: "number" },
                  unitCode: { type: "string" }
                }
              }
            ]
          }
        }
      },
      color: { type: "string" },
      size: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "SizeSpecification" },
              name: { type: "string" },
              sizeGroup: { 
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              },
              sizeSystem: { type: "string" }
            }
          }
        ]
      },
      material: { type: "string" },
      pattern: { type: "string" },
      inProductGroupWithID: { type: "string" },
      isVariantOf: { 
        type: "object",
        properties: {
          "@type": { const: "ProductGroup" },
          "@id": { type: "string" }
        }
      },
      hasCertification: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Certification" },
              issuedBy: { type: "object" },
              name: { type: "string" },
              certificationIdentification: { type: "string" },
              certificationRating: { type: "object" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      subjectOf: {
        type: "object",
        properties: {
          "@type": { const: "3DModel" },
          encoding: {
            type: "object",
            properties: {
              "@type": { const: "MediaObject" },
              contentUrl: { type: "string" }
            }
          }
        }
      },
      url: { type: "string" }
    },
    recommendedProperties: ["name", "image", "description", "sku", "brand"]
  },

  ProductGroup: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "ProductGroup" },
      "@id": { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      url: { type: "string" },
      aggregateRating: {
        type: "object",
        properties: {
          "@type": { const: "AggregateRating" },
          ratingValue: { type: ["number", "string"] },
          bestRating: { type: ["number", "string"] },
          worstRating: { type: ["number", "string"] },
          reviewCount: { type: ["number", "string"] },
          ratingCount: { type: ["number", "string"] }
        }
      },
      brand: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Brand" },
              name: { type: "string" }
            }
          }
        ]
      },
      review: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Review" },
              reviewRating: { type: "object" },
              author: { type: "object" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      productGroupID: { type: "string" },
      variesBy: {
        oneOf: [
          { type: "string" },
          {
            type: "array",
            items: { type: "string" }
          }
        ]
      },
      hasVariant: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Product" },
              "@id": { type: "string" },
              url: { type: "string" },
              sku: { type: "string" },
              gtin: { type: "string" },
              gtin8: { type: "string" },
              gtin12: { type: "string" },
              gtin13: { type: "string" },
              gtin14: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              image: { 
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              },
              color: { type: "string" },
              size: { type: "string" },
              material: { type: "string" },
              pattern: { type: "string" },
              offers: { type: "object" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/hasVariant/oneOf/0" }
          }
        ]
      },
      audience: {
        type: "object",
        properties: {
          "@type": { const: "PeopleAudience" },
          suggestedGender: { type: "string" },
          suggestedAge: { type: "object" }
        }
      },
      pattern: { type: "string" },
      material: { type: "string" },
      category: { type: "string" },
      mpn: { type: "string" },
      sku: { type: "string" },
      image: { 
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      }
    },
    recommendedProperties: ["name", "description", "url", "productGroupID", "hasVariant"]
  },

  Organization: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { 
        oneOf: [
          { const: "Organization" },
          { const: "OnlineStore" },
          { type: "string", pattern: ".*Organization$" }
        ]
      },
      name: { type: "string" },
      alternateName: { type: "string" },
      url: { type: "string" },
      logo: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              url: { type: "string" },
              contentUrl: { type: "string" }
            }
          }
        ]
      },
      description: { type: "string" },
      email: { type: "string" },
      telephone: { type: "string" },
      faxNumber: { type: "string" },
      address: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "PostalAddress" },
              streetAddress: { type: "string" },
              addressLocality: { type: "string" },
              addressRegion: { type: "string" },
              postalCode: { type: "string" },
              addressCountry: { type: "string" },
              postOfficeBoxNumber: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/address/oneOf/0" }
          }
        ]
      },
      contactPoint: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "ContactPoint" },
              telephone: { type: "string" },
              contactType: { type: "string" },
              email: { type: "string" },
              areaServed: {
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              },
              availableLanguage: {
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/contactPoint/oneOf/0" }
          }
        ]
      },
      sameAs: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      foundingDate: { type: "string" },
      founder: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          }
        ]
      },
      duns: { type: "string" },
      taxID: { type: "string" },
      vatID: { type: "string" },
      globalLocationNumber: { type: "string" },
      legalName: { type: "string" },
      leiCode: { type: "string" },
      naics: { type: "string" },
      isicV4: { type: "string" },
      iso6523Code: { type: "string" },
      numberOfEmployees: {
        oneOf: [
          { type: ["number", "string"] },
          {
            type: "object",
            properties: {
              "@type": { const: "QuantitativeValue" },
              value: { type: ["number", "string"] },
              minValue: { type: ["number", "string"] },
              maxValue: { type: ["number", "string"] }
            }
          }
        ]
      },
      department: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Organization" },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/department/oneOf/0" }
          }
        ]
      },
      award: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      brand: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Brand" },
              name: { type: "string" },
              logo: { type: "string" }
            }
          }
        ]
      },
      hasMerchantReturnPolicy: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "MerchantReturnPolicy" },
              applicableCountry: {
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              },
              returnPolicyCountry: { type: "string" },
              returnPolicyCategory: { type: "string" },
              merchantReturnDays: { type: ["number", "string"] },
              returnMethod: { type: "string" },
              returnFees: { type: "string" },
              refundType: { type: "string" },
              returnShippingFeesAmount: {
                type: "object",
                properties: {
                  "@type": { const: "MonetaryAmount" },
                  value: { type: ["number", "string"] },
                  currency: { type: "string" }
                }
              }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/hasMerchantReturnPolicy/oneOf/0" }
          }
        ]
      },
      hasMemberProgram: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "MemberProgram" },
              name: { type: "string" },
              description: { type: "string" },
              url: { type: "string" },
              membershipNumber: { type: "string" },
              programName: { type: "string" },
              hasTiers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    "@type": { const: "MemberProgramTier" },
                    "@id": { type: "string" },
                    name: { type: "string" },
                    url: { type: "string" },
                    hasTierBenefit: {
                      type: "array",
                      items: { type: "string" }
                    },
                    hasTierRequirement: {
                      type: "object",
                      properties: {
                        "@type": { type: "string" },
                        name: { type: "string" }
                      }
                    },
                    membershipPointsEarned: { type: ["number", "string"] }
                  }
                }
              }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/hasMemberProgram/oneOf/0" }
          }
        ]
      },
      aggregateRating: {
        type: "object",
        properties: {
          "@type": { const: "AggregateRating" },
          ratingValue: { type: ["number", "string"] },
          bestRating: { type: ["number", "string"] },
          worstRating: { type: ["number", "string"] },
          reviewCount: { type: ["number", "string"] },
          ratingCount: { type: ["number", "string"] }
        }
      },
      review: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Review" },
              reviewRating: {
                type: "object",
                properties: {
                  "@type": { const: "Rating" },
                  ratingValue: { type: ["number", "string"] },
                  bestRating: { type: ["number", "string"] },
                  worstRating: { type: ["number", "string"] }
                }
              },
              author: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "Person" },
                      name: { type: "string" }
                    }
                  }
                ]
              },
              datePublished: { type: "string" },
              reviewBody: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/review/oneOf/0" }
          }
        ]
      },
      location: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Place" },
              name: { type: "string" },
              address: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "PostalAddress" },
                      streetAddress: { type: "string" },
                      addressLocality: { type: "string" },
                      addressRegion: { type: "string" },
                      postalCode: { type: "string" },
                      addressCountry: { type: "string" }
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      memberOf: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Organization" },
                  { const: "ProgramMembership" }
                ]
              },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/memberOf/oneOf/0" }
          }
        ]
      },
      knowsAbout: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      knowsLanguage: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      parentOrganization: {
        type: "object",
        properties: {
          "@type": { const: "Organization" },
          name: { type: "string" }
        }
      },
      subOrganization: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Organization" },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/subOrganization/oneOf/0" }
          }
        ]
      },
      owns: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { type: "string" },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/owns/oneOf/0" }
          }
        ]
      },
      publishingPrinciples: { type: "string" },
      sponsor: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          }
        ]
      },
      slogan: { type: "string" },
      dissolutionDate: { type: "string" },
      areaServed: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      serviceType: { type: "string" },
      tickerSymbol: { type: "string" }
    },
    recommendedProperties: ["name"]
  },

  LocalBusiness: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "address", "telephone"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { 
        oneOf: [
          { const: "LocalBusiness" },
          { type: "string", pattern: ".*Business$" }
        ]
      },
      name: { type: "string" },
      address: {
        type: "object",
        required: ["@type"],
        properties: {
          "@type": { const: "PostalAddress" },
          streetAddress: { type: "string" },
          addressLocality: { type: "string" },
          addressRegion: { type: "string" },
          postalCode: { type: "string" },
          addressCountry: { type: "string" }
        }
      },
      telephone: { type: "string" },
      url: { type: "string" },
      image: { type: "string" },
      priceRange: { type: "string" },
      openingHoursSpecification: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "OpeningHoursSpecification" },
              dayOfWeek: {
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              },
              opens: { type: "string" },
              closes: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/openingHoursSpecification/oneOf/0" }
          }
        ]
      }
    },
    recommendedProperties: ["name", "url", "image", "priceRange", "openingHoursSpecification"]
  },

  Article: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { 
        oneOf: [
          { const: "Article" },
          { const: "NewsArticle" },
          { const: "BlogPosting" }
        ]
      },
      headline: { type: "string" },
      image: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              url: { type: "string" }
            }
          }
        ]
      },
      datePublished: { type: "string" },
      dateModified: { type: "string" },
      author: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Person" },
              name: { type: "string" }
            }
          },
          {
            type: "object",
            properties: {
              "@type": { const: "Organization" },
              name: { type: "string" }
            }
          }
        ]
      },
      publisher: {
        type: "object",
        properties: {
          "@type": { const: "Organization" },
          name: { type: "string" },
          logo: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  "@type": { const: "ImageObject" },
                  url: { type: "string" }
                }
              }
            ]
          }
        }
      },
      description: { type: "string" },
      articleBody: { type: "string" }
    },
    recommendedProperties: ["headline", "image", "datePublished", "dateModified", "author", "publisher"]
  },

  FAQPage: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "mainEntity"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { const: "FAQPage" },
      mainEntity: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["@type", "name"],
          properties: {
            "@type": { const: "Question" },
            name: { type: "string" },
            acceptedAnswer: {
              type: "object",
              required: ["@type", "text"],
              properties: {
                "@type": { const: "Answer" },
                text: { type: "string" }
              }
            },
            suggestedAnswer: {
              oneOf: [
                {
                  type: "object",
                  required: ["@type", "text"],
                  properties: {
                    "@type": { const: "Answer" },
                    text: { type: "string" }
                  }
                },
                {
                  type: "array",
                  items: { "$ref": "#/properties/mainEntity/items/properties/suggestedAnswer/oneOf/0" }
                }
              ]
            }
          },
          oneOf: [
            { required: ["acceptedAnswer"] },
            { required: ["suggestedAnswer"] }
          ]
        }
      }
    }
  },

  QAPage: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "mainEntity"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { const: "QAPage" },
      mainEntity: {
        type: "object",
        required: ["@type", "name", "answerCount"],
        properties: {
          "@type": { const: "Question" },
          name: { type: "string" },
          text: { type: "string" },
          answerCount: { type: ["number", "string"] },
          acceptedAnswer: {
            type: "object",
            required: ["@type", "text"],
            properties: {
              "@type": { const: "Answer" },
              text: { type: "string" },
              author: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "Person" },
                      name: { type: "string" }
                    }
                  }
                ]
              },
              upvoteCount: { type: ["number", "string"] },
              dateCreated: { type: "string" }
            }
          },
          suggestedAnswer: {
            oneOf: [
              {
                type: "object",
                required: ["@type", "text"],
                properties: {
                  "@type": { const: "Answer" },
                  text: { type: "string" },
                  author: {
                    oneOf: [
                      { type: "string" },
                      {
                        type: "object",
                        properties: {
                          "@type": { const: "Person" },
                          name: { type: "string" }
                        }
                      }
                    ]
                  },
                  upvoteCount: { type: ["number", "string"] },
                  dateCreated: { type: "string" }
                }
              },
              {
                type: "array",
                items: { "$ref": "#/properties/mainEntity/properties/suggestedAnswer/oneOf/0" }
              }
            ]
          }
        },
        oneOf: [
          { required: ["acceptedAnswer"] },
          { required: ["suggestedAnswer"] }
        ]
      }
    }
  },

  HowTo: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "name", "step"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { const: "HowTo" },
      name: { type: "string" },
      description: { type: "string" },
      image: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              url: { type: "string" }
            }
          }
        ]
      },
      totalTime: { type: "string" },
      estimatedCost: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "MonetaryAmount" },
              currency: { type: "string" },
              value: { type: ["string", "number"] }
            }
          }
        ]
      },
      tool: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "HowToTool" },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/tool/oneOf/0" }
          }
        ]
      },
      supply: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "HowToSupply" },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/supply/oneOf/0" }
          }
        ]
      },
      step: {
        oneOf: [
          {
            type: "array",
            items: {
              type: "object",
              required: ["@type", "text"],
              properties: {
                "@type": { const: "HowToStep" },
                name: { type: "string" },
                text: { type: "string" },
                image: {
                  oneOf: [
                    { type: "string" },
                    {
                      type: "object",
                      properties: {
                        "@type": { const: "ImageObject" },
                        url: { type: "string" }
                      }
                    }
                  ]
                }
              }
            }
          },
          {
            type: "object",
            required: ["@type", "itemListElement"],
            properties: {
              "@type": { const: "ItemList" },
              itemListElement: {
                type: "array",
                items: {
                  type: "object",
                  required: ["@type", "text"],
                  properties: {
                    "@type": { const: "HowToStep" },
                    name: { type: "string" },
                    text: { type: "string" },
                    image: {
                      oneOf: [
                        { type: "string" },
                        {
                          type: "object",
                          properties: {
                            "@type": { const: "ImageObject" },
                            url: { type: "string" }
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },
    recommendedProperties: ["description", "totalTime", "tool", "supply", "estimatedCost"]
  },

  Event: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "name", "startDate"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { const: "Event" },
      name: { type: "string" },
      startDate: { type: "string" },
      endDate: { type: "string" },
      location: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Place" },
              name: { type: "string" },
              address: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "PostalAddress" },
                      streetAddress: { type: "string" },
                      addressLocality: { type: "string" },
                      addressRegion: { type: "string" },
                      postalCode: { type: "string" },
                      addressCountry: { type: "string" }
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      image: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      description: { type: "string" },
      offers: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "Offer" },
              url: { type: "string" },
              price: { type: ["string", "number"] },
              priceCurrency: { type: "string" },
              availability: { type: "string" },
              validFrom: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/offers/oneOf/0" }
          }
        ]
      },
      performer: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          }
        ]
      },
      organizer: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          }
        ]
      }
    },
    recommendedProperties: ["location", "image", "endDate", "offers"]
  },

  MerchantReturnPolicy: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "MerchantReturnPolicy" },
      applicableCountry: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      returnPolicyCountry: { type: "string" },
      returnPolicyCategory: { type: "string" },
      merchantReturnDays: { type: ["number", "string"] },
      returnMethod: { type: "string" },
      returnFees: { type: "string" },
      refundType: { type: "string" },
      returnShippingFeesAmount: {
        type: "object",
        properties: {
          "@type": { const: "MonetaryAmount" },
          value: { type: ["number", "string"] },
          currency: { type: "string" }
        }
      },
      restockingFee: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "MonetaryAmount" },
              value: { type: ["number", "string"] },
              currency: { type: "string" }
            }
          },
          { type: "string" }
        ]
      },
      additionalProperty: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "PropertyValue" },
              name: { type: "string" },
              value: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/additionalProperty/oneOf/0" }
          }
        ]
      },
      merchantReturnLink: { type: "string" },
      inStoreReturnsOffered: { type: "boolean" },
      itemCondition: { type: "string" },
      itemDefectReturnLabelSource: { type: "string" },
      itemDefectReturnShippingFeesAmount: {
        type: "object",
        properties: {
          "@type": { const: "MonetaryAmount" },
          value: { type: ["number", "string"] },
          currency: { type: "string" }
        }
      },
      customerRemorseReturnFees: { type: "string" },
      customerRemorseReturnLabelSource: { type: "string" },
      customerRemorseReturnShippingFeesAmount: {
        type: "object",
        properties: {
          "@type": { const: "MonetaryAmount" },
          value: { type: ["number", "string"] },
          currency: { type: "string" }
        }
      }
    },
    recommendedProperties: ["applicableCountry", "returnPolicyCountry", "returnPolicyCategory", "merchantReturnDays", "returnMethod", "returnFees", "refundType"]
  },

  MemberProgram: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "MemberProgram" },
      name: { type: "string" },
      description: { type: "string" },
      url: { type: "string" },
      membershipNumber: { type: "string" },
      programName: { type: "string" },
      member: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/member/oneOf/0" }
          }
        ]
      },
      hostingOrganization: {
        type: "object",
        properties: {
          "@type": { const: "Organization" },
          name: { type: "string" }
        }
      },
      hasTiers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            "@type": { const: "MemberProgramTier" },
            "@id": { type: "string" },
            name: { type: "string" },
            url: { type: "string" },
            hasTierBenefit: {
              type: "array",
              items: { type: "string" }
            },
            hasTierRequirement: {
              type: "object",
              properties: {
                "@type": { type: "string" },
                name: { type: "string" }
              }
            },
            membershipPointsEarned: { type: ["number", "string"] }
          }
        }
      },
      membershipPointsEarned: { type: ["number", "string"] },
      award: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      }
    },
    recommendedProperties: ["name", "description", "url", "hasTiers"]
  },

  Offer: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "Offer" },
      url: { type: "string" },
      priceCurrency: { type: "string" },
      price: { 
        oneOf: [
          { type: ["string", "number"] },
          {
            type: "object",
            properties: {
              "@type": { const: "PriceSpecification" },
              price: { type: ["string", "number"] },
              priceCurrency: { type: "string" },
              priceType: { type: "string" },
              validForMemberTier: { type: "object" }
            }
          }
        ]
      },
      priceSpecification: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "PriceSpecification" },
              price: { type: ["string", "number"] },
              priceCurrency: { type: "string" },
              priceType: { type: "string" },
              validForMemberTier: { type: "object" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      itemCondition: { type: "string" },
      availability: { type: "string" },
      availabilityStarts: { type: "string" },
      availabilityEnds: { type: "string" },
      priceValidUntil: { type: "string" },
      validFrom: { type: "string" },
      validThrough: { type: "string" },
      seller: {
        type: "object",
        properties: {
          "@type": { 
            oneOf: [
              { const: "Organization" },
              { const: "Person" }
            ]
          },
          name: { type: "string" }
        }
      },
      itemOffered: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { type: "string" },
              name: { type: "string" }
            }
          }
        ]
      },
      eligibleQuantity: {
        type: "object",
        properties: {
          "@type": { const: "QuantitativeValue" },
          value: { type: ["number", "string"] },
          minValue: { type: ["number", "string"] },
          maxValue: { type: ["number", "string"] },
          unitCode: { type: "string" }
        }
      },
      eligibleRegion: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
          {
            type: "object",
            properties: {
              "@type": { const: "Place" },
              name: { type: "string" }
            }
          }
        ]
      },
      gtin: { type: "string" },
      gtin8: { type: "string" },
      gtin12: { type: "string" },
      gtin13: { type: "string" },
      gtin14: { type: "string" },
      mpn: { type: "string" },
      sku: { type: "string" },
      serialNumber: { type: "string" },
      hasMerchantReturnPolicy: {
        type: "object",
        properties: {
          "@type": { const: "MerchantReturnPolicy" }
        }
      },
      shippingDetails: {
        type: "object",
        properties: {
          "@type": { const: "OfferShippingDetails" },
          shippingRate: {
            type: "object",
            properties: {
              "@type": { const: "MonetaryAmount" },
              value: { type: ["number", "string"] },
              currency: { type: "string" }
            }
          },
          shippingDestination: {
            type: "object",
            properties: {
              "@type": { const: "DefinedRegion" },
              addressCountry: { type: "string" }
            }
          },
          deliveryTime: {
            type: "object",
            properties: {
              "@type": { const: "ShippingDeliveryTime" },
              handlingTime: {
                type: "object",
                properties: {
                  "@type": { const: "QuantitativeValue" },
                  minValue: { type: ["number", "string"] },
                  maxValue: { type: ["number", "string"] },
                  unitCode: { type: "string" }
                }
              },
              transitTime: {
                type: "object",
                properties: {
                  "@type": { const: "QuantitativeValue" },
                  minValue: { type: ["number", "string"] },
                  maxValue: { type: ["number", "string"] },
                  unitCode: { type: "string" }
                }
              }
            }
          }
        }
      },
      hasMeasurement: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "QuantitativeValue" },
              value: { type: ["number", "string"] },
              unitCode: { type: "string" },
              unitText: { type: "string" }
            }
          },
          {
            type: "array",
            items: { "$ref": "#/properties/hasMeasurement/oneOf/0" }
          }
        ]
      }
    },
    recommendedProperties: ["url", "priceCurrency", "price", "availability", "itemCondition"]
  },

  AggregateOffer: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "AggregateOffer" },
      url: { type: "string" },
      priceCurrency: { type: "string" },
      lowPrice: { type: ["string", "number"] },
      highPrice: { type: ["string", "number"] },
      offerCount: { type: ["number", "string"] },
      offers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            "@type": { const: "Offer" }
          }
        }
      },
      itemCondition: { type: "string" },
      availability: { type: "string" },
      availabilityStarts: { type: "string" },
      availabilityEnds: { type: "string" },
      priceValidUntil: { type: "string" },
      validFrom: { type: "string" },
      validThrough: { type: "string" },
      seller: {
        type: "object",
        properties: {
          "@type": { 
            oneOf: [
              { const: "Organization" },
              { const: "Person" }
            ]
          },
          name: { type: "string" }
        }
      },
      itemOffered: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { type: "string" },
              name: { type: "string" }
            }
          }
        ]
      },
      eligibleQuantity: {
        type: "object",
        properties: {
          "@type": { const: "QuantitativeValue" },
          value: { type: ["number", "string"] },
          minValue: { type: ["number", "string"] },
          maxValue: { type: ["number", "string"] },
          unitCode: { type: "string" }
        }
      },
      eligibleRegion: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
          {
            type: "object",
            properties: {
              "@type": { const: "Place" },
              name: { type: "string" }
            }
          }
        ]
      },
      hasMerchantReturnPolicy: {
        type: "object",
        properties: {
          "@type": { const: "MerchantReturnPolicy" }
        }
      },
      shippingDetails: {
        type: "object",
        properties: {
          "@type": { const: "OfferShippingDetails" }
        }
      }
    },
    recommendedProperties: ["url", "priceCurrency", "lowPrice", "highPrice", "offerCount"]
  },

  SoftwareApplication: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "name", "applicationCategory", "operatingSystem", "url"],
    properties: {
      "@context": { 
        oneOf: [
          { const: "https://schema.org" },
          { const: "http://schema.org" }
        ]
      },
      "@type": { const: "SoftwareApplication" },
      name: { type: "string" },
      applicationCategory: { type: "string" },
      operatingSystem: { type: "string" },
      url: { type: "string" },
      description: { type: "string" },
      author: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          }
        ]
      },
      offers: {
        type: "object",
        properties: {
          "@type": { const: "Offer" },
          price: { type: ["string", "number"] },
          priceCurrency: { type: "string" }
        }
      },
      aggregateRating: {
        type: "object",
        properties: {
          "@type": { const: "AggregateRating" },
          ratingValue: { type: ["number", "string"] },
          reviewCount: { type: ["number", "string"] }
        }
      }
    },
    recommendedProperties: ["description", "author", "offers", "aggregateRating"]
  },

  WebSite: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "WebSite" },
      "@id": { type: "string" },
      url: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      publisher: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Organization" },
                  { const: "Person" }
                ]
              },
              "@id": { type: "string" },
              name: { type: "string" }
            }
          },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      potentialAction: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "SearchAction" },
              target: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      "@type": { const: "EntryPoint" },
                      urlTemplate: { type: "string" }
                    }
                  }
                ]
              },
              "query-input": { type: "string" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      inLanguage: { type: "string" },
      copyrightHolder: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Organization" },
                  { const: "Person" }
                ]
              },
              "@id": { type: "string" },
              name: { type: "string" }
            }
          },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      copyrightYear: { type: ["string", "number"] },
      isAccessibleForFree: { type: "boolean" },
      hasPart: {
        oneOf: [
          { type: "object" },
          { type: "array", items: { type: "object" } }
        ]
      },
      isPartOf: {
        oneOf: [
          { type: "object" },
          { type: "array", items: { type: "object" } }
        ]
      },
      alternateName: { type: "string" }
    },
    recommendedProperties: ["url", "name", "description", "publisher"]
  },

  WebPage: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { 
        oneOf: [
          { const: "WebPage" },
          { const: "ItemPage" },
          { const: "AboutPage" },
          { const: "ContactPage" },
          { const: "CollectionPage" },
          { const: "ProfilePage" },
          { const: "SearchResultsPage" }
        ]
      },
      "@id": { type: "string" },
      url: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      breadcrumb: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "BreadcrumbList" },
              "@id": { type: "string" },
              itemListElement: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    "@type": { const: "ListItem" },
                    position: { type: "number" },
                    item: {
                      oneOf: [
                        { type: "string" },
                        {
                          type: "object",
                          properties: {
                            "@id": { type: "string" },
                            name: { type: "string" }
                          }
                        }
                      ]
                    },
                    name: { type: "string" }
                  }
                }
              }
            }
          },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      mainEntity: {
        oneOf: [
          { type: "string" },
          { type: "object" },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      primaryImageOfPage: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              "@id": { type: "string" },
              url: { type: "string" },
              contentUrl: { type: "string" },
              width: { type: ["string", "number"] },
              height: { type: ["string", "number"] },
              caption: { type: "string" }
            }
          },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      datePublished: { type: "string" },
      dateModified: { type: "string" },
      author: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              "@id": { type: "string" },
              name: { type: "string" }
            }
          },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      isPartOf: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "WebSite" },
              "@id": { type: "string" },
              name: { type: "string" }
            }
          },
          {
            type: "object",
            properties: {
              "@id": { type: "string" }
            }
          }
        ]
      },
      inLanguage: { type: "string" },
      potentialAction: {
        oneOf: [
          { type: "object" },
          { type: "array", items: { type: "object" } }
        ]
      },
      speakable: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { const: "SpeakableSpecification" },
              cssSelector: {
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              },
              xpath: {
                oneOf: [
                  { type: "string" },
                  { type: "array", items: { type: "string" } }
                ]
              }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      lastReviewed: { type: "string" },
      reviewedBy: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Person" },
                  { const: "Organization" }
                ]
              },
              name: { type: "string" }
            }
          }
        ]
      },
      image: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              url: { type: "string" }
            }
          }
        ]
      }
    },
    recommendedProperties: ["url", "name", "description", "breadcrumb", "datePublished", "dateModified"]
  },

  Person: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "Person" },
      "@id": { type: "string" },
      name: { type: "string" },
      givenName: { type: "string" },
      familyName: { type: "string" },
      additionalName: { type: "string" },
      url: { type: "string" },
      image: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
          {
            type: "object",
            properties: {
              "@type": { const: "ImageObject" },
              url: { type: "string" }
            }
          }
        ]
      },
      jobTitle: { type: "string" },
      worksFor: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Organization" },
              name: { type: "string" }
            }
          }
        ]
      },
      email: { type: "string" },
      telephone: { type: "string" },
      address: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "PostalAddress" },
              streetAddress: { type: "string" },
              addressLocality: { type: "string" },
              addressRegion: { type: "string" },
              postalCode: { type: "string" },
              addressCountry: { type: "string" }
            }
          }
        ]
      },
      sameAs: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      description: { type: "string" },
      birthDate: { type: "string" },
      gender: { type: "string" },
      nationality: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Country" },
              name: { type: "string" }
            }
          }
        ]
      },
      affiliation: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { const: "Organization" },
              name: { type: "string" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      alumniOf: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Organization" },
                  { const: "EducationalOrganization" }
                ]
              },
              name: { type: "string" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      },
      award: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      knowsAbout: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      knowsLanguage: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ]
      },
      memberOf: {
        oneOf: [
          {
            type: "object",
            properties: {
              "@type": { 
                oneOf: [
                  { const: "Organization" },
                  { const: "ProgramMembership" }
                ]
              },
              name: { type: "string" }
            }
          },
          { type: "array", items: { type: "object" } }
        ]
      }
    },
    recommendedProperties: ["name", "url", "image", "jobTitle", "worksFor", "sameAs"]
  },

  BreadcrumbList: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type", "itemListElement"],
    properties: {
      "@context": schemaOrgContext,
      "@type": { const: "BreadcrumbList" },
      "@id": { type: "string" },
      itemListElement: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["@type", "position"],
          properties: {
            "@type": { const: "ListItem" },
            position: { type: "number" },
            item: {
              oneOf: [
                { type: "string" },
                {
                  type: "object",
                  properties: {
                    "@id": { type: "string" },
                    "@type": { type: "string" },
                    name: { type: "string" },
                    url: { type: "string" }
                  }
                }
              ]
            },
            name: { type: "string" },
            url: { type: "string" }
          }
        }
      },
      numberOfItems: { type: "number" },
      name: { type: "string" },
      description: { type: "string" }
    },
    recommendedProperties: []
  },

  // Fallback schema for unknown types
  fallback: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["@context", "@type"],
    properties: {
      "@context": { type: "string" },
      "@type": { type: "string" }
    }
  }
};

// Map of type names to schema keys (handles subtypes)
export function getSchemaForType(type: any): any {
  // Handle null/undefined
  if (!type) {
    console.warn('No @type found, using default Organization schema');
    return schemas.Organization;
  }
  
  // Handle array of types
  if (Array.isArray(type)) {
    // Try each type until we find a match
    for (const t of type) {
      if (typeof t === 'string') {
        // Check for exact match first
        if (schemas[t]) {
          return schemas[t];
        }
        // Check for Organization subtypes
        if (t.endsWith('Organization') || t === 'OnlineStore') {
          return schemas.Organization;
        }
        // Check for LocalBusiness subtypes
        if (t.endsWith('Business') || t === 'ProfessionalService') {
          return schemas.LocalBusiness;
        }
        // Article subtypes
        if (t === 'NewsArticle' || t === 'BlogPosting' || t.includes('Article')) {
          return schemas.Article;
        }
        // WebPage subtypes
        if (t === 'ItemPage' || t === 'AboutPage' || t === 'ContactPage' || 
            t === 'CollectionPage' || t === 'ProfilePage' || t === 'SearchResultsPage') {
          return schemas.WebPage;
        }
        // Event subtypes
        if (t.endsWith('Event')) {
          return schemas.Event;
        }
      }
    }
  }
  
  // Handle string type
  if (typeof type === 'string') {
    // Direct match
    if (schemas[type]) {
      return schemas[type];
    }
    
    // Check if it's an Organization subtype
    if (type === 'OnlineStore' || type.endsWith('Organization')) {
      return schemas.Organization;
    }
    
    // Check if it's a LocalBusiness subtype
    if (type.endsWith('Business') || type === 'ProfessionalService') {
      return schemas.LocalBusiness;
    }
    
    // Article subtypes
    if (type === 'NewsArticle' || type === 'BlogPosting' || type.includes('Article')) {
      return schemas.Article;
    }
    
    // WebPage subtypes
    if (type === 'ItemPage' || type === 'AboutPage' || type === 'ContactPage' || 
        type === 'CollectionPage' || type === 'ProfilePage' || type === 'SearchResultsPage') {
      return schemas.WebPage;
    }
    
    // Event subtypes
    if (type.endsWith('Event')) {
      return schemas.Event;
    }
  }
  
  // Handle object type (rare but possible)
  if (typeof type === 'object' && type['@id']) {
    // Extract type from @id if possible
    const typeId = type['@id'];
    if (typeof typeId === 'string') {
      const typeName = typeId.split('/').pop();
      return getSchemaForType(typeName);
    }
  }
  
  console.warn(`Unknown @type format: ${JSON.stringify(type)}, using default schema`);
  return schemas.Organization; // Default fallback
}

// Get recommended properties for a type
export function getRecommendedProperties(type: string): string[] {
  const schema = getSchemaForType(type);
  return schema.recommendedProperties || [];
}
