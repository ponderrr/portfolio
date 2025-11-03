import { QualityTier } from '@/hooks/useDeviceCapability';

export interface TextureAsset {
  name: string;
  url: string;
  loaded: boolean;
}

export interface TextureLoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const TEXTURE_URLS = {
  day: '/textures/earth-day-4k.jpg',
  night: '/textures/earth-night-4k.jpg',
  bump: '/textures/earth-bump-4k.jpg',
  specular: '/textures/earth-specular-4k.jpg',
  clouds: '/textures/earth-clouds-4k.png',
};

export const TEXTURE_QUALITY_CONFIG = {
  ultra: {
    resolution: '8k',
    day: '/textures/earth-day-8k.jpg',
    night: '/textures/earth-night-8k.jpg',
    bump: '/textures/earth-bump-8k.jpg',
    specular: '/textures/earth-specular-8k.jpg',
    clouds: '/textures/earth-clouds-8k.png',
  },
  high: {
    resolution: '4k',
    day: '/textures/earth-day-4k.jpg',
    night: '/textures/earth-night-4k.jpg',
    bump: '/textures/earth-bump-4k.jpg',
    specular: '/textures/earth-specular-4k.jpg',
    clouds: '/textures/earth-clouds-4k.png',
  },
  standard: {
    resolution: '2k',
    day: '/textures/earth-day-2k.jpg',
    night: '/textures/earth-night-2k.jpg',
    bump: '/textures/earth-bump-2k.jpg',
    specular: '/textures/earth-specular-2k.jpg',
    clouds: '/textures/earth-clouds-2k.png',
  },
  performance: {
    resolution: '1k',
    day: '/textures/earth-day-1k.jpg',
    night: '/textures/earth-night-1k.jpg',
    bump: '/textures/earth-bump-1k.jpg',
    specular: '/textures/earth-specular-1k.jpg',
    clouds: '/textures/earth-clouds-1k.png',
  },
};

export const getTextureUrlsForTier = (tier: QualityTier) => {
  return TEXTURE_QUALITY_CONFIG[tier];
};

export const loadTexture = (
  url: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      onProgress?.(100);
      resolve(url);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load texture: ${url}`));
    };
    
    img.src = url;
  });
};

export const loadAllTextures = async (
  textureUrls: Record<string, string>,
  onProgress?: (progress: TextureLoadProgress) => void
): Promise<Record<string, string>> => {
  const urls = Object.entries(textureUrls);
  let loaded = 0;
  const total = urls.length;
  
  const results: Record<string, string> = {};
  
  for (const [key, url] of urls) {
    try {
      await loadTexture(url, () => {
        loaded++;
        onProgress?.({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
        });
      });
      results[key] = url;
    } catch (error) {
      console.error(`Failed to load ${key} texture:`, error);
      // Fallback to default CDN texture for day map if local fails
      if (key === 'day') {
        results[key] = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
      }
    }
  }
  
  return results;
};

