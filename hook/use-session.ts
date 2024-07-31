import { create } from 'zustand';

interface State {
  tabValue: string;
  setTabValue: (value: string) => void;
  
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const useSession = create<State>((set) => ({
  tabValue: 'login',
  setTabValue: (value: string) => set({ tabValue: value }),
  
  loading: false,
  setLoading: (value: boolean) => set({ loading: value }),
}));

export default useSession;
