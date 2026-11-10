import SettingsOverview from "@/pages/Settings/SettingsOverview.tsx";
import PatientSettings from "@/pages/Settings/PatientSettings/PatientSettings.tsx";
import UserSettings from "@/pages/Settings/UserSettings/UserSettings.tsx";

export interface SettingsMenuItem {
  title: string;
  path: string;
  element: JSX.Element;
}

export const settingsMenuItems: SettingsMenuItem[] = [
  {
    title: "Overview",
    path: "/settings",
    element: <SettingsOverview />,
  },
  {
    title: "Patient",
    path: "/settings/patient",
    element: <PatientSettings />,
  },
  {
    title: "User",
    path: "/settings/user",
    element: <UserSettings />,
  },
];
