import { createContext, ReactNode, useEffect, useState } from "react";
import { Patient } from "fhir/r4";
import useFhirServerAxios from "@/hooks/useFhirServerAxios";
import { useQuery } from "@tanstack/react-query";
import useSourceFhirServer from "@/hooks/useSourceFhirServer";
import { fetchResourceFromEHR } from "@/api/fhirApi";
import { getResource } from "@/utils/getResources";

export interface PatientContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => unknown;
}

export const PatientContext = createContext<PatientContextType>({
  selectedPatient: null,
  setSelectedPatient: () => void 0,
});

type PatientContextProviderProps = {
  patientId?: string;
  children: ReactNode;
};

const PatientContextProvider = ({ patientId, children }: PatientContextProviderProps) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const axiosInstance = useFhirServerAxios();
  const { serverUrl } = useSourceFhirServer();

  const {
    data: resource,
  } = useQuery<Patient>(["patientProfile", serverUrl, patientId], () =>
    fetchResourceFromEHR(axiosInstance, `/Patient/${patientId}`), 
    {
      enabled: !!patientId
    }
  );

  const newPatient = getResource<Patient>(resource, "Patient");
  useEffect(() => {
    if (patientId) {
      setSelectedPatient(newPatient);
    }
  }, [newPatient]);

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContextProvider;
