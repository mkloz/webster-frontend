'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Skeleton } from '@/shared/components/ui/skeleton';

import { QueryKeys } from '../../../../shared/constants/query-keys';
import { type PicsumImage, PicsumService } from '../../services/picsum.service';

interface ImageSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

export const ImageSearchDialog = ({ isOpen, onClose, onImageSelect }: ImageSearchDialogProps) => {
  const [currentPage, setCurrentPage] = useState(2);
  const imagesPerPage = 12;

  // React Query for fetching images
  const {
    data: images = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [QueryKeys.PISCUM_IMAGES, currentPage, imagesPerPage],
    queryFn: () => PicsumService.getImages(currentPage, imagesPerPage),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Handle image selection
  const handleImageSelect = useCallback(
    (image: PicsumImage) => {
      try {
        // Use the high-quality download URL
        onImageSelect(image.download_url);

        // Show attribution toast
        toast.success(
          <div className="text-xs">
            Photo by <span className="font-medium">{image.author}</span> from{' '}
            <a href="https://picsum.photos" target="_blank" rel="noopener noreferrer" className="underline">
              Lorem Picsum
            </a>
          </div>
        );

        // Close the dialog
        onClose();
      } catch (err) {
        toast.error('Failed to import image. Please try again.');
        console.error('Error selecting image:', err);
      }
    },
    [onImageSelect, onClose]
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[97vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Browse Free Images</DialogTitle>
          <DialogDescription>High-quality images from Lorem Picsum</DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center">
            <p className="mb-2">Failed to load images. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: imagesPerPage }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No images found on this page.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative cursor-pointer rounded-lg overflow-hidden bg-muted"
                      onClick={() => handleImageSelect(image)}>
                      <img
                        src={image.url || '/placeholder.svg'}
                        alt={image.description}
                        className="w-full aspect-[4/3] object-cover transition-all duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium truncate">#{image.id}</p>
                          <p className="text-white/80 text-xs truncate">by {image.author}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">Page {currentPage - 1}</span>

              <Button variant="outline" onClick={handleNextPage} disabled={isLoading || images.length < imagesPerPage}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
