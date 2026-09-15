import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { onSessionExpired } from '../api/authEvents';
import { useToast } from '../toast/toastContext';

export function SessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.clear();
        toast.error('Your session expired. Please log in again.');
        const current = locationRef.current;
        if (current.pathname !== '/login') {
          navigate('/login', { state: { from: current }, replace: true });
        }
      }),
    [navigate, toast, queryClient]
  );

  return null;
}
