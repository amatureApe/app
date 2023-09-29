import axios from "axios";
import { PublicClient, createPublicClient, http } from "viem";
import { Chain, arbitrum, optimism, polygon } from "viem/chains";
import { Address, mainnet } from "wagmi";
import { ChainId, networkMap } from "@/lib/utils/connectors";
import { ERC20Abi, PopByChain, PopStakingByChain } from "@/lib/constants";
import getVaultAddresses from "@/lib/vault/getVaultAddresses";
import { getAssetAndValueByVaults } from "@/lib/vault/getAssetAndAssetsPerShare";
import { resolvePrice } from "@/lib/resolver/price/price";

const BaseAddressesByChain: { [key: number]: Address[] } = {
  1: [PopByChain[ChainId.Ethereum], PopStakingByChain[ChainId.Ethereum]],
  137: [PopByChain[ChainId.Polygon], PopStakingByChain[ChainId.Polygon]],
  10: [PopByChain[ChainId.Optimism], PopStakingByChain[ChainId.Optimism]],
  42161: []
}

type TotalNetworth = {
  [key: number]: Networth,
  total: Networth
}

export type Networth = {
  pop: number,
  stake: number,
  vault: number,
  total: number
}

async function getBalancesByChain({ account, client, addresses }: { account: Address, client: PublicClient, addresses: Address[] })
  : Promise<{ address: Address, balance: number, decimals: number }[]> {
  let res = await client.multicall({
    contracts: addresses.map((address) => {
      return [{
        address,
        abi: ERC20Abi,
        functionName: 'balanceOf',
        args: [account]
      }, {
        address,
        abi: ERC20Abi,
        functionName: 'decimals'
      }]
    }).flat(),
    allowFailure: false
  })

  //res = res.map((entry, i) => i !== 0 && i % 2 === 1 ? [res[i - 1], res[i]] : null).filter(entry => entry !== null) as [number, number][]

  const bals = addresses.map((address, i) => {
    if (i > 0) i = i * 2
    const bal = Number(res[i])
    if (bal === 0) return { address: address, balance: 0, decimals: Number(res[i + 1]) }
    return { address: address, balance: Number(bal), decimals: Number(res[i + 1]) }
  })
  return bals
}

export async function getNetworthByChain({ account, chain }: { account: Address, chain: Chain }): Promise<Networth> {
  const client = createPublicClient({
    chain,
    transport: http()
  })
  // Get addresses
  const vaultAddresses = await getVaultAddresses({ client })
  const addresses = [...BaseAddressesByChain[client.chain?.id as number], ...vaultAddresses]

  // Get balances
  const balances = await getBalancesByChain({ account, client, addresses })

  // Get value of POP holdings
  const popPrice = await resolvePrice({ address: PopByChain[10], chainId: 10, client: undefined, resolver: 'llama' })
  const popNetworth = ((balances.find(entry => entry.address === PopByChain[chain.id])?.balance || 0) * popPrice) / (1e18);
  const stakeNetworth = ((balances.find(entry => entry.address === PopStakingByChain[chain.id])?.balance || 0) * popPrice) / (1e18);

  // Get value of vault holdings
  const assetAndValues = await getAssetAndValueByVaults({ addresses: vaultAddresses, client })
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/${String(assetAndValues.map(entry => `${networkMap[chain.id].toLowerCase()}:${entry.asset}`))}`)
  const vaults = assetAndValues.map((entry, i) => {
    const assetPrice = Number(data.coins[`${networkMap[chain.id].toLowerCase()}:${entry.asset}`]?.price || 0)
    const balEntry = balances.find(b => b.address === entry.vault)
    const bal = balEntry?.balance || 0
    return {
      vault: entry.vault,
      asset: entry.asset,
      assetsPerShare: entry.assetsPerShare,
      assetPrice: assetPrice,
      price: assetPrice * entry.assetsPerShare,
      balance: bal,
      balanceValue: bal === 0 ? 0 : (bal * assetPrice * entry.assetsPerShare) / (10 ** ((balEntry?.decimals as number) - 9))
    }
  })
  const vaultNetworth = vaults.reduce((acc, entry) => acc + entry.balanceValue, 0)

  return { pop: popNetworth, stake: stakeNetworth, vault: vaultNetworth, total: popNetworth + stakeNetworth + vaultNetworth }
}

export async function getTotalNetworth({ account }: { account: Address }): Promise<TotalNetworth> {
  const ethereumNetworth = await getNetworthByChain({ account, chain: mainnet })
  const polygonNetworth = await getNetworthByChain({ account, chain: polygon })
  const optimismNetworth = await getNetworthByChain({ account, chain: optimism })
  const arbitrumNetworth = await getNetworthByChain({ account, chain: arbitrum })

  return {
    [ChainId.Ethereum]: ethereumNetworth,
    [ChainId.Polygon]: polygonNetworth,
    [ChainId.Optimism]: optimismNetworth,
    [ChainId.Arbitrum]: arbitrumNetworth,
    total: {
      pop: ethereumNetworth.pop + polygonNetworth.pop + optimismNetworth.pop + arbitrumNetworth.pop,
      stake: ethereumNetworth.stake + polygonNetworth.stake + optimismNetworth.stake + arbitrumNetworth.stake,
      vault: ethereumNetworth.vault + polygonNetworth.vault + optimismNetworth.vault + arbitrumNetworth.vault,
      total: ethereumNetworth.total + polygonNetworth.total + optimismNetworth.total + arbitrumNetworth.total
    }
  }
}

