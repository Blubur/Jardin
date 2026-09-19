import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/registro?modo=login");
}
