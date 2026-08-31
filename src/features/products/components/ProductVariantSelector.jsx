import React from 'react';

/**
 * Dynamic Product Variant Options Selector
 * Renders any combination of product options (Color, Size, Material, etc.) returned by Backend.
 */
export default function ProductVariantSelector({
  options = [],
  selectedOptionValues = {},
  onSelectOptionValue,
}) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5 select-none">
      {options.map((option) => {
        const optionId = option.product_option_id;
        const optionName = option.name_option;
        const values = option.values || [];
        const selectedValueId = selectedOptionValues[optionId];
        const selectedValueObj = values.find((v) => v.product_option_value_id === selectedValueId);

        const isColorOption =
          optionName.toLowerCase().includes('color') ||
          optionName.toLowerCase().includes('màu');

        const isSizeOption =
          optionName.toLowerCase().includes('size') ||
          optionName.toLowerCase().includes('kích');

        return (
          <div key={optionId} className="space-y-2.5">
            {/* Option Label & Selected Value */}
            <div className="flex items-center justify-between text-xs uppercase tracking-wider">
              <span className="font-bold text-neutral-500">{optionName}:</span>
              {selectedValueObj && (
                <span className="font-black text-black dark:text-white">
                  {selectedValueObj.value_option}
                </span>
              )}
            </div>

            {/* Option Values List */}
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const valId = val.product_option_value_id;
                const isSelected = selectedValueId === valId;

                // For Size options, render as square box; for other options, render as pill
                if (isSizeOption) {
                  return (
                    <button
                      key={valId}
                      type="button"
                      onClick={() => onSelectOptionValue(optionId, valId)}
                      className={`min-w-[48px] h-11 px-3.5 rounded-xl text-xs font-black uppercase flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      {val.value_option}
                    </button>
                  );
                }

                return (
                  <button
                    key={valId}
                    type="button"
                    onClick={() => onSelectOptionValue(optionId, valId)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-sm font-black'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    {val.value_option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
