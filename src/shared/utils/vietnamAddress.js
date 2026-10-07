import { publicApi } from '../services/api';

let memoryTree = null;
let fetchPromise = null;
let addressMetadata = null;

export const normalizeLocationName = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/^(tinh|thanh pho|tp\.?|quan|huyen|thi xa|tx\.?|phuong|xa|thi tran|tt\.?)\s+/i, '')
  .replace(/[^a-z0-9]/g, '')
  .trim();

const normalizeTree = (payload) => {
  if (!payload || !Array.isArray(payload.provinces) || payload.provinces.length === 0) {
    throw new Error('Dữ liệu địa chỉ hành chính từ hệ thống không hợp lệ');
  }

  return payload.provinces.map((province) => ({
    code: province.code,
    name: province.name,
    type: province.type,
    urbanType: province.urbanType,
    regionName: province.regionName,
    communes: Array.isArray(province.communes)
      ? province.communes.map((commune) => ({
        code: commune.code,
        name: commune.name,
        type: commune.type,
        urbanType: commune.urbanType,
        districtCode: commune.districtCode,
        districtName: commune.districtName,
        regionName: commune.regionName,
        ruralUrbanType: commune.ruralUrbanType,
        areaType: commune.areaType,
      }))
      : [],
  }));
};

export const loadVietnamAddressTree = async () => {
  if (memoryTree?.length) return memoryTree;

  if (!fetchPromise) {
    fetchPromise = publicApi.get('/addresses/administrative', {
      headers: { 'Cache-Control': 'no-cache' },
      params: { _ts: Date.now() },
    }).then((response) => {
      const tree = normalizeTree(response.data?.data);
      memoryTree = tree;
      addressMetadata = response.data?.data || null;
      return tree;
    }).finally(() => {
      fetchPromise = null;
    });
  }

  return fetchPromise;
};

export const getInitialProvincesList = () => memoryTree?.map((province) => province.name) || [];
export const getVietnamAddressMetadata = () => addressMetadata;

export const findProvinceObject = (tree, provinceName) => {
  if (!Array.isArray(tree) || !provinceName) return null;
  const target = normalizeLocationName(provinceName);
  return tree.find((province) => (
    province.name === provinceName || normalizeLocationName(province.name) === target
  )) || null;
};

export const findCommuneObject = (province, communeName) => {
  if (!province || !Array.isArray(province.communes) || !communeName) return null;
  const target = normalizeLocationName(communeName);
  return province.communes.find((commune) => (
    commune.name === communeName || normalizeLocationName(commune.name) === target
  )) || null;
};
