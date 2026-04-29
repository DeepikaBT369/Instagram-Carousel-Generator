'use client';
import { useState } from 'react';
import CanvasEditor from './components/CanvasEditor';

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    niche: '',
    audience: '',
    tone: 'Inspirational',
    slides: 7,
    goal: '',
  });
  const [photos, setPhotos] = useState([]);
  const [carouselData, setCarouselData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const generate = async () => {
    if (!formData.niche || photos.length === 0) {
      alert('Please enter your niche and upload at least one photo!');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('formData', JSON.stringify(formData));
    photos.forEach((p) => fd.append('photos', p));
    const res = await fetch('/api/generate', { method: 'POST', body: fd });
    const data = await res.json();
    setCarouselData(data);
    setLoading(false);
    setStep(2);
  };

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      {step === 1 && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontFamily: 'Bebas Neue', letterSpacing: 2, marginBottom: 8 }}>
            CAROUSEL AI
          </h1>
          <p style={{ color: '#888', marginBottom: 32 }}>
            Upload your photos, enter your niche — AI does the rest.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Your niche</label>
              <input
                type="text"
                placeholder="e.g. coding journey, fitness, travel, fashion"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Target audience</label>
              <input
                type="text"
                placeholder="e.g. college students, busy moms, beginners"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                style={inputStyle}
              >
                <option>Inspirational</option>
                <option>Educational</option>
                <option>Conversational</option>
                <option>Bold & Provocative</option>
                <option>Warm & Nurturing</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Number of slides</label>
              <select
                value={formData.slides}
                onChange={(e) => setFormData({ ...formData, slides: e.target.value })}
                style={inputStyle}
              >
                <option value={5}>5 slides</option>
                <option value={7}>7 slides</option>
                <option value={10}>10 slides</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Goal (optional)</label>
              <input
                type="text"
                placeholder="e.g. grow followers, get saves, sell my course"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>
                Upload your photos ({photos.length} selected)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotos}
                style={{ color: '#fff' }}
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              style={btnStyle}
            >
              {loading ? 'AI is thinking... ✨' : 'Generate my carousel 🚀'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && carouselData && (
        <CanvasEditor carouselData={carouselData} photos={photos} onBack={() => setStep(1)} />
      )}
    </main>
  );
}

const inputStyle = {
  width: '100%',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: 8,
  padding: '12px 16px',
  color: '#fff',
  fontSize: 15,
};

const btnStyle = {
  background: '#fff',
  color: '#000',
  border: 'none',
  borderRadius: 8,
  padding: '14px',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 8,
};