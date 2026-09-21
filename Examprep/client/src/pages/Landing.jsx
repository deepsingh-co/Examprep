import { Link } from "react-router-dom";
import { GraduationCap, Shield, ChevronRight, BarChart3, BrainCircuit, Lock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const Landing = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary-light selection:text-primary-hover">
      
      {/* Sticky Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-subtle"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary text-gray-900 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              E
            </div>
            <span className="text-xl font-heading font-bold text-gray-900 tracking-tight">IntelliExam</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/admin/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Administrator
            </Link>
            <Link to="/student/login" className="btn-primary">
              Student Portal
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40 overflow-hidden relative">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-semibold mb-8 border border-primary/10"
          >
            <SparklesIcon className="w-4 h-4" />
            Next-Gen AI Assessment Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-gray-900 tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]"
          >
            Master Your Exams with <span className="text-primary">Intelligent Insights</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Experience a seamless, AI-driven assessment platform designed for modern institutions. Advanced proctoring, personalized study plans, and actionable analytics.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/student/signup" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-base px-8 py-3.5">
              Get Started <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/admin/login" className="btn-secondary w-full sm:w-auto justify-center text-base px-8 py-3.5">
              View Admin Portal
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Split Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-20 text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-6">
              Built for Academic Excellence
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600">
              Our platform bridges the gap between sophisticated testing requirements and a flawless user experience.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeUp} className="surface-card p-8">
              <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure AI Proctoring</h3>
              <p className="text-gray-600 leading-relaxed">
                Maintain academic integrity with advanced behavioral analysis and intelligent proctoring annotations that flag suspicious activity automatically.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} className="surface-card p-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Adaptive Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate high-quality question banks instantly. Our AI models create balanced, rigorous exams tailored to specific learning objectives.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} className="surface-card p-8">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Actionable Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Uncover deep insights into student performance. Identify knowledge gaps and provide targeted feedback to improve learning outcomes.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Portals Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-6">
                A Unified Experience
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you are a student striving for top marks or an administrator managing rigorous assessments, IntelliExam provides a tailored, frictionless interface.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <GraduationCap className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">For Students</h4>
                    <p className="text-gray-600 mt-1">Access personalized study plans, track global rankings, and take exams in a distraction-free environment.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <Shield className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">For Administrators</h4>
                    <p className="text-gray-600 mt-1">Orchestrate assessments, manage massive question banks, and review detailed attempt logs with ease.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-1 lg:order-2 relative"
            >
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden relative shadow-elevated border border-gray-200">
                {/* Abstract UI Representation */}
                <div className="absolute inset-0 bg-white">
                  <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="p-8 flex gap-6 h-full">
                    <div className="w-1/4 space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-4 bg-primary-light rounded w-4/6"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </div>
                    <div className="w-3/4 space-y-6">
                      <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-gray-50 border border-gray-100 rounded-xl"></div>
                        <div className="h-24 bg-gray-50 border border-gray-100 rounded-xl"></div>
                      </div>
                      <div className="h-40 bg-gray-50 border border-gray-100 rounded-xl w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-gray-900 rounded flex items-center justify-center font-bold text-xs">E</div>
            <span className="font-heading font-bold text-gray-900">IntelliExam</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            © 2026 IntelliExam. Professionally Crafted.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Mini Sparkle Icon for the badge
function SparklesIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default Landing;
