export interface Patient {
    id: string;
    name: string;
    age: number;
    mentalHealthMetrics: {
        anxietyLevel: number;
        depressionLevel: number;
        stressLevel: number;
        lastAssessmentDate: Date;
    };
}