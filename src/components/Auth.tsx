import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";

export const Auth = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full max-w-md mx-auto p-8">
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
        redirectTo={window.location.origin + "/detect"}
      />
    </div>
  );
};
