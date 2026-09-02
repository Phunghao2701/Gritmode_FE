export const generateVariantCombinations = (options = []) => {
  if (!options.length) return [[]];
  return options.reduce((combinations, option) => {
    const values = option.values || [];
    if (!values.length) return [];
    return combinations.flatMap((combination) => values.map((value) => [...combination, value]));
  }, [[]]);
};

const slugPart = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-|-$/g, '').toUpperCase();

export const generateSkuSuggestion = (productName, values = []) => {
  const productPart = slugPart(productName).split('-').filter(Boolean).map((part) => part.slice(0, 3)).join('-');
  const valuePart = values.map((item) => slugPart(item.value_option)).filter(Boolean).join('-');
  return [productPart || 'PRODUCT', valuePart || 'DEFAULT'].join('-').slice(0, 100);
};
