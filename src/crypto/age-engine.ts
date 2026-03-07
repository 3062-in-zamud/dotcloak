import * as age from 'age-encryption'

export async function encrypt(plaintext: string, recipient: string): Promise<string> {
  const encrypter = new age.Encrypter()
  encrypter.addRecipient(recipient)
  const encrypted = await encrypter.encrypt(plaintext)
  return age.armor.encode(encrypted)
}

export async function decrypt(armored: string, identity: string): Promise<string> {
  const encrypted = age.armor.decode(armored)
  const decrypter = new age.Decrypter()
  decrypter.addIdentity(identity)
  const decrypted = await decrypter.decrypt(encrypted, 'text')
  return decrypted
}
