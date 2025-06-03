'use client';

import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type React from 'react';

import { AnimatedBackground } from '../../../modules/auth/components/common/shapes-animation';
import { useBreakpoint } from '../../hooks/use-breakpoint';

interface DeviceSizeWallProps {
  children: React.ReactNode;
}

export const DeviceSizeWall = ({ children }: DeviceSizeWallProps) => {
  const { isLaptop } = useBreakpoint();

  // Show the wall for devices smaller than laptop
  if (isLaptop) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <AnimatedBackground
          isDark={false}
          particleDensity={6000}
          connectionDistance={150}
          maxParticles={80}
          particleSpeed={0.3}
          className="absolute inset-0"
        />

        {/* Content overlay */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md mx-auto text-center">
            {/* Icon display */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                <Smartphone className="w-8 h-8 text-purple-300" />
              </div>
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
                <Tablet className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-purple-300 text-2xl">→</div>
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border-2 border-purple-300">
                <Monitor className="w-8 h-8 text-purple-300" />
              </div>
            </div>

            {/* Main message */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h1 className="text-3xl font-bold text-white mb-4">Webster Canvas</h1>
              <p className="text-lg text-purple-100 mb-6 leading-relaxed">
                This app is optimized for larger screens to provide the best design experience.
              </p>
              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-300/30">
                <p className="text-purple-100 font-medium">Please open on a desktop device</p>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-6 text-sm text-purple-200/80">
              <p>Minimum recommended screen width: 1024px</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the main app for laptop and larger devices
  return <>{children}</>;
};
