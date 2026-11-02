import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsAvailabilityApi } from '../apis/product.api';
import { requireApiObject } from '../../../shared/services/responseContract';

const getProductId = (product) => {
  const id = Number(product?.product_id ?? product?.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const useProductAvailabilityBatch = (products = []) => {
  const productIds = useMemo(
    () => [...new Set(products.map(getProductId).filter(Boolean))].sort((a, b) => a - b),
    [products],
  );

  const query = useQuery({
    queryKey: ['product-availability-batch', productIds],
    queryFn: async () => {
      const response = await getProductsAvailabilityApi(productIds);
      const data = requireApiObject(response, 'Tồn kho sản phẩm');
      if (!Array.isArray(data.items)) throw new Error('Danh sách tồn kho không hợp lệ');

      return Object.fromEntries(data.items.map((item) => [
        Number(item.product_id),
        item.is_available === true,
      ]));
    },
    enabled: productIds.length > 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    ...query,
    availabilityByProductId: query.data || {},
  };
};
