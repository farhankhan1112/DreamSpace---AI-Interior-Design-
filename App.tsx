
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/Button';
import { DESIGN_STYLES } from './constants';
import { AppStep, DesignStyle, DesignTransformation, AspectRatio } from './types';
import { analyzeRoom, getDesignTransformation, generateRenderedImage } from './geminiService';
import { Navbar } from './components/Navbar';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('Modern');
  const [customIdeas, setCustomIdeas] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [transformation, setTransformation] = useState<DesignTransformation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'before' | 'after'>('after');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setStep(AppStep.EDITING);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    setStep(AppStep.GENERATING);
    
    try {
      const analysis = await analyzeRoom(originalImage);
      const designDetails = await getDesignTransformation(selectedStyle, analysis, customIdeas);
      const renderedImage = await generateRenderedImage(originalImage, designDetails, analysis, customIdeas, aspectRatio);
      
      setTransformation({
        ...designDetails,
        generatedImageBase64: renderedImage
      });
      setStep(AppStep.RESULT);
      setShowModal(true);
      setViewMode('after');
    } catch (err) {
      console.error(err);
      setStep(AppStep.EDITING);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep(AppStep.IDLE);
    setOriginalImage(null);
    setTransformation(null);
    setCustomIdeas('');
    setAspectRatio('1:1');
    setShowModal(false);
  };

  const downloadImage = () => {
    if (!transformation?.generatedImageBase64) return;
    const link = document.createElement('a');
    link.href = transformation.generatedImageBase64;
    link.download = `dreamspace-${selectedStyle.toLowerCase()}-design.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const StyleIcon = ({ id }: { id: string }) => {
    const icons: Record<string, React.ReactNode> = {
      Modern: <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z" />,
      Minimalist: <path d="M4 8h16M4 12h16M4 16h16" />,
      Rustic: <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5V19H6v-9l6-4.5zM9 13h6v2H9v-2z" />,
      Luxury: <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-5-6.5 5 2-7.5L2 9h7l3-7z" />,
      Bohemian: <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
      Industrial: <path d="M3 21h18v-2H3v2zM5 19h2v-7H5v7zm4 0h2V9H9v10zm4 0h2V5h-2v14zm4 0h2v-7h-2v7z" />,
      Coastal: <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.84L18.16 11H17v7H7v-7H5.84L12 7.84z" />,
      Scandinavian: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    };
    return (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {icons[id] || icons.Modern}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1016] text-[#1a1c2e] dark:text-gray-100 transition-colors duration-500">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 1. Upload Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1a1c2e] dark:text-white">Upload Your Room Photo</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[4/3] rounded-3xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-[#161720]/50 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-[#6366f1] dark:hover:border-[#6366f1] group shadow-sm`}
            >
              {originalImage ? (
                <img src={originalImage} className="w-full h-full object-cover" alt="Uploaded Room" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-zinc-800 dark:text-gray-200 font-bold">Upload Room</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            {originalImage && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="block mx-auto text-[#6366f1] font-bold text-sm hover:underline"
              >
                Change Photo
              </button>
            )}
          </section>

          {/* 2. Style Selection Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1a1c2e] dark:text-white">Choose a Style</h2>
            <div className="grid grid-cols-3 gap-3">
              {DESIGN_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id as DesignStyle)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedStyle === style.id 
                      ? 'border-[#6366f1] bg-[#f5f6ff] dark:bg-[#6366f1]/20 text-[#6366f1]' 
                      : 'border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#161720] text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <StyleIcon id={style.id} />
                  <span className={`mt-2 font-bold text-xs ${selectedStyle === style.id ? 'text-[#1a1c2e] dark:text-white' : ''}`}>
                    {style.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 3. Add Your Own Ideas */}
        <section className="mt-12 space-y-4 pt-8 border-t border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-[#1a1c2e] dark:text-white">Add Your Own Ideas (Optional)</h2>
          <textarea
            value={customIdeas}
            onChange={(e) => setCustomIdeas(e.target.value)}
            placeholder="E.g., Add a yellow lamp on the left corner and the TV should be on the middle wall..."
            className="w-full h-32 p-4 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#161720] focus:border-[#6366f1] outline-none transition-colors font-medium text-zinc-800 dark:text-zinc-200 resize-none"
          />
        </section>

        {/* 4. Choose Aspect Ratio */}
        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-bold text-[#1a1c2e] dark:text-white">Choose Aspect Ratio</h2>
          <div className="grid grid-cols-5 gap-3">
            {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${
                  aspectRatio === ratio 
                    ? 'border-[#6366f1] bg-[#f5f6ff] dark:bg-[#6366f1]/20 text-[#6366f1]' 
                    : 'border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#161720] text-zinc-500 hover:border-gray-300'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </section>

        {/* Generate Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleGenerate}
            disabled={!originalImage || isProcessing}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#6366f1] text-white px-16 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-[#5254d8] hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Magic...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M11.5 2C11.5 1.44772 11.9477 1 12.5 1C13.0523 1 13.5 1.44772 13.5 2V4C13.5 4.55228 13.0523 5 12.5 5C11.9477 5 11.5 4.55228 11.5 4V2ZM19.0711 5.92893C19.4616 5.53841 20.0948 5.53841 20.4853 5.92893C20.8758 6.31946 20.8758 6.95262 20.4853 7.34315L19.0711 8.75736C18.6805 9.14788 18.0474 9.14788 17.6569 8.75736C17.2663 8.36683 17.2663 7.73367 17.6569 7.34315L19.0711 5.92893ZM22.5 11.5C23.0523 11.5 23.5 11.9477 23.5 12.5C23.5 13.0523 23.0523 13.5 22.5 13.5H20.5C19.9477 13.5 19.5 13.0523 19.5 12.5C19.5 11.9477 19.9477 11.5 20.5 11.5H22.5ZM20.4853 19.0711C20.8758 19.4616 20.8758 20.0948 20.4853 20.4853C20.0948 20.8758 19.4616 20.8758 19.0711 20.4853L17.6569 19.0711C17.2663 18.6805 17.2663 18.0474 17.6569 17.6569C18.0474 17.2663 18.6805 17.2663 19.0711 17.6569L20.4853 19.0711ZM12.5 23.5C11.9477 23.5 11.5 23.0523 11.5 22.5V20.5C11.5 19.9477 11.9477 19.5 12.5 19.5C13.0523 19.5 13.5 19.9477 13.5 20.5V22.5C13.5 23.0523 13.0523 23.5 12.5 23.5ZM5.92893 20.4853C5.53841 20.8758 4.90524 20.8758 4.51472 20.4853C4.1242 20.0948 4.1242 19.4616 4.51472 19.0711L5.92893 17.6569C6.31946 17.2663 6.95262 17.2663 7.34315 17.6569C7.73367 18.0474 7.73367 18.6805 7.34315 19.0711L5.92893 20.4853ZM1.5 12.5C1.5 11.9477 1.94772 11.5 2.5 11.5H4.5C5.05228 11.5 5.5 11.9477 5.5 12.5C5.5 13.0523 5.05228 13.5 4.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5ZM4.51472 5.92893C4.90524 5.53841 5.53841 5.53841 5.92893 5.92893L7.34315 7.34315C7.73367 7.73367 7.73367 8.36683 7.34315 8.75736C6.95262 9.14788 6.31946 9.14788 5.92893 8.75736L4.51472 7.34315C4.1242 6.95262 4.1242 6.31946 4.51472 5.92893Z"/>
                </svg>
                Generate My New Room!
              </>
            )}
          </button>
        </div>
      </main>

      {/* Result Modal */}
      {showModal && transformation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a1c2e] w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[92vh] border border-white/10">
            
            {/* Left side: Image View */}
            <div className="flex-[1.5] relative bg-[#0f1016] flex flex-col group/img">
              <div className="absolute top-8 left-8 z-10 flex gap-3">
                <div className="bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-white text-xs font-black uppercase tracking-widest border border-white/20 shadow-xl">
                  {viewMode === 'after' ? 'AI Redesign' : 'Original Photo'}
                </div>
              </div>
              
              <img 
                src={viewMode === 'after' ? transformation.generatedImageBase64 : originalImage!} 
                className="w-full h-full object-contain" 
                alt="Transformation View" 
              />

              {/* View Toggle - Floating */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] p-1.5 border border-white/20 shadow-2xl">
                <button 
                  onClick={() => setViewMode('before')}
                  className={`px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all duration-300 ${viewMode === 'before' ? 'bg-white text-black shadow-xl' : 'text-white hover:bg-white/10'}`}
                >
                  Original
                </button>
                <button 
                  onClick={() => setViewMode('after')}
                  className={`px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all duration-300 ${viewMode === 'after' ? 'bg-[#6366f1] text-white shadow-xl shadow-[#6366f1]/40' : 'text-white hover:bg-white/10'}`}
                >
                  {selectedStyle} AI
                </button>
              </div>
            </div>

            {/* Right side: Sidebar Details */}
            <div className="w-full md:w-[400px] p-10 overflow-y-auto flex flex-col dark:bg-[#1a1c2e] bg-white border-l border-zinc-100 dark:border-zinc-800/50">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-[#1a1c2e] dark:text-white leading-tight">Transformation Complete</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-[#6366f1] rounded-full animate-pulse"></span>
                    <p className="text-[#6366f1] font-bold uppercase text-xs tracking-widest">{selectedStyle} Style</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all text-zinc-500 dark:text-zinc-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8 flex-1">
                <div className="bg-zinc-50/50 dark:bg-zinc-800/20 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-2">Color Palette</h4>
                  <p className="text-zinc-800 dark:text-zinc-200 font-bold leading-relaxed">{transformation.colorPalette}</p>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-4">Core Elements</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {transformation.furnitureRecommendations.map((item, i) => (
                      <span key={i} className="px-4 py-2 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-extrabold text-zinc-700 dark:text-zinc-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-2">Lighting & Ambiance</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">{transformation.lightingPlan}</p>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-700">
                  <p className="text-zinc-800 dark:text-zinc-200 italic text-sm leading-relaxed font-serif">
                    &ldquo;{transformation.summary}&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-4 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <Button onClick={downloadImage} className="w-full py-5 text-lg bg-[#6366f1] group">
                  <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Design
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setShowModal(false)} variant="secondary" className="py-4 text-sm font-black border-zinc-200 dark:border-zinc-700">
                    Keep Editing
                  </Button>
                  <Button onClick={reset} variant="outline" className="py-4 text-sm font-black border-zinc-200 dark:border-zinc-700 dark:text-white">
                    Start New
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 h-40 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] gap-4">
        <div className="w-12 h-px bg-zinc-200 dark:bg-zinc-800"></div>
        &copy; 2024 DreamSpace AI &bull; Interior Visualizer
      </footer>
    </div>
  );
};

export default App;
