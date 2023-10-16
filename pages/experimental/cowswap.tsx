import { Address, useAccount, useConnect, useDisconnect, useToken, useSigner } from 'wagmi'
import { utils } from 'ethers'
import NoSSR from "react-no-ssr";
import { getBalances, getTokenAllowance, quote } from 'wido'
import { parseUnits } from 'ethers/lib/utils.js'
import { useEffect, useMemo, useState, useCallback, FormEvent } from 'react'
import InputTokenWithError from "components/InputTokenWithError";
import { validateInput } from 'components/AssetInputWithAction/internals/input'
import useVaultToken from 'hooks/useVaultToken'
import { ArrowDownIcon } from '@heroicons/react/24/outline'
import MainActionButton from 'components/MainActionButton'
import useApproveBalance from "hooks/useApproveBalance";
import useWaitForTx from 'lib/utils/hooks/useWaitForTx'
import toast from 'react-hot-toast'
import { useAllowance } from 'lib/Erc20/hooks'
import axios from 'axios';

import { OrderBookApi, OrderSigningUtils, OrderQuoteRequest, OrderQuoteSide, SigningScheme, SubgraphApi, OrderQuoteSideKindSell, OrderQuoteSideKindBuy } from '@cowprotocol/cow-sdk'


const chainId = 1 // Mainnet

const orderBookApi = new OrderBookApi({ chainId })
const subgraphApi = new SubgraphApi({ chainId })
const orderSigningUtils = new OrderSigningUtils()


function noOp() { }


export default function CowswapPage() {
    return (
        <NoSSR>
            <CowswapTest />
        </NoSSR>
    )
}

const COWSWAP_TOKEN_MANAGER = "0xF2F02200aEd0028fbB9F183420D3fE6dFd2d3EcD"
const COWSWAP_ROUTER = "0x7Fb69e8fb1525ceEc03783FFd8a317bafbDfD394"

function CowswapSweetVault({ vaultAddress }: { vaultAddress: string }) {
    const { address: account } = useAccount();
    const { data: vault } = useToken({ address: vaultAddress as Address, chainId: 1 })
    const { data: asset } = useVaultToken(vaultAddress, 1);

    const [inputToken, setInputToken] = useState<any>(asset)
    const [outputToken, setOutputToken] = useState<any>(vault)

    const [inputBalance, setInputBalance] = useState<number>(0);
    const [outputPreview, setOutputPreview] = useState<number>(0);

    const [availableToken, setAvailableToken] = useState<any[]>([])

    const { waitForTx } = useWaitForTx();
    const { data: allowance } = useAllowance({ address: inputToken?.address, account: COWSWAP_TOKEN_MANAGER as Address, chainId: 1 });

    const { data: signer } = useSigner();

    const [actionData, setActionData] = useState<string>("")

    const showApproveButton = Number(allowance?.value) < inputBalance;
    const isDeposit = inputToken?.address !== vaultAddress

    const handleChangeInput = ({ currentTarget: { value } }) => {
        setInputBalance(validateInput(value).isValid ? (value as any) : 0);
    };

    const formattedInputBalance = useMemo(() => {
        return parseUnits(validateInput(inputBalance || "0").formatted, inputToken?.decimals);
    }, [inputBalance, asset?.decimals]);

    const {
        write: approve = noOp,
        isSuccess: isApproveSuccess,
        isLoading: isApproveLoading,
    } = useApproveBalance(inputToken?.address, COWSWAP_TOKEN_MANAGER, 1, {
        onSuccess: (tx) => {
            waitForTx(tx, {
                successMessage: "Assets approved!",
                errorMessage: "Something went wrong",
            });
        },
        onError: () => {
            toast.error("User rejected the transaction", {
                position: "top-center",
            });
        },
    });

    async function handleDeposit() {
        if ((inputBalance || 0) == 0) return;
        // Early exit if value is ZERO

        //if (chain.id !== Number(chainId)) switchNetwork?.(Number(chainId));

        if (showApproveButton) return approve();
        // When approved continue to deposit
        signer.sendTransaction({ data: actionData, to: COWSWAP_ROUTER, value: "0" }).then(res => console.log(res))
    }


    useEffect(() => {
        orderBookApi.context.chainId = chainId
    }, [chainId])

    const getOrders = useCallback(
        async (event: FormEvent) => {
            event.preventDefault()

            // Sell 1 FRAX for DAI on Mainnet network
            const quoteRequest: OrderQuoteRequest = {
                sellToken: '0x853d955aCEf822Db058eb8505911ED77F175b99e', // FRAX Mainnet
                buyToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI Mainnet
                from: account,
                receiver: account,
                sellAmountBeforeFee: (1 ** 18).toString(), // 1 FRAX
                kind: OrderQuoteSideKindSell.SELL,
            }

            // Get quote
            const { quote } = await orderBookApi.getQuote(quoteRequest)

            // Sign order
            const orderSigningResult = await OrderSigningUtils.signOrder({ ...quote, receiver: account }, chainId, signer)

            // Send order to the order-book
            const orderId = await orderBookApi.sendOrder({
                ...quote,
                signature: orderSigningResult.signature,
                signingScheme: orderSigningResult.signingScheme as string as SigningScheme,
            })

            // Get order data
            const order = await orderBookApi.getOrder(orderId)

            console.log(order);
        },
        [chainId, signer, account]
    )

    useEffect(() => {
        // Dummy quote data selling 10_000e18 FRAX to DAI
        const getQuote = async () => {
            const url = 'https://api.cow.fi/mainnet/api/v1/quote';
            const body = {
                sellToken: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
                buyToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                receiver: "0x0000000000000000000000000000000000000000",
                validTo: 1697424983,
                appData: "0x0000000000000000000000000000000000000000000000000000000000000000",
                partiallyFillable: false,
                sellTokenBalance: "erc20",
                buyTokenBalance: "erc20",
                from: "0x55fe002aeff02f77364de339a1292923a15844b8",
                kind: "sell",
                sellAmountBeforeFee: "10000000000000000000000"
            };

            try {
                const response = await axios.post(url, body, {
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                setOutputPreview(Number(parseFloat(utils.formatEther(response.data.quote.buyAmount.toString())).toFixed(3)));
            } catch (error) {
                console.error('Error fetching quote:', error);
            }
        };
        if (account !== undefined) getQuote();


    }, [inputBalance, inputToken, outputToken, account])

    return (
        <div className="flex flex-col w-full md:w-4/12 gap-8">
            <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
                <InputTokenWithError
                    captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
                    onSelectToken={option => setInputToken(option)}
                    onMaxClick={() => handleChangeInput({ currentTarget: { value: Number(inputToken.balance) / (10 ** inputToken.decimals) } })}
                    chainId={1}
                    value={inputBalance}
                    onChange={handleChangeInput}
                    selectedToken={inputToken}
                    errorMessage={""}
                    tokenList={outputToken?.address === vault?.address ? availableToken : []}
                    allowSelection={outputToken?.address === vault?.address}
                />
                <>
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-customLightGray" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4">
                                <ArrowDownIcon
                                    className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
                                    aria-hidden="true"
                                    onClick={() => {
                                        if (outputToken.address === vault.address) {
                                            setInputToken(vault);
                                            setOutputToken(asset)
                                        } else {
                                            setInputToken(asset);
                                            setOutputToken(vault)
                                        }
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                    <InputTokenWithError
                        captionText={"Output Amount"}
                        onSelectToken={option => setOutputToken(option)}
                        onMaxClick={() => { }}
                        chainId={1}
                        value={outputPreview}
                        onChange={() => { }}
                        selectedToken={outputToken}
                        errorMessage={""}
                        tokenList={inputToken.address === vault?.address ? availableToken : []}
                        allowSelection={inputToken.address === vault?.address}
                    />
                </>
                <MainActionButton
                    label={showApproveButton ? "Approve" : (isDeposit ? "Deposit" : "Withdraw")}
                    type="button"
                    handleClick={handleDeposit}
                    disabled={inputBalance === 0}
                />
            </section>
        </div>
    )
}


function CowswapTest() {
    return <div className='flex flex-row items-center'>
        <CowswapSweetVault vaultAddress={"0x5d344226578DC100b2001DA251A4b154df58194f"} />
    </div>
}

