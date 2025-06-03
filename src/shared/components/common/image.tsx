'use client';

import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

import { ImagePlaceholder } from './image-placeholder';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  blurAmount?: string;
  loadingClassName?: string;
  loadingComponent?: React.ReactNode;
  noImageComponent?: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  wrapperClassName?: string;
  showLoader?: boolean;
  showNoImage?: boolean;
}

// Default loading component
const DefaultLoader = () => (
  <div className="bg-background/80 rounded-full p-1 shadow-sm aspect-square max-w-1/6 max-h-1/6">
    <Loader2 className="size-full animate-spin text-primary aspect-square" />
  </div>
);

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      fallbackSrc,
      alt,
      className,
      blurAmount = '0.5rem',
      loadingComponent = <DefaultLoader />,
      noImageComponent = <ImagePlaceholder />,
      fallbackComponent = <ImagePlaceholder />,
      wrapperClassName,
      showNoImage = true,
      style,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const imageRef = React.useRef<HTMLImageElement>(null);
    const [fallbackFailed, setFallbackFailed] = React.useState(false);

    // Check if src is provided
    const isSrcProvided = Boolean(src && src !== '');

    // Determine the actual source to use
    const actualSrc = error && fallbackSrc ? fallbackSrc : src;

    React.useEffect(() => {
      if (!isSrcProvided) return;

      if (imageRef.current) {
        if (!imageRef.current.complete) {
          setIsLoading(true);
        }
      }
    }, [isSrcProvided, actualSrc]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      props.onLoad?.(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (fallbackSrc && src !== fallbackSrc && !error) {
        setError(true);
      } else {
        setFallbackFailed(true);
      }
      props.onError?.(event);
    };

    const imageStyle = {
      ...style,
      filter: isLoading ? `blur(${blurAmount})` : 'none',
      transition: 'filter 0.3s ease-in-out'
    };

    return (
      <div className={cn('relative w-full h-full', wrapperClassName)}>
        {!fallbackFailed && (
          <img
            ref={(node) => {
              (imageRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            src={actualSrc}
            alt={alt}
            style={imageStyle}
            className={cn(className, 'object-cover w-full h-full')}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        )}

        {/* Show fallback component when both original and fallback src fail */}
        {fallbackFailed && (
          <div className={cn('absolute inset-0 flex items-center justify-center', className)}>{fallbackComponent}</div>
        )}

        {/* Show no image component when no src is provided */}
        {!isSrcProvided && showNoImage && (
          <div className={cn('absolute inset-0 flex items-center justify-center', className)}>{noImageComponent}</div>
        )}

        {/* Show loading component when image is loading */}
        {isLoading && isSrcProvided && !fallbackFailed && (
          <div className={cn('absolute inset-0 flex items-center justify-center', className)}>{loadingComponent}</div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';
