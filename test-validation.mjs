// Quick test for schema validation
const testData = {
  "@context": "http://schema.org/",  // With trailing slash
  "@type": "ProductGroup",
  "name": "Test Product Group",
  "description": "Testing the validation"
};

console.log('Test JSON-LD:', JSON.stringify(testData, null, 2));

// Test the validator
import('./src/app/utils/validator.js').then(async (module) => {
  const result = await module.validateJsonLd(JSON.stringify(testData));
  
  console.log('\nValidation Result:');
  console.log('Errors:', result.errors.length);
  result.errors.forEach(e => console.log('  -', e.message));
  
  console.log('Warnings:', result.warnings.length);
  result.warnings.forEach(w => console.log('  -', w.message));
});
