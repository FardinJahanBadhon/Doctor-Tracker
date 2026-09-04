import { PatientDetails } from "@/features/patients/PatientDetails";

export default async function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientDetails patientId={id} />;
}
