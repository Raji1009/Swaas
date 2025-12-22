"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMentalHealthMetrics = exports.validateAge = exports.validatePhoneNumber = exports.validateEmail = void 0;
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
exports.validateEmail = validateEmail;
function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}
exports.validatePhoneNumber = validatePhoneNumber;
function validateAge(age) {
    return age >= 0 && age <= 120;
}
exports.validateAge = validateAge;
function validateMentalHealthMetrics(metrics) {
    // Example validation logic for mental health metrics
    const requiredKeys = ['anxiety', 'depression', 'stress'];
    return requiredKeys.every(key => key in metrics);
}
exports.validateMentalHealthMetrics = validateMentalHealthMetrics;
