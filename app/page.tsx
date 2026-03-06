import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to dashboard automatically
  redirect("/dashboard");
  
  // This return statement will never be reached due to the redirect
  return null;
}