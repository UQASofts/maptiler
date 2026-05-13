"use client";

export function WebGLUnsupportedNotice({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 bg-zinc-100 p-6 text-center">
      <p className="text-sm font-semibold text-zinc-900">Map cannot be displayed</p>
      <p className="max-w-md text-sm text-zinc-600">{message}</p>
      <p className="max-w-md text-xs text-zinc-500">
        This viewer needs WebGL2. Try another browser, turn on hardware acceleration,
        or update your graphics drivers. Remote desktop and some VMs block WebGL.
      </p>
    </div>
  );
}
