import { randomBytes,scryptSync } from 'node:crypto';
import { writeFile,access } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
try{await access('.env.local');console.error('.env.local já existe. Nenhum segredo foi alterado.');process.exit(1);}catch{}
const rl=createInterface({input:process.stdin,output:process.stdout});
const password=await rl.question('Senha inicial do administrador: ');rl.close();
if(password.length<8)throw new Error('Use uma senha com pelo menos 8 caracteres.');
const salt=randomBytes(16).toString('hex');
const hash=`scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;
await writeFile('.env.local',`ADMIN_LOGIN=admin\nADMIN_PASSWORD_HASH=${hash}\nSESSION_SECRET=${randomBytes(48).toString('hex')}\n`,{mode:0o600});
console.log('Configuração local criada. A senha foi armazenada somente como hash.');

