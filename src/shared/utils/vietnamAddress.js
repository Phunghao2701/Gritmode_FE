/**
 * Vietnam Administrative Divisions (Tỉnh/Thành, Quận/Huyện, Phường/Xã)
 * Fetches from standard Open-API with persistent local caching and offline fallback.
 */

const FALLBACK_PROVINCES = [
  'Thành phố Hà Nội',
  'Thành phố Hồ Chí Minh',
  'Thành phố Hải Phòng',
  'Thành phố Đà Nẵng',
  'Thành phố Cần Thơ',
  'Tỉnh An Giang',
  'Tỉnh Bà Rịa - Vũng Tàu',
  'Tỉnh Bắc Giang',
  'Tỉnh Bắc Kạn',
  'Tỉnh Bạc Liêu',
  'Tỉnh Bắc Ninh',
  'Tỉnh Bến Tre',
  'Tỉnh Bình Định',
  'Tỉnh Bình Dương',
  'Tỉnh Bình Phước',
  'Tỉnh Bình Thuận',
  'Tỉnh Cà Mau',
  'Tỉnh Cao Bằng',
  'Tỉnh Đắk Lắk',
  'Tỉnh Đắk Nông',
  'Tỉnh Điện Biên',
  'Tỉnh Đồng Nai',
  'Tỉnh Đồng Tháp',
  'Tỉnh Gia Lai',
  'Tỉnh Hà Giang',
  'Tỉnh Hà Nam',
  'Tỉnh Hà Tĩnh',
  'Tỉnh Hải Dương',
  'Tỉnh Hậu Giang',
  'Tỉnh Hòa Bình',
  'Tỉnh Hưng Yên',
  'Tỉnh Khánh Hòa',
  'Tỉnh Kiên Giang',
  'Tỉnh Kon Tum',
  'Tỉnh Lai Châu',
  'Tỉnh Lâm Đồng',
  'Tỉnh Lạng Sơn',
  'Tỉnh Lào Cai',
  'Tỉnh Long An',
  'Tỉnh Nam Định',
  'Tỉnh Nghệ An',
  'Tỉnh Ninh Bình',
  'Tỉnh Ninh Thuận',
  'Tỉnh Phú Thọ',
  'Tỉnh Phú Yên',
  'Tỉnh Quảng Bình',
  'Tỉnh Quảng Nam',
  'Tỉnh Quảng Ngãi',
  'Tỉnh Quảng Ninh',
  'Tỉnh Quảng Trị',
  'Tỉnh Sóc Trăng',
  'Tỉnh Sơn La',
  'Tỉnh Tây Ninh',
  'Tỉnh Thái Bình',
  'Tỉnh Thái Nguyên',
  'Tỉnh Thanh Hóa',
  'Tỉnh Thừa Thiên Huế',
  'Tỉnh Tiền Giang',
  'Tỉnh Trà Vinh',
  'Tỉnh Tuyên Quang',
  'Tỉnh Vĩnh Long',
  'Tỉnh Vĩnh Phúc',
  'Tỉnh Yên Bái',
];

const CACHE_KEY = 'gritmode_vn_provinces_v2';
let memoryTree = null;
let fetchPromise = null;

export const normalizeLocationName = (str) => {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(tinh|thanh pho|tp\.|tp|quan|huyen|thi xa|tx|phuong|xa|thi tran|tt)\s+/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const loadVietnamAddressTree = async () => {
  if (memoryTree && memoryTree.length > 0) return memoryTree;

  // Try reading localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= 60) {
        memoryTree = parsed;
        return memoryTree;
      }
    }
  } catch {}

  // Fetch online with deduplication
  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/?depth=3');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length >= 60) {
            memoryTree = data;
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            } catch {}
            return data;
          }
        }
      } catch (err) {
        console.warn('Could not load online Vietnam address tree, using fallback:', err);
      }
      // Fallback minimal structure
      memoryTree = FALLBACK_PROVINCES.map((p, idx) => ({
        code: idx + 1,
        name: p,
        districts: [],
      }));
      return memoryTree;
    })();
  }

  const result = await fetchPromise;
  fetchPromise = null;
  return result;
};

// Initial sync load if cached
try {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) memoryTree = JSON.parse(cached);
} catch {}

export const getInitialProvincesList = () => {
  if (memoryTree && memoryTree.length > 0) {
    return memoryTree.map((p) => p.name);
  }
  return FALLBACK_PROVINCES;
};

export const findProvinceObject = (tree, provinceName) => {
  if (!tree || !provinceName) return null;
  const targetNorm = normalizeLocationName(provinceName);
  return tree.find(
    (p) =>
      p.name === provinceName ||
      normalizeLocationName(p.name) === targetNorm ||
      p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
      provinceName.toLowerCase().includes(p.name.toLowerCase())
  );
};

export const findDistrictObject = (provinceObj, districtName) => {
  if (!provinceObj || !Array.isArray(provinceObj.districts) || !districtName) return null;
  const targetNorm = normalizeLocationName(districtName);
  return provinceObj.districts.find(
    (d) =>
      d.name === districtName ||
      normalizeLocationName(d.name) === targetNorm ||
      d.name.toLowerCase().includes(districtName.toLowerCase()) ||
      districtName.toLowerCase().includes(d.name.toLowerCase())
  );
};
