import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Auth } from "@/components/Auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/detect");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/detect");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-2 text-center">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mb-8 text-center">
              Sign in to access thermal image detection
            </p>
            <Auth />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
