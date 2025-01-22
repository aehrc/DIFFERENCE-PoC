import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { Patient } from "fhir/r4";
import PatientProfile from "@/pages/PatientSummary/PatientTabs/PatientProfile.tsx";
import PatientProfileLoading from "@/pages/PatientSummary/PatientTabs/PatientProfileLoading.tsx";
import PatientConditions from "@/pages/PatientSummary/PatientTabs/PatientConditions.tsx";
import PatientMedications from "@/pages/PatientSummary/PatientTabs/PatientMedications.tsx";
import PatientAllergies from "@/pages/PatientSummary/PatientTabs/PatientAllergies.tsx";
import PatientProcedures from "@/pages/PatientSummary/PatientTabs/PatientProcedures.tsx";
import PatientImmunizations from "@/pages/PatientSummary/PatientTabs/PatientImmunizations.tsx";
import PatientEncounters from "@/pages/PatientSummary/PatientTabs/PatientEncounters.tsx";
import PatientObservations from "@/pages/PatientSummary/PatientTabs/PatientObservations.tsx";

interface PatientDetailsProps {
  patient: Patient | null;
}

function PatientDetails(props: PatientDetailsProps) {
  const { patient } = props;

  return (
    <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
      <Tabs defaultValue="profile" className="overflow-x-auto">
        <div className="flex items-center">
          <TabsList className="overflow-x-auto justify-normal">
            <TabsTrigger value="profile" disabled={!patient}>
              Profile
            </TabsTrigger>
            <TabsTrigger value="encounters" disabled={!patient}>
              Encounters
            </TabsTrigger>
            <TabsTrigger value="conditions" disabled={!patient}>
              Conditions
            </TabsTrigger>
            <TabsTrigger value="medications" disabled={!patient}>
              Medications
            </TabsTrigger>
            <TabsTrigger value="allergies" disabled={!patient}>
              Allergies
            </TabsTrigger>
            <TabsTrigger value="procedures" disabled={!patient}>
              Procedures
            </TabsTrigger>
            <TabsTrigger value="immunisations" disabled={!patient}>
              Immunisations
            </TabsTrigger>
            <TabsTrigger value="observations" disabled={!patient}>
              Observations
            </TabsTrigger>
          </TabsList>
        </div>
        {patient && patient.id ? (
          <>
            <TabsContent value="profile">
              <PatientProfile patient={patient} />
            </TabsContent>
            <TabsContent value="encounters">
              <PatientEncounters patientId={patient.id} />
            </TabsContent>
            <TabsContent value="conditions">
              <PatientConditions patientId={patient.id} />
            </TabsContent>
            <TabsContent value="medications">
              <PatientMedications patientId={patient.id} />
            </TabsContent>
            <TabsContent value="allergies">
              <PatientAllergies patientId={patient.id} />
            </TabsContent>
            <TabsContent value="procedures">
              <PatientProcedures patientId={patient.id} />
            </TabsContent>
            <TabsContent value="immunisations">
              <PatientImmunizations patientId={patient.id} />
            </TabsContent>
            <TabsContent value="observations">
              <PatientObservations patientId={patient.id} />
            </TabsContent>
          </>
        ) : (
          <PatientProfileLoading />
        )}
      </Tabs>
    </main>
  );
}

export default PatientDetails;
