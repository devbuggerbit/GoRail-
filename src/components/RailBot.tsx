import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Train } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  suggestions?: string[];
}

const QUICK_SUGGESTIONS = [
  'Book a ticket',
  'Track my train',
  'Check PNR status',
  'Order food',
];

const BOT_RESPONSES: { pattern: RegExp; response: string; suggestions?: string[]; action?: string }[] = [
  {
    pattern: /book|ticket|reserve/i,
    response: "I'll help you book a ticket! You can book Sleeper (SL), 3rd AC (3A), 2nd AC (2A), or 1st AC (1A) class seats. Tap 'Book Now' to start.",
    suggestions: ['Book Now', 'Check train availability'],
    action: 'book-ticket',
  },
  {
    pattern: /search|find|train/i,
    response: 'You can search trains by entering your From/To stations and journey date. All available trains with live status will appear.',
    suggestions: ['Search trains', 'View schedules'],
    action: 'search-train',
  },
  {
    pattern: /pnr|status|booking/i,
    response: "Enter your 10-digit PNR number to check current booking status, passenger names, seat allocation, and real-time train info.",
    suggestions: ['Check PNR', 'My bookings'],
    action: 'my-bookings',
  },
  {
    pattern: /food|eat|meal|hungry/i,
    response: "Hungry on the train? Order hot meals, snacks, and beverages directly to your berth! We have veg and non-veg options.",
    suggestions: ['Order food', 'View menu'],
    action: 'order-food',
  },
  {
    pattern: /clean|toilet|dirty|washroom/i,
    response: "To report a cleanliness issue, go to 'Cleaning Request'. Select your coach number and issue type — the cleaning staff will be notified immediately.",
    suggestions: ['Report cleaning issue'],
    action: 'cleaning-request',
  },
  {
    pattern: /complaint|seat occupied|harass/i,
    response: "To file a complaint, tap 'File Complaint'. Seat issues go to the Ticket Checker (TC), while security issues go to Railway Police (RPF).",
    suggestions: ['File a complaint'],
    action: 'file-complaint',
  },
  {
    pattern: /ac|fan|light|electric|charging/i,
    response: "To report electrical or technical issues (AC, fan, lights, charging points), use the 'Technical Issue' feature. An engineer will be assigned.",
    suggestions: ['Report technical issue'],
    action: 'technical-issue',
  },
  {
    pattern: /delay|late|update|status/i,
    response: "Check real-time delay reasons and train updates posted directly by Loco Pilots and Station Masters in 'Train Updates'.",
    suggestions: ['View train updates'],
    action: 'train-updates',
  },
  {
    pattern: /map|platform|coach position/i,
    response: "The Station Map shows you the exact position of each coach (S1, S2, B1, A1, etc.) on the platform and the nearest exit for your coach.",
    suggestions: ['Open station map'],
    action: 'station-map',
  },
  {
    pattern: /language|bhasha/i,
    response: "RailSaathi supports all 22 official Indian languages! You can change your language from the top-right selector on the login screen.",
    suggestions: [],
  },
  {
    pattern: /hello|hi|hey|namaste/i,
    response: "Namaste! I'm RailBot, your digital train assistant. How can I help you today? You can ask me about booking tickets, food orders, complaints, or navigating the app.",
    suggestions: QUICK_SUGGESTIONS,
  },
  {
    pattern: /thank|thanks/i,
    response: "You're welcome! Have a safe and comfortable journey. Is there anything else I can help you with?",
    suggestions: QUICK_SUGGESTIONS,
  },
];

const DEFAULT_RESPONSE = {
  response: "I'm not sure about that. I can help you with booking tickets, searching trains, ordering food, reporting issues, or checking train updates. What would you like to do?",
  suggestions: QUICK_SUGGESTIONS,
};

function getBotResponse(input: string) {
  for (const item of BOT_RESPONSES) {
    if (item.pattern.test(input)) return item;
  }
  return DEFAULT_RESPONSE;
}

export default function RailBot() {
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "Namaste! I'm RailBot, your AI travel assistant. How can I help you today?",
      suggestions: QUICK_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botInfo = getBotResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botInfo.response,
        suggestions: botInfo.suggestions,
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  const handleSuggestion = (s: string) => {
    sendMessage(s);
    const match = BOT_RESPONSES.find(r => r.pattern.test(s));
    if (match && 'action' in match && match.action) {
      setTimeout(() => navigate(match.action as Parameters<typeof navigate>[0]), 1200);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-110 ${open ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#060e1e] animate-pulse" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[520px] bg-[#0a1628] border border-white/15 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF9933] to-[#ff6b00] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Train className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">RailBot</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                  <span className="text-white/80 text-xs">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  {msg.role === 'bot' && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-[#FF9933]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-[#FF9933]" />
                      </div>
                      <div>
                        <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                          <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.suggestions.map(s => (
                              <button key={s} onClick={() => handleSuggestion(s)}
                                className="text-[#FF9933] text-xs border border-[#FF9933]/30 rounded-full px-2.5 py-1 hover:bg-[#FF9933]/10 transition-colors">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="bg-gradient-to-br from-[#FF9933] to-[#ff6b00] rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                      <p className="text-white text-sm">{msg.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex gap-2 bg-white/8 border border-white/15 rounded-2xl px-3 py-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none"
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                className="w-7 h-7 bg-[#FF9933] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#ff8c1a] transition-colors">
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
