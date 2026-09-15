import { createContext, useContext } from 'react';

export const UserStateContext = createContext(null);

export function useUserState() {
  const context = useContext(UserStateContext);
  if (!context) throw new Error('useUserState must be used within a UserStateProvider');
  return context;
}
