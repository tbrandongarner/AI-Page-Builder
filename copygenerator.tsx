import React, { useState, useEffect } from 'react'

interface CopyGeneratorProps {
  prompt: string
  onCopyGenerated?: (copy: string) => void
  isGenerating?: boolean
  setIsGenerating?: (generating: boolean) => void
}

// Mock fallback copy function
const fallbackCopy = (prompt: string): string => {
  return `Based on your product: "${prompt}", here's compelling marketing copy:\n\n🎯 **Transform Your Life Today!**\n\nDiscover the perfect solution you've been searching for. Our premium product delivers exceptional value with unmatched quality and reliability.\n\n✅ **Key Benefits:**\n• Premium quality materials\n• Exceptional durability\n• Outstanding customer satisfaction\n• Fast, reliable shipping\n\n💰 **Special Limited-Time Offer**\nDon't miss out on this incredible opportunity to upgrade your experience.\n\n🚀 **Order Now** and join thousands of satisfied customers!`
}

// Mock framework selection function
const selectFramework = (content: string): void => {
  // This would typically analyze the content and select the best framework
  console.log('Framework selected based on content length:', content.length)
}

const CopyGenerator: React.FC<CopyGeneratorProps> = ({ prompt, onCopyGenerated, isGenerating, setIsGenerating }) => {
  const [copyText, setCopyText] = useState<string>('');
  const [framework, setFramework] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    if (!prompt) {
      setCopyText('');
      setFramework('');
      setError(null);
      setLoading(false);
      return;
    }

    const fetchCopy = async () => {
      if (!isMounted) return;
      setLoading(true);
      setIsGenerating?.(true);
      setError(null);
      try {
        const response = await fetch('/api/generate-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        const content = typeof data.copy === 'string' ? data.copy : '';
        if (!isMounted) return;
        setCopyText(content);
        selectFramework(content);
        onCopyGenerated?.(content);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        const fallback = fallbackCopy(prompt);
        if (!isMounted) return;
        setCopyText(fallback);
        selectFramework(fallback);
        onCopyGenerated?.(fallback);
        setError('Failed to generate AI copy, using fallback content.');
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsGenerating?.(false);
        }
      }
    };

    fetchCopy();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [prompt]);

  const fallbackCopy = (text: string): string => {
    return `Introducing our latest offering: ${text}. Crafted for excellence, this product delivers unparalleled quality and performance. Experience the difference and elevate your lifestyle today.`;
  };

  const selectFramework = (content: string) => {
    const patterns: { name: string; regex: RegExp }[] = [
      { name: 'React', regex: /\b(?:react|useState|useEffect)\b/i },
      { name: 'Vue', regex: /\b(?:vue|v-bind|v-model)\b/i },
      { name: 'Angular', regex: /\b(?:angular|ng-)\b/i },
    ];
    const found = patterns.find(p => p.regex.test(content));
    setFramework(found ? found.name : 'React');
  };

  const handleCopyClick = () => {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span className="loading-spinner" style={{ marginRight: '10px' }}></span>
          Generating AI copy...
        </div>
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          {copyText ? (
            <>
              <div className="copy-output">{copyText}</div>
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={handleCopyClick} 
                  className="form-button"
                  style={{ backgroundColor: '#28a745' }}
                >
                  📋 Copy to Clipboard
                </button>
                {framework && (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Framework: <strong>{framework}</strong>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#666',
              fontStyle: 'italic',
              border: '2px dashed #ddd',
              borderRadius: '8px'
            }}>
              AI-generated marketing copy will appear here
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CopyGenerator;