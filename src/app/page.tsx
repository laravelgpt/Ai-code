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
  Files,
  Search,
  Bot,
  Settings,
  PanelBottom,
  PanelRight,
  Workflow,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { explainCode } from '@/ai/flows/explain-code';
import { fixErrors } from '@/ai/flows/fix-errors';
import { autoComplete } from '@/ai/flows/auto-complete';
import { runWorkflow } from '@/ai/flows/run-workflow';
import { chat, type ChatMessage } from '@/ai/flows/chat';
import { defaultJSCode, defaultPythonCode, defaultTSCode, defaultHTMLCode, defaultCSSCode } from '@/lib/default-code';
import CodeEditor from '@/components/code-editor';
import RightPanel from '@/components/right-panel';
import BottomPanel from '@/components/bottom-panel';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

type LoadingState = 'explain' | 'fix' | 'autocomplete' | 'chat' | 'workflow' | false;

export default function WorkbenchPage() {
  const [code, setCode] = React.useState(defaultJSCode);
  const [language, setLanguage] = React.useState('javascript');
  const [output, setOutput] = React.useState<string[]>([]);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState<LoadingState>(false);
  const [theme, setTheme] = React.useState('light');
  const [isBottomPanelOpen, setIsBottomPanelOpen] = React.useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(true);
  const [terminalInput, setTerminalInput] = React.useState('');
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
    setChatMessages([]);
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
    if (!isBottomPanelOpen) setIsBottomPanelOpen(true);
  };
  
  const handleCommandRun = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !terminalInput.trim()) return;

    e.preventDefault();
    const command = terminalInput.trim();
    setTerminalInput('');

    const newEntries: string[] = [];

    const capturedLogs: string[] = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      capturedLogs.push(
        args.map(arg => {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }).join(' ')
      );
    };

    try {
      const result = eval(command);
      
      newEntries.push(...capturedLogs);

      if (result !== undefined) {
        try {
          newEntries.push(JSON.stringify(result, null, 2));
        } catch {
          newEntries.push(String(result));
        }
      }
    } catch (error: any) {
      newEntries.push(`Error: ${error.message}`);
    } finally {
      console.log = originalConsoleLog;
    }
    
    setOutput(prev => [...prev, `> ${command}`, ...newEntries].filter(l => l));
  };

  const addMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  }

  const handleExplainCode = async () => {
    const selectedCode = getSelectedText();
    if (!selectedCode) {
      toast({ title: 'Error', description: 'No code selected to explain.', variant: 'destructive' });
      return;
    }
    setLoading('explain');
    if (!isRightPanelOpen) setIsRightPanelOpen(true);
    try {
      addMessage({role: 'user', content: `Explain this code:\n\`\`\`${language}\n${selectedCode}\n\`\`\``})
      const result = await explainCode({ code: selectedCode, language });
      addMessage({role: 'model', content: result.explanation});
    } catch (error) {
      toast({ title: 'AI Error', description: 'Failed to get explanation from AI.', variant: 'destructive' });
      addMessage({role: 'model', content: 'An error occurred while fetching the explanation.'});
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
    if (!isRightPanelOpen) setIsRightPanelOpen(true);
    try {
      addMessage({role: 'user', content: `Fix this code:\n\`\`\`${language}\n${selectedCode}\n\`\`\``})
      const result = await fixErrors({ code: selectedCode, language });
      const selection = editorRef.current?.getSelection();
      if (selection && !selection.isEmpty()) {
        editorRef.current?.executeEdits('ai-fix', [{ range: selection, text: result.fixedCode }]);
      } else {
        setCode(result.fixedCode);
      }
      addMessage({role: 'model', content: `Here's the fixed code:\n\`\`\`${language}\n${result.fixedCode}\n\`\`\`\n**Explanation:**\n${result.explanation}`});
      toast({ title: 'Success', description: 'Code has been fixed.' });
    } catch (error) {
      toast({ title: 'AI Error', description: 'Failed to get fix from AI.', variant: 'destructive' });
      addMessage({role: 'model', content: 'An error occurred while fetching the fix.'});
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

  const handleRunWorkflow = async (workflowName: string) => {
    const currentCode = editorRef.current?.getValue();
    if (!currentCode) {
      toast({ title: 'Error', description: 'No code in editor to run workflow on.', variant: 'destructive' });
      return;
    }
    setLoading('workflow');
    try {
      const result = await runWorkflow({ code: currentCode, language, workflow: workflowName });
      setCode(result.modifiedCode);
      toast({ title: 'Success', description: `Workflow "${workflowName}" completed.` });
    } catch (error) {
      toast({ title: 'AI Error', description: 'Failed to run workflow.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setLoading('chat');
    const newHistory: ChatMessage[] = [...chatMessages, {role: 'user', content: message}];
    setChatMessages(newHistory);
    try {
      const response = await chat(newHistory, message);
      addMessage({role: 'model', content: response});
    } catch (error) {
       toast({ title: 'AI Error', description: 'Failed to get response from AI.', variant: 'destructive' });
       addMessage({role: 'model', content: 'An error occurred while fetching the response.'});
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background font-body">
        <Sidebar collapsible="icon" className="p-2 border-r">
          <SidebarMenu className="h-full flex flex-col">
            <div className="flex-1">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Files" isActive>
                  <Files />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Search">
                  <Search />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="AI Agent" onClick={() => setIsRightPanelOpen(v => !v)}>
                  <Bot />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
            <div>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
           <header className="flex items-center justify-between h-16 px-4 border-b shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="items-center gap-2 hidden md:flex">
                <FileCode className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-bold font-headline text-foreground">AI Code Workbench</h1>
              </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!!loading}>
                    {loading === 'workflow' ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : <Workflow className="mr-2 h-4 w-4" />}
                    Workflow
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => handleRunWorkflow('Add JSDoc Comments')}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    <span>Add JSDoc Comments</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={handleAutoComplete} disabled={!!loading}>
                {loading === 'autocomplete' ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Complete
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
               <Button variant="ghost" size="icon" onClick={() => setIsBottomPanelOpen(v => !v)}>
                  <PanelBottom className="h-5 w-5" />
                  <span className="sr-only">Toggle Bottom Panel</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsRightPanelOpen(v => !v)}>
                  <PanelRight className="h-5 w-5" />
                  <span className="sr-only">Toggle Right Panel</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                />
              </div>
              {isBottomPanelOpen && (
                <BottomPanel
                  togglePanel={() => setIsBottomPanelOpen(false)}
                  output={output}
                  terminalInput={terminalInput}
                  setTerminalInput={setTerminalInput}
                  handleCommandRun={handleCommandRun}
                />
              )}
            </div>
            {isRightPanelOpen && (
              <RightPanel
                messages={chatMessages}
                loading={loading === 'chat' || loading === 'explain' || loading === 'fix'}
                onSendMessage={handleSendMessage}
                togglePanel={() => setIsRightPanelOpen(false)}
                className="w-[400px] shrink-0"
              />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
