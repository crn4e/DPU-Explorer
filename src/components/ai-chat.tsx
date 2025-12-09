'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, Send, X, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryItem, chatDpu } from '@/ai/flows/chat-flow';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: HistoryItem = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatDpu({
        message: input,
        history: messages,
      });

      const aiMessage: HistoryItem = {
        role: 'model',
        content: response.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: HistoryItem = {
        role: 'model',
        content: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="rounded-full shadow-lg" size="lg">
        <MessageSquare className="mr-2 h-5 w-5" />
        DPU AI Assistant
      </Button>
    );
  }

  return (
    <Card className="w-[400px] h-[600px] flex flex-col shadow-2xl rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                AI
                </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">DPU AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-y-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground pt-10">
                    <p>สวัสดีครับ/ค่ะ!</p>
                    <p>มีอะไรให้ช่วยเหลือเกี่ยวกับมหาวิทยาลัยธุรกิจบัณฑิตย์ไหมครับ/คะ?</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-lg px-3 py-2 text-sm md:max-w-md break-words',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <ReactMarkdown
                    className="prose prose-sm dark:prose-invert"
                    components={{
                      p: ({ node, ...props }) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2 rounded-lg bg-muted px-3 py-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    กำลังคิด...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSubmit} className="relative w-full">
          <Textarea
            placeholder="สอบถามเกี่ยวกับ DPU..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            rows={1}
            className="min-h-[40px] w-full resize-none pr-10"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-1 right-1 h-8 w-8"
            disabled={isLoading || !input.trim()}
          >
            <CornerDownLeft className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
