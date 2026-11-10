import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import UserTable from "@/pages/Settings/UserSettings/UserTable.tsx";

function UserSettings() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User</CardTitle>
          <CardDescription>
            Select the practitioner to view as
          </CardDescription>
          <UserTable />
        </CardHeader>
      </Card>
    </div>
  );
}

export default UserSettings;
