const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhoneNumber = phone => /^\+?[1-9]\d{1,14}$/.test(phone);
const validateAge = age => age >= 0 && age <= 120;
const validateMentalHealthMetrics = metrics => ['anxiety', 'depression', 'stress'].every(key => key in metrics);

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validateAge,
  validateMentalHealthMetrics,
};
