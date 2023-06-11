import type { ModalConnectorsOpts, XdcPayProviderOpts } from './types'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'


// -- providers ------------------------------------------------------- //
export function xdcPayProvider({ projectId }: XdcPayProviderOpts) {
    return jsonRpcProvider({
      rpc: chain => {
        const supportedChains = [
          50
        ]
  
        if (supportedChains.includes(chain.id)) {
          return {
            http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}`
          }
        }
  
        return {
          http: chain.rpcUrls.default.http[0],
          webSocket: chain.rpcUrls.default.webSocket?.[0]
        }
      }
    })
  }
  