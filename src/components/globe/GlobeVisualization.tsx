import { useEffect, useRef, useState } from 'react';
// @ts-ignore - globe.gl types are complex
import Globe from 'globe.gl';
import { useDeviceCapability, QualityTier } from '@/hooks/useDeviceCapability';
import { loadAllTextures, getTextureUrlsForTier } from '@/utils/textureLoader';
import { PROJECT_LOCATIONS } from '@/utils/projectCoordinates';
import { useProjectStore } from '@/stores/projectStore';
import { GlobeHUD } from './GlobeHUD';
import { QualitySelector } from './QualitySelector';
import { motion } from 'framer-motion';
import { useGlobePerformance } from '@/hooks/useGlobePerformance';

interface GlobeVisualizationProps {
  className?: string;
}

export const GlobeVisualization = ({ className = '' }: GlobeVisualizationProps) => {
  const globeEl = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [currentLat, setCurrentLat] = useState(39.8283);
  const [currentLng, setCurrentLng] = useState(-98.5795);
  const [showFPS, setShowFPS] = useState(false);
  const [selectedTier, setSelectedTier] = useState<QualityTier | null>(null);
  const deviceCapability = useDeviceCapability();
  const { projects, setSelectedProject } = useProjectStore();
  const { fps } = useGlobePerformance();

  // Use manual tier if selected, otherwise use detected tier
  const activeTier = selectedTier || deviceCapability.tier;

  // Load saved quality preference
  useEffect(() => {
    const savedTier = localStorage.getItem('globe-quality-tier') as QualityTier | null;
    if (savedTier && ['ultra', 'high', 'standard', 'performance'].includes(savedTier)) {
      setSelectedTier(savedTier);
    }
  }, []);

  // Toggle FPS with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' && e.shiftKey) {
        setShowFPS((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (!globeEl.current) return;

    let myGlobe: any;

    const initGlobe = async () => {
      try {
        // Get texture URLs for device tier
        const textureUrls = getTextureUrlsForTier(activeTier);

        // Load textures with progress tracking
        await loadAllTextures(textureUrls, (progress) => {
          setLoadingProgress(progress.percentage);
        });

        setTexturesLoaded(true);

        // Initialize globe with local textures
        // @ts-ignore
        myGlobe = Globe()(globeEl.current!)
          .globeImageUrl(textureUrls.day)
          .bumpImageUrl(textureUrls.bump)
          .width(globeEl.current!.offsetWidth)
          .height(globeEl.current!.offsetHeight)
          .backgroundColor('rgba(0,0,0,0)')
          .enablePointerInteraction(true)
          .showAtmosphere(true)
          .atmosphereColor('rgba(255, 69, 0, 0.5)') // Orange tint
          .atmosphereAltitude(0.15)
          .showGraticules(true)
          .graticulesLineColor(() => 'rgba(255, 69, 0, 0.1)');

        // Configure camera controls
        const controls = myGlobe.controls();
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;
        controls.minDistance = 150;
        controls.maxDistance = 500;
        controls.autoRotate = false;

        // Set initial camera position (centered on USA)
        myGlobe.pointOfView(
          {
            lat: 39.8283,
            lng: -98.5795,
            altitude: 2.5,
          },
          0
        );

        // Update coordinates on camera move
        const updateCoordinates = () => {
          const pov = myGlobe.pointOfView();
          setCurrentLat(pov.lat);
          setCurrentLng(pov.lng);
        };

        // Track camera changes
        controls.addEventListener('change', updateCoordinates);

        // Add project pins
        const pointsData = PROJECT_LOCATIONS.map((location) => {
          const project = projects.find((p) => p.id === location.projectId);
          return {
            lat: location.lat,
            lng: location.lng,
            size: 0.5,
            color: '#ff4500',
            label: project?.title || location.city,
            projectId: location.projectId,
          };
        });

        myGlobe
          .pointsData(pointsData)
          .pointAltitude(0.01)
          .pointColor('color')
          .pointRadius('size')
          .pointLabel((d: any) => `
            <div style="
              background: rgba(26, 26, 26, 0.95);
              border: 1px solid #ff4500;
              padding: 12px;
              border-radius: 0;
              color: #fff;
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
            ">
              <div style="color: #ff4500; margin-bottom: 8px; font-weight: 600;">
                ${d.label}
              </div>
              <div style="color: #8a8a8a; font-size: 10px;">
                ${d.lat.toFixed(4)}°N, ${Math.abs(d.lng).toFixed(4)}°W
              </div>
              <div style="color: #e5e5e5; margin-top: 8px; font-size: 10px;">
                Click to view mission details
              </div>
            </div>
          `);

        // Add pulsing animation
        let pulseScale = 1;
        const animatePulse = () => {
          pulseScale = 1 + Math.sin(Date.now() / 500) * 0.3;
          myGlobe.pointRadius(() => 0.5 * pulseScale);
          requestAnimationFrame(animatePulse);
        };
        animatePulse();

        // Handle pin clicks - fly to location and open modal
        myGlobe.onPointClick((point: any) => {
          // Fly to point location
          myGlobe.pointOfView(
            {
              lat: point.lat,
              lng: point.lng,
              altitude: 1.5,
            },
            1500 // Duration in ms
          );

          // After animation, open modal
          setTimeout(() => {
            const project = projects.find((p) => p.id === point.projectId);
            if (project) {
              setSelectedProject(project);
            }
          }, 1600);
        });

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize globe:', error);
        // Fallback to CDN texture
        if (globeEl.current) {
          // @ts-ignore
          myGlobe = Globe()(globeEl.current)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
            .width(globeEl.current.offsetWidth)
            .height(globeEl.current.offsetHeight)
            .backgroundColor('rgba(0,0,0,0)')
            .enablePointerInteraction(true);

          const controls = myGlobe.controls();
          controls.enableDamping = true;
          controls.dampingFactor = 0.1;
          controls.rotateSpeed = 0.5;
          controls.minDistance = 150;
          controls.maxDistance = 500;
          controls.autoRotate = false;

          setIsLoaded(true);
        }
      }
    };

    initGlobe();

    // Handle window resize
    const handleResize = () => {
      if (globeEl.current && myGlobe) {
        myGlobe
          .width(globeEl.current.offsetWidth)
          .height(globeEl.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup globe instance
      if (globeEl.current) {
        globeEl.current.innerHTML = '';
      }
    };
  }, [activeTier, projects, setSelectedProject]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scan Line Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute left-0 w-full h-px bg-orange-primary opacity-30"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Coordinate HUD */}
      {isLoaded && (
        <GlobeHUD currentLat={currentLat} currentLng={currentLng} isVisible={isLoaded} />
      )}

      {/* Quality Selector */}
      {isLoaded && (
        <QualitySelector
          currentTier={activeTier}
          onChange={(tier) => {
            setSelectedTier(tier);
            // Save to localStorage
            localStorage.setItem('globe-quality-tier', tier);
          }}
        />
      )}

      {/* FPS Counter */}
      {showFPS && (
        <div className="absolute top-8 left-8 font-mono text-xs text-orange-primary bg-black-elevated/80 border border-orange-primary/30 px-3 py-2 z-10">
          FPS: {fps}
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <p className="text-sm font-mono text-orange-primary">
            {texturesLoaded ? 'INITIALIZING GLOBE...' : 'LOADING TEXTURES...'}
          </p>
          {!texturesLoaded && (
            <>
              <div className="w-64 h-1 bg-gray-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-primary transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-light">
                {loadingProgress}%
              </span>
            </>
          )}
        </div>
      )}
      <div ref={globeEl} className="w-full h-full" />
    </div>
  );
};

