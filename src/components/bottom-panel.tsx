'use client';

import * as React from 'react';
import { PanelBottomClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BottomPanelProps {
  output: string[];
  terminalInput: string;
  setTerminalInput: (input: string) => void;
  handleCommandRun: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  togglePanel: () => void;
}

export default function BottomPanel({
  output,
  terminalInput,
  setTerminalInput,
  handleCommandRun,
  togglePanel,
}: BottomPanelProps) {
  return (
    <div className="h-full w-full border-t bg-background shrink-0">
      <Card className="h-full flex flex-col rounded-none border-0">
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <p className="px-2 text-sm font-medium">Terminal</p>
          <Button variant="ghost" size="icon" onClick={togglePanel}>
            <PanelBottomClose className="h-5 w-5" />
            <span className="sr-only">Close Panel</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-2 pt-0">
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
        </div>
      </Card>
    </div>
  );
}
