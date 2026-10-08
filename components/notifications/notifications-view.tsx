import { Bell } from "lucide-react";

export function NotificationsView() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Nexus does not run a background price-alert service, so this list stays empty for now.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-white/15 px-4 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#1a1732] text-primary">
          <Bell className="size-5" aria-hidden />
        </span>
        <p className="mt-4 text-lg font-medium">You are up to date</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Nothing to show yet. Saved-article reminders and portfolio alerts will land here once Nexus can generate them.
        </p>
      </div>
    </div>
  );
}
