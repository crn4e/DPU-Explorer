'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Loader2, Send, Sparkles, User, Bot } from 'lucide-react';
import { chatDpu } from '@/ai/flows/chat-dpu';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

export default function AiChat() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [history]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage) return;

    const newHistory: ChatMessage[] = [...history, { role: 'user', content: currentMessage }];
    setHistory(newHistory);
    setMessage('');

    startTransition(async () => {
      try {
        const result = await chatDpu({ history: newHistory.slice(0, -1), message: currentMessage });
        setHistory((prev) => [...prev, { role: 'model', content: result.response }]);
      } catch (error) {
        console.error('Failed to get chat response:', error);
        toast({
          title: 'Error',
          description:
            'Could not get a response at this time. Please try again later.',
          variant: 'destructive',
        });
        // Remove the user message if the API call fails
        setHistory(history);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          AI Chat
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent"/> DPU AI Friend
          </SheetTitle>
          <SheetDescription>
            Ask me anything about DPU campus, locations, and services!
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4 -mx-6 px-6" ref={scrollAreaRef}>
            <div className="space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.role === 'model' && (
                         <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Bot className="h-5 w-5"/>
                         </div>
                       )}
                        <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-primary/10 text-primary-foreground' : 'bg-muted'}`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                         <div className="bg-muted rounded-full p-2">
                            <User className="h-5 w-5 text-muted-foreground"/>
                         </div>
                       )}
                    </div>
                ))}
                 {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <Bot className="h-5 w-5"/>
                        </div>
                        <div className="rounded-lg px-4 py-2 max-w-sm bg-muted flex items-center">
                           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        <SheetFooter className="mt-auto">
             <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                    id="message"
                    placeholder="Ask about DPU..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    autoComplete="off"
                    disabled={isPending}
                />
                <Button type="submit" disabled={isPending || !message.trim()} size="icon">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
