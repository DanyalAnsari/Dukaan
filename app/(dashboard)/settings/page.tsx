import { getSession } from "@/lib/get-session";
import { getShopByUserId } from "@/database/data/shop";
import SettingsForm from "./_components/settings-form";

export default async function SettingsPage() {
  const session = await getSession();
  const shop = (await getShopByUserId(session!.user.id))!;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your shop settings</p>
      </div>

      <SettingsForm shop={shop} user={session!.user} />
    </div>
  );
}
