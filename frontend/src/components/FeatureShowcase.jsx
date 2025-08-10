import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, X, ChevronRight, Sliders, Activity, 
  Volume2, TrendingUp, Settings, Target, Zap 
} from 'lucide-react';

const FeatureShowcase = ({ onClose }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const features = [
    {
      icon: <Sliders className="w-8 h-8" />,
      title: "EQ Gráfico Interativo",
      description: "Ajuste de 4 bandas com visualização em tempo real da resposta de frequência. Clique e arraste os nós para modificar frequência e ganho.",
      highlights: ["Controle visual intuitivo", "4 bandas parametrizadas", "Presets profissionais"],
      color: "#22c55e"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Analisador de Espectro",
      description: "Visualize o conteúdo de frequência do seu áudio em tempo real com análise FFT de alta resolução.",
      highlights: ["Análise FFT em tempo real", "Modo espectro e waveform", "Resolução configurável"],
      color: "#3b82f6"
    },
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: "Compressor Avançado",
      description: "Compressor profissional com visualização da curva de compressão e medidor de redução de ganho.",
      highlights: ["Curva de compressão visual", "Medidor de gain reduction", "Controles profissionais"],
      color: "#f59e0b"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Sistema de Automação",
      description: "Automatize parâmetros com curvas precisas. Grave, edite e reproduza automações em tempo real.",
      highlights: ["Automação de parâmetros", "Curvas customizáveis", "Modos: Read, Write, Touch, Latch"],
      color: "#ef4444"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [features.length]);

  if (!isVisible) return null;

  const feature = features[currentFeature];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-gradient-to-br from-[#1a1a1b] to-[#0f0f11] border-[#ff4500]/30 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#ff4500]" />
              <Badge variant="secondary" className="text-xs bg-[#ff4500]/20 text-[#ff4500]">
                Novidade!
              </Badge>
            </div>
            <Button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-start space-x-3 mb-4">
            <div 
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
            >
              {feature.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">
                {feature.title}
              </h4>
              <p className="text-gray-300 text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {feature.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-[#ff4500] flex-shrink-0" />
                <span className="text-gray-300 text-xs">{highlight}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentFeature ? 'bg-[#ff4500]' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-[#ff4500]/30 text-[#ff4500] hover:bg-[#ff4500]/10"
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
            >
              Experimentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureShowcase;