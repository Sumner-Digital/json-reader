import { useEffect } from 'react';
import { validateJsonLd } from '../utils/validator';
import type { ValidationResult } from '../utils/validator';

interface JsonLdValidatorProps {
  jsonString: string;
  onValidationComplete: (result: ValidationResult) => void;
}

export default function JsonLdValidator({ 
  jsonString, 
  onValidationComplete 
}: JsonLdValidatorProps) {
  useEffect(() => {
    const runValidation = async () => {
      try {
        const result = await validateJsonLd(jsonString);
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
  }, [jsonString, onValidationComplete]);

  // This component doesn't render anything - it just runs validation
  return null;
}
