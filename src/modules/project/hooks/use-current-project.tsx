import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { QueryKeys } from '../../../shared/constants/query-keys';
import { ProjectService } from '../services/project.service';

interface SelectedProjectIdState {
  id: string | null;
  setId: (id: string | null) => void;
  clearId: () => void;
  _hasHydrated: boolean;
  _setHasHydrated: (hasHydrated: boolean) => void;
}

const LOCAL_STORAGE_KEY = 'current-project-id';

export const useSelectedProjectId = create(
  persist<SelectedProjectIdState>(
    (set) => ({
      id: null,
      _hasHydrated: false,
      setId: (id) => {
        set(() => ({ id }));
      },
      clearId: () => {
        set(() => ({ id: null }));
      },
      _setHasHydrated: (hasHydrated: boolean) => {
        set(() => ({ _hasHydrated: hasHydrated }));
      }
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
      // Only persist the id, not the hydration state
      partialize: (state) => ({
        id: state.id,
        setId: state.setId,
        clearId: state.clearId,
        _hasHydrated: state._hasHydrated,
        _setHasHydrated: state._setHasHydrated
      })
    }
  )
);

export const useProject = (id: string | null) =>
  useQuery({
    queryKey: [QueryKeys.PROJECTS, id],
    queryFn: () => ProjectService.getOne(id!),
    enabled: !!id
  });

export const useCurrentProject = () => {
  const { id, _hasHydrated } = useSelectedProjectId();

  return {
    ...useProject(id),
    hasHydrated: _hasHydrated,
    currentProjectId: id
  };
};
