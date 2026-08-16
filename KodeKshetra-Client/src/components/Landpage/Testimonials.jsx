import React, { useState, useEffect } from 'react';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials = [
    {
      id: 0,
      rating: 5,
      badge: 'LEGEND',
      quote: "This platform revolutionized how I approach algorithmic thinking. The real-time pressure of battles improved my coding speed by 300% and made DSA practice genuinely addictive rather than tedious.",
      author: {
        name: 'Alex Kumar',
        title: 'Senior Software Engineer @ Google 🇺🇸',
        avatar: 'AK',
        stats: ['1,247 Battles Won', 'Master Rank']
      },
      colors: {
        border: 'border-purple-600',
        glow: 'shadow-[0_0_50px_rgba(138,43,226,0.3)]',
        badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-400',
        avatar: 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 shadow-[0_0_30px_#8A2BE2]',
        name: 'text-purple-400',
        quoteColor: '#8A2BE2'
      }
    },
    {
      id: 1,
      rating: 5,
      badge: 'MASTER',
      quote: "The competitive programming battles here pushed my problem-solving abilities to new heights. Nothing compares to the adrenaline rush of solving complex algorithms under time pressure against skilled opponents.",
      author: {
        name: 'Priya Sharma',
        title: 'Computer Science Student @ IIT Delhi 🇮🇳',
        avatar: 'PS',
        stats: ['892 Battles Won', 'Expert Rank']
      },
      colors: {
        border: 'border-blue-400',
        glow: 'shadow-[0_0_50px_rgba(0,191,255,0.3)]',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-400',
        avatar: 'bg-gradient-to-r from-blue-400 to-cyan-400 border-blue-400 shadow-[0_0_30px_#00BFFF]',
        name: 'text-blue-400',
        quoteColor: '#00BFFF'
      }
    },
    {
      id: 2,
      rating: 5,
      badge: 'CHAMPION',
      quote: "The topic-specific battles are brilliant for targeted skill development. My graph algorithm expertise improved dramatically after just one month of consistent battles. The gamification kept me engaged throughout.",
      author: {
        name: 'David Liu',
        title: 'Full-Stack Developer @ Microsoft 🇨🇦',
        avatar: 'DL',
        stats: ['2,156 Battles Won', 'Grandmaster Rank']
      },
      colors: {
        border: 'border-green-500',
        glow: 'shadow-[0_0_50px_rgba(0,255,65,0.3)]',
        badge: 'bg-green-500/10 text-green-400 border-green-500',
        avatar: 'bg-gradient-to-r from-green-400 to-emerald-400 border-green-500 shadow-[0_0_30px_#00FF41]',
        name: 'text-green-400',
        quoteColor: '#00FF41'
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextTestimonial();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isTransitioning, currentSlide]);

  const nextTestimonial = () => {
    const nextIndex = (currentSlide + 1) % testimonials.length;
    goToTestimonial(nextIndex);
  };

  const prevTestimonial = () => {
    const prevIndex = (currentSlide - 1 + testimonials.length) % testimonials.length;
    goToTestimonial(prevIndex);
  };

  const goToTestimonial = (index) => {
    if (isTransitioning || index === currentSlide) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <section style={{ backgroundColor: '#0a0501' }} className="py-24 relative overflow-hidden" id="reviews">
      {/* Background Effects */}
      <div 
        className="absolute top-0 left-0 w-full h-full z-[1]"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(138, 43, 226, 0.04) 0%, transparent 50%),
            conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              rgba(0, 191, 255, 0.02) 120deg, 
              transparent 240deg, 
              rgba(255, 69, 0, 0.02) 360deg)
          `
        }}
      />

      <div className="max-w-7xl mx-auto px-8 relative z-[2]">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-mono text-sm text-cyan-400 opacity-70 tracking-[3px]">
            &lt; CHRONICLES &gt;
          </div>
          
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight relative"
            style={{
              background: 'linear-gradient(135deg, #8A2BE2 0%, #9932CC 50%, #FF0040 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Legend Chronicles
            <span 
              className="absolute top-0 left-0 w-full h-full opacity-0"
              style={{
                background: 'linear-gradient(135deg, #CC0000 0%, #FF4500 50%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'neuralGlitch 4s ease-in-out infinite'
              }}
            >
              LEGEND CHRONICLES
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover how thousands of developers transformed their coding skills through competitive battles
          </p>
        </div>

        {/* Testimonial Container */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative h-96 md:h-[400px] overflow-hidden rounded-2xl">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`absolute w-full h-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  index === currentSlide 
                    ? 'opacity-100 transform translate-x-0' 
                    : index < currentSlide 
                      ? 'opacity-0 transform -translate-x-full'
                      : 'opacity-0 transform translate-x-full'
                }`}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prevTestimonial}
              disabled={isTransitioning}
              className="w-12 h-12 rounded-full border-2 border-blue-400 text-blue-400 flex items-center justify-center text-base transition-all duration-300 backdrop-blur-[20px] hover:bg-gradient-to-r hover:from-cyan-400 hover:to-green-400 hover:text-white hover:scale-110 hover:shadow-[0_0_25px_rgba(0,191,255,0.5)] active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.95), rgba(26, 26, 26, 0.9))',
                boxShadow: '0 0 15px rgba(0, 191, 255, 0.2)'
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 border-2 ${
                    index === currentSlide
                      ? 'bg-blue-400 border-blue-400 shadow-[0_0_12px_#00BFFF] scale-125'
                      : 'bg-transparent border-white/30 hover:bg-gray-400 hover:scale-110'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              disabled={isTransitioning}
              className="w-12 h-12 rounded-full border-2 border-blue-400 text-blue-400 flex items-center justify-center text-base transition-all duration-300 backdrop-blur-[20px] hover:bg-gradient-to-r hover:from-cyan-400 hover:to-green-400 hover:text-white hover:scale-110 hover:shadow-[0_0_25px_rgba(0,191,255,0.5)] active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.95), rgba(26, 26, 26, 0.9))',
                boxShadow: '0 0 15px rgba(0, 191, 255, 0.2)'
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <div 
      className={`w-full h-full rounded-2xl p-10 border-2 ${testimonial.colors.border} ${testimonial.colors.glow} backdrop-blur-[20px] flex flex-col justify-between relative overflow-hidden`}
      style={{
        background: 'linear-gradient(145deg, rgba(13, 13, 13, 0.98), rgba(26, 26, 26, 0.95))'
      }}
    >
      {/* Rating and Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {[...Array(testimonial.rating)].map((_, i) => (
            <i 
              key={i}
              className="fas fa-star text-yellow-400 text-base"
              style={{
                filter: 'drop-shadow(0 0 5px #FFD700)',
                animation: `starTwinkle 2s ease-in-out infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>
        <span 
          className={`${testimonial.colors.badge} px-5 py-2 rounded-2xl text-xs font-bold border-2 font-mono`}
          style={{ boxShadow: '0 0 10px currentColor' }}
        >
          {testimonial.badge}
        </span>
      </div>

      {/* Quote with properly positioned quotation marks */}
      <div className="mb-6 relative">
        <p className="text-lg md:text-xl leading-relaxed text-white italic">
          <span 
            className="text-5xl font-serif leading-none align-top mr-1"
            style={{ 
              color: testimonial.colors.quoteColor,
              opacity: 0.5,
              textShadow: `0 0 20px ${testimonial.colors.quoteColor}`,
              fontWeight: 'bold'
            }}
          >
            "
          </span>
          {testimonial.quote}
          <span 
            className="text-5xl font-serif leading-none align-bottom ml-1"
            style={{ 
              color: testimonial.colors.quoteColor,
              opacity: 0.5,
              textShadow: `0 0 20px ${testimonial.colors.quoteColor}`,
              fontWeight: 'bold'
            }}
          >
            "
          </span>
        </p>
      </div>

      {/* Author with larger profile picture */}
      <div className="flex items-center gap-5">
        <div 
          className={`w-20 h-20 rounded-full ${testimonial.colors.avatar} flex items-center justify-center text-2xl text-white font-black border-4 relative flex-shrink-0`}
          style={{ animation: 'avatarFloat 3s ease-in-out infinite' }}
        >
          {testimonial.author.avatar}
        </div>
        <div className="flex-1">
          <h4 
            className={`${testimonial.colors.name} font-bold text-lg mb-1`}
            style={{ textShadow: '0 0 8px currentColor' }}
          >
            {testimonial.author.name}
          </h4>
          <p className="text-gray-300 text-sm mb-2">{testimonial.author.title}</p>
          <div className="flex gap-3 flex-wrap">
            {testimonial.author.stats.map((stat, index) => (
              <span 
                key={index}
                className="bg-white/10 px-3 py-1 rounded-lg text-xs text-gray-300 border border-white/20"
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Testimonials;
