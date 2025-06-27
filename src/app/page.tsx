'use client';

import * as React from 'react';
import type { editor as MonacoEditor } from 'monaco-editor';
import {
  FileCode,
  Play,
  Sparkles,
  Wand,
  Moon,
  Sun,
  LoaderCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { explainCode } from '@/ai/flows/explain-code';
import { fixErrors } from '@/ai/flows/fix-errors';
import { autoComplete } from '@/ai/flows/auto-complete';
import { defaultJSCode, defaultPythonCode, defaultTSCode, defaultHTMLCode, defaultCSSCode } from '@/lib/default-code';
import CodeEditor from '@/components/code-editor';

type LoadingState = 'explain' | 'fix' | 'autocomplete' | false;

export default function WorkbenchPage() {
  const [code, setCode] = React.useState(defaultJSCode);
  const [language, setLanguage] = React.useState('javascript');
  const [output, setOutput] = React.useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = React.useState('');
  const [loading, setLoading] = React.useState<LoadingState>(false);
  const [activeTab, setActiveTab] = React.useState('output');
  const [theme, setTheme] = React.useState('light');
  const [isPanelOpen, setIsPanelOpen] = React.useState(true);
  const editorRef = React.useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
  }, []);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    let newCode;
    switch (value) {
      case 'javascript':
        newCode = defaultJSCode;
        break;
      case 'typescript':
        newCode = defaultTSCode;
        break;
      case 'python':
        newCode = defaultPythonCode;
        break;
      case 'html':
        newCode = defaultHTMLCode;
        break;
      case 'css':
        newCode = defaultCSSCode;
        break;
      default:
        newCode = defaultJSCode;
    }
    setCode(newCode);
    setOutput([]);
    setAiExplanation('');
  };

  const handleEditorDidMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const getSelectedText = () => {
    if (!editorRef.current) return '';
    const selection = editorRef.current.getSelection();
    if (!selection || selection.isEmpty()) {
      return editorRef.current.getValue();
    }
    return editorRef.current.getModel()?.getValueInRange(selection) || '';
  };

  const handleRunCode = () => {
    const nonExecutableLanguages = ['python', 'typescript', 'html', 'css'];
    if (nonExecutableLanguages.includes(language)) {
      toast({
        title: 'Info',
        description: `${language.charAt(0).toUpperCase() + language.slice(1)} execution is not supported in this environment.`,
        variant: 'default',
      });
      return;
    }

    const capturedLogs: string[] = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      capturedLogs.push(
        args.map(arg => {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }).join(' ')
      );
    };

    try {
      // eslint-disable-next-line no-eval
      eval(code);
      setOutput(capturedLogs.length > 0 ? capturedLogs : ['Code executed successfully with no output.']);
    } catch (error: any) {
      setOutput([`Error: ${error.message}`]);
    } finally {
      console.log = originalConsoleLog;
    }
    setActiveTab('output');
    if (!isPanelOpen) setIsPanelOpen(true);
  };

  const handleExplainCode = async () => {
    const selectedCode = getSelectedText();
    if (!selectedCode) {
      toast({ title: 'Error', description: 'No code selected to explain.', variant: 'destructive' });
      return;
    }
    setLoading('explain');
    setAiExplanation('');
    setActiveTab('ai');
    if (!isPanelOpen) setIsPanelOpen(true);
    try {
      const result = await explainCode({ code: selectedCode, language });
      setAiExplanation(result.explanation);
    } catch (error) {
      toast({ title: 'AI Error', description: 'Failed to get explanation from AI.', variant: 'destructive' });
      setAiExplanation('An error occurred while fetching the explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleFixCode = async () => {
    const selectedCode = getSelectedText();
    if (!selectedCode) {
      toast({ title: 'Error', description: 'No code selected to fix.', variant: 'destructive' });
      return;
    }
    setLoading('fix');
    setAiExplanation('');
    setActiveTab('ai');
    if (!isPanelOpen) setIsPanelOpen(true);
    try {
      const result = await fixErrors({ code: selectedCode, language });
      const selection = editorRef.current?.getSelection();
      if (selection && !selection.isEmpty()) {
        editorRef.current?.executeEdits('ai-fix', [{ range: selection, text: result.fixedCode }]);
      } else {
        setCode(result.fixedCode);
      }
      setAiExplanation(result.explanation);
      toast({ title: 'Success', description: 'Code has been fixed.' });
    } catch (error) {
      toast({ title: 'AI Error', description: 'Failed to get fix from AI.', variant: 'destructive' });
      setAiExplanation('An error occurred while fetching the fix.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoComplete = async () => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    const position = editorRef.current.getPosition();
    if (!model || !position) return;
    
    const codePrefix = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    setLoading('autocomplete');
    try {
      const result = await autoComplete({ codePrefix, language });
      editorRef.current.executeEdits('ai-autocomplete', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: result.completion,
      }]);
    } catch (error) {
       toast({ title: 'AI Error', description: 'Failed to get autocompletion from AI.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <header className="flex items-center justify-between h-16 px-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <FileCode className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold font-headline text-foreground">AI Code Workbench</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={handleLanguageChange} defaultValue={language}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRunCode}><Play className="mr-2 h-4 w-4" />Run</Button>
          <Button variant="outline" size="sm" onClick={handleExplainCode} disabled={!!loading}>
            {loading === 'explain' ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Explain
          </Button>
          <Button variant="outline" size="sm" onClick={handleFixCode} disabled={!!loading}>
            {loading === 'fix' ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : <Wand className="mr-2 h-4 w-4" />}
            Fix
          </Button>
           <Button variant="outline" size="sm" onClick={handleAutoComplete} disabled={!!loading}>
            {loading === 'autocomplete' ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Complete
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 relative">
          <CodeEditor
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
          />
        </div>
        <div
          className="transition-all duration-300 ease-in-out"
          style={{ height: isPanelOpen ? '288px' : '48px' }}
        >
          <Card className="h-full flex flex-col rounded-t-lg border-t">
            <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg">
                <h3 className="font-semibold text-sm pl-2">Console</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(!isPanelOpen)}>
                    {isPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    <span className="sr-only">Toggle Panel</span>
                </Button>
            </div>
            {isPanelOpen && (
              <CardContent className="flex-1 p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList className="mx-2 mt-2">
                      <TabsTrigger value="output">Output</TabsTrigger>
                      <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                    </TabsList>
                    <TabsContent value="output" className="flex-1 overflow-auto p-0">
                        <ScrollArea className="h-full">
                        <pre className="text-sm p-4 font-code whitespace-pre-wrap">
                            {output.join('\n')}
                        </pre>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="ai" className="flex-1 overflow-auto p-0">
                        <ScrollArea className="h-full">
                        <div className="p-4 text-sm prose dark:prose-invert max-w-none">
                          {loading && loading !== 'autocomplete' ? <div className="flex items-center gap-2"><LoaderCircle className="animate-spin h-4 w-4" /><span>Thinking...</span></div> : <div dangerouslySetInnerHTML={{ __html: aiExplanation.replace(/\n/g, '<br />') }} />}
                        </div>
                        </ScrollArea>
                    </TabsContent>
                  </Tabs>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
