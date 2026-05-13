import { PublicViewer } from "@/components/public-viewer/PublicViewer";
import { syncCurrentUser } from "@/lib/auth/sync";

export default async function Home() {
  await syncCurrentUser(); // keep user metadata synced, but stay on public page
  return <PublicViewer />;
}
