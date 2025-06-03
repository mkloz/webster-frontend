import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

import { useIsMobile } from '../../hooks/use-breakpoint';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  showFirstLast?: boolean;
  compact?: boolean;
}

const DOTS = 'dots';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  compact = false
}: PaginationProps) => {
  const isMobile = useIsMobile();
  const effectiveSiblingCount = isMobile || compact ? 0 : siblingCount;

  const paginationRange = useMemo(() => {
    if ((isMobile && compact) || totalPages <= 1) {
      return [];
    }

    if (isMobile && compact) {
      return [currentPage];
    }

    const totalPageNumbers = effectiveSiblingCount * 2 + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - effectiveSiblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + effectiveSiblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * effectiveSiblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * effectiveSiblingCount;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [1, DOTS, ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, DOTS, ...middleRange, DOTS, totalPages];
    }

    return [];
  }, [currentPage, totalPages, effectiveSiblingCount, isMobile, compact]);

  if (totalPages <= 1) return null;

  if (isMobile && compact) {
    return (
      <nav
        role="navigation"
        aria-label="Pagination"
        className={cn('flex justify-center items-center space-x-1', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    );
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex justify-center items-center space-x-1 sm:space-x-2', className)}>
      <Button
        variant="outline"
        size={isMobile ? 'sm' : 'icon'}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={isMobile ? 'h-8 w-8 p-0' : ''}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {paginationRange.map((item, idx) => {
        if (item === DOTS) {
          return (
            <span key={`dots-${idx}`} className="flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        const pageNumber = item as number;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? 'default' : 'outline'}
            size={isMobile ? 'sm' : 'icon'}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
            className={isMobile ? 'h-8 w-8 p-0' : ''}>
            {pageNumber}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size={isMobile ? 'sm' : 'icon'}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={isMobile ? 'h-8 w-8 p-0' : ''}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
