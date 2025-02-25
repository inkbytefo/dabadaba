import { AuthProvider } from "@/components/AuthProvider";
import { MessengerLayout } from "@/components/MessengerLayout";

export default function Index() {
  return (
    <AuthProvider>
      <MessengerLayout />
    </AuthProvider>
  );
}
