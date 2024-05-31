import { useSignMessage } from 'wagmi';
import { createData, InjectedEthereumSigner } from 'arbundles';
import { TurboFactory, TurboSigner } from '@ardrive/turbo-sdk/web';



// export const getTurboSigner = async () => {
//     const minimalSigner = {
//     getSigner: () => {
//       return {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         signMessage: async (message: any): Promise<string> => {
//           console.log("signMessageAsync", message);
//           const arg = message instanceof String ? message : { raw: message };
//           return await signMessageAsync({
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             message: arg as any,
//           });
//         },
//       };
//     },
//   };
//   const signer = new InjectedEthereumSigner(minimalSigner);
//   await signer.setPublicKey();

//   const turbo = TurboFactory.authenticated({
//     signer: signer as unknown as TurboSigner,
//   });
//   return [signer, turbo];
// }

export const uploadData = async (signer: InjectedEthereumSigner, turbo: TurboFactory, data: string): Promise<string> => {
  const dataItem = createData(data, signer);
  const buf = await dataItem.sign(signer);

  const response = await turbo.uploadSignedDataItem({
    dataItemStreamFactory: () => buf,
    dataItemSizeFactory: () => buf.length,
  });
  console.log({ response });
  return response
};

export const downloadData = async (receiptId: string): Promise<unknown> => {
  const response = await fetch(`https://gateway.irys.xyz/${receiptId}`);
  const dataJson = await response.text();
  return JSON.parse(dataJson);
};
