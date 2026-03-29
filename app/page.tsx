import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BarChart3, Zap, Users, BookOpen, Brain, ArrowRight, Star, TrendingUp, Shield } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Generate unlimited high-quality questions with AI across all topics and difficulty levels.',
      color: 'from-indigo-500 to-purple-600',
      glow: 'shadow-indigo-500/20',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Track subject-wise performance, score trends, and time analysis with interactive charts.',
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/20',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get step-by-step explanations and concept clarity immediately after each question.',
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20',
    },
    {
      icon: BookOpen,
      title: 'Vast Question Bank',
      description: 'Access thousands of curated questions for JEE, NEET, UPSC and more.',
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/20',
    },
    {
      icon: Shield,
      title: 'Proctored Tests',
      description: 'Take tests under real exam conditions with camera and tab-switch monitoring.',
      color: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/20',
    },
    {
      icon: TrendingUp,
      title: 'Proven Results',
      description: 'Students using SmartPrep improve their scores by an average of 23%.',
      color: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/20',
    },
  ];

  const stats = [
    { number: '50,000+', label: 'Questions', icon: BookOpen },
    { number: '10,000+', label: 'Active Students', icon: Users },
    { number: '95%', label: 'Success Rate', icon: CheckCircle2 },
    { number: '100+', label: 'Subjects', icon: Star },
  ];

  const steps = [
    { step: 1, title: 'Create Your Account', description: 'Register in seconds and choose your target exam — JEE, NEET, UPSC, and more.' },
    { step: 2, title: 'Practice with AI', description: 'Take AI-generated tests tailored to your syllabus and track your weak areas.' },
    { step: 3, title: 'Ace Your Exam', description: 'Monitor improvement with detailed analytics and targeted practice until exam day.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SmartPrep <span className="text-indigo-400">AI</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href={ROUTES.LOGIN}>
                <button className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/30">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -top-10 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
            <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
            Trusted by 10,000+ students across India
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-slide-up">
            Master Your Exams{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">with AI Power</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Personalized exam prep for JEE, NEET, UPSC and more — powered by AI-generated questions, real-time proctoring, and deep performance analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link href={ROUTES.REGISTER}>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="#features">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 font-semibold rounded-xl transition-all hover:bg-white/5">
                Explore Features
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 py-14 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <Icon className="w-6 h-6 text-indigo-400 mx-auto mb-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stat.number}</div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Everything you need to <span className="gradient-text">succeed</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete exam preparation ecosystem — from question creation to performance tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 card-hover"
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} items-center justify-center mb-4 shadow-lg ${feature.glow}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How SmartPrep Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to exam mastery</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            {steps.map((item, i) => (
              <div key={item.step} className="text-center relative" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold text-xl mb-5 shadow-xl shadow-indigo-500/30 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="relative p-12 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                Ready to ace your exam?
              </h2>
              <p className="text-xl text-slate-400 mb-8">
                Join thousands of students already improving their scores with SmartPrep AI.
              </p>
              <Link href={ROUTES.REGISTER}>
                <button className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">SmartPrep AI</span>
              </div>
              <p className="text-sm text-slate-500">AI-powered exam preparation for smarter learning.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'AI Generation'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-3 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2026 SmartPrep AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
