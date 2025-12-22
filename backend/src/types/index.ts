export interface Patient {
    id: string;
    name: string;
    age: number;
    mentalHealthMetrics: MentalHealthMetrics;
}

export interface MentalHealthMetrics {
    anxietyLevel: number;
    depressionLevel: number;
    stressLevel: number;
    lastAssessmentDate: Date;
}

export interface AuthCredentials {
    username: string;
    password: string;
}