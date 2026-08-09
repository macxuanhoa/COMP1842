// ── Helper validation dùng chung cho các controller ─────────────────
// Gom các logic lặp lại: chuẩn hóa chuỗi, escape regex, validate tên danh mục,
// validate 3 trường ngôn ngữ của Word (đồng bộ rule với front-end)

// Chuẩn hóa giá trị bất kỳ thành chuỗi đã trim (không phải chuỗi → '')
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

// Escape ký tự đặc biệt regex để tránh crash/injection khi Postman gửi dữ liệu thô
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Tạo RegExp so khớp chính xác, không phân biệt hoa thường (dùng cho check trùng)
const exactMatch = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

// Validate tên danh mục (dùng chung cho create & update): trả về { name, error }
const validateCategoryName = (rawName) => {
  const name = normalizeText(rawName);
  if (!name) return { name, error: 'Category name is required.' };
  if (name.length < 2) return { name, error: 'Category name must be at least 2 characters.' };
  if (name.length > 40) return { name, error: 'Category name cannot exceed 40 characters.' };
  return { name, error: null };
};

// Validate 3 trường ngôn ngữ của Word: trả về chuỗi lỗi hoặc null
const validateLanguageFields = ({ german, english, french }) => {
  if (!german || !english || !french) {
    return 'Please fill in all required language fields.';
  }
  if ([german, english, french].some(value => value.length > 80)) {
    return 'Language fields cannot exceed 80 characters.';
  }
  return null;
};

module.exports = {
  normalizeText,
  escapeRegex,
  exactMatch,
  validateCategoryName,
  validateLanguageFields
};
