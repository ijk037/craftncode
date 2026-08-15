import { useEffect, useRef } from 'react';
import { useMeshStore } from '../store/useMeshStore';

export const useSimulationClock = () => {
  const isRunning = useMeshStore(state => state.isRunning);
  const tickSpeed = useMeshStore(state => state.tickSpeed);
  const stepSimulation = useMeshStore(state => state.stepSimulation);

  const lastTickRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      stepSimulation();
      lastTickRef.current = Date.now();
    }, tickSpeed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, tickSpeed, stepSimulation]);
};
