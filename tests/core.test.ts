import test from 'node:test';
import assert from 'node:assert/strict';
import { configSchema,defaultConfig,destination,resolveClosingLink } from '../lib/config';
import { hashPassword,verifyPassword,createSession,validSession,sameOrigin } from '../lib/auth';
test('configuração inicial válida e ícones predefinidos',()=>{assert.equal(configSchema.safeParse(defaultConfig).success,true);assert.equal(defaultConfig.links.length,5);});
test('bloqueia URLs executáveis, SVG enviado e IDs duplicados',()=>{for(const mutate of [(c:typeof defaultConfig)=>{c.links[0].url='javascript:alert(1)';},(c:typeof defaultConfig)=>{c.profile.avatar='data:image/svg+xml;base64,PHN2Zz4=';},(c:typeof defaultConfig)=>{c.links[1].id=c.links[0].id;}]){const c=structuredClone(defaultConfig);mutate(c);assert.equal(configSchema.safeParse(c).success,false);}});
test('desativa links e aceita WhatsApp, perfil e capas personalizados',()=>{const c=structuredClone(defaultConfig);c.links[0].enabled=false;c.links[1].icon='whatsapp';c.profile.name='Meu perfil';c.profile.heroMobile='https://example.com/capa.webp';assert.equal(configSchema.safeParse(c).success,true);});
test('rastreia campanhas sem alterar links diretos',()=>{const link=defaultConfig.links[0];const url=new URL(destination(link,true,'?utm_source=teste&senha=nao-repassar'));assert.equal(url.searchParams.get('utm_source'),'teste');assert.equal(url.searchParams.has('senha'),false);assert.equal(destination({...link,direct:true},true,'?utm_source=teste'),link.url);});

test('botão final aceita URL própria sem alterar o link principal e volta ao padrão ao limpar',()=>{
 const config=structuredClone(defaultConfig),original=config.links[0].url;
 assert.equal(resolveClosingLink(config)!.url,original);
 config.closing.url='https://example.com/cadastro-final';assert.equal(configSchema.safeParse(config).success,true);
 assert.equal(resolveClosingLink(config)!.url,config.closing.url);assert.equal(resolveClosingLink(config)!.title,config.links[0].title);assert.equal(config.links[0].url,original);
 config.closing.url='';assert.equal(configSchema.safeParse(config).success,true);assert.equal(resolveClosingLink(config)!.url,original);
 config.links[0].enabled=false;assert.equal(resolveClosingLink(config),undefined);
 config.closing.url='https://example.com/cadastro-final';assert.equal(resolveClosingLink(config)!.title,'Realizar cadastro');
 const publicConfig={...config,links:config.links.filter(link=>link.enabled)};assert.deepEqual(resolveClosingLink(publicConfig),resolveClosingLink(config));
 for(const invalid of ['javascript:alert(1)','endereco-incompleto']){config.closing.url=invalid;assert.equal(configSchema.safeParse(config).success,false);}
});
test('hash com salt único e rejeição de senha errada',()=>{const hash=hashPassword('senha-aleatoria-de-teste');assert.equal(verifyPassword('senha-aleatoria-de-teste',hash),true);assert.equal(verifyPassword('errada',hash),false);assert.notEqual(hash,hashPassword('senha-aleatoria-de-teste'));});
test('sessão assinada rejeita adulteração e troca de credenciais',()=>{process.env.ADMIN_PASSWORD_HASH=hashPassword('teste-unitario-aleatorio');process.env.SESSION_SECRET='segredo-de-teste-'.repeat(4);const token=createSession();assert.equal(validSession(token),true);assert.equal(validSession(token+'x'),false);assert.equal(validSession('qualquer-token'),false);process.env.ADMIN_PASSWORD_HASH=hashPassword('outro-teste');assert.equal(validSession(token),false);});
test('CSRF rejeita origem externa e aceita host real atrás do Next',()=>{assert.equal(sameOrigin(new Request('http://localhost:3000/api/config',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})),true);assert.equal(sameOrigin(new Request('http://localhost:3000/api/config',{headers:{host:'127.0.0.1:3000',origin:'https://example.com'}})),false);});
