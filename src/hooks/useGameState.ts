import { useState } from 'react';
export default function useGameState() {
  const [coins, setCoins] = useState(0);
  const addCoins = (n: number) => setCoins((c) => c + n);
  return { coins, addCoins };
}