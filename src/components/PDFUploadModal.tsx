import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PDFUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    modulesProcessed: number;
    proceduresImported: number;
    userInfo: {
      name: string;
      elogbuch_stand: string;
      fachgebiet: string;
    };
  };
  error?: string;
}

export const PDFUploadModal = ({ open, onOpenChange, onSuccess }: PDFUploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie eine PDF-Datei aus.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const formData = new FormData();
      formData.append('pdf', file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found. Please log in again.');
      }

      console.log('Uploading with session token');

      const response = await supabase.functions.invoke('pdf-parser', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      const result = response.data as UploadResult;
      setUploadResult(result);

      if (result.success) {
        toast({
          title: "PDF erfolgreich verarbeitet",
          description: `${result.data?.proceduresImported} Prozeduren aus ${result.data?.modulesProcessed} Modulen importiert.`,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Fehler beim Verarbeiten",
          description: result.error || "Unbekannter Fehler",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
      setUploadResult({
        success: false,
        message: "Upload fehlgeschlagen",
        error: error instanceof Error ? error.message : "Unbekannter Fehler"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setUploadProgress(0);
    setUploadResult(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            FMH eLogbuch PDF Upload
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!uploadResult && (
            <>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                  }
                  ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  if (!isUploading) {
                    document.getElementById('pdf-upload')?.click();
                  }
                }}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">
                  PDF hier ablegen oder klicken zum Auswählen
                </p>
                <p className="text-xs text-muted-foreground">
                  Unterstützt: FMH eLogbuch PDF-Exporte
                </p>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>PDF wird verarbeitet...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </>
          )}

          {uploadResult && (
            <div className="space-y-4">
              <div className={`
                flex items-center gap-3 p-4 rounded-lg
                ${uploadResult.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
                }
              `}>
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{uploadResult.message}</p>
                  {uploadResult.success && uploadResult.data && (
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Patient: {uploadResult.data.userInfo.name}</p>
                      <p>Stand: {uploadResult.data.userInfo.elogbuch_stand}</p>
                      <p>Module verarbeitet: {uploadResult.data.modulesProcessed}</p>
                      <p>Prozeduren importiert: {uploadResult.data.proceduresImported}</p>
                    </div>
                  )}
                  {!uploadResult.success && uploadResult.error && (
                    <p className="mt-1 text-sm">{uploadResult.error}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetModal}>
                  Weitere PDF hochladen
                </Button>
                <Button onClick={handleClose}>
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};