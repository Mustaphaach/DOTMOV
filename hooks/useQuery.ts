
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// Hook specifically for the watch page params from hash
export function useWatchQuery() {
    const { search } = useLocation();
    return useMemo(() => {
        const params = new URLSearchParams(search);
        const type = params.get('type');
        const id = params.get('id');
        const server = params.get('server');
        
        const result: { [key: string]: string } = {};

        if (server) {
            result.server = server;
        }

        if (type === 'movie' && id) {
            result.type = 'movie';
            result.id = id;
            return result;
        } else if (type === 'tv' && id && params.get('s') && params.get('e')) {
            result.type = 'tv';
            result.id = id;
            result.season = params.get('s')!;
            result.episode = params.get('e')!;
            return result;
        }
        
        return null;
    }, [search]);
}
