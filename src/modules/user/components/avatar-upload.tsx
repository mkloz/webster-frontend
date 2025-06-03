import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { userGroupOptions } from '@/modules/auth/queries/use-auth.query';
import { UserService } from '@/modules/user/services/user.service';
import { UserAvatar } from '@/shared/components/common/user-avatar';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface AvatarUploadProps {
  user: {
    name: string;
    avatar?: string | null;
  };
}

export const AvatarUpload = ({ user }: AvatarUploadProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => UserService.updateAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries(userGroupOptions());
      toast.success('Avatar updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload avatar: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  });

  const handleFileChange = (file: File) => {
    setSelectedAvatar(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewAvatar(String(event.target?.result));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (selectedAvatar) {
      await uploadAvatar.mutateAsync(selectedAvatar);
      setSelectedAvatar(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileChange(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    noClick: true, // We'll handle clicks separately for better UX
    noKeyboard: false
  });

  return (
    <div
      className={cn(
        'flex flex-col items-center space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50 border-dashed transition-all duration-200',
        isDragActive && 'border-primary'
      )}
      {...getRootProps()}>
      <button
        type="button"
        onClick={open}
        className={cn('relative group cursor-pointer transition-all duration-200', isDragActive ? 'scale-105' : '')}>
        <UserAvatar
          className="h-24 w-24 group-hover:opacity-80 transition-opacity"
          user={{
            name: user.name,
            avatar: previewAvatar || user.avatar
          }}
        />
        <input {...getInputProps()} id="avatar-upload" />

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity',
            isDragActive ? 'opacity-100 bg-background/50' : 'opacity-0 group-hover:opacity-100'
          )}>
          <div className="p-2 bg-background/80 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
            <Upload className="h-5 w-5 text-primary" />
            <span className="sr-only">Upload avatar</span>
          </div>
        </div>
      </button>

      <p className="text-xs text-muted-foreground text-center">
        {isDragActive ? 'Drop the image here' : 'Drag & drop an image or click to browse'}
      </p>

      {selectedAvatar && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAvatarUpload}
            disabled={uploadAvatar.isPending}
            isLoading={uploadAvatar.isPending}>
            Upload Avatar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedAvatar(null);
              setPreviewAvatar(null);
            }}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
