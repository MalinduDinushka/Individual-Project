const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^(\+94|0)?[1-9][0-9]{8,9}$/;
const NAME_PATTERN = /^(?=.*\S).{2,80}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
const NIC_PATTERN = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
const VALID_GENDERS = ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'];

const validateEmail = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed);
};

const validateName = (value) => {
  if (typeof value !== 'string') return false;
  return NAME_PATTERN.test(value.trim());
};

const validatePassword = (value) => {
  if (typeof value !== 'string') return false;
  return PASSWORD_PATTERN.test(value);
};

const validatePhone = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return PHONE_PATTERN.test(trimmed);
};

const validateGender = (value) => {
  if (typeof value !== 'string') return false;
  return VALID_GENDERS.includes(value.trim().toLowerCase());
};

const validateNic = (value) => {
  if (typeof value !== 'string') return false;
  return NIC_PATTERN.test(value.trim());
};

const validateRegistrationPayload = (payload = {}, role = 'tourist') => {
  const errors = [];

  if (!validateName(payload.name)) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (!validateEmail(payload.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!validatePassword(payload.password)) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number' });
  }

  if (payload.confirmPassword !== undefined && payload.confirmPassword !== payload.password) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (!validatePhone(payload.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!validateGender(payload.gender)) {
    errors.push({ field: 'gender', message: 'Please select your gender' });
  }

  if (role === 'tourist') {
    if (payload.nationality === 'local') {
      if (!payload.nic) {
        errors.push({ field: 'nic', message: 'NIC is required for local tourists' });
      } else if (!validateNic(payload.nic)) {
        errors.push({ field: 'nic', message: 'Use a valid NIC format: 9 digits + V/X, or 12 digits.' });
      }
    }

    if (payload.nationality === 'foreign' && !payload.passport) {
      errors.push({ field: 'passport', message: 'Passport is required for foreign tourists' });
    }
  }

  if (role === 'provider') {
    if (!payload.nic) {
      errors.push({ field: 'nic', message: 'NIC is required for providers' });
    } else if (!validateNic(payload.nic)) {
      errors.push({ field: 'nic', message: 'Use a valid NIC format: 9 digits + V/X, or 12 digits.' });
    }

    if (!payload.businessInfo?.businessName) {
      errors.push({ field: 'businessInfo.businessName', message: 'Business name is required' });
    }
  }

  return { isValid: errors.length === 0, errors };
};

const validateProfileUpdatePayload = (payload = {}, role = 'tourist') => {
  const errors = [];

  if (payload.name !== undefined && !validateName(payload.name)) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (payload.phone !== undefined && !validatePhone(payload.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (payload.gender !== undefined && !validateGender(payload.gender)) {
    errors.push({ field: 'gender', message: 'Please select your gender' });
  }

  if (role === 'provider' && payload.businessInfo) {
    if (!payload.businessInfo.businessName) {
      errors.push({ field: 'businessInfo.businessName', message: 'Business name is required' });
    }
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateGender,
  validateNic,
  validateRegistrationPayload,
  validateProfileUpdatePayload
};
