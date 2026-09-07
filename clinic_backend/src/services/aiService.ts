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
  recommendedDoctorId?: number;
  recommendedDoctorName?: string;
  source: 'gemini' | 'local_fallback';
}

/**
 * Mendeteksi nama dokter yang direkomendasikan dari teks respon
 */
const detectRecommendedDoctor = (
  text: string,
  doctors: Array<{ id: number; name: string; spesialis: string; fee: any }>,
): { id: number; name: string } | undefined => {
  const lower = text.toLowerCase();
  for (const doc of doctors) {
    const fullName = doc.name.toLowerCase();
    const cleanName = fullName.replace(/^dr\.\s*/i, '').trim();
    const spec = doc.spesialis.toLowerCase();

    if (lower.includes(fullName) || lower.includes(cleanName) || lower.includes(spec)) {
      return { id: doc.id, name: doc.name };
    }
  }
  return undefined;
};

/**
 * Intelligent local clinical fallback when GEMINI_API_KEY is not configured or Gemini is unreachable.
 * Guaranteed to follow the exact same clinic-only guardrails.
 */
const generateLocalFallbackReply = (
  message: string,
  activeDoctors: Array<{ id: number; name: string; spesialis: string; fee: any }>,
  patientName?: string,
): { reply: string; recommendBooking: boolean; recommendedDoctorId?: number; recommendedDoctorName?: string } => {
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

  // 2. Smart Triage: Bantu pilih dokter / keluhan spesifik
  // Gigi & Mulut
  if (q.includes('gigi') || q.includes('gusi') || q.includes('geraham') || q.includes('ngilu') || q.includes('karang gigi')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('gigi')) || activeDoctors[0];
    return {
      reply: `Untuk keluhan gigi atau gusi, Anda disarankan berkonsultasi dengan **${doc ? doc.name : 'Dokter Gigi'}** (${doc ? doc.spesialis : 'Spesialis Gigi & Mulut'}) di ReyClinic.\n\nSementara hindari makanan/minuman yang terlalu dingin, panas, atau manis.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Anak / Balita
  if (q.includes('anak') || q.includes('bayi') || q.includes('balita') || q.includes('pediatri')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('anak')) || activeDoctors[0];
    return {
      reply: `Untuk keluhan kesehatan pada anak/balita, Anda disarankan memeriksakan si kecil ke **${doc ? doc.name : 'Dokter Spesialis Anak'}** (${doc ? doc.spesialis : 'Spesialis Anak'}).\n\nPastikan si kecil tetap terhidrasi dengan baik dan istirahat yang cukup.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Mata
  if (q.includes('mata') || q.includes('rabun') || q.includes('katarak') || q.includes('iritasi mata')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('mata')) || activeDoctors[0];
    return {
      reply: `Untuk gangguan penglihatan atau keluhan mata, Anda dapat berkonsultasi dengan **${doc ? doc.name : 'Dokter Spesialis Mata'}** (${doc ? doc.spesialis : 'Spesialis Mata'}) di ReyClinic.\n\nHindari mengucek mata dan istirahatkan mata dari paparan layar gadget.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Tulang & Sendi / Orthopedi
  if (q.includes('tulang') || q.includes('sendi') || q.includes('keseleo') || q.includes('patah') || q.includes('pinggang') || q.includes('lutut')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('tulang') || d.spesialis.toLowerCase().includes('orthopedi')) || activeDoctors[0];
    return {
      reply: `Untuk keluhan nyeri sendi, tulang, atau cedera fisik, dokter yang tepat adalah **${doc ? doc.name : 'Dokter Orthopedi'}** (${doc ? doc.spesialis : 'Spesialis Tulang & Orthopedi'}).\n\nKompres dingin area yang nyeri dan batasi pergerakan berat sementara waktu.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Kulit & Kelamin
  if (q.includes('kulit') || q.includes('gatal') || q.includes('ruam') || q.includes('alergi') || q.includes('jerawat')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('kulit')) || activeDoctors[0];
    return {
      reply: `Untuk masalah ruam kulit, gatal alergi, atau jerawat, Anda bisa berkonsultasi dengan **${doc ? doc.name : 'Dokter Kulit'}** (${doc ? doc.spesialis : 'Spesialis Kulit & Kelamin'}).\n\nHindari menggaruk area kulit yang gatal untuk mencegah infeksi sekunder.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Lambung / Penyakit Dalam / Maag
  if (q.includes('maag') || q.includes('lambung') || q.includes('mual') || q.includes('perut') || q.includes('gerd') || q.includes('ulu hati')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('dalam')) || activeDoctors[0];
    return {
      reply: `Untuk keluhan lambung, mual, atau masalah organ dalam, Anda disarankan berkonsultasi dengan **${doc ? doc.name : 'Dokter Spesialis Penyakit Dalam'}** (${doc ? doc.spesialis : 'Spesialis Penyakit Dalam'}).\n\nMinum air hangat dan hindari makanan pedas, asam, atau kopi sementara waktu.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Umum / Flu / Demam
  if (q.includes('flu') || q.includes('demam') || q.includes('batuk') || q.includes('pilek') || q.includes('pusing') || q.includes('panas')) {
    const doc = activeDoctors.find((d) => d.spesialis.toLowerCase().includes('umum')) || activeDoctors[0];
    return {
      reply: `Untuk gejala flu, demam, atau pusing ringan, Anda bisa berkonsultasi dengan **${doc ? doc.name : 'Dokter Umum'}** (${doc ? doc.spesialis : 'Dokter Umum'}).\n\nPerbanyak minum air hangat dan istirahat yang cukup di rumah.`,
      recommendBooking: true,
      recommendedDoctorId: doc?.id,
      recommendedDoctorName: doc?.name,
    };
  }

  // Bantu pilih dokter secara umum (belum sebutkan gejala)
  if (q.includes('pilih dokter') || q.includes('bingung') || q.includes('rekomendasi dokter')) {
    return {
      reply: `Halo${nameGreeting}! Saya siap membantu mencocokkan dokter yang tepat di ReyClinic.\n\nBisa ceritakan apa keluhan atau gejala utama yang Anda rasakan saat ini? (Misal: sakit gigi, perut mual, ruam kulit, atau demam pada anak)`,
      recommendBooking: true,
    };
  }

  // 3. Pertanyaan seputar dokter bertugas / jadwal dokter
  if (q.includes('dokter') || q.includes('jadwal') || q.includes('spesialis') || q.includes('tarif') || q.includes('biaya')) {
    if (activeDoctors.length > 0) {
      const docList = activeDoctors
        .map((d) => `• **${d.name}** (${d.spesialis}) — Rp ${Number(d.fee).toLocaleString('id-ID')}`)
        .join('\n');
      return {
        reply: `Daftar dokter yang sedang bertugas aktif di ReyClinic hari ini:\n\n${docList}\n\nSilakan pilih dokter tujuan untuk mendaftar antrean mandiri.`,
        recommendBooking: true,
      };
    }
    return {
      reply: `Saat ini jadwal dokter sedang disiapkan di sistem ReyClinic. Silakan periksa menu pendaftaran antrean.`,
      recommendBooking: true,
    };
  }

  // 4. Pertanyaan seputar antrean / cara booking
  if (q.includes('antre') || q.includes('daftar') || q.includes('booking') || q.includes('nomor') || q.includes('tiket')) {
    return {
      reply: `Cara ambil antrean mandiri di ReyClinic:\n1. Klik tombol "Ambil Antrean Dokter" di Home.\n2. Pilih dokter yang bertugas dan konfirmasi.\n3. Nomor antrean terbit seketika dan terhubung ke monitor lobi klinik.`,
      recommendBooking: true,
    };
  }

  // 5. Apotek / Obat / Pembayaran QRIS
  if (q.includes('obat') || q.includes('apotek') || q.includes('bayar') || q.includes('qris') || q.includes('resep') || q.includes('kasir')) {
    return {
      reply: `Setelah konsultasi dokter selesai, rincian tagihan muncul otomatis di aplikasi HP Anda. Anda bisa bayar instan via QRIS/Midtrans, dan obat langsung disiapkan di loket Farmasi tanpa antre kasir.`,
      recommendBooking: false,
    };
  }

  // 6. Info Lokasi & Jam Buka
  if (q.includes('lokasi') || q.includes('alamat') || q.includes('jam buka') || q.includes('buka jam') || q.includes('tutup')) {
    return {
      reply: `ReyClinic Medical Center berlokasi di Jl. Kesehatan No. 45, Jakarta Pusat. Buka SETIAP HARI (Senin - Minggu) pukul 08:00 - 21:00 WIB.`,
      recommendBooking: false,
    };
  }

  // Default Fallback
  return {
    reply: `Terima kasih atas pertanyaannya${nameGreeting}. Sebagai asisten kesehatan ReyClinic, saya siap membantu informasi jadwal dokter, panduan antrean, atau rekomendasi poliklinik sesuai keluhan Anda.`,
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
              `- ${d.name} (${d.spesialis}) | Biaya: Rp ${Number(d.fee).toLocaleString('id-ID')} | ID: ${d.id}`,
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
      recommendedDoctorId: local.recommendedDoctorId,
      recommendedDoctorName: local.recommendedDoctorName,
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
- Keunggulan Sistem: Antrean mandiri web/HP realtime, panggilan audio lobi, rekam medis digital, pembayaran cashless QRIS, dan obat cepat di apotek.

=== DAFTAR DOKTER AKTIF HARI INI (DATABASE REALTIME) ===
${doctorListText}

=== ATURAN MUTLAK & GUARDRAILS (STRICT COMPLIANCE - TIDAK BOLEH DILANGGAR) ===
1. FOKUS HANYA PADA REYCLINIC & PERTANYAAN KESEHATAN:
   Anda HANYA melayani topik seputar:
   - Informasi ReyClinic (lokasi, jam buka, fasilitas klinik, alur antrean, pembayaran QRIS, apotek/farmasi).
   - Dokter yang sedang bertugas di ReyClinic, keahlian/spesialisasi, dan biaya konsultasi.
   - Edukasi kesehatan ringan, pertolongan pertama (first aid), dan rekomendasi dokter/triage.
2. TOLAK SECARA TEGAS & RAMAH PERTANYAAN DI LUAR CAKUPAN:
   Jika pengguna menanyakan hal yang TIDAK BERHUBUNGAN dengan kesehatan atau ReyClinic (contoh: koding/pemrograman, politik, selebriti, resep makanan umum, film, game, matematika, cuaca dunia, dsb.), Anda HARUS MENOLAK SECARA SOPAN DAN TEGAS:
   "Maaf, saya ReyAI adalah asisten khusus ReyClinic Medical Center. Saya hanya dapat membantu pertanyaan seputar layanan klinik kami, jadwal dokter bertugas, antrean, dan konsultasi informasi kesehatan ringan. Apakah ada hal seputar layanan ReyClinic yang bisa saya bantu?"
3. SMART TRIAGE & REKOMENDASI DOKTER OTOMATIS:
   - Jika pasien menceritakan gejala keluhan atau bingung memilih dokter, lakukan pencocokan spesifik:
     * Masalah lambung, maag, diabetes, pencernaan, organ dalam -> Rekomendasikan Spesialis Penyakit Dalam.
     * Gejala pada balita/anak-anak (demam anak, batuk anak) -> Rekomendasikan Spesialis Anak.
     * Sakit gigi, gusi bengkak, gigi berlubang, bau mulut, scaling -> Rekomendasikan Spesialis Gigi & Mulut.
     * Mata buram, mata merah, iritasi mata -> Rekomendasikan Spesialis Mata.
     * Gatal-gatal, alergi, ruam, jerawat, penyakit kulit -> Rekomendasikan Spesialis Kulit & Kelamin.
     * Nyeri sendi, keseleo, sakit pinggang, patah tulang -> Rekomendasikan Spesialis Tulang & Orthopedi.
     * Gejala ringan umum (flu, pusing, batuk pilek awal, cekup rutin) -> Rekomendasikan Dokter Umum.
   - Wajib sebutkan NAMA DOKTER LENGKAP dan BIAYA KONSULTASI dari daftar dokter aktif di atas.
   - Berikan 1 tips pertolongan pertama singkat jika relevan, lalu sarankan untuk mendaftar antrean ke dokter tersebut.
4. GAYA BAHASA & PANJANG RESPON (HARUS SINGKAT & SIMPLE):
   - JAWAB SECARA RINGKAS, SIMPLE, DAN TO-THE-POINT (Maksimal 2 hingga 4 kalimat pendek, atau 3-4 butir poin singkat).
   - JANGAN bertele-tele, JANGAN memberikan penjelasan medis yang terlalu panjang lebar agar nyaman dan cepat dibaca di layar HP pasien.
   - Sapa pasien secara wajar jika ada nama: "${patientName || 'Pasien'}".
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

  // 5. Panggil Google Gemini REST API dengan Multi-Model Auto-Failover
  const primaryModel = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  const fallbackModel = primaryModel === 'gemini-2.5-flash-lite' ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite';
  const candidateModels = [primaryModel, fallbackModel];

  for (const model of candidateModels) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
            temperature: 0.2,
            topP: 0.8,
            topK: 32,
            maxOutputTokens: 700,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[ReyAI] Model ${model} returned status ${response.status}: ${errText}. Mencoba model cadangan...`);
        continue; // Coba model cadangan berikutnya
      }

      const data: any = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!candidateText) {
        console.warn(`[ReyAI] Model ${model} returned empty candidate. Mencoba model cadangan...`);
        continue;
      }

      // Deteksi apakah respon menyarankan booking dokter
      const lowerReply = candidateText.toLowerCase();
      const isBookingRecommended =
        lowerReply.includes('antre') ||
        lowerReply.includes('janji temu') ||
        lowerReply.includes('daftar') ||
        lowerReply.includes('berkonsultasi') ||
        lowerReply.includes('dokter jaga');

      const matchedDoc = detectRecommendedDoctor(candidateText, activeDoctors);

      console.log(`[ReyAI] Respon berhasil dihasilkan oleh model ${model}`);

      return {
        reply: candidateText,
        recommendBooking: isBookingRecommended || Boolean(matchedDoc),
        recommendedDoctorId: matchedDoc?.id,
        recommendedDoctorName: matchedDoc?.name,
        source: 'gemini',
      };
    } catch (modelError) {
      console.error(`[ReyAI] Error calling model ${model}:`, modelError);
      // Lanjut ke model cadangan berikutnya
    }
  }

  // Jika semua model Gemini gagal atau habis kuota, gunakan local clinical engine
  console.warn('[ReyAI] Semua model Gemini limit atau offline. Mengalihkan ke local fallback engine.');
  const fallback = generateLocalFallbackReply(message, activeDoctors, patientName);
  return {
    reply: fallback.reply,
    recommendBooking: fallback.recommendBooking,
    recommendedDoctorId: fallback.recommendedDoctorId,
    recommendedDoctorName: fallback.recommendedDoctorName,
    source: 'local_fallback',
  };
};
