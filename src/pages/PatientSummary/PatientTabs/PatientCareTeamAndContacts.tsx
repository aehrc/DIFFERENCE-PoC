/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  CareTeam,
  CodeableConcept,
  Patient,
  Practitioner,
  Reference,
  RelatedPerson,
} from "fhir/r4";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import useFetchPatientResources from "@/hooks/useFetchPatientResources.ts";
import { codeableConceptText } from "@/utils/patientDetails.tsx";
import { humanName } from "@/utils/misc.ts";

interface PatientCareTeamAndContactsProps {
  patientId: string;
}

/**
 * CareTeam and RelatedPerson cards for the Profile tab. Each card only renders
 * when the server has data for it (currently only the Mater dataset does).
 */
function PatientCareTeamAndContacts(props: PatientCareTeamAndContactsProps) {
  const { patientId } = props;

  const { resources: careTeams } = useFetchPatientResources<CareTeam>(
    "CareTeam",
    patientId
  );
  const { resources: relatedPersons } =
    useFetchPatientResources<RelatedPerson>("RelatedPerson", patientId);

  return (
    <>
      {careTeams.length > 0 ? <CareTeamCard careTeams={careTeams} /> : null}
      {relatedPersons.length > 0 ? (
        <RelatedPersonCard relatedPersons={relatedPersons} />
      ) : null}
    </>
  );
}

// Role text is usually more specific than the coded display (e.g.
// "Registered midwife" vs "Midwifery personnel"), so prefer it here.
function roleText(concept: CodeableConcept | undefined): string {
  return concept?.text || codeableConceptText(concept);
}

function resolveMemberName(
  careTeam: CareTeam,
  member: Reference | undefined
): string {
  if (!member) return "";
  if (member.reference?.startsWith("#")) {
    const contained = careTeam.contained?.find(
      (resource) => resource.id === member.reference?.slice(1)
    );
    if (
      contained &&
      (contained.resourceType === "Practitioner" ||
        contained.resourceType === "Patient" ||
        contained.resourceType === "RelatedPerson")
    ) {
      const name = humanName(
        contained as Practitioner | Patient | RelatedPerson
      );
      if (name && name !== "No Name Listed") return name;
    }
  }
  return member.display ?? member.reference ?? "";
}

function CareTeamCard(props: { careTeams: CareTeam[] }) {
  const { careTeams } = props;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Care Team</CardTitle>
        <CardDescription>Clinicians involved in the patient's care</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mt-1">
          {careTeams.map((careTeam, teamIndex) => (
            <div key={careTeam.id ?? teamIndex} className="grid gap-2">
              {careTeam.name || careTeam.status ? (
                <div className="flex gap-2 items-center">
                  {careTeam.name ? (
                    <div className="font-medium">{careTeam.name}</div>
                  ) : null}
                  {careTeam.status ? (
                    <Badge variant="outline">{careTeam.status}</Badge>
                  ) : null}
                </div>
              ) : null}
              {(careTeam.participant ?? []).map((participant, index) => (
                <div key={index} className="flex gap-2">
                  <div className="font-medium w-1/5">
                    {participant.role?.map(roleText).filter(Boolean).join(", ") ||
                      "Member"}
                  </div>
                  <div className="text-muted-foreground w-4/5">
                    {resolveMemberName(careTeam, participant.member) || "-"}
                  </div>
                </div>
              ))}
              {!careTeam.participant?.length ? (
                <div className="text-muted-foreground">No participants listed</div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RelatedPersonCard(props: { relatedPersons: RelatedPerson[] }) {
  const { relatedPersons } = props;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Contacts / Next of Kin</CardTitle>
        <CardDescription>People related to the patient</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mt-1">
          {relatedPersons.map((person, index) => {
            const relationship =
              (person.relationship ?? [])
                .map(codeableConceptText)
                .filter(Boolean)
                .join(", ") || "Related person";
            const name = person.name?.length ? humanName(person) : "";
            const identifiers = (person.identifier ?? [])
              .map((identifier) =>
                [
                  identifier.value,
                  identifier.assigner?.display
                    ? `(${identifier.assigner.display})`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              )
              .filter(Boolean);
            const telecoms = (person.telecom ?? [])
              .map((telecom) => telecom.value)
              .filter(Boolean);

            return (
              <div key={person.id ?? index} className="flex gap-2">
                <div className="font-medium w-1/5 capitalize">
                  {relationship}
                </div>
                <div className="text-muted-foreground w-4/5">
                  {name ? <div>{name}</div> : null}
                  {identifiers.map((value) => (
                    <div key={value}>ID: {value}</div>
                  ))}
                  {telecoms.map((value) => (
                    <div key={value}>{value}</div>
                  ))}
                  {!name && identifiers.length === 0 && telecoms.length === 0
                    ? "No details recorded"
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default PatientCareTeamAndContacts;
