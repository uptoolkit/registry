import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { sampleSettingsProfile } from "./settings-data";
import { SettingsPanels } from "./settings-panels";

/**
 * Account settings page.
 *
 * The route stays a server component and loads the account record; the section
 * nav and the forms live in `SettingsPanels` on the client. Replace
 * `sampleSettingsProfile` with your own session lookup.
 */
export default function Page() {
  const profile = sampleSettingsProfile;

  return (
    <main className="min-h-svh bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Account</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="m-0 text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="m-0 text-sm text-muted-foreground">
            Manage how you appear, what we send you, and how to leave.
          </p>
        </header>

        <SettingsPanels profile={profile} />
      </div>
    </main>
  );
}
