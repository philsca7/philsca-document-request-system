import { create } from 'zustand';

interface useMenuModal{
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useMenuModal = create<useMenuModal> ((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}));

export default useMenuModal;