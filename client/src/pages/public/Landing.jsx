import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, Mic, ArrowRight, ArrowDown, Building2, CheckCircle2, User, Zap,
  CheckCheck, Shield, Star, Bike, Hammer, Home, Car, Package, Wrench,
  ChefHat, ShieldCheck, HardHat, Ruler, Paintbrush, ChevronDown, ChevronUp,
} from 'lucide-react';
import VoiceSearchModal from '../../components/VoiceSearchModal';

/* DATA */
const CATEGORY_META = [
  { icon: Bike, key: 'delivery', count: 1240, color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Hammer, key: 'construction', count: 890, color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Home, key: 'domesticHelp', count: 670, color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Car, key: 'driver', count: 540, color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Package, key: 'warehouse', count: 320, color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Wrench, key: 'plumberElectrician', count: 410, color: 'text-rose-600', bg: 'bg-rose-50' },
  // ── revealed by "View All" ──
  { icon: ChefHat, key: 'cook', count: 280, color: 'text-yellow-700', bg: 'bg-yellow-50' },
  { icon: ShieldCheck, key: 'security', count: 190, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: HardHat, key: 'helper', count: 460, color: 'text-teal-600', bg: 'bg-teal-50' },
  { icon: Ruler, key: 'carpenter', count: 240, color: 'text-stone-700', bg: 'bg-stone-100' },
  { icon: Paintbrush, key: 'painter', count: 210, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  { icon: Hammer, key: 'mason', count: 350, color: 'text-orange-700', bg: 'bg-orange-100' },
];

const DEFAULT_VISIBLE = 6;

const TESTIMONIAL_DATA = [
  {
    initials: 'RK',
    name: 'Rajan Kumar',
    role: { en: 'Delivery Rider, Mumbai', hi: 'डिलीवरी राइडर, मुंबई', bho: 'डिलीवरी राइडर, मुंबई' },
    rating: 4.9,
    jobs: 47,
    quote: {
      en: 'Earlier it took weeks to find work. With ShramSetu I found a job in three days — completely free.',
      hi: '“पहले काम ढूँढने में हफ्ते लग जाते थे। श्रमसेतु से तीन दिन में काम मिला — बिल्कुल मुफ्त।”',
      bho: '“पहिले काम खोजे में हफ्ता लाग जात रहे। श्रमसेतु से तीन दिन में काम मिलल — बिल्कुल मुफ्त।”',
    },
  },
  {
    initials: 'MD',
    name: 'Meena Devi',
    role: { en: 'Domestic Help, Delhi', hi: 'घरेलू मदद, दिल्ली', bho: 'घरेलू मदद, दिल्ली' },
    rating: 4.9,
    jobs: 31,
    quote: {
      en: 'I never thought I could find work so easily from a phone. Now I have three regular households.',
      hi: '“मैंने सोचा नहीं था फ़ोन से इतनी आसानी से काम मिलेगा। अब मेरी तीन मैडम रेगुलर हैं।”',
      bho: '“हम सोचल ना रहीं कि फोन से इतना आसानी से काम मिली। अब हमार तीन मालकिन रेगुलर बाड़ें।”',
    },
  },
  {
    initials: 'SY',
    name: 'Suresh Yadav',
    role: { en: 'Plumber, Hyderabad', hi: 'प्लंबर, हैदराबाद', bho: 'प्लंबर, हैदराबाद' },
    rating: 4.9,
    jobs: 58,
    quote: {
      en: 'Agencies used to charge money. Here everything is free. In one week I got 4 jobs. Very good.',
      hi: '“एजेंसी वाले पैसा माँगते थे। यहाँ सब मुफ्त है। एक हफ्ते में 4 काम मिले। बहुत अच्छा।”',
      bho: '“एजेंसी वाला पइसा माँगत रहें। इहाँ सब मुफ्त बा। एक हफ्ता में 4 काम मिलल। बहुत नीमन।”',
    },
  },
];

const STATS = [
  { value: '2.4L+', key: 'workersPlaced' },
  { value: '₹0', key: 'costToWorkers' },
  { value: '3 days', key: 'avgHireTime' },
  { value: '18K+', key: 'verifiedEmployers' },
];

const HERO_TAGS = ['delivery', 'driver', 'helper', 'plumber', 'cook', 'security'];

const HOW_IT_WORKS = [
  { num: '01', key: '1', icon: User, color: 'bg-blue-50 text-blue-600' },
  { num: '02', key: '2', icon: Zap, color: 'bg-orange-50 text-orange-600' },
  { num: '03', key: '3', icon: CheckCheck, color: 'bg-green-50 text-green-600' },
];

/*PAGE */
export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const lang = (i18n.resolvedLanguage || i18n.language || 'hi').split('-')[0];

  const goSearch = () => navigate('/auth');
  const goFindWork = () => navigate('/auth?role=worker');
  const goHireWorkers = () => navigate('/auth?role=employer');
  const goCategory = (c) => navigate(`/auth?role=worker&category=${encodeURIComponent(c)}`);

  return (
    <main>
      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-[96vh] flex flex-col overflow-hidden bg-brand-navy">
        <img
          src="/Hero.bg.jpg"
          alt="Workers and city skyline"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '65% center' }}
        />
        {/* Left-to-right gradient: dense navy on left (text area) fading to semi-transparent on right (illustration visible) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#02061e] via-[#0A0F2C]/88 to-[#02061e]/60" />
        {/* Bottom fade for stats bar readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F2C]/90 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-6 right-6 md:right-10 z-10 hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-white/90 tracking-wide">
            {t('landing.badge')}
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 md:px-10 py-24">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-7">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.06] tracking-tight">
              <span className="block text-white drop-shadow-md">{t('landing.headline1')}</span>
              <span className="block text-brand-orange drop-shadow-md">{t('landing.headline2')}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 leading-[1.75] max-w-2xl">
              {t('landing.subheadline')}
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); goSearch(); }}
              className="w-full max-w-xl flex rounded-2xl overflow-hidden shadow-2xl border border-gray/5"
            >
              <div className="flex-1 flex items-center gap-3 bg-white px-5 min-h-[56px]">
                <Search className="text-gray-800 shrink-0" style={{ width: 18, height: 18 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('landing.searchPlaceholder')}
                  className="flex-1 text-base font-bold bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-gray-500 text-slate-900"
                  aria-label={t('landing.searchPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setVoiceOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-300 transition-colors shrink-0"
                  title={t('landing.voiceSearch', { defaultValue: 'Voice search' })}
                  aria-label={t('landing.voiceSearch', { defaultValue: 'Voice search' })}
                >
                  <Mic className="w-5 h-5 text-black-400 hover:text-brand-orange transition-colors" />
                </button>
              </div>
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orangeDark active:scale-[0.98] text-white font-bold px-7 text-sm tracking-wide transition-all shrink-0 min-h-[56px]"
              >
                {t('landing.searchButton')}
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-2">
              {HERO_TAGS.map((tagKey) => (
                <button
                  key={tagKey}
                  type="button"
                  onClick={() => goCategory(t(`categories.${tagKey}`))}
                  className="text-xs font-semibold px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white hover:border-white/30 backdrop-blur-sm transition-all min-h-[36px]"
                >
                  {t(`categories.${tagKey}`)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm">
              <button
                onClick={goFindWork}
                className="flex-1 min-h-[52px] px-6 text-base font-bold rounded-xl bg-brand-orange hover:bg-brand-orangeDark active:scale-[0.98] text-white shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {t('landing.findWork')} <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={goHireWorkers}
                className="flex-1 min-h-[52px] px-6 text-base font-semibold rounded-xl border-2 border-white/45 text-white hover:bg-white/10 hover:border-white/70 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Building2 className="w-4 h-4" />
                {t('landing.hireWorkers')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 w-full bg-black/45 backdrop-blur-md border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            <div className="flex flex-1 items-center justify-center divide-x divide-white/15 flex-wrap md:flex-nowrap">
              {STATS.map((s) => (
                <div key={s.key} className="flex flex-col items-center text-center px-6 py-1">
                  <div className="text-2xl font-extrabold text-white leading-tight">{s.value}</div>
                  <div className="text-xs text-white/50 mt-0.5 font-medium whitespace-nowrap">
                    {t(`landing.stats.${s.key}`)}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-green-600" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-green-400 mb-0.5 uppercase tracking-wide">
                  96% ShramSetu Match
                </div>
                <div className="text-sm font-bold text-white leading-tight">
                  Delivery Rider · QuickMart
                </div>
                <div className="text-xs text-white/50 mt-0.5">₹600/day · 1.2 km away</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" className="py-20 bg-[#F1F5F9] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-3">
              {t('landing.eyebrow')}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              {t('landing.howTitle')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ num, key, icon: Icon, color }) => (
              <div
                key={num}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="text-5xl font-extrabold text-slate-200 mb-5 leading-none select-none">
                  {num}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {t(`landing.step${key}Title`)}
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  {t(`landing.step${key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*WHO YOU WORK WITH  */}
      <section id="workers" className="py-16 md:py-20 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-10">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-green-100 text-green-700 border border-green-200 mb-4">
              <Shield className="w-3.5 h-3.5" /> {t('landing.trustBadge')}
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900">
              {t('landing.trustTitle')}
            </h2>
            <p className="text-slate-500 mt-3 text-base md:text-lg max-w-2xl mx-auto">
              {t('landing.trustSub')}
            </p>
          </div>

          {/* ── Flow diagram ── */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0 max-w-4xl mx-auto">

            {/* WORKER */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 md:p-6 w-full max-w-[320px] md:max-w-none md:w-56 md:text-center">
              <div className="flex md:block items-center gap-3 mb-3 md:mb-0">
                <div className="w-11 h-11 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center md:mx-auto md:mb-3 shrink-0">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div className="font-bold text-slate-900 md:mb-3">
                  {t('landing.workerRole')}
                </div>
              </div>
              <ul className="text-sm text-left space-y-1.5 text-slate-600">
                {(t('landing.workerPoints', { returnObjects: true }) || []).map((txt) => (
                  <li key={txt} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Down arrow (mobile) */}
            <div className="flex md:hidden py-1">
              <ArrowDown className="w-5 h-5 text-brand-orange" />
            </div>

            {/* SHRAMSETU */}
            <div className="flex flex-col items-center w-full max-w-[320px] md:max-w-none md:w-auto md:px-4 gap-0 md:gap-2">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-px bg-slate-200" />
                <ArrowRight className="w-4 h-4 text-brand-orange" />
              </div>

              <div className="bg-brand-navy rounded-2xl p-5 text-center border-2 border-brand-orange/30 w-full md:w-52">
                <div className="flex md:block items-center gap-3 mb-3 md:mb-0">
                  <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center md:mx-auto md:mb-3 shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-white text-sm md:mb-3">ShramSetu</div>
                </div>
                <ul className="text-xs text-left space-y-1.5 text-white/60">
                  {(t('landing.platformPoints', { returnObjects: true }) || []).map((txt) => (
                    <li key={txt} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand-orange mt-0.5 shrink-0" />
                      {txt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-brand-orange" />
                <div className="w-8 h-px bg-slate-200" />
              </div>
            </div>

            {/* Down arrow (mobile) */}
            <div className="flex md:hidden py-1">
              <ArrowDown className="w-5 h-5 text-brand-orange" />
            </div>

            {/* EMPLOYER */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 md:p-6 w-full max-w-[320px] md:max-w-none md:w-56 md:text-center">
              <div className="flex md:block items-center gap-3 mb-3 md:mb-0">
                <div className="w-11 h-11 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center md:mx-auto md:mb-3 shrink-0">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="font-bold text-slate-900 md:mb-3">
                  {t('landing.employerRole')}
                </div>
              </div>
              <ul className="text-sm text-left space-y-1.5 text-slate-600">
                {(t('landing.employerPoints', { returnObjects: true }) || []).map((txt) => (
                  <li key={txt} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <p className="text-center text-xs md:text-sm text-slate-500 mt-8 max-w-md mx-auto">
            {t('landing.trustFooter')}
          </p>
        </div>
      </section>

      {/* ════════════ CATEGORIES ════════════ */}
      <section id="categories" className="py-16 md:py-20 bg-[#F1F5F9] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-10">
          {/* Header row: title left, View All right */}
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900">
              {t('landing.categoriesTitle')}
            </h2>

            <button
              onClick={() => setShowAllCategories((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-orange hover:text-brand-orangeDark transition-colors shrink-0 min-h-[40px] px-3 md:px-4 rounded-lg hover:bg-orange-50"
              aria-expanded={showAllCategories}
              aria-controls="category-grid"
            >
              {showAllCategories
                ? t('landing.showLess', { defaultValue: 'Show Less' })
                : t('landing.viewAll', { defaultValue: 'View All' })}
              {showAllCategories
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Grid — first 6 always visible; rest toggled */}
          <div id="category-grid" className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORY_META.slice(0, DEFAULT_VISIBLE).map(({ icon: Icon, key, count, color, bg }) => (
              <CategoryCard
                key={key}
                Icon={Icon}
                label={t(`categories.${key}`)}
                count={count}
                color={color}
                bg={bg}
                onClick={() => goCategory(t(`categories.${key}`))}
              />
            ))}

            {showAllCategories && CATEGORY_META.slice(DEFAULT_VISIBLE).map(({ icon: Icon, key, count, color, bg }, i) => (
              <CategoryCard
                key={key}
                Icon={Icon}
                label={t(`categories.${key}`)}
                count={count}
                color={color}
                bg={bg}
                onClick={() => goCategory(t(`categories.${key}`))}
                style={{ animation: `fadeInUp 320ms ease-out ${i * 40}ms both` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 text-center">
            {t('landing.testimonialsTitle')}
          </h2>
          <p className="text-slate-500 text-center mb-12">
            {t('landing.testimonialsSub')}
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIAL_DATA.map((tst) => (
              <div
                key={tst.name}
                className="bg-[#F1F5F9] rounded-2xl p-7 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-800 leading-relaxed mb-6 italic">
                  {tst.quote[lang] || tst.quote.hi}
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-sm font-bold shrink-0">
                    {tst.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{tst.name}</div>
                    <div className="text-xs text-slate-500">
                      {tst.role[lang] || tst.role.hi}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ⭐ {tst.rating} · {t('landing.jobsDone', { count: tst.jobs })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section id="employers" className="py-16 bg-brand-orange scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-white/80 text-base">{t('landing.ctaSub')}</p>
          </div>
          <button
            onClick={goHireWorkers}
            className="min-h-[52px] px-8 text-base font-bold rounded-lg bg-white text-brand-orange hover:bg-orange-50 transition-colors shadow-lg flex items-center gap-2 shrink-0"
          >
            {t('landing.ctaButton')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="bg-brand-navy pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand-orange rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold text-white">
                Shram<span className="text-brand-orange">Setu</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-5">
              {t('landing.footerTagline')}
            </p>
            <div className="flex gap-2">
              {['App Store', 'Play Store'].map((s) => (
                <div
                  key={s}
                  className="text-[10px] font-medium px-3 py-1.5 rounded-lg border border-white/20 text-white/50"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <FooterCol
            title={t('landing.footerWorkers')}
            links={[
              t('landing.footerLinks.findJobs'),
              t('landing.footerLinks.createProfile'),
              t('landing.footerLinks.jobAlerts'),
              t('landing.footerLinks.helpHindi'),
            ]}
            onLink={goFindWork}
          />
          <FooterCol
            title={t('landing.footerEmployers')}
            links={[
              t('landing.footerLinks.postJob'),
              t('landing.footerLinks.searchWorkers'),
              t('landing.footerLinks.pricing'),
              t('landing.footerLinks.bulkHiring'),
            ]}
            onLink={goHireWorkers}
          />
          <FooterCol
            title={t('landing.footerCompany')}
            links={[
              t('landing.footerLinks.aboutUs'),
              t('landing.footerLinks.blog'),
              t('landing.footerLinks.careers'),
              t('landing.footerLinks.contact'),
            ]}
            onLink={goSearch}
          />
        </div>
        <div className="max-w-6xl mx-auto px-6 md:px-10 mt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>{t('landing.footerRights')}</span>
          <span>{t('landing.footerNote')}</span>
        </div>
      </footer>

      {/* vice search model in hover view */}
      <VoiceSearchModal
        open={voiceOpen}
        lang={lang}
        onClose={() => setVoiceOpen(false)}
        onResult={(text) => {
          setSearch(text);
          setVoiceOpen(false);
          // Navigate after a small delay so the user sees the text fill in
          setTimeout(() => navigate(`/auth?q=${encodeURIComponent(text)}`), 150);
        }}
      />
    </main>
  );
}

/* SUB-COMPONENTS */
function CategoryCard({ Icon, label, count, color, bg, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group p-5 md:p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:border-brand-orange/30 transition-all text-left min-h-[140px]"
    >
      <div
        className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 ${bg} group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
      </div>
      <div className="font-bold text-sm text-slate-900">{label}</div>
      <div className="text-xs text-slate-500 mt-1">
        {count.toLocaleString('en-IN')} open jobs
      </div>
    </button>
  );
}

function FooterCol({ title, links, onLink }) {
  return (
    <div>
      <div className="font-bold text-sm mb-5 text-white/80">{title}</div>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link}>
            <button
              onClick={onLink}
              className="text-sm text-white/40 hover:text-white/80 transition-colors"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}