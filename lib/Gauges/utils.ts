import { parseUnits } from "ethers/lib/utils.js";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { nextThursday } from "date-fns"
<<<<<<< HEAD
import { showSuccessToast, showErrorToast } from "lib/Toasts";
import { toast } from 'react-hot-toast';
import { useState, useEffect } from "react";
=======
import { ChainId } from "lib/utils";
import { BigNumber } from "ethers";
>>>>>>> upstream/feat/vepop-page

export function calcUnlockTime(days: number, start = Date.now()): number {
  const week = 86400 * 7;
  const now = start / 1000;
  const unlockTime = now + (86400 * days);

  return Math.floor(unlockTime / week) * week * 1000;
}

export function calcDaysToUnlock(unlockTime: number): number {
  const day = 86400;
  const now = Math.floor(Date.now() / 1000)
  return Math.floor((unlockTime - now) / day)
}

export function calculateVeOut(amount: number | string, days: number) {
  const week = 7;
  const maxTime = 52 * 4; // 4 years in weeks
  const lockTime = Math.floor(days / week);
  return Number(amount) * lockTime / maxTime;
}

export function getVotePeriodEndTime(): number {
  const n = nextThursday(new Date());
  const epochEndTime = Date.UTC(
    n.getFullYear(),
    n.getMonth(),
    n.getDate(),
    0,
    0,
    0
  );
  return epochEndTime;
}

export function useCreateLock(address: string, amount: number | string, days: number) {
<<<<<<< HEAD
  const _amount = parseUnits(String(amount));
  const [unlockTime, setUnlockTime] = useState<number>(0);

  useEffect(() => {
    // This will run once when the component is mounted or whenever `days` changes
    const newUnlockTime = Math.floor(Date.now() / 1000) + (86400 * days);
    setUnlockTime(newUnlockTime);
  }, [days]);

=======
  const unlockTime = Math.floor(Date.now() / 1000) + (86400 * days);
>>>>>>> upstream/feat/vepop-page

  const { config } = usePrepareContractWrite({
    address,
    abi: ["function create_lock(uint256,uint256) external"],
    functionName: "create_lock",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false }), unlockTime],
    chainId: Number(5),
  });

  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      showSuccessToast("Lock created successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useIncreaseLockAmount(address: string, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_amount(uint256) external"],
    functionName: "increase_amount",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false })],
    chainId: Number(5),
    enabled: false,
  });


  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Lock amount increased successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useIncreaseLockTime(address: string, unlockTime: number) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_unlock_time(uint256) external"],
    functionName: "increase_unlock_time",
    args: [unlockTime],
    chainId: Number(5),
    enabled: false,
  });

  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      showSuccessToast("Lock time increased successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useWithdrawLock(address: string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw() external"],
    functionName: "withdraw",
    args: [],
    chainId: Number(5),
    enabled: false,
  });


  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      showSuccessToast("Withdrawal successful!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

<<<<<<< HEAD
=======
export function useGaugeDeposit(address: string, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function deposit(uint256 amount) external"],
    functionName: "deposit",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false })],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
  });
}

export function useGaugeWithdraw(address: string, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw(uint256 amount) external"],
    functionName: "withdraw",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false })],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
  });
}
>>>>>>> upstream/feat/vepop-page
