
import forge from 'node-forge';
import fs from 'fs';
import path from 'path';
import { CERT_DIR } from '../constants';

export function generateCertificate(clientIp: any) {
  const pki = forge.pki;

  // RSA鍵ペアの生成
  const keys = pki.rsa.generateKeyPair(2048);

  // 証明書の作成
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;

  // 証明書の発行者情報 (例)
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  // 主体情報（クライアントIP）
  cert.setSubject([{
    name: 'commonName',
    value: clientIp
  }]);

  cert.setIssuer([{
    name: 'commonName',
    value: clientIp
  }]);

  // 証明書の署名
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // PEM形式で鍵と証明書を返す
  const privateKeyPem = pki.privateKeyToPem(keys.privateKey);
  const certificatePem = pki.certificateToPem(cert);

   // サーバー側に秘密鍵と証明書を保存
   if (!fs.existsSync(CERT_DIR)) {
     fs.mkdirSync(CERT_DIR);
   }
 
   const privateKeyPath = path.join(CERT_DIR, `server-key.key`);
   const certificatePath = path.join(CERT_DIR, `server-cert.crt`);
 
   // ファイルに保存
   fs.writeFileSync(privateKeyPath, privateKeyPem);
   fs.writeFileSync(certificatePath, certificatePem);
 
   console.log(`Certificate and private key saved to ${privateKeyPath} and ${certificatePath}`);
 
  return { privateKeyPem, certificatePem };
}
