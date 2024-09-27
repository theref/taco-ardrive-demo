import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface Props {
  enabled: boolean;
  encryptedMessageId?: string;
  encrypt: (value: string) => void;
}

export const Encrypt = ({ encrypt, encryptedMessageId, enabled }: Props) => {
  if (!enabled) {
    return <></>;
  }

  const [plaintext, setPlaintext] = useState('plaintext');

  const onClick = () => encrypt(plaintext);

  const EncryptedMessageIdContent = () => {
    if (!encryptedMessageId) {
      return <></>;
    }
    const viewblockUrl = `https://viewblock.io/arweave/tx/${encryptedMessageId}`;

    return (
      <>
        <div>
          <h3>Arweave Upload Receipt id:</h3>
          <pre className="encryptedMessageId">{encryptedMessageId}</pre>
          <CopyToClipboard text={encryptedMessageId}>
            <button>Copy to clipboard</button>
          </CopyToClipboard>
          <h3>View Transaction</h3>
          <a href={viewblockUrl} target="_blank" rel="noopener noreferrer">
            View on Viewblock
          </a>
        </div>
      </>
    );
  };

  return (
    <div>
      <h2>Step 2 - Set Conditions, Encrypt, and Upload</h2>
      <input
        type="string"
        value={plaintext}
        onChange={(e) => setPlaintext(e.currentTarget.value)}
      />
      <button onClick={onClick}>Encrypt</button>
      {EncryptedMessageIdContent()}
    </div>
  );
};
