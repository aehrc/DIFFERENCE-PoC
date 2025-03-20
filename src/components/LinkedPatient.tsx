
import { PatientLink } from "fhir/r4";

interface LinkedPatientProps {
  patientRefs?: PatientLink[];
}

function LinkedPatient(props: LinkedPatientProps) {
  const { patientRefs } = props;
 
  return (
    <>
      {/* {patientRefs && <div>Linked Patient(s):</div>} */}
      <ol>
        {
          patientRefs
            ?.filter((l) => l.other.type === "Patient")
            .map((l) => {
              return (
                <li key={l.other.reference}><span title={l.other.reference}>{l.type}</span></li>
              );
            })
        }
      </ol>
    </>
  )
}

export default LinkedPatient;
