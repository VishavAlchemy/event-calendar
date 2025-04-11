'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-6">AI Assistant</h1>
      
      <div className="flex-1 overflow-auto mb-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-primary/10 ml-auto max-w-[80%]' 
                : 'bg-muted mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === 'user' ? 'You' : 'Sage'}
            </div>
            <div className="whitespace-pre-wrap">
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                }
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          className="w-full p-4 pr-12 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={input}
          placeholder="Ask me anything..."
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}