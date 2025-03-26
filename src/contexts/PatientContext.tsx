import { createContext, ReactNode, useEffect, useState } from "react";
import { Patient } from "fhir/r4";
import useFhirServerAxios from "@/hooks/useFhirServerAxios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useSourceFhirServer from "@/hooks/useSourceFhirServer";
import { fetchResourceFromEHR } from "@/api/fhirApi";
import { getResource } from "@/utils/getResources";


export interface PatientContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => unknown;
  updatePatient: (patient: Patient) => void | null;
}

export const PatientContext = createContext<PatientContextType>({
  selectedPatient: null,
  setSelectedPatient: () => void 0,
  updatePatient: () => null,
});

type PatientContextProviderProps = {
  patientId?: string;
  children: ReactNode;
};

const PatientContextProvider = ({ patientId, children }: PatientContextProviderProps) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const axiosInstance = useFhirServerAxios();
  const { serverUrl } = useSourceFhirServer();

  const queryClient = useQueryClient();

  const {
    data: resource,
  } = useQuery<Patient>(["patientProfile", serverUrl, patientId], () =>
    fetchResourceFromEHR(axiosInstance, `/Patient/${patientId}`), 
    {
      enabled: !!patientId
    }
  );

  const updatePatientMutation = useMutation(
    (updatedPatient: Patient) =>
      axiosInstance.put(`/Patient/${updatedPatient.id}`, updatedPatient),
    {
      onSuccess: (response) => {
        // Option 1: Invalidate to refetch the updated data:
        queryClient.invalidateQueries(["patientProfile", serverUrl, patientId]);

        // Option 2: Update the cache directly:
        // queryClient.setQueryData(["patientProfile", serverUrl, patientId], response.data);
      },
      onError: (error) => {
        console.error("Error updating patient", error);
      },
    }
  );

  const newPatient = getResource<Patient>(resource, "Patient");
  useEffect(() => {
    if (patientId) {
      setSelectedPatient(newPatient);
    }
  }, [newPatient]);

  const updatePatient = (patient: Patient) => {
    updatePatientMutation.mutate(patient);
  };

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient, updatePatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContextProvider;
