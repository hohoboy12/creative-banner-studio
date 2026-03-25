/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { 
  Wand2, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Mail, 
  Settings, 
  ArrowRight, 
  ChevronLeft, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  MousePointer2, 
  Download, 
  Crop, 
  Type, 
  ImagePlus, 
  Grid,
  Check,
  RefreshCw,
  Layout,
  Slack,
  Plus,
  X,
  AlignLeft,
  AlignCenter,
  Bell,
  Globe,
  ChevronDown,
  Info,
  ShieldCheck,
  MonitorSmartphone,
  Users,
  HelpCircle,
  Folder,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { GoogleGenAI, Type as GeminiType } from "@google/genai";

// --- Constants & Types ---

const LINE_GREEN = '#06C755';
const GOOGLE_BLUE = '#1a73e8';
const GOOGLE_RED = '#ea4335';
const GOOGLE_YELLOW = '#fbbc04';
const GOOGLE_GREEN = '#34a853';

interface BannerCopy {
  tone: string;
  headline: string;
  sub: string;
  cta: string;
  align?: 'left' | 'center';
  label?: string;
  date?: string;
}

interface DesignVariation {
  id: number;
  title: string;
  desc: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  accentColor: string;
  colors: {
    bg: string;
    text: string;
    accent: string;
    secondary: string;
  };
  bgStyle?: React.CSSProperties;
  border?: boolean;
  isCompliance?: boolean;
  bgImage?: string;
}

const INITIAL_VARIATIONS: DesignVariation[] = [
  { 
    id: 1, 
    title: 'Type A', 
    desc: 'Official Template', 
    bgClass: 'bg-white', 
    textClass: 'text-[#000000]', 
    accentClass: 'text-[#000000]', 
    accentColor: '#000000', 
    colors: { bg: '#ffffff', text: '#000000', accent: '#000000', secondary: '#f8f9fa' }, 
    border: true,
    isCompliance: true,
    bgImage: '/BG_Test_1(ACD).png'
  },
  { 
    id: 2, 
    title: 'Type B', 
    desc: 'Left Image Style', 
    bgClass: 'bg-white', 
    textClass: 'text-[#000000]', 
    accentClass: 'text-[#000000]', 
    accentColor: '#000000', 
    colors: { bg: '#ffffff', text: '#000000', accent: '#000000', secondary: '#f8f9fa' }, 
    border: true,
    isCompliance: true,
    bgImage: '/BG_Test_2(B).png'
  },
  { 
    id: 3, 
    title: 'Type C', 
    desc: 'Bottom Right Sub', 
    bgClass: 'bg-white', 
    textClass: 'text-[#000000]', 
    accentClass: 'text-[#000000]', 
    accentColor: '#000000', 
    colors: { bg: '#ffffff', text: '#000000', accent: '#000000', secondary: '#f8f9fa' }, 
    border: true,
    isCompliance: true,
    bgImage: '/BG_Test_2(ACD).png'
  },
  { 
    id: 4, 
    title: 'Type C-2', 
    desc: 'Center Headline', 
    bgClass: 'bg-white', 
    textClass: 'text-[#000000]', 
    accentClass: 'text-[#000000]', 
    accentColor: '#000000', 
    colors: { bg: '#ffffff', text: '#000000', accent: '#000000', secondary: '#f8f9fa' }, 
    border: true,
    isCompliance: true,
    bgImage: '/BG_Test_2(ACD).png'
  },
  { 
    id: 5, 
    title: 'Type D', 
    desc: 'Bottom Image', 
    bgClass: 'bg-white', 
    textClass: 'text-[#000000]', 
    accentClass: 'text-[#000000]', 
    accentColor: '#000000', 
    colors: { bg: '#ffffff', text: '#000000', accent: '#000000', secondary: '#f8f9fa' }, 
    border: true,
    isCompliance: true,
    bgImage: '/BG_Test_2(B).png'
  },
];

const AddStyleModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (v: Omit<DesignVariation, 'id'>) => void }) => {
  const [title, setTitle] = useState('');
  const [bg, setBg] = useState('#ffffff');
  const [text, setText] = useState('#000000');
  const [accent, setAccent] = useState('#06C755');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      desc: 'Custom Style',
      bgClass: '', 
      textClass: '',
      accentClass: '',
      accentColor: accent,
      colors: {
        bg,
        text,
        accent,
        secondary: bg === '#ffffff' ? '#f8f9fa' : bg + '11'
      },
      border: true
    });
    onClose();
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add New Style</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Style Name</label>
            <input 
              required
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/10"
              placeholder="e.g. Summer Vibe"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Background</label>
              <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Text</label>
              <input type="color" value={text} onChange={e => setText(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accent</label>
              <input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer" />
            </div>
          </div>
          <Button type="submit" className="w-full py-4 rounded-2xl bg-black text-white">Create Style</Button>
        </form>
      </motion.div>
    </div>
  );
};

// --- AI Service ---

async function generateAICopy(prompt: string, language: 'ko' | 'ja'): Promise<BannerCopy[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const langInstruction = language === 'ja' 
    ? "Generate all copy in Japanese. Headline max 15 chars, Sub-copy max 25 chars, CTA max 6 chars."
    : "Generate all copy in Korean. Headline max 20 chars, Sub-copy max 30 chars, CTA max 8 chars.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `User's banner topic: "${prompt}"

Please create 3 different tones of banner copy in JSON array format (output ONLY JSON).
${langInstruction}

[
  {"tone":"Professional","headline":"Headline","sub":"Sub-copy","cta":"Button Text"},
  {"tone":"Friendly","headline":"...","sub":"...","cta":"..."},
  {"tone":"Bold","headline":"...","sub":"...","cta":"..."}
]`,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
}

const ResponsiveBanner = ({ children, baseScale = 1 }: { children: React.ReactNode, baseScale?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setScale(width / 740);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full aspect-[740/216] relative" ref={containerRef}>
      <div className="w-[740px] h-[216px] origin-top-left" style={{ transform: `scale(${scale * baseScale})` }}>
        {children}
      </div>
    </div>
  );
};

// --- Components ---

const BannerCanvas = ({ 
  variation, 
  headline, 
  sub, 
  ctaText, 
  scale = 1,
  className = "",
  tilt = false,
  align = 'left',
  bgImage,
  label,
  date,
  overrideStyle,
  language = 'ko'
}: { 
  variation: DesignVariation, 
  headline: string, 
  sub: string, 
  ctaText?: string,
  scale?: number,
  className?: string,
  tilt?: boolean,
  align?: 'left' | 'center';
  bgImage?: string | null;
  label?: string;
  date?: string;
  overrideStyle?: { bg: string, text: string, accent: string, secondary?: string };
  language?: 'ko' | 'ja';
}) => {
  const style = overrideStyle 
    ? { ...overrideStyle, secondary: overrideStyle.secondary || (overrideStyle.bg === '#ffffff' ? '#f8f9fa' : overrideStyle.bg + '11') } 
    : variation.colors;
  const currentBgImage = bgImage !== undefined ? bgImage : variation.bgImage;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isCompliance = variation.isCompliance;
  const fontClass = language === 'ja' ? 'font-ja' : '';

  const renderMixedText = (text: string, baseSize: number) => {
    if (!text) return null;
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    if (hasJapanese && hasEnglish) {
      const parts = text.split(/([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g);
      return (
        <>
          {parts.map((part, i) => {
            if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(part)) {
              return (
                <span key={i} style={{ fontSize: `${(baseSize - 1) * (scale || 1)}px` }}>
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </>
      );
    }
    return text;
  };

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        width: `${740 * scale}px`, 
        height: `${216 * scale}px`, 
        backgroundColor: style.bg,
        border: variation.border ? '1px solid rgba(0,0,0,0.05)' : 'none',
        borderRadius: isCompliance ? `${12 * scale}px` : `${24 * scale}px`,
        padding: isCompliance ? '0' : `${40 * scale}px ${60 * scale}px`,
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: "preserve-3d",
        display: isCompliance ? 'block' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align
      }}
      className={`relative overflow-hidden transition-all duration-700 ease-out ${className} ${fontClass}`}
    >
      {/* Background Image */}
      {currentBgImage && (
        <img 
          src={currentBgImage}
          alt="Background"
          className="absolute z-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            inset: 0,
            objectFit: 'cover',
            objectPosition: (variation.title === 'Type D' || variation.title === 'Type B') ? 'right center' : 'center'
          }}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Noise Texture Overlay */}
      {!isCompliance && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      )}

      {isCompliance ? (
        variation.title === 'Type C' ? (
          <>
            {/* Top Left Group */}
            <div 
              style={{ 
                position: 'absolute', 
                left: `${33 * scale}px`, 
                top: `${30 * scale}px`, 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <span 
                style={{ 
                  fontWeight: 800, 
                  fontSize: `${14 * scale}px`, 
                  lineHeight: `${19 * scale}px`, 
                  letterSpacing: '-0.02em', 
                  color: '#000000', 
                  fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: `${250 * scale}px`,
                  display: 'inline-block'
                }}
              >
                {renderMixedText(label || (language === 'ja' ? 'コンプライアンス' : 'Compliance'), 14)}
              </span>
              <div 
                style={{ 
                  width: '1px', 
                  height: `${12 * scale}px`, 
                  backgroundColor: '#000000', 
                  opacity: 0.3, 
                  marginLeft: `${10 * scale}px`, 
                  marginRight: `${10 * scale}px` 
                }} 
              />
              <span 
                style={{ 
                  fontWeight: 400, 
                  fontSize: `${14 * scale}px`, 
                  lineHeight: `${19 * scale}px`, 
                  color: '#000000', 
                  fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: `${250 * scale}px`,
                  display: 'inline-block'
                }}
              >
                {renderMixedText(date || '2026.3.01 – 3.08', 14)}
              </span>
            </div>

            {/* Headline */}
            <h2 
              style={{
                position: 'absolute',
                left: `${33 * scale}px`,
                top: `${100 * scale}px`,
                width: `${343 * scale}px`,
                fontWeight: 700,
                fontSize: `${31 * scale}px`,
                lineHeight: `${45 * scale}px`,
                letterSpacing: '-0.03em',
                color: '#000000',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(headline || (language === 'ja' ? 'FY2026 上半기\nコンプライアンス必須教育のご案内' : 'FY2026 상반기\n컴플라이언스 필수교육 안내'), 31)}
            </h2>

            {/* Sub-copy */}
            <p 
              style={{
                position: 'absolute',
                left: `${480 * scale}px`,
                top: `${165 * scale}px`,
                width: `${228 * scale}px`,
                fontWeight: 400,
                fontSize: `${16 * scale}px`,
                lineHeight: `${21 * scale}px`,
                textAlign: 'right',
                color: '#000000',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(sub || (language === 'ja' ? 'LINE+ 全従業員受講必須' : 'LINE+ 모든 임직원 수강필요'), 16)}
            </p>
          </>
        ) : variation.title === 'Type B' ? (
          <>
            {/* Label */}
            <div 
              style={{ 
                position: 'absolute', 
                left: `${33 * scale}px`, 
                top: `${30 * scale}px`, 
                fontWeight: 800, 
                fontSize: `${14 * scale}px`, 
                color: '#000000',
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: `${250 * scale}px`
              }}
            >
              {renderMixedText(label || (language === 'ja' ? 'コンプライアンス' : 'Compliance'), 14)}
            </div>
            {/* Headline */}
            <h2 
              style={{
                position: 'absolute',
                left: `${33 * scale}px`,
                top: `${65 * scale}px`,
                width: `${343 * scale}px`,
                fontWeight: 700,
                fontSize: `${31 * scale}px`,
                lineHeight: `${45 * scale}px`,
                letterSpacing: '-0.03em',
                color: '#000000',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(headline || (language === 'ja' ? 'FY2026 上半期\nコンプライアンス必須教育のご案内' : 'FY2026 상반기\n컴플라이언스 필수교육 안내'), 31)}
            </h2>
            {/* Sub-copy */}
            <p 
              style={{
                position: 'absolute',
                left: `${33 * scale}px`,
                top: `${165 * scale}px`,
                width: `${674 * scale}px`,
                fontWeight: 400,
                fontSize: `${16 * scale}px`,
                lineHeight: `${21 * scale}px`,
                color: '#000000',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(sub || (language === 'ja' ? 'LINE+ 全従業員受講必須' : 'LINE+ 모든 임직원 수강필요'), 16)}
            </p>
          </>
        ) : variation.title === 'Type C-2' ? (
          <div 
            style={{ 
              position: 'absolute', 
              left: '0', 
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: `0 ${30 * scale}px`
            }}
          >
            {/* Label */}
            <div 
              style={{ 
                fontWeight: 800, 
                fontSize: `${14 * scale}px`, 
                color: '#000000',
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                marginBottom: `${10 * scale}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                width: '100%'
              }}
            >
              {renderMixedText(label || (language === 'ja' ? 'コンプライアンス' : 'Compliance'), 14)}
            </div>
            {/* Headline */}
            <h2 
              style={{ 
                fontWeight: 700, 
                fontSize: `${28 * scale}px`, 
                color: '#000000', 
                letterSpacing: '-0.03em', 
                lineHeight: `${40 * scale}px`,
                width: '100%',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                marginBottom: `${12 * scale}px`,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(headline || (language === 'ja' ? 'FY2026 上半期 コンプライアンス必須教育のご案内' : 'FY2026 상반기 컴플라이언스 필수교육 안내'), 28)}
            </h2>
            {/* Date */}
            <p 
              style={{ 
                fontWeight: 400, 
                fontSize: `${16 * scale}px`, 
                color: '#000000', 
                lineHeight: `${22 * scale}px`,
                width: '100%',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(date || '2026.3.01 – 3.08', 16)}
            </p>
          </div>
        ) : variation.title === 'Type D' ? (
          <>
            {/* Headline */}
            <h2 
              style={{
                position: 'absolute',
                left: `${33 * scale}px`,
                top: `${26 * scale}px`,
                width: `${380 * scale}px`,
                height: `${88 * scale}px`,
                fontWeight: 700,
                fontSize: `${31 * scale}px`,
                lineHeight: `${44 * scale}px`,
                letterSpacing: '-0.03em',
                color: '#000000',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(headline || (language === 'ja' ? 'FY2026 上半기\nコンプライアンス必須教育のご案内' : 'FY2026 상반기\n컴플라이언스 필수교육 안내'), 31)}
            </h2>

            {/* Sub-copy Group */}
            <div 
              style={{ 
                position: 'absolute', 
                left: `${34.31 * scale}px`, 
                top: `${160 * scale}px`, 
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              <span 
                style={{ 
                  fontWeight: 400, 
                  fontSize: `${14 * scale}px`, 
                  lineHeight: `${38 * scale}px`, 
                  color: '#000000', 
                  fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: `${200 * scale}px`,
                  display: 'inline-block'
                }}
              >
                {renderMixedText(date || '2026.3.01 – 3.08', 14)}
              </span>
              <div 
                style={{ 
                  width: `${1.5 * scale}px`, 
                  height: `${12 * scale}px`, 
                  backgroundColor: '#D8D8D8', 
                  marginLeft: `${6.69 * scale}px`, 
                  marginRight: `${7.92 * scale}px` 
                }} 
              />
              <span 
                style={{ 
                  fontWeight: 400, 
                  fontSize: `${14 * scale}px`, 
                  lineHeight: `${38 * scale}px`, 
                  color: '#000000', 
                  fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: `${500 * scale}px`,
                  display: 'inline-block'
                }}
              >
                {renderMixedText(sub || (language === 'ja' ? '全従業員受講必須' : '모든 임직원 수강필요'), 14)}
              </span>
            </div>

            {/* Top Label */}
            <div 
              style={{ 
                position: 'absolute', 
                left: `${622.79 * scale}px`, 
                top: `${30.09 * scale}px`, 
                fontWeight: 800, 
                fontSize: `${13.958 * scale}px`, 
                color: '#000000',
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: `${200 * scale}px`
              }}
            >
              {renderMixedText(label || (language === 'ja' ? 'コンプライアンス' : 'Compliance'), 13.958)}
            </div>
          </>
        ) : (
          <div 
            style={{ 
              position: 'absolute', 
              left: align === 'center' ? '0' : '5.14%', 
              right: align === 'center' ? '0' : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
              width: align === 'center' ? '100%' : '71.62%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: align === 'center' ? 'center' : 'flex-start',
              textAlign: align,
              padding: align === 'center' ? `0 ${30 * scale}px` : '0'
            }}
          >
            {/* Label */}
            <div 
              style={{ 
                fontWeight: 800, 
                fontSize: `${14.5 * scale}px`, 
                color: '#000000',
                lineHeight: '110%',
                letterSpacing: '-0.02em',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                marginBottom: `${12 * scale}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                width: '100%'
              }}
            >
              {renderMixedText(label || (language === 'ja' ? 'タイプ A' : 'Type A'), 14.5)}
            </div>
            {/* Headline */}
            <h2 
              style={{ 
                fontWeight: 700, 
                fontSize: `${29 * scale}px`, 
                color: '#000000', 
                letterSpacing: '-0.03em', 
                lineHeight: `${40 * scale}px`,
                width: '100%',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                marginBottom: `${16 * scale}px`,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(headline || (language === 'ja' ? 'FY2025 下半期 コンプライアンス教育のご案内' : 'FY2025 하반기 컴플라이언스 교육 안내'), 29)}
            </h2>
            {/* Sub-copy */}
            <p 
              style={{ 
                fontWeight: 400, 
                fontSize: `${17 * scale}px`, 
                color: '#000000', 
                lineHeight: `${23 * scale}px`,
                width: '100%',
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {renderMixedText(sub || (language === 'ja' ? 'LINE+ 全従業員対象の必須教育です。' : 'LINE+ 모든 임직원 대상 필수 교육입니다.'), 17)}
            </p>
          </div>
        )
      ) : (
        <>
          {/* Design Elements */}
          <motion.div 
            style={{ 
              width: `${300 * scale}px`, 
              height: `${300 * scale}px`, 
              right: `-${80 * scale}px`, 
              top: `-${80 * scale}px`,
              z: 20,
              backgroundColor: style.secondary
            }} 
            className="absolute rounded-full opacity-50 blur-3xl" 
          />
          
          <div className="relative z-10" style={{ 
            maxWidth: `${500 * scale}px`, 
            transform: "translateZ(80px)",
            display: 'flex',
            flexDirection: 'column',
            alignItems: align === 'center' ? 'center' : 'flex-start'
          }}>
            <div 
              className="font-black uppercase tracking-[0.2em]" 
              style={{ 
                color: style.accent,
                fontSize: `${10 * scale}px`,
                marginBottom: `${12 * scale}px`
              }}
            >
              {renderMixedText('LINE Internal', 10)}
            </div>
            <h2 
              className="font-extrabold leading-[1.1] tracking-tight" 
              style={{ 
                color: style.text,
                fontSize: `${36 * scale}px`,
                marginBottom: `${12 * scale}px`,
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif"
              }}
            >
              {renderMixedText(headline || (language === 'ja' ? 'あなたの見出し' : 'Your Headline'), 36)}
            </h2>
            <p 
              className="font-medium opacity-70 leading-relaxed" 
              style={{ 
                color: style.text,
                fontSize: `${16 * scale}px`,
                marginBottom: `${24 * scale}px`,
                fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif"
              }}
            >
              {renderMixedText(sub, 16)}
            </p>
            {ctaText && (
              <div 
                className="rounded-xl font-black shadow-xl inline-block text-center transform hover:scale-105 transition-transform cursor-pointer"
                style={{ 
                  backgroundColor: style.accent, 
                  color: style.bg === '#ffffff' || style.bg === '#f8f9fa' ? '#ffffff' : style.bg,
                  fontSize: `${12 * scale}px`,
                  padding: `${10 * scale}px ${24 * scale}px`,
                  boxShadow: `0 10px 20px -5px ${style.accent}22`,
                  fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif"
                }}
              >
                {renderMixedText(ctaText, 12)}
              </div>
            )}
          </div>

          {/* Corner Accent */}
          <div 
            className="absolute bottom-6 right-8 opacity-20"
            style={{ color: style.text }}
          >
            <Grid size={16 * scale} />
          </div>
        </>
      )}
    </motion.div>
  );
};

const SlackLogo = () => (
  <svg width="16" height="16" viewBox="0 0 122.8 122.8" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.4 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"/>
    <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.4c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"/>
    <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.4 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C77.6 5.8 83.4 0 90.5 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"/>
    <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"/>
  </svg>
);

const CustomLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_54_715)">
      <rect width="300" height="300" fill="white"/>
      <path d="M141.9 0.222846C224.616 -4.25095 295.299 59.1754 299.777 141.892C304.255 224.609 240.832 295.294 158.118 299.778C75.3939 304.259 4.70136 240.83 0.22327 158.107C-4.2551 75.386 59.177 4.69693 141.9 0.222846Z" fill="black"/>
      <path d="M147.493 44.829C179.721 43.2366 209.906 58.4893 230.685 82.6094C250.028 105.061 257.033 134.149 255.007 163.267C254.318 173.135 249.554 183.311 241.902 189.663C234.88 195.5 225.821 198.296 216.733 197.426C209.9 196.716 203.413 194.067 198.04 189.786C173.798 170.489 194.981 148.098 176.805 126.591C170.65 119.306 161.829 114.8 152.317 114.084C142.889 113.376 133.564 116.449 126.404 122.627C119.282 128.789 114.906 137.531 114.24 146.925C113.516 156.431 116.667 165.825 122.977 172.972C129.156 180.057 137.93 184.355 147.316 184.893C163.5 185.94 173.523 181.883 187.785 194.376C202.166 206.977 203.325 228.79 190.78 243.171C183.77 251.212 172.965 254.9 162.487 255.515C131.377 257.261 103.247 249.337 79.9624 228.601C35.5867 189.085 32.6008 120.605 73.6536 77.5843C94.3753 55.8694 117.493 46.2459 147.493 44.829Z" fill="white"/>
    </g>
    <defs>
      <clipPath id="clip0_54_715">
        <rect width="300" height="300" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'line' | 'slack' | 'contact' }) => {
  const variants = {
    primary: `bg-black text-white hover:bg-gray-800 shadow-sm`,
    secondary: `bg-gray-800 text-white hover:bg-gray-700 shadow-sm`,
    line: `bg-black text-white hover:bg-gray-800 shadow-sm`,
    outline: 'border border-black text-black hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    slack: 'bg-black text-white hover:bg-gray-800 shadow-sm',
    contact: 'bg-white border border-gray-200 text-black hover:bg-gray-50 hover:shadow-md transition-all',
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const ServicePreview = ({ 
  variation, 
  headline, 
  sub, 
  ctaText, 
  align, 
  bgImage, 
  label, 
  date, 
  onClose,
  language
}: any) => {
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth * 0.95;
      const h = window.innerHeight * 0.95;
      const scaleW = w / 1920;
      const scaleH = h / 1007;
      setScale(Math.min(scaleW, scaleH, 0.8));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm overflow-hidden flex items-center justify-center p-4">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[210]"
      >
        <X size={32} />
      </button>
      <div 
        className="relative bg-white shrink-0 shadow-xl overflow-hidden" 
        style={{ 
          width: '1920px', 
          height: '1007px', 
          transform: `scale(${scale})`, 
          transformOrigin: 'center',
          borderRadius: '16px'
        }}
      >
        {/* Header */}
        <div className="absolute w-[1280px] h-[72px] left-[320px] top-0 flex items-center">
          <div className="text-[30px] font-bold tracking-tight text-black font-sans">Workers Hub</div>
          
          <div className="absolute w-[737px] h-[45px] left-[273px] bg-[#F7F7F7] rounded-full flex items-center px-6">
            <Search size={19} className="text-[#ADADAD] mr-2" />
            <span className="text-[14px] text-[#ADADAD] font-semibold">Search...</span>
          </div>
          
          <div className="absolute right-0 flex items-center gap-6">
            <Bell size={24} className="text-black" />
            <Settings size={24} className="text-black" />
            <div className="w-[46px] h-[46px] bg-[#D9D9D9] rounded-full"></div>
          </div>
        </div>

        {/* Left Sidebar */}
        <div className="absolute left-[352px] top-[150px] flex flex-col gap-[34px]">
          <div className="flex items-center gap-3 text-[18px] font-bold text-black"><Info size={24}/> Menu Item 1</div>
          <div className="flex items-center gap-3 text-[18px] font-bold text-black"><ShieldCheck size={24}/> Menu Item 2</div>
          <div className="flex items-center gap-3 text-[18px] font-bold text-black"><Users size={24}/> Menu Item 3</div>
          <div className="flex items-center gap-3 text-[18px] font-bold text-black"><Folder size={24}/> Menu Item 4</div>
          <div className="flex items-center gap-3 text-[18px] font-bold text-black"><CheckSquare size={24}/> Menu Item 5</div>
        </div>

        {/* Main Content Area */}
        <div className="absolute left-[551px] top-[90px]">
          <div className="rounded-[12px] border border-[#E8E8E8] relative">
            <ResponsiveBanner>
              <BannerCanvas 
                variation={variation}
                headline={headline}
                sub={sub}
                ctaText={ctaText}
                align={align}
                bgImage={bgImage}
                label={label}
                date={date}
                scale={1}
                language={language}
              />
            </ResponsiveBanner>
          </div>

          {/* Notice Section */}
          <div className="w-[740px] h-[623px] mt-[26px] bg-white border border-[#E8E8E8] rounded-[12px] relative p-[30px]">
            <div className="font-bold text-[20px] text-black mb-[30px]">Notice Section Title</div>
            
            <div className="absolute right-[30px] top-[30px] flex items-center gap-2">
              <div className="flex items-center gap-1 text-[15px] font-medium text-[#111111]">
                <Plus size={19} /> 게시글 작성
              </div>
            </div>

            <div className="flex flex-col gap-[27px] mt-[40px]">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-[10px]">
                    <div className="px-[7px] py-[5px] border border-[#DFDFDF] rounded-[30px] text-[11px] font-semibold text-[#111111] min-w-[48px] text-center">
                      Tag
                    </div>
                    <div className="flex items-start gap-[3.5px]">
                      <span className="text-[17px] font-medium text-[#111111]">Notice Content {i}</span>
                      {i <= 2 && <div className="w-[4.5px] h-[4.5px] bg-[#FF334B] rounded-full mt-1"></div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-[5px] text-[14px] text-[#777777]">
                    <span>2026.03.23</span>
                    <div className="w-[3.5px] h-[3.5px] bg-[#D9D9D9] rounded-full"></div>
                    <span>14:30</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="absolute left-[1318px] top-[90px] flex flex-col gap-[27px]">
          {/* Card 1 */}
          <div className="w-[282px] h-[216px] border border-[#E8E8E8] rounded-[12px] p-[24px] relative">
            <div className="text-[14px] text-[#777777] mb-[8px]">Section Title</div>
            <div className="text-[18px] font-bold text-black mb-[24px]">Worker Name</div>
            
            <div className="flex justify-between items-center mb-[12px]">
              <span className="text-[14px] text-[#777777]">시작 시간</span>
              <span className="text-[14px] font-medium text-black">09:00</span>
            </div>
            <div className="flex justify-between items-center mb-[24px]">
              <span className="text-[14px] text-[#777777]">누적 시간</span>
              <span className="text-[14px] font-medium text-black">04:30</span>
            </div>
            
            <div className="w-[248px] h-[44px] border border-[#E8E8E8] rounded-[44px] flex items-center justify-center mx-auto absolute bottom-[24px] left-0 right-0">
              <span className="text-[15px] font-semibold text-black">Work End Button</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-[282px] h-[170px] border border-[#E8E8E8] rounded-[12px] flex items-center justify-center relative">
            <div className="flex gap-[40px]">
              <div className="flex flex-col items-center gap-2">
                <div className="w-[34px] h-[34px] bg-gray-100 rounded-full flex items-center justify-center"><FileText size={18}/></div>
                <span className="text-[13px] font-medium text-[#111111]">App Title</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-[34px] h-[34px] bg-gray-100 rounded-full flex items-center justify-center"><CheckSquare size={18}/></div>
                <span className="text-[13px] font-medium text-[#111111]">App Title</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-[34px] h-[34px] bg-gray-100 rounded-full flex items-center justify-center"><Folder size={18}/></div>
                <span className="text-[13px] font-medium text-[#111111]">App Title</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="w-[282px] h-[426px] border border-[#E8E8E8] rounded-[12px] p-[24px] bg-white">
            <div className="flex items-center gap-2 mb-[30px]">
              <span className="text-[19px] font-bold text-black">처리할 문서</span>
              <span className="text-[19px] font-bold text-[#1a73e8]">3</span>
            </div>
            
            <div className="flex flex-col gap-[22px]">
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[15px] font-medium text-[#111111]">Label</span>
                  <span className="text-[13px] font-medium text-[#B7B7B7]">Description</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onClose} 
        className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
};

// --- Views ---

// --- Views ---

function HomeView({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  showVariations, 
  onSelectVariation, 
  headline, 
  sub,
  cta,
  onReset,
  onOpenEditor,
  variations,
  onAddStyle,
  activeVariationId,
  bgImage,
  setBgImage,
  language,
  setLanguage
}: { 
  prompt: string, 
  setPrompt: (v: string) => void, 
  onGenerate: (copy: BannerCopy | null) => void,
  showVariations: boolean,
  onSelectVariation: (id: number) => void,
  headline: string,
  sub: string,
  cta: string,
  onReset: () => void,
  onOpenEditor: () => void,
  variations: DesignVariation[],
  onAddStyle: () => void,
  activeVariationId: number,
  bgImage: string | undefined,
  setBgImage: (v: string | undefined) => void,
  language: 'ko' | 'ja',
  setLanguage: (lang: 'ko' | 'ja') => void
}) {
  const [copies, setCopies] = useState<BannerCopy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<BannerCopy | null>(null);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const [manualHeadline, setManualHeadline] = useState(language === 'ja' ? 'FY2025 下半期 コンプライアンス教育のご案内' : 'FY2025 하반기 컴플라이언스 교육 안내');
  const [manualSub, setManualSub] = useState(language === 'ja' ? 'LINE+ 全従業員対象の必須教育です。' : 'LINE+ 모든 임직원 대상 필수 교육입니다.');
  const [manualCta, setManualCta] = useState(language === 'ja' ? '詳細を見る' : 'Learn More');
  const [manualLabel, setManualLabel] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [align, setAlign] = useState<'left' | 'center'>('left');
  const [showServicePreview, setShowServicePreview] = useState(false);

  useEffect(() => {
    if (manualHeadline === 'FY2025 하반기 컴플라이언스 교육 안내' || manualHeadline === 'FY2025 下半期 コンプライアンス教育のご案内') {
      setManualHeadline(language === 'ja' ? 'FY2025 下半期 コンプライアンス教育のご案内' : 'FY2025 하반기 컴플라이언스 교육 안내');
    }
    if (manualSub === 'LINE+ 모든 임직원 대상 필수 교육입니다.' || manualSub === 'LINE+ 全従業員対象の必須教育です。') {
      setManualSub(language === 'ja' ? 'LINE+ 全従業員対象の必須教育です。' : 'LINE+ 모든 임직원 대상 필수 교육입니다.');
    }
    if (manualCta === 'Learn More' || manualCta === '詳細を見る') {
      setManualCta(language === 'ja' ? '詳細を見る' : 'Learn More');
    }
  }, [language]);

  const activeVariation = variations.find(v => v.id === activeVariationId) || variations[0];

  const bannerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    try {
      const dataUrl = await toPng(bannerRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'banner.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  const presetBackgrounds = [
    { id: 'none', label: 'None', url: '' },
    { id: 'bg1_acd', label: 'BG 1 (ACD)', url: '/BG_Test_1(ACD).png' },
    { id: 'bg1_b', label: 'BG 1 (B)', url: '/BG_Test_1(B).png' },
    { id: 'bg2_acd', label: 'BG 2 (ACD)', url: '/BG_Test_2(ACD).png' },
    { id: 'bg2_b', label: 'BG 2 (B)', url: '/BG_Test_2(B).png' },
    { id: 'bg3_acd', label: 'BG 3 (ACD)', url: '/BG_Test_3(ACD).png' },
    { id: 'bg3_b', label: 'BG 3 (B)', url: '/BG_Test_3(B).png' },
    { id: 'bg4_acd', label: 'BG 4 (ACD)', url: '/BG_Test_4(ACD).png' },
    { id: 'bg4_b', label: 'BG 4 (B)', url: '/BG_Test_4(B).png' },
    { id: 'bg5_b', label: 'BG 5 (B)', url: '/BG_Test_5(B).png' },
  ];

  useEffect(() => {
    if (headline && sub && cta) {
      setSelectedCopy({ tone: 'Custom', headline, sub, cta, align });
    }
  }, [headline, sub, cta, align]);

  useEffect(() => {
    if (mode === 'manual') {
      const copy: BannerCopy = { tone: 'Manual', headline: manualHeadline, sub: manualSub, cta: manualCta, align, label: manualLabel, date: manualDate };
      setSelectedCopy(copy);
    }
  }, [mode, manualHeadline, manualSub, manualCta, align, manualLabel, manualDate]);

  const handleAICopy = async (lang: 'ko' | 'ja') => {
    if (!prompt.trim()) { 
      setError('Please enter a banner topic first.'); 
      return; 
    }
    setError('');
    setLoading(true);
    setCopies([]);
    
    try {
      const result = await generateAICopy(prompt, lang);
      setCopies(result);
      if (result.length > 0) {
        setSelectedCopy(result[0]);
        onGenerate(result[0]);
      }
    } catch (err) {
      setError('AI connection failed. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  // Removed the problematic useEffect that was causing redundant/incorrect AI copy generation on language change.

  return (
    <div className="min-h-screen md:h-screen bg-white font-sans text-black flex flex-col md:flex-row md:overflow-hidden">
      {/* Left Panel: Controls */}
      <aside className="w-full md:w-[360px] border-b md:border-r border-gray-100 bg-white flex flex-col z-20">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
            <CustomLogo className="h-4" />
            <span className="font-semibold tracking-tight text-sm text-gray-900">Creative Banner Studio</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => {
                  setLanguage('ko');
                  setSelectedCopy(null);
                  if (mode === 'ai') handleAICopy('ko');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${language === 'ko' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                KO
              </button>
              <button
                onClick={() => {
                  setLanguage('ja');
                  setSelectedCopy(null);
                  if (mode === 'ai') handleAICopy('ja');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${language === 'ja' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                JA
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 md:overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {/* Mode Toggle */}
          <section>
            <div className="flex bg-gray-100 p-0.5 rounded-xl mb-5">
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-semibold transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                <Type size={13} /> Manual
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-semibold transition-all ${mode === 'ai' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                <Sparkles size={13} /> AI Copywriter
              </button>
            </div>
          </section>

          {mode === 'ai' ? (
            <>
              {/* Section 1: Topic */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">1. Topic</h3>
                  {loading && <RefreshCw size={14} className="animate-spin text-black" />}
                </div>
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={e => { setPrompt(e.target.value); setError(''); }}
                    placeholder="What are you announcing?"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all h-32 resize-none placeholder-gray-300"
                  />
                  <button 
                    onClick={handleAICopy}
                    disabled={loading || !prompt.trim()}
                    className="absolute bottom-4 right-4 bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-30 transition-all shadow-lg"
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </section>

              {/* Section 2: AI Copy Suggestions */}
              <AnimatePresence>
                {copies.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">2. AI Copy Suggestions</h3>
                    <div className="space-y-3">
                      {copies.map((c, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          onClick={() => { 
                            setSelectedCopy(c); 
                            onGenerate(c);
                          }}
                          className={`p-5 cursor-pointer rounded-2xl border-2 transition-all ${
                            selectedCopy?.headline === c.headline 
                              ? 'border-black bg-gray-50' 
                              : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-black uppercase tracking-widest px-2 py-0.5 bg-gray-200 rounded-full">{c.tone}</span>
                              </div>
                              <h4 className="text-base font-bold leading-tight">{c.headline}</h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{c.sub}</p>
                            </div>
                            {selectedCopy?.headline === c.headline && (
                              <div className="bg-black p-1 rounded-full text-white">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              {/* Manual Entry Section */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Content</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-0.5">Headline</label>
                    <input
                      type="text"
                      value={manualHeadline}
                      onChange={e => setManualHeadline(e.target.value)}
                      placeholder="Enter headline"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/10 focus:border-gray-400 outline-none transition-all font-medium placeholder-gray-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-0.5">Sub-copy</label>
                    <input
                      type="text"
                      value={manualSub}
                      onChange={e => setManualSub(e.target.value)}
                      placeholder="Enter sub-copy"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/10 focus:border-gray-400 outline-none transition-all font-medium placeholder-gray-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-0.5">Top Label</label>
                    <input
                      type="text"
                      value={manualLabel}
                      onChange={e => setManualLabel(e.target.value)}
                      placeholder="e.g. Compliance"
                      className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/10 focus:border-gray-400 outline-none transition-all font-medium placeholder-gray-300"
                    />
                  </div>
                  {(activeVariation.title === 'Type C' || activeVariation.title === 'Type C-2' || activeVariation.title === 'Type D') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-0.5">Date</label>
                      <input
                        type="text"
                        value={manualDate}
                        onChange={e => setManualDate(e.target.value)}
                        placeholder="e.g. 2026.3.01 - 3.08"
                        className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/10 focus:border-gray-400 outline-none transition-all font-medium placeholder-gray-300"
                      />
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Section: Design Style */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Design Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {variations.map(v => (
                <motion.div
                  key={v.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectVariation(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeVariationId === v.id
                      ? 'border-gray-900 bg-gray-50 shadow-sm'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-full aspect-[3/1] rounded-md mb-2 overflow-hidden ${v.border ? 'border border-gray-200' : ''}`}
                    style={{ backgroundColor: v.colors.bg }}
                  >
                    {v.bgImage && (
                      <img src={v.bgImage} alt={v.title} className="w-full h-full object-cover opacity-80" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-gray-800">{v.title}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{v.desc}</div>
                    </div>
                    {activeVariationId === v.id && (
                      <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center shrink-0">
                        <Check size={9} className="text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section: Background Image */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Background</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Uploaded Image Preview */}
              {bgImage && !presetBackgrounds.find(bg => bg.url === bgImage) && (
                <button
                  onClick={() => setBgImage(bgImage)}
                  className={`w-full aspect-[740/216] rounded-xl border-2 transition-all overflow-hidden relative border-black`}
                >
                  <img src={bgImage} alt="Uploaded" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold uppercase">Uploaded</span>
                  </div>
                </button>
              )}
              {presetBackgrounds.filter(bg => {
                if (bg.id === 'none') return true;
                const ruleMatch = bg.label.match(/\(([^)]+)\)/);
                const allowed = ruleMatch ? ruleMatch[1] : '';
                
                // If no rule is present in the label, do not show it.
                if (!ruleMatch) return false;
                
                if (activeVariation.title.includes('Type A')) return allowed.includes('A');
                if (activeVariation.title.includes('Type B')) return allowed.includes('B');
                if (activeVariation.title.includes('Type C')) return allowed.includes('C');
                if (activeVariation.title.includes('Type D')) return allowed.includes('D');
                
                return false;
              }).map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setBgImage(bg.url)}
                  className={`w-full aspect-[740/216] rounded-xl border-2 transition-all overflow-hidden relative ${
                    bgImage === bg.url ? 'border-black' : 'border-gray-100'
                  }`}
                >
                  {bg.url ? (
                    <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <X size={12} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold uppercase">{bg.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>

        <footer className="p-4 border-t border-gray-100 bg-white">
          <Button
            variant="line"
            onClick={handleDownload}
            disabled={!selectedCopy || showVariations}
            className="w-full py-3 rounded-xl bg-gray-900 text-white hover:bg-black text-sm font-semibold"
          >
            <Download size={15} /> Download Banner
          </Button>
        </footer>
      </aside>

      {/* Right Panel: Live Preview */}
      <main className={`flex-1 relative bg-[#f8f8f8] flex flex-col items-center p-5 md:p-8 overflow-y-auto ${showVariations ? '' : 'md:justify-center'} custom-scrollbar min-h-screen md:h-full`}>
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" />

        <div className={`relative z-10 w-full max-w-5xl flex flex-col items-center ${showVariations ? '' : 'gap-4'}`}>
          {showVariations ? (
            <div className="w-full overflow-y-auto max-h-[80vh] custom-scrollbar pr-4">
              <VariationsView 
                onSelect={onSelectVariation}
                headline={selectedCopy?.headline || headline || (language === 'ja' ? 'ここにヘッドラインを入力' : 'Your Headline Here')}
                sub={selectedCopy?.sub || sub || (language === 'ja' ? 'トピックを入力してコピーを生成' : 'Enter a topic to generate copy')}
                cta={selectedCopy?.cta || cta}
                align={align}
                variations={variations}
                bgImage={bgImage}
                language={language}
              />
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeVariationId}-${selectedCopy?.headline || ''}-${language}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="relative mt-2 md:mt-4 w-full px-0 md:px-4"
                >
                <div ref={bannerRef} className="py-2">
                    <ResponsiveBanner>
                      <BannerCanvas 
                        variation={activeVariation}
                        headline={selectedCopy?.headline || headline || (language === 'ja' ? 'ここにヘッドラインを入力' : 'Your Headline Here')}
                        sub={selectedCopy?.sub || sub || (language === 'ja' ? 'トピックを入力してコピーを生成' : 'Enter a topic to generate copy')}
                        ctaText={selectedCopy?.cta || cta}
                        label={selectedCopy?.label}
                        date={selectedCopy?.date}
                        align={align}
                        bgImage={bgImage}
                        className="w-full max-w-full h-auto shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]"
                        tilt={true}
                        language={language}
                      />
                    </ResponsiveBanner>
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex justify-center mt-8 md:mt-16"
              >
                <WebsitePreview language={language}>
                  <ResponsiveBanner>
                    <BannerCanvas 
                      variation={activeVariation}
                      headline={selectedCopy?.headline || headline || (language === 'ja' ? 'ここにヘッドラインを入力' : 'Your Headline Here')}
                      sub={selectedCopy?.sub || sub || (language === 'ja' ? 'トピックを入力してコピーを生成' : 'Enter a topic to generate copy')}
                      ctaText={selectedCopy?.cta || cta}
                      label={selectedCopy?.label}
                      date={selectedCopy?.date}
                      scale={1}
                      align={align}
                      bgImage={bgImage}
                      className="w-full h-full shadow-none"
                      tilt={false}
                      language={language}
                    />
                  </ResponsiveBanner>
                </WebsitePreview>
              </motion.div>
            </>
          )}
        </div>

        {/* Bottom Status Removed */}
      </main>

      {showServicePreview && (
        <ServicePreview 
          variation={activeVariation}
          headline={selectedCopy?.headline || headline || (language === 'ja' ? 'ここにヘッドラインを入力' : 'Your Headline Here')}
          sub={selectedCopy?.sub || sub || (language === 'ja' ? 'トピックを入力してコピーを生成' : 'Enter a topic to generate copy')}
          ctaText={selectedCopy?.cta || cta}
          label={selectedCopy?.label}
          date={selectedCopy?.date}
          align={align}
          bgImage={bgImage}
          onClose={() => setShowServicePreview(false)}
          language={language}
        />
      )}
    </div>
  );
}


function GeneratingView() {
  return (
    <div className="min-h-screen md:h-screen flex flex-col items-center justify-center bg-white font-sans md:overflow-hidden">
      <div className="relative w-20 h-20 mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-gray-100 border-t-black rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-4 border-gray-100 border-t-gray-400 rounded-full"
        />
      </div>
      <h2 className="text-3xl font-normal text-[#202124] mb-4">Designing your banner...</h2>
      <p className="text-[#5f6368]">Applying LINE brand aesthetic and modern design principles.</p>
    </div>
  );
}

const WebsitePreview = ({ children, language }: { children: React.ReactNode, language: 'ko' | 'ja' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const baseScale = width / 1920;
        setScale(window.innerWidth < 768 ? baseScale * 1.25 : baseScale);
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    updateScale();
    
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[1920px] mx-auto mt-0 overflow-hidden bg-white aspect-[1920/1007]"
    >
      <div 
        className="absolute inset-0 origin-center" 
        style={{ 
          width: '1920px', 
          height: '1007px', 
          transform: `scale(${scale})`,
          left: '50%',
          top: '50%',
          marginLeft: '-960px',
          marginTop: '-503.5px',
          backgroundImage: `url("/Workers Hub_Thumbnail${language === 'ja' ? '_JP' : ''}.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Banner Placeholder - Positioned over the background image */}
        <div className="absolute w-[740px] h-[216px] left-[551px] top-[90px] rounded-[12px] border border-[#E8E8E8] relative">
          {children}
        </div>
      </div>
    </div>
  );
};

function VariationsView({ onSelect, headline, sub, cta, align, variations, bgImage, language }: { onSelect: (id: number) => void, headline: string, sub: string, cta: string, align?: 'left' | 'center', variations: DesignVariation[], bgImage?: string | undefined, language: 'ko' | 'ja' }) {
  return (
    <div className="w-full mt-12">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-2xl font-bold text-[#111111]">Design Variations</h2>
        <span className="text-sm text-[#5f6368]">{variations.length} styles generated</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {variations.map(v => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelect(v.id)}
            className="group cursor-pointer bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all"
          >
            <div className="w-full">
              <ResponsiveBanner>
                <BannerCanvas 
                  variation={v}
                  headline={headline}
                  sub={sub}
                  ctaText={cta}
                  scale={1}
                  align={align}
                  bgImage={bgImage}
                  className=""
                  tilt={true}
                  language={language}
                />
              </ResponsiveBanner>
            </div>
            <div className="p-6 flex justify-between items-center bg-white">
              <div>
                <h4 className="text-lg font-bold text-[#111111]">{v.title}</h4>
                <p className="text-sm text-[#5f6368] mt-1">{v.desc}</p>
              </div>
              <div className="bg-[#f1f3f4] p-3 rounded-full text-[#111111] group-hover:bg-black group-hover:text-white transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EditorView({ onBack, variation, initialCopy, bgImage, setBgImage, language }: { onBack: () => void, variation: DesignVariation, initialCopy: BannerCopy | null, bgImage: string | undefined, setBgImage: (v: string | undefined) => void, language: 'ko' | 'ja' }) {
  const style = variation.colors;

  const [headline, setHeadline] = useState(initialCopy?.headline || '');
  const [sub, setSub] = useState(initialCopy?.sub || '');
  const [ctaText, setCtaText] = useState(initialCopy?.cta || (language === 'ja' ? '詳細を見る' : 'Learn More'));
  const [label, setLabel] = useState(initialCopy?.label || '');
  const [date, setDate] = useState(initialCopy?.date || '');
  const [align, setAlign] = useState<'left' | 'center'>(initialCopy?.align || 'left');
  const [toast, setToast] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetBackgrounds = [
    { id: 'none', label: 'None', url: '' },
    { id: 'bg1_acd', label: 'BG 1 (ACD)', url: '/BG_Test_1(ACD).png' },
    { id: 'bg1_b', label: 'BG 1 (B)', url: '/BG_Test_1(B).png' },
    { id: 'bg2_acd', label: 'BG 2 (ACD)', url: '/BG_Test_2(ACD).png' },
    { id: 'bg2_b', label: 'BG 2 (B)', url: '/BG_Test_2(B).png' },
    { id: 'bg3_acd', label: 'BG 3 (ACD)', url: '/BG_Test_3(ACD).png' },
    { id: 'bg3_b', label: 'BG 3 (B)', url: '/BG_Test_3(B).png' },
    { id: 'bg4_acd', label: 'BG 4 (ACD)', url: '/BG_Test_4(ACD).png' },
    { id: 'bg4_b', label: 'BG 4 (B)', url: '/BG_Test_4(B).png' },
    { id: 'bg5_b', label: 'BG 5 (B)', url: '/BG_Test_5(B).png' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (initialCopy) {
      setHeadline(initialCopy.headline || (variation.isCompliance ? (language === 'ja' ? 'FY2025 下半期 コンプライアンス教育のご案内' : 'FY2025 하반기 컴플라이언스 교육 안내') : ''));
      setSub(initialCopy.sub || (variation.isCompliance ? (language === 'ja' ? 'LINE+ 全従業員対象の必須教育です。' : 'LINE+ 모든 임직원 대상 필수 교육입니다.') : ''));
      setCtaText(initialCopy.cta);
      setLabel(initialCopy.label || '');
      setDate(initialCopy.date || '');
      if (initialCopy.align) setAlign(initialCopy.align);
    }
  }, [initialCopy, variation]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-[#fafafa] font-sans md:overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-all border border-gray-100">
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#111111] tracking-tight">{headline || (language === 'ja' ? '無題のバナー' : 'Untitled Banner')}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-bold text-black uppercase tracking-widest px-1.5 py-0.5 bg-gray-200 rounded-full">Editing</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{initialCopy?.tone || (language === 'ja' ? 'カスタム' : 'Custom')} Style</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-100 mr-2">
            <button 
              onClick={() => setAlign('left')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${align === 'left' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <AlignLeft size={14} />
            </button>
            <button 
              onClick={() => setAlign('center')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${align === 'center' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <AlignCenter size={14} />
            </button>
          </div>
          <Button 
            variant="primary" 
            onClick={() => showToast('Banner exported as PNG!')}
            className="bg-black text-white px-4 py-2 rounded-xl shadow-lg hover:bg-gray-800 text-xs"
          >
            <Download size={14} /> Export
          </Button>
        </div>
      </header>

      <div className="flex flex-1 md:overflow-hidden">
        {/* Left Sidebar: Tools & Layers */}
        <aside className="w-28 border-r border-gray-200 flex flex-col bg-white md:overflow-y-auto z-20">
          <div className="p-1.5 space-y-2">
            <section>
              <h3 className="text-[6px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Content</h3>
              <div className="space-y-0.5">
                <div className="space-y-0.5">
                  <label className="text-[5px] font-bold text-gray-400 uppercase tracking-widest ml-1">Headline</label>
                  <textarea 
                    value={headline} 
                    onChange={e => setHeadline(e.target.value)}
                    className="w-full p-1 bg-gray-50 border border-gray-100 rounded text-[9px] focus:ring-1 focus:ring-black/10 focus:border-black outline-none transition-all h-14 resize-none font-medium"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[6px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sub-copy</label>
                  <input 
                    type="text"
                    value={sub} 
                    onChange={e => setSub(e.target.value)}
                    className="w-full p-1 bg-gray-50 border border-gray-100 rounded text-[9px] focus:ring-1 focus:ring-black/10 focus:border-black outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[6px] font-bold text-gray-400 uppercase tracking-widest ml-1">Top Label</label>
                  <input 
                    type="text"
                    value={label} 
                    onChange={e => setLabel(e.target.value)}
                    className="w-full p-1 bg-gray-50 border border-gray-100 rounded text-[9px] focus:ring-1 focus:ring-black/10 focus:border-black outline-none transition-all font-medium"
                    placeholder="e.g. Compliance"
                  />
                </div>
                {(variation.title === 'Type C' || variation.title === 'Type C-2' || variation.title === 'Type D') && (
                  <div className="space-y-0.5">
                    <label className="text-[6px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="text"
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-1 bg-gray-50 border border-gray-100 rounded text-[9px] focus:ring-1 focus:ring-black/10 focus:border-black outline-none transition-all font-medium"
                      placeholder="e.g. 2026.3.01 - 3.08"
                    />
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[6px] font-bold text-gray-400 uppercase tracking-widest mb-1">Style</h3>
              <div className="grid grid-cols-4 gap-1">
                {[LINE_GREEN, GOOGLE_RED, GOOGLE_YELLOW, GOOGLE_GREEN, '#111111', '#ffffff', '#4A154B', '#36c5f0'].map(c => (
                  <button 
                    key={c}
                    className="aspect-square rounded border border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[6px] font-bold text-gray-400 uppercase tracking-widest">BG</h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-0.5 hover:bg-gray-100 rounded text-black transition-colors flex items-center gap-0.5 text-[6px] font-bold uppercase"
                >
                  <ImagePlus size={8} /> Up
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Uploaded Image Preview */}
                {bgImage && !presetBackgrounds.find(bg => bg.url === bgImage) && (
                  <button
                    onClick={() => setBgImage(bgImage)}
                    className={`aspect-[740/216] rounded-xl border-2 transition-all overflow-hidden relative border-black`}
                  >
                    <img src={bgImage} alt="Uploaded" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold uppercase">Uploaded</span>
                    </div>
                  </button>
                )}
                {presetBackgrounds.filter(bg => {
                  if (bg.id === 'none') return true;
                  const ruleMatch = bg.label.match(/\(([^)]+)\)/);
                  const allowed = ruleMatch ? ruleMatch[1] : '';
                  
                  // If no rule is present in the label, do not show it.
                  if (!ruleMatch) return false;
                  
                  if (variation.title.includes('Type A')) return allowed.includes('A');
                  if (variation.title.includes('Type B')) return allowed.includes('B');
                  if (variation.title.includes('Type C')) return allowed.includes('C');
                  if (variation.title.includes('Type D')) return allowed.includes('D');
                  
                  return false;
                }).map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setBgImage(bg.url)}
                    className={`aspect-[740/216] rounded-xl border-2 transition-all overflow-hidden relative ${
                      bgImage === bg.url ? 'border-black' : 'border-gray-100'
                    }`}
                  >
                    {bg.url ? (
                      <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <X size={12} className="text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-auto p-2 border-t border-gray-100 bg-gray-50/30">
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-full max-w-full">
              <div className="flex items-center gap-1 text-[#06C755] mb-1">
                <Sparkles size={12} />
                <span className="text-[8px] font-bold uppercase tracking-widest">AI Suggestion</span>
              </div>
              <p className="text-[9px] text-gray-500 leading-tight">
                Your headline is perfect! Try a slightly longer sub-copy for more context.
              </p>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-[#f0f0f0] flex items-center justify-center p-12 overflow-auto relative">
          <div className="relative group">
            <ResponsiveBanner baseScale={0.9}>
              <BannerCanvas 
                variation={variation}
                headline={headline}
                sub={sub}
                ctaText={ctaText}
                scale={1}
                align={align}
                bgImage={bgImage}
                className="shadow-[0_50px_100px_-20px_rgba(0,0,0,0.125)]"
                tilt={true}
                language={language}
              />
            </ResponsiveBanner>
            
            {/* Canvas Overlay Controls */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"><Crop size={18} /></button>
              <button className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"><ImageIcon size={18} /></button>
              <button className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"><Type size={18} /></button>
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-8 right-8 flex items-center bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl overflow-hidden p-1">
            <button className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"><ChevronLeft size={18} /></button>
            <span className="px-4 text-xs font-bold text-[#111111]">120%</span>
            <button className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors rotate-180"><ChevronLeft size={18} /></button>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-3xl shadow-xl z-50 text-sm font-bold flex items-center gap-3"
          >
            <Check size={18} className="text-[#06C755]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<'home' | 'editor'>('home');
  const [prompt, setPrompt] = useState('');
  const [variations, setVariations] = useState<DesignVariation[]>(INITIAL_VARIATIONS);
  const [selectedVariationId, setSelectedVariationId] = useState<number>(1);
  const [activeCopy, setActiveCopy] = useState<BannerCopy | null>(null);
  const [showVariations, setShowVariations] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<'ko' | 'ja'>(() => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'ko';
    return browserLang.startsWith('ja') ? 'ja' : 'ko';
  });

  const handleGenerate = (copy: BannerCopy | null) => {
    setActiveCopy(copy);
  };

  const handleAddStyle = (newStyle: Omit<DesignVariation, 'id'>) => {
    const variation: DesignVariation = {
      ...newStyle,
      id: variations.length + 1
    };
    setVariations([...variations, variation]);
    setSelectedVariationId(variation.id);
  };

  const resetToHome = () => {
    setStep('home');
    setPrompt('');
    setActiveCopy(null);
    setShowVariations(false);
  };

  const selectedVariation = variations.find(v => v.id === selectedVariationId) || variations[0];

  return (
    <>
      {step === 'home' && (
        <HomeView 
          prompt={prompt} 
          setPrompt={setPrompt} 
          onGenerate={handleGenerate} 
          showVariations={showVariations}
          onSelectVariation={setSelectedVariationId}
          headline={activeCopy?.headline || ''}
          sub={activeCopy?.sub || ''}
          cta={activeCopy?.cta || ''}
          onReset={resetToHome}
          onOpenEditor={() => setStep('editor')}
          variations={variations}
          onAddStyle={() => setIsModalOpen(true)}
          activeVariationId={selectedVariationId}
          bgImage={bgImage}
          setBgImage={setBgImage}
          language={language}
          setLanguage={setLanguage}
        />
      )}
      {step === 'editor' && (
        <EditorView 
          onBack={() => setStep('home')}
          variation={selectedVariation}
          initialCopy={activeCopy}
          bgImage={bgImage}
          setBgImage={setBgImage}
          language={language}
        />
      )}
      <AddStyleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddStyle} 
      />
    </>
  );
}
