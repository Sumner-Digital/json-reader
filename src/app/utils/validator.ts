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

export interface ValidationOptions {
  checkRecommendedProperties?: boolean;
  checkHttpUrls?: boolean;
  graphItemsNeedRecommended?: boolean;
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
 * Validate a single JSON-LD entity
 */
async function validateEntity(
  entity: any,
  ajv: any,
  basePath: string = '',
  jsonString: string,
  options: ValidationOptions = {}
): Promise<{ errors: ValidationError[], warnings: ValidationWarning[] }> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for @context and @type
  if (!entity['@context']) {
    errors.push({
      path: basePath || 'root',
      message: 'Missing required property "@context"'
    });
  }

  if (!entity['@type']) {
    errors.push({
      path: basePath || 'root',
      message: 'Missing required property "@type"'
    });
  }

  // If basic requirements are missing, return early
  if (!entity['@context'] || !entity['@type']) {
    return { errors, warnings };
  }

  // Get appropriate schema
  const type = entity['@type'];
  const schema = getSchemaForType(type);
  const typeString = Array.isArray(type) ? type[0] : type;
  
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
      path: basePath || 'root',
      message: 'Internal validation error'
    });
    return { errors, warnings };
  }

  const valid = validate(entity);

  // Special check for Organization type
  if (!valid && typeString === 'Organization' && entity['@type'] === 'Organization') {
    const hasOnlyTypeErrors = validate.errors?.every((error: ErrorObject) => 
      error.instancePath === '/@type' || 
      (error.instancePath === '' && error.schemaPath.includes('/@type'))
    );
    
    if (hasOnlyTypeErrors) {
      console.log('Organization type validated successfully despite oneOf errors');
      return { errors, warnings };
    }
  }
  
  if (!valid && validate.errors) {
    // Filter out oneOf errors for @type field
    const filteredErrors = validate.errors.filter((error: ErrorObject) => {
      if ((error.keyword === 'oneOf' || error.keyword === 'const') && 
          (error.instancePath === '/@type' || (error.instancePath === '' && error.schemaPath.includes('/@type')))) {
        return false;
      }
      return true;
    });
    
    // Process filtered errors
    filteredErrors.forEach((error: ErrorObject) => {
      const path = basePath + formatPath(error.instancePath);
      
      if (error.keyword === 'required') {
        if (error.instancePath === '' && error.params.missingProperty) {
          const missingProp = error.params.missingProperty;
          
          if (typeString === 'Product' && 
              (missingProp === 'review' || 
               missingProp === 'aggregateRating' || 
               missingProp === 'offers')) {
            return;
          }
          
          errors.push({
            path: basePath || 'root',
            message: `Missing required property "${missingProp}"`,
            line: estimateLineNumber(jsonString, path)
          });
        } else if (error.instancePath !== '') {
          const fullPath = path + (path ? '.' : '') + error.params.missingProperty;
          errors.push({
            path: fullPath,
            message: `Missing required property "${error.params.missingProperty}"`,
            line: estimateLineNumber(jsonString, fullPath)
          });
        }
      } else if (error.keyword === 'oneOf') {
        if (typeString === 'Product' && error.instancePath === '') {
          errors.push({
            path: basePath || 'root',
            message: 'Product must have at least one of: review, aggregateRating, or offers',
            line: 1
          });
        }
      } else if (error.keyword === 'const') {
        errors.push({
          path: path,
          message: `Invalid value for "${path}": expected "${error.params.allowedValue}"`,
          line: estimateLineNumber(jsonString, path)
        });
      }
    });
  }
  
  // Check for HTTP URLs if enabled (default: true)
  if (options.checkHttpUrls !== false) {
    checkHttpUrls(entity, basePath, errors);
  }

  // Check for recommended properties if enabled (default: true)
  if (options.checkRecommendedProperties !== false) {
    // Skip recommended properties for @graph items unless explicitly enabled
    const isGraphItem = basePath.startsWith('@graph[');
    
    // Detect if this is likely a reference node (only has @id, @type, and maybe a few other properties)
    const entityKeys = Object.keys(entity).filter(k => !k.startsWith('@'));
    const isReferenceNode = entity['@id'] && entityKeys.length <= 2;
    
    if ((!isGraphItem || options.graphItemsNeedRecommended === true) && !isReferenceNode) {
      const recommendedProps = getRecommendedProperties(typeString);
      const docUrl = schemaDocUrls[typeString] || schemaDocUrls[type] || '';
      
      recommendedProps.forEach(prop => {
        if (!entity[prop]) {
          const learnMoreLink = docUrl ? ` - <a href="${docUrl}" target="_blank" style="color: blue; text-decoration: underline;">Learn more</a>` : '';
          warnings.push({
            path: basePath || 'root',
            message: `Missing recommended property "${prop}"${learnMoreLink}`,
            line: estimateLineNumber(jsonString, prop)
          });
        }
      });
    }
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
export async function validateJsonLd(
  jsonString: string,
  options: ValidationOptions = {}
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

  // Dynamic import of Ajv
  const Ajv = (await import('ajv')).default;
  const ajv = new Ajv({ 
    allErrors: true,
    strict: false,
    validateFormats: false
  });

  // Check if this is a @graph structure (common with Yoast SEO and other WordPress plugins)
  if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
    // Validate @graph structure
    if (!parsed['@context']) {
      errors.push({
        path: 'root',
        message: 'Missing required property "@context" in @graph structure'
      });
    }

    // Validate each item in the graph
    for (let i = 0; i < parsed['@graph'].length; i++) {
      const item = parsed['@graph'][i];
      const itemPath = `@graph[${i}]`;
      
      // Each item inherits the root @context if it doesn't have its own
      const itemToValidate = {
        ...item,
        '@context': item['@context'] || parsed['@context']
      };
      
      const result = await validateEntity(itemToValidate, ajv, itemPath, jsonString, options);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
  } else {
    // Single entity validation (non-graph)
    const result = await validateEntity(parsed, ajv, '', jsonString, options);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return { errors, warnings };
}
