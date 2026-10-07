import React from 'react';
import { optionValueAvailabilityKey } from '../utils/product.utils';

/**
 * Dynamic Product Variant Options Selector
 * Renders any combination of product options (Color, Size, Material, etc.) returned by Backend.
 */
export default function ProductVariantSelector({
  options = [],
  selectedOptionValues = {},
  availableOptionValues = {},
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
        const values = (option.values || []).filter((value) => !value.is_hidden);
        if (values.length === 0) return null;
        const selectedValueId = selectedOptionValues[optionId];
        const selectedValueObj = values.find((v) => v.product_option_value_id === selectedValueId);

        const isSizeOption =
          optionName.toLowerCase().includes('size') ||
          optionName.toLowerCase().includes('kích');

        return (
          <div key={optionId} className="space-y-2.5">
            {/* Option Label & Selected Value */}
            <div className="flex items-center justify-between text-xs uppercase tracking-wider">
              <span className="font-normal text-neutral-500">{optionName}:</span>
              {selectedValueObj && (
                <span className="font-[550] text-black dark:text-white">
                  {selectedValueObj.value_option}
                </span>
              )}
            </div>

            {/* Option Values List */}
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const valId = val.product_option_value_id;
                const isSelected = selectedValueId === valId;
                const isAvailable = availableOptionValues[optionValueAvailabilityKey(optionId, valId)] === true;
                const unavailableLabel = `${val.value_option} - Hết hàng`;

                // For Size options, render as square box; for other options, render as pill
                if (isSizeOption) {
                  return (
                    <button
                      key={valId}
                      type="button"
                      disabled={!isAvailable}
                      aria-label={isAvailable ? val.value_option : unavailableLabel}
                      onClick={() => onSelectOptionValue(optionId, valId)}
                      className={`min-w-[56px] h-12 px-2 rounded-xl text-xs font-[550] uppercase flex flex-col items-center justify-center gap-0.5 border transition-all ${
                        !isAvailable
                          ? 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                          : isSelected
                          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer'
                      }`}
                      title={isAvailable ? val.value_option : unavailableLabel}
                    >
                      <span className={!isAvailable ? 'line-through decoration-neutral-400' : ''}>{val.value_option}</span>
                      {!isAvailable && <span className="text-[10px] font-semibold normal-case tracking-normal leading-none text-rose-600 dark:text-rose-400">Hết hàng</span>}
                    </button>
                  );
                }

                return (
                  <button
                    key={valId}
                    type="button"
                    disabled={!isAvailable}
                    aria-label={isAvailable ? val.value_option : unavailableLabel}
                    onClick={() => onSelectOptionValue(optionId, valId)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-[550] uppercase border transition-all ${
                      !isAvailable
                        ? 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                        : isSelected
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer'
                    }`}
                    title={isAvailable ? val.value_option : unavailableLabel}
                  >
                    <span className={!isAvailable ? 'line-through decoration-neutral-400' : ''}>{val.value_option}</span>
                    {!isAvailable && <span className="ml-1 text-[10px] font-semibold normal-case tracking-normal text-rose-600 dark:text-rose-400">Hết hàng</span>}
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
