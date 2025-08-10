import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Volume2, Play, AlertCircle } from 'lucide-react';

const AudioActivationPrompt = ({ 
  isVisible, 
  onActivate, 
  onDismiss, 
  title = "Enable Audio",
  message = "Click to enable audio playback for this session" 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
            <Volume2 className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-white text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-300">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-orange-50/5 border border-orange-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-orange-400 mb-1">Why is this needed?</p>
              <p>Browsers require user interaction before playing audio. This is a one-time activation for your session.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onActivate}
              className="flex-1 bg-[#ff4500] hover:bg-[#e63e00] text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Enable Audio
            </Button>
            
            {onDismiss && (
              <Button 
                onClick={onDismiss}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Later
              </Button>
            )}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            This will enable playback for instruments, samples, and uploaded audio.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioActivationPrompt;