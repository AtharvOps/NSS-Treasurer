"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  FileCheck,
  TrendingDown,
  Tent,
  FileSpreadsheet,
  X,
  MessageSquareText,
  HelpCircle,
  Building,
} from "lucide-react";
import { askNssAiAssistant } from "@/actions/ai-assistant";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_PROMPTS = [
  {
    icon: Tent,
    label: "Camp Expenses",
    badge: "Camp Module",
    text: "Summarize total camp expenses and list the major spending heads for the 7-Day Annual Camp.",
  },
  {
    icon: TrendingDown,
    label: "Highest Spending",
    badge: "Analysis",
    text: "Check the highest spending category this month and provide budget optimization tips.",
  },
  {
    icon: FileSpreadsheet,
    label: "PO Justification Note",
    badge: "Formal Letter",
    text: "Draft a formal expense justification note for the NSS Programme Officer (PO) requesting fund reimbursement.",
  },
  {
    icon: FileCheck,
    label: "Audit Compliance",
    badge: "Audit Check",
    text: "Analyze audit readiness: Are there any missing receipt proofs, unapproved vouchers, or budget overruns?",
  },
];

export function NssAiDrawer() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "**Namaste! I am your NSS AI Treasurer Copilot.**\n\nI am connected to your live PVG's COET, PUNE NSS accounts, camp vouchers, and SPPU audit ledgers. How can I assist you with budget tracking, voucher checks, or drafting PO justification notes today?",
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const result = await askNssAiAssistant({
        prompt: textToSend,
        history: messages.filter((m) => m.role !== "system"),
      });

      if (result.success && result.answer) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.answer },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ **AI Service Notice:** ${result.error || "Unable to retrieve financial intelligence."}\n\n*Please ensure your GEMINI_API_KEY is active or try asking again.*`,
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to connect to AI Assistant");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ An unexpected network error occurred while communicating with the NSS AI Copilot.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied response to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation reset. How can I assist you with your NSS finances today?",
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 px-4.5 py-3 text-white shadow-2xl ring-2 ring-amber-400/80 hover:ring-amber-300 transition-all cursor-pointer"
              title="Open NSS AI Treasurer Copilot"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-sm tracking-wide leading-none">NSS AI Assistant</span>
                <span className="text-[10px] text-blue-200 dark:text-blue-300 font-mono">Gemini Copilot</span>
              </div>
            </motion.button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[88vh] sm:max-w-2xl sm:mx-auto border-blue-900/30 bg-background text-foreground shadow-2xl">
            {/* Header */}
            <DrawerHeader className="border-b bg-slate-50/90 dark:bg-slate-900/90 px-5 py-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-950 dark:bg-blue-900 flex items-center justify-center text-amber-400 ring-2 ring-amber-400/50 shadow-md shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <DrawerTitle className="text-base font-bold text-blue-950 dark:text-white flex items-center gap-2">
                      <span>NSS AI Treasurer Copilot</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                        ● Live Connected
                      </Badge>
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-muted-foreground">
                      PVG&apos;s COET, PUNE financial summaries, PO letters, and SPPU audit checks
                    </DrawerDescription>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    title="Reset Conversation"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerHeader>

            {/* Quick Action Prompt Chips */}
            <div className="px-5 py-2.5 bg-blue-50/50 dark:bg-blue-950/20 border-b overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                <span className="text-[11px] font-semibold text-blue-950 dark:text-blue-300 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Suggested Tasks:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(qp.text)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:border-blue-300 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Icon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>{qp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Messages Conversation Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 max-h-[52vh] text-sm">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[92%] sm:max-w-[85%] rounded-2xl px-4.5 py-3.5 shadow-xs ${
                        msg.role === "user"
                          ? "bg-blue-950 dark:bg-blue-900 text-white rounded-tr-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-tl-xs border border-slate-200/90 dark:border-slate-700"
                      }`}
                    >
                      <div className="text-[11px] font-semibold mb-1.5 opacity-75 flex items-center justify-between gap-4 border-b border-white/10 dark:border-slate-700 pb-1">
                        <span className="flex items-center gap-1">
                          {msg.role === "user" ? (
                            "NSS Treasurer"
                          ) : (
                            <>
                              <Bot className="h-3 w-3 text-amber-500" />
                              <span>Gemini NSS Assistant</span>
                            </>
                          )}
                        </span>
                        {msg.role !== "user" && (
                          <button
                            onClick={() => handleCopy(msg.content, index)}
                            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10px] cursor-pointer"
                            title="Copy response to clipboard"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-sans">
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Evaluating PVGCOET NSS live ledgers &amp; formulating advice...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <div className="p-4 border-t bg-slate-50/60 dark:bg-slate-900/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about camp balances, PO justification notes, SPPU audit..."
                  className="flex-1 bg-white dark:bg-slate-800 text-xs sm:text-sm h-10"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-blue-950 hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-700 text-white shrink-0 h-10 px-4"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
