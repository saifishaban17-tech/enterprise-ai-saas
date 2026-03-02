import { useState } from 'react';
import { useGenerateAIText } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Copy, Check, AlertCircle } from 'lucide-react';

export default function AIGenerator() {
  const generateAI = useGenerateAIText();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    if (!prompt.trim()) return setError('Please enter a prompt');

    try {
      const response = await generateAI.mutateAsync(prompt.trim());
      setResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setError(msg);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const suggestions = [
    'Write a product launch announcement',
    'Create a LinkedIn post about AI trends',
    'Draft a client proposal introduction',
    'Generate a weekly team update email',
  ];

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">AI Generator</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Generate content with AI assistance</p>
      </div>

      {/* Prompt Input */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Your Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate..."
            className="bg-charcoal-4 border-border text-sm rounded-lg min-h-[100px] resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground/60 text-right">{prompt.length}/1000</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generateAI.isPending || !prompt.trim()}
          className="w-full gradient-teal text-charcoal-1 font-semibold rounded-xl h-11"
        >
          {generateAI.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Suggestions */}
      {!result && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Try these prompts:</p>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="w-full text-left text-xs text-muted-foreground bg-charcoal-3 border border-border rounded-lg px-3 py-2.5 hover:border-primary/40 hover:text-foreground transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md gradient-teal flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-charcoal-1" />
              </div>
              <span className="text-xs font-semibold text-primary">AI Response</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap">{result}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setResult(''); setPrompt(''); }}
            className="w-full border-border rounded-xl h-9 text-xs"
          >
            Generate Another
          </Button>
        </div>
      )}
    </div>
  );
}
