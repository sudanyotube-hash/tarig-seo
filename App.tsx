import React, { useState, useEffect } from 'react';
import { generateSEO, generateMarketingCopy, generateTitles, generateDescription, analyzeVideoPerformance } from './services/geminiService';
import { VideoCategory, SEOResponse, MarketingCopyResponse, Language, PerformanceResponse } from './types';
import { SparklesIcon, CopyIcon, CheckIcon, YoutubeIcon, RefreshIcon, ImageIcon, ChartIcon } from './components/Icons';
import { AdProvider, useAds, AdDashboard, AdUnit } from './components/AdSystem';

// --- UI Components ---

const Button = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false, 
  className = '' 
}: { 
  onClick?: () => void; 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; 
  disabled?: boolean;
  className?: string;
}) => {
  const baseStyles = "rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 disabled:opacity-50",
    secondary: "px-6 py-3 bg-yt-paper hover:bg-yt-hover text-white border border-gray-700 disabled:opacity-50",
    outline: "px-4 py-2 border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white disabled:opacity-50 disabled:hover:border-gray-600 disabled:hover:text-gray-300",
    ghost: "px-3 py-1 text-gray-400 hover:text-white hover:bg-white/10"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const TabButton = ({ 
  active, 
  onClick, 
  children, 
  icon 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode; 
  icon?: React.ReactNode; 
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border-b-2 ${
      active 
      ? 'border-red-600 text-white bg-white/5' 
      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`}
  >
    {icon}
    {children}
  </button>
);

const Card = ({ 
  title, 
  children, 
  className = '', 
  action 
}: { 
  title?: string; 
  children?: React.ReactNode; 
  className?: string; 
  action?: React.ReactNode; 
}) => (
  <div className={`bg-yt-paper border border-gray-800 rounded-2xl p-6 shadow-xl ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-1 h-6 bg-red-600 rounded-full"></div>
            {title}
          </h3>
        )}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      title="نسخ النص"
    >
      {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
    </button>
  );
};

const StatCard = ({ label, value, delay }: { label: string; value: string; delay: number }) => (
  <div className={`bg-black/20 border border-gray-800 rounded-xl p-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700`} style={{ animationDelay: `${delay}ms` }}>
    <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1 uppercase tracking-wider">{label}</p>
    <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
  </div>
);

const GenerationLoader = ({ mode }: { mode: 'seo' | 'marketing' | 'performance' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const stepsSeo = [
    "تحليل فكرة الفيديو والجمهور المستهدف...",
    "فحص خوارزميات اليوتيوب (تحديثات 2025)...",
    "توليد عناوين جذابة لزيادة نسبة النقر (CTR)...",
    "اختيار الكلمات المفتاحية الأكثر بحثاً...",
    "صياغة وصف احترافي وتنسيق المحتوى..."
  ];

  const stepsMarketing = [
    "تحليل المنتج والسوق المستهدف...",
    "دراسة نبرة الصوت المناسبة للمنصات...",
    "صياغة محتوى انستقرام وتويتر...",
    "كتابة منشورات لينكدان وفيسبوك...",
    "تحسين الهاشتاقات للوصول العضوي..."
  ];

  const stepsPerformance = [
    "الاتصال بمحرك بحث Google...",
    "البحث عن الفيديو واستخراج البيانات...",
    "تحليل معدلات التفاعل (لايكات، تعليقات)...",
    "مقارنة الأداء مع معايير اليوتيوب...",
    "توليد تقرير الأداء النهائي..."
  ];

  const steps = mode === 'seo' ? stepsSeo : mode === 'marketing' ? stepsMarketing : stepsPerformance;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);

  return (
    <Card className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 animate-in fade-in duration-500">
       {/* Spinner / Visual */}
       <div className="relative w-24 h-24">
         <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
           <SparklesIcon className="w-8 h-8 text-red-500 animate-pulse" />
         </div>
       </div>

       {/* Progress Bar */}
       <div className="w-full max-w-md space-y-2">
         <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>جاري المعالجة بواسطة الذكاء الاصطناعي</span>
            <span>{Math.round(progress)}%</span>
         </div>
         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
           <div 
              className="h-full bg-gradient-to-r from-red-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
           ></div>
         </div>
       </div>

       {/* Steps List */}
       <div className="space-y-4 w-full max-w-sm text-right">
         {steps.map((step, idx) => (
           <div 
              key={idx} 
              className={`flex items-center gap-3 transition-all duration-500 ${
                idx === currentStep ? 'opacity-100 scale-105 transform' : 
                idx < currentStep ? 'opacity-50' : 'opacity-30'
              }`}
           >
             <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
               idx < currentStep ? 'bg-green-500/10 border-green-500 text-green-500' :
               idx === currentStep ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' :
               'border-gray-800 bg-gray-900'
             }`}>
               {idx < currentStep ? <CheckIcon className="w-3 h-3" /> : 
                idx === currentStep ? <div className="w-2 h-2 bg-red-500 rounded-full" /> : 
                <div className="w-2 h-2 bg-gray-700 rounded-full" />}
             </div>
             <span className={`text-sm ${idx === currentStep ? 'text-white font-bold' : 'text-gray-400'}`}>
               {step}
             </span>
           </div>
         ))}
       </div>
    </Card>
  );
};

// --- Settings Trigger Button Component ---
const AdSettingsTrigger = () => {
  const { setDashboardOpen } = useAds();
  return (
     <button 
       onClick={() => setDashboardOpen(true)}
       className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-xs"
       title="إعدادات الإعلانات"
     >
       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <circle cx="12" cy="12" r="3"></circle>
         <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
       </svg>
       <span>الإعلانات</span>
     </button>
  );
};

// --- Main Content Wrapper ---
function MainContent() {
  const [activeTab, setActiveTab] = useState<'seo' | 'marketing' | 'performance'>('seo');
  
  // SEO State
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<VideoCategory>(VideoCategory.TECH);
  const [seoResult, setSeoResult] = useState<SEOResponse | null>(null);
  const [regenTitlesLoading, setRegenTitlesLoading] = useState(false);
  const [regenDescLoading, setRegenDescLoading] = useState(false);

  // Marketing State
  const [productName, setProductName] = useState('');
  const [marketingResult, setMarketingResult] = useState<MarketingCopyResponse | null>(null);

  // Performance State
  const [videoUrl, setVideoUrl] = useState('');
  const [performanceResult, setPerformanceResult] = useState<PerformanceResponse | null>(null);

  // Shared State
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState<string>(Language.ARABIC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'seo') {
        if (!topic.trim()) throw new Error("الرجاء إدخال فكرة الفيديو");
        const data = await generateSEO({ topic, audience, category, language });
        setSeoResult(data);
      } else if (activeTab === 'marketing') {
        if (!productName.trim()) throw new Error("الرجاء إدخال اسم المنتج");
        const data = await generateMarketingCopy({ productName, audience, language });
        setMarketingResult(data);
      } else {
        if (!videoUrl.trim()) throw new Error("الرجاء إدخال رابط الفيديو");
        const data = await analyzeVideoPerformance({ url: videoUrl });
        setPerformanceResult(data);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء توليد البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTitles = async () => {
    if (!topic || !seoResult) return;
    setRegenTitlesLoading(true);
    try {
      const newTitles = await generateTitles({ topic, audience, category, language });
      setSeoResult({ ...seoResult, titles: newTitles });
    } catch (err) {
      console.error("Failed to regenerate titles", err);
    } finally {
      setRegenTitlesLoading(false);
    }
  };

  const handleRegenerateDescription = async () => {
    if (!topic || !seoResult) return;
    setRegenDescLoading(true);
    try {
      const newDesc = await generateDescription({ topic, audience, category, language });
      setSeoResult({ ...seoResult, description: newDesc });
    } catch (err) {
      console.error("Failed to regenerate description", err);
    } finally {
      setRegenDescLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <AdDashboard />
      
      {/* Header */}
      <header className="bg-yt-paper/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <YoutubeIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TubeRank <span className="text-red-500">AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-sm text-gray-400 hidden sm:block">
              منشئ أفكار و سيو اليوتيوب
            </div>
            <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
            <AdSettingsTrigger />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Ad Placement: Header */}
        <AdUnit placementKey="header" className="mb-8" />
        
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            {activeTab === 'seo' ? 'اصنع المحتوى الذي يحبه اليوتيوب' : 
             activeTab === 'marketing' ? 'سوق منتجك باحترافية' :
             'حلل أداء فيديوهاتك'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {activeTab === 'seo' 
              ? 'حول فكرتك إلى خطة نشر متكاملة. نستخدم الذكاء الاصطناعي لتصنيف الفيديو واستهداف الجمهور المناسب بدقة.'
              : activeTab === 'marketing'
              ? 'أنشئ محتوى تسويقي جذاب لمنصات التواصل الاجتماعي (انستقرام، تويتر، لينكدان، فيسبوك) بضغطة زر.'
              : 'أدخل رابط الفيديو ودع الذكاء الاصطناعي يحلل أدائه ويعطيك رؤى لتحسين النتائج.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="sticky top-24 p-0 overflow-hidden">
              {/* Tab Switcher */}
              <div className="flex border-b border-gray-800 bg-black/20">
                <TabButton 
                  active={activeTab === 'seo'} 
                  onClick={() => setActiveTab('seo')}
                  icon={<YoutubeIcon className="w-5 h-5" />}
                >
                  سيو
                </TabButton>
                <TabButton 
                  active={activeTab === 'marketing'} 
                  onClick={() => setActiveTab('marketing')}
                  icon={<SparklesIcon className="w-5 h-5" />}
                >
                  تسويق
                </TabButton>
                <TabButton 
                  active={activeTab === 'performance'} 
                  onClick={() => setActiveTab('performance')}
                  icon={<ChartIcon className="w-5 h-5" />}
                >
                  أداء
                </TabButton>
              </div>

              <div className="p-6 space-y-4">
                
                {/* Language Selector */}
                {activeTab !== 'performance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">لغة المحتوى / Content Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    >
                      {Object.values(Language).map((lang) => (
                        <option key={lang} value={lang} className="bg-gray-900 text-white">
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'seo' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">فكرة الفيديو</label>
                      <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="اكتب فكرة الفيديو هنا... (مثال: أفضل هواتف للألعاب بسعر رخيص)"
                        className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none h-32 resize-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">فئة الفيديو</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {Object.values(VideoCategory).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`p-2 rounded-lg text-xs font-medium border transition-all text-right px-3 ${
                              category === cat 
                              ? 'bg-red-500/10 border-red-500 text-red-500' 
                              : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : activeTab === 'marketing' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">اسم المنتج / الخدمة</label>
                      <input 
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="مثال: سماعات محيطية عازلة للضوضاء"
                        className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">رابط فيديو اليوتيوب</label>
                      <input 
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-black/30 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all dir-ltr"
                      />
                    </div>
                  </>
                )}

                {activeTab !== 'performance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الجمهور المستهدف (اختياري)</label>
                    <input 
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="مثال: المبتدئين، الطلاب، رواد الأعمال..."
                      className="w-full bg-black/30 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5 opacity-80">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      تحديد الجمهور يساعد الذكاء الاصطناعي على اختيار نبرة الصوت والمصطلحات المناسبة لزيادة التفاعل.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading ? (
                    <>
                      <RefreshIcon className="w-5 h-5 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      {activeTab === 'seo' ? 'تجهيز خطة النشر' : activeTab === 'marketing' ? 'توليد المحتوى' : 'تحليل الأداء'}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Ad Placement: Sidebar */}
            <AdUnit placementKey="sidebar" />

          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {loading && (
              <GenerationLoader mode={activeTab} />
            )}

            {/* Ad Placement: Results Top (Only show if we have results or placeholder) */}
            {!loading && (seoResult || marketingResult || performanceResult) && (
               <AdUnit placementKey="resultsTop" />
            )}

            {!loading && activeTab === 'seo' && seoResult && (
              <>
                {/* SEO Results (Existing) */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 shrink-0">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-100 mb-1">استراتيجية الخوارزمية (2025)</h4>
                    <p className="text-sm text-blue-200/80 leading-relaxed">{seoResult.algorithmStrategy}</p>
                    <div className="mt-3 flex gap-2">
                       <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        التصنيف المقترح: {seoResult.category}
                      </span>
                    </div>
                  </div>
                </div>

                <Card title="أفكار للصورة المصغرة (Thumbnails)" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {seoResult.thumbnailIdeas && seoResult.thumbnailIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-black/20 rounded-xl overflow-hidden border border-gray-800 flex flex-col">
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative p-4 flex items-center justify-center text-center group">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                          <p className="relative z-10 font-black text-xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-tight uppercase transform -rotate-2">
                            {idea.text}
                          </p>
                          <div className="absolute bottom-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-3">
                           <div>
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">المشهد</span>
                             <p className="text-sm text-gray-300 leading-snug">{idea.description}</p>
                           </div>
                           <div className="pt-3 border-t border-gray-800 mt-auto">
                             <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">النص المقترح</span>
                             <div className="flex justify-between items-center">
                                <span className="text-white font-bold text-sm bg-red-500/10 px-2 py-1 rounded border border-red-500/20">{idea.text}</span>
                                <CopyButton text={idea.text} />
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card 
                  title="العناوين المقترحة (عالية النقر)" 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
                  action={
                    <Button 
                      variant="outline" 
                      className="text-xs py-1 px-3 h-8 gap-1.5"
                      onClick={handleRegenerateTitles}
                      disabled={regenTitlesLoading}
                    >
                      <RefreshIcon className={`w-3.5 h-3.5 ${regenTitlesLoading ? 'animate-spin' : ''}`} />
                      <span>{regenTitlesLoading ? 'جاري التجديد...' : 'تجديد العناوين'}</span>
                    </Button>
                  }
                >
                  <div className="space-y-3">
                    {seoResult.titles.map((title, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-3 bg-black/20 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                        <span className="font-medium text-gray-200">{title}</span>
                        <CopyButton text={title} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Ad Placement: Results Bottom (Middle of content) */}
                <AdUnit placementKey="resultsBottom" />

                <Card 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                  title="الوصف (مهيأ لمحركات البحث)" 
                  action={
                    <div className="flex items-center gap-2">
                       <Button 
                        variant="outline" 
                        className="text-xs py-1 px-3 h-8 gap-1.5"
                        onClick={handleRegenerateDescription}
                        disabled={regenDescLoading}
                      >
                        <RefreshIcon className={`w-3.5 h-3.5 ${regenDescLoading ? 'animate-spin' : ''}`} />
                        <span>{regenDescLoading ? 'جاري...' : 'تجديد'}</span>
                      </Button>
                      <div className="w-px h-6 bg-gray-700 mx-1"></div>
                       <span className="text-xs text-gray-500 font-medium hidden sm:block">نسخ الوصف</span>
                       <CopyButton text={seoResult.description} />
                    </div>
                  }
                >
                  <pre className="whitespace-pre-wrap font-sans text-gray-300 bg-black/20 p-4 rounded-xl border border-gray-800 text-sm leading-relaxed min-h-[200px]">
                    {seoResult.description}
                  </pre>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <Card title="الكلمات المفتاحية (Tags)">
                    <div className="flex flex-wrap gap-2">
                      {seoResult.keywords.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 border border-gray-700 transition-colors cursor-default">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => navigator.clipboard.writeText(seoResult.keywords.join(','))}
                        className="text-xs py-2 px-4"
                      >
                        نسخ الكل
                      </Button>
                    </div>
                  </Card>

                  <Card title="الهاشتاقات (#)">
                    <div className="flex flex-wrap gap-2">
                      {seoResult.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                       <Button 
                        variant="outline" 
                        onClick={() => navigator.clipboard.writeText(seoResult.hashtags.join(' '))}
                        className="text-xs py-2 px-4"
                      >
                        نسخ الكل
                      </Button>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {!loading && activeTab === 'marketing' && marketingResult && (
              <>
                {/* Marketing Results */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-4 rounded-xl flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 shrink-0">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-100 mb-1">الاستراتيجية التسويقية</h4>
                    <p className="text-sm text-purple-200/80 leading-relaxed">{marketingResult.strategy}</p>
                  </div>
                </div>

                {/* Ad Placement: Results Bottom */}
                <AdUnit placementKey="resultsBottom" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  {marketingResult.posts.map((post, idx) => (
                    <Card key={idx} title={post.platform} action={<CopyButton text={`${post.content}\n\n${post.hashtags.join(' ')}`} />}>
                      <div className="space-y-4">
                        <pre className="whitespace-pre-wrap font-sans text-gray-300 bg-black/20 p-4 rounded-xl border border-gray-800 text-sm leading-relaxed">
                          {post.content}
                        </pre>
                        <div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {post.hashtags.map((tag, i) => (
                              <span key={i} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {!loading && activeTab === 'performance' && performanceResult && (
              <>
                 <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatCard label="المشاهدات (Views)" value={performanceResult.views} delay={0} />
                    <StatCard label="الإعجابات (Likes)" value={performanceResult.likes} delay={100} />
                    <StatCard label="التعليقات (Comments)" value={performanceResult.comments} delay={200} />
                 </div>

                 <Card title="تحليل الأداء" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                   <div className="flex gap-4">
                     <div className="bg-red-500/20 p-3 rounded-xl h-fit">
                       <ChartIcon className="w-6 h-6 text-red-400" />
                     </div>
                     <div className="space-y-2">
                       <h4 className="font-bold text-lg text-white">رؤى الذكاء الاصطناعي</h4>
                       <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                         {performanceResult.analysis}
                       </p>
                     </div>
                   </div>
                 </Card>
                 
                 {/* Ad Placement: Results Bottom */}
                 <AdUnit placementKey="resultsBottom" />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- App Wrapper to provide Context ---
export default function App() {
  return (
    <AdProvider>
      <MainContent />
    </AdProvider>
  );
}