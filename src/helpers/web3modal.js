import * as UAuthWeb3Modal from '@uauth/web3modal'
import UAuthSPA from '@uauth/js'
import Web3Modal from 'web3modal'

export const uauthOptions = {
    clientID: process.env.REACT_APP_UNSTOPPABLE_ID,
    redirectUri: process.env.REACT_APP_UNSTOPPABLE_REDIR_URL,
    scope: 'openid wallet',
}

export const providerOptions = {
    'custom-uauth': {
        display: UAuthWeb3Modal.display,
        connector: UAuthWeb3Modal.connector,
        package: UAuthSPA,
        options: uauthOptions,
    },
}

export const web3modal = new Web3Modal({network: 'mainnet', cacheProvider: true, providerOptions, theme: "dark"})

UAuthWeb3Modal.registerWeb3Modal(web3modal)

export default web3modal
