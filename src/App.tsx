import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PinAuthProvider } from "@/hooks/usePinAuth";
import { WalletProvider } from "@/contexts/WalletContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SpendPage from "./pages/SpendPage";
import AddSpendPage from "./pages/AddSpendPage";
import EditSpendPage from "./pages/EditSpendPage";
import ManageAmountPage from "./pages/ManageAmountPage";
import AddMoneyPage from "./pages/AddMoneyPage";
import SettingsPage from "./pages/SettingsPage";
import PinPage from "./pages/PinPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(20 12% 12%)',
            border: '1px solid hsl(20 10% 20%)',
            color: 'hsl(30 15% 92%)',
          },
        }}
      />
      <BrowserRouter>
        <PinAuthProvider>
          <Routes>
            <Route path="/pin" element={<PinPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <Index />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/spend"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <SpendPage />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-spend"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <AddSpendPage />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-spend/:id"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <EditSpendPage />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <ManageAmountPage />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-money"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <AddMoneyPage />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <WalletProvider>
                    <SettingsPage />
                  </WalletProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PinAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
