// Helper Web Audio API: Membunyikan nada bel 'Ding-Dong' khas lobi rumah sakit / klinik
export const playDingDong = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Nada 1: C5 (523.25 Hz), Nada 2: E5 (659.25 Hz)
    playTone(523.25, 0, 0.45);
    playTone(659.25, 0.28, 0.65);
  } catch (error) {
    console.warn('AudioContext gagal diputar:', error);
  }
};

// Cache daftar voice agar tidak kosong saat baru reload halaman
let cachedVoices: SpeechSynthesisVoice[] = [];

const refreshVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
};

// Inisialisasi awal & daftarkan listener browser saat voices siap
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

// Fungsi pencari suara Bahasa Indonesia terbaik (Prioritas Suara Wanita/Resepsionis)
const findIndonesianVoice = (): SpeechSynthesisVoice | null => {
  refreshVoices();
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Kumpulkan semua suara Bahasa Indonesia
  const idVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const name = (v.name || '').toLowerCase();
    return (
      lang.startsWith('id') ||
      lang.startsWith('in') ||
      name.includes('indonesia') ||
      name.includes('gadis') ||
      name.includes('ardi')
    );
  });

  if (idVoices.length > 0) {
    // 1. Prioritas Utama: Suara Wanita Bahasa Indonesia (Microsoft Gadis di Edge, Google Bahasa Indonesia di Chrome)
    const femaleVoice = idVoices.find((v) => {
      const name = v.name.toLowerCase();
      return name.includes('gadis') || name.includes('google') || name.includes('female');
    });
    if (femaleVoice) return femaleVoice;

    // 2. Prioritas Kedua: Hindari suara pria (Ardi) jika ada alternatif suara Indonesia lainnya
    const nonMaleVoice = idVoices.find((v) => {
      const name = v.name.toLowerCase();
      return !name.includes('ardi') && !name.includes('male');
    });
    if (nonMaleVoice) return nonMaleVoice;

    // 3. Fallback: Suara Indonesia pertama yang tersedia
    return idVoices[0];
  }

  // 4. Fallback regional: Melayu (ms-MY / Bahasa Melayu)
  const msVoices = voices.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const name = (v.name || '').toLowerCase();
    return lang.startsWith('ms') || name.includes('malay');
  });

  if (msVoices.length > 0) {
    const femaleMs = msVoices.find((v) => !v.name.toLowerCase().includes('male'));
    return femaleMs || msVoices[0];
  }

  return null;
};

// Helper Web Speech API: Mengumumkan pemanggilan nomor antrean & nama pasien
export const announceQueue = (
  queueNumber: string | number,
  patientName: string,
  doctorName?: string,
  doctorSpecialty?: string
) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser tidak mendukung Web Speech API');
    return;
  }

  // 1. Bunyikan nada bel terlebih dahulu
  playDingDong();

  // 2. Beri jeda setelah nada bel berbunyi sebelum suara berbicara
  setTimeout(() => {
    try {
      window.speechSynthesis.cancel(); // Hentikan antrean audio jika tombol diklik berulang kali

      const destination = doctorName
        ? `ruang ${doctorName}${doctorSpecialty ? `, spesialis ${doctorSpecialty}` : ''}`
        : 'ruang pemeriksaan dokter';

      const text = `Nomor antrean ${queueNumber}, atas nama ${patientName}, silakan menuju ${destination}.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.88; // Tempo bicara rileks dan jelas
      utterance.pitch = 1.05; // Pitch natural dan ramah khas resepsionis klinik

      // Cari dan pasang voice Bahasa Indonesia secara presisi
      const bestVoice = findIndonesianVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Gagal memutar panggilan suara:', err);
    }
  }, 750);
};
