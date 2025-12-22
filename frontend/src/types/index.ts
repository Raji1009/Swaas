export interface PatientProfileData {
    id: string;
    name: string;
    age: number;
    mentalHealthMetrics: {
        anxietyLevel: number;
        depressionLevel: number;
        stressLevel: number;
    };
    lastVisit: Date;
    notes?: string;
}