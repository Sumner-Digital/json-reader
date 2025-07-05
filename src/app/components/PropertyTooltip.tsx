'use client';

import React, { useState } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal
} from '@floating-ui/react';

interface PropertyTooltipProps {
  children: React.ReactNode;
  propertyName: string;
}

// Complete property explanations for all 102 properties
const propertyExplanations: Record<string, string> = {
  // Technical/Required Properties
  '@context': 'Technical requirement that identifies this as structured data. Must always be "https://schema.org" for Google to understand your content. This tells search engines what vocabulary you\'re using.',
  '@type': 'Defines what kind of thing you\'re describing (Organization, Product, Article, etc.). This helps Google understand how to categorize and display your content in search results.',
  '@id': 'Unique identifier for this item. Optional but useful for connecting related data. Usually a URL that represents this specific item.',

  // Common Properties
  'name': 'The official name of your business, product, or item as it should appear in search results. This is one of the most important properties.',
  'url': 'The main website URL for this item. For organizations, this is your homepage. For products, it\'s the product page. Always use the full URL including https://',
  'description': 'A clear, concise description of your item. This may appear in search results so make it informative and engaging. Avoid keyword stuffing.',
  'image': 'URL to an image representing this item. For best results, use high-quality images at least 1200px wide. Google may use this in rich results.',
  
  // Organization Properties
  'logo': 'URL to your organization\'s logo image. Should be at least 112x112px, on a white background. Google may show this in knowledge panels and search results.',
  'alternateName': 'An alternative name, nickname, or abbreviation for your organization. Useful if people know you by different names.',
  'email': 'Primary contact email address for your organization. Make sure this is monitored and valid.',
  'telephone': 'Main phone number for your organization. Include country code (e.g., +1-555-555-5555). This may appear in search results.',
  'faxNumber': 'Fax number if applicable. Include country code. Less commonly used today but still valid for some businesses.',
  
  // Address Properties
  'address': 'Physical location of your business. Contains structured address components like street, city, postal code. Critical for local SEO.',
  'streetAddress': 'Street number and name. Be specific and consistent with your Google Business Profile listing.',
  'addressLocality': 'City or town name. Should match official city names, not neighborhoods or districts.',
  'addressRegion': 'State, province, or region. Use standard abbreviations (e.g., "NY" for New York).',
  'postalCode': 'ZIP code or postal code. Include full code with any extensions (e.g., 12345-6789).',
  'addressCountry': 'Country code using ISO 3166-1 alpha-2 format (e.g., "US" for United States, "GB" for United Kingdom).',
  'postOfficeBoxNumber': 'P.O. Box number if mail is received at a post office box instead of street address.',
  
  // Contact Properties
  'contactPoint': 'Detailed contact information for different purposes (sales, support, etc.). Can specify language, area served, and contact type.',
  'contactType': 'Type of contact (e.g., "customer service", "technical support", "sales"). Helps users find the right department.',
  'areaServed': 'Geographic area where services are offered. Can be countries, states, or regions. Helps Google show you to relevant local searches.',
  'availableLanguage': 'Languages in which services are available. Use language codes like "en" for English, "es" for Spanish.',
  
  // Social & Identity Properties
  'sameAs': 'Links to your official social media profiles and other web presences. Helps Google connect all your online profiles. Include Facebook, Twitter/X, LinkedIn, Instagram, YouTube, Wikipedia, etc.',
  
  // Business Identity Numbers
  'duns': 'Dun & Bradstreet DUNS number - a unique 9-digit identifier for businesses. Used for business credit and verification.',
  'taxID': 'Tax identification number for your business. Format varies by country. In US, this might be your EIN.',
  'vatID': 'Value Added Tax identification number. Required for businesses in EU and other countries with VAT systems.',
  'globalLocationNumber': 'GS1 Global Location Number (GLN) - 13-digit number identifying physical locations and legal entities.',
  'legalName': 'Official registered legal name of your organization, which may differ from your public-facing name.',
  'leiCode': 'Legal Entity Identifier - 20-character code identifying legal entities participating in financial transactions.',
  'naics': 'North American Industry Classification System code. 6-digit code categorizing your business type for statistical purposes.',
  'isicV4': 'International Standard Industrial Classification revision 4 code. UN system for classifying economic activities.',
  'iso6523Code': 'ISO 6523 identifier for organizations. Format: ICD:Identifier (e.g., "0199:123456789" for LEI).',
  
  // Company Details
  'foundingDate': 'Date when the organization was founded. Use ISO 8601 format (YYYY-MM-DD). Adds credibility and history.',
  'founder': 'Person or organization who founded the company. Can enhance your knowledge panel with historical information.',
  'numberOfEmployees': 'Total number of employees. Can be exact number or range. Shows company size and scale.',
  'tickerSymbol': 'Stock ticker symbol if publicly traded. Links your organization to financial data.',
  'dissolutionDate': 'Date when organization ceased operations, if applicable. Use ISO 8601 format.',
  
  // Organizational Structure
  'department': 'Departments within your organization. Useful for large companies to highlight different divisions.',
  'parentOrganization': 'Parent company if this is a subsidiary. Helps Google understand corporate relationships.',
  'subOrganization': 'Subsidiary organizations under this company. Shows corporate structure and related entities.',
  'memberOf': 'Organizations this entity belongs to (trade associations, chambers of commerce, etc.).',
  'owns': 'Products, services, or other entities owned by this organization. Shows what belongs to your company.',
  'sponsor': 'Person or organization that sponsors this entity. Common for events, programs, or content.',
  
  // Content & Knowledge
  'knowsAbout': 'Topics or areas of expertise. Helps establish your organization as an authority in specific fields.',
  'knowsLanguage': 'Languages your organization operates in. Different from availableLanguage - this is about capability.',
  'publishingPrinciples': 'URL to your editorial guidelines, ethics policy, or content standards. Builds trust and transparency.',
  'award': 'Awards, certifications, or recognitions received. Adds credibility and achievements to your profile.',
  'slogan': 'Company tagline or motto. The memorable phrase associated with your brand.',
  
  // Business Operations
  'serviceType': 'Specific type of service offered. More detailed than just your business category.',
  'priceRange': 'General price level using dollar signs ($-$$$$) or descriptive text. Helps set customer expectations.',
  'openingHoursSpecification': 'Detailed business hours including special hours for holidays. Critical for local businesses.',
  
  // Product Properties
  'sku': 'Stock Keeping Unit - your internal product identifier. Unique code used for inventory tracking.',
  'gtin': 'Global Trade Item Number - international product identifier. Includes UPC, EAN, ISBN, etc.',
  'gtin8': '8-digit GTIN (EAN-8), typically used for small products where space is limited.',
  'gtin12': '12-digit GTIN (UPC-A), standard barcode format used in North America.',
  'gtin13': '13-digit GTIN (EAN-13), standard international product barcode format.',
  'gtin14': '14-digit GTIN used for multipacks and cases in wholesale/logistics.',
  'isbn': 'International Standard Book Number. Required for books. Use ISBN-13 format when possible.',
  'mpn': 'Manufacturer Part Number - unique identifier assigned by the manufacturer. Important for technical products.',
  'productID': 'Generic product identifier when specific GTIN types don\'t apply.',
  
  // Product Details
  'brand': 'Brand or manufacturer of the product. Can be text or a structured Brand object. Critical for product recognition.',
  'color': 'Primary color of the product. Use simple, searchable terms like "red" not "crimson sunset".',
  'size': 'Size of the product. Can be simple (S, M, L) or detailed with measurement system.',
  'material': 'Primary material composition (e.g., "cotton", "stainless steel"). Important for apparel and furniture.',
  'pattern': 'Pattern or design on the product (e.g., "striped", "floral"). Mainly for apparel and textiles.',
  
  // Product Grouping
  'inProductGroupWithID': 'ID reference to a ProductGroup this variant belongs to. Used for product variants system.',
  'isVariantOf': 'Reference to the parent ProductGroup. Links product variants to their main product.',
  'hasVariant': 'List of product variants (different colors, sizes, etc.) for a ProductGroup.',
  'variesBy': 'Properties that differ between variants (e.g., "color", "size"). Defines variant relationships.',
  'productGroupID': 'Unique identifier for a group of product variants sharing common properties.',
  
  // Audience & Targeting
  'audience': 'Target audience for the product (age range, gender, etc.). Helps with demographic targeting.',
  'suggestedGender': 'Intended gender for the product (male, female, unisex). Part of audience specification.',
  'suggestedAge': 'Recommended age range. Can be specific numbers or ranges like "newborn", "adult".',
  'suggestedMinAge': 'Minimum recommended age in years. Important for toys and children\'s products.',
  'suggestedMaxAge': 'Maximum recommended age in years. Helps define appropriate age ranges.',
  
  // Ratings & Reviews
  'review': 'Individual review of the product or organization. Can include rating, text, and reviewer information.',
  'aggregateRating': 'Combined rating from multiple reviews. Shows overall rating score and count.',
  'ratingValue': 'Numeric rating value (e.g., 4.5). Usually on a scale of 1-5 but can vary.',
  'bestRating': 'Maximum possible rating in the scale (usually 5). Defines the rating scale ceiling.',
  'worstRating': 'Minimum possible rating in the scale (usually 1). Defines the rating scale floor.',
  'reviewCount': 'Total number of reviews. Shows how many people have reviewed this item.',
  'ratingCount': 'Total number of ratings. May differ from reviewCount if some ratings lack written reviews.',
  'author': 'Creator of the content, review, or article. Can be a person or organization.',
  
  // Pricing & Offers
  'offers': 'Pricing and availability information. Contains price, currency, availability status, and seller details.',
  'price': 'Product price as number or text. Can include ranges. Always specify currency.',
  'lowPrice': 'Lowest price in a range for AggregateOffer. Used when prices vary.',
  'highPrice': 'Highest price in a range for AggregateOffer. Shows maximum price point.',
  'offerCount': 'Number of offers available in an AggregateOffer. Shows variety of options.',
  'priceCurrency': 'Three-letter ISO 4217 currency code (e.g., "USD", "EUR", "GBP"). Required when specifying price.',
  'priceSpecification': 'Detailed pricing structure including special prices for members, tiers, or conditions.',
  'priceValidUntil': 'Date until which the price is valid. Use ISO 8601 format. Important for sales and promotions.',
  'availability': 'Product availability status using schema.org values (InStock, OutOfStock, PreOrder, etc.).',
  'availabilityStarts': 'Date when item becomes available. Use for pre-orders or seasonal items.',
  'availabilityEnds': 'Date when item stops being available. Use for limited-time offers.',
  'itemCondition': 'Condition of the item (NewCondition, UsedCondition, RefurbishedCondition, etc.).',
  'seller': 'Organization or person selling the item. Important for marketplaces with multiple sellers.',
  'validFrom': 'Start date for offer validity. Alternative to priceValidUntil for date ranges.',
  'validThrough': 'End date for offer validity. Indicates when an offer expires.',
  
  // Shipping & Returns
  'shippingDetails': 'Structured shipping information including rates, destinations, and delivery times.',
  'hasMerchantReturnPolicy': 'Return policy details including time limits, fees, and conditions. Builds buyer confidence.',
  'returnPolicyCategory': 'Type of return policy using schema.org values (e.g., MerchantReturnFiniteReturnWindow).',
  'merchantReturnDays': 'Number of days customers have to return items. Clear return windows build trust.',
  'returnMethod': 'How returns are processed (e.g., ReturnByMail, ReturnInStore). Sets expectations.',
  'returnFees': 'Who pays for returns (e.g., FreeReturn, ReturnFeesCustomerResponsibility).',
  'refundType': 'Type of refund offered (e.g., FullRefund, PartialRefund, ExchangeOnly).',
  
  // Membership & Loyalty
  'hasMemberProgram': 'Loyalty or membership program details. Shows benefits and tiers available.',
  'membershipNumber': 'Unique identifier for a membership. Used to track member benefits.',
  'programName': 'Name of the membership or loyalty program. Should be recognizable to members.',
  'membershipPointsEarned': 'Points or rewards earned in the program. Shows value proposition.',
  
  // Event Properties
  'startDate': 'When an event begins. Use ISO 8601 format including time and timezone if relevant.',
  'endDate': 'When an event ends. Important for multi-day events. Use ISO 8601 format.',
  'location': 'Where an event takes place. Can be physical address or online location.',
  'performer': 'Person or group performing at an event. Relevant for concerts, shows, sports.',
  'organizer': 'Entity organizing the event. Helps establish credibility and responsibility.',
  'eventStatus': 'Current status of event (scheduled, cancelled, postponed, etc.).',
  'eventAttendanceMode': 'How people attend - offline, online, or mixed. Important for virtual events.',
  
  // Article/Content Properties
  'headline': 'Article title or main heading. Should be compelling and accurate. May appear in search results.',
  'articleBody': 'Full text content of an article. Main content that gets indexed by search engines.',
  'datePublished': 'When content was first published. Use ISO 8601 format. Important for freshness.',
  'dateModified': 'When content was last updated. Shows content is maintained and current.',
  'publisher': 'Organization publishing the content. Should include name and logo for rich results.',
  
  // FAQ/Q&A Properties
  'mainEntity': 'Primary content for FAQ and Q&A pages. Contains the questions and answers structured data.',
  'questionText': 'The actual question being asked. Should be clear and reflect real user queries.',
  'answerText': 'The answer to a question. Should be helpful, accurate, and complete.',
  'answerCount': 'Number of answers to a question in Q&A format. Shows activity level.',
  'acceptedAnswer': 'Best or accepted answer to a question. Highlighted in search results.',
  'suggestedAnswer': 'Additional answers to a question. Provides multiple perspectives.',
  'upvoteCount': 'Number of positive votes for an answer. Shows community approval.',
  
  // How-To Properties
  'step': 'Individual steps in a how-to guide. Should be clear, sequential instructions.',
  'totalTime': 'Total time needed to complete a how-to. Use ISO 8601 duration format (e.g., PT30M).',
  'estimatedCost': 'Approximate cost to complete a how-to project. Helps users budget.',
  'tool': 'Tools required for a how-to. Lists necessary equipment or software.',
  'supply': 'Materials or supplies needed. Helps users prepare before starting.',
  
  // Software Properties
  'applicationCategory': 'Type of software (e.g., "GameApplication", "BusinessApplication"). Categorizes in app stores.',
  'operatingSystem': 'Required OS (e.g., "Windows 10", "Android 5.0", "iOS 12.0"). Sets compatibility expectations.',
  'softwareVersion': 'Current version number of software. Important for updates and compatibility.',
  'softwareRequirements': 'System requirements for running software. CPU, RAM, disk space, etc.',
  'downloadUrl': 'Direct link to download the software. Should be secure and official source.',
  
  // Certification & Compliance
  'hasCertification': 'Official certifications earned (ISO, safety, quality, etc.). Builds trust and credibility.',
  'certificationIdentification': 'Unique ID for a certification. Reference number for verification.',
  'certificationRating': 'Grade or score achieved in certification. Shows level of compliance.',
  'issuedBy': 'Organization that issued a certification or credential. Establishes authority.',
  
  // Media Properties
  'contentUrl': 'Direct URL to media file (image, video, audio). Must be accessible to Google.',
  'embedUrl': 'URL for embedding media in other pages. Common for videos and interactive content.',
  'encodingFormat': 'MIME type of media (e.g., "video/mp4", "image/jpeg"). Helps browsers handle content.',
  'duration': 'Length of audio or video content. Use ISO 8601 format (e.g., PT4M30S for 4:30).',
  
  // Miscellaneous
  'identifier': 'Generic identifier property. Fallback when more specific ID types don\'t apply.',
  'additionalType': 'More specific type beyond the main @type. Adds precision to categorization.',
  'disambiguatingDescription': 'Short description to distinguish from similar items. Helps when names are common.',
  'mainEntityOfPage': 'Primary URL where this item is described. Indicates canonical source.',
  'potentialAction': 'Actions users can take (search, order, etc.). Enables rich interactive features.',
  'subjectOf': 'Creative works about this item. Links to articles, videos, or other content.',
  'item': 'Generic reference to an item in a list or collection. Context-dependent usage.',
  'itemListElement': 'Individual items within an ItemList. Used for breadcrumbs, steps, etc.',
  'position': 'Numeric position in an ordered list. Important for breadcrumbs and ranked lists.',
  'value': 'Generic value property. Usage depends on context - could be text, number, or structured data.'
};

export default function PropertyTooltip({ children, propertyName }: PropertyTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate,
    placement: 'top'
  });

  const hover = useHover(context, {
    delay: { open: 300, close: 0 },
    move: false
  });
  
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role
  ]);

  // Check if we have an explanation for this property
  const explanation = propertyExplanations[propertyName];
  
  // If no explanation exists, just render children without tooltip
  if (!explanation) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        style={{ cursor: 'help' }}
      >
        {children}
      </span>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.4',
              maxWidth: '320px',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              pointerEvents: 'auto'
            }}
            {...getFloatingProps()}
          >
            <div style={{ marginBottom: '4px', fontWeight: 600 }}>
              {propertyName}
            </div>
            <div style={{ opacity: 0.9 }}>
              {explanation}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}