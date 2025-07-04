"use client"

import { useState, useRef, useEffect } from "react"
import { useWidgetStore } from "@/store/widgetStore"
import { useRouter } from "next/navigation"
import { Send, BarChart3, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChartRenderer } from "@/components/chart-renderer"
import { TableRenderer } from "@/components/table-renderer"

interface Message {
  id: string
  type: "user" | "assistant" | "thinking"
  content: string
  data?: {
    type: "text" | "chart" | "markdown"
    content: any
  }
}

// Thinking animation component
function ThinkingAnimation() {
  return (
    <div className="flex items-center space-x-1 p-4">
      <div className="bg-[#ED1B2D] p-2 rounded-full mr-3">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      <span className="text-gray-500 text-sm ml-2">Emmie is thinking...</span>
    </div>
  )
}

// Helper function to detect if content is a chart configuration
function isChartConfig(obj: any): boolean {
  return obj && 
         typeof obj === 'object' && 
         obj.type && 
         obj.data && 
         ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'scatter', 'bubble'].includes(obj.type)
}

// Helper function to parse API response and determine message type
function parseApiResponse(content: any): { type: string; parsedContent: any; displayContent: string } {
  // If content is a string, check for special formats
  if (typeof content === 'string') {
    // Check for markdown table
    if (content.startsWith('[markdown]') && content.endsWith('[markdown]')) {
      console.debug('[parseApiResponse] Detected markdown:', content);
      return {
        type: 'markdown' as const,
        parsedContent: content.slice(10, -10).trim(),
        displayContent: ''
      }
    }

    // Try to parse as JSON (chart config)
    try {
      const parsed = JSON.parse(content.replace(/\n/g, ''))
      console.debug('[parseApiResponse] Parsed JSON:', parsed);
      // รองรับ chart config ที่มี type, data, options (เช่นตัวอย่างที่ผู้ใช้ให้มา)
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.type &&
        parsed.data &&
        parsed.options
      ) {
        console.debug('[parseApiResponse] Detected chart config (type/data/options):', parsed);
        return {
          type: 'chart' as const,
          parsedContent: parsed,
          displayContent: ''
        }
      }
      // รองรับ chart config แบบเดิม (type/data เฉยๆ)
      if (isChartConfig(parsed)) {
        console.debug('[parseApiResponse] Detected chart config (isChartConfig):', parsed);
        return {
          type: 'chart' as const,
          parsedContent: parsed,
          displayContent: ''
        }
      }
    } catch (e) {
      console.debug('[parseApiResponse] Not JSON, treat as text:', content, e);
      // Not JSON, treat as text
    }

    // Regular text with line breaks
    console.debug('[parseApiResponse] Treat as text:', content);
    return {
      type: 'text' as const,
      parsedContent: content,
      displayContent: content.replace(/(\r\n|\n|\r)/g, "<br />")
    }
  }

  // If content is already an object, check if it's a chart config (type/data/options)
  if (
    content &&
    typeof content === 'object' &&
    content.type &&
    content.data &&
    content.options
  ) {
    console.debug('[parseApiResponse] Detected chart config (object, type/data/options):', content);
    return {
      type: 'chart' as const,
      parsedContent: content,
      displayContent: ''
    }
  }
  // รองรับ chart config แบบเดิม (type/data เฉยๆ)
  if (isChartConfig(content)) {
    console.debug('[parseApiResponse] Detected chart config (object, isChartConfig):', content);
    return {
      type: 'chart' as const,
      parsedContent: content,
      displayContent: ''
    }
  }

  // Default to text
  console.debug('[parseApiResponse] Default to text:', content);
  return {
    type: 'text' as const,
    parsedContent: content,
    displayContent: String(content)
  }
}

export function ChatWithEmmie() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm Emmie, your AI warehouse assistant. How can I help you today?",
      data: { type: "text", content: "Hello! I'm Emmie, your AI warehouse assistant. How can I help you today?" },
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const suggestions = ["สร้างกราฟ", "สร้างตาราง","รายการ Inbound สูงสุดจากคลังสินค้าจีนในเดือนที่แล้ว เมื่อเปรียบเทียบกับเดือนก่อนหน้า", "ระดับ Inventory เดือนที่เเล้วที่คลังสินค้าทุกแห่งเปรียบเทียบกับ Inventory ที่ predict ไว้เป็นอย่างไร?", "outbound เดือนที่เเล้ว เปรียบเทียบกับ outbound ที่ predict ไว้เป็นอย่างไร?"]

  // Load chat history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5678/webhook/chat-history")
        if (!res.ok) {
          console.warn("[ChatWithEmmie] chat-history fetch failed", res.status, res.statusText)
          return
        }
        const data = await res.json()
        console.log("[ChatWithEmmie] chat-history response:", data)
        
        let historyMessages: Message[] = []
        
        if (data && typeof data === 'object' && data.propertyName && Array.isArray(data.propertyName)) {
          historyMessages = data.propertyName
            .map((msgStr: string, idx: number) => {
              try {
                let msgObj = JSON.parse(msgStr)
                // Handle double-encoded content
                if (typeof msgObj.data === 'string') {
                  try {
                    msgObj.data = JSON.parse(msgObj.data)
                  } catch {}
                }
                // Always use parseApiResponse for AI/assistant messages
                if (msgObj.type === "ai" || msgObj.type === "assistant") {
                  let content = msgObj.data && msgObj.data.content !== undefined ? msgObj.data.content : msgObj.data;
                  // If content is stringified chart config, parseApiResponse will handle it
                  const { type, parsedContent, displayContent } = parseApiResponse(content)
                  return {
                    id: `history-ai-${idx}`,
                    type: "assistant",
                    content: displayContent,
                    data: { type: type as "text" | "chart" | "markdown", content: parsedContent },
                  }
                }
                // Process user messages
                if (msgObj.type === "human" || msgObj.type === "user") {
                  return {
                    id: `history-human-${idx}`,
                    type: "user",
                    content: msgObj.data.content,
                    data: { type: "text", content: msgObj.data.content },
                  }
                }
              } catch (e) {
                console.warn("[ChatWithEmmie] Failed to parse chat-history message", msgStr, e)
              }
              return null
            })
            .filter(Boolean) as Message[]
          
          // Sort messages by index (oldest first)
          historyMessages = historyMessages.sort((a, b) => {
            const getIdx = (id: string) => {
              const m = id.match(/-(\d+)$/); 
              return m ? parseInt(m[1], 10) : 0;
            };
            return getIdx(b.id) - getIdx(a.id);
          });
        } else {
          console.warn("[ChatWithEmmie] Unexpected chat-history format", data)
        }
        
        if (historyMessages.length > 0) {
          setMessages(historyMessages)
        } else {
          setMessages([
            {
              id: "1",
              type: "assistant",
              content: "Hello! I'm Emmie, your AI warehouse assistant. How can I help you today?",
              data: { type: "text", content: "Hello! I'm Emmie, your AI warehouse assistant. How can I help you today?" },
            },
          ])
        }
      } catch (e) {
        console.error("[ChatWithEmmie] chat-history error", e)
        setMessages([
          {
            id: "1",
            type: "assistant",
            content: "Hello! I'm Emmie, your AI warehouse assistant. How can I help you today?",
            data: { type: "text", content: "Hello! I'm Emmie, your AI warehouse assistant. How can I help you today?" },
          },
        ])
      }
    }
    fetchHistory()
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      data: { type: "text", content: inputValue },
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsThinking(true)

    try {
      const response = await fetch("http://localhost:5678/webhook/sendmsg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue }),
      })
      
      if (!response.ok) throw new Error("Network response was not ok")
      
      const data = await response.json()
      console.log("[ChatWithEmmie] API Response:", data)
      
      let aiMessages: Message[] = []
      
      if (Array.isArray(data)) {
        // Handle array response
        aiMessages = data.map((item: any, idx: number) => {
          const content = item.output || item.reply || "No response from server."
          const { type, parsedContent, displayContent } = parseApiResponse(content)
          
          return {
            id: (Date.now() + 1 + idx).toString(),
            type: "assistant",
            content: displayContent,
            data: { type: type as "text" | "chart" | "markdown", content: parsedContent },
          }
        })
      } else {
        // Handle single object response
        const content = data.reply || data.output || data.message || "No response from server."
        const { type, parsedContent, displayContent } = parseApiResponse(content)
        
        aiMessages = [
          {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content: displayContent,
            data: { type: type as "text" | "chart" | "markdown", content: parsedContent },
          },
        ]
      }
      
      setMessages((prev) => [...prev, ...aiMessages])
    } catch (error) {
      console.error("[ChatWithEmmie] Error:", error)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Error contacting server.",
        data: { type: "text", content: "Error contacting server." },
      }
      setMessages((prev) => [...prev, aiResponse])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (!isThinking) {
      setInputValue(suggestion)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-2xl p-4 ${message.type === "user" ? "bg-[#ED1B2D] text-white" : "bg-white"}`}>
              {/* Render content based on type */}
              {message.data?.type === "text" && message.content && (
                <div className="mb-2" dangerouslySetInnerHTML={{ __html: message.content }} />
              )}
              
              {message.data?.type === "text" && !message.content && (
                <p className="mb-2">{message.data.content}</p>
              )}

              {message.data?.type === "chart" && (
                <div className="mt-4">
                  <ChartRenderer config={message.data.content} />
                  <Button
                    className="mt-2 bg-[#ED1B2D] hover:bg-red-700 text-white"
                    size="sm"
                    onClick={() => {
                      useWidgetStore.getState().addAvailableWidget({
                        id: Date.now().toString(),
                        type: message.data?.type === "chart" ? "chart" : "table",
                        title: message.data?.content?.options?.plugins?.title?.text || "From Chat",
                        data: message.data?.content,
                      })
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}

              {message.data?.type === "markdown" && (
                <div className="mt-4">
                  <TableRenderer markdown={message.data.content} />
                  <Button
                    className="mt-2 bg-[#ED1B2D] hover:bg-red-700 text-white"
                    size="sm"
                    onClick={() => {
                      useWidgetStore.getState().addAvailableWidget({
                        id: Date.now().toString(),
                        type: message.data?.type === "chart" ? "chart" : "table",
                        title: message.data?.content?.options?.plugins?.title?.text || "From Chat",
                        data: message.data?.content,
                      })
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </Card>
          </div>
        ))}

        {/* Thinking Animation */}
        {isThinking && (
          <div className="flex justify-start">
            <Card className="bg-white">
              <ThinkingAnimation />
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex space-x-2 mb-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your warehouse..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
            disabled={isThinking}
          />
          <Button onClick={handleSend} className="bg-[#ED1B2D] hover:bg-red-700" disabled={isThinking}>
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Try Asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="border-[#ED1B2D] text-[#ED1B2D] hover:bg-[#ED1B2D] hover:text-white"
                disabled={isThinking}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}