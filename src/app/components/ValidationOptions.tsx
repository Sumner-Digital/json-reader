import { ValidationOptions } from '../utils/validator';

interface ValidationOptionsProps {
  options: ValidationOptions;
  onChange: (options: ValidationOptions) => void;
}

export default function ValidationOptionsComponent({ options, onChange }: ValidationOptionsProps) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Validation Options</h3>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={options.checkRecommendedProperties !== false}
            onChange={(e) => onChange({
              ...options,
              checkRecommendedProperties: e.target.checked
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Check for recommended properties</span>
        </label>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={options.graphItemsNeedRecommended === true}
            disabled={options.checkRecommendedProperties === false}
            onChange={(e) => onChange({
              ...options,
              graphItemsNeedRecommended: e.target.checked
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span>Require recommended properties for @graph items</span>
        </label>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={options.checkHttpUrls !== false}
            onChange={(e) => onChange({
              ...options,
              checkHttpUrls: e.target.checked
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Check for insecure HTTP URLs</span>
        </label>
      </div>
    </div>
  );
}
