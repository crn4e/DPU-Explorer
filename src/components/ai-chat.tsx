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
import Markdown from 'react-markdown';

type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

// Custom hook for typing animation
const useTypewriter = (text: string, speed: number = 20) => {
    const [displayText, setDisplayText] = useState('');
  
    useEffect(() => {
      let i = 0;
      setDisplayText(''); // Reset when text changes
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, speed);
  
      return () => clearInterval(timer);
    }, [text, speed]);
  
    return displayText;
};

function ChatBubble({ message }: { message: ChatMessage }) {
    const isModel = message.role === 'model';
    const displayText = useTypewriter(message.content);
  
    return (
      <div className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
        {isModel && (
          <div className="bg-primary text-primary-foreground rounded-full p-2">
            <Bot className="h-5 w-5" />
          </div>
        )}
        <div className={`rounded-lg px-4 py-2 max-w-sm prose prose-sm dark:prose-invert ${isModel ? 'bg-muted' : 'bg-primary/10 text-primary-foreground'}`}>
          <Markdown>{isModel ? displayText : message.content}</Markdown>
        </div>
        {!isModel && (
          <div className="bg-muted rounded-full p-2">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

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
                    <ChatBubble key={index} message={msg} />
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
