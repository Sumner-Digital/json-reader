import type { ErrorObject } from 'ajv';
import { getSchemaForType, getRecommendedProperties, schemaDocUrls } from '../schemas';

export interface ValidationError {
  path: string;
  message: string;
  line?: number;
}

export interface ValidationWarning {
  path: string;
  message: string;
  line?: number;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Convert Ajv error path to readable format
 */
function formatPath(instancePath: string): string {
  if (!instancePath) return 'root';
  // Remove leading slash and convert to dot notation
  return instancePath.substring(1).replace(/\//g, '.');
}

/**
 * Check for HTTP URLs in any string property
 */
function checkHttpUrls(
  obj: any, 
  path = '',
  errors: ValidationError[]
): void {
  if (typeof obj === 'string') {
    // Skip validation for @context field and description fields
    const fieldName = path.split('.').pop() || '';
    if (fieldName === '@context' || fieldName === 'description') {
      return;
    }
    
    // Skip validation for schema.org enumeration values
    if (obj.includes('http://schema.org/') || obj.includes('https://schema.org/')) {
      return;
    }
    
    // Check for http:// pattern
    if (obj.includes('http://')) {
      errors.push({
        path: path || 'root',
        message: 'URL must use HTTPS instead of HTTP for security. Found: ' + obj.substring(0, 50) + (obj.length > 50 ? '...' : '')
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      checkHttpUrls(item, `${path}[${index}]`, errors);
    });
  } else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      checkHttpUrls(value, newPath, errors);
    });
  }
}

/**
 * Map error path to approximate line number in formatted JSON
 */
function estimateLineNumber(jsonString: string, path: string): number | undefined {
  try {
    // This is a simplified estimation - in production you might want
    // to use a JSON parser that tracks positions
    const lines = jsonString.split('\n');
    const pathParts = path.split('.');
    let currentLine = 1;
    
    for (const part of pathParts) {
      for (let i = currentLine; i < lines.length; i++) {
        if (lines[i].includes(`"${part}"`)) {
          currentLine = i + 1;
          break;
        }
      }
    }
    
    return currentLine;
  } catch {
    return undefined;
  }
}

/**
 * Main validation function
 */
export async function validateJsonLd(
  jsonString: string
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    errors.push({
      path: 'root',
      message: 'Invalid JSON syntax'
    });
    return { errors, warnings };
  }

  // Check for @context and @type
  if (!parsed['@context']) {
    errors.push({
      path: 'root',
      message: 'Missing required property "@context"'
    });
  }

  if (!parsed['@type']) {
    errors.push({
      path: 'root',
      message: 'Missing required property "@type"'
    });
  }

  // If basic requirements are missing, return early
  if (!parsed['@context'] || !parsed['@type']) {
    return { errors, warnings };
  }

  // Dynamic import of Ajv
  const Ajv = (await import('ajv')).default;
  const ajv = new Ajv({ 
    allErrors: true,
    strict: false,
    validateFormats: false
  });

  // Get appropriate schema
  const type = parsed['@type'];
  const schema = getSchemaForType(type);
  const typeString = Array.isArray(type) ? type[0] : type; // For display purposes
  
  // Debug logging
  console.log('Validating type:', type);
  console.log('Schema @type definition:', schema.properties?.['@type']);
  
  // Compile and validate
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (e) {
    console.error('Schema compilation error:', e);
    errors.push({
      path: 'root',
      message: 'Internal validation error'
    });
    return { errors, warnings };
  }

  const valid = validate(parsed);

  // Special check for Organization type
  if (!valid && typeString === 'Organization' && parsed['@type'] === 'Organization') {
    // If we're validating Organization type and @type is "Organization", 
    // filter out any @type related errors since this is valid
    const hasOnlyTypeErrors = validate.errors?.every((error: ErrorObject) => 
      error.instancePath === '/@type' || 
      (error.instancePath === '' && error.schemaPath.includes('/@type'))
    );
    
    if (hasOnlyTypeErrors) {
      // Only @type errors, and we know Organization is valid, so no errors
      console.log('Organization type validated successfully despite oneOf errors');
      return { errors, warnings };
    }
  }
  
  if (!valid && validate.errors) {
    // Filter out oneOf errors for @type field
    const filteredErrors = validate.errors.filter((error: ErrorObject) => {
      // Skip oneOf and const errors for @type field
      if ((error.keyword === 'oneOf' || error.keyword === 'const') && 
          (error.instancePath === '/@type' || (error.instancePath === '' && error.schemaPath.includes('/@type')))) {
        return false;
      }
      return true;
    });
    
    // Process filtered errors
    filteredErrors.forEach((error: ErrorObject) => {
      const path = formatPath(error.instancePath);
      
      // Determine if it's an error or warning
      if (error.keyword === 'required') {
        // Check if it's a top-level required field or one of the oneOf requirements
        if (error.instancePath === '' && error.params.missingProperty) {
          const missingProp = error.params.missingProperty;
          
          // Special handling for Product's oneOf requirement
          if (typeString === 'Product' && 
              (missingProp === 'review' || 
               missingProp === 'aggregateRating' || 
               missingProp === 'offers')) {
            // This is handled by the oneOf validation
            return;
          }
          
          errors.push({
            path: path,
            message: `Missing required property "${missingProp}"`,
            line: estimateLineNumber(jsonString, path)
          });
        } else if (error.instancePath !== '') {
          // Nested required property
          const fullPath = path + (path ? '.' : '') + error.params.missingProperty;
          errors.push({
            path: fullPath,
            message: `Missing required property "${error.params.missingProperty}"`,
            line: estimateLineNumber(jsonString, fullPath)
          });
        }
      } else if (error.keyword === 'oneOf') {
        // Special handling for oneOf validations
        if (typeString === 'Product' && error.instancePath === '') {
          errors.push({
            path: 'root',
            message: 'Product must have at least one of: review, aggregateRating, or offers',
            line: 1
          });
        }
      } else if (error.keyword === 'const') {
        // Type mismatch
        errors.push({
          path: path,
          message: `Invalid value for "${path}": expected "${error.params.allowedValue}"`,
          line: estimateLineNumber(jsonString, path)
        });
      }
    });
  }
  
  // Always check for HTTP URLs regardless of schema validation
  checkHttpUrls(parsed, '', errors);

  // Always check for recommended properties (warnings)
  const recommendedProps = getRecommendedProperties(typeString);
  const docUrl = schemaDocUrls[typeString] || schemaDocUrls[type] || '';
  
  recommendedProps.forEach(prop => {
    if (!parsed[prop]) {
      const learnMoreLink = docUrl ? ` - <a href="${docUrl}" target="_blank" style="color: blue; text-decoration: underline;">Learn more</a>` : '';
      warnings.push({
        path: 'root',
        message: `Missing recommended property "${prop}"${learnMoreLink}`,
        line: estimateLineNumber(jsonString, prop)
      });
    }
  });

  return { errors, warnings };
}
