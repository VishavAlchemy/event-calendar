'use client';

import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-10"></h1>
      
      <div className="flex-1 overflow-auto mb-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-4 p-3 rounded-lg backdrop-blur-sm ${
              message.role === 'user' 
                ? 'bg-primary/5 ml-auto max-w-[80%]' 
                : 'bg-muted/5 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-1 text-sm opacity-75">
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
            <div className='mt-4'>
            {message.toolInvocations?.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === 'result') {
                if (toolName === 'displayWeather') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      <Weather {...result} />
                    </div>
                  );
                }
              } else {
                return (
                  <div key={toolCallId}>
                    {toolName === 'displayWeather' ? (
                      <div>Loading weather...</div>
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          className="w-full p-3 pr-12 bg-background/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={input}
          placeholder="Ask me anything..."
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary/90 text-primary-foreground rounded-md hover:bg-primary transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}