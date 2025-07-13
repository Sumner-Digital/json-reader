import { useEffect } from 'react';
import { validateJsonLd } from '../utils/validator';
import type { ValidationResult, ValidationOptions } from '../utils/validator';

interface JsonLdValidatorProps {
  jsonString: string;
  onValidationComplete: (result: ValidationResult) => void;
  options?: ValidationOptions;
}

export default function JsonLdValidator({ 
  jsonString, 
  onValidationComplete,
  options = {} 
}: JsonLdValidatorProps) {
  useEffect(() => {
    const runValidation = async () => {
      try {
        // Default: don't show recommended property warnings for @graph items
        const validationOptions: ValidationOptions = {
          checkRecommendedProperties: true,
          checkHttpUrls: true,
          graphItemsNeedRecommended: false,
          ...options
        };
        const result = await validateJsonLd(jsonString, validationOptions);
        onValidationComplete(result);
      } catch (error) {
        console.error('Validation error:', error);
        onValidationComplete({ 
          errors: [{ 
            path: 'root', 
            message: 'Validation failed: ' + (error as Error).message 
          }], 
          warnings: [] 
        });
      }
    };

    runValidation();
  }, [jsonString, onValidationComplete, options]);

  // This component doesn't render anything - it just runs validation
  return null;
}
