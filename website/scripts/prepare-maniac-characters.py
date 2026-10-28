"""Pinned source → character metadata, article fragments and uncropped WebP frescos.

Run from website with the bundled Python/Pillow runtime. --fetch only downloads
original binary art absent from the local audit cache; no remote runtime assets.
"""
import argparse, concurrent.futures, hashlib, json, pathlib, re, urllib.request
from PIL import Image, ImageOps, ImageDraw

COMMIT = '8692f66dc76582144be85d553d43a41f189b64e7'
JAVA = 'src/main/java/org/example/maniacrevolution/'
RES = 'src/main/resources/assets/maniacrev/'
parser = argparse.ArgumentParser()
parser.add_argument('--source-root', default='../.audit/maniac-source-8692f66')
parser.add_argument('--fetch', action='store_true')
args = parser.parse_args()
root = pathlib.Path(args.source_root)
tree = {f['path']: f for f in json.loads((root/'tree.json').read_text())['tree'] if f['type'] == 'blob'}
art_paths = [p for p in tree if p.startswith(RES+'textures/gui/frescos/') or p.startswith(RES+'textures/gui/abilities/')]
def ensure(path):
    dest = root/path
    if not dest.exists():
        if not args.fetch: raise RuntimeError('Missing source: '+path)
        with urllib.request.urlopen(f'https://raw.githubusercontent.com/doflare123/Maniac-mod-evolution/{COMMIT}/{path}', timeout=45) as r: data=r.read()
        dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
    data = dest.read_bytes()
    def git_hash(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
    if git_hash(data) != tree[path]['sha']:
        data = data.replace(b'\r\n', b'\n')
    if git_hash(data) != tree[path]['sha'] and args.fetch:
        # Connector text can normalize trailing whitespace. Fingerprint original bytes.
        with urllib.request.urlopen(f'https://raw.githubusercontent.com/doflare123/Maniac-mod-evolution/{COMMIT}/{path}', timeout=45) as r: data=r.read()
        dest.write_bytes(data)
    assert git_hash(data) == tree[path]['sha'], 'Git blob mismatch: '+path
    return data
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: list(pool.map(ensure, art_paths))
lang_path = RES+'lang/ru_ru.json'
lang = json.loads(ensure(lang_path))
classes = {pathlib.Path(p).stem:p for p in tree if p.startswith(JAVA+'character/') and p.endswith('.java')}
registered = re.findall(r'register\(new (\w+)\(\)\)', ensure(classes['CharacterRegistry']).decode())
tag_map = dict(re.findall(r'Map.entry\("([^"]+)", "([^"]+)"\)', ensure(classes['TagRegistry']).decode()))
data_dir = pathlib.Path('src/app/projects/maniac/wiki/data')
article_dir = data_dir/'character-articles'; article_dir.mkdir(exist_ok=True)
art_dir = pathlib.Path('src/app/projects/maniac/assets/characters'); art_dir.mkdir(exist_ok=True)
def write_json(path, value): path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
catalog=[]; assets=[]; sources=[]; thumbs=[]
for klass in registered:
    path = classes[klass]; code = ensure(path).decode()
    found = re.search(r'super\("([^"]+)",\s*"([^"]+)",\s*CharacterType\.(MANIAC|SURVIVOR),\s*"([^"]*)",\s*[^,]+,\s*(\d+)\)',code)
    assert found, klass
    game_id, fallback_name, side, fallback_description, difficulty = found.groups()
    prefix = f'character.maniacrev.{game_id}.'
    def local(key, fallback): return lang.get(prefix+key,fallback)
    def entries(method, group):
        result=[]
        for i, statement in enumerate(re.findall(method+r'\((.*?)\);',code,re.S)):
            values = [json.loads('"'+v+'"') for v in re.findall(r'"((?:\\.|[^"\\])*)"',statement)]
            assert len(values)>=2, (klass,statement)
            row={'name':local(f'{group}.{i}.name',values[0]),'description':local(f'{group}.{i}.description',values[1])}
            if len(values)>2: row['lore']=local(f'{group}.{i}.lore',values[2])
            result.append(row)
        return result
    features=entries('addFeature','feature'); items=entries('addItem','item')
    tags=[lang.get('character.maniacrev.tag.'+tag_map.get(t,t)+'.name',t) for t in re.findall(r'addTag\("([^"]+)"\)',code)]
    slug=game_id.replace('_','-')
    catalog.append({'gameId':game_id,'id':'character:'+slug,'slug':slug,'name':local('name',fallback_name),'role':side.lower(),'difficulty':int(difficulty),'tags':tags,'description':local('description',fallback_description),'summary':' '.join(f['description'] for f in features[:2]),'classPath':path})
    write_json(article_dir/(slug+'.json'),{'gameId':game_id,'features':features,'items':items})
    source=RES+f'textures/gui/frescos/{game_id}.png'
    original=ensure(source); image=Image.open(root/source).convert('RGBA')
    sizes={}
    for label,max_side in [('card',480),('large',1100)]:
        variant=image.copy(); variant.thumbnail((max_side,max_side),Image.Resampling.LANCZOS)
        target=art_dir/f'{game_id}-{label}.webp'; variant.save(target,'WEBP',quality=88,method=4)
        assert Image.open(target).convert('RGBA').getchannel('A').tobytes() == variant.getchannel('A').tobytes(), 'Alpha changed: '+game_id
        derived=target.read_bytes(); sizes[label]={'local':target.name,'size':list(variant.size),'bytes':len(derived),'sha256':hashlib.sha256(derived).hexdigest()}
    assets.append({'gameId':game_id,'source':source,'originalSize':list(image.size),'sourceSha256':hashlib.sha256(original).hexdigest(),'gitBlob':tree[source]['sha'],'variants':sizes})
    thumb=ImageOps.contain(image,(240,180)); tile=Image.new('RGB',(256,212),'#11151b');tile.paste(thumb,((256-thumb.width)//2,0));ImageDraw.Draw(tile).text((10,186),game_id,fill='white');thumbs.append(tile)
assert len(catalog)==15
assert sum(c['role']=='maniac' for c in catalog)==8
write_json(data_dir/'character-catalog.json',catalog)
write_json(art_dir/'imports.json',{'commit':COMMIT,'transformation':'Full uncropped composition with original alpha; RGBA WebP quality 88, max side 480/1100.','files':assets})
# Route metadata is generated from the same source, without importing game data
# or article fragments into the initial application bundle.
route_meta=[{k:c[k] for k in ['id','slug','name']} for c in catalog]
(data_dir.parent/'route-metadata.ts').write_text('// Generated by prepare-maniac-characters.py from the pinned registry.\nexport const characterRouteMeta = '+json.dumps(route_meta,ensure_ascii=False,indent=2)+' as const;\n',encoding='utf-8')
item_slugs={
 'alchemist':['alchemy-kit','brewing-stand'], 'shaman':['ancestral-totem','ancestor-soul'],
 'mefedronshchik':['adrenaline-syringe','bong'], 'scientist':['quantum-teleport'],
 'dodepovich':['dodepovich-coins','slot-machine'], 'doctor':['bandages','medical-tablet'],
 'necromancer':['salt','dead-staff'], 'agent':['agent-pistol','agent-knife','agent-armor'],
 'pudge':['hook','pudge-armor'], 'death':['death-scythe','death-armor'],
 'ursa':['ursa-armor','beast-claw'], 'plague_doctor':['plague-lantern','plague-armor'],
 'ghost':['toy-knife','ghost-hand','ghost-armor'], 'freddy_bear':['microphone','freddy-armor'],
 'keeper_of_nightmares':['nightmare-lighter','awakening-needle'],
}
# Only individually reviewed item/active-action relations, never every feature.
# game id: (stable ability slug, localization id, source feature/item, icon, implementation)
ability_map={
 'pudge':[('hook-throw','hook','item',0,'hook','item/HookItem.java')],
 'death':[('death-teleport','death_scythe','feature',1,'death_scythe','item/DeathScytheItem.java')],
 'ursa':[('beast-leap','beast_claw','feature',1,'beast_claw','item/BeastClawItem.java')],
 'plague_doctor':[('plague-orb','plague_lantern','feature',2,'plague_lantern','item/PlagueLanternItem.java')],
 'ghost':[('ghost-possession','ghost_hand','feature',0,None,'item/GhostHandItem.java'),('phantom-veil','toy_knife','feature',2,'ghost_full_invisibility','item/ToyKnifeItem.java')],
 'freddy_bear':[('musical-wave','microphone','feature',0,'microphone','item/MicrophoneItem.java')],
 'doctor':[('damage-transfer','medical_mask','feature',1,'medical_mask','event/MedicActiveAbility.java')],
 'scientist':[('quantum-swap','nether_swap','item',0,'nether_swap','item/NetherSwapItem.java')],
 'mefedronshchik':[('smoke-cloud','bong','item',1,'bong','item/BongItem.java')],
}
new_items=[]; new_abilities=[]; relations={}; icon_lines=[]
asset_manifest_path=art_dir.parent/'imports.json'; asset_manifest=json.loads(asset_manifest_path.read_text(encoding='utf-8'))
for c in catalog:
    article=json.loads((article_dir/(c['slug']+'.json')).read_text(encoding='utf-8'))
    ev=[{'path':c['classPath']},{'path':lang_path}]
    ids=[]
    for item,slug in zip(article['items'],item_slugs[c['gameId']],strict=True):
        ids.append('item:'+slug)
        if slug=='nightmare-lighter': continue
        usage='Используется выжившими для разрушения кошмарного кокона.' if slug=='awakening-needle' else ''
        item_data={'description':item['description'],'usage':usage,'abilityIds':[],'mechanicIds':[]}
        item_evidence=list(ev)
        if slug=='ancestor-soul':
            implementation=JAVA+'item/AncestorSoulItem.java'; code=ensure(implementation).decode()
            assert re.search(r'BASE_HEAL\s*=\s*2\.0f',code) and re.search(r'BONUS_PER_SPECTATOR\s*=\s*2\.0f',code)
            item_data['stats']=[{'key':'base-heal','label':'Базовое лечение','value':2,'unit':'health'},{'key':'spectator-heal','label':'За выжившего-наблюдателя','value':2,'unit':'health'}]
            item_data['usage']='К базовому лечению добавляется бонус за каждого другого выжившего в режиме наблюдателя.'
            item_evidence.append({'path':implementation})
        if slug=='beast-claw':
            implementation=JAVA+'item/BeastClawItem.java';code=ensure(implementation).decode()
            assert re.search(r'BASE_DAMAGE\s*=\s*1\.0f',code)
            item_data['stats']=[{'key':'base-damage','label':'Базовый урон','value':1,'unit':'damage'}]
            item_data['usage']='Заряды на цели усиливают последующие атаки; здесь указан базовый урон без зарядов.'
            item_evidence.append({'path':implementation})
        new_items.append({'id':'item:'+slug,'kind':'item','slug':slug,'name':item['name'],'revisions':{'source:8692f66':{'data':item_data,'evidence':item_evidence}}})
    ability_ids=[]
    for slug,locale,group,index,icon,implementation in ability_map.get(c['gameId'],[]):
        ability_ids.append('ability:'+slug)
        part=article['features' if group=='feature' else 'items'][index]
        ability_data={'description':part['description'],'mechanicIds':[]}
        if slug=='beast-leap':
            code=ensure(JAVA+implementation).decode()
            assert re.search(r'LEAP_LAND_DAMAGE\s*=\s*2\.5f',code) and re.search(r'LEAP_LAND_RADIUS\s*=\s*1\.8',code)
            assert re.search(r'LEAP_MANA_COST\s*=\s*5f',code) and re.search(r'LEAP_COOLDOWN_SECS\s*=\s*10',code)
            ability_data['stats']=[{'key':'landing-damage','label':'Урон при приземлении','value':2.5,'unit':'damage'},{'key':'landing-radius','label':'Радиус приземления','value':1.8,'unit':'blocks'},{'key':'cooldown','label':'Перезарядка','value':10,'unit':'seconds'},{'key':'mana-cost','label':'Стоимость','value':5,'unit':'mana'}]
        if icon:
            source=RES+'textures/gui/abilities/'+icon+'.png'; original=ensure(source)
            im=Image.open(root/source).convert('RGBA'); im.thumbnail((256,256),Image.Resampling.LANCZOS)
            target=art_dir.parent/'wiki'/'abilities'/(slug+'.webp'); target.parent.mkdir(exist_ok=True)
            im.save(target,'WEBP',lossless=True,method=6); blob=target.read_bytes()
            record={'source':source,'local':'wiki/abilities/'+slug+'.webp','sourceBytes':len(original),'sourceSha256':hashlib.sha256(original).hexdigest(),'sourceSize':list(Image.open(root/source).size),'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'size':list(im.size),'optimization':'Full composition, max side 256, lossless WebP.','entityId':'ability:'+slug}
            asset_manifest['files']=[f for f in asset_manifest['files'] if f['local']!=record['local']]+[record]
            ability_data['icon']=slug
            icon_lines.append(f'import icon{len(icon_lines)} from "../../assets/wiki/abilities/{slug}.webp";')
        new_abilities.append({'id':'ability:'+slug,'kind':'ability','slug':slug,'name':lang['ability.maniacrev.'+locale+'.name'],'revisions':{'source:8692f66':{'data':ability_data,'evidence':ev+[{'path':JAVA+implementation}]}}})
    if c['gameId']=='keeper_of_nightmares': ability_ids=['ability:abyss-gaze','ability:concentrated-nightmare']
    relations[c['gameId']]={'itemIds':ids,'abilityIds':ability_ids}
    # Full gameplay features remain exclusive to this article's entry chunk.
    write_json(article_dir/(c['slug']+'.json'),{'gameId':c['gameId'],'features':article['features']})
    large=next(a for a in assets if a['gameId']==c['gameId'])['variants']['large']
    entry_dir=data_dir.parent/'pages'/'characters';entry_dir.mkdir(parents=True,exist_ok=True)
    keeper=c['gameId']=='keeper_of_nightmares'
    code=f'import article from "../../data/character-articles/{c["slug"]}.json";\nimport fresco from "../../../assets/characters/{c["gameId"]}-large.webp";\nimport {{ CharacterPage }} from "../CharacterPage";\n'
    if keeper: code+='import { CharacterModelViewer } from "../../model/CharacterModelViewer";\nimport { characterModels } from "../../model/models";\n'
    code+=f'export default function CharacterArticlePage() {{ return <CharacterPage id="{c["id"]}" article={{article}} fresco={{{{ src: fresco, width: {large["size"][0]}, height: {large["size"][1]} }}}}'
    code+= '><CharacterModelViewer model={characterModels["keeper-nightmares"]} /></CharacterPage>; }\n' if keeper else ' />; }\n'
    (entry_dir/(c['slug']+'.tsx')).write_text(code,encoding='utf-8')
write_json(data_dir/'character-catalog.json',catalog)
write_json(data_dir/'character-items.json',new_items)
write_json(data_dir/'character-abilities.json',new_abilities)
write_json(data_dir/'character-relations.json',relations)
write_json(asset_manifest_path,asset_manifest)
asset_code='\n'.join(icon_lines)+'\nimport type { EntityAsset } from "./types";\nexport const characterAbilityAssets: Record<string, EntityAsset> = {\n'
ix=0
for ability in new_abilities:
    d=ability['revisions']['source:8692f66']['data']
    if 'icon' not in d: continue
    a=next(f for f in asset_manifest['files'] if f['local']=='wiki/abilities/'+ability['slug']+'.webp')
    asset_code+=f'"{ability["slug"]}": {{ src: icon{ix}, width: {a["size"][0]}, height: {a["size"][1]}, kind: "illustration", entityId: "{ability["id"]}" }},\n';ix+=1
(data_dir/'character-ability-assets.ts').write_text(asset_code+'};\n',encoding='utf-8')
# Canonical source fingerprints, verified against the pinned Git tree.
provenance_path=data_dir/'provenance.json'
provenance=json.loads(provenance_path.read_text(encoding='utf-8'))
by_path={s['path']:s for s in provenance['files']}
used=[classes[c] for c in registered]+[classes[n] for n in ['CharacterClass','CharacterRegistry','CharacterType','TagRegistry']]+[lang_path]
used += [p for p in tree if (root/p).exists() and p.startswith(JAVA) and p.endswith('.java')]
for path in sorted(set(used)):
    b=ensure(path);by_path[path]={'path':path,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
provenance['files']=list(by_path.values());write_json(provenance_path,provenance)
sheet=Image.new('RGB',(256*5,212*3),'#11151b')
for i,tile in enumerate(thumbs): sheet.paste(tile,((i%5)*256,(i//5)*212))
sheet.save(root/'character-contact-sheet.jpg')
print(json.dumps({'characters':len(catalog),'maniacs':8,'survivors':7,'frescoBytes':sum(v['bytes'] for a in assets for v in a['variants'].values()),'sourceFiles':len(provenance['files'])}))
