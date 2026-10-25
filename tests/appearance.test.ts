import test from 'node:test';
import assert from 'node:assert/strict';
import { configSchema,defaultConfig } from '../lib/config';
import { themeVariables,linkVariables,linkAttributes,themePresets,linkColorFallback,linkColorSample,linkDefaultColors,colorLayers } from '../lib/appearance';
test('configurações existentes continuam válidas sem migração',()=>{const parsed=configSchema.parse(defaultConfig);assert.equal(parsed.theme.accent,'#2D6BFF');assert.equal(parsed.links[0].colors,undefined);assert.deepEqual(linkVariables(parsed.links[0]),{});});
test('tema roxo modifica luzes, capa, brilhos, botões e fundo',()=>{const v=themeVariables({...defaultConfig.theme,...themePresets[1],glowStrength:67});assert.equal(v['--blue-rgb'],'133,77,255');assert.equal(v['--cta-rgb'],'133,77,255');assert.equal(v['--glow-color'],'#854DFF');assert.equal(v['--bg'],'#0D071A');assert.equal(v['--aurora-opacity'],'0.67');assert.ok(v['--grad-cta'].includes('#854DFF'));for(const key of ['--line-p','--glow-p','--glow-cta']){assert.ok(v[key].includes('133,77,255'));assert.ok(!v[key].includes('45,107,255'));}});
test('fundo do ícone é independente do fundo do botão e mantém transparência',()=>{const link={...defaultConfig.links[0],colors:{iconBackground:'#FF000080',iconColor:'#F5F5F5',background:'#003311',backgroundEnd:'#004422',hoverBackground:'#112233'}};const parsed=configSchema.parse({...defaultConfig,links:[link]});const v=linkVariables(parsed.links[0]);assert.equal(v['--link-icon-bg'],'#FF000080');assert.equal(v['--link-icon-color'],'#F5F5F5');assert.equal(v['--link-bg'],'linear-gradient(135deg,#003311,#004422)');assert.equal(v['--link-hover-bg'],'#112233');assert.equal(linkAttributes(link)['data-icon-bg'],'true');});
test('bloqueia CSS executável e intensidade fora dos limites',()=>{const c=structuredClone(defaultConfig);c.links[0].colors={iconBackground:'url(https://external.example)'};assert.equal(configSchema.safeParse(c).success,false);delete c.links[0].colors;c.theme.glowStrength=101;assert.equal(configSchema.safeParse(c).success,false);});

test('amostras e site usam a mesma cor automática para cada ícone e tema',()=>{
 for(const preset of themePresets)for(const icon of ['robot','trade','marca','telegram','instagram','youtube','app','whatsapp'] as const)for(const featured of [false,true]){
  const theme={...defaultConfig.theme,...preset},link={...defaultConfig.links[0],icon,featured};
  const variables=linkVariables(link,theme);
  assert.equal(linkColorSample(link,'iconBackground',theme),variables['--link-auto-icon-bg']);
  assert.equal(linkDefaultColors(link,theme).iconColor,variables['--link-auto-icon-color']);
  assert.match(linkColorFallback(link,'iconBackground',theme),/^#[a-f0-9]{8}$/i);
 }
 const theme={...defaultConfig.theme,accent:'#F97316'},link={...defaultConfig.links[0],icon:'robot' as const};
 assert.equal(linkColorSample(link,'iconBackground',theme),'rgba(249,115,22,.14)');
 assert.equal(linkColorFallback(link,'iconBackground',theme),'#f9731624');
});

test('restaurar remove a personalização e acompanha novamente tema e ícone',()=>{
 const link={...defaultConfig.links[0],icon:'telegram' as const,colors:{iconBackground:'#FF000080',iconColor:'#EC4899'}};
 assert.equal(linkColorSample(link,'iconBackground',defaultConfig.theme),'#FF000080');
 assert.equal(linkColorFallback(link,'iconBackground',defaultConfig.theme),'#29a9ea24');
 assert.equal(linkColorSample({...link,colors:{iconColor:link.colors.iconColor}},'iconBackground',defaultConfig.theme),'rgba(41,169,234,.14)');
});

test('amostras mantêm transparência, degradês e cores herdadas',()=>{
 const link={...defaultConfig.links[0],colors:{background:'#112233',backgroundEnd:'#F97316'}};
 const background=linkColorSample(link,'background',defaultConfig.theme);
 assert.equal(background,'linear-gradient(135deg,#112233,#F97316)');
 assert.equal(linkColorSample(link,'hoverBackground',defaultConfig.theme),background);
 const layers=colorLayers(linkColorSample(link,'iconBackground',defaultConfig.theme),background,defaultConfig.theme.background);
 assert.ok(layers.includes('rgba(45,107,255,.14)'));
 assert.ok(layers.includes(background));
 assert.ok(layers.endsWith('linear-gradient(#050A17,#050A17)'));
 const themed={...defaultConfig.theme,text:'#FACC15',mutedText:'#AABBCC'};
 assert.equal(linkColorSample({...link,featured:false},'title',themed),'#FACC15');
 assert.equal(linkColorSample({...link,featured:false},'description',themed),'#AABBCC');
});
