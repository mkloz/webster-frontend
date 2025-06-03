import { apiClient } from '../../../shared/api/api';
import { Paginated, PaginationDto } from '../../../shared/types/pagination';
import { ConverterUtils } from '../../../shared/utils/converter.utils';
import { CreateProjectDto, Project } from '../interfaces/project.interface';
interface GetManyProjectsDto extends PaginationDto {
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
export class ProjectService {
  static getMy(dto: GetManyProjectsDto) {
    const searchParams = ConverterUtils.objectToSearchParams(dto);
    return apiClient.get('projects/my', { searchParams }).json<Paginated<Project>>();
  }

  static getOne(id: string) {
    return apiClient.get(`projects/${id}`).json<Project>();
  }

  static create(data: CreateProjectDto) {
    return apiClient.post('projects', { json: data }).json<Project>();
  }

  static update(id: string, data: Partial<CreateProjectDto>) {
    return apiClient.patch(`projects/${id}`, { json: data }).json<Project>();
  }

  static delete(id: string) {
    return apiClient.delete(`projects/${id}`).json<Project>();
  }

  static uploadPreview(id: string, file: File) {
    const formData = new FormData();
    formData.append('preview', file);
    return apiClient.patch(`projects/${id}/preview`, { body: formData }).json<Project>();
  }
}
