'use client';

import * as React from 'react';
import { Bot, LoaderCircle, Send, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import type { ChatMessage } from '@/ai/flows/chat';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RightPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  togglePanel: () => void;
  className?: string;
}

export default function RightPanel({
  messages,
  loading,
  onSendMessage,
  togglePanel,
  className,
}: RightPanelProps) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = `I am your **Agent Builder**. I can help you create, refactor, and improve your code. Ask me to explain or fix code, or give me a prompt to generate something new.`;

  return (
    <div className={className}>
      <Card className="h-full flex flex-col rounded-none border-0 border-l">
        <div className="flex items-center justify-between p-2 border-b">
          <Select defaultValue="agent-builder">
            <SelectTrigger className="w-auto border-0 text-lg font-semibold focus:ring-0 shadow-none gap-2 h-auto p-2 justify-start">
              <Bot className="h-5 w-5 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agent-builder">Agent Builder</SelectItem>
              <SelectItem value="ai-tools">AI Tools</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={togglePanel}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close Panel</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4 text-sm">
            {messages.length === 0 && !loading ? (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: welcomeMessage
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'model' && (
                    <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.role === 'model'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(
                            /```(\w*)\n([\s\S]*?)```/g,
                            '<pre><code class="language-$1">$2</code></pre>'
                          )
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />'),
                      }}
                    />
                  </div>
                  {message.role === 'user' && (
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                  <LoaderCircle className="animate-spin h-4 w-4" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI anything..."
              className="pr-16"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
