import { useRef, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 80;

export default function PullToRefresh({ children, queryKeys }: { children: ReactNode; queryKeys: string[][] }) {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullY = useMotionValue(0);
  const rotate = useTransform(pullY, [0, THRESHOLD], [0, 360]);
  const opacity = useTransform(pullY, [0, 40, THRESHOLD], [0, 0.5, 1]);
  const scale = useTransform(pullY, [0, THRESHOLD], [0.5, 1]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current) return;
    const dy = Math.max(0, (e.touches[0].clientY - startY.current) * 0.4);
    pullY.set(Math.min(dy, THRESHOLD + 20));
  }, [pullY]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullY.get() >= THRESHOLD) {
      setRefreshing(true);
      await Promise.all(queryKeys.map(k => qc.invalidateQueries({ queryKey: k })));
      await new Promise(r => setTimeout(r, 400));
      setRefreshing(false);
    }
    pullY.set(0);
  }, [pullY, queryKeys, qc]);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <motion.div className="flex justify-center" style={{ height: pullY, opacity }}>
        <motion.div style={{ rotate, scale }} className="mt-2">
          <RefreshCw className={`h-5 w-5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
