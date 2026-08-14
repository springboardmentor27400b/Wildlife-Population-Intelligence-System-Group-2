export const isValidLatitude = (lat) => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90.0 && num <= 90.0;
};

export const isValidLongitude = (lon) => {
  const num = parseFloat(lon);
  return !isNaN(num) && num >= -180.0 && num <= 180.0;
};

export const isValidEmail = (email) => {
  const re = /^[\w\.-]+@[\w\.-]+\.\w+$/;
  return re.test(String(email).toLowerCase());
};
