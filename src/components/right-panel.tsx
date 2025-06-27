'use client';

import * as React from 'react';
import {
  LoaderCircle,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RightPanelProps {
  output: string[];
  aiExplanation: string;
  loading: 'explain' | 'fix' | 'autocomplete' | false;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  terminalInput: string;
  setTerminalInput: (input: string) => void;
  handleCommandRun: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  togglePanel: () => void;
}

export default function RightPanel({
  output,
  aiExplanation,
  loading,
  activeTab,
  setActiveTab,
  terminalInput,
  setTerminalInput,
  handleCommandRun,
  togglePanel,
}: RightPanelProps) {
  return (
    <div className="w-[450px] h-full border-l bg-background">
      <Card className="h-full flex flex-col rounded-none border-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between p-2 border-b bg-muted/50">
            <TabsList className="bg-transparent p-0">
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
              <TabsTrigger value="output">Terminal</TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePanel}
            >
              <PanelRightClose className="h-5 w-5" />
              <span className="sr-only">Close Panel</span>
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="output" className="p-2 pt-0 h-full mt-0">
              <div className="h-full bg-terminal text-terminal-foreground rounded-md flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="text-sm p-4 font-code">
                    {output.length === 0 && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">&gt;</span>
                        <span>Terminal ready. Click "Run" to execute code.</span>
                      </div>
                    )}
                    {output.map((line, index) => {
                      const isCommand = line.startsWith('> ');
                      const content = isCommand ? line.substring(2) : line;
                      return (
                        <div key={index} className="flex items-start">
                          <span className="text-muted-foreground mr-2 shrink-0 select-none">
                            {isCommand ? '>' : ' '}
                          </span>
                          <span className="whitespace-pre-wrap break-all">
                            {content}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex items-center p-1 border-t border-t-slate-700">
                  <span className="text-muted-foreground mr-2 pl-2 select-none">
                    &gt;
                  </span>
                  <input
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleCommandRun}
                    placeholder="Type a JavaScript command..."
                    className="w-full bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none p-1 font-code text-sm placeholder:text-muted-foreground/50"
                    autoComplete="off"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ai" className="h-full mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 text-sm prose dark:prose-invert max-w-none">
                  {loading && loading !== 'autocomplete' ? (
                    <div className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin h-4 w-4" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: aiExplanation.replace(/\n/g, '<br />'),
                      }}
                    />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}