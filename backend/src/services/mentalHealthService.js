class MentalHealthService {
  constructor() {
    this.patientsData = [];
  }

  addPatientData(patientId, data) {
    const patientIndex = this.patientsData.findIndex(patient => patient.id === patientId);
    if (patientIndex !== -1) {
      this.patientsData[patientIndex].data.push(data);
    } else {
      this.patientsData.push({ id: patientId, data: [data] });
    }
  }

  getPatientData(patientId) {
    const patient = this.patientsData.find(item => item.id === patientId);
    return patient ? patient.data : null;
  }

  getAllPatientsData() {
    return this.patientsData;
  }

  updatePatientData(patientId, data) {
    const patientIndex = this.patientsData.findIndex(patient => patient.id === patientId);
    if (patientIndex !== -1) {
      this.patientsData[patientIndex].data = data;
    }
  }
}

module.exports = MentalHealthService;
