"""Audited pinned registry → lightweight entity metadata + isolated perk articles.
No Java execution. Arithmetic uses a restricted AST; unresolved values fail closed.
"""
import argparse,ast,hashlib,json,math,pathlib,re,urllib.request
from PIL import Image
COMMIT='8692f66dc76582144be85d553d43a41f189b64e7'
JAVA='src/main/java/org/example/maniacrevolution/'
RES='src/main/resources/assets/maniacrev/'
ap=argparse.ArgumentParser();ap.add_argument('--fetch',action='store_true');args=ap.parse_args()
root=pathlib.Path('../.audit/maniac-source-8692f66');tree={x['path']:x for x in json.loads((root/'tree.json').read_text())['tree'] if x['type']=='blob'}
used={}
def source(path):
 p=root/path
 b=p.read_bytes() if p.exists() else b''
 def valid(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==tree[path]['sha']
 if not valid(b):b=b.replace(b'\r\n',b'\n')
 if not valid(b) and args.fetch:
  with urllib.request.urlopen(f'https://raw.githubusercontent.com/doflare123/Maniac-mod-evolution/{COMMIT}/{path}',timeout=60) as r:b=r.read()
  p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 assert valid(b),'Missing/noncanonical source '+path
 used[path]={'path':path,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 return b
lang_path=RES+'lang/ru_ru.json';lang=json.loads(source(lang_path))
class_paths={pathlib.PurePosixPath(p).stem:p for p in tree if p.startswith(JAVA) and p.endswith('.java') and (root/p).exists()}
cache={};constants={};resolving=set()
def code(cls):
 if cls not in cache:cache[cls]=source(class_paths[cls]).decode('utf-8')
 return cache[cls]
def const(cls,name):
 if (cls,name) in constants:return constants[(cls,name)]
 assert (cls,name) not in resolving,'Circular constant'
 resolving.add((cls,name))
 try:
  m=re.search(r'(?:static\s+)?final\s+(int|float|double|long|String|PerkPhase)\s+'+re.escape(name)+r'\s*=\s*([^;]+);',code(cls))
  if not m:raise ValueError(cls+'.'+name)
  exp=re.sub(r'//[^\n]*','',m[2]).strip()
  value=exp.split('.')[-1] if m[1]=='PerkPhase' else expr(exp,cls)
  if m[1] in ['float','double']:value=float(value)
  constants[(cls,name)]=value;return value
 finally:resolving.remove((cls,name))
def expr(text,cls,locals=None):
 text=text.strip();locals=locals or {}
 if text.startswith('(int)'):return math.trunc(expr(text[5:],cls,locals))
 text=re.sub(r'\((?:float|double|long)\)\s*','',text)
 text=re.sub(r'(?<=[0-9])[fFdDlL]\b','',text)
 text=re.sub(r'\b(PerkPhase\.(?:HUNT|MIDGAME|REVERSAL)|[A-Z][A-Z_]+)\.getScoreboardValue\(\)',lambda m:str({'HUNT':1,'MIDGAME':2,'REVERSAL':3}[m[1].split('.')[-1] if m[1].startswith('PerkPhase.') else const(cls,m[1])]),text)
 def walk(n):
  if isinstance(n,ast.Constant):return n.value
  if isinstance(n,ast.Name):return locals[n.id] if n.id in locals else const(cls,n.id)
  if isinstance(n,ast.Attribute) and isinstance(n.value,ast.Name):return const(n.value.id,n.attr)
  if isinstance(n,ast.UnaryOp) and isinstance(n.op,(ast.USub,ast.UAdd)):return -walk(n.operand) if isinstance(n.op,ast.USub) else walk(n.operand)
  if isinstance(n,ast.BinOp):
   a,b=walk(n.left),walk(n.right)
   if isinstance(n.op,ast.Add):return a+b
   if isinstance(n.op,ast.Sub):return a-b
   if isinstance(n.op,ast.Mult):return a*b
   if isinstance(n.op,ast.Div):return math.trunc(a/b) if isinstance(a,int) and isinstance(b,int) else a/b
  if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.value.id=='Math':
   vals=[walk(v) for v in n.args]
   if n.func.attr=='round':return math.floor(vals[0]+.5)
   if n.func.attr=='min':return min(vals)
   if n.func.attr=='max':return max(vals)
  raise ValueError('Unsupported expression '+text)
 return walk(ast.parse(text,mode='eval').body)
def arguments(text,start):
 depth=1;quote=False;escape=False;parts=[];last=start
 for i in range(start,len(text)):
  c=text[i]
  if escape:escape=False;continue
  if c=='\\' and quote:escape=True;continue
  if c=='"':quote=not quote
  if quote:continue
  if c=='(':depth+=1
  if c==')':
   depth-=1
   if depth==0:return parts+[text[last:i].strip()]
  if c==',' and depth==1:parts.append(text[last:i].strip());last=i+1
 raise ValueError('Unclosed call')
def call(text,name):
 m=re.search(re.escape(name)+r'\(',text)
 return arguments(text,m.end()) if m else []
def formatted(template,values):
 template=template.replace('%%','\u0001');i=0
 def sub(m):
  nonlocal i
  val=values[i];i+=1
  if isinstance(val,float):val=round(val,6);return str(int(val)) if val.is_integer() else str(val)
  return str(val)
 result=re.sub(r'%(?:\d+\$)?(?:\.\d+)?[sdf]',sub,template)
 assert i==len(values),(template,values)
 return result.replace('\u0001','%')
def write(path,obj):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
registered=re.findall(r'register\(new (\w+)\(\)\)',code('PerkRegistry'))
assert len(registered)==len(set(registered))==44
for cls in ['Perk','PerkType','PerkTeam','PerkPhase','ChargedPerk','PerkInstance']:code(cls)
data_dir=pathlib.Path('src/app/projects/maniac/wiki/data');asset_root=pathlib.Path('src/app/projects/maniac/assets')
old_manifest=json.loads((asset_root/'imports.json').read_text(encoding='utf-8'))
rows=[];art_records=[];issues=[];assets_ts=[];meta=[];audit=[]
for cls in registered:
 s=code(cls);builder=call(s,'new Builder');game_id=expr(builder[0],cls)
 slug=game_id.replace('_','-');id='perk:'+slug
 typ=call(s,'.type')[0].split('.')[-1] if call(s,'.type') else 'PASSIVE'
 team=call(s,'.team')[0].split('.')[-1] if call(s,'.team') else 'ALL'
 phases=[p.split('.')[-1] if p.startswith('PerkPhase.') else const(cls,p) for p in call(s,'.phases')] or ['ANY']
 name=lang['perk.maniacrev.'+game_id+'.name'];template=lang['perk.maniacrev.'+game_id+'.desc']
 d=re.search(r'public Component getDescription\(\)\s*\{([\s\S]*?)\n    }',s)
 values=[];notes=[];expression_args=[]
 if d:
  expression_args=call(d[1],'Component.translatable')[1:]
  local_values={}
  for var,value in re.findall(r'(?:int|float|double)\s+(\w+)\s*=\s*([^;]+);',d[1]):local_values[var]=expr(value,cls,local_values)
  values=[expr(v,cls,local_values) for v in expression_args]
 if game_id=='mimic':
  values=[const(cls,'SCAN_RADIUS'),const(cls,'DURATION_SECONDS')]
  notes.append('В getDescription перепутаны аргументы радиуса и длительности. В Wiki порядок исправлен по findMostCommonBlock и длительности эффектов: радиус 2 блока, действие 5 секунд.')
 if game_id=='quick_reflexes':
  values[0]=const(cls,'BONUS_TIME_MS')/1000
  notes.append('Локализация подписывает время в секундах, но getDescription передаёт миллисекунды. Wiki переводит BONUS_TIME_MS в секунды.')
 description=re.sub(r'§[0-9a-fk-or]','',formatted(template,values),flags=re.I)
 if game_id=='str_perk':description+=' В фазе «Переворот» поддерживает эффект Сила I, периодически обновляя его.'
 if game_id=='gto_medal':
  description='Рывок вперёд по горизонтальному направлению взгляда с подъёмом. После рывка даёт Скорость III на 0.5 секунды.'
  notes.append('Комментарий класса называет 80 с, но Builder задаёт 45 с. Дальность рывка не объявлена постоянной: код задаёт импульс, итог зависит от движения.')
 if game_id=='guiding_light':
  description=f'При активации показывает след к ближайшему активному выжившему в том же мире на {const(cls,"TRAIL_DURATION_TICKS")/20:g} сек.'
  notes.append('Локализация говорит о случайной цели после взлома, но onActivate выбирает ближайшего активного выжившего. Статья следует обработчику активации.')
 stats=[];availability={}
 for method,key,label,unit in [('.cooldown','cooldown','Перезарядка','seconds'),('.manaCost','mana','Стоимость срабатывания','mana')]:
  vals=call(s,method)
  if vals:
   value=expr(vals[0],cls)
   if key=='cooldown' and value==9999:availability[key]='Один раз за матч';continue
   stats.append({'key':key,'label':label,'value':value,'unit':unit})
   availability[key]=f'{value:g} '+('с' if unit=='seconds' else 'маны')
  else:availability[key]='Не задана в базовом классе этого перка'
 if game_id=='reality_anchor':
  stats += [{'key':'charge-duration','label':'Жизнь заряда','value':const(cls,'CHARGE_DURATION_SECONDS'),'unit':'seconds'},{'key':'stored-charges','label':'Одновременно зарядов','value':const(cls,'MAX_CHARGES'),'unit':'count'},{'key':'game-charges','label':'Зарядов за матч','value':const(cls,'MAX_CHARGES_PER_GAME'),'unit':'count'}]
 # Real default getIcon path; any future override requires a new audit.
 assert not call(s,'.icon') and 'getIcon(' not in s
 icon_path=RES+'textures/perks/'+game_id+'.png';original=source(icon_path)
 existing=next((f for f in old_manifest['files'] if f.get('source')==icon_path and f.get('entityId')==id and f['local'].endswith('.webp')),None)
 if existing:
  target=asset_root/existing['local'];im=Image.open(target);size=list(im.size)
 else:
  im=Image.open(root/icon_path).convert('RGBA');alpha=im.getchannel('A').point(lambda v:255 if v>=8 else 0);box=alpha.getbbox()
  if box:
   x0,y0,x1,y1=box;pad=max(8,int(max(x1-x0,y1-y0)*.04));box=(max(0,x0-pad),max(0,y0-pad),min(im.width,x1+pad),min(im.height,y1+pad));im=im.crop(box)
  im.thumbnail((256,256),Image.Resampling.LANCZOS);size=list(im.size);target=asset_root/'wiki'/'perks'/(slug+'.webp');target.parent.mkdir(exist_ok=True);im.save(target,'WEBP',lossless=True,method=4)
 local=target.relative_to(asset_root).as_posix();blob=target.read_bytes();icon_key='registered-'+slug
 assets_ts.append((icon_key,local,size,id))
 art_records.append({'gameId':game_id,'entityId':id,'source':icon_path,'sourceSha256':hashlib.sha256(original).hexdigest(),'sourceGitBlob':tree[icon_path]['sha'],'local':local,'size':size,'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'reusedHistoricalAsset':existing is not None})
 evidence=[{'path':class_paths[cls]},{'path':class_paths['Perk']},{'path':lang_path}]
 for dependency in sorted(set(re.findall(r'\b([A-Z]\w+)\.[A-Z][A-Z_]+',' '.join(expression_args)))-{'Math','PerkPhase'}):
  if dependency in class_paths:evidence.append({'path':class_paths[dependency]})
 summary=re.split(r'(?<=[.!?])\s',description)[0]
 if len(summary)>170:summary=summary[:167].rsplit(' ',1)[0]+'…'
 rows.append({'id':id,'slug':slug,'name':name,'gameId':game_id,'team':team,'perkType':typ,'phases':phases,'description':summary,'icon':icon_key,'stats':stats,'evidence':evidence})
 conditions=[]
 cond=re.search(r'Component getConditionNotMetMessage\([^)]*\)\s*\{([\s\S]*?)\n    }',s)
 if cond:
  for key in re.findall(r'"(message\.[^"]+)"',cond[1]):
   if key in lang and not re.search(r'%[sdf]',lang[key]):conditions.append(lang[key])
 article={'id':id,'description':description,'conditions':conditions,'availability':availability,'notes':notes,'evidence':evidence}
 write(data_dir/'perk-articles'/(slug+'.json'),article)
 entry=data_dir.parent/'pages'/'perks'/(slug+'.tsx');entry.parent.mkdir(exist_ok=True)
 entry.write_text(f'import article from "../../data/perk-articles/{slug}.json";\nimport {{ ReferenceArticlePage }} from "../ReferenceArticlePage";\nexport default function Page() {{ return <ReferenceArticlePage id="{id}" article={{article}} />; }}\n',encoding='utf-8')
 meta.append({'id':id,'slug':slug,'name':name})
 audit.append({'class':cls,'classPath':class_paths[cls],'gameId':game_id,'id':id,'team':team,'type':typ,'phases':phases,'descriptionTemplate':template,'descriptionExpressions':expression_args,'resolvedArguments':values,'availability':availability,'notes':notes})
 issues += [{'id':id,'note':note} for note in notes]
assert len({r['gameId'] for r in rows})==44
assert {t:sum(r['team']==t for r in rows) for t in ['SURVIVOR','MANIAC','ALL']}=={'SURVIVOR':19,'MANIAC':15,'ALL':10}
write(data_dir/'perk-catalog.json',rows)
write(pathlib.Path('docs/maniac-3b-perk-audit.json'),{'commit':COMMIT,'perks':audit,'issues':issues,'sources':list(used.values())})
write(asset_root/'wiki'/'perks'/'imports.json',{'commit':COMMIT,'optimization':'Useful alpha bounds with padding; <=256px lossless WebP; historical assets reused without changes.','files':art_records})
ts='\n'.join(f'import icon{i} from "../../assets/{local}";' for i,(_,local,_,_) in enumerate(assets_ts))+'\nimport type { EntityAsset } from "./types";\nexport const registeredPerkAssets: Record<string,EntityAsset> = {\n'
ts+='\n'.join(f'"{key}": {{ src: icon{i}, width: {size[0]}, height: {size[1]}, kind: "illustration", entityId: "{id}" }},' for i,(key,_,size,id) in enumerate(assets_ts))+'\n};\n'
(data_dir/'registered-perk-assets.ts').write_text(ts,encoding='utf-8')
(data_dir.parent/'perk-route-metadata.ts').write_text('export const perkRouteMeta = '+json.dumps(meta,ensure_ascii=False,indent=2)+' as const;\n',encoding='utf-8')
provenance=json.loads((data_dir/'provenance.json').read_text(encoding='utf-8'));by_path={f['path']:f for f in provenance['files']};by_path.update(used);provenance['files']=list(by_path.values());write(data_dir/'provenance.json',provenance)
print(json.dumps({'perks':len(rows),'types':{t:sum(r['perkType']==t for r in rows) for t in set(r['perkType'] for r in rows)},'issues':issues},ensure_ascii=False))

# Extend the same entity system with reviewed standalone actions. No addFeature
# enumeration: a source item/armor action or the existing explicit gaze mechanic.
ability_specs=[
 ('death-teleport','DeathScytheItem','death_scythe','item:death-scythe','ПКМ с косой в основной руке. Нужна доступная цель; во время подготовки нельзя запустить вторую телепортацию.'),
 ('beast-leap','BeastClawItem','beast_claw','item:beast-claw','ПКМ когтем зверя. Урон при приземлении относится к прыжку, а не к базовому удару когтя.'),
 ('plague-orb','PlagueLanternItem','plague_lantern','item:plague-lantern','ПКМ чумной лампой. Попадание сгустком ускоряет заражение цели.'),
 ('ghost-possession','GhostHandItem','ghost_hand','item:ghost-hand','Shift + ПКМ по выжившему. Повторный Shift + ПКМ завершает одержимость раньше; применяется система одержимости Призрака.'),
 ('phantom-veil','ToyKnifeItem','toy_knife','item:toy-knife','ПКМ игрушечным ножом включает или выключает полную невидимость. Выход из неё запускает период, когда нельзя атаковать.'),
 ('musical-wave','MicrophoneItem','microphone','item:microphone','ПКМ микрофоном. Волна оглушает выживших в радиусе действия.'),
 ('damage-transfer','MedicalMaskItem','medical_mask','item:medical-mask','Нужна надетая медицинская маска и активация её способности. При получении урона нужен ближайший союзник-выживший в радиусе; без него урон не разделяется.'),
 ('quantum-swap','NetherSwapItem','nether_swap','item:quantum-teleport','Используйте устройство, выбрав подходящую цель в пределах дальности сканирования.'),
 ('smoke-cloud','BongItem','bong','item:bong','Используйте бонг. Эффект облака относится к находящимся в его области игрокам; это действие предмета, а не перк.'),
 ('hook-throw','HookItem','hook','item:hook','ПКМ хуком. При попадании хук притягивает задетое существо.'),
 ('concentrated-nightmare','GuardianHeadItem','guardian_head','item:guardian-head','Нужен Хранитель кошмаров и активация способности соответствующего предмета брони. Применяется проверка цели и готовности способности.'),
 ('abyss-gaze','KeeperOfNightmaresClass',None,None,'Пассивное воздействие взглядом Хранителя на выжившего. Не является активируемым перком или отдельным нажатием клавиши.'),
]
ability_rows=[];ability_meta=[];ability_audit=[]
current_abilities=json.loads((data_dir/'character-abilities.json').read_text(encoding='utf-8'))
relations=json.loads((data_dir/'character-relations.json').read_text(encoding='utf-8'))
characters=json.loads((data_dir/'character-catalog.json').read_text(encoding='utf-8'))
for slug,cls,locale,item_id,condition in ability_specs:
 id='ability:'+slug;s=code(cls);previous=next((a for a in current_abilities if a['id']==id),None)
 base_data=previous['revisions']['source:8692f66']['data'] if previous else {}
 name=lang['ability.maniacrev.'+locale+'.name'] if locale else 'Взгляд бездны'
 description='Долгий взгляд снижает рассудок выжившего. При срыве рассудка начинается кошмарное испытание.'
 notes=[];stats={stat['key']:stat for stat in base_data.get('stats',[])};availability={};avals=[]
 if locale:
  method=re.search(r'public String getAbilityDescription\(\)\s*\{([\s\S]*?)\}',s)
  call_args=call(method[1],'Component.translatable') if method else []
  avals=[expr(arg,cls) for arg in call_args[1:]]
  description=formatted(lang['ability.maniacrev.'+locale+'.desc'],avals)
  for method_name,key,label,unit in [('getManaCost','mana','Стоимость','mana'),('getMaxCooldownSeconds','cooldown','Перезарядка','seconds')]:
   m=re.search(r'public\s+(?:float|int)\s+'+method_name+r'\(\)\s*\{\s*return\s+([^;]+);',s)
   if m:
    value=expr(m[1],cls)
    if slug=='death-teleport' and key=='cooldown':
     value=const(cls,'TELEPORT_COOLDOWN')/1000
     notes.append('getMaxCooldownSeconds возвращает 30 с, но tryTeleport проверяет TELEPORT_COOLDOWN = 60000 мс. Здесь указано серверное ограничение 60 с.')
    stats[key]={'key':key,'label':label,'value':value,'unit':unit};availability[key]=f'{value:g} '+('с' if unit=='seconds' else 'маны')
 def extra(key,label,expression,unit,scope=cls):
  stats[key]={'key':key,'label':label,'value':expr(expression,scope),'unit':unit}
 if slug=='death-teleport':extra('windup','Подготовка','TELEPORT_WINDUP_TICKS / 20.0','seconds')
 if slug=='ghost-possession':extra('duration','Длительность одержимости','POSSESSION_DURATION_TICKS / 20','seconds','GhostPossessionManager')
 if slug=='phantom-veil':extra('recovery','Запрет атаки после выхода','RECOVERY_TICKS / 20','seconds','GhostStealthManager')
 if slug=='damage-transfer':
  extra('duration','Время действия','DURATION_TICKS / 20','seconds');extra('range','Радиус поиска союзника','DAMAGE_SHARE_RADIUS','blocks','MedicActiveAbility');extra('share','Доля разделяемого урона','DAMAGE_SHARE_FRACTION * 100','percent','MedicActiveAbility')
  notes.append('Краткое описание CharacterClass говорит о следующей атаке. MedicalMaskItem и MedicActiveAbility реализуют разделение урона в течение 15 секунд; статья следует обработчику урона.')
 if slug=='quantum-swap':extra('range','Дальность сканирования','SCAN_RANGE','blocks')
 if slug=='hook-throw':extra('range','Дальность хука','MAX_DISTANCE','blocks','HookEntity')
 if slug=='smoke-cloud':extra('duration','Жизнь облака','DURATION_TICKS / 20','seconds','BongCloudEntity');extra('range','Радиус облака','RADIUS','blocks','BongCloudEntity')
 if slug=='concentrated-nightmare':
  extra('range','Поиск цели','CONCENTRATED_NIGHTMARE_RANGE','blocks','NightmareConfig');extra('sanity','Доля рассудка','CONCENTRATED_NIGHTMARE_SANITY_PERCENT * 100','percent','NightmareConfig')
 if slug=='abyss-gaze':extra('range','Дальность взгляда','GAZE_RANGE','blocks','NightmareConfig')
 owner=next(c for c in characters if id in relations[c['gameId']]['abilityIds'])
 ev=[{'path':class_paths[cls]},{'path':owner['classPath']},{'path':lang_path}]
 if slug=='damage-transfer':ev.append({'path':class_paths['MedicActiveAbility']})
 for dependency in {'ghost-possession':['GhostPossessionManager'],'phantom-veil':['GhostStealthManager'],'smoke-cloud':['BongCloudEntity'],'hook-throw':['HookEntity']}.get(slug,[]):ev.append({'path':class_paths[dependency]})
 if slug in ['abyss-gaze','concentrated-nightmare']:ev.append({'path':class_paths['NightmareConfig']})
 icon=base_data.get('icon','concentrated-nightmare' if slug=='concentrated-nightmare' else None)
 if slug=='ghost-possession':
  image_path=RES+'textures/item/ghost_hand.png';b=source(image_path);im=Image.open(root/image_path).convert('RGBA');im.thumbnail((256,256),Image.Resampling.LANCZOS)
  target=asset_root/'wiki'/'abilities'/'ghost-possession.webp';im.save(target,'WEBP',lossless=True,method=4);blob=target.read_bytes();icon='ghost-possession'
  old_manifest['files']=[f for f in old_manifest['files'] if f['local']!='wiki/abilities/ghost-possession.webp']+[{'source':image_path,'local':'wiki/abilities/ghost-possession.webp','sourceSha256':hashlib.sha256(b).hexdigest(),'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'size':list(im.size),'entityId':id}]
  (data_dir/'ghost-ability-asset.ts').write_text('import src from "../../assets/wiki/abilities/ghost-possession.webp";\nexport const ghostAbilityAsset = { src, width: '+str(im.width)+', height: '+str(im.height)+', kind: "illustration" as const, entityId: "ability:ghost-possession" as const };\n',encoding='utf-8')
 row={'id':id,'slug':slug,'name':name,'description':description,'abilityKind':'passive-character' if slug=='abyss-gaze' else 'armor-action' if slug in ['damage-transfer','concentrated-nightmare'] else 'item-action','characterIds':[owner['id']],'itemIds':[item_id] if item_id else [],'stats':list(stats.values()),'evidence':ev}
 if 'mana' in stats:row['stats']=[v for v in row['stats'] if v['key']!='mana-cost']
 if icon:row['icon']=icon
 ability_rows.append(row);ability_meta.append({'id':id,'slug':slug,'name':name})
 article={'id':id,'description':description,'conditions':[condition],'availability':availability,'notes':notes,'evidence':ev}
 write(data_dir/'ability-articles'/(slug+'.json'),article)
 entry=data_dir.parent/'pages'/'abilities'/(slug+'.tsx');entry.parent.mkdir(exist_ok=True);entry.write_text(f'import article from "../../data/ability-articles/{slug}.json";\nimport {{ ReferenceArticlePage }} from "../ReferenceArticlePage";\nexport default function Page() {{ return <ReferenceArticlePage id="{id}" article={{article}} />; }}\n',encoding='utf-8')
 ability_audit.append({'id':id,'class':cls,'descriptionArguments':avals,'notes':notes})
write(data_dir/'ability-catalog.json',ability_rows)
(data_dir.parent/'ability-route-metadata.ts').write_text('export const abilityRouteMeta = '+json.dumps(ability_meta,ensure_ascii=False,indent=2)+' as const;\n',encoding='utf-8')
write(pathlib.Path('docs/maniac-3b-ability-audit.json'),{'commit':COMMIT,'abilities':ability_audit,'classification':'Existing explicit abilities + confirmed HookItem implements IItemWithAbility. Passive features and perk effects are not enumerated as abilities.'})
# Add only new asset files to the existing provenance manifest; never touch
# historical images, snapshots or their checksums.
for record in art_records:
 if not any(f['local']==record['local'] for f in old_manifest['files']):old_manifest['files'].append(record)
write(asset_root/'imports.json',old_manifest)
provenance=json.loads((data_dir/'provenance.json').read_text(encoding='utf-8'));by_path={f['path']:f for f in provenance['files']};by_path.update(used);provenance['files']=list(by_path.values());write(data_dir/'provenance.json',provenance)
print(json.dumps({'abilities':len(ability_rows),'abilityIssues':[a for a in ability_audit if a['notes']]},ensure_ascii=False))
