import { atom } from 'recoil';

export const sidebarState = atom({
  key: 'sidebarState',
  default: true, // sidebar is open by default
});
