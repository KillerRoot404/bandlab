import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Play, Users, Music, Headphones, Share2, Zap } from 'lucide-react';

const Homepage = () => {
  const features = [
    {
      icon: Music,
      title: 'Create Music',
      description: 'Professional-grade music creation tools with unlimited tracks and effects.'
    },
    {
      icon: Users,
      title: 'Collaborate',
      description: 'Work together with musicians worldwide in real-time collaboration.'
    },
    {
      icon: Share2,
      title: 'Share & Discover',
      description: 'Share your music and discover amazing tracks from the community.'
    },
    {
      icon: Zap,
      title: 'AI-Powered Tools',
      description: 'Enhance your creativity with AI-powered composition and mixing tools.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              The Future of Music.
              <br />
              Here Today
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Make music anytime, anywhere. Connect with millions. Release your tracks 
              and engage with fans — keep 100% of your earnings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/studio">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg px-8 py-3 h-auto"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Get Started
                </Button>
              </Link>
              <Link to="/feed">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-3 h-auto"
                >
                  <Headphones className="mr-2 w-5 h-5" />
                  Explore Music
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">25M+</div>
              <div className="text-gray-400">Active Musicians</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50M+</div>
              <div className="text-gray-400">Tracks Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Music creation for all.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Record, mix and collaborate on your music projects from start to finish 
              with our best-in-class and 100% free Studio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-700">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to create your masterpiece?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join millions of musicians creating, collaborating, and sharing their music.
            </p>
            <Link to="/studio">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg px-8 py-3 h-auto"
              >
                <Music className="mr-2 w-5 h-5" />
                Start Creating Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;