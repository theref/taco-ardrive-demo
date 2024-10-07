import {
  conditions,
  decrypt,
  domains,
  encrypt,
  getPorterUri,
  initialize,
  ThresholdMessageKit,
  toHexString,
} from '@nucypher/taco';
import { useEthers } from '@usedapp/core';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

import { ConditionBuilder } from './ConditionBuilder';
import { Decrypt } from './Decrypt';
import { Encrypt } from './Encrypt';
import { Spinner } from './Spinner';
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from './config';
import { uploadData, downloadData } from './ardrive';
import { TurboFactory, TurboSigner } from '@ardrive/turbo-sdk/web';
import { InjectedEthereumSigner } from 'arbundles';

const chainIdForDomain = {
  [domains.DEVNET]: 80002,
  [domains.TESTNET]: 80002,
  [domains.MAINNET]: 137,
};

export default function App() {
  const { activateBrowserWallet, deactivate, account, switchNetwork } =
    useEthers();

  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState<conditions.condition.Condition>();
  const [encryptedMessageId, setEncryptedMessageId] = useState<string>();
  const [decryptedMessage, setDecryptedMessage] = useState<string>();
  const [decryptionErrors, setDecryptionErrors] = useState<string[]>([]);
  const [ritualId, setRitualId] = useState<number>(DEFAULT_RITUAL_ID);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);

  const chainId = chainIdForDomain[domain];
  const provider = new ethers.providers.Web3Provider(window.ethereum);


  useEffect(() => {
    initialize();
    switchNetwork(chainId);
  }, [chainId]);


  const signer = new InjectedEthereumSigner(provider);

  const encryptMessage = async (message: string) => {
    if (!condition) {
      return;
    }
    setLoading(true);

    await switchNetwork(chainId);

    const encryptedMessage = await encrypt(
      provider,
      domain,
      message,
      condition,
      ritualId,
      provider.getSigner(),
    );

    const encryptedMessageHex = toHexString(encryptedMessage.toBytes());
    await signer.setPublicKey();
  
    const turbo = TurboFactory.authenticated({
      signer: signer as unknown as TurboSigner,
    });
    const response = await uploadData(signer, turbo, encryptedMessageHex);
  
    const encryptedMessageId = response.id;
    console.log({ encryptedMessageId });
    setEncryptedMessageId(encryptedMessageId);
    setLoading(false);
    return encryptedMessageId;
  };

  const decryptMessage = async (encryptedMessageId: string) => {
    if (!condition) {
      return;
    }
    setLoading(true);
    setDecryptedMessage('');
    setDecryptionErrors([]);

    const encryptedMessageHex = await downloadData(encryptedMessageId) as string;
    const encryptedMessage = ThresholdMessageKit.fromBytes(
      Buffer.from(encryptedMessageHex, 'hex'),
    );

    const decryptedMessage = await decrypt(
      provider,
      domain,
      encryptedMessage,
      'https://porter-tapir.nucypher.io/',
      provider.getSigner(),
    );

    setDecryptedMessage(new TextDecoder().decode(decryptedMessage));
    setLoading(false);
  };

  if (!account) {
    return (
      <div>
        <h2>Connect to App via Web3 Provider</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
      <div>
        <div>
          <h2>Disconnect from App</h2>
          <button onClick={deactivate}> Disconnect Wallet</button>
          {account && <p>Account: {account}</p>}
        </div>

        <h2>Choose RitualID & Domain</h2>
        <p>
          To use TACo's encrypt/decrypt API, you must choose a RitualID and Domain. The RitualID is the ID of the cohort of nodes that will manage access to encrypted data. The Domain is the network – i.e. testnet, devnet or mainnet. Note that using TACo in production (i.e. the mainnet version) requires your identity – in this case a wallet address – to be on an encryptor allowlist. This list is controlled by the Cohort Authority.
         </p>
         <p>
          To use TACo's publicly available testnet, you can set the RitualID to '0'.
        </p>
        <p>Choose a RitualID</p>
        <input
          type={'number'}
          value={ritualId}
          onChange={(e) => setRitualId(parseInt(e.currentTarget.value))}
        />
        <p>Choose a Domain. This must match the Domain of your RitualID – see the <a href={'https://docs.threshold.network/app-development/threshold-access-control-tac/integration-guide/get-started-with-tac#testnet-configuration'}>documentation</a>.</p>
        <select
          defaultValue={domain}
          onChange={(e) => setDomain(e.currentTarget.value)}
        >
          {Object.values(domains).map((domain) => (
            <option value={domain} key={domain}>
              {domain}
            </option>
          ))}
        </select>

        <p>
          To request access to mainnet, connect with us on our{' '}
          <a href={'https://discord.com/channels/866378471868727316/870383642751430666'}>Discord server</a>.
        </p>

        <ConditionBuilder
          enabled={true}
          condition={condition}
          setConditions={setCondition}
        />

        <Encrypt
          enabled={!!condition}
          encrypt={encryptMessage}
          encryptedMessageId={encryptedMessageId!}
        />

        <Decrypt
          enabled={true}
          decrypt={decryptMessage}
          decryptedMessage={decryptedMessage}
          decryptionErrors={decryptionErrors}
        />
      </div>
  );
}
