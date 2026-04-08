import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import ThemeToggle from "@/Components/ThemeToggle";
import { MapPin, Phone, Mail, Star, Award, Clock, ChevronRight, TreePine, Swords, GraduationCap } from 'lucide-react';

export default function Welcome({ auth, activeMembers, activeHorses }: PageProps<{ activeMembers: number; activeHorses: number }>) {
    const { t } = useTranslation();

    const programs = [
        {
            icon: GraduationCap,
            title: t('welcome.program1.title'),
            subtitle: t('welcome.program1.subtitle'),
            description: t('welcome.program1.description'),
            image: '/images/sola-jahanja-zacetniki.png',
            price: t('welcome.program1.price'),
            badge: t('welcome.program1.badge'),
            badgeColor: '#16a34a',
        },
        {
            icon: Award,
            title: t('welcome.program2.title'),
            subtitle: t('welcome.program2.subtitle'),
            description: t('welcome.program2.description'),
            image: '/images/preskok-ovir.png',
            price: t('welcome.program2.price'),
            badge: t('welcome.program2.badge'),
            badgeColor: '#d97706',
        },
        {
            icon: TreePine,
            title: t('welcome.program3.title'),
            subtitle: t('welcome.program3.subtitle'),
            description: t('welcome.program3.description'),
            image: '/images/jahanje-naravi.png',
            price: t('welcome.program3.price'),
            badge: t('welcome.program3.badge'),
            badgeColor: '#0284c7',
        },
    ];

    const stats = [
        { value: activeMembers > 100 ? '100+' : String(activeMembers), label: t('welcome.stats.members') },
        { value: String(activeHorses), label: t('welcome.stats.horses') },
        { value: '5 km',              label: t('welcome.stats.distance') },
        { value: '2+',                label: t('welcome.stats.arenas') },
    ];

    const pricing = [
        { service: t('welcome.pricing.row1'),  member: '30 €',  nonMember: '30 €' },
        { service: t('welcome.pricing.row2'),  member: '250 €', nonMember: '300 €' },
        { service: t('welcome.pricing.row3'),  member: '25 €',  nonMember: '25 €' },
        { service: t('welcome.pricing.row4'),  member: '15 €',  nonMember: '15 €' },
        { service: t('welcome.pricing.row5'),  member: '35 €',  nonMember: '/' },
        { service: t('welcome.pricing.row6'),  member: '300 €', nonMember: '/' },
        { service: t('welcome.pricing.row7'),  member: '35 €',  nonMember: '40 €' },
        { service: t('welcome.pricing.row8'),  member: '350 €', nonMember: '/' },
        { service: t('welcome.pricing.row9'),  member: '30 €',  nonMember: '/' },
        { service: t('welcome.pricing.row10'), member: '55 €',  nonMember: '/' },
        { service: t('welcome.pricing.row11'), member: '65 €',  nonMember: '/' },
    ];

    const footerLinks = [
        { label: t('welcome.footer.ridingSchool'), slug: 'sola-jahanja' },
        { label: t('welcome.footer.exams'),        slug: 'izpiti-licence-treningi' },
        { label: t('welcome.footer.schedule'),     slug: 'urnik' },
        { label: t('welcome.footer.horseRental'),  slug: 'najem-konja' },
        { label: t('welcome.footer.aboutClub'),    slug: 'o-klubu' },
        { label: t('welcome.footer.contact'),      slug: 'kontakt' },
    ];

    return (
        <>
            <Head title={t('welcome.pageTitle')} />

            <div className="kk-page min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                    /* ── Light mode variables ── */
                    :root {
                        --kk-bg:          #f8fafc;
                        --kk-bg-alt:      #f1f5f9;
                        --kk-card:        #ffffff;
                        --kk-card-alt:    #f8fafc;
                        --kk-border:      #e2e8f0;
                        --kk-border-alt:  #cbd5e1;
                        --kk-text:        #1e293b;
                        --kk-text-muted:  #475569;
                        --kk-text-faint:  #94a3b8;
                        --kk-green:       var(--primary, #16a34a);
                        --kk-green-light: color-mix(in oklch, var(--primary, #16a34a) 18%, transparent);
                        --kk-green-badge: color-mix(in oklch, var(--primary, #16a34a) 12%, transparent);
                        --kk-shadow:      0 4px 24px rgba(0,0,0,0.08);
                        --kk-shadow-lg:   0 16px 60px rgba(0,0,0,0.12);
                        --kk-header-bg:   rgba(255,255,255,0.92);
                        --kk-header-border: #e2e8f0;
                        --kk-stat-bg:     #ffffff;
                        --kk-pricing-bg:  #ffffff;
                        --kk-pricing-hdr: color-mix(in oklch, var(--primary, #16a34a) 7%, transparent);
                        --kk-pricing-row: color-mix(in oklch, var(--primary, #16a34a) 4%, transparent);
                        --kk-hero-overlay: linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, color-mix(in oklch, var(--primary, #16a34a) 10%, transparent) 100%);
                        --kk-nature-bg:   rgba(240,253,244,0.9);
                    }

                    /* ── Dark mode variables ── */
                    .dark {
                        --kk-bg:          #0f1117;
                        --kk-bg-alt:      rgba(26,31,46,0.4);
                        --kk-card:        #1a1f2e;
                        --kk-card-alt:    #1a1f2e;
                        --kk-border:      #2a3147;
                        --kk-border-alt:  #2a3147;
                        --kk-text:        #f1f5f9;
                        --kk-text-muted:  #94a3b8;
                        --kk-text-faint:  #64748b;
                        --kk-green:       var(--primary, #4ade80);
                        --kk-green-light: color-mix(in oklch, var(--primary, #4ade80) 15%, transparent);
                        --kk-green-badge: color-mix(in oklch, var(--primary, #4ade80) 12%, transparent);
                        --kk-shadow:      0 4px 24px rgba(0,0,0,0.3);
                        --kk-shadow-lg:   0 24px 80px rgba(0,0,0,0.5);
                        --kk-header-bg:   rgba(15,17,23,0.85);
                        --kk-header-border: #1e2535;
                        --kk-stat-bg:     rgba(26,31,46,0.8);
                        --kk-pricing-bg:  #1a1f2e;
                        --kk-pricing-hdr: color-mix(in oklch, var(--primary, #4ade80) 8%, transparent);
                        --kk-pricing-row: color-mix(in oklch, var(--primary, #4ade80) 5%, transparent);
                        --kk-hero-overlay: linear-gradient(135deg, rgba(15,17,23,0.85) 0%, rgba(15,17,23,0.5) 50%, color-mix(in oklch, var(--primary, #4ade80) 10%, transparent) 100%);
                        --kk-nature-bg:   rgba(15,17,23,0.85);
                    }

                    .kk-page { background: var(--kk-bg); color: var(--kk-text); }

                    .kk-header {
                        border-bottom: 1px solid var(--kk-header-border);
                        background: var(--kk-header-bg);
                        backdrop-filter: blur(12px);
                        position: sticky; top: 0; z-index: 50;
                    }

                    .kk-stat-card {
                        background: var(--kk-stat-bg);
                        border: 1px solid var(--kk-border);
                        border-radius: 16px;
                        padding: 28px 20px;
                        text-align: center;
                        transition: border-color 0.3s, box-shadow 0.3s;
                        box-shadow: var(--kk-shadow);
                    }
                    .kk-stat-card:hover { border-color: var(--kk-green); box-shadow: var(--kk-shadow-lg); }

                    .kk-section-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: var(--kk-green-badge);
                        border: 1px solid var(--kk-green);
                        color: var(--kk-green);
                        padding: 6px 16px;
                        border-radius: 100px;
                        font-size: 13px;
                        font-weight: 600;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        margin-bottom: 16px;
                        opacity: 0.9;
                    }

                    .kk-card {
                        background: var(--kk-card);
                        border: 1px solid var(--kk-border);
                        border-radius: 20px;
                        overflow: hidden;
                        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                        box-shadow: var(--kk-shadow);
                    }
                    .kk-card:hover {
                        transform: translateY(-6px);
                        box-shadow: var(--kk-shadow-lg);
                        border-color: var(--kk-green);
                    }

                    .kk-btn-primary {
                        background: var(--primary, #16a34a);
                        color: var(--primary-foreground, #ffffff);
                        font-weight: 700;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 28px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                    }
                    .kk-btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px color-mix(in oklch, var(--primary, #16a34a) 40%, transparent);
                        filter: brightness(1.08);
                    }

                    .kk-btn-ghost {
                        background: transparent;
                        color: var(--kk-text-muted);
                        border: 1.5px solid var(--kk-border-alt);
                        border-radius: 8px;
                        padding: 11px 28px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-decoration: none;
                        font-weight: 500;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                    }
                    .kk-btn-ghost:hover { border-color: var(--kk-green); color: var(--kk-green); }

                    .kk-nav-link {
                        color: var(--kk-text-muted);
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 500;
                        transition: color 0.2s;
                    }
                    .kk-nav-link:hover { color: var(--kk-green); }

                    .kk-pricing-table {
                        background: var(--kk-pricing-bg);
                        border: 1px solid var(--kk-border);
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: var(--kk-shadow-lg);
                    }
                    .kk-pricing-hdr {
                        background: var(--kk-pricing-hdr);
                        border-bottom: 1px solid var(--kk-border);
                    }
                    .kk-pricing-row { transition: background 0.2s; }
                    .kk-pricing-row:hover { background: var(--kk-pricing-row); }
                    .kk-pricing-foot {
                        background: var(--kk-pricing-hdr);
                        border-top: 1px solid var(--kk-border);
                    }

                    .kk-sections-alt { background: var(--kk-bg-alt); border-top: 1px solid var(--kk-border); border-bottom: 1px solid var(--kk-border); }
                    .kk-contact-section { background: var(--kk-card-alt); border-top: 1px solid var(--kk-border); }

                    .kk-icon-box {
                        background: var(--kk-green-light);
                        border-radius: 8px;
                        padding: 8px;
                    }

                    .kk-img-frame {
                        border-radius: 20px;
                        overflow: hidden;
                        border: 1px solid var(--kk-border);
                        box-shadow: var(--kk-shadow-lg);
                        aspect-ratio: 4/5;
                    }

                    /* Footer — always dark */
                    .kk-footer-contact {
                        background: #111827;
                        border-top: 1px solid #1e2535;
                        padding: 80px 24px;
                    }
                    .kk-footer-bottom {
                        background: #0c1018;
                        border-top: 1px solid #1e2535;
                        padding: 24px;
                        text-align: center;
                    }
                `}</style>

                {/* ── HEADER ── */}
                <header className="kk-header">
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 68 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src="/images/karlo-icon.png" alt="KK Karlo logo" style={{ height: 40, width: 40, borderRadius: 8, objectFit: 'cover' }} />
                                <div>
                                    <div style={{ color: 'var(--kk-text)', fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>KK Karlo</div>
                                    <div style={{ color: 'var(--kk-green)', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>{t('welcome.header.tagline')}</div>
                                </div>
                            </div>

                            <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <LanguageSwitcher />
                                    <ThemeToggle />
                                </div>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="kk-btn-primary">
                                        {t('Dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="kk-nav-link" style={{ padding: '8px 16px' }}>
                                            {t('Log in')}
                                        </Link>
                                        <Link href={route('register')} className="kk-btn-primary">
                                            {t('Register')}
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* ── HERO ── */}
                <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'url(/images/hero-jahanje.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'scale(1.03)',
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--kk-hero-overlay)' }} />

                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1, width: '100%' }}>
                        <div style={{ maxWidth: 740 }}>
                            <div className="kk-section-badge" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff', background: 'rgba(255,255,255,0.12)' }}>
                                <MapPin size={12} />
                                Meljski hrib, Maribor
                            </div>

                            <h1 style={{
                                color: '#ffffff',
                                fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
                                fontWeight: 900,
                                lineHeight: 1.1,
                                marginBottom: 24,
                                letterSpacing: '-0.02em',
                                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                            }}>
                                {t('welcome.hero.title')} <br />
                                <span style={{ color: 'var(--primary, #4ade80)' }}>{t('welcome.hero.titleHighlight')}</span>
                            </h1>

                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                                {t('welcome.hero.description')}
                            </p>

                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Link href={route('login')} className="kk-btn-primary" style={{ color: '#fff' }}>
                                    {t('welcome.hero.ctaBook')}
                                    <ChevronRight size={18} />
                                </Link>
                                <a href="https://kkkarlo.si/sola-jahanja/" target="_blank" rel="noopener noreferrer"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '11px 28px', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}>
                                    {t('welcome.hero.ctaMore')}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}>
                        <div style={{ width: 1.5, height: 48, background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)' }} />
                    </div>
                </section>

                {/* ── STATS ── */}
                <section style={{ padding: '60px 24px', borderBottom: '1px solid var(--kk-border)' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            {stats.map((stat, i) => (
                                <div key={i} className="kk-stat-card">
                                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--kk-green)', lineHeight: 1 }}>{stat.value}</div>
                                    <div style={{ color: 'var(--kk-text-muted)', fontSize: 14, marginTop: 8, fontWeight: 500 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── O ŠOLI JAHANJA ── */}
                <section style={{ padding: '100px 24px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 48, alignItems: 'center' }}>

                            <div style={{ gridColumn: 'span 7' }}>
                                <div className="kk-section-badge">
                                    <GraduationCap size={12} />
                                    {t('welcome.about.badge')}
                                </div>
                                <h2 style={{ color: 'var(--kk-text)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.01em' }}>
                                    {t('welcome.about.title')}<br />
                                    <span style={{ color: 'var(--kk-green)' }}>{t('welcome.about.titleHighlight')}</span>
                                </h2>
                                <p style={{ color: 'var(--kk-text-muted)', lineHeight: 1.8, marginBottom: 20, fontSize: '1.05rem' }}>
                                    {t('welcome.about.p1')}
                                </p>
                                <p style={{ color: 'var(--kk-text-muted)', lineHeight: 1.8, marginBottom: 20, fontSize: '1.05rem' }}>
                                    {t('welcome.about.p2a')} <strong style={{ color: 'var(--kk-green)' }}>{t('welcome.about.p2horses')}</strong> {t('welcome.about.p2b')} <strong style={{ color: 'var(--kk-text)' }}>{t('welcome.about.p2arenas')}</strong>.
                                </p>
                                <p style={{ color: 'var(--kk-text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    {t('welcome.about.p3')}
                                </p>
                                <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                                    <a href="https://kkkarlo.si/urnik/" target="_blank" rel="noopener noreferrer" className="kk-btn-primary">
                                        {t('welcome.about.ctaSchedule')}
                                        <ChevronRight size={16} />
                                    </a>
                                    <a href="https://kkkarlo.si/izpiti-licence-treningi/" target="_blank" rel="noopener noreferrer" className="kk-btn-ghost">
                                        {t('welcome.about.ctaExams')}
                                    </a>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 5' }}>
                                <div className="kk-img-frame">
                                    <img
                                        src="/images/sola-jahanja-zacetniki.png"
                                        alt={t('welcome.about.imgAlt')}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── PROGRAMI ── */}
                <section className="kk-sections-alt" style={{ padding: '80px 24px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div className="kk-section-badge" style={{ margin: '0 auto 16px' }}>
                                <Swords size={12} />
                                {t('welcome.programs.badge')}
                            </div>
                            <h2 style={{ color: 'var(--kk-text)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>
                                {t('welcome.programs.title')}
                            </h2>
                            <p style={{ color: 'var(--kk-text-faint)', maxWidth: 500, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
                                {t('welcome.programs.subtitle')}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            {programs.map((prog, i) => {
                                const Icon = prog.icon;
                                return (
                                    <div key={i} className="kk-card">
                                        <div style={{ position: 'relative', height: 220 }}>
                                            <img src={prog.image} alt={prog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
                                            <div style={{
                                                position: 'absolute', top: 16, left: 16,
                                                background: prog.badgeColor,
                                                padding: '4px 12px', borderRadius: 100,
                                                fontSize: 11, fontWeight: 700, color: '#ffffff',
                                                letterSpacing: '0.05em', textTransform: 'uppercase',
                                            }}>
                                                {prog.badge}
                                            </div>
                                        </div>
                                        <div style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                <div className="kk-icon-box">
                                                    <Icon size={18} color={prog.badgeColor} />
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--kk-text)', fontWeight: 700, fontSize: 16 }}>{prog.title}</div>
                                                    <div style={{ color: 'var(--kk-text-faint)', fontSize: 12 }}>{prog.subtitle}</div>
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--kk-text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                                                {prog.description}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--kk-green)', fontWeight: 800, fontSize: 18 }}>{prog.price}</span>
                                                <Link href={route('login')} style={{ color: 'var(--kk-green)', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {t('welcome.programs.book')} <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── CENIK ── */}
                <section style={{ padding: '100px 24px' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 52 }}>
                            <div className="kk-section-badge" style={{ margin: '0 auto 16px' }}>
                                <Star size={12} />
                                {t('welcome.pricing.badge')}
                            </div>
                            <h2 style={{ color: 'var(--kk-text)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800 }}>
                                {t('welcome.pricing.title')}
                            </h2>
                            <p style={{ color: 'var(--kk-text-faint)', marginTop: 10, lineHeight: 1.7 }}>
                                {t('welcome.pricing.subtitle')}
                            </p>
                        </div>

                        <div className="kk-pricing-table">
                            <div className="kk-pricing-hdr" style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px', padding: '16px 28px' }}>
                                <div style={{ color: 'var(--kk-green)', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('welcome.pricing.colService')}</div>
                                <div style={{ color: 'var(--kk-green)', fontWeight: 700, fontSize: 13, textAlign: 'right', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('welcome.pricing.colMembers')}</div>
                                <div style={{ color: 'var(--kk-text-muted)', fontWeight: 700, fontSize: 13, textAlign: 'right', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('welcome.pricing.colNonMembers')}</div>
                            </div>

                            {pricing.map((row, i) => (
                                <div key={i} className="kk-pricing-row" style={{
                                    display: 'grid', gridTemplateColumns: '1fr 110px 110px',
                                    padding: '14px 28px',
                                    borderBottom: i < pricing.length - 1 ? '1px solid var(--kk-border)' : 'none',
                                }}>
                                    <div style={{ color: 'var(--kk-text)', fontSize: 14, paddingRight: 16 }}>{row.service}</div>
                                    <div style={{ color: 'var(--kk-green)', fontWeight: 700, fontSize: 14, textAlign: 'right' }}>{row.member}</div>
                                    <div style={{ color: 'var(--kk-text-faint)', fontSize: 14, textAlign: 'right' }}>{row.nonMember}</div>
                                </div>
                            ))}

                            <div className="kk-pricing-foot" style={{ padding: '20px 28px' }}>
                                <div style={{ color: 'var(--kk-text-muted)', fontSize: 13 }}>
                                    🐴 <strong style={{ color: 'var(--kk-text)' }}>{t('welcome.pricing.horseCareLabel')}</strong> 450 €/mesec &nbsp;|&nbsp;
                                    🏆 <strong style={{ color: 'var(--kk-text)' }}>{t('welcome.pricing.competitionLabel')}</strong> 250 €
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 40 }}>
                            <div style={{ color: 'var(--kk-text-faint)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                                <Clock size={15} />
                                {t('welcome.pricing.hours')}
                            </div>
                            <Link href={route('login')} className="kk-btn-primary">
                                {t('welcome.pricing.cta')}
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── JAHANJE V NARAVI ── */}
                <section style={{ position: 'relative', padding: '120px 24px', overflow: 'hidden', borderTop: '1px solid var(--kk-border)' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'url(/images/jahanje-naravi.png)',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        opacity: 0.15,
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--kk-nature-bg)', opacity: 0.6 }} />
                    <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                        <div className="kk-section-badge" style={{ margin: '0 auto 16px' }}>
                            <TreePine size={12} />
                            {t('welcome.nature.badge')}
                        </div>
                        <h2 style={{ color: 'var(--kk-text)', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 900, marginBottom: 20, letterSpacing: '-0.01em' }}>
                            {t('welcome.nature.title')} <br />
                            <span style={{ color: 'var(--kk-green)' }}>{t('welcome.nature.titleHighlight')}</span>
                        </h2>
                        <p style={{ color: 'var(--kk-text-muted)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 40px' }}>
                            {t('welcome.nature.description')}
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href={route('login')} className="kk-btn-primary">
                                {t('welcome.nature.cta')}
                                <ChevronRight size={18} />
                            </Link>
                            <a href="https://kkkarlo.si/kmetija-kovacic/" target="_blank" rel="noopener noreferrer" className="kk-btn-ghost">
                                {t('welcome.nature.ctaFarm')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── KONTAKT / FOOTER CONTACT — always dark ── */}
                <footer>
                    <div className="kk-footer-contact">
                        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <img src="/images/karlo-icon.png" alt="KK Karlo" style={{ height: 44, width: 44, borderRadius: 10, objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 18 }}>{t('welcome.footer.clubName')}</div>
                                            <div style={{ color: '#4ade80', fontSize: 12, fontWeight: 500 }}>{t('welcome.footer.clubTagline')}</div>
                                        </div>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, maxWidth: 340 }}>
                                        {t('welcome.footer.clubDescription')}
                                    </p>
                                </div>

                                <div>
                                    <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                                        {t('welcome.footer.contactHeading')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <a href="tel:041580117" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, transition: 'color 0.2s' }}
                                            onMouseOver={e => (e.currentTarget.style.color = '#4ade80')}
                                            onMouseOut={e => (e.currentTarget.style.color = '#e2e8f0')}>
                                            <Phone size={16} color="#4ade80" />
                                            041 580 117 – Miha
                                        </a>
                                        <a href="mailto:info@kkkarlo.si" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, transition: 'color 0.2s' }}
                                            onMouseOver={e => (e.currentTarget.style.color = '#4ade80')}
                                            onMouseOut={e => (e.currentTarget.style.color = '#e2e8f0')}>
                                            <Mail size={16} color="#4ade80" />
                                            info@kkkarlo.si
                                        </a>
                                        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                                            <MapPin size={16} color="#4ade80" />
                                            Meljski hrib 41, 2000 Maribor
                                        </div>
                                        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                                            <Clock size={16} color="#4ade80" />
                                            {t('welcome.footer.openingHours')}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                                        {t('welcome.footer.ridingSchoolHeading')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {footerLinks.map((link, i) => (
                                            <a key={i}
                                                href={`https://kkkarlo.si/${link.slug}/`}
                                                target="_blank" rel="noopener noreferrer"
                                                style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                                                onMouseOver={e => (e.currentTarget.style.color = '#4ade80')}
                                                onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                                                <ChevronRight size={13} color="#4ade80" />
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                                        {t('welcome.footer.farmHeading')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {[
                                            { label: t('welcome.footer.farmFood'),  href: 'https://kkkarlo.si/kmetija-kovacic/' },
                                            { label: t('welcome.footer.farmWine'),  href: 'https://kkkarlo.si/vinogradnistvo/' },
                                            { label: t('welcome.footer.farmHotel'), href: 'https://www.frosthotel.si' },
                                        ].map((link, i) => (
                                            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                                                style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                                                onMouseOver={e => (e.currentTarget.style.color = '#4ade80')}
                                                onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
                                                <ChevronRight size={13} color="#4ade80" />
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 28 }}>
                                        <Link href={route('login')} className="kk-btn-primary" style={{ fontSize: 13, color: '#fff' }}>
                                            {t('welcome.footer.bookOnline')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kk-footer-bottom">
                        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                            <p style={{ color: '#374151', fontSize: 13 }}>
                                © {new Date().getFullYear()} KK Karlo, {t('welcome.footer.rights')}. &nbsp;|&nbsp; Meljski hrib 41, Maribor &nbsp;|&nbsp;{' '}
                                <a href="https://kkkarlo.si" style={{ color: '#4ade80', textDecoration: 'none' }}>kkkarlo.si</a>
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
