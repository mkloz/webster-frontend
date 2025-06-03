'use client';

import { useMutation } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Facebook,
  Instagram,
  Link,
  Linkedin,
  Mail,
  MessageSquare,
  Send,
  Share2,
  Twitter
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { toast } from 'sonner';

import { useExport } from '@/modules/project/hooks/use-export';
import { FileUploadService } from '@/modules/project/services/file-upload.service';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';

type SocialPlatform = {
  name: string;
  icon: ReactNode;
  iconColor: string;
  textColorClass: string;
  hoverBgClass: string;
  hoverBorderClass: string;
  iconBgClass: string;
  getUrl: (sharedUrl: string) => string;
};

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Facebook',
    icon: <Facebook className="h-6 w-6" />,
    iconColor: '#1877F2',
    textColorClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    hoverBgClass: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    hoverBorderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/40',
    getUrl: (sharedUrl: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharedUrl)}`
  },
  {
    name: 'Twitter',
    icon: <Twitter className="h-6 w-6" />,
    iconColor: '#1DA1F2',
    textColorClass: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
    hoverBgClass: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    hoverBorderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/40',
    getUrl: (sharedUrl: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my artwork created on Webster!')}&url=${encodeURIComponent(sharedUrl)}`
  },
  {
    name: 'Instagram',
    icon: <Instagram className="h-6 w-6" />,
    iconColor: '#E4405F',
    textColorClass: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    hoverBgClass: 'hover:bg-pink-100 dark:hover:bg-pink-900/30',
    hoverBorderClass: 'hover:border-pink-300 dark:hover:border-pink-700',
    iconBgClass: 'bg-pink-100 dark:bg-pink-900/40',
    getUrl: (sharedUrl: string) => `https://www.instagram.com/?url=${encodeURIComponent(sharedUrl)}`
  },
  {
    name: 'LinkedIn',
    icon: <Linkedin className="h-6 w-6" />,
    iconColor: '#0A66C2',
    textColorClass: 'group-hover:text-blue-700 dark:group-hover:text-blue-400',
    hoverBgClass: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    hoverBorderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/40',
    getUrl: (sharedUrl: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharedUrl)}`
  }
];

const MESSAGING_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Email',
    icon: <Mail className="h-6 w-6" />,
    iconColor: '#6B7280',
    textColorClass: 'group-hover:text-gray-700 dark:group-hover:text-gray-300',
    hoverBgClass: 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
    hoverBorderClass: 'hover:border-gray-300 dark:hover:border-gray-700',
    iconBgClass: 'bg-gray-100 dark:bg-gray-800/60',
    getUrl: (sharedUrl: string) =>
      `mailto:?subject=${encodeURIComponent('Check out my artwork on Webster')}&body=${encodeURIComponent(`I created this artwork on Webster: ${sharedUrl}`)}`
  },
  {
    name: 'WhatsApp',
    icon: <Send className="h-6 w-6 rotate-45" />,
    iconColor: '#25D366',
    textColorClass: 'group-hover:text-green-600 dark:group-hover:text-green-400',
    hoverBgClass: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    hoverBorderClass: 'hover:border-green-300 dark:hover:border-green-700',
    iconBgClass: 'bg-green-100 dark:bg-green-900/40',
    getUrl: (sharedUrl: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my artwork on Webster: ${sharedUrl}`)}`
  },
  {
    name: 'Telegram',
    icon: <Send className="h-6 w-6" />,
    iconColor: '#0088cc',
    textColorClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    hoverBgClass: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    hoverBorderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/40',
    getUrl: (sharedUrl: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent('Check out my artwork on Webster')}`
  },
  {
    name: 'Messenger',
    icon: <MessageSquare className="h-6 w-6" />,
    iconColor: '#0084ff',
    textColorClass: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
    hoverBgClass: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    hoverBorderClass: 'hover:border-blue-300 dark:hover:border-blue-700',
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/40',
    getUrl: (sharedUrl: string) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(sharedUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.origin)}`
  }
];

interface PlatformButtonProps {
  platform: SocialPlatform;
  onClick: (platform: SocialPlatform) => void;
  disabled?: boolean;
}

const PlatformButton = ({ platform, onClick, disabled }: PlatformButtonProps) => {
  return (
    <Button
      key={platform.name}
      variant="outline"
      disabled={disabled}
      className={cn(
        'group flex flex-col items-center justify-center h-24 p-2 rounded-xl transition-colors aspect-square',
        platform.hoverBgClass,
        platform.hoverBorderClass,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => onClick(platform)}>
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-2', platform.iconBgClass)}>
        <span style={{ color: platform.iconColor }}>{platform.icon}</span>
      </div>
      <span className={cn('text-xs font-medium transition-colors', platform.textColorClass)}>{platform.name}</span>
    </Button>
  );
};

export const ShareProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { getPngImage } = useExport();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const imageFile = await getPngImage(1920, 1080);
      if (!imageFile) {
        throw new Error('Failed to generate image from canvas');
      }

      const response = await FileUploadService.upload(imageFile);
      return response.url;
    },
    onSuccess: (imageUrl) => {
      const sharedPageUrl = `${window.location.origin}/shared/${encodeURIComponent(imageUrl)}`;
      setShareUrl(sharedPageUrl);
      toast.success('Share link generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate share link');
      console.error('Upload error:', error);
    }
  });

  const handleGenerateLink = () => {
    uploadMutation.mutate();
  };

  const handleShare = (platform: SocialPlatform) => {
    if (!shareUrl) {
      toast.error('Please generate a share link first');
      return;
    }

    const shareUrlForPlatform = platform.getUrl(shareUrl);
    window.open(shareUrlForPlatform, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setShareUrl('');
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Share canvas">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share canvas</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Canvas</DialogTitle>
          <DialogDescription>
            {uploadMutation.isPending
              ? 'Generating your share link...'
              : shareUrl
                ? 'Your artwork is ready to share!'
                : 'Generate a share link for your artwork'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generate Link Section */}
          {!shareUrl && !uploadMutation.isPending && (
            <div className="space-y-4">
              <div className="text-center py-4 px-4 border-2 border-dashed rounded-lg">
                <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium  mb-2">Ready to Share Your Artwork?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Generate a shareable link to showcase your creation on social media and messaging platforms.
                </p>
                <Button onClick={handleGenerateLink} disabled={uploadMutation.isPending} size="lg">
                  <Link />
                  Generate Share Link
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {uploadMutation.isPending && (
            <div className="text-center py-8">
              <div className="inline-flex flex-col items-center gap-4">
                <CgSpinner className="animate-spin h-12 w-12 text-border" />
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">Uploading your artwork...</div>
                  <div className="text-xs mt-1">This may take a few seconds</div>
                </div>
              </div>
            </div>
          )}

          {/* Share Link Section */}
          {shareUrl && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 text-sm font-mono text-muted-foreground"
                    wrapperClassName="w-full"
                  />
                  <Button variant="outline" size="icon-sm" onClick={handleCopyLink} className="px-3 shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this link anywhere to showcase your artwork</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Social Media</div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <PlatformButton key={platform.name} platform={platform} onClick={handleShare} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">Messaging</div>
                  <div className="grid grid-cols-4 gap-3">
                    {MESSAGING_PLATFORMS.map((platform) => (
                      <PlatformButton key={platform.name} platform={platform} onClick={handleShare} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
