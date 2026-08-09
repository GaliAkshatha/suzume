import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "../components/feedback/Toast";
import { router } from "./router";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}
