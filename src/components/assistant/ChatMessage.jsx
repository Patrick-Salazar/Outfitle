import React from "react";
import { motion } from "framer-motion";
import { User, Sparkles, ExternalLink, Shirt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import OutfitSuggestion from "./OutfitSuggestion";

export default function ChatMessage({ message, isUser, items, outfitName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''} space-y-3`}>
        <Card className={`p-4 ${
          isUser 
            ? 'bg-neutral-900 text-white border-0' 
            : 'bg-white border-neutral-200'
        }`}>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                li: ({node, ...props}) => <li className="text-sm" {...props} />,
                a: ({node, ...props}) => (
                  <a 
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {props.children}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </Card>

        {/* Outfit Suggestion with Images */}
        {!isUser && items && items.length > 0 && (
          <OutfitSuggestion items={items} outfitName={outfitName} />
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-neutral-600" />
        </div>
      )}
    </motion.div>
  );
}