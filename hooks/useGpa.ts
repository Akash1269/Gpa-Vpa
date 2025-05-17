import { useContext } from 'react';
import { GpaContext } from '@/context/GpaContext';

export function useGpa() {
  const context = useContext(GpaContext);
  
  if (context === undefined) {
    throw new Error('useGpa must be used within a GpaProvider');
  }
  
  return context;
}