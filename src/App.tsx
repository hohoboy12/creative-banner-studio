/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
// Anthropic Claude API (browser direct access)

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
  bannerHeight?: number;
  layoutType?: 'new-guide' | 'legacy';
  headlineSize?: number;
  headlineLineHeight?: number;
}

const INITIAL_VARIATIONS: DesignVariation[] = [
  {
    id: 10,
    title: 'Single Short',
    desc: 'Short headline, 1 line',
    bgClass: '',
    textClass: 'text-[#111111]',
    accentClass: 'text-[#0063F3]',
    accentColor: '#0063F3',
    colors: { bg: '#F5F6F8', text: '#111111', accent: '#0063F3', secondary: '#F5F6F8' },
    border: false,
    isCompliance: false,
    bannerHeight: 232,
    layoutType: 'new-guide' as const,
    headlineSize: 29,
    headlineLineHeight: 38,
  },
  {
    id: 12,
    title: 'Two-line',
    desc: 'Headline 2 lines',
    bgClass: '',
    textClass: 'text-[#111111]',
    accentClass: 'text-[#0063F3]',
    accentColor: '#0063F3',
    colors: { bg: '#F5F6F8', text: '#111111', accent: '#0063F3', secondary: '#F5F6F8' },
    border: false,
    isCompliance: false,
    bannerHeight: 232,
    layoutType: 'new-guide' as const,
    headlineSize: 23,
    headlineLineHeight: 30,
  },
  {
    id: 13,
    title: 'Three-line',
    desc: 'Headline 3 lines',
    bgClass: '',
    textClass: 'text-[#111111]',
    accentClass: 'text-[#0063F3]',
    accentColor: '#0063F3',
    colors: { bg: '#F5F6F8', text: '#111111', accent: '#0063F3', secondary: '#F5F6F8' },
    border: false,
    isCompliance: false,
    bannerHeight: 232,
    layoutType: 'new-guide' as const,
    headlineSize: 21,
    headlineLineHeight: 28,
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

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? '';

async function generateAICopy(prompt: string, language: 'ko' | 'ja' | 'en' | 'tw'): Promise<BannerCopy[]> {
  const langInstruction = language === 'ja'
    ? "Generate all copy in Japanese. Headline max 15 chars, Sub-copy max 25 chars, CTA max 6 chars."
    : language === 'en'
    ? "Generate all copy in English. Headline max 40 chars, Sub-copy max 60 chars, CTA max 10 chars."
    : language === 'tw'
    ? "Generate all copy in Traditional Chinese (Taiwan). Headline max 20 chars, Sub-copy max 30 chars, CTA max 8 chars."
    : "Generate all copy in Korean. Headline max 20 chars, Sub-copy max 30 chars, CTA max 8 chars.";

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `User's banner topic: "${prompt}"

Please create 3 different tones of banner copy in JSON array format (output ONLY raw JSON, no markdown, no code block).
${langInstruction}

[
  {"tone":"Professional","headline":"Headline","sub":"Sub-copy","cta":"Button Text"},
  {"tone":"Friendly","headline":"...","sub":"...","cta":"..."},
  {"tone":"Bold","headline":"...","sub":"...","cta":"..."}
]`
      }]
    })
  });

  const data = await response.json();

  try {
    const text = data.content?.[0]?.text || '[]';
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI response", e, data);
    return [];
  }
}

const ResponsiveBanner = ({ children, baseScale = 1, height = 216 }: { children: React.ReactNode, baseScale?: number, height?: number }) => {
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
    <div className="w-full relative" style={{ aspectRatio: `740/${height}` }} ref={containerRef}>
      <div style={{ width: '740px', height: `${height}px`, transformOrigin: 'top left', transform: `scale(${scale * baseScale})` }}>
        {children}
      </div>
    </div>
  );
};

// --- BannerThumbnail: pixel-perfect scaled preview ---
const BannerThumbnail = (props: React.ComponentProps<typeof BannerCanvas>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.397);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 740);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden w-full"
      style={{ height: `${Math.round((props.variation.bannerHeight || 216) * scale)}px`, position: 'relative', background: '#FFFFFF' }}
    >
      <div style={{
        transform: `scale(${scale}) translateZ(0)`,
        transformOrigin: 'top left',
        width: '740px',
        height: `${props.variation.bannerHeight || 216}px`,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        willChange: 'transform',
        WebkitFontSmoothing: 'antialiased',
      } as React.CSSProperties}>
        <BannerCanvas {...props} />
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
  language = 'ko',
  noRadius = false,
  overrideHeadlineSize,
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
  language?: 'ko' | 'ja' | 'en' | 'tw';
  noRadius?: boolean;
  overrideHeadlineSize?: number | null;
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
  const bannerFont = language === 'ja'
    ? "'Pretendard JP', sans-serif"
    : language === 'en'
    ? "'LINE Seed Sans', 'LINESeedSansKR', sans-serif"
    : language === 'tw'
    ? "'Noto Sans TC', 'PingFang TC', sans-serif"
    : "'LINE Seed Sans', 'LINESeedSansKR', sans-serif";
  const jaOffset = (language === 'ja' || language === 'tw') ? 1 : 0;

  // Dynamic headline size: overrideHeadlineSize가 있으면 사용, 없으면 variation 기본값
  const headlineFontSize = overrideHeadlineSize ?? variation.headlineSize ?? 25;
  const headlineLineHeight = overrideHeadlineSize
    ? Math.round(overrideHeadlineSize * 1.31)
    : (variation.headlineLineHeight ?? 33);
  // 각 variation에 맞는 최대 줄수: Single Short=1줄, Two-line=2줄, Three-line=3줄
  const headlineMaxLines = variation.title === 'Three-line' ? 3 : variation.title === 'Two-line' ? 2 : 1;

  const renderMixedText = (text: string, baseSize: number, twEnOffset: number = 0, twEnWeight?: number, lightLatin?: boolean) => {
    if (!text) return null;
    // JP/TW: English & numbers → LINE Seed Sans / KR/EN: numbers → LINE Seed Sans (explicit)
    // lightLatin: sub-copy context — process ALL Latin in all languages with Inter 300
    const hasLatinOrNum = /[a-zA-Z0-9]/.test(text);
    const hasNumOnly = /[0-9]/.test(text);
    const shouldProcess = lightLatin
      ? hasLatinOrNum
      : (language === 'ja' || language === 'tw') ? hasLatinOrNum : hasNumOnly;

    if (shouldProcess) {
      const splitPattern = /([a-zA-Z0-9]+(?:[.\-:/\s][a-zA-Z0-9]+)*)/g;
      const checkPattern = lightLatin ? /[a-zA-Z0-9]/ : (language === 'ja' || language === 'tw') ? /[a-zA-Z0-9]/ : /[0-9]/;
      const parts = text.split(splitPattern);
      const enSize = language === 'tw' ? baseSize + twEnOffset : baseSize;
      return (
        <>
          {parts.map((part, i) => {
            if (checkPattern.test(part)) {
              return (
                <span key={i} style={{
                  fontFamily: "'LINE Seed Sans', 'LINESeedSansKR', sans-serif",
                  fontSize: `${enSize * (scale || 1)}px`,
                  fontWeight: lightLatin ? 400 : undefined,
                  ...(twEnWeight !== undefined ? { fontWeight: twEnWeight } : {}),
                }}>
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
        height: `${(variation.bannerHeight || 216) * scale}px`,
        backgroundColor: style.bg,
        border: variation.border ? '1px solid rgba(0,0,0,0.05)' : 'none',
        borderRadius: noRadius ? 0 : variation.layoutType === 'new-guide' ? `${10 * scale}px` : isCompliance ? `${12 * scale}px` : `${24 * scale}px`,
        overflow: 'hidden',
        padding: (isCompliance || variation.layoutType === 'new-guide') ? '0' : `${40 * scale}px ${60 * scale}px`,
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: "preserve-3d",
        display: isCompliance ? 'block' : 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align
      }}
      className={`relative overflow-hidden ${className} ${fontClass}`}
    >
      {/* Background Image - only for legacy layouts */}
      {currentBgImage && variation.layoutType !== 'new-guide' && (
        <img
          src={currentBgImage}
          alt="Background"
          className="absolute z-0 w-full h-full object-cover"
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

      {variation.layoutType === 'new-guide' ? (() => {
        const maxChars: Record<string, { label: number; sub: number }> = {
          'Single Short': { label: 22, sub: 20 },
          'Two-line': { label: 22, sub: 20 },
          'Three-line': { label: 22, sub: 20 },
        };
        const limits = maxChars[variation.title] || { label: 22, sub: 20 };
        const clampedLabel = (label || (language === 'ja' ? 'カテゴリ' : 'Category')).slice(0, limits.label);
        const clampedSub = sub.slice(0, limits.sub);
        return align === 'center' ? (
          // CENTER mode: text only, centered horizontally & vertically, no image
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: `${405 * scale}px`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              fontFamily: bannerFont,
            }}>
              <div style={{
                fontSize: `${(13 - jaOffset) * scale}px`, fontWeight: 800, color: '#0063F3',
                marginBottom: `${8 * scale}px`,
                lineHeight: `${17 * scale}px`,
                textAlign: 'center', width: '100%',
                fontFamily: bannerFont,
              }}>
                {renderMixedText(clampedLabel, 13, 0)}
              </div>
              <div style={{
                fontSize: `${headlineFontSize * scale}px`, fontWeight: language === 'tw' ? 800 : 700, color: '#111111',
                marginBottom: `${8 * scale}px`,
                lineHeight: `${headlineLineHeight * scale}px`,
                textAlign: 'center', width: '100%', wordBreak: 'break-all', overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                fontFamily: bannerFont,
                overflow: 'hidden', maxHeight: `${headlineLineHeight * headlineMaxLines * scale}px`,
                letterSpacing: language === 'en' ? `${-0.32 * scale}px` : undefined,
              }}>
                {renderMixedText(headline, headlineFontSize, 2, language === 'tw' ? 700 : undefined)}
              </div>
              <div style={{
                fontSize: `${(15 - jaOffset) * scale}px`, fontWeight: 400, color: '#111111',
                lineHeight: `${20 * scale}px`,
                textAlign: 'center', width: '100%',
                fontFamily: bannerFont,
              }}>
                {renderMixedText(clampedSub, 15, 1, undefined, true)}
              </div>
            </div>
          </div>
        ) : (
          // LEFT mode: left text + right image
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'stretch' }}>
            <div style={{
              flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              paddingLeft: `${54 * scale}px`, paddingRight: `${35 * scale}px`,
              fontFamily: bannerFont,
            }}>
              <div style={{
                fontSize: `${(13 - jaOffset) * scale}px`, fontWeight: 800, color: '#0063F3',
                marginBottom: `${8 * scale}px`,
                lineHeight: `${17 * scale}px`,
                fontFamily: bannerFont,
              }}>
                {renderMixedText(clampedLabel, 13, 0)}
              </div>
              <div style={{
                fontSize: `${headlineFontSize * scale}px`, fontWeight: language === 'tw' ? 800 : 700, color: '#111111',
                marginBottom: `${8 * scale}px`,
                lineHeight: `${headlineLineHeight * scale}px`,
                wordBreak: 'break-all', overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                fontFamily: bannerFont,
                overflow: 'hidden', maxHeight: `${headlineLineHeight * headlineMaxLines * scale}px`,
                letterSpacing: language === 'en' ? `${-0.32 * scale}px` : undefined,
              }}>
                {renderMixedText(headline, headlineFontSize, 2, language === 'tw' ? 700 : undefined)}
              </div>
              <div style={{
                fontSize: `${(15 - jaOffset) * scale}px`, fontWeight: 400, color: '#111111',
                lineHeight: `${20 * scale}px`,
                fontFamily: bannerFont,
              }}>
                {renderMixedText(clampedSub, 15, 1, undefined, true)}
              </div>
            </div>
            {/* Right image - 280×232px */}
            {currentBgImage ? (
              <div style={{
                width: `${280 * scale}px`, height: `${(variation.bannerHeight || 232) * scale}px`,
                flexShrink: 0, overflow: 'hidden',
              }}>
                <img src={currentBgImage} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div style={{
                width: `${280 * scale}px`, height: `${(variation.bannerHeight || 232) * scale}px`,
                flexShrink: 0, backgroundColor: '#E8EAF0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#999', fontSize: `${12 * scale}px` }}>280×232</span>
              </div>
            )}
          </div>
        );
      })() : isCompliance ? (
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
                  fontFamily: bannerFont,
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
                  fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                  fontFamily: bannerFont,
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
                  fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont,
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
                fontFamily: bannerFont
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
                fontFamily: bannerFont
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
                  fontFamily: bannerFont
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

const CustomLogo = ({ className = "h-8", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_195_2372" style={{maskType:'luminance'} as React.CSSProperties} maskUnits="userSpaceOnUse" x="1" y="2" width="20" height="19">
      <path d="M20.1797 2.32031H1.82031V20.6797H20.1797V2.32031Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_195_2372)">
      <path d="M20.1797 2.32031H1.82031V20.6797H20.1797V2.32031Z" fill="white"/>
      <path d="M10.5043 2.33395C15.5663 2.06016 19.892 5.94172 20.166 11.0038C20.4401 16.0659 16.5587 20.3917 11.4968 20.6661C6.43426 20.9403 2.10803 17.0586 1.83398 11.9961C1.55991 6.93378 5.44182 2.60775 10.5043 2.33395Z" fill="black"/>
      <path d="M10.8468 5.0636C12.8191 4.96615 14.6663 5.89958 15.938 7.37568C17.1217 8.74967 17.5504 10.5298 17.4264 12.3118C17.3842 12.9157 17.0927 13.5384 16.6244 13.9271C16.1947 14.2844 15.6403 14.4555 15.0841 14.4022C14.666 14.3588 14.269 14.1967 13.9401 13.9347C12.4566 12.7537 13.7529 11.3834 12.6406 10.0673C12.2639 9.62144 11.7241 9.34568 11.142 9.30186C10.565 9.25854 9.99435 9.4466 9.55617 9.82468C9.12032 10.2018 8.85252 10.7368 8.81176 11.3117C8.76746 11.8934 8.96029 12.4683 9.34645 12.9057C9.72459 13.3393 10.2615 13.6023 10.8359 13.6352C11.8264 13.6993 12.4398 13.451 13.3126 14.2156C14.1926 14.9867 14.2636 16.3216 13.4959 17.2017C13.0669 17.6938 12.4056 17.9195 11.7644 17.9571C9.86051 18.064 8.13901 17.5791 6.71405 16.3101C3.99835 13.8918 3.81562 9.70093 6.32796 7.06816C7.59609 5.73925 9.01084 5.15031 10.8468 5.0636Z" fill="white"/>
    </g>
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
            <ResponsiveBanner height={variation.bannerHeight || 216}>
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
  language: 'ko' | 'ja' | 'en' | 'tw',
  setLanguage: (lang: 'ko' | 'ja' | 'en' | 'tw') => void
}) {
  const [copies, setCopies] = useState<BannerCopy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<BannerCopy | null>(null);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const [manualHeadline, setManualHeadline] = useState(
    language === 'ja' ? '情報セキュリティ教育のご案内'
    : language === 'en' ? 'Information Security Training'
    : language === 'tw' ? '下半年必须信息安全教育指南'
    : '필수 정보 보안교육 안내'
  );
  const [manualSub, setManualSub] = useState(
    language === 'ja' ? '全従業員対象の必須教育です'
    : language === 'en' ? 'Mandatory training'
    : language === 'tw' ? '全體員工必修教育'
    : '모든 임직원 대상 필수 교육'
  );
  const [manualCta, setManualCta] = useState(language === 'ja' ? '詳細を見る' : language === 'tw' ? '了解更多' : 'Learn More');
  const [manualLabel, setManualLabel] = useState('EDUCATION');
  const [manualDate, setManualDate] = useState('');
  const [align, setAlign] = useState<'left' | 'center'>('left');
  const [showServicePreview, setShowServicePreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dynamicHeadlineSize, setDynamicHeadlineSize] = useState<number | null>(null);
  const headlineTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Title textarea: 내용에 따라 자동 높이 조절
  useEffect(() => {
    const ta = headlineTextareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(ta.scrollHeight, 50)}px`;
  }, [manualHeadline]);

  const koDefaults = ['필수 정보 보안교육 안내', 'FY2025 하반기 컴플라이언스 교육 안내'];
  const jaDefaults = ['情報セキュリティ教育のご案内', 'FY2025 下半期 コンプライアンス教育のご案内'];
  const enDefaults = ['Information Security Training', 'FY2025 Compliance Training Notice'];
  const twDefaults = ['下半年必须信息安全教育指南', 'FY2025 下半年合規教育通知'];
  const koSubDefaults = ['모든 임직원 대상 필수 교육', 'LINE+ 모든 임직원 대상 필수 교육입니다.'];
  const jaSubDefaults = ['全従業員対象の必須教育です', 'LINE+ 全従業員対象の必須教育です。'];
  const enSubDefaults = ['Mandatory training', 'Mandatory training'];
  const twSubDefaults = ['全體員工必修教育', 'LINE+ 全體員工必修課程。'];
  const allHeadlineDefaults = [...koDefaults, ...jaDefaults, ...enDefaults, ...twDefaults];
  const allSubDefaults = [...koSubDefaults, ...jaSubDefaults, ...enSubDefaults, ...twSubDefaults];

  useEffect(() => {
    setManualHeadline(
      language === 'ja' ? '情報セキュリティ教育のご案内'
      : language === 'en' ? 'Information Security Training'
      : language === 'tw' ? '下半年必须信息安全教育指南'
      : '필수 정보 보안교육 안내'
    );
    setManualSub(
      language === 'ja' ? '全従業員対象の必須教育です'
      : language === 'en' ? 'Mandatory training'
      : language === 'tw' ? '全體員工必修教育'
      : '모든 임직원 대상 필수 교육'
    );
    setManualCta(language === 'ja' ? '詳細を見る' : language === 'tw' ? '了解更多' : 'Learn More');
    setManualLabel('EDUCATION');
  }, [language]);

  const activeVariation = variations.find(v => v.id === activeVariationId) || variations[0];

  // Auto-select variation based on actual rendered line count (new-guide types only)
  const selectedCopyHeadline = selectedCopy?.headline || '';
  const activeVariationIdRef = useRef(activeVariationId);
  activeVariationIdRef.current = activeVariationId;
  useEffect(() => {
    let cancelled = false;
    const currentHeadline = mode === 'ai' ? selectedCopyHeadline : manualHeadline;
    if (!currentHeadline) return;
    const newGuideVariations = variations.filter(v => v.layoutType === 'new-guide');
    if (newGuideVariations.length === 0) return;
    const currentVariation = variations.find(v => v.id === activeVariationIdRef.current);
    const currentIsNewGuide = currentVariation?.layoutType === 'new-guide';
    if (!currentIsNewGuide) return;

    // Use exact same font-family as the banner renders with
    const langFont = language === 'ja'
      ? "'Pretendard JP', sans-serif"
      : language === 'tw'
      ? "'Noto Sans TC', 'PingFang TC', sans-serif"
      : "'LINE Seed Sans', 'LINESeedSansKR', sans-serif";

    // Use exact same font-weight as the banner (TW uses 800, others use 700)
    const langWeight = language === 'tw' ? 800 : 700;

    // Debounce: wait 150ms after last keystroke before measuring
    const timer = setTimeout(async () => {
      if (cancelled) return;

      // Wait for ALL fonts to be fully loaded
      try {
        await document.fonts.load(`${langWeight} 29px ${langFont}`);
      } catch (_) { /* fallback */ }
      await document.fonts.ready;
      if (cancelled) return;

      // Create a single reusable measurement div
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.visibility = 'hidden';
      // CENTER: 405px (335+35+35), LEFT: 740 - 280(image) - 54(paddingLeft) - 35(paddingRight) = 371px
      div.style.width = align === 'center' ? '405px' : '371px';
      div.style.fontFamily = langFont;
      div.style.fontWeight = String(langWeight);
      div.style.wordBreak = 'break-all';
      div.style.overflowWrap = 'break-word';
      div.style.whiteSpace = 'pre-wrap';
      div.textContent = currentHeadline;
      document.body.appendChild(div);

      // Force layout + wait one frame for font rendering
      void div.offsetHeight;
      await new Promise(r => requestAnimationFrame(r));
      if (cancelled) { document.body.removeChild(div); return; }

      // 줄수 측정 + 바이너리 서치 헬퍼 (같은 div 재사용)
      const measureAt = (fontSize: number, lineHeight: number) => {
        div.style.fontSize = `${fontSize}px`;
        div.style.lineHeight = `${lineHeight}px`;
        void div.offsetHeight;
        return Math.round(div.scrollHeight / lineHeight);
      };
      const binarySearch = (lo: number, hi: number, maxLines: number) => {
        while (hi - lo > 0.5) {
          const mid = (lo + hi) / 2;
          const lh = Math.round(mid * 1.31);
          if (measureAt(mid, lh) <= maxLines) lo = mid;
          else hi = mid;
        }
        return Math.floor(lo * 2) / 2; // 0.5px 단위 내림
      };

      const lines21 = measureAt(21, 28);
      const lines23 = measureAt(23, 30);
      const lines29 = lines23 <= 1 ? measureAt(29, 38) : 99;

      document.body.removeChild(div);
      if (cancelled) return;

      let targetTitle: string;
      let newDynamicSize: number | null = null;

      if (lines23 <= 1) {
        // Single Short: 23~29px 바이너리 서치로 1줄 최대 폰트
        targetTitle = 'Single Short';
        if (lines29 <= 1) {
          newDynamicSize = null; // 29px 기본값
        } else {
          // div가 이미 제거됐으므로 재생성
          const d2 = document.createElement('div');
          d2.style.cssText = div.style.cssText;
          d2.textContent = currentHeadline;
          document.body.appendChild(d2);
          const measureAt2 = (fs: number, lh: number) => {
            d2.style.fontSize = `${fs}px`; d2.style.lineHeight = `${lh}px`;
            void d2.offsetHeight;
            return Math.round(d2.scrollHeight / lh);
          };
          let lo = 23, hi = 29;
          while (hi - lo > 0.5) {
            const mid = (lo + hi) / 2;
            const lh = Math.round(mid * 1.31);
            if (measureAt2(mid, lh) <= 1) lo = mid; else hi = mid;
          }
          document.body.removeChild(d2);
          newDynamicSize = Math.floor(lo * 2) / 2;
        }
      } else if (lines21 <= 2) {
        // Two-line: 21~23px 바이너리 서치로 2줄 최대 폰트
        targetTitle = 'Two-line';
        if (lines23 <= 2) {
          newDynamicSize = null; // 23px 기본값
        } else {
          const d2 = document.createElement('div');
          d2.style.cssText = div.style.cssText;
          d2.textContent = currentHeadline;
          document.body.appendChild(d2);
          let lo = 21, hi = 23;
          while (hi - lo > 0.5) {
            const mid = (lo + hi) / 2;
            const lh = Math.round(mid * 1.31);
            d2.style.fontSize = `${mid}px`; d2.style.lineHeight = `${lh}px`;
            void d2.offsetHeight;
            if (Math.round(d2.scrollHeight / lh) <= 2) lo = mid; else hi = mid;
          }
          document.body.removeChild(d2);
          newDynamicSize = Math.floor(lo * 2) / 2;
        }
      } else {
        // Three-line: 21px 고정
        targetTitle = 'Three-line';
        newDynamicSize = null;
      }

      const target = newGuideVariations.find(v => v.title === targetTitle);
      if (target && target.id !== activeVariationIdRef.current) onSelectVariation(target.id);
      setDynamicHeadlineSize(newDynamicSize);
    }, 0);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [manualHeadline, mode, selectedCopyHeadline, language, align]);

  const bannerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!bannerRef.current) return;
    try {
      const bannerH = activeVariation.bannerHeight || 216;

      const dataUrl = await toPng(bannerRef.current, {
        cacheBust: true,
        width: 740,
        height: bannerH,
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: '740px',
          height: `${bannerH}px`,
          borderRadius: '0px',
          overflow: 'hidden',
        },
        onclone: (_doc: Document, cloned: HTMLElement) => {
          const all = [cloned, ...Array.from(cloned.querySelectorAll('*'))] as HTMLElement[];
          all.forEach(el => {
            el.style.setProperty('border-radius', '0px', 'important');
            el.style.setProperty('clip-path', 'none', 'important');
          });
        },
        filter: (node: HTMLElement) => {
          return !node.classList?.contains('banner-shadow-wrapper');
        }
      });

      const link = document.createElement('a');
      link.download = 'banner.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      setIsExporting(false);
      console.error('Failed to download image', err);
    }
  };

  const presetBackgrounds = [
    { id: 'none', label: 'None', url: '' },
    { id: 'sample1', label: 'Light Bulb', url: '/Sample1.png' },
    { id: 'sample2', label: 'DNA', url: '/Sample2.png' },
    { id: 'sample3', label: 'Cloud Docs', url: '/Sample3.png' },
    { id: 'sample4', label: 'Rocket', url: '/Sample4.png' },
    { id: 'sample5', label: 'Flag', url: '/Sample5.png' },
    { id: 'sample6', label: 'Target', url: '/Sample6.png' },
    { id: 'sample7', label: 'Arrow Rider', url: '/Sample7.png' },
    { id: 'sample8', label: 'Space Shuttle', url: '/Sample8.png' },
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

  const handleAICopy = async (lang: 'ko' | 'ja' | 'en' | 'tw') => {
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
      console.error('AI generation error:', err);
      setError('AI connection failed. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  // Removed the problematic useEffect that was causing redundant/incorrect AI copy generation on language change.

  return (
    <div className="min-h-screen md:h-screen bg-white font-sans text-black flex flex-col md:flex-row md:overflow-hidden">
      {/* Left Panel: Controls */}
      <aside className="sidebar-panel border-b md:border-r border-gray-200 bg-white flex flex-col z-20 shadow-lg">
        <header className="px-6 py-6 flex items-center" style={{ gap: '29.9px', height: '77px', borderBottom: '1px solid #E8E8E8' }}>
          <div className="flex items-center cursor-pointer" style={{ gap: '4px' }} onClick={onReset}>
            <CustomLogo style={{ width: '22px', height: '22px' }} />
            <span style={{ fontFamily: "'LINE Seed Sans', sans-serif", fontWeight: 700, fontSize: '20px', lineHeight: '28px', letterSpacing: '-0.45px', color: '#000000' }}>Creative Banner Studio</span>
          </div>
        </header>

        <div className="flex-1 md:overflow-y-auto custom-scrollbar" style={{ padding: '18px 24px 0px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* Mode Toggle */}
          <section>
            <div className="relative" style={{ width: '100%', height: '45px', background: '#F5F5F5', borderRadius: '50px' }}>
              <div
                className="absolute transition-all duration-200"
                style={{
                  width: 'calc(50% - 3px)', height: '39px', top: '3px',
                  left: mode === 'manual' ? '3px' : 'calc(50% + 0px)',
                  background: '#FFFFFF',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                  borderRadius: '50px',
                }}
              />
              <button
                onClick={() => { setMode('manual'); setCopies([]); setSelectedCopy(null); setPrompt(''); }}
                className="absolute"
                style={{
                  left: 0, top: 0, width: '50%', height: '45px',
                  fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '19px',
                  color: mode === 'manual' ? '#000000' : '#949494',
                  background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 1,
                }}
              >
                Editer
              </button>
              <button
                onClick={() => setMode('ai')}
                className="absolute"
                style={{
                  left: '50%', top: 0, width: '50%', height: '45px',
                  fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '19px',
                  color: mode === 'ai' ? '#000000' : '#949494',
                  background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 1,
                }}
              >
                AI Writer
              </button>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px', width: '100%', paddingBottom: '30px' }}>
          {mode === 'ai' ? (
            <>
              {/* Section 1: Contents */}
              <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="flex items-center justify-between">
                  <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '16px', color: '#1F1F1F' }}>Contents</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {loading && <RefreshCw size={14} className="animate-spin text-black" />}
                    <div className="flex items-start rounded-full" style={{ background: '#F5F5F5', padding: '2px', gap: '0.01px', width: '168px', height: '28px' }}>
                      {(['ko', 'ja', 'en', 'tw'] as const).map((lang, i) => (
                        <button key={lang}
                          onClick={() => { setLanguage(lang); setSelectedCopy(null); setCopies([]); setPrompt(''); }}
                          className="flex items-center justify-center rounded-full font-bold"
                          style={{ padding: '4px 10px', width: '40px', height: '24px', fontSize: '12px', lineHeight: '16px', color: language === lang ? '#000000' : '#949494', fontFamily: 'Pretendard, sans-serif', border: 'none', cursor: 'pointer', background: language === lang ? '#FFFFFF' : 'transparent', boxShadow: language === lang ? '0px 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                        >{['KR','JP','EN','TW'][i]}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={e => { setPrompt(e.target.value); setError(''); }}
                    placeholder="What are you announcing?"
                    className="w-full outline-none transition-all resize-none"
                    style={{
                      height: '128px',
                      padding: '16px',
                      border: '1px solid #E8E8E8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#1F1F1F',
                      fontFamily: 'Pretendard, sans-serif',
                      background: '#FFFFFF',
                    }}
                  />
                  <button 
                    onClick={() => handleAICopy(language)}
                    disabled={loading || !prompt.trim()}
                    className="absolute bg-black text-white p-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-30 transition-all shadow-lg" style={{ bottom: '16px', right: '12px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
                    </svg>
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
                    <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '16px', color: '#1F1F1F' }}>AI Copy Suggestions</h3>
                    <div className="space-y-3">
                      {copies.map((c, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setSelectedCopy(c);
                            onGenerate(c);
                          }}
                          style={{
                            position: 'relative',
                            padding: '20px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            border: selectedCopy?.headline === c.headline ? '1px solid #000000' : '1px solid #E8E8E8',
                            background: '#F9F9F9',
                            transition: 'border-color 0.15s',
                          }}
                        >
                          <div style={{ paddingRight: selectedCopy?.headline === c.headline ? '60px' : '0' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.3', margin: 0 }}>{c.headline}</h4>
                            <p style={{ fontSize: '11px', color: '#8D8D8D', marginTop: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{c.sub}</p>
                          </div>
                          {selectedCopy?.headline === c.headline && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setManualHeadline(c.headline);
                                setManualSub(c.sub);
                                setManualCta(c.cta || 'Learn More');
                                setManualLabel(c.label || 'Must Lead');
                                setMode('manual');
                              }}
                              style={{
                                position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '20px',
                                padding: '4px 10px', borderRadius: '20px', border: '1px solid #E8E8E8',
                                background: '#FFFFFF', fontSize: '11px', fontWeight: 600, color: '#333',
                                fontFamily: 'Pretendard, sans-serif', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}
                            >
                              Edit
                            </button>
                          )}
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
              <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Contents header with KO/JA toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '16px', color: '#1F1F1F', margin: 0 }}>Contents</h3>
                  <div className="flex items-start rounded-full" style={{ background: '#F5F5F5', padding: '2px', gap: '0.01px', width: '168px', height: '28px' }}>
                    {(['ko', 'ja', 'en', 'tw'] as const).map((lang, i) => (
                      <button key={lang}
                        onClick={() => { setLanguage(lang); setSelectedCopy(null); setCopies([]); setPrompt(''); }}
                        className="flex items-center justify-center rounded-full font-bold transition-all"
                        style={{ padding: '4px 10px', width: '40px', height: '24px', fontSize: '12px', lineHeight: '16px', color: language === lang ? '#000000' : '#949494', fontFamily: 'Pretendard, sans-serif', border: 'none', cursor: 'pointer', background: language === lang ? '#FFFFFF' : 'transparent', boxShadow: language === lang ? '0px 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                      >{['KR','JP','EN','TW'][i]}</button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const headlineMax = undefined;
                  const labelMax = activeVariation.layoutType === 'new-guide' ? 22 : undefined;
                  const subMax = activeVariation.layoutType === 'new-guide' ? 20 : undefined;
                  return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <label style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '12px', lineHeight: '15px', color: '#8D8D8D' }}>Title</label>
                      {headlineMax && <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: manualHeadline.length > headlineMax ? '#EF4444' : '#8D8D8D' }}>{manualHeadline.length}/{headlineMax}</span>}
                    </div>
                    <textarea
                      ref={headlineTextareaRef}
                      value={manualHeadline}
                      onChange={e => setManualHeadline(e.target.value)}
                      placeholder="Enter headline"
                      rows={1}
                      className="w-full outline-none transition-all resize-none"
                      style={{ padding: '16px', border: '1px solid #E8E8E8', borderRadius: '8px', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '18px', color: '#000000', background: 'white', boxSizing: 'border-box', overflow: 'hidden' }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <label style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '12px', lineHeight: '15px', color: '#8D8D8D' }}>Description</label>
                      {subMax && <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: manualSub.length > subMax ? '#EF4444' : '#8D8D8D' }}>{manualSub.length}/{subMax}</span>}
                    </div>
                    <input
                      type="text"
                      value={manualSub}
                      onChange={e => setManualSub(subMax ? e.target.value.slice(0, subMax) : e.target.value)}
                      placeholder="Enter sub-copy"
                      maxLength={subMax}
                      className="w-full outline-none transition-all"
                      style={{ padding: '16px', height: '52px', border: '1px solid #E8E8E8', borderRadius: '8px', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '18px', color: '#000000', background: 'white', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <label style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '12px', lineHeight: '15px', color: '#8D8D8D' }}>Sub title</label>
                      {labelMax && <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '11px', color: manualLabel.length > labelMax ? '#EF4444' : '#8D8D8D' }}>{manualLabel.length}/{labelMax}</span>}
                    </div>
                    <input
                      type="text"
                      value={manualLabel}
                      onChange={e => setManualLabel(labelMax ? e.target.value.slice(0, labelMax) : e.target.value)}
                      placeholder="e.g. Compliance"
                      maxLength={labelMax}
                      className="w-full outline-none transition-all"
                      style={{ padding: '16px', height: '52px', border: '1px solid #E8E8E8', borderRadius: '8px', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '18px', color: '#000000', background: 'white', boxSizing: 'border-box' }}
                    />
                  </div>
                  {(activeVariation.title === 'Type C' || activeVariation.title === 'Type C-2' || activeVariation.title === 'Type D') && (
                    <div>
                      <label style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '12px', lineHeight: '15px', color: '#8D8D8D', display: 'block', marginBottom: '8px' }}>Date</label>
                      <input
                        type="text"
                        value={manualDate}
                        onChange={e => setManualDate(e.target.value)}
                        placeholder="e.g. 2026.3.01 - 3.08"
                        className="w-full outline-none transition-all"
                        style={{ padding: '16px', height: '52px', border: '1px solid #E8E8E8', borderRadius: '8px', fontFamily: 'Pretendard, sans-serif', fontWeight: 500, fontSize: '15px', lineHeight: '18px', color: '#000000', background: 'white', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>
                  );
                })()}
              </section>
            </>
          )}

          {/* Section: Design Style - Left / Center */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '16px', color: '#1F1F1F' }}>Design Style</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {/* Left style card */}
              <div
                onClick={() => setAlign('left')}
                className="cursor-pointer transition-all w-full"
                style={{
                  borderRadius: '8px',
                  border: align === 'left' ? '1.5px solid #000000' : '1px solid #E8E8E8',
                  overflow: 'hidden',
                }}
              >
                <BannerThumbnail
                  variation={activeVariation}
                  headline={(mode === 'ai' && selectedCopy?.headline) || manualHeadline || (language === 'ja' ? '情報セキュリティ教育のご案内' : language === 'en' ? 'Information Security Training' : '필수 정보 보안교육 안내')}
                  sub={(mode === 'ai' && selectedCopy?.sub) || manualSub || (language === 'ja' ? '全従業員対象の必須教育です' : language === 'en' ? 'Mandatory training' : '모든 임직원 대상 필수 교육')}
                  ctaText={(mode === 'ai' && selectedCopy?.cta) || manualCta}
                  align="left"
                  label={(mode === 'ai' && selectedCopy?.label) || manualLabel}
                  date={(mode === 'ai' && selectedCopy?.date) || manualDate}
                  bgImage={bgImage}
                  language={language}
                />
              </div>
              {/* Center style card */}
              <div
                onClick={() => setAlign('center')}
                className="cursor-pointer transition-all w-full"
                style={{
                  borderRadius: '8px',
                  border: align === 'center' ? '1.5px solid #000000' : '1px solid #E8E8E8',
                  overflow: 'hidden',
                }}
              >
                <BannerThumbnail
                  variation={activeVariation}
                  headline={(mode === 'ai' && selectedCopy?.headline) || manualHeadline || (language === 'ja' ? '情報セキュリティ教育のご案内' : language === 'en' ? 'Information Security Training' : '필수 정보 보안교육 안내')}
                  sub={(mode === 'ai' && selectedCopy?.sub) || manualSub || (language === 'ja' ? '全従業員対象の必須教育です' : language === 'en' ? 'Mandatory training' : '모든 임직원 대상 필수 교육')}
                  ctaText={(mode === 'ai' && selectedCopy?.cta) || manualCta}
                  align="center"
                  label={(mode === 'ai' && selectedCopy?.label) || manualLabel}
                  date={(mode === 'ai' && selectedCopy?.date) || manualDate}
                  bgImage={''}
                  language={language}
                />
              </div>
            </div>
          </section>

          {/* Info: center alignment cannot use images */}
          {align === 'center' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '16px', color: '#1F1F1F', margin: 0 }}>Image</h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8D8D8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', lineHeight: '18px', color: '#8D8D8D' }}>
                  Center 타입은 이미지를 사용할 수 없습니다.
                </span>
              </div>
            </section>
          )}

          {/* Section: Thumbnail - only for Left alignment */}
          {!(activeVariation.layoutType === 'new-guide' && align === 'center') && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '16px', color: '#1F1F1F' }}>Image</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {presetBackgrounds.filter(bg => bg.id !== 'none').map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setBgImage(bg.url)}
                  className="overflow-hidden relative transition-all"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '6px',
                    border: bgImage === bg.url ? '1.5px solid #000000' : 'none',
                    background: '#F5F6F8',
                    padding: 0,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </section>
          )}

          </div>{/* end sections wrapper */}

        </div>

        <footer style={{ padding: '12px 24px 18px', background: '#FFFFFF', height: '83px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <button
            onClick={handleDownload}
            disabled={showVariations}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-30"
            style={{
              gap: '2px', height: '52px', padding: '16px 20px',
              background: '#000000', borderRadius: '9999px', border: 'none', cursor: 'pointer',
              boxShadow: '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4282 7.36914L8.97826 11.8191L4.52832 7.36914" stroke="white" strokeWidth="1.5" strokeMiterlimit="10"/>
              <path d="M8.97852 2.69922V11.8197" stroke="white" strokeWidth="1.5" strokeMiterlimit="10"/>
              <path d="M14.8046 14.7002H3.15869" stroke="white" strokeWidth="1.5" strokeMiterlimit="10"/>
            </svg>
            <span style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600, fontSize: '17px', lineHeight: '20px', color: '#FFFFFF', letterSpacing: '0' }}>Download</span>
          </button>
        </footer>
      </aside>

      {/* Right Panel: Live Preview */}
      <main className={`flex-1 relative bg-white flex flex-col items-center p-5 md:p-8 overflow-y-auto ${showVariations ? '' : 'md:justify-center'} custom-scrollbar min-h-screen md:h-full`}>
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div style={{ position: 'absolute', width: '616px', height: '480px', left: '-200px', top: '-160px', background: '#E8E8E8', opacity: 0.15, filter: 'blur(120px)', borderRadius: '9999px' }} />
          <div style={{ position: 'absolute', width: '616px', height: '480px', right: '-200px', bottom: '-160px', background: '#D1D5DC', opacity: 0.15, filter: 'blur(120px)', borderRadius: '9999px' }} />
        </div>

        <div className={`relative z-10 w-full max-w-5xl flex flex-col items-center ${showVariations ? '' : 'gap-4'}`}>
          {showVariations ? (
            <div className="w-full overflow-y-auto max-h-[80vh] custom-scrollbar pr-4">
              <VariationsView 
                onSelect={onSelectVariation}
                headline={selectedCopy?.headline || headline || (language === 'ja' ? '情報セキュリティ教育のご案内' : language === 'tw' ? '下半年必须信息安全教育指南' : language === 'en' ? 'Information Security Training' : '필수 정보 보안교육 안내')}
                sub={selectedCopy?.sub || sub || (language === 'ja' ? '全従業員対象の必須教育です' : language === 'tw' ? '全體員工必修教育' : language === 'en' ? 'Mandatory training' : '모든 임직원 대상 필수 교육')}
                cta={selectedCopy?.cta || cta}
                align={align}
                variations={variations}
                bgImage={bgImage}
                language={language}
              />
            </div>
          ) : (
            <>
              <div className="relative mt-2 md:mt-4 w-full px-0 md:px-4">
                <div className="py-2" style={{ width: '80%', margin: '0 auto' }}>
                    <ResponsiveBanner height={activeVariation.bannerHeight || 216}>
                      <div ref={bannerRef}>
                        <BannerCanvas
                          variation={activeVariation}
                          headline={selectedCopy?.headline || headline || (language === 'ja' ? '情報セキュリティ教育のご案内' : language === 'tw' ? '下半年必须信息安全教育指南' : language === 'en' ? 'Information Security Training' : '필수 정보 보안교육 안내')}
                          sub={selectedCopy?.sub || sub || (language === 'ja' ? '全従業員対象の必須教育です' : language === 'tw' ? '全體員工必修教育' : language === 'en' ? 'Mandatory training' : '모든 임직원 대상 필수 교육')}
                          ctaText={selectedCopy?.cta || cta}
                          label={selectedCopy?.label || manualLabel}
                          date={selectedCopy?.date}
                          align={align}
                          bgImage={bgImage}
                          className="w-full max-w-full h-auto"
                          tilt={true}
                          language={language}
                          noRadius={isExporting}
                          overrideHeadlineSize={dynamicHeadlineSize}
                        />
                      </div>
                    </ResponsiveBanner>
                  </div>
                </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex justify-center mt-8 md:mt-16"
              >
                <WebsitePreview language={language}>
                  <ResponsiveBanner height={activeVariation.bannerHeight || 216}>
                    <BannerCanvas
                      variation={activeVariation}
                      headline={selectedCopy?.headline || headline || (language === 'ja' ? '情報セキュリティ教育のご案内' : language === 'tw' ? '下半年必须信息安全教育指南' : language === 'en' ? 'Information Security Training' : '필수 정보 보안교육 안내')}
                      sub={selectedCopy?.sub || sub || (language === 'ja' ? '全従業員対象の必須教育です' : language === 'tw' ? '全體員工必修教育' : language === 'en' ? 'Mandatory training' : '모든 임직원 대상 필수 교육')}
                      ctaText={selectedCopy?.cta || cta}
                      label={selectedCopy?.label || manualLabel}
                      date={selectedCopy?.date}
                      scale={1}
                      align={align}
                      bgImage={bgImage}
                      className="w-full h-full shadow-none"
                      tilt={false}
                      language={language}
                      overrideHeadlineSize={dynamicHeadlineSize}
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
          headline={selectedCopy?.headline || headline || (language === 'ja' ? '情報セキュリティ教育のご案内' : language === 'tw' ? '下半年必须信息安全教育指南' : language === 'en' ? 'Information Security Training' : '필수 정보 보안교육 안내')}
          sub={selectedCopy?.sub || sub || (language === 'ja' ? '全従業員対象の必須教育です' : language === 'tw' ? '全體員工必修教育' : language === 'en' ? 'Mandatory training' : '모든 임직원 대상 필수 교육')}
          ctaText={selectedCopy?.cta || cta}
          label={selectedCopy?.label || manualLabel}
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

const WebsitePreview = ({ children, language }: { children: React.ReactNode, language: 'ko' | 'ja' | 'en' | 'tw' }) => {
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

function VariationsView({ onSelect, headline, sub, cta, align, variations, bgImage, language }: { onSelect: (id: number) => void, headline: string, sub: string, cta: string, align?: 'left' | 'center', variations: DesignVariation[], bgImage?: string | undefined, language: 'ko' | 'ja' | 'en' | 'tw' }) {
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
              <ResponsiveBanner height={v.bannerHeight || 216}>
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

function EditorView({ onBack, variation, initialCopy, bgImage, setBgImage, language }: { onBack: () => void, variation: DesignVariation, initialCopy: BannerCopy | null, bgImage: string | undefined, setBgImage: (v: string | undefined) => void, language: 'ko' | 'ja' | 'en' | 'tw' }) {
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
    { id: 'sample1', label: 'Light Bulb', url: '/Sample1.png' },
    { id: 'sample2', label: 'DNA', url: '/Sample2.png' },
    { id: 'sample3', label: 'Cloud Docs', url: '/Sample3.png' },
    { id: 'sample4', label: 'Rocket', url: '/Sample4.png' },
    { id: 'sample5', label: 'Flag', url: '/Sample5.png' },
    { id: 'sample6', label: 'Target', url: '/Sample6.png' },
    { id: 'sample7', label: 'Arrow Rider', url: '/Sample7.png' },
    { id: 'sample8', label: 'Space Shuttle', url: '/Sample8.png' },
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
                    className={`aspect-square rounded-xl border-2 transition-all overflow-hidden relative border-black`}
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
                    className={`aspect-square rounded-xl border-2 transition-all overflow-hidden relative ${
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
            <ResponsiveBanner baseScale={0.9} height={variation.bannerHeight || 216}>
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
  const [selectedVariationId, setSelectedVariationId] = useState<number>(10);
  const [activeCopy, setActiveCopy] = useState<BannerCopy | null>(null);
  const [showVariations, setShowVariations] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bgImage, setBgImage] = useState<string | undefined>('/Sample1.png');
  const [language, setLanguage] = useState<'ko' | 'ja' | 'en' | 'tw'>(() => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hant') || browserLang.startsWith('zh-hk')) return 'tw';
    if (browserLang.startsWith('en')) return 'en';
    return 'en'; // 지원하지 않는 언어는 EN으로 기본값
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
      <Analytics />
    </>
  );
}
