// import { redirect } from "next/navigation";
import { PlannerScreen } from "@/components/planner/PlannerScreen";
import { syncCurrentUser } from "@/lib/auth/sync";

export default async function AdminPage() {
  const user = await syncCurrentUser();
  // if (user?.role !== "ADMIN") {
  //   redirect("/");
  // }
  return <PlannerScreen />;
}
