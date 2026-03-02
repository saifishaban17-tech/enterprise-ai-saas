import { useState, useRef } from 'react';
import { useAnalyzeImage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScanEye, Upload, Loader2, AlertCircle, ImageIcon, X } from 'lucide-react';

export default function VisionAnalyzer() {
  const analyzeImage = useAnalyzeImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewUrl(dataUrl);
      // Extract base64 part
      const base64 = dataUrl.split(',')[1];
      setBase64Image(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    setError('');
    if (!base64Image) return setError('Please select an image first');

    try {
      const response = await analyzeImage.mutateAsync(base64Image);
      setResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setBase64Image(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">Vision Analyzer</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Upload an image for AI-powered analysis</p>
      </div>

      {/* Upload Area */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        {!previewUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/40 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-charcoal-3 group-hover:bg-primary/15 flex items-center justify-center transition-all duration-200">
              <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Tap to select image</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, GIF up to 5MB</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Upload className="w-3.5 h-3.5" />
              Browse Files
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-charcoal-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-charcoal-1/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/80 transition-colors duration-200"
              >
                <X className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Image ready for analysis</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {previewUrl && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzeImage.isPending}
            className="w-full gradient-teal text-charcoal-1 font-semibold rounded-xl h-11"
          >
            {analyzeImage.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ScanEye className="w-4 h-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md gradient-teal flex items-center justify-center">
              <ScanEye className="w-3 h-3 text-charcoal-1" />
            </div>
            <span className="text-xs font-semibold text-primary">Analysis Result</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{result}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="w-full border-border rounded-xl h-9 text-xs"
          >
            Analyze Another Image
          </Button>
        </div>
      )}

      {/* Info */}
      {!previewUrl && !result && (
        <div className="bg-charcoal-3 border border-border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground">What can Vision Analyzer detect?</p>
          {['Objects and scenes in photos', 'Text and documents', 'People and activities', 'Colors and visual patterns'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-xs text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
