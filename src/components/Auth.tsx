import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const Auth = () => {
  const { theme } = useTheme();
  const [redirectUrl, setRedirectUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Set redirect URL with fallback
    const url = typeof window !== "undefined" 
      ? window.location.origin + "/detect"
      : "http://localhost:5173/detect";
    setRedirectUrl(url);
    
    console.log("Auth component mounted");
    console.log("Supabase URL:", supabase.supabaseUrl);
    console.log("Redirect URL:", url);
    
    // Test Supabase connection
    supabase.auth.getSession().catch(err => {
      console.error("Supabase connection error:", err);
      setError("Failed to connect to Supabase: " + err.message);
    });
  }, []);

  if (!redirectUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded">
          {error}
        </div>
      )}
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'hsl(var(--primary))',
                brandAccent: 'hsl(var(--primary))',
                brandButtonText: 'hsl(var(--primary-foreground))',
                defaultButtonBackground: 'hsl(var(--background))',
                defaultButtonBackgroundHover: 'hsl(var(--muted))',
                defaultButtonBorder: 'hsl(var(--border))',
                defaultButtonText: 'hsl(var(--foreground))',
                dividerBackground: 'hsl(var(--border))',
                inputBackground: 'hsl(var(--background))',
                inputBorder: 'hsl(var(--border))',
                inputBorderHover: 'hsl(var(--primary))',
                inputBorderFocus: 'hsl(var(--primary))',
                inputText: 'hsl(var(--foreground))',
                inputLabelText: 'hsl(var(--foreground))',
                inputPlaceholder: 'hsl(var(--muted-foreground))',
                messageText: 'hsl(var(--foreground))',
                messageTextDanger: 'hsl(var(--destructive))',
                anchorTextColor: 'hsl(var(--primary))',
                anchorTextHoverColor: 'hsl(var(--primary))',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button',
            input: 'auth-input',
          },
        }}
        theme={theme === "dark" ? "dark" : "light"}
        providers={[]}
        redirectTo={redirectUrl}
      />
    </div>
  );
};
