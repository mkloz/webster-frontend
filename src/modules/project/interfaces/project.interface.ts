export interface Project {
  id: string;
  name: string;
  previewUrl?: string;
  canvas?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateProjectDto {
  name: string;
  canvas?: string;
  previewUrl?: string;
}
