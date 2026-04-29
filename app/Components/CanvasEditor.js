'use client';
import { useEffect, useRef, useState } from 'react';

const FONTS = ['Space Grotesk', 'Bebas Neue', 'Fira Code', 'Syne', 'DM Sans', 'JetBrains Mono'];

export default function CanvasEditor({ carouselData, photos, onBack }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [font, setFont] = useState('Bebas Neue');
  const [headlineColor, setHeadlineColor] = useState('#ffffff');
  const [bodyColor, setBodyColor] = useState('#eeeeee');
  const [fontSize, setFontSize] = useState(52);
  const [imageScale, setImageScale] = useState(120);
  const [copied, setCopied] = useState(false);

  if (!carouselData?.slides?.length) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Loading...</div>;
  }

  const slide = carouselData.slides[currentSlide];
  const photo = photos[currentSlide % photos.length];
  const totalSlides = carouselData.slides.length;

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await document.fonts.ready;
      const { Canvas, FabricImage, Textbox } = await import('fabric');
      if (!isMounted) return;

      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }

      const W = 540;
      const H = 675;
      canvasRef.current.width = W;
      canvasRef.current.height = H;

      const canvas = new Canvas(canvasRef.current, {
        width: W, height: H, backgroundColor: '#000000',
      });
      fabricRef.current = canvas;

      if (photo) {
        const url = URL.createObjectURL(photo);
        const img = await FabricImage.fromURL(url);
        const scaleW = W / img.width;
        const scaleH = H / img.height;
        const baseScale = Math.max(scaleW, scaleH);
        const scale = baseScale * (imageScale / 100);

        img.set({
          scaleX: scale, scaleY: scale,
          left: W / 2,
          top: H / 2,
          originX: 'center',
          originY: 'center',
          selectable: true, evented: true,
          hasControls: false, hasBorders: false,
          lockRotation: true, lockScalingX: true, lockScalingY: true,
        });
        canvas.add(img);
        canvas.sendObjectToBack(img);
      }

      // Headline — centered, no shadow
      canvas.add(new Textbox(slide.headline.toUpperCase(), {
        left: W / 2,
        top: H * 0.68,
        width: W - 60,
        originX: 'center',
        fontSize: fontSize,
        fontFamily: font,
        fill: headlineColor,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 1.05,
        selectable: true,
        evented: true,
      }));

      // Body — centered
      canvas.add(new Textbox(slide.body, {
        left: W / 2,
        top: H * 0.85,
        width: W - 60,
        originX: 'center',
        fontSize: 18,
        fontFamily: font,
        fill: bodyColor,
        textAlign: 'center',
        lineHeight: 1.5,
        opacity: 0.9,
        selectable: true,
        evented: true,
      }));

      if (currentSlide < totalSlides - 1) {
        canvas.add(new Textbox('swipe →', {
          left: W / 2,
          top: H - 24,
          width: 160,
          originX: 'center',
          fontSize: 13,
          fontFamily: font,
          fill: '#ffffff',
          opacity: 0.5,
          textAlign: 'center',
          selectable: false,
          evented: false,
        }));
      }

      canvas.renderAll();
    };
    init();
    return () => { isMounted = false; };
  }, [currentSlide, font, headlineColor, bodyColor, fontSize, imageScale]);

  const downloadSlide = () => {
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    const dataURL = fabricRef.current.toDataURL({ format: 'png', multiplier: 1 });
    const a = document.createElement('a');
    a.download = `slide-${currentSlide + 1}.png`;
    a.href = dataURL;
    a.click();
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(carouselData.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={s.wrap}>

      {/* Topbar */}
      <div style={s.topbar}>
        <button onClick={onBack} style={s.backBtn}>← Back</button>
        <h1 style={s.title}>EDIT YOUR CAROUSEL</h1>
      </div>
      <p style={s.hint}>Drag image to reposition · Drag text to move · Zoom slider to resize</p>

      <div style={s.body}>

        {/* Slide counter outside canvas */}
        <div style={{ textAlign: 'right', fontSize: 13, color: '#888', marginBottom: 6 }}>
          {currentSlide + 1} / {totalSlides}
        </div>

        {/* Canvas */}
        <canvas ref={canvasRef} style={s.canvas} />

        {/* Slide dots */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {carouselData.slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{
              ...s.dot,
              background: i === currentSlide ? '#fff' : '#1a1a1a',
              color: i === currentSlide ? '#000' : '#888',
              border: `1px solid ${i === currentSlide ? '#fff' : '#444'}`,
            }}>{i + 1}</button>
          ))}
        </div>

        {/* Download */}
        <button onClick={downloadSlide} style={s.dlBtn}>Download slide ↓</button>

        <hr style={s.divider} />

        {/* Slide info */}
        <div style={s.card}>
          <p style={s.secLabel}>{slide.type?.toUpperCase()} · SLIDE {currentSlide + 1}</p>
          <p style={s.bigTitle}>{slide.headline}</p>
          <p style={s.sub}>{slide.body}</p>
        </div>

        <hr style={s.divider} />

        {/* Image zoom */}
        <div style={s.ctrlRow}>
          <span style={s.ctrlLabel}>Image zoom</span>
          <span style={s.ctrlLabel}>{imageScale}%</span>
        </div>
        <input type="range" min={100} max={200} value={imageScale}
          onChange={e => setImageScale(Number(e.target.value))} style={s.range} />

        {/* Font */}
        <p style={{ ...s.ctrlLabel, marginTop: 14, marginBottom: 6 }}>Font</p>
        <select value={font} onChange={e => setFont(e.target.value)} style={s.select}>
          {FONTS.map(f => <option key={f}>{f}</option>)}
        </select>

        {/* Headline size */}
        <div style={s.ctrlRow}>
          <span style={s.ctrlLabel}>Headline size</span>
          <span style={s.ctrlLabel}>{fontSize}px</span>
        </div>
        <input type="range" min={20} max={80} value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))} style={s.range} />

        {/* Colors */}
        <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
          <div>
            <p style={{ ...s.ctrlLabel, marginBottom: 6 }}>Headline color</p>
            <input type="color" value={headlineColor}
              onChange={e => setHeadlineColor(e.target.value)} style={s.colorPicker} />
          </div>
          <div>
            <p style={{ ...s.ctrlLabel, marginBottom: 6 }}>Body color</p>
            <input type="color" value={bodyColor}
              onChange={e => setBodyColor(e.target.value)} style={s.colorPicker} />
          </div>
        </div>

        <hr style={s.divider} />

        {/* Best time to post */}
        <p style={s.secLabel}>Best time to post</p>
        <div style={s.timeGrid}>
          {[
            { day: 'Wednesday ★', time: carouselData.best_time || '6–9 pm', best: true },
            { day: 'Friday', time: '5–8 pm' },
            { day: 'Saturday', time: '10–12 pm' },
            { day: 'Sunday', time: '7–9 pm' },
          ].map((t, i) => (
            <div key={i} style={{ ...s.timeCard, ...(t.best ? s.timeCardBest : {}) }}>
              <p style={{ fontSize: 10, color: t.best ? '#e8356b' : '#888', marginBottom: 2 }}>{t.day}</p>
              <p style={s.timeVal}>{t.time}</p>
            </div>
          ))}
        </div>

        <hr style={s.divider} />

        {/* Predicted engagement */}
        <p style={s.secLabel}>Predicted engagement</p>
        <div style={s.engRow}>
          {[
            { n: '8.4%', label: 'Reach', g: '↑ +2.1%' },
            { n: '3.2%', label: 'Saves', g: '↑ avg' },
            { n: '1.8%', label: 'Shares', g: '↑ +0.4%' },
          ].map((e, i) => (
            <div key={i} style={s.engCard}>
              <p style={s.engN}>{e.n}</p>
              <p style={s.engL}>{e.label}</p>
              <p style={s.engG}>{e.g}</p>
            </div>
          ))}
        </div>

        <hr style={s.divider} />

        {/* Hook tip */}
        <p style={s.secLabel}>Hook tip</p>
        <p style={s.tipText}>{carouselData.hook_tip || 'Bold single-word hooks with high-contrast color drive 3× more swipe-throughs than question hooks.'}</p>

        <hr style={s.divider} />

        {/* Hashtags */}
        <p style={s.secLabel}>Hashtag suggestions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {(carouselData.hashtags || ['#coding', '#learnToCode', '#tech', '#developer', '#programming', '#webdev']).map((tag, i) => (
            <span key={i} style={{ ...s.tag, ...(i < 3 ? s.tagOn : {}) }}>{tag}</span>
          ))}
        </div>

        <hr style={s.divider} />

        {/* Caption */}
        <p style={s.secLabel}>Instagram caption</p>
        <p style={s.capText}>{carouselData.caption}</p>
        <button onClick={copyCaption} style={s.copyBtn}>
          {copied ? 'Copied! ✅' : 'Copy caption'}
        </button>

        <hr style={s.divider} />

        {/* Slide structure */}
        <p style={s.secLabel}>Slide structure</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, marginBottom: 40 }}>
          {carouselData.slides.map((sl, i) => (
            <div key={i} onClick={() => setCurrentSlide(i)} style={{
              ...s.slideRow,
              ...(i === currentSlide ? s.slideRowActive : {}),
            }}>
              <span style={s.slideNum}>{i + 1}</span>
              <span style={s.slideName}>{sl.headline}</span>
              <span style={s.slideType}>{sl.type}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const s = {
  wrap: { background: '#0d0d0d', color: '#fff', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' },
  topbar: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: '1px solid #222' },
  backBtn: { background: '#1c1c1c', border: '1px solid #333', color: '#ccc', padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer' },
  title: { fontSize: 20, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' },
  hint: { fontSize: 11, color: '#555', padding: '6px 18px' },
  body: { maxWidth: 600, margin: '0 auto', padding: '16px 20px' },
  canvas: { borderRadius: 12, display: 'block', width: '100%', height: 'auto' },
  dot: { width: 30, height: 30, borderRadius: '50%', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dlBtn: { marginTop: 10, width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  divider: { border: 'none', borderTop: '1px solid #1e1e1e', margin: '20px 0' },
  card: { background: '#1a1a1a', borderRadius: 10, padding: '14px 16px' },
  secLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#666', textTransform: 'uppercase', marginBottom: 6 },
  bigTitle: { fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#999', lineHeight: 1.5 },
  ctrlRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4, marginTop: 14 },
  ctrlLabel: { fontSize: 11, color: '#888' },
  range: { width: '100%', accentColor: '#e8356b' },
  select: { width: '100%', background: '#1c1c1c', border: '1px solid #2e2e2e', color: '#fff', borderRadius: 7, padding: '7px 10px', fontSize: 12, cursor: 'pointer' },
  colorPicker: { width: 50, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer' },
  timeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 },
  timeCard: { background: '#1a1a1a', borderRadius: 7, padding: '8px 10px' },
  timeCardBest: { border: '1px solid rgba(232,53,107,0.4)' },
  timeVal: { fontSize: 13, fontWeight: 700, color: '#fff' },
  engRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 6 },
  engCard: { background: '#1a1a1a', borderRadius: 7, padding: 8, textAlign: 'center' },
  engN: { fontSize: 16, fontWeight: 800, color: '#fff' },
  engL: { fontSize: 10, color: '#888', marginTop: 1 },
  engG: { fontSize: 10, color: '#4caf50' },
  tipText: { fontSize: 13, color: '#bbb', lineHeight: 1.6 },
  tag: { background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#999' },
  tagOn: { background: 'rgba(232,53,107,0.1)', borderColor: 'rgba(232,53,107,0.4)', color: '#e8356b' },
  capText: { fontSize: 13, color: '#bbb', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  copyBtn: { marginTop: 10, width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: 7, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  slideRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 6, padding: '7px 10px', cursor: 'pointer' },
  slideRowActive: { border: '1px solid rgba(232,53,107,0.4)' },
  slideNum: { fontSize: 10, color: '#666', width: 14 },
  slideName: { fontSize: 12, color: '#ccc', flex: 1 },
  slideType: { fontSize: 10, color: '#888' },
};