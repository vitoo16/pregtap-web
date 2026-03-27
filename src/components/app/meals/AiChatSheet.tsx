'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
};

const AI_TIPS = [
  'Để có một chế độ ăn uống cân bằng, hãy đảm bảo bạn cung cấp đủ axit folic, sắt và canxi.',
  'Trong tam cá nguyệt thứ nhất, bạn cần bổ sung khoảng 300-500 calo mỗi ngày.',
  'Uống ít nhất 8 ly nước mỗi ngày khi mang thai để duy trì lượng nước ối.',
  'Các thực phẩm giàu sắt như thịt đỏ, rau xanh đậm và các loại đậu rất quan trọng trong thai kỳ.',
  'Tránh các loại cá có hàm lượng thủy ngân cao như cá kiếm, cá mập trong suốt thai kỳ.',
  'Bữa sáng rất quan trọng! Nó giúp duy trì đường huyết ổn định và giảm ốm nghén.',
  'Chia nhỏ bữa ăn thành 5-6 bữa nhỏ trong ngày để giảm buồn nôn và ợ nóng.',
  'Trong tam cá nguyệt thứ hai, nhu cầu canxi tăng lên để hỗ trợ sự phát triển xương của bé.',
  'Vitamin D từ ánh nắng mặt trời giúp cơ thể hấp thu canxi tốt hơn.',
  'Omega-3 từ cá béo rất tốt cho sự phát triển não bộ của thai nhi.',
  'Trong tam cá nguyệt thứ ba, bạn có thể cần thêm 450-500 calo mỗi ngày.',
  'Ăn nhiều thực phẩm giàu chất xơ như ngũ cốc nguyên hạt, rau và trái cây để tránh táo bón.',
  'Tránh thực phẩm chưa qua paster hóa và thịt sống hoặc nấu chưa chín.',
  'Sắt từ thực phẩm động vật (sắt hem) được hấp thu tốt hơn sắt từ thực vật (sắt non-hem).',
  'Bổ sung acid folic từ 1 tháng trước khi mang thai và trong 3 tháng đầu rất quan trọng.',
];

const MEAL_SUGGESTIONS = [
  'Bữa sáng tốt cho bà bầu: Bột yến mạch với chuối, hạt óc chó và một ly sữa.',
  'Món trưa nhẹ nhàng: Salad gà với rau xanh, trứng luộc và bánh mì nguyên cám.',
  'Món tối dinh dưỡng: Cá hồi áp chảo với rau cải xanh và khoai lang hấp.',
  'Bữa phụ lành mạnh: Sữa chua Hy Lạp với trái cây tươi và mật ong.',
  'Món ăn giàu đạm: Trứng hấp rau củ, một lựa chọn tuyệt vời cho bữa sáng.',
  'Nước uống tốt cho thai kỳ: Nước ép cam tươi, nước dừa và trà gừng.',
  'Bữa phụ buổi chiều: Một nắm hạt hỗn hợp (hạnh nhân, óc chó, hạt điều).',
  'Món ăn giảm ốm nghén: Bánh mì nướng với bơ và chuối, trà gừng.',
];

function getMockAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('sáng') || lower.includes('breakfast') || lower.includes('bữa sáng')) {
    return 'Về bữa sáng, bạn nên ăn sớm và đủ chất. Một bữa sáng tốt có thể gồm: trứng, bánh mì nguyên cám, rau xanh và trái cây. Bữa sáng giúp duy trì năng lượng và giảm cảm giác buồn nôn.';
  }
  if (lower.includes('nặng') || lower.includes('nguyên') || lower.includes('dinh dưỡng')) {
    return 'Chế độ ăn cân bằng trong thai kỳ cần đủ 4 nhóm: đạm, tinh bột, chất béo, vitamin và khoáng chất. Hãy ăn đa dạng thực phẩm để đảm bảo đủ dinh dưỡng cho mẹ và bé.';
  }
  if (lower.includes('nghén') || lower.includes('buồn nôn')) {
    return 'Để giảm ốm nghén, bạn có thể thử: ăn bữa nhỏ và thường xuyên, tránh để bụng đói, uống trà gừng, và ăn thực phẩm khô như bánh quy. Nếu nặng quá, hãy hỏi bác sĩ.';
  }
  if (lower.includes('sắt') || lower.includes('canxi') || lower.includes('vitamin')) {
    const item = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
    return item;
  }
  if (lower.includes('thực đơn') || lower.includes('menu') || lower.includes('gợi ý')) {
    return 'Dưới đây là một số gợi ý cho bữa ăn của bạn: ' + MEAL_SUGGESTIONS[Math.floor(Math.random() * MEAL_SUGGESTIONS.length)];
  }

  return AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
}

type AiChatSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AiChatSheet({ isOpen, onClose }: AiChatSheetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'ai',
      text: 'Xin chào! Tôi là cố vấn dinh dưỡng thai kỳ của bạn. Tôi ở đây để giúp bạn lên kế hoạch cho các bữa ăn lành mạnh cho cả mẹ và bé. Bạn muốn biết gì về dinh dưỡng trong thai kỳ?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: getMockAIResponse(userMessage.text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#3E2723]/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(62,39,35,0.15)]"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 rounded-t-3xl bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-5 py-4 text-white shadow-md">
              <button
                onClick={onClose}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Đóng"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="flex items-center gap-2.5 flex-1 justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold">AI Dinh Dưỡng</h3>
              </div>
              <div className="w-8" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  {msg.role === 'ai' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] shadow-sm">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`
                      max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
                      ${msg.role === 'ai'
                        ? 'rounded-bl-md bg-white border border-gray-100'
                        : 'rounded-br-md bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`mt-1 text-[10px] ${msg.role === 'ai' ? 'text-[#999]' : 'text-white/60'}`}>
                      {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex items-end gap-2.5"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] shadow-sm">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white border border-gray-100 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-2 w-2 rounded-full bg-[#FF9690]"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-[#FF9690]"
                      />
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                        className="h-2 w-2 rounded-full bg-[#FF9690]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-4 pb-6">
              <div className="flex-1 flex items-center gap-2 rounded-full bg-[#F5F5F5] px-4 py-2.5">
                <svg className="w-4 h-4 flex-shrink-0 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi về dinh dưỡng thai kỳ..."
                  className="flex-1 bg-transparent text-sm text-[#3E2723] placeholder-[#999] outline-none"
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={`
                  flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                  transition-all duration-200 shadow-sm
                  ${inputValue.trim() && !isTyping
                    ? 'bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white hover:shadow-md active:scale-95'
                    : 'bg-[#F5F5F5] text-[#CCC] cursor-not-allowed'
                  }
                `}
                aria-label="Gửi"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
