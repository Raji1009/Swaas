export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

export function validateAge(age: number): boolean {
    return age >= 0 && age <= 120;
}

export function validateMentalHealthMetrics(metrics: Record<string, any>): boolean {
    // Example validation logic for mental health metrics
    const requiredKeys = ['anxiety', 'depression', 'stress'];
    return requiredKeys.every(key => key in metrics);
}