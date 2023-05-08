
const baseMetadata = {
  usdc: {
    name: "USDC",
    description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC.",
  },
  usdt: {
    name: "USDT",
    description:
      "USDT is a centralized stablecoin that aims to maintain the value of one USD. USDT is backed by an equal amount USD in cash reserves, commercial paper, fiduciary deposits, reserve repo notes, and short-term U.S. Treasury bonds in various financial institutions. Each USDT can be redeemed for one USD. Hong Kong-based Tether creates and manages USDT.",
  },
  dai: {
    name: "DAI",
    description: "DAI is a decentralized stablecoin that aims to maintain the value of one USD. DAI is backed by a mix of multiple cryptocurrencies. Users of the Maker Protocol and MakerDAO can create new DAI by providing collateral to back the value of the newly minted DAI. Liquidations should ensure that the value of minted DAI doesn't fall below its backing. MakerDAO controls which assets can be used to mint DAI and other risk parameters.",
  },
  dola: {
    name: "DOLA",
    description: "DOLA is a decentralized stablecoin that pegs to the value of 1 USD. Inverse Finance is a decentralized autonomous organization that develops and manages a suite of permissionless and decentralized financial products using blockchain smart contract technology."
  },
  ousd: {
    name: "OUSD",
    description: "Origin Dollar (OUSD) is a decentralized stablecoin backed 1:1 by other dollar based stablecoins. Currently these are DAI, USDC and USDT. OUSD can always be redeemed against one of these token. The token is specially designed to offer competitive yields which are are converted to OUSD automatically and accumulate in users’ wallets. OUSD aims to provide users with earning opportunities across DeFi by deploying user capital in diversified yield-earning strategies that rebalance overtime. OUSD is managed by Origin Protocol who create and manage smart contracts to create yield on the underlying stablecoins."
  },
  lusd: {
    name: "LUSD",
    description: "LUSD is a decentralized dollar-pegged stablecoin. LUSD is created by providing ETH as collateral and borrow LUSD against it with zero interest. Liquity is the decentralized organisation behind LUSD. Loans are repaid in LUSD, a seperate stability pool help keeping the loans healthy and LUSD at peg."
  },
  ohm: {
    name: "OHM",
    description: "OHM is a decentralized and censorship-resistant reserve currency that is asset-backed. It is created and governed by OHM holders. OHM’s value is meant to float based on the value of Olympus DAO’s treasury and and parameters set by the DAO. It achieves this through minting OHM when it is greater than its intrinsic value and burning OHM when it is less."
  },
  ankrBnb: {
    name: "ankrBNB",
    description: "ankrBNB is an LSD, or liquid-staking derivative, of BNB that is issued when you stake your BNB on Ankr. Ankr is a blockchain-based cross-chain infrastructure with a DeFi platform that enables staking and dApp development. It hosts various protocols related to the development of dApps and the DeFi sector."
  },
  bnb: {
    name: "BNB",
    description: "Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain."
  },
};

function addMetadata(key: string, symbol: string): string {
  switch (key) {
    case "stargate":
      return `This ${symbol} LP is a Stargate LP token that is used to facilitate cross-chain bridging. Each ${symbol} LP is backed by ${symbol} in Stargate pools on various chains.`
    case "hop":
      return `This ${symbol} LP is a Hop LP token that is used to facilitate cross-chain bridging. Each ${symbol} LP is backed by ${symbol} in Hop pools on various chains.`
    case "stableLp":
      return `This is an Liquidity Pool Token for a stable pool on ${symbol}. Both assets are pegged to each other. It contains an equal amount of included assets.`
  }
}

const TokenMetadata = {
  usdt: baseMetadata.usdt,
  usdc: baseMetadata.usdc,
  dai: baseMetadata.dai,
  dola: baseMetadata.dola,
  ousd: baseMetadata.ousd,
  stgUsdt: {
    name: "STG USDT",
    description: `${baseMetadata.usdt.description}
    ----
    ${addMetadata("stargate", baseMetadata.usdt.name)}`
  },
  stgUsdc: {
    name: "STG USDC",
    description: `${baseMetadata.usdc.description}
    ----
    ${addMetadata("stargate", baseMetadata.usdc.name)}`
  },
  stgDai: {
    name: "STG DAI",
    description: `${baseMetadata.dai.description}
    ----
    ${addMetadata("stargate", baseMetadata.dai.name)}`
  },
  hopUsdt: {
    name: "HOP USDT",
    description: `${baseMetadata.usdt.description}
    ----
    ${addMetadata("hop", baseMetadata.usdt.name)}`
  },
  hopUsdc: {
    name: "HOP USDC",
    description: `${baseMetadata.usdc.description}
    ----
    ${addMetadata("hop", baseMetadata.usdc.name)}`
  },
  hopDai: {
    name: "HOP DAI",
    description: `${baseMetadata.dai.description}
    ----
    ${addMetadata("hop", baseMetadata.dai.name)}`
  },
  dolaUsdcVeloLp: {
    name: "DOLA / USDC LP",
    description: `${baseMetadata.dola.description} 
    ----
    ${baseMetadata.usdc.description} 
    ----
    ${addMetadata("stableLp", "Velodrome")}`
  },
  lusdUsdcLp: {
    name: "LUSD / USDC LP",
    description: `${baseMetadata.lusd.description}
    ----
    ${baseMetadata.usdc.description}
    ----
    ${addMetadata("stableLp", "Velodrome")}`
  },
  ankrBnbBnbEllipsisLp: {
    name: "ankrBNB / BNB LP",
    description: `${baseMetadata.ankrBnb.description}
    ----
    ${baseMetadata.bnb.description}
    ----
    ${addMetadata("stableLp", "Ellipsis")}`
  },
  ohmDaiBalancerLp: {
    name: "OHM / DAI LP",
    description: `${baseMetadata.ohm.description}
    ----
    ${baseMetadata.dai.description}
    ----
    ${addMetadata("stableLp", "Balancer")}`
  }
}

export default TokenMetadata;