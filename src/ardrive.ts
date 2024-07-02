import { createData, InjectedEthereumSigner } from 'arbundles';
import { TurboAuthenticatedClient } from '@ardrive/turbo-sdk/web';




export const uploadData = async (signer: InjectedEthereumSigner, turbo: TurboAuthenticatedClient, data: string): Promise<any> => {
  const dataItem = createData(data, signer);
  await dataItem.sign(signer);
  const response = await turbo.uploadSignedDataItem({
    dataItemStreamFactory: () => dataItem.getRaw(),
    dataItemSizeFactory: () => dataItem.getRaw().byteLength,
  });
  console.log({ response });
  return response
};

export const downloadData = async (receiptId: string): Promise<unknown> => {
  const response = await fetch(`https://arweave.net/${receiptId}`);
  const encryptedMessage = await response.text();
  return encryptedMessage;
};
