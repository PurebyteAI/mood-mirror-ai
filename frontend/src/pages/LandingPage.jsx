import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Pen,
  Brush,
  Mic,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Moon,
  Sun,
  Sparkles,
  Lock,
  BarChart3,
  BookOpen,
  Clock,
  Wind,
  RefreshCw,
} from "lucide-react";
import Landing3DStage from "@/components/mood/Landing3DStage";
import { LanguageSwitcher } from "@/components/mood/LanguageSwitcher";
import { getLanguage, setStoredLanguage, speechLocale } from "@/lib/languages";
import { useTranslation } from "@/i18n";

// Localized 3D realm copy across all 6 supported languages (concise & curiosity-driven)
const REALM_COPY = {
  en: {
    tagline: "Pause. Reflect. Find Your Way.",
    navHome: "Home",
    navFeatures: "Features",
    navHow: "How It Works",
    navAbout: "About",
    themeDark: "Dark",
    themeDaylight: "Daylight",
    themeRomantic: "Romantic",
    startReflecting: "Start Reflecting",
    darkBadge: "01 // Dark Sanctuary",
    darkHeadline1: "Understand Your Emotions.",
    darkHeadline2: "Find Your Balance.",
    darkSub: "Your personal space to pause, reflect and grow.",
    whisperLabel: "Live Poetic Whisper",
    whisperHint: "What will the mirror write when you share a thought?",
    tryYourOwn: "Try with your own words",
    portal1Label: "Scroll through the sunrise portal",
    daylightBadge: "02 // Daylight Clarity",
    daylightHeadline1: "Discover Patterns.",
    daylightHeadline2: "Understand Yourself.",
    daylightSub: "Turn everyday reflections into meaningful insights.",
    pillars: [
      "Mood tracking",
      "Personal journaling",
      "Weekly emotional insights",
      "Reflection history",
    ],
    pulseTitle: "7-Day Emotional Pulse",
    pulseUnlock: "Unlock your personal timeline inside",
    portal2Label: "Pass through the sunset glass arch",
    romanticBadge: "03 // Self-Compassion",
    romanticHeadline1: "Be Kinder",
    romanticHeadline2: "to Your Mind.",
    romanticSub: "Explore your thoughts with gentle guidance and a fresh perspective.",
    reframePills: [
      "Cognitive reframing cards",
      "Gentle AI reflection prompts",
      "Grounding exercises",
      "Personal growth journey",
    ],
    stuckLabel: "Heavy Thought",
    shiftLabel: "Gentle Perspective",
    breatheLabel: "4-4-6 Grounding",
    revealBadge: "All Three Realms in Harmony",
    startJourney: "Start Your Journey",
    curiosityNote: "No account. 100% private. One sentence is enough to begin.",
  },
  de: {
    tagline: "Innehalten. Reflektieren. Deinen Weg finden.",
    navHome: "Start",
    navFeatures: "Funktionen",
    navHow: "Ablauf",
    navAbout: "Über uns",
    themeDark: "Dunkel",
    themeDaylight: "Tageslicht",
    themeRomantic: "Romantisch",
    startReflecting: "Jetzt reflektieren",
    darkBadge: "01 // Dunkles Refugium",
    darkHeadline1: "Verstehe deine Emotionen.",
    darkHeadline2: "Finde deine Balance.",
    darkSub: "Dein persönlicher Raum zum Innehalten, Reflektieren und Wachsen.",
    whisperLabel: "Poetisches Echo",
    whisperHint: "Was schreibt der Spiegel, wenn du einen Gedanken teilst?",
    tryYourOwn: "Mit eigenen Worten testen",
    portal1Label: "Reise durch das Sonnenaufgangs-Portal",
    daylightBadge: "02 // Tageslicht-Klarheit",
    daylightHeadline1: "Muster erkennen.",
    daylightHeadline2: "Dich selbst verstehen.",
    daylightSub: "Verwandle alltägliche Reflexionen in bedeutsame Erkenntnisse.",
    pillars: [
      "Stimmungs-Tracking",
      "Persönliches Tagebuch",
      "Wöchentliche Einblicke",
      "Reflexionsverlauf",
    ],
    pulseTitle: "7-Tage-Emotionspuls",
    pulseUnlock: "Entdecke deine eigene Zeitlinie in der App",
    portal2Label: "Durchschreite den Abendlicht-Glasbogen",
    romanticBadge: "03 // Selbstmitgefühl",
    romanticHeadline1: "Sei freundlicher",
    romanticHeadline2: "zu deinem Geist.",
    romanticSub: "Erkunde deine Gedanken mit sanfter Führung und neuer Perspektive.",
    reframePills: [
      "Kognitive Umdeutungskarten",
      "Sanfte KI-Reflexionsimpulse",
      "Erdungsübungen",
      "Persönlicher Wachstumsweg",
    ],
    stuckLabel: "Schwerer Gedanke",
    shiftLabel: "Sanfter Perspektivwechsel",
    breatheLabel: "4-4-6-Erdung",
    revealBadge: "Alle drei Welten im Einklang",
    startJourney: "Deine Reise starten",
    curiosityNote: "Kein Konto nötig. 100 % privat. Ein Satz genügt.",
  },
  fr: {
    tagline: "Faire une pause. Réfléchir. Trouver sa voie.",
    navHome: "Accueil",
    navFeatures: "Fonctions",
    navHow: "Fonctionnement",
    navAbout: "À propos",
    themeDark: "Sombre",
    themeDaylight: "Jour",
    themeRomantic: "Romantique",
    startReflecting: "Commencer",
    darkBadge: "01 // Sanctuaire Nocturne",
    darkHeadline1: "Comprenez vos émotions.",
    darkHeadline2: "Trouvez votre équilibre.",
    darkSub: "Votre espace personnel pour faire une pause, réfléchir et grandir.",
    whisperLabel: "Murmure poétique",
    whisperHint: "Qu’écrira le miroir lorsque vous partagerez une pensée ?",
    tryYourOwn: "Essayer avec vos propres mots",
    portal1Label: "Traversez le portail de l’aube",
    daylightBadge: "02 // Clarté du Jour",
    daylightHeadline1: "Découvrez vos rythmes.",
    daylightHeadline2: "Comprenez-vous.",
    daylightSub: "Transformez vos réflexions quotidiennes en éclairages précieux.",
    pillars: [
      "Suivi de l’humeur",
      "Journal personnel",
      "Analyses hebdomadaires",
      "Historique de réflexion",
    ],
    pulseTitle: "Pouls émotionnel sur 7 jours",
    pulseUnlock: "Débloquez votre propre chronologie dans l’application",
    portal2Label: "Passez sous l’arche de verre au couchant",
    romanticBadge: "03 // Bienveillance",
    romanticHeadline1: "Soyez plus doux",
    romanticHeadline2: "avec votre esprit.",
    romanticSub: "Explorez vos pensées avec douceur et une perspective nouvelle.",
    reframePills: [
      "Cartes de recadrage cognitif",
      "Invitations douces à la réflexion",
      "Exercices d’ancrage",
      "Parcours de croissance personnelle",
    ],
    stuckLabel: "Pensée pesante",
    shiftLabel: "Nouveau regard",
    breatheLabel: "Ancrage 4-4-6",
    revealBadge: "Les trois univers en harmonie",
    startJourney: "Commencer votre voyage",
    curiosityNote: "Sans compte. 100 % privé. Une seule phrase suffit.",
  },
  it: {
    tagline: "Fermati. Rifletti. Trova la tua strada.",
    navHome: "Home",
    navFeatures: "Funzioni",
    navHow: "Come funziona",
    navAbout: "Info",
    themeDark: "Scuro",
    themeDaylight: "Giorno",
    themeRomantic: "Romantico",
    startReflecting: "Inizia a riflettere",
    darkBadge: "01 // Santuario Notturno",
    darkHeadline1: "Comprendi le tue emozioni.",
    darkHeadline2: "Trova il tuo equilibrio.",
    darkSub: "Il tuo spazio personale per fermarti, riflettere e crescere.",
    whisperLabel: "Sussurro poetico",
    whisperHint: "Cosa scriverà lo specchio quando condividerai un pensiero?",
    tryYourOwn: "Prova con le tue parole",
    portal1Label: "Attraversa il portale dell’alba",
    daylightBadge: "02 // Chiarezza Diurna",
    daylightHeadline1: "Scopri i tuoi schemi.",
    daylightHeadline2: "Comprendi te stesso.",
    daylightSub: "Trasforma le riflessioni quotidiane in intuizioni profonde.",
    pillars: [
      "Tracciamento dell’umore",
      "Diario personale",
      "Intuizioni settimanali",
      "Cronologia delle riflessioni",
    ],
    pulseTitle: "Impulso emotivo di 7 giorni",
    pulseUnlock: "Sblocca la tua cronologia personale nell’app",
    portal2Label: "Attraversa l’arco di vetro al tramonto",
    romanticBadge: "03 // Gentilezza Interiore",
    romanticHeadline1: "Sii più gentile",
    romanticHeadline2: "con la tua mente.",
    romanticSub: "Esplora i tuoi pensieri con guida delicata e una nuova prospettiva.",
    reframePills: [
      "Carte di riformulazione cognitiva",
      "Spunti gentili di riflessione IA",
      "Esercizi di radicamento",
      "Percorso di crescita personale",
    ],
    stuckLabel: "Pensiero pesante",
    shiftLabel: "Prospettiva gentile",
    breatheLabel: "Respiro 4-4-6",
    revealBadge: "Tutti e tre i mondi in armonia",
    startJourney: "Inizia il tuo viaggio",
    curiosityNote: "Nessun account. 100% privato. Basta una frase per iniziare.",
  },
  es: {
    tagline: "Pausa. Reflexiona. Encuentra tu camino.",
    navHome: "Inicio",
    navFeatures: "Funciones",
    navHow: "Cómo funciona",
    navAbout: "Acerca de",
    themeDark: "Oscuro",
    themeDaylight: "Día",
    themeRomantic: "Romántico",
    startReflecting: "Empezar a reflexionar",
    darkBadge: "01 // Santuario Nocturno",
    darkHeadline1: "Comprende tus emociones.",
    darkHeadline2: "Encuentra tu equilibrio.",
    darkSub: "Tu espacio personal para hacer una pausa, reflexionar y crecer.",
    whisperLabel: "Susurro poético",
    whisperHint: "¿Qué escribirá el espejo cuando compartas un pensamiento?",
    tryYourOwn: "Probar con tus propias palabras",
    portal1Label: "Cruza el portal del amanecer",
    daylightBadge: "02 // Claridad Diurna",
    daylightHeadline1: "Descubre patrones.",
    daylightHeadline2: "Compréndete a ti mismo.",
    daylightSub: "Convierte las reflexiones cotidianas en perspectivas valiosas.",
    pillars: [
      "Seguimiento del ánimo",
      "Diario personal",
      "Perspectivas semanales",
      "Historial de reflexión",
    ],
    pulseTitle: "Pulso emocional de 7 días",
    pulseUnlock: "Descubre tu propia línea de tiempo dentro",
    portal2Label: "Atraviesa el arco de cristal al atardecer",
    romanticBadge: "03 // Autocompasión",
    romanticHeadline1: "Sé más amable",
    romanticHeadline2: "con tu mente.",
    romanticSub: "Explora tus pensamientos con guía suave y una perspectiva fresca.",
    reframePills: [
      "Tarjetas de reencuadre cognitivo",
      "Impulsos suaves de reflexión IA",
      "Ejercicios de calma",
      "Viaje de crecimiento personal",
    ],
    stuckLabel: "Pensamiento pesado",
    shiftLabel: "Perspectiva amable",
    breatheLabel: "Calma 4-4-6",
    revealBadge: "Los tres mundos en armonía",
    startJourney: "Comienza tu viaje",
    curiosityNote: "Sin cuenta. 100% privado. Una sola frase basta para empezar.",
  },
  zh: {
    tagline: "驻足 · 映照 · 寻回内心方向",
    navHome: "首页",
    navFeatures: "核心体验",
    navHow: "如何运作",
    navAbout: "关于项目",
    themeDark: "暗夜",
    themeDaylight: "晨光",
    themeRomantic: "温柔",
    startReflecting: "开始映照",
    darkBadge: "01 // 暗夜圣殿",
    darkHeadline1: "读懂你的情绪，",
    darkHeadline2: "寻回内心平衡。",
    darkSub: "属于你的私密空间，在此驻足、映照与成长。",
    whisperLabel: "实时诗意回响",
    whisperHint: "当你写下一句话，镜子会为你写下怎样的诗行？",
    tryYourOwn: "输入你的心情试试",
    portal1Label: "穿过晨光玻璃之门",
    daylightBadge: "02 // 晨光澄明",
    daylightHeadline1: "发现情绪脉络，",
    daylightHeadline2: "更温柔地理解自己。",
    daylightSub: "将每一次日常倾诉，化作清晰可见的内心洞察。",
    pillars: [
      "情绪轨迹追踪",
      "私密心情手账",
      "每周情绪洞察",
      "映照历史档案",
    ],
    pulseTitle: "7 日情绪脉搏",
    pulseUnlock: "进入应用解锁你的专属情绪光谱",
    portal2Label: "穿过暮色琉璃拱门",
    romanticBadge: "03 // 自我慈悲",
    romanticHeadline1: "对自己的内心，",
    romanticHeadline2: "再温柔一点。",
    romanticSub: "在温和引导与全新视角中，松开紧绷的思绪。",
    reframePills: [
      "认知重塑卡片",
      "温和 AI 映照提问",
      "正念呼吸练习",
      "个人成长旅程",
    ],
    stuckLabel: "紧绷的念头",
    shiftLabel: "温柔的新视角",
    breatheLabel: "4-4-6 呼吸锚点",
    revealBadge: "三重境界 · 和谐共生",
    startJourney: "开启你的旅程",
    curiosityNote: "无需注册 · 100% 私密 · 一句话即可开启映照。",
  },
};

const SPECIMENS_BY_LANG = {
  en: [
    {
      id: "calm",
      label: "Serenity",
      excerpt: "Quiet light settles along the windowsill,\nthe hurried clockwork loosens its grip…",
      emotions: [
        { key: "joy", pct: 68, color: "#D4A373" },
        { key: "neutral", pct: 24, color: "#7E9F8E" },
      ],
    },
    {
      id: "nostalgia",
      label: "Quiet Reflection",
      excerpt: "Rain traces old addresses across the glass,\nphotographs warm in the palm of memory…",
      emotions: [
        { key: "sadness", pct: 54, color: "#6BA3BE" },
        { key: "joy", pct: 36, color: "#D4A373" },
      ],
    },
    {
      id: "tension",
      label: "Exam Fatigue",
      excerpt: "The library lamps hum through a late-night page,\nyet even the strongest arch requires rest…",
      emotions: [
        { key: "fear", pct: 48, color: "#A594F9" },
        { key: "sadness", pct: 34, color: "#6BA3BE" },
      ],
    },
  ],
  de: [
    {
      id: "calm",
      label: "Gelassenheit",
      excerpt: "Stilles Licht legt sich auf das Fensterbrett,\ndas gehetzte Uhrwerk lässt endlich los…",
      emotions: [
        { key: "joy", pct: 68, color: "#D4A373" },
        { key: "neutral", pct: 24, color: "#7E9F8E" },
      ],
    },
    {
      id: "nostalgia",
      label: "Sehnsucht",
      excerpt: "Regen zeichnet alte Adressen auf das Glas,\nFotografien wärmen sich in der Erinnerung…",
      emotions: [
        { key: "sadness", pct: 54, color: "#6BA3BE" },
        { key: "joy", pct: 36, color: "#D4A373" },
      ],
    },
    {
      id: "tension",
      label: "Prüfungsdruck",
      excerpt: "Die Bibliothekslampen summen durch die Nacht,\ndoch selbst der stärkste Bogen braucht Ruhe…",
      emotions: [
        { key: "fear", pct: 48, color: "#A594F9" },
        { key: "sadness", pct: 34, color: "#6BA3BE" },
      ],
    },
  ],
  fr: [
    {
      id: "calm",
      label: "Sérénité",
      excerpt: "Une lumière douce se pose sur le rebord,\nl’horloge pressée desserre enfin son étreinte…",
      emotions: [
        { key: "joy", pct: 68, color: "#D4A373" },
        { key: "neutral", pct: 24, color: "#7E9F8E" },
      ],
    },
    {
      id: "nostalgia",
      label: "Nostalgie",
      excerpt: "La pluie trace d’anciennes adresses sur la vitre,\ndes souvenirs tièdes au creux de la mémoire…",
      emotions: [
        { key: "sadness", pct: 54, color: "#6BA3BE" },
        { key: "joy", pct: 36, color: "#D4A373" },
      ],
    },
    {
      id: "tension",
      label: "Fatigue d’études",
      excerpt: "Les lampes de la bibliothèque murmurent tard,\nmême la voûte la plus solide réclame le repos…",
      emotions: [
        { key: "fear", pct: 48, color: "#A594F9" },
        { key: "sadness", pct: 34, color: "#6BA3BE" },
      ],
    },
  ],
  it: [
    {
      id: "calm",
      label: "Serenità",
      excerpt: "Una luce quieta si posa sul davanzale,\nl’ingranaggio frettoloso allenta la sua presa…",
      emotions: [
        { key: "joy", pct: 68, color: "#D4A373" },
        { key: "neutral", pct: 24, color: "#7E9F8E" },
      ],
    },
    {
      id: "nostalgia",
      label: "Nostalgia",
      excerpt: "La pioggia disegna vecchi indirizzi sul vetro,\nfotografie tiepide nel palmo della memoria…",
      emotions: [
        { key: "sadness", pct: 54, color: "#6BA3BE" },
        { key: "joy", pct: 36, color: "#D4A373" },
      ],
    },
    {
      id: "tension",
      label: "Fatica da esami",
      excerpt: "Le lampade della biblioteca vibrano nella notte,\nanche l’arco più forte chiede una pausa…",
      emotions: [
        { key: "fear", pct: 48, color: "#A594F9" },
        { key: "sadness", pct: 34, color: "#6BA3BE" },
      ],
    },
  ],
  es: [
    {
      id: "calm",
      label: "Serenidad",
      excerpt: "Una luz tranquila se posa en el alféizar,\nel reloj apresurado afloja por fin su pulso…",
      emotions: [
        { key: "joy", pct: 68, color: "#D4A373" },
        { key: "neutral", pct: 24, color: "#7E9F8E" },
      ],
    },
    {
      id: "nostalgia",
      label: "Nostalgia",
      excerpt: "La lluvia traza viejas direcciones en el cristal,\nfotografías tibias en la palma de la memoria…",
      emotions: [
        { key: "sadness", pct: 54, color: "#6BA3BE" },
        { key: "joy", pct: 36, color: "#D4A373" },
      ],
    },
    {
      id: "tension",
      label: "Fatiga de estudio",
      excerpt: "Las lámparas de la biblioteca murmuran de noche,\nincluso el arco más firme necesita reposo…",
      emotions: [
        { key: "fear", pct: 48, color: "#A594F9" },
        { key: "sadness", pct: 34, color: "#6BA3BE" },
      ],
    },
  ],
  zh: [
    {
      id: "calm",
      label: "澄明宁静",
      excerpt: "柔和的光线静静落在窗台，\n匆忙的钟摆终于松开了紧握……",
      emotions: [
        { key: "joy", pct: 68, color: "#D4A373" },
        { key: "neutral", pct: 24, color: "#7E9F8E" },
      ],
    },
    {
      id: "nostalgia",
      label: "温存怀旧",
      excerpt: "雨水在玻璃上描摹旧日的街巷，\n记忆掌心里的旧照片依然温热……",
      emotions: [
        { key: "sadness", pct: 54, color: "#6BA3BE" },
        { key: "joy", pct: 36, color: "#D4A373" },
      ],
    },
    {
      id: "tension",
      label: "备考疲惫",
      excerpt: "深夜图书馆的灯光仍在低声嗡鸣，\n再坚固的拱门也需要片刻停驻……",
      emotions: [
        { key: "fear", pct: 48, color: "#A594F9" },
        { key: "sadness", pct: 34, color: "#6BA3BE" },
      ],
    },
  ],
};

const REFRAME_BY_LANG = {
  en: {
    stuck: "“If I don’t ace every module this week, I’m falling behind.”",
    gentle: "“Learning is an arc, not a single exam. Resting tonight protects the mind that grows tomorrow.”",
  },
  de: {
    stuck: "„Wenn ich diese Woche nicht alles perfekt schaffe, falle ich zurück.“",
    gentle: "„Lernen ist ein Weg, keine einzelne Prüfung. Ruhe heute schützt den Geist, der morgen wächst.“",
  },
  fr: {
    stuck: "« Si je ne réussis pas tout parfaitement cette semaine, je prends du retard. »",
    gentle: "« Apprendre est un chemin, pas un seul examen. Se reposer ce soir protège l’esprit de demain. »",
  },
  it: {
    stuck: "“Se non supero tutto alla perfezione questa settimana, resterò indietro.”",
    gentle: "“Imparare è un percorso, non un singolo esame. Riposare stasera protegge la mente di domani.”",
  },
  es: {
    stuck: "“Si no domino cada módulo esta semana, me estoy quedando atrás.”",
    gentle: "“Aprender es un camino, no un solo examen. Descansar hoy protege la mente que crece mañana.”",
  },
  zh: {
    stuck: "“如果这周不能把每门课都做到完美，我就要落后了。”",
    gentle: "“成长是一段长路，而非一次考试。今晚的安歇，正在守护明天的清醒。”",
  },
};

const WEEKLY_BARS = [
  { day: "M", calm: 64 },
  { day: "T", calm: 72 },
  { day: "W", calm: 52 },
  { day: "T", calm: 82 },
  { day: "F", calm: 88 },
  { day: "S", calm: 92 },
  { day: "S", calm: 86 },
];

// Reusable 3D Mood Mirror Emblem — matched to dashboard mineral/brass/iris tokens
const MoodMirrorEmblem3D = ({ size = "lg", variant = "dark" }) => {
  const dims =
    size === "sm"
      ? "w-10 h-10"
      : size === "md"
      ? "w-20 h-20"
      : "w-32 h-32 md:w-40 md:h-40";

  const ringGradient =
    variant === "daylight"
      ? "conic-gradient(from 45deg, #9A6B3E, #3B7A9E, #4B7A63, #6D5ACF, #9A6B3E)"
      : variant === "romantic"
      ? "conic-gradient(from 45deg, #C93B6B, #E86F88, #C9823B, #C25975, #C93B6B)"
      : "conic-gradient(from 45deg, #D4A373, #C68B69, #A594F9, #7E9F8E, #D4A373)";

  return (
    <div
      className={`relative ${dims} flex items-center justify-center select-none`}
      style={{ transformStyle: "preserve-3d" }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-55 animate-pulse"
        style={{ background: ringGradient }}
      />
      <div
        className="absolute inset-0 rounded-full p-[1.5px]"
        style={{
          background: ringGradient,
          boxShadow: "0 0 36px rgba(212, 163, 115, 0.28), inset 0 0 20px rgba(244, 239, 230, 0.16)",
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              variant === "daylight"
                ? "radial-gradient(circle at 38% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(241, 235, 224, 0.96) 75%, rgba(229, 220, 205, 0.98) 100%)"
                : variant === "romantic"
                ? "radial-gradient(circle at 38% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(252, 226, 235, 0.96) 75%, rgba(247, 208, 222, 0.98) 100%)"
                : "radial-gradient(circle at 38% 30%, rgba(36, 40, 54, 0.88) 0%, rgba(16, 18, 26, 0.96) 72%, rgba(10, 11, 14, 0.99) 100%)",
          }}
        />
      </div>
      <div
        className="absolute inset-[14%] rounded-full border"
        style={{
          borderColor:
            variant === "daylight"
              ? "rgba(154, 107, 62, 0.42)"
              : variant === "romantic"
              ? "rgba(201, 59, 107, 0.42)"
              : "rgba(212, 163, 115, 0.42)",
          transform: "rotateX(58deg) rotateY(-18deg)",
        }}
      />
      <div
        className="absolute inset-[22%] rounded-full border"
        style={{
          borderColor:
            variant === "daylight"
              ? "rgba(59, 122, 158, 0.38)"
              : variant === "romantic"
              ? "rgba(232, 111, 136, 0.48)"
              : "rgba(165, 148, 249, 0.38)",
          transform: "rotateX(-52deg) rotateY(24deg)",
        }}
      />
      <div
        className="relative w-[42%] h-[42%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #D4A373 0%, #E07A5F 62%, #A594F9 100%)",
          boxShadow:
            "0 8px 24px rgba(212, 163, 115, 0.38), inset 0 2px 6px rgba(255, 255, 255, 0.75)",
        }}
      />
    </div>
  );
};

// Reusable ScaDS.AI + TU Dresden Partner Logos Badge
const InstitutionalLogosBadge = ({ size = "md", testId = "institutional-logos-badge" }) => {
  const imgHeight = size === "sm" ? "h-4" : size === "lg" ? "h-6" : "h-5";
  const padClass = size === "sm" ? "px-3 py-1.5 gap-2.5" : size === "lg" ? "px-4 py-2.5 gap-4" : "px-3.5 py-2 gap-3";

  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center rounded-full border ${padClass}`}
      style={{
        background: "linear-gradient(180deg, rgba(251, 248, 241, 0.96) 0%, rgba(242, 236, 224, 0.94) 100%)",
        borderColor: "rgba(212, 163, 115, 0.45)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
      }}
    >
      <img
        src="/logo.png"
        alt="ScaDS.AI Dresden/Leipzig"
        title="ScaDS.AI — Center for Scalable Data Analytics and Artificial Intelligence"
        className={`${imgHeight} w-auto object-contain shrink-0`}
        style={{ maxWidth: size === "sm" ? "76px" : "96px" }}
      />
      <span
        className="w-px h-4 shrink-0"
        style={{ background: "rgba(28, 25, 23, 0.2)" }}
        aria-hidden="true"
      />
      <img
        src="/TU_Dresden.png"
        alt="TU Dresden"
        title="TU Dresden — Dresden University of Technology"
        className={`${imgHeight} w-auto object-contain shrink-0`}
        style={{ maxWidth: size === "sm" ? "82px" : "104px" }}
      />
    </div>
  );
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const { theme = "dark", setTheme } = useTheme();
  const [language, setLanguage] = useState(getLanguage);
  const [activeSpecimenIdx, setActiveSpecimenIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const darkSectionRef = useRef(null);
  const daylightSectionRef = useRef(null);
  const romanticSectionRef = useRef(null);

  const { t } = useTranslation(language);
  const rc = REALM_COPY[language] || REALM_COPY.en;

  const changeLanguage = useCallback((lang) => {
    setLanguage(setStoredLanguage(lang));
  }, []);

  useEffect(() => {
    document.documentElement.lang = speechLocale(language);
  }, [language]);

  useEffect(() => {
    const updateScroll = () => {
      const docEl = document.documentElement;
      const maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight);
      const current = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      setScrollProgress(current);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const handlePointerMove = useCallback((e) => {
    const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    setPointer({ x: nx, y: ny });
  }, []);

  const currentRealm =
    scrollProgress < 0.25
      ? "dark"
      : scrollProgress < 0.61
      ? "light"
      : scrollProgress < 0.88
      ? "romantic"
      : "harmony";

  const isDaylightOrRomanticZone = scrollProgress >= 0.27 && scrollProgress <= 0.87;

  const handleSelectThemeRealm = useCallback(
    (modeId) => {
      setTheme(modeId);
      const targetEl =
        modeId === "dark"
          ? darkSectionRef.current
          : modeId === "light"
          ? daylightSectionRef.current
          : romanticSectionRef.current;
      if (targetEl && typeof targetEl.scrollIntoView === "function") {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [setTheme]
  );

  const specimens = SPECIMENS_BY_LANG[language] || SPECIMENS_BY_LANG.en;
  const activeSpecimen = specimens[activeSpecimenIdx] || specimens[0];
  const reframeSample = REFRAME_BY_LANG[language] || REFRAME_BY_LANG.en;

  const THEME_MODES = [
    { id: "dark", label: rc.themeDark, icon: Moon },
    { id: "light", label: rc.themeDaylight, icon: Sun },
    { id: "romantic", label: rc.themeRomantic, icon: Sparkles },
  ];

  const MODES = [
    {
      id: "text",
      icon: Pen,
      title: t("landWriteTitle"),
      cta: t("landTryWrite"),
      accent: "#D4A373",
    },
    {
      id: "draw",
      icon: Brush,
      title: t("landDrawTitle"),
      cta: t("landTryDraw"),
      accent: "#E07A5F",
    },
    {
      id: "speech",
      icon: Mic,
      title: t("landSpeakTitle"),
      cta: t("landTrySpeak"),
      accent: "#7E9F8E",
    },
    {
      id: "talk",
      icon: MessageSquare,
      title: t("landTalkTitle"),
      cta: t("landTryTalk"),
      accent: "#6BA3BE",
    },
  ];

  const darkGlassSurface = {
    background: "linear-gradient(165deg, rgba(22, 25, 34, 0.88) 0%, rgba(14, 16, 22, 0.94) 100%)",
    borderColor: "rgba(244, 239, 230, 0.09)",
    boxShadow: "0 18px 44px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  };

  return (
    <div
      data-testid="landing-page"
      onMouseMove={handlePointerMove}
      className="mm-3d-viewport relative min-h-screen overflow-x-hidden select-none"
      style={{
        background: "#0A0B0E",
        color: isDaylightOrRomanticZone ? "#1C1917" : "#F4EFE6",
        transition: "color 0.45s ease",
      }}
    >
      {/* Decorative Scroll Progress Bar */}
      <div id="mm-scroll-progress" aria-hidden="true" />

      {/* Continuous Full-Viewport 3D Camera Dolly Stage */}
      <Landing3DStage scrollProgress={scrollProgress} pointer={pointer} />

      {/* ========================================================================= */}
      {/* STICKY TRANSPARENT NAVIGATION BAR                                         */}
      {/* ========================================================================= */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500"
        style={{
          background: isDaylightOrRomanticZone
            ? "rgba(250, 248, 243, 0.84)"
            : "rgba(11, 13, 18, 0.88)",
          borderColor: isDaylightOrRomanticZone
            ? "rgba(28, 25, 23, 0.09)"
            : "rgba(244, 239, 230, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <a
              href="#home"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <MoodMirrorEmblem3D
                size="sm"
                variant={
                  currentRealm === "light"
                    ? "daylight"
                    : currentRealm === "romantic"
                    ? "romantic"
                    : "dark"
                }
              />
              <div>
                <span
                  className="font-display text-base md:text-lg font-medium tracking-tight block leading-none"
                  style={{
                    color: isDaylightOrRomanticZone ? "#1C1917" : "#F4EFE6",
                  }}
                >
                  MOOD MIRROR
                </span>
                <span
                  className="text-[10px] font-mono uppercase tracking-[0.16em] block mt-1"
                  style={{
                    color: isDaylightOrRomanticZone ? "#78716C" : "#7E7970",
                  }}
                >
                  {rc.tagline}
                </span>
              </div>
            </a>

            <div className="hidden xl:flex items-center pl-2">
              <InstitutionalLogosBadge size="sm" testId="landing-top-nav-logos" />
            </div>
          </div>

          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-[0.15em]"
          >
            {[
              { href: "#home", label: rc.navHome },
              { href: "#features", label: rc.navFeatures },
              { href: "#how-it-works", label: rc.navHow },
              { href: "#about", label: rc.navAbout },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-opacity hover:opacity-100 opacity-80"
                style={{
                  color: isDaylightOrRomanticZone ? "#4B463F" : "#B8B2A6",
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <div
              role="group"
              aria-label="Visual Theme Selector"
              className="hidden sm:flex items-center p-0.5 rounded-full border backdrop-blur-md"
              style={{
                background: isDaylightOrRomanticZone
                  ? "rgba(255, 255, 255, 0.78)"
                  : "rgba(244, 239, 230, 0.045)",
                borderColor: isDaylightOrRomanticZone
                  ? "rgba(28, 25, 23, 0.13)"
                  : "rgba(244, 239, 230, 0.11)",
              }}
            >
              {THEME_MODES.map((m) => {
                const Icon = m.icon;
                const active =
                  theme === m.id ||
                  (currentRealm === m.id && scrollProgress > 0.05);
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-testid={`landing-theme-${m.id}`}
                    onClick={() => handleSelectThemeRealm(m.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                    style={{
                      background: active
                        ? m.id === "light"
                          ? "rgba(180, 128, 78, 0.18)"
                          : m.id === "romantic"
                          ? "rgba(212, 72, 118, 0.18)"
                          : "rgba(212, 163, 115, 0.18)"
                        : "transparent",
                      color: active
                        ? m.id === "light"
                          ? "#1C1917"
                          : m.id === "romantic"
                          ? "#3D1828"
                          : "#F4EFE6"
                        : isDaylightOrRomanticZone
                        ? "#78716C"
                        : "#B8B2A6",
                      border: active
                        ? "1px solid rgba(212, 163, 115, 0.34)"
                        : "1px solid transparent",
                    }}
                  >
                    <Icon size={12} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <LanguageSwitcher language={language} onChange={changeLanguage} />

            <button
              type="button"
              data-testid="landing-nav-enter-btn"
              onClick={() => navigate("/app")}
              className="btn-mirror-me flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide"
            >
              <span>{rc.startReflecting}</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VISUAL THEME 1 — DARK MODE (MINIMAL, CURIOSITY-SPARKING HERO)             */}
      {/* ========================================================================= */}
      <section
        id="home"
        ref={darkSectionRef}
        data-testid="realm-dark-section"
        className="mm-3d-section relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20 md:pt-16 md:pb-28"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <div
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border backdrop-blur-md"
            style={{
              background: "rgba(244, 239, 230, 0.045)",
              borderColor: "rgba(212, 163, 115, 0.32)",
              color: "#D4A373",
            }}
          >
            <span className="w-2 h-2 rounded-full animate-ping" style={{ background: "#D4A373" }} />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em]">
              {rc.darkBadge}
            </span>
          </div>

          <InstitutionalLogosBadge size="sm" testId="landing-hero-top-logos" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Clean Headline & Direct Entry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-4">
              <MoodMirrorEmblem3D size="md" variant="dark" />
              <span
                className="text-xs font-mono uppercase tracking-[0.18em]"
                style={{ color: "#D4A373" }}
              >
                {rc.tagline}
              </span>
            </div>

            <h1
              data-testid="landing-hero-heading"
              className="font-display text-4xl sm:text-6xl lg:text-[4.1rem] font-normal tracking-tight leading-[1.06]"
              style={{ color: "#F4EFE6" }}
            >
              {rc.darkHeadline1}{" "}
              <span
                className="italic font-normal block mt-1"
                style={{
                  background:
                    "linear-gradient(135deg, #D4A373 0%, #E07A5F 50%, #A594F9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {rc.darkHeadline2}
              </span>
            </h1>

            <p
              className="text-base sm:text-lg max-w-xl leading-relaxed font-light"
              style={{ color: "#B8B2A6" }}
            >
              {rc.darkSub}{" "}
              <span className="italic" style={{ color: "#D4A373" }}>
                {t("landHeroBefore")} {t("landHeroAccent")}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                data-testid="landing-hero-enter-btn"
                onClick={() => navigate("/app")}
                className="btn-mirror-me flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold"
              >
                <span>{rc.startReflecting}</span>
                <ArrowRight size={16} />
              </button>

              <span className="text-xs font-mono" style={{ color: "#7E7970" }}>
                {rc.curiosityNote}
              </span>
            </div>
          </motion.div>

          {/* Right: Minimal Teaser Whisper Card (Sparks Curiosity Without Clutter) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div
              className="mm-3d-float-card rounded-3xl p-6 border backdrop-blur-2xl space-y-5"
              style={darkGlassSurface}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "#D4A373" }}>
                  {rc.whisperLabel}
                </span>
                <div className="flex items-center gap-1.5">
                  {specimens.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`specimen-tab-${item.id}`}
                      onClick={() => setActiveSpecimenIdx(idx)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                      style={{
                        background:
                          idx === activeSpecimenIdx
                            ? "rgba(212, 163, 115, 0.18)"
                            : "rgba(244, 239, 230, 0.04)",
                        color: idx === activeSpecimenIdx ? "#F4EFE6" : "#7E7970",
                        border:
                          idx === activeSpecimenIdx
                            ? "1px solid rgba(212, 163, 115, 0.42)"
                            : "1px solid transparent",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${language}-${activeSpecimen.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "linear-gradient(180deg, #FBF8F1 0%, #F2ECE0 100%)",
                    color: "#1B1916",
                  }}
                >
                  <p
                    data-testid="landing-specimen-poem"
                    className="font-display italic text-base leading-relaxed whitespace-pre-line"
                  >
                    “{activeSpecimen.excerpt}”
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs" style={{ color: "#B8B2A6" }}>
                  {rc.whisperHint}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/app")}
                  className="inline-flex items-center gap-1 text-xs font-mono font-semibold shrink-0"
                  style={{ color: "#D4A373" }}
                >
                  <span>{rc.tryYourOwn}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Compact 4-Modality Strip */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                data-testid={`modality-card-${m.id}`}
                onClick={() => navigate(`/app?mode=${m.id}`)}
                className="mm-3d-float-card text-left rounded-2xl p-4 border transition-all group flex items-center justify-between gap-3"
                style={darkGlassSurface}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${m.accent}1A`,
                      border: `1px solid ${m.accent}44`,
                      color: m.accent,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-normal" style={{ color: "#F4EFE6" }}>
                      {m.title}
                    </h3>
                    <span className="text-[11px] font-mono" style={{ color: m.accent }}>
                      {m.cta}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={14} style={{ color: m.accent }} />
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRANSITION 1 — CIRCULAR GLASS PORTAL (DARK TO DAYLIGHT)                   */}
      {/* ========================================================================= */}
      <div
        aria-hidden="true"
        className="relative z-10 max-w-3xl mx-auto px-6 py-10 text-center"
      >
        <div
          className="mx-auto w-28 h-28 rounded-full flex items-center justify-center border backdrop-blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(165, 148, 249, 0.14) 58%, transparent 100%)",
            borderColor: "rgba(212, 163, 115, 0.42)",
          }}
        >
          <Sun size={22} style={{ color: "#D4A373" }} />
        </div>
        <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] opacity-75">
          {rc.portal1Label}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL THEME 2 — DAYLIGHT MODE (CLEAN, AIRY PATTERN PREVIEW)              */}
      {/* ========================================================================= */}
      <section
        id="features"
        ref={daylightSectionRef}
        data-testid="realm-daylight-section"
        className="mm-3d-section relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28"
      >
        <div
          className="rounded-[36px] p-8 sm:p-12 border backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(165deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 242, 235, 0.90) 100%)",
            borderColor: "rgba(154, 107, 62, 0.22)",
            boxShadow: "0 28px 70px rgba(28, 25, 23, 0.08)",
            color: "#1C1917",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-[0.18em]"
                style={{
                  background: "rgba(154, 107, 62, 0.1)",
                  borderColor: "rgba(154, 107, 62, 0.28)",
                  color: "#9A6B3E",
                }}
              >
                <Sun size={13} />
                <span>{rc.daylightBadge}</span>
              </div>

              <h2
                data-testid="daylight-hero-heading"
                className="font-display text-3xl sm:text-5xl font-normal tracking-tight leading-[1.08]"
              >
                {rc.daylightHeadline1}{" "}
                <span
                  className="italic block mt-1"
                  style={{
                    background: "linear-gradient(135deg, #9A6B3E 0%, #3B7A9E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {rc.daylightHeadline2}
                </span>
              </h2>

              <p className="text-base leading-relaxed font-light" style={{ color: "#57534E" }}>
                {rc.daylightSub}
              </p>

              {/* 4 Clean Feature Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {rc.pillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      borderColor: "rgba(28, 25, 23, 0.1)",
                      color: "#1C1917",
                    }}
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>

            {/* Minimal 3D 7-Day Pulse Preview */}
            <div className="lg:col-span-6">
              <div
                className="rounded-3xl p-6 border"
                style={{
                  background: "rgba(255, 255, 255, 0.94)",
                  borderColor: "rgba(28, 25, 23, 0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.15em]" style={{ color: "#9A6B3E" }}>
                    {rc.pulseTitle}
                  </span>
                  <Activity size={15} style={{ color: "#3B7A9E" }} />
                </div>

                <div className="grid grid-cols-7 gap-3 items-end h-36 px-2">
                  {WEEKLY_BARS.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${d.calm}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: i * 0.05 }}
                        className="w-full max-w-[26px] rounded-t-xl"
                        style={{
                          background: "linear-gradient(180deg, #3B7A9E 0%, #9A6B3E 100%)",
                        }}
                      />
                      <span className="text-[10px] font-mono" style={{ color: "#78716C" }}>
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(28, 25, 23, 0.08)" }}>
                  <span className="text-xs" style={{ color: "#57534E" }}>
                    {rc.pulseUnlock}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/app")}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold"
                    style={{ color: "#9A6B3E" }}
                  >
                    <span>{rc.startReflecting}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRANSITION 2 — TRANSLUCENT GLASS ARCH (DAYLIGHT TO ROMANTIC)              */}
      {/* ========================================================================= */}
      <div
        aria-hidden="true"
        className="relative z-10 max-w-3xl mx-auto px-6 py-10 text-center"
      >
        <div
          className="mx-auto w-28 h-32 rounded-t-full flex items-center justify-center border backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(232, 111, 136, 0.22) 0%, rgba(201, 59, 107, 0.12) 100%)",
            borderColor: "rgba(201, 59, 107, 0.36)",
          }}
        >
          <Sparkles size={20} style={{ color: "#C93B6B" }} />
        </div>
        <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] opacity-75">
          {rc.portal2Label}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL THEME 3 — ROMANTIC MODE (WARM SELF-COMPASSION PREVIEW)             */}
      {/* ========================================================================= */}
      <section
        id="how-it-works"
        ref={romanticSectionRef}
        data-testid="realm-romantic-section"
        className="mm-3d-section relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28"
      >
        <div
          className="rounded-[36px] p-8 sm:p-12 border backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(165deg, rgba(255, 250, 252, 0.94) 0%, rgba(252, 232, 240, 0.90) 100%)",
            borderColor: "rgba(201, 59, 107, 0.24)",
            boxShadow: "0 28px 70px rgba(90, 20, 45, 0.10)",
            color: "#3D1828",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-[0.18em]"
                style={{
                  background: "rgba(201, 59, 107, 0.1)",
                  borderColor: "rgba(201, 59, 107, 0.28)",
                  color: "#C93B6B",
                }}
              >
                <Sparkles size={13} />
                <span>{rc.romanticBadge}</span>
              </div>

              <h2
                data-testid="romantic-hero-heading"
                className="font-display text-3xl sm:text-5xl font-normal tracking-tight leading-[1.08]"
              >
                {rc.romanticHeadline1}{" "}
                <span
                  className="italic block mt-1"
                  style={{
                    background: "linear-gradient(135deg, #C93B6B 0%, #C9823B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {rc.romanticHeadline2}
                </span>
              </h2>

              <p className="text-base leading-relaxed font-light" style={{ color: "#7A4258" }}>
                {rc.romanticSub}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {rc.reframePills.map((pill) => (
                  <span
                    key={pill}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      borderColor: "rgba(201, 59, 107, 0.18)",
                      color: "#3D1828",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Minimal Perspective Shift Card */}
            <div className="lg:col-span-6">
              <div
                className="rounded-3xl p-6 border space-y-4"
                style={{
                  background: "rgba(255, 255, 255, 0.94)",
                  borderColor: "rgba(201, 59, 107, 0.18)",
                }}
              >
                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    background: "rgba(253, 245, 247, 0.9)",
                    borderColor: "rgba(201, 59, 107, 0.14)",
                  }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] block mb-1" style={{ color: "#A36A80" }}>
                    {rc.stuckLabel}
                  </span>
                  <p className="font-display italic text-sm" style={{ color: "#7A4258" }}>
                    {reframeSample.stuck}
                  </p>
                </div>

                <div
                  className="p-4 rounded-2xl border"
                  style={{
                    background: "linear-gradient(135deg, rgba(201, 59, 107, 0.08) 0%, rgba(201, 130, 59, 0.1) 100%)",
                    borderColor: "rgba(201, 59, 107, 0.24)",
                  }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] block mb-1" style={{ color: "#C93B6B" }}>
                    {rc.shiftLabel}
                  </span>
                  <p className="font-display text-base leading-relaxed" style={{ color: "#3D1828" }}>
                    {reframeSample.gentle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono" style={{ color: "#7A4258" }}>
                    <Wind size={13} style={{ color: "#C93B6B" }} />
                    {rc.breatheLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/app")}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold"
                    style={{ color: "#C93B6B" }}
                  >
                    <span>{rc.startReflecting}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL SECTION — BRAND REVEAL & FOOTER                                     */}
      {/* ========================================================================= */}
      <section
        id="about"
        data-testid="final-brand-reveal"
        className="mm-3d-section relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="rounded-[36px] p-10 md:p-14 border backdrop-blur-2xl relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(16, 18, 26, 0.94) 0%, rgba(28, 25, 36, 0.92) 52%, rgba(44, 24, 36, 0.92) 100%)",
            borderColor: "rgba(212, 163, 115, 0.34)",
            boxShadow: "0 36px 90px rgba(0, 0, 0, 0.55)",
          }}
        >
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <MoodMirrorEmblem3D size="lg" variant="dark" />

            <span
              className="text-[10px] font-mono uppercase tracking-[0.22em] px-3.5 py-1 rounded-full border"
              style={{
                background: "rgba(244, 239, 230, 0.05)",
                borderColor: "rgba(212, 163, 115, 0.32)",
                color: "#D4A373",
              }}
            >
              {rc.revealBadge}
            </span>

            <h2
              className="font-display text-4xl sm:text-6xl font-normal tracking-tight"
              style={{ color: "#F4EFE6" }}
            >
              MOOD MIRROR
            </h2>

            <p
              className="font-mono text-xs sm:text-sm uppercase tracking-[0.28em]"
              style={{ color: "#D4A373" }}
            >
              {rc.tagline}
            </p>

            <button
              type="button"
              data-testid="landing-bottom-enter-btn"
              onClick={() => navigate("/app")}
              className="btn-mirror-me inline-flex items-center gap-3 px-9 py-4 rounded-full text-sm font-semibold"
            >
              <span>{rc.startJourney}</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2">
              <InstitutionalLogosBadge size="md" testId="landing-about-logos" />
            </div>
          </div>
        </motion.div>
      </section>

      <footer
        className="relative z-10 border-t py-10 px-6"
        style={{
          borderColor: "rgba(244, 239, 230, 0.08)",
          background: "rgba(10, 11, 14, 0.94)",
          color: "#B8B2A6",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <MoodMirrorEmblem3D size="sm" variant="dark" />
            <div>
              <span className="font-display text-base font-medium block" style={{ color: "#F4EFE6" }}>
                MOOD MIRROR
              </span>
              <span className="text-[11px] font-mono uppercase tracking-[0.16em]" style={{ color: "#7E7970" }}>
                {rc.tagline}
              </span>
            </div>
          </div>

          <InstitutionalLogosBadge size="md" testId="landing-footer-logos" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
