import { useMemo } from "react";
import { Patient } from "fhir/r4";
import { formatAge, humanName } from "@/utils/misc.ts";
import dayjs from "dayjs";

function usePatientDetails(patient: Patient | null) {
  const {
    patientName,
    patientGender,
    patientAge,
    patientDob,
    patientSexAtBirth,
    patientMedicareNumber,
  } = useMemo(() => {
    if (!patient) {
      return {
        patientName: "",
        patientGender: "",
        patientAge: "",
        patientDob: "",
        patientSexAtBirth: "",
        patientMedicareNumber: "",
      };
    }

    let patientName = humanName(patient);
    if (patientName === "") {
      patientName = "*not specified";
    }

    const dobText = patient.birthDate
      ? dayjs(patient.birthDate).format("DD/MM/YYYY")
      : "*" +
        patient._birthDate?.extension?.find(
          (ext) =>
            ext.url ===
              "http://hl7.org/fhir/StructureDefinition/data-absent-reason" &&
            !!ext.valueCode
        )?.valueCode;

    const formattedAge = formatAge(patient);
    const ageText = formattedAge !== "" ? formattedAge : "*N/A";

    const sexAtBirthExtension = patient.extension?.find(
      (ext) =>
        ext.url ===
          "http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender" &&
        !!ext.extension?.find((subExt) => subExt.url === "type") &&
        !!ext.extension?.find((subExt) => subExt.url === "value")
    );

    const sexAtBirthCodeableConcept = sexAtBirthExtension?.extension?.find(
      (ext) => ext.url === "value" && !!ext.valueCodeableConcept?.coding?.[0]
    )?.valueCodeableConcept;

    const sexAtBirthText =
      sexAtBirthCodeableConcept?.coding?.[0].display ??
      sexAtBirthCodeableConcept?.text ??
      sexAtBirthCodeableConcept?.coding?.[0].code ??
      "";

    const medicareIdentifier = patient.identifier?.find(ident => ident.type?.coding?.some(c => c.system === "http://terminology.hl7.org/CodeSystem/v2-0203" && c.code === "MC"));
    const medicareNumber = medicareIdentifier?.value;

    return {
      patientName: patientName,
      patientGender: patient.gender
        ? patient.gender[0].toUpperCase() + patient.gender.slice(1)
        : "*not specified",
      patientAge: ageText,
      patientDob: dobText,
      patientSexAtBirth: sexAtBirthText,
      patientMedicareNumber: medicareNumber,
    };
  }, [patient]);

  return {
    patientName,
    patientGender,
    patientAge,
    patientDob,
    patientSexAtBirth,
    patientMedicareNumber,
  };
}

export default usePatientDetails;
