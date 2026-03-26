import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, BarChart3, Zap, Users, BookOpen, Brain } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get personalized feedback and adaptive learning paths powered by advanced AI',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your progress with comprehensive performance metrics and insights',
    },
    {
      icon: Zap,
      title: 'Real-Time Feedback',
      description: 'Receive instant feedback on your answers to improve faster',
    },
    {
      icon: BookOpen,
      title: 'Extensive Question Bank',
      description: 'Access thousands of questions across multiple subjects and difficulty levels',
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Connect with peers and educators for better learning experiences',
    },
    {
      icon: CheckCircle2,
      title: 'Proven Results',
      description: 'Students using SmartPrep improve their scores by an average of 23%',
    },
  ];

  const stats = [
    { number: '50,000+', label: 'Questions' },
    { number: '10,000+', label: 'Active Students' },
    { number: '95%', label: 'Success Rate' },
    { number: '100+', label: 'Subjects' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-accent" />
              <span className="text-xl font-bold text-foreground">SmartPrep</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-pretty">
              Master Your Exams with{' '}
              <span className="bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">
                AI-Powered Learning
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Personalized exam preparation with AI-generated questions, real-time feedback, and
              comprehensive analytics to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.REGISTER}>
                <Button size="lg" className="gap-2">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">{stat.number}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-pretty">
              Powerful Features for Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Everything you need to prepare for exams and track your progress
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="border-border hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <Icon className="w-8 h-8 text-accent mb-4" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-card py-20 sm:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-pretty">
              How SmartPrep Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Create or Join Tests',
                description: 'Access thousands of pre-made tests or create your own customized exams',
              },
              {
                step: 2,
                title: 'Practice with AI Feedback',
                description: 'Answer questions and get instant, personalized feedback from our AI',
              },
              {
                step: 3,
                title: 'Track Progress',
                description: 'Monitor your improvement with detailed analytics and performance metrics',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 text-pretty">
            Ready to Excel on Your Exams?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of students who are already improving their grades with SmartPrep AI.
          </p>
          <Link href={ROUTES.REGISTER}>
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">SmartPrep</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered exam preparation for smarter learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SmartPrep AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
