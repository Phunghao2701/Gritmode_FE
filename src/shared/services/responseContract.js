export const unwrapApiData = (response) => {
  const body = response?.data;
  if (!body || typeof body !== 'object' || !Object.prototype.hasOwnProperty.call(body, 'data')) {
    throw new Error('API response không đúng contract chuẩn');
  }
  return body.data;
};

export const requireApiObject = (response, label = 'API response') => {
  const data = unwrapApiData(response);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} không hợp lệ`);
  }
  return data;
};

export const requireApiArray = (response, label = 'API response') => {
  const data = unwrapApiData(response);
  if (!Array.isArray(data)) {
    throw new Error(`${label} không hợp lệ`);
  }
  return data;
};

export const requireObject = (data, label = 'API data') => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} không hợp lệ`);
  }
  return data;
};

export const requireArray = (data, label = 'API data') => {
  if (!Array.isArray(data)) throw new Error(`${label} không hợp lệ`);
  return data;
};
