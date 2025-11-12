import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Detection {
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  temperature: string;
}

const Detect = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        // Reset previous results
        setDetections([]);
        setProcessedImageUrl(null);
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  const handleDetection = async () => {
    if (!selectedFile || !selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use detection");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-thermal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Detection failed');
      }

      const result = await response.json();
      setDetections(result.detections || []);
      setProcessedImageUrl(result.image_url);
      toast.success(`Detection complete! Found ${result.detections?.length || 0} objects.`);
    } catch (error: any) {
      console.error('Detection error:', error);
      toast.error(error.message || "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Thermal Image Detection
                </h1>
                <p className="text-muted-foreground">
                  Signed in as {user.email}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
            <Card className="p-8 bg-gradient-card border-border mb-8">
              <div className="space-y-6">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? (
                    <div className="space-y-4">
                      <img
                        src={selectedImage}
                        alt="Selected thermal"
                        className="max-h-96 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-16 w-16 text-primary mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-foreground mb-2">
                          Upload Thermal Image
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  size="lg"
                  onClick={handleDetection}
                  disabled={!selectedImage || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Run Detection
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {detections.length > 0 && (
              <Card className="p-8 bg-card border-border mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Detection Results
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Processed Image
                    </h3>
                    <div className="relative">
                      <img
                        src={selectedImage || ''}
                        alt="Processed thermal"
                        className="w-full rounded-lg"
                      />
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {detections.map((detection, idx) => (
                          <rect
                            key={idx}
                            x={detection.bbox.x}
                            y={detection.bbox.y}
                            width={detection.bbox.width}
                            height={detection.bbox.height}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="0.5"
                            className="animate-pulse"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Detected Objects ({detections.length})
                    </h3>
                    <div className="space-y-3">
                      {detections.map((detection, idx) => (
                        <Card key={idx} className="p-4 bg-background border-border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-foreground">
                              {detection.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {(detection.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Temperature: <span className="text-primary font-medium">{detection.temperature}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">Step 1</div>
                <p className="text-sm text-muted-foreground">
                  Upload your thermal image
                </p>
              </Card>
              <Card className="p-6 bg-card border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">Step 2</div>
                <p className="text-sm text-muted-foreground">
                  AI processes the image
                </p>
              </Card>
              <Card className="p-6 bg-card border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">Step 3</div>
                <p className="text-sm text-muted-foreground">
                  View detected objects
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Detect;
