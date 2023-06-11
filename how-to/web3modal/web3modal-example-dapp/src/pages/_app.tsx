import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { configureChains, createClient, WagmiConfig, Chain } from 'wagmi'
import { jsonRpcProvider, JsonRpcProviderConfig } from '@wagmi/core/providers/jsonRpc'
import { InjectedConnector, InjectedConnectorOptions } from '@wagmi/core'
import { MetaMaskConnector, MetaMaskConnectorOptions } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { arbitrum, avalanche, bsc, fantom, mainnet, optimism, polygon } from 'wagmi/chains'
import Navigation from '../components/Navigation'
import '../styles.css'

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')
}

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

// 2. Configure wagmi client
const xdc: Chain = {
  id: 50,
  name: "XinFin",
  network: "xinfin",
  nativeCurrency: {
    name: "XDC Network",
    decimals: 18,
    symbol: "XDC"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.xinfin.network"],
      webSocket: ["wss://ws.xinfin.network"]
    }
  },
  testnet: false,
}
const apothem: Chain = {
  id: 51,
  name: "Apothem",
  nativeCurrency: {
    name: "XDC Network",
    decimals: 18,
    symbol: "XDC"
  },
  network: "apothem",
  rpcUrls: {
    default: {
      http: ["https://rpc.apothem.network"],
      webSocket: ["wss://ws.apothem.network"]
    }
  },
  testnet: true,
}

const xdcProviderCfg: JsonRpcProviderConfig = {
  rpc: (chain) => ({
    http: xdc.rpcUrls.default.http[0],
  }),
}

const xdcProvider = jsonRpcProvider(xdcProviderCfg)

const { chains, provider } = configureChains(
  [
    mainnet,
    polygon,
    xdc,
    apothem
  ],
  [
    xdcProvider,
    // walletConnectProvider({ projectId }),
  ]
)
console.log('Chains:')
chains.forEach(c => {
  console.log('\tchain %d: %s', c.id, c.network)
})

let connectorsEnabled = modalConnectors({
  appName: 'XDC web3Modal',
  chains: chains,
  version: "2",
  projectId,
})
const xdcConnectorInjCfg: InjectedConnectorOptions = {
  // name: (n) => {
  //   console.log(n)
  //   return 'injected'
  // },
  name: 'XDC'
}
const xdcConnectorInj: InjectedConnector = new InjectedConnector({
  chains: chains,
  options: xdcConnectorInjCfg,
})
const xdcConnectorMetamaskCfg: MetaMaskConnectorOptions = {
  shimDisconnect: true
}
const xdcConnectorMetamask: MetaMaskConnector = new MetaMaskConnector({
  chains: chains,
  options: xdcConnectorMetamaskCfg
})

connectorsEnabled.push(xdcConnectorInj)
connectorsEnabled.push(xdcConnectorMetamask)
connectorsEnabled.push(new WalletConnectConnector({
  chains: chains,
  options: {
    qrcode: false,
    projectId: projectId,
    name: "yo",
    version: "2"
  }
}))

export const wagmiClient = createClient({
  autoConnect: true,
  // connectors: [
  //   xdcConnectorInj,
  //   xdcConnectorMetamask,
  //   new WalletConnectConnector({
  //     chains: chains,
  //     options: {
  //       qrcode: false,
  //       chainId: 50
  //     }
  //   })
  // ],
  connectors: connectorsEnabled,
  provider,
})

console.log('Providers:')
wagmiClient.providers.forEach(p => {
  console.log('\tprovider %d', p?.network.chainId)
})

// 3. Configure modal ethereum client
export const ethereumClient = new EthereumClient(wagmiClient, chains)

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <WagmiConfig client={wagmiClient}>
          <Navigation />
          <Component {...pageProps} />
        </WagmiConfig>
      ) : null}

      {/* Add Web3Modal here, This example adds them in individual pages */}
      {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
    </>
  )
}
