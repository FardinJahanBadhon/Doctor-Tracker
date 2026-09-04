import { DoctorDetails } from "@/features/doctors/DoctorDetails";

export default async function DoctorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoctorDetails doctorId={id} />;
}
