import 'client-only'
import { useAppStore, useGroupsStore } from '@/state'

export const useStore = {
  app: useAppStore,
  groups: useGroupsStore,
}
