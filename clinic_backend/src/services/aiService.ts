import prisma from '../config/prisma.js';

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface AskReyAiParams {
  message: string;
  history?: ChatHistoryItem[];
  patientName?: string;
}

export interface ReyAiReplyResult {
  reply: string;
  recommendBooking: boolean;
  source: 'gemini' | 'local_fallback';
}

/**
 * Intelligent local clinical fallback when GEMINI_API_KEY is not configured or Gemini is unreachable.
 * Guaranteed to follow the exact same clinic-only guardrails.
 */
const generateLocalFallbackReply = (
  message: string,
  activeDoctors: Array<{ id: number; name: string; spesialis: string; fee: any }>,
  patientName?: string,
): { reply: string; recommendBooking: boolean } => {
  const q = message.toLowerCase().trim();
  const nameGreeting = patientName ? ` Kak ${patientName}` : '';

  // 1. Strict Guardrail check: Non-medical / non-clinic questions
  const nonClinicKeywords = [
    'koding', 'coding', 'javascript', 'python', 'php', 'html', 'css',
    'presiden', 'politik', 'pemilu', 'partai', 'pilpres',
    'film', 'movie', 'anime', 'manga', 'game', 'gaming', 'steam',
    'resep masakan', 'masak ayam', 'bikin rendang', 'kue',
    'matematika', 'hitung', 'rumus', 'sejarah dunia', 'ibu kota',
    'cuaca besok', 'zodiak', 'ramalan',
  ];

  if (nonClinicKeywords.some((kw) => q.includes(kw))) {
    return {
      reply: `Maaf${nameGreeting}, saya ReyAI adalah asisten khusus ReyClinic Medical Center. Saya hanya dapat membantu pertanyaan seputar layanan klinik, jadwal dokter bertugas, antrean berobat, serta edukasi kesehatan ringan.\n\nApakah ada hal terkait pemeriksaan atau layanan ReyClinic yang bisa saya bantu?`,
      recommendBooking: false,
    };
  }

  // 2. Pertanyaan seputar dokter bertugas / jadwal dokter
  if (q.includes('dokter') || q.includes('jadwal') || q.includes('spesialis') || q.includes('tarif') || q.includes('biaya')) {
    if (activeDoctors.length > 0) {
      const docList = activeDoctors
        .map((d) => `• **dr. ${d.name}** (${d.spesialis}) — Biaya Konsultasi: Rp ${Number(d.fee).toLocaleString('id-ID')}`)
        .join('\n');
      return {
        reply: `Halo${nameGreeting}! Berikut adalah daftar dokter yang saat ini sedang bertugas aktif di ReyClinic:\n\n${docList}\n\nAnda bisa langsung mendaftar nomor antrean secara mandiri melalui aplikasi ini tanpa perlu antre di loket resepsionis.`,
        recommendBooking: true,
      };
    }
    return {
      reply: `Saat ini informasi dokter sedang diperbarui di sistem ReyClinic. Silakan periksa menu pendaftaran antrean untuk melihat dokter yang siap melayani.`,
      recommendBooking: true,
    };
  }

  // 3. Pertanyaan seputar antrean / cara booking
  if (q.includes('antre') || q.includes('daftar') || q.includes('booking') || q.includes('nomor') || q.includes('tiket')) {
    return {
      reply: `Cara mengambil nomor antrean mandiri di ReyClinic sangat mudah:\n1. Buka menu Home di aplikasi ini.\n2. Klik tombol "Daftar Dokter" atau pilih dokter yang bertugas.\n3. Konfirmasi tiket antrean Anda.\n4. Nomor tiket akan terbit seketika dan terhubung langsung ke monitor ruang tunggu serta audio pemanggil klinik.`,
      recommendBooking: true,
    };
  }

  // 4. Gejala Demam, Flu, Batuk, Pilek
  if (q.includes('flu') || q.includes('demam') || q.includes('batuk') || q.includes('pilek') || q.includes('panas')) {
    return {
      reply: `Pertolongan pertama untuk gejala flu/demam ringan:\n• Perbanyak istirahat dan konsumsi air hangat (minimal 2 liter/hari).\n• Minum paracetamol sesuai dosis aturan pakai bila suhu tubuh melebihi 38°C.\n• Gunakan masker untuk melindungi anggota keluarga lain di rumah.\n\n⚠️ *Edukasi Medis:* Jika demam tidak turun dalam 3 hari atau disertai sesak napas, sangat disarankan segera berkonsultasi langsung dengan dokter kami di ReyClinic.`,
      recommendBooking: true,
    };
  }

  // 5. Keluhan Maag / Lambung / Asam Lambung / Mual
  if (q.includes('maag') || q.includes('lambung') || q.includes('mual') || q.includes('perut') || q.includes('gerd')) {
    return {
      reply: `Panduan pertolongan pertama untuk keluhan lambung/maag:\n• Hindari makanan yang pedas, asam, bersantan, dan minuman bersoda atau berkafein.\n• Pola makan porsi kecil tetapi lebih sering (setiap 3-4 jam).\n• Jangan langsung berbaring setelah makan; tunggu minimal 2 jam.\n\nBila nyeri perut hebat atau mual muntah berulang, silakan mendaftar antrean dokter umum atau spesialis penyakit dalam kami di ReyClinic.`,
      recommendBooking: true,
    };
  }

  // 6. Pertanyaan seputar Apotek, Obat, atau Pembayaran QRIS
  if (q.includes('obat') || q.includes('apotek') || q.includes('bayar') || q.includes('qris') || q.includes('resep') || q.includes('kasir')) {
    return {
      reply: `Alur pembayaran & pengambilan obat di ReyClinic dirancang serba cepat:\n• Setelah konsultasi dengan dokter selesai, rincian tagihan akan otomatis muncul di aplikasi HP Anda.\n• Pasien dapat membayar langsung menggunakan QRIS atau Virtual Account via Midtrans.\n• Begitu terbayar, sistem loket Farmasi langsung meracik obat Anda tanpa Anda harus antre di meja kasir.`,
      recommendBooking: false,
    };
  }

  // 7. Info Lokasi & Jam Buka
  if (q.includes('lokasi') || q.includes('alamat') || q.includes('jam buka') || q.includes('buka jam') || q.includes('tutup')) {
    return {
      reply: `Informasi Operasional ReyClinic Medical Center:\n📍 **Alamat**: Jl. Kesehatan No. 45, Jakarta Pusat\n⏰ **Jam Buka**: Buka Setiap Hari (Senin - Minggu) pukul 08:00 - 21:00 WIB\n📞 **Kontak**: 021-555-0199\n\nKami melayani poliklinik umum, spesialis, laboratorium terpadu, dan farmasi.`,
      recommendBooking: false,
    };
  }

  // Default Fallback
  return {
    reply: `Terima kasih atas pertanyaannya${nameGreeting}. Sebagai asisten kesehatan ReyClinic, saya siap membantu informasi terkait jam buka klinik, dokter yang bertugas, panduan pendaftaran antrean, dan pertolongan pertama kesehatan ringan.\n\nJika Anda memiliki keluhan medis tertentu, kami menyarankan untuk membuat janji temu dengan dokter kami agar dapat diperiksa secara komprehensif.`,
    recommendBooking: true,
  };
};

/**
 * Service to process AI Chat using Google Gemini REST API with strict clinic-focused guardrails.
 */
export const askReyAiService = async ({
  message,
  history = [],
  patientName,
}: AskReyAiParams): Promise<ReyAiReplyResult> => {
  // 1. Ambil data dokter aktif dari Database PostgreSQL secara Real-Time
  const activeDoctors = await prisma.doctor.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      spesialis: true,
      fee: true,
    },
    orderBy: { name: 'asc' },
  });

  const doctorListText =
    activeDoctors.length > 0
      ? activeDoctors
          .map(
            (d) =>
              `- dr. ${d.name} (${d.spesialis}) | Biaya Konsultasi: Rp ${Number(d.fee).toLocaleString('id-ID')} | ID: ${d.id}`,
          )
          .join('\n')
      : 'Saat ini belum ada dokter spesialis yang terdaftar aktif di sistem.';

  // 2. Cek API Key Gemini
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Jika API Key belum diset, gunakan intelligent local fallback engine
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    const local = generateLocalFallbackReply(message, activeDoctors, patientName);
    return {
      reply: local.reply,
      recommendBooking: local.recommendBooking,
      source: 'local_fallback',
    };
  }

  // 3. System Instruction Ketat untuk Google Gemini
  const systemInstructionText = `
Anda adalah "ReyAI", asisten kesehatan virtual dan representatif resmi dari ReyClinic Medical Center.

=== PROFIL & INFORMASI RESMI REYCLINIC ===
- Nama: ReyClinic Medical Center
- Lokasi: Jl. Kesehatan No. 45, Menteng, Jakarta Pusat (Telp: 021-555-0199)
- Jam Operasional: Buka SETIAP HARI (Senin - Minggu) pukul 08:00 - 21:00 WIB
- Poliklinik & Layanan: Poliklinik Umum, Spesialis Penyakit Dalam, Spesialis Anak, Gigi & Mulut, THT, Laboratorium Medis Lengkap, dan Farmasi 24 Jam.
- Keunggulan Sistem: Antrean mandiri berbasis web/HP realtime, pengumuman audio di ruang tunggu, rekam medis digital terpadu, pembayaran cashless QRIS instan, dan pengambilan obat cepat di apotek.

=== DAFTAR DOKTER AKTIF HARI INI (DATABASE REALTIME) ===
${doctorListText}

=== ATURAN MUTLAK & GUARDRAILS (STRICT COMPLIANCE - TIDAK BOLEH DILANGGAR) ===
1. FOKUS HANYA PADA REYCLINIC & PERTANYAAN KESEHATAN:
   Anda HANYA melayani topik seputar:
   - Informasi ReyClinic (lokasi, jam buka, fasilitas klinik, alur antrean, pembayaran QRIS, apotek/farmasi).
   - Dokter yang sedang bertugas di ReyClinic, keahlian/spesialisasi, dan biaya konsultasi.
   - Edukasi kesehatan ringan, pertolongan pertama (first aid), dan tips gaya hidup sehat.
2. TOLAK SECARA TEGAS & RAMAH PERTANYAAN DI LUAR CAKUPAN:
   Jika pengguna menanyakan hal yang TIDAK BERHUBUNGAN dengan kesehatan atau ReyClinic (contoh: koding/pemrograman, politik, selebriti, resep makanan umum, film, game, matematika, cuaca dunia, atau pertanyaan umum di luar klinik), Anda HARUS MENOLAK SECARA SOPAN DAN TEGAS:
   "Maaf, saya ReyAI adalah asisten khusus ReyClinic Medical Center. Saya hanya dapat membantu pertanyaan seputar layanan klinik kami, jadwal dokter bertugas, antrean, dan konsultasi informasi kesehatan ringan. Apakah ada hal seputar layanan ReyClinic yang bisa saya bantu?"
3. DISCLAIMER MEDIS & REKOMENDASI DOKTER:
   - Jangan pernah mendiagnosis secara pasti atau meresepkan dosis obat keras mandiri (antibiotik, obat keras, dsb.).
   - Selalu berikan edukasi pertolongan pertama yang aman (istirahat, hidrasi cukup, kompres).
   - Arahkan pasien untuk mendaftar antrean dan berkonsultasi langsung dengan dokter jaga ReyClinic yang sesuai.
4. GAYA BAHASA:
   - Ramah, sopan, empatik, terstruktur (gunakan bullet point untuk langkah/daftar), dan mudah dipahami oleh pasien.
   - Sapa pasien dengan ramah jika ada nama: "${patientName || 'Pasien'}".
`;

  // 4. Format Riwayat Percakapan untuk Gemini API
  const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history)) {
    // Ambil maksimal 8 percakapan terakhir untuk efisiensi token
    const recentHistory = history.slice(-8);
    for (const item of recentHistory) {
      if (item.text && item.text.trim()) {
        formattedContents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text.trim() }],
        });
      }
    }
  }

  // Tambahkan pesan pengguna saat ini
  formattedContents.push({
    role: 'user',
    parts: [{ text: message.trim() }],
  });

  try {
    // 5. Panggil Google Gemini REST API (gemini-1.5-flash)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstructionText }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.3,
          topP: 0.85,
          topK: 32,
          maxOutputTokens: 700,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[ReyAI] Gemini API returned status ${response.status}: ${errText}`);
      // Fallback ke local engine jika status bukan 200
      const fallback = generateLocalFallbackReply(message, activeDoctors, patientName);
      return {
        reply: fallback.reply,
        recommendBooking: fallback.recommendBooking,
        source: 'local_fallback',
      };
    }

    const data: any = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
      const fallback = generateLocalFallbackReply(message, activeDoctors, patientName);
      return {
        reply: fallback.reply,
        recommendBooking: fallback.recommendBooking,
        source: 'local_fallback',
      };
    }

    // Deteksi apakah respon menyarankan booking dokter
    const lowerReply = candidateText.toLowerCase();
    const isBookingRecommended =
      lowerReply.includes('antre') ||
      lowerReply.includes('janji temu') ||
      lowerReply.includes('daftar') ||
      lowerReply.includes('berkonsultasi') ||
      lowerReply.includes('dokter jaga');

    return {
      reply: candidateText,
      recommendBooking: isBookingRecommended,
      source: 'gemini',
    };
  } catch (error) {
    console.error('[ReyAI] Error calling Gemini API:', error);
    const fallback = generateLocalFallbackReply(message, activeDoctors, patientName);
    return {
      reply: fallback.reply,
      recommendBooking: fallback.recommendBooking,
      source: 'local_fallback',
    };
  }
};
