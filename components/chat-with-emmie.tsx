"use client"

import { useState, useRef, useEffect } from "react"
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

export function ChatWithEmmie() {
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

  const suggestions = ["create graph", "create table", "What material is overstocked in MY warehouse?"]

  const handleSend = () => {
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

    // Simulate AI thinking time (2-4 seconds)
    const thinkingTime = Math.random() * 2000 + 2000

    setTimeout(() => {
      setIsThinking(false)
      const aiResponse = generateAIResponse(userMessage.content)
      setMessages((prev) => [...prev, aiResponse])
    }, thinkingTime)
  }

  const generateAIResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("graph") || lowerInput.includes("chart") || lowerInput.includes("forecast")) {
      return {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Here's the forecast vs actual data for the last 6 months:",
        data: {
          type: "chart",
          content: {
            type: "line",
            data: {
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [
                {
                  label: "Forecast",
                  data: [120, 135, 140, 125, 160, 155],
                  borderColor: "#ED1B2D",
                  backgroundColor: "rgba(237, 27, 45, 0.1)",
                  tension: 0.4,
                },
                {
                  label: "Actual",
                  data: [110, 130, 145, 120, 155, 150],
                  borderColor: "#374151",
                  backgroundColor: "rgba(55, 65, 81, 0.1)",
                  tension: 0.4,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
                title: {
                  display: true,
                  text: "Forecast vs Actual (KT)",
                },
              },
            },
          },
        },
      }
    }

    if (lowerInput.includes("table") || lowerInput.includes("inventory")) {
      return {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Here's the current inventory summary:",
        data: {
          type: "markdown",
          content: `| Material | Plant | Stock (MT) | Value (USD) |
|----------|-------|------------|-------------|
| P-001 | CHINA-WAREHOUSE | 1,250 | $125,000 |
| P-002 | SINGAPORE-WAREHOUSE | 890 | $89,000 |
| P-003 | CHINA-WAREHOUSE | 2,100 | $210,000 |
| P-001 | SINGAPORE-WAREHOUSE | 750 | $75,000 |`,
        },
      }
    }

    if (lowerInput.includes("overstocked")) {
      return {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "Based on current data, P-003 appears to be overstocked in CHINA-WAREHOUSE with 2,100 MT, which is 40% above optimal levels. Consider redistributing to SINGAPORE-WAREHOUSE or planning promotional activities.",
        data: {
          type: "text",
          content:
            "Based on current data, P-003 appears to be overstocked in CHINA-WAREHOUSE with 2,100 MT, which is 40% above optimal levels.",
        },
      }
    }

    // Random responses for variety
    const responses = [
      "I understand your question. Let me analyze the warehouse data and provide you with insights.",
      "Based on the current warehouse data, I can help you with that analysis.",
      "Let me check the latest warehouse information to give you the most accurate answer.",
      "I'm processing your request using our warehouse management system data.",
    ]

    return {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)],
      data: {
        type: "text",
        content: responses[Math.floor(Math.random() * responses.length)],
      },
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (!isThinking) {
      setInputValue(suggestion)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Emmie Header */}
      

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-2xl p-4 ${message.type === "user" ? "bg-[#ED1B2D] text-white" : "bg-white"}`}>
              <p className="mb-2">{message.content}</p>

              {message.data?.type === "chart" && (
                <div className="mt-4">
                  <ChartRenderer config={message.data.content} />
                  <Button className="mt-2 bg-[#ED1B2D] hover:bg-red-700 text-white" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              )}

              {message.data?.type === "markdown" && (
                <div className="mt-4">
                  <TableRenderer markdown={message.data.content} />
                  <Button className="mt-2 bg-[#ED1B2D] hover:bg-red-700 text-white" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
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
