"use client";

import { createContext, useContext } from "react";

export type Locale = "en" | "id";

export const translations = {
  en: {
    // Title screen
    title_subtitle: "AI Battle Arena",
    title_tagline: "Your creativity is your weapon. Fight monsters with words.",
    how_to_play: "HOW TO PLAY:",
    step1: "1. Choose your enemy",
    step2: "2. Describe your battle actions in natural language",
    step3: "3. AI Game Master judges your creativity & strategy",
    step4: "4. More creative prompts = more damage!",
    start_game: "> START GAME <",
    press_enter: "Press ENTER or click to begin",

    // Enemy select
    select_opponent: "> SELECT YOUR OPPONENT",
    select_hint: "Choose wisely. Harder enemies yield higher scores.",
    difficulty_easy: "EASY",
    difficulty_medium: "MEDIUM",
    difficulty_boss: "BOSS",
    back: "< BACK",
    fight: "> FIGHT!",
    initiating: "Initiating battle...",
    load_enemies_fail: "Failed to load enemies",
    start_battle_fail: "Failed to start battle. Try again.",

    // Battle screen
    you: "YOU",
    turn_label: "Turn",
    player_label: "PLAYER",
    example_prompts_label: "Example prompts:",
    example_prompts: [
      "I swing my sword at its weak point",
      "I throw sand in its eyes and strike from behind",
      "I channel fire magic into a devastating blast",
      "I dodge its attack and counter with a precise strike to the joints",
    ],
    waiting: "Waiting for Game Master...",
    cooldown: "Cooldown...",
    describe_action: "Describe your action...",
    send: "SEND",
    gm_deliberates: "The Game Master deliberates",
    generating_vision: "Generating battle vision",
    damage_to_enemy: (dmg: number, name: string, creativity: number) =>
      `  ⚔ ${dmg} damage to ${name} [creativity: ${creativity}/10]`,
    damage_to_player: (dmg: number) => `  💥 You take ${dmg} damage!`,
    affected_by: (name: string, effect: string) =>
      `  ${name} is affected by ${effect}!`,
    you_affected: (effect: string) => `  You are affected by ${effect}!`,
    turn_separator: (turn: number, max: number) =>
      `─── Turn ${turn}/${max} ───`,
    gm_distracted: "The Game Master is distracted... try again.",
    restart_game: "> RESTART GAME",

    // Battle end in battle screen
    enemy_defeated: (name: string) => `★ ${name} has been defeated! ★`,
    you_fallen: "✖ You have fallen... ✖",
    battle_timeout: "⏱ Battle timed out! ⏱",
    view_results: "> VIEW RESULTS <",

    // Comic panels
    panel_your_attack: "YOUR ATTACK",
    panel_impact: "IMPACT!",
    panel_enemy_strikes: "ENEMY STRIKES",
    panel_aftermath: "AFTERMATH",
    click_continue: "Click or SPACE to continue",
    click_dismiss: "Click or SPACE to dismiss",

    // Battle end screen
    victory: "★ V I C T O R Y ★",
    defeat: "✖ D E F E A T ✖",
    timeout: "⏱ T I M E  O U T ⏱",
    victory_msg: (name: string) => `You defeated ${name}!`,
    defeat_msg: (name: string) => `${name} has bested you...`,
    timeout_msg: "The battle has timed out!",
    battle_report: "BATTLE REPORT",
    enemy_label: "Enemy:",
    result_label: "Result:",
    turns_label: "Turns:",
    score_label: "SCORE:",
    fight_again: "> FIGHT AGAIN",
    main_menu: "< MAIN MENU",

    // Enemy
    weak_label: "Weak",
    enemy_descs: {
      1: "A wobbling mass of green slime wearing a tiny golden crown. It jiggles menacingly.",
      2: "A wolf made of living shadow, with glowing red eyes. It phases in and out of darkness.",
      3: "A towering construct of ancient stone, covered in glowing runes. Each step shakes the ground.",
    } as Record<number, string>,
    enemy_weakness: {
      fire: "fire",
      piercing: "piercing",
      light: "light",
      "loud noises": "loud noises",
      water: "water",
      "precision strikes at joints": "precision strikes at joints",
    } as Record<string, string>,

    // Battle intro
    enemy_appears: (name: string) => `${name} APPEARS!`,
    intro_slime_dialogue: '"Hah! Another challenger? I\'ll absorb you in seconds!"',
    intro_wolf_dialogue: "*The air grows cold. You hear nothing but your own heartbeat.*",
    intro_golem_dialogue: '"MORTAL... PROVE YOUR WORTH... OR BE CRUSHED..."',
    weakness_label: "Weakness",

    // Mode select
    mode_select_title: "> SELECT GAME MODE",
    mode_pve: "SOLO PVE",
    mode_pvp: "PVP ARENA",
    mode_coop: "CO-OP",
    mode_direct_pvp: "DIRECT PVP",
    coming_soon: "SOON",

    // Wallet
    connect_wallet: "Connect Wallet",
    disconnect: "Disconnect",
    clash_balance: "CLASH Balance",

    // On-chain results
    score_on_chain: "Score recorded on-chain",
    connect_to_save: "Connect wallet to save scores",
    clash_earned: (amount: number) => `+${amount} CLASH earned!`,
    nft_minted: "Victory NFT minted!",
    view_leaderboard: "> VIEW LEADERBOARD",

    // Leaderboard
    leaderboard_title: "> LEADERBOARD",
    leaderboard_empty: "No scores recorded yet.",
    rank: "RANK",
    address: "ADDRESS",

    // Language
    language: "Language",
  },

  id: {
    // Title screen
    title_subtitle: "Arena Pertarungan AI",
    title_tagline:
      "Kreativitasmu adalah senjatamu. Lawan monster dengan kata-kata.",
    how_to_play: "CARA BERMAIN:",
    step1: "1. Pilih musuhmu",
    step2: "2. Deskripsikan aksi pertarunganmu dalam bahasa natural",
    step3: "3. AI Game Master menilai kreativitas & strategimu",
    step4: "4. Prompt lebih kreatif = damage lebih besar!",
    start_game: "> MULAI GAME <",
    press_enter: "Tekan ENTER atau klik untuk memulai",

    // Enemy select
    select_opponent: "> PILIH LAWANMU",
    select_hint: "Pilih dengan bijak. Musuh lebih kuat = skor lebih tinggi.",
    difficulty_easy: "MUDAH",
    difficulty_medium: "SEDANG",
    difficulty_boss: "BOS",
    back: "< KEMBALI",
    fight: "> LAWAN!",
    initiating: "Memulai pertarungan...",
    load_enemies_fail: "Gagal memuat daftar musuh",
    start_battle_fail: "Gagal memulai pertarungan. Coba lagi.",

    // Battle screen
    you: "KAMU",
    turn_label: "Giliran",
    player_label: "PEMAIN",
    example_prompts_label: "Contoh prompt:",
    example_prompts: [
      "Aku ayunkan pedang ke titik lemahnya",
      "Aku lempar pasir ke matanya lalu serang dari belakang",
      "Aku alirkan sihir api menjadi ledakan dahsyat",
      "Aku menghindar lalu menyerang balik dengan tusukan presisi ke sendinya",
    ],
    waiting: "Menunggu Game Master...",
    cooldown: "Cooldown...",
    describe_action: "Deskripsikan aksimu...",
    send: "KIRIM",
    gm_deliberates: "Game Master sedang berpikir",
    generating_vision: "Membuat visualisasi pertarungan",
    damage_to_enemy: (dmg: number, name: string, creativity: number) =>
      `  ⚔ ${dmg} damage ke ${name} [kreativitas: ${creativity}/10]`,
    damage_to_player: (dmg: number) => `  💥 Kamu menerima ${dmg} damage!`,
    affected_by: (name: string, effect: string) =>
      `  ${name} terkena ${effect}!`,
    you_affected: (effect: string) => `  Kamu terkena ${effect}!`,
    turn_separator: (turn: number, max: number) =>
      `─── Giliran ${turn}/${max} ───`,
    gm_distracted: "Game Master sedang terdistraksi... coba lagi.",
    restart_game: "> MULAI ULANG",

    // Battle end in battle screen
    enemy_defeated: (name: string) => `★ ${name} telah dikalahkan! ★`,
    you_fallen: "✖ Kamu telah jatuh... ✖",
    battle_timeout: "⏱ Waktu pertarungan habis! ⏱",
    view_results: "> LIHAT HASIL <",

    // Comic panels
    panel_your_attack: "SERANGANMU",
    panel_impact: "DAMPAK!",
    panel_enemy_strikes: "MUSUH MENYERANG",
    panel_aftermath: "HASIL AKHIR",
    click_continue: "Klik atau SPASI untuk lanjut",
    click_dismiss: "Klik atau SPASI untuk tutup",

    // Battle end screen
    victory: "★ K E M E N A N G A N ★",
    defeat: "✖ K E K A L A H A N ✖",
    timeout: "⏱ W A K T U  H A B I S ⏱",
    victory_msg: (name: string) => `Kamu mengalahkan ${name}!`,
    defeat_msg: (name: string) => `${name} mengalahkanmu...`,
    timeout_msg: "Waktu pertarungan habis!",
    battle_report: "LAPORAN PERTARUNGAN",
    enemy_label: "Musuh:",
    result_label: "Hasil:",
    turns_label: "Giliran:",
    score_label: "SKOR:",
    fight_again: "> LAWAN LAGI",
    main_menu: "< MENU UTAMA",

    // Enemy
    weak_label: "Lemah",
    enemy_descs: {
      1: "Gumpalan slime hijau yang bergoyang-goyang memakai mahkota emas kecil. Dia bergetar mengancam.",
      2: "Seekor serigala yang terbuat dari bayangan hidup, dengan mata merah menyala. Dia muncul dan menghilang dari kegelapan.",
      3: "Konstruksi batu kuno yang menjulang tinggi, dipenuhi rune-rune bercahaya. Setiap langkahnya mengguncang tanah.",
    } as Record<number, string>,
    enemy_weakness: {
      fire: "api",
      piercing: "tusukan",
      light: "cahaya",
      "loud noises": "suara keras",
      water: "air",
      "precision strikes at joints": "serangan presisi ke sendi",
    } as Record<string, string>,

    // Battle intro
    enemy_appears: (name: string) => `${name} MUNCUL!`,
    intro_slime_dialogue: '"Hah! Penantang lagi? Aku serap kau dalam hitungan detik!"',
    intro_wolf_dialogue: "*Udara menjadi dingin. Kau hanya mendengar detak jantungmu sendiri.*",
    intro_golem_dialogue: '"MANUSIA FANA... BUKTIKAN KELAYAKANMU... ATAU HANCUR LEBUR..."',
    weakness_label: "Kelemahan",

    // Mode select
    mode_select_title: "> PILIH MODE PERMAINAN",
    mode_pve: "SOLO PVE",
    mode_pvp: "ARENA PVP",
    mode_coop: "CO-OP",
    mode_direct_pvp: "PVP LANGSUNG",
    coming_soon: "SEGERA",

    // Wallet
    connect_wallet: "Hubungkan Wallet",
    disconnect: "Putuskan",
    clash_balance: "Saldo CLASH",

    // On-chain results
    score_on_chain: "Skor tercatat on-chain",
    connect_to_save: "Hubungkan wallet untuk menyimpan skor",
    clash_earned: (amount: number) => `+${amount} CLASH diperoleh!`,
    nft_minted: "NFT Kemenangan dicetak!",
    view_leaderboard: "> LIHAT PAPAN PERINGKAT",

    // Leaderboard
    leaderboard_title: "> PAPAN PERINGKAT",
    leaderboard_empty: "Belum ada skor tercatat.",
    rank: "PERINGKAT",
    address: "ALAMAT",

    // Language
    language: "Bahasa",
  },
};

export type Translations = typeof translations.en;

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: translations.en,
  setLocale: () => {},
});

export function useI18n() {
  return useContext(I18nContext);
}
