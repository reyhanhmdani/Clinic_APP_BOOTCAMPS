import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Stethoscope, Sparkles, Bot, Calendar, ArrowRight, User } from 'lucide-react';
import type { Doctor } from '../../types/clinic';
import { sendCustomerAiChatService } from '../../services/customerService';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

interface CustomerAiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  doctors?: Doctor[];
  onOpenBooking?: () => void;
}

export const CustomerAiChatModal: React.FC<CustomerAiChatModalProps> = ({
  isOpen,
  onClose,
  patientName,
  doctors = [],
  onOpenBooking,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi percakapan awal saat modal dibuka
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetingName = patientName ? `, ${patientName}` : '';
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Halo${greetingName}! 👋 Saya ReyAI, asisten kesehatan cerdas ReyClinic.\n\nSaya siap membantu Anda dengan informasi seputar jadwal dokter aktif, alur pendaftaran antrean mandiri, panduan pembayaran QRIS, serta edukasi pertolongan pertama ringan. Ada yang bisa saya bantu hari ini?`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, patientName, messages.length]);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    '🩺 Dokter yang bertugas hari ini siapa saja?',
    '🤒 Gejala flu dan batuk penanganannya bagaimana?',
    '📅 Bagaimana cara ambil antrean dokter?',
    '💊 Info pengambilan obat di apotek',
  ];

  // Helper formatting markdown bold **text**
  const renderFormattedText = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={idx}
            className={`font-bold ${isUser ? 'text-white underline decoration-emerald-300' : 'text-emerald-950 font-extrabold'}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Local fallback reply generator (klien backup jika server/internet offline)
  const generateLocalReply = (
    query: string,
  ): { text: string; actionButton?: { label: string; onClick: () => void } } => {
    const q = query.toLowerCase();

    // 1. Cek Pertanyaan di luar topik klinik / kesehatan
    const nonClinicTerms = [
      'koding', 'coding', 'javascript', 'python', 'presiden', 'politik', 'pemilu',
      'film', 'anime', 'game', 'resep masakan', 'matematika', 'sejarah',
    ];
    if (nonClinicTerms.some((term) => q.includes(term))) {
      return {
        text: 'Maaf, saya ReyAI adalah asisten khusus ReyClinic Medical Center. Saya hanya dapat membantu pertanyaan seputar layanan klinik kami, dokter yang bertugas, antrean berobat, dan edukasi kesehatan ringan.\n\nApakah ada hal seputar pemeriksaan di ReyClinic yang ingin Anda tanyakan?',
      };
    }

    // 2. Tanya Jadwal / Dokter Bertugas
    if (q.includes('dokter') || q.includes('jadwal') || q.includes('spesialis') || q.includes('bertugas') || q.includes('tarif')) {
      if (doctors.length > 0) {
        const docList = doctors
          .map((d) => `• **dr. ${d.name}** (${d.spesialis}) — Tarif: Rp ${Number(d.fee).toLocaleString('id-ID')}`)
          .join('\n');
        return {
          text: `Saat ini dokter yang sedang bertugas aktif di ReyClinic:\n\n${docList}\n\nIngin saya bantu daftarkan antrean ke salah satu dokter tersebut?`,
          actionButton: onOpenBooking
            ? {
                label: 'Daftar Antrean Dokter Sekarang',
                onClick: () => {
                  onClose();
                  onOpenBooking();
                },
              }
            : undefined,
        };
      }
      return {
        text: 'Saat ini terdapat dokter umum dan spesialis yang siap melayani di ReyClinic. Silakan lihat daftar lengkapnya pada menu pendaftaran antrean.',
      };
    }

    // 3. Tanya Antrean / Booking
    if (q.includes('antre') || q.includes('daftar') || q.includes('booking') || q.includes('tiket')) {
      return {
        text: 'Untuk mendaftar antrean dokter secara mandiri, Anda cukup memilih dokter tujuan di aplikasi ini, lalu konfirmasi tiket antrean Anda. Nomor antrean akan otomatis tersambung ke layar monitor dan speaker klinik.',
        actionButton: onOpenBooking
          ? {
              label: 'Buka Menu Antrean',
              onClick: () => {
                onClose();
                onOpenBooking();
              },
            }
          : undefined,
      };
    }

    // 4. Gejala Flu / Demam / Batuk
    if (q.includes('flu') || q.includes('demam') || q.includes('batuk') || q.includes('pilek') || q.includes('panas')) {
      return {
        text: `Pertolongan pertama untuk gejala flu/demam:\n1. Istirahat cukup dan perbanyak minum air hangat (minimal 2 liter/hari).\n2. Konsumsi paracetamol sesuai dosis aturan pakai bila demam di atas 38°C.\n3. Gunakan masker untuk mencegah penularan ke keluarga.\n\n⚠️ *Catatan Medis: Informasi ini bersifat edukasi awal. Jika demam berlanjut lebih dari 3 hari, sangat disarankan berkonsultasi langsung dengan Dokter ReyClinic.*`,
        actionButton: onOpenBooking
          ? {
              label: 'Konsultasikan dengan Dokter ReyClinic',
              onClick: () => {
                onClose();
                onOpenBooking();
              },
            }
          : undefined,
      };
    }

    // 5. Gejala Maag / Lambung / Mual
    if (q.includes('maag') || q.includes('lambung') || q.includes('mual') || q.includes('perut')) {
      return {
        text: `Untuk meredakan keluhan lambung/mual:\n• Hindari makanan pedas, asam, bersantan, dan minuman berkafein/kopi sementara waktu.\n• Makan dengan porsi kecil tapi sering (3-4 jam sekali).\n• Jangan langsung berbaring setelah makan (tunggu minimal 2 jam).\n\nBila nyeri perut menetap, segera periksakan ke dokter jaga kami.`,
        actionButton: onOpenBooking
          ? {
              label: 'Buat Janji Temu Dokter',
              onClick: () => {
                onClose();
                onOpenBooking();
              },
            }
          : undefined,
      };
    }

    // 6. Apotek / Obat / Pembayaran
    if (q.includes('obat') || q.includes('apotek') || q.includes('bayar') || q.includes('qris') || q.includes('resep')) {
      return {
        text: 'Setelah selesai konsultasi dengan dokter, tagihan Anda akan otomatis terbit di aplikasi. Anda bisa membayar secara instan via QRIS/Virtual Account, dan obat Anda langsung disiapkan oleh bagian Farmasi tanpa perlu antre ulang di kasir.',
      };
    }

    // Default Fallback
    return {
      text: `Terima kasih atas pertanyaannya! Saya ReyAI asisten khusus ReyClinic.\n\nUntuk pemeriksaan kondisi kesehatan atau konsultasi medis yang akurat, dokter profesional kami di ReyClinic siap membantu Anda secara langsung dengan rekam medis digital yang terintegrasi.`,
      actionButton: onOpenBooking
        ? {
            label: 'Buat Janji Temu Dokter',
            onClick: () => {
              onClose();
              onOpenBooking();
            },
          }
        : undefined,
    };
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: userTime,
    };

    // Siapkan riwayat percakapan untuk konteks multi-turn AI
    const historyPayload = messages.slice(-6).map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Panggil backend ReyAI API (Google Gemini Proxy + Postgres Doctor Context)
      const res = await sendCustomerAiChatService({
        message: query,
        history: historyPayload,
      });

      const shouldShowBooking = res.recommendBooking && Boolean(onOpenBooking);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actionButton: shouldShowBooking
          ? {
              label: 'Daftar Antrean Dokter Sekarang',
              onClick: () => {
                onClose();
                onOpenBooking?.();
              },
            }
          : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('[ReyAI] Backend API call failed or offline, using local fallback engine:', err);
      // Seamless fallback jika network offline
      const localReply = generateLocalReply(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: localReply.text,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actionButton: localReply.actionButton,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[85dvh] sm:h-[620px] bg-[#F8FAF8] border border-white/60 shadow-2xl rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* 1. Header Chat (Nordic Medical Emerald) */}
        <div className="bg-gradient-to-r from-[#059669] via-[#047857] to-[#0D9488] p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">ReyAI Health Assistant</h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider uppercase">
                  <Sparkles size={10} className="text-amber-300" />
                  <span>Gemini AI</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-100/90 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>Siap Menjawab Seputar ReyClinic & Medis</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Tutup Chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mb-1 border border-emerald-200 shadow-2xs">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-2xs space-y-1.5 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-[#059669] to-[#047857] text-white rounded-br-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">
                  {renderFormattedText(msg.text, msg.sender === 'user')}
                </div>

                {/* Tombol Aksi Cepat bila ada rekomendasi booking */}
                {msg.actionButton && (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={msg.actionButton.onClick}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-98"
                    >
                      <Calendar size={13} />
                      <span>{msg.actionButton.label}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-emerald-100/80' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mb-1">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Quick Suggestion Prompts */}
        <div className="px-4 py-2 border-t border-slate-200/60 bg-white/70 backdrop-blur-md overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#059669] border border-slate-200/80 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* 4. Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan jadwal dokter atau info ReyClinic..."
            className="flex-1 py-2.5 px-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#059669] text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
            title="Kirim Pesan"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
