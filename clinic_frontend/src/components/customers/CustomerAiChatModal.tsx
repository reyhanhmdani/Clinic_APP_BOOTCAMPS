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
  onOpenBooking?: (doctorId?: number) => void;
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
          text: `Halo${greetingName}! 👋 Saya ReyAI, asisten kesehatan cerdas ReyClinic.\n\nSaya siap membantu Anda memilih poliklinik atau dokter yang tepat, cek jadwal dokter aktif, alur antrean mandiri, dan panduan pertolongan pertama. Ceritakan apa yang Anda rasakan hari ini?`,
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
    { icon: '🎯', label: 'Triage Dokter Sesuai Gejala', text: 'Bantu saya pilih dokter yang tepat sesuai keluhan' },
    { icon: '🦷', label: 'Sakit Gigi & Gusi Ngilu', text: 'Sakit gigi & ngilu, ke dokter mana?' },
    { icon: '🩺', label: 'Dokter Jaga Hari Ini', text: 'Dokter yang bertugas hari ini siapa saja?' },
    { icon: '👶', label: 'Poli Anak & Balita', text: 'Anak saya demam & batuk, ke dokter apa?' },
    { icon: '📅', label: 'Cara Ambil Antrean', text: 'Bagaimana cara ambil antrean dokter?' },
  ];

  // Helper formatting markdown bold **text**
  const renderFormattedText = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={idx}
            className={`font-bold ${isUser ? 'text-white underline decoration-[#2EC4B6]' : 'text-[#004140] font-extrabold'}`}
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
      'koding',
      'coding',
      'javascript',
      'python',
      'presiden',
      'politik',
      'pemilu',
      'film',
      'anime',
      'game',
      'resep masakan',
      'matematika',
      'sejarah',
    ];
    if (nonClinicTerms.some((term) => q.includes(term))) {
      return {
        text: 'Maaf, saya ReyAI adalah asisten khusus ReyClinic Medical Center. Saya hanya dapat membantu pertanyaan seputar layanan klinik kami, dokter yang bertugas, antrean berobat, dan edukasi kesehatan ringan.\n\nApakah ada hal seputar pemeriksaan di ReyClinic yang ingin Anda tanyakan?',
      };
    }

    // 2. Smart Triage: Pencocokan dokter lokal
    // Gigi
    if (q.includes('gigi') || q.includes('gusi') || q.includes('geraham') || q.includes('ngilu')) {
      const doc = doctors.find((d) => d.spesialis.toLowerCase().includes('gigi')) || doctors[0];
      return {
        text: `Untuk keluhan gigi atau gusi, Anda disarankan berkonsultasi dengan **${doc ? doc.name : 'Dokter Gigi'}** (${doc ? doc.spesialis : 'Spesialis Gigi & Mulut'}).\n\nHindari minuman terlalu panas atau dingin sementara waktu.`,
        actionButton:
          onOpenBooking && doc
            ? {
                label: `Daftar Antrean ke ${doc.name}`,
                onClick: () => {
                  onClose();
                  onOpenBooking(doc.id);
                },
              }
            : undefined,
      };
    }

    // Anak
    if (q.includes('anak') || q.includes('bayi') || q.includes('balita') || q.includes('pediatri')) {
      const doc = doctors.find((d) => d.spesialis.toLowerCase().includes('anak')) || doctors[0];
      return {
        text: `Untuk kondisi balita atau anak, Anda dapat berkonsultasi dengan **${doc ? doc.name : 'Dokter Anak'}** (${doc ? doc.spesialis : 'Spesialis Anak'}).\n\nPastikan cairan si kecil tercukupi dengan baik.`,
        actionButton:
          onOpenBooking && doc
            ? {
                label: `Daftar Antrean ke ${doc.name}`,
                onClick: () => {
                  onClose();
                  onOpenBooking(doc.id);
                },
              }
            : undefined,
      };
    }

    // Tanya Jadwal / Dokter Bertugas
    if (
      q.includes('dokter') ||
      q.includes('jadwal') ||
      q.includes('spesialis') ||
      q.includes('bertugas') ||
      q.includes('tarif')
    ) {
      if (doctors.length > 0) {
        const docList = doctors
          .map((d) => `• **dr. ${d.name}** (${d.spesialis}) — Tarif: Rp ${Number(d.fee).toLocaleString('id-ID')}`)
          .join('\n');
        return {
          text: `Daftar dokter yang bertugas aktif di ReyClinic hari ini:\n\n${docList}\n\nIngin saya bantu daftarkan antrean ke dokter tujuan Anda?`,
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
        text: 'Saat ini dokter umum dan spesialis siap melayani di ReyClinic. Silakan lihat daftar lengkapnya pada menu pendaftaran antrean.',
      };
    }

    // Panduan Alur Antrean
    if (
      q.includes('antrean') ||
      q.includes('daftar') ||
      q.includes('booking') ||
      q.includes('tiket') ||
      q.includes('cara')
    ) {
      return {
        text: 'Alur pendaftaran antrean di ReyClinic sangat mudah:\n\n1. Pastikan NIK Anda terhubung pada profil.\n2. Klik tombol **Ambil Antrean** di menu beranda.\n3. Pilih dokter spesialis tujuan Anda.\n4. Pantau nomor panggilan Anda secara real-time dari aplikasi ini.\n\nApakah Anda ingin mendaftar antrean sekarang?',
        actionButton: onOpenBooking
          ? {
              label: 'Buka Menu Pendaftaran Antrean',
              onClick: () => {
                onClose();
                onOpenBooking();
              },
            }
          : undefined,
      };
    }

    // Jam Operasional
    if (q.includes('jam') || q.includes('buka') || q.includes('operasional') || q.includes('tutup')) {
      return {
        text: 'ReyClinic Central beroperasi setiap hari:\n\n• **Senin – Sabtu:** 08:00 – 21:00 WIB\n• **Minggu & Libur Nasional:** 09:00 – 17:00 WIB (Poli Siaga Darurat Ringan)\n\nLayanan reservasi antrean online dapat diakses 24 jam melalui aplikasi ini.',
      };
    }

    // Default Triage Response
    return {
      text: 'Terima kasih telah berkonsultasi. Untuk gejala tersebut, kami menyarankan Anda berkonsultasi langsung dengan dokter jaga kami di ReyClinic agar mendapatkan diagnosa klinis dan penanganan obat yang tepat.\n\nBisa saya bantu pilihkan dokter yang bertugas hari ini?',
      actionButton: onOpenBooking
        ? {
            label: 'Pilih Dokter & Daftar Antrean',
            onClick: () => {
              onClose();
              onOpenBooking();
            },
          }
        : undefined,
    };
  };

  const handleSend = async (manualQuery?: string) => {
    const query = manualQuery || input.trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Panggil backend AI Controller (Google Gemini Flash / Lite Proxy)
      const res = await sendCustomerAiChatService({
        message: query,
        history: messages.slice(-6).map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
      });

      let actionButton: { label: string; onClick: () => void } | undefined = undefined;

      // Cek apakah AI merekomendasikan dokter spesifik
      if (res.recommendedDoctorId && onOpenBooking) {
        const matchedDoc = doctors.find((d) => d.id === res.recommendedDoctorId);
        actionButton = {
          label: `Daftar Antrean ke ${matchedDoc ? matchedDoc.name : 'Dokter Rekomendasi'}`,
          onClick: () => {
            onClose();
            onOpenBooking(res.recommendedDoctorId);
          },
        };
      } else if (res.recommendBooking && onOpenBooking) {
        actionButton = {
          label: 'Lihat Jadwal & Daftar Antrean',
          onClick: () => {
            onClose();
            onOpenBooking();
          },
        };
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actionButton,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[88dvh] sm:h-[640px] bg-[#F8FAFC] border border-white/80 shadow-[0_25px_60px_-15px_rgba(14,90,89,0.25)] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* 1. Header Chat (Pristine Medical White Glassmorphism) */}
        <div className="px-5 py-4 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between shrink-0 shadow-[0_4px_20px_-2px_rgba(14,90,89,0.03)]">
          <div className="flex items-center gap-3">
            {/* Ambient Medical Avatar */}
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0E5A59] via-[#116968] to-[#2EC4B6] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(14,90,89,0.25)]">
                <Stethoscope size={22} className="stroke-[2.5]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#2EC4B6] ring-2 ring-white shadow-xs animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] tracking-tight leading-tight">
                  ReyAI Medical Assistant
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-medium mt-0.5">
                <span className="flex items-center gap-1 text-[#0E5A59] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6]" />
                  Online Siaga
                </span>
                <span>•</span>
                <span>Triage & Jadwal Dokter 24/7</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-transparent hover:border-rose-100"
            title="Tutup Chat"
          >
            <X size={17} className="stroke-[2.4]" />
          </button>
        </div>

        {/* 2. Micro Triage Status Bar */}
        <div className="bg-[#F0FAF9]/90 border-b border-[#CCEBE9]/70 px-5 py-2 flex items-center justify-between text-[11px] text-[#0E5A59] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#2EC4B6] shrink-0" />
            <span className="font-semibold truncate">
              Ceritakan keluhan Anda untuk rekomendasi dokter & poli spesialis
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#0E5A59] bg-white px-2 py-0.5 rounded-full border border-[#CCEBE9] shrink-0 ml-2">
            ReyClinic AI
          </span>
        </div>

        {/* 3. Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs bg-[#F8FAFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0E5A59] to-[#147B79] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot size={16} className="stroke-[2.3]" />
                </div>
              )}

              {msg.sender === 'ai' ? (
                <div className="max-w-[86%] sm:max-w-[80%] bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-xs p-4 shadow-[0_4px_20px_-2px_rgba(14,90,89,0.06)] space-y-2.5 text-[#0F172A]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0E5A59] flex items-center gap-1.5">
                      <Sparkles size={11} className="text-[#2EC4B6]" />
                      <span>ReyAI Assistant</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{msg.time}</span>
                  </div>

                  <div className="whitespace-pre-line leading-relaxed text-xs text-[#1E293B]">
                    {renderFormattedText(msg.text, false)}
                  </div>

                  {/* Tombol Aksi Cepat 1-Klik Booking Dokter Terkait */}
                  {msg.actionButton && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={msg.actionButton.onClick}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#0E5A59] via-[#0A4443] to-[#0E5A59] hover:from-[#004140] hover:to-[#002B2A] text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-[0_4px_14px_rgba(14,90,89,0.25)] active:scale-[0.98] group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Calendar size={15} className="text-[#2EC4B6] shrink-0 stroke-[2.4]" />
                          <span className="truncate">{msg.actionButton.label}</span>
                        </div>
                        <ArrowRight
                          size={14}
                          className="shrink-0 text-white group-hover:translate-x-1 transition-transform"
                        />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-[80%] bg-gradient-to-tr from-[#0E5A59] via-[#0A4443] to-[#0E5A59] text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-[0_4px_16px_rgba(14,90,89,0.2)] text-xs leading-relaxed">
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className="text-[9px] font-mono text-right text-emerald-200/80 mt-1.5">{msg.time}</div>
                </div>
              )}

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0E5A59] to-[#147B79] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot size={16} className="stroke-[2.3]" />
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-xs px-4 py-3 shadow-[0_4px_16px_-2px_rgba(14,90,89,0.05)] flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#64748B]">ReyAI sedang menganalisis</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E5A59] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E5A59] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E5A59] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. Quick Suggestion Prompts */}
        <div className="px-4 py-2.5 bg-white/90 backdrop-blur-md border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider shrink-0 mr-0.5">
            Saran:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt.text)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-white hover:bg-[#F0FAF9] text-[#0E5A59] border border-[#CCEBE9] hover:border-[#0E5A59] transition-all whitespace-nowrap cursor-pointer shrink-0 font-semibold shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <span>{prompt.icon}</span>
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>

        {/* 5. Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2.5 shrink-0"
        >
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis keluhan kesehatan Anda (contoh: sakit gigi, nyeri lambung)..."
              className="w-full py-3 pl-4 pr-10 text-xs rounded-2xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#0E5A59] focus:ring-2 focus:ring-[#0E5A59]/10 text-[#0F172A] placeholder:text-slate-400 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-2xl bg-[#0E5A59] hover:bg-[#004140] disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(14,90,89,0.25)] transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95 shrink-0"
            title="Kirim Pesan"
          >
            <Send size={16} className="stroke-[2.4]" />
          </button>
        </form>
      </div>
    </div>
  );
};
