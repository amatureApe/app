import { Dispatch, FormEventHandler, SetStateAction, useMemo } from "react";
import { calculateVeOut } from "lib/Gauges/utils";
import { useBalanceOf } from "lib/Erc20/hooks";
import { Address, useAccount, useToken } from "wagmi";
import InputTokenWithError from "components/InputTokenWithError";
import { formatAndRoundBigNumber, safeRound } from "lib/utils";
import { BigNumber, constants } from "ethers";
import { validateInput } from "components/SweetVault/internals/input";

const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"

export default function IncreaseStakeInterface({ amountState, daysState, lockedBal }:
  { amountState: [number, Dispatch<SetStateAction<number>>], daysState: [number, Dispatch<SetStateAction<number>>], lockedBal: [BigNumber, BigNumber] }): JSX.Element {
  const { address: account } = useAccount()

  const { data: pop } = useToken({ chainId: 5, address: POP as Address });
  const { data: popBal } = useBalanceOf({ chainId: 5, address: POP, account })

  const [amount, setAmount] = amountState
  const [days, ] = daysState

  const errorMessage = useMemo(() => {
    return (amount || 0) > Number(popBal?.formatted) ? "* Balance not available" : "";
  }, [amount, popBal?.formatted]);

  const handleMaxClick = () => setAmount(safeRound(popBal?.value || constants.Zero, 18));

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setAmount(validateInput(value).isValid ? Number(value as any) : 0);
  };

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Lock your POP</h2>

      <div>
        <p className="text-primary font-semibold">Amount POP</p>
        <InputTokenWithError
          captionText={``}
          onSelectToken={() => { }}
          onMaxClick={handleMaxClick}
          chainId={5}
          value={amount}
          onChange={handleChangeInput}
          defaultValue={amount}
          selectedToken={
            {
              ...pop,
              balance: popBal?.value || constants.Zero,
            } as any
          }
          errorMessage={errorMessage}
          tokenList={[]}

        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Current Lock Amount</p>
          <p className="text-[#141416]">{lockedBal ? formatAndRoundBigNumber(lockedBal[0], 18) : ""} POP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p className="text-[#141416]">{lockedBal && lockedBal[1].toString() !== "0" ? new Date(Number(lockedBal[1]) * 1000).toLocaleDateString() : "-"}</p>
        </div>
      </div>

      <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
        <p className="text-primaryDark">{amount > 0 ? calculateVeOut(amount, days).toFixed(2) : "Enter the amount to view your voting power"}</p>
      </div>

    </div>
  )
}