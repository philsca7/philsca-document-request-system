import { create } from 'zustand';

interface useMount {
    isMounted: boolean;
    setIsMounted: (value: boolean) => void;
}

const useMount = create<useMount>((set) => ({
    isMounted: false,
    setIsMounted: (value) => set({ isMounted: value }),
}));

export default useMount;