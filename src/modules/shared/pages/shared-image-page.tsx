'use client';

import ky from 'ky';
import { ArrowLeft, Download, ExternalLink, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

export const SharedImagePage = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const decodedUrl = url ? decodeURIComponent(url) : '';
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Get actual image dimensions
  useEffect(() => {
    if (!decodedUrl) return;

    const img = document.createElement('img');
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = decodedUrl;
  }, [decodedUrl]);

  const handleDownload = async () => {
    if (!decodedUrl) return;

    try {
      const blob = await ky(decodedUrl, { mode: 'cors' }).blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `webster-artwork-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      toast.success('Download started successfully');
    } catch {
      toast.error('Failed to download the image. Please try again later.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this artwork created on Webster',
          text: 'Amazing artwork created with Webster - the creative canvas platform',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error occurred
        handleFallbackShare();
      }
    } else {
      handleFallbackShare();
    }
  };

  const handleFallbackShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleViewOriginal = () => {
    window.open(decodedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  if (!decodedUrl) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Share Link</h1>
            <p className="text-muted-foreground mb-8">The shared image link appears to be invalid or corrupted.</p>
            <Button onClick={handleBackToApp}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Webster
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button & Header */}
          <div className="flex items-center justify-between mb-6 py-4">
            <div className="flex items-center gap-6">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-foreground mb-1">Shared Artwork</h1>
                <p className="text-muted-foreground">Created with Webster • High Quality Export</p>
              </div>
            </div>
            <div className="grid gap-2">
              {!isLoading && imageDimensions.width > 0 && (
                <Badge variant="default">
                  {imageDimensions.width} × {imageDimensions.height}
                </Badge>
              )}
              <Badge variant="outline">PNG Format</Badge>
            </div>
          </div>

          {/* Main Image Card */}
          <Card className="overflow-hidden mb-8 p-8 relative flex items-center justify-center">
            <div
              className="relative max-w-full max-h-[70vh]"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%'
              }}>
              <img
                src={decodedUrl || '/placeholder.svg'}
                alt="Shared artwork created with Webster"
                className="max-w-full max-h-[70vh] object-contain rounded shadow-md"
                style={{
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>

            <div className="absolute top-4 right-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" onClick={handleViewOriginal}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View original image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleDownload} size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Artwork
            </Button>

            <Button variant="outline" onClick={handleShare} size="lg">
              <Share2 className="h-4 w-4 mr-2" />
              Share Again
            </Button>

            <Button variant="outline" onClick={handleBackToApp} size="lg">
              Create Your Own
            </Button>
          </div>

          <Separator className="my-8" />

          {/* Footer Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Created with</span>
              <Badge variant="outline" className="font-medium">
                Webster
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Webster is a powerful creative canvas platform that lets you bring your artistic visions to life. Start
              creating your own masterpieces today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
