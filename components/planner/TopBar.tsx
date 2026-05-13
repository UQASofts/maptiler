import { Icon } from "@/components/ui/Icon";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export type TopBarProps = {
  title?: string;
};

export function TopBar({ title = "SampleApp" }: TopBarProps) {
  return (
    <header className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 py-3 sm:py-0 min-h-[64px] gap-3 sm:gap-0 shrink-0">
      {/* Left side: Logo & Title (Always visible at top on mobile) */}
      <div className="flex w-full items-center justify-between sm:w-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#db2777]">
            <Icon
              name="route"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
            />
          </div>
          <h1 className="text-base sm:text-xl font-semibold sm:font-bold tracking-tight text-zinc-900">
            {title}{" "}
            <span className="ml-2 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 sm:text-sm">
              Admin
            </span>
          </h1>
        </div>
        {/* Auth can sit next to title on mobile for convenience */}
        <div className="flex items-center gap-3 sm:hidden">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Public View
          </Link>
          <UserButton />
        </div>
      </div>

      {/* Right side: Auth (Desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          Public View
        </Link>
        <div className="h-6 w-px bg-zinc-200" />
        <UserButton />
      </div>
    </header>
  );
}
