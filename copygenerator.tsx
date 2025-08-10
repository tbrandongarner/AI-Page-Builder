const CopyGenerator: React.FC<CopyGeneratorProps> = ({ prompt }) => {
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
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        const fallback = fallbackCopy(prompt);
        if (!isMounted) return;
        setCopyText(fallback);
        selectFramework(fallback);
        setError('Failed to generate AI copy, using fallback content.');
      } finally {
        if (isMounted) setLoading(false);
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
    <div className="copy-generator">
      {loading ? (
        <p>Generating copy...</p>
      ) : (
        <>
          {error && <p className="error-message">{error}</p>}
          <textarea
            className="copy-output"
            readOnly
            value={copyText}
            rows={8}
          />
          <div className="copy-controls">
            <button onClick={handleCopyClick} disabled={!copyText}>
              Copy to Clipboard
            </button>
            {framework && (
              <span className="framework-label">
                Recommended framework: {framework}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CopyGenerator;