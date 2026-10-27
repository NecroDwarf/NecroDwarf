"""Original Minecraft inventory sprites and confirmed flat Maniac item models.
Archives remain in ignored .audit; only tiny derived PNGs enter site assets.
"""
import hashlib, io, json, pathlib, urllib.request, zipfile
from PIL import Image, ImageChops
ROOT=pathlib.Path('../.audit/equipment-icons');ROOT.mkdir(exist_ok=True)
OUT=pathlib.Path('src/app/projects/maniac/assets/wiki/equipment');OUT.mkdir(exist_ok=True)
COMMIT='8692f66dc76582144be85d553d43a41f189b64e7'
BASE=f'https://raw.githubusercontent.com/doflare123/Maniac-mod-evolution/{COMMIT}/'
source_root=pathlib.Path('../.audit/maniac-source-8692f66')
tree={x['path']:x['sha'] for x in json.loads((source_root/'tree.json').read_text())['tree'] if x['type']=='blob'}
preview_path='src/main/java/org/example/maniacrevolution/client/screen/CharacterLoadoutPreview.java'
preview=(source_root/preview_path).read_bytes().replace(b'\r\n',b'\n')
def verify_source(path,body):
    assert hashlib.sha1(b'blob '+str(len(body)).encode()+b'\0'+body).hexdigest()==tree[path],path
verify_source(preview_path,preview)
def fetch(url):
    with urllib.request.urlopen(url,timeout=90) as r:return r.read()
manifest=json.loads(fetch('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'))
version=next(v for v in manifest['versions'] if v['id']=='1.20.1')
meta_bytes=fetch(version['url']);assert hashlib.sha1(meta_bytes).hexdigest()==version['sha1']
download=json.loads(meta_bytes)['downloads']['client']
jar=ROOT/'minecraft-1.20.1-client.jar'
if not jar.exists() or hashlib.sha1(jar.read_bytes()).hexdigest()!=download['sha1']:
    jar.write_bytes(fetch(download['url']))
assert hashlib.sha1(jar.read_bytes()).hexdigest()==download['sha1']
archive=zipfile.ZipFile(jar)
files=[];imports=[];rows=[]
def save(slug,image,source,source_bytes,extra=None):
    image.thumbnail((128,128),Image.Resampling.LANCZOS)
    target=OUT/(slug+'.png');image.save(target);b=target.read_bytes()
    files.append({'local':target.name,'entityId':'item:'+slug,'size':list(image.size),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'source':source,'sourceSha256':hashlib.sha256(source_bytes).hexdigest(),**(extra or {})})
    i=len(rows);imports.append(f'import icon{i} from "../../assets/wiki/equipment/{slug}.png";')
    rows.append(f'"{slug}": {{ src: icon{i}, width: {image.width}, height: {image.height}, kind: "pixel-texture", entityId: "item:{slug}" }},')
base_path='assets/minecraft/textures/item/'
leather=archive.read(base_path+'leather_chestplate.png')
overlay=archive.read(base_path+'leather_chestplate_overlay.png')
base=Image.open(io.BytesIO(leather)).convert('RGBA')
top=Image.open(io.BytesIO(overlay)).convert('RGBA')
# Dyes are explicit in pinned CharacterLoadoutPreview.java. This icon represents
# the armor set using its chestplate, not an unrelated texture atlas.
colors={'agent-armor':0x202020,'pudge-armor':0x5A2F22,'death-armor':0x111111,'ursa-armor':0x6B3F22,'plague-armor':0x273023,'ghost-armor':0xF2F2F2,'freddy-armor':0x704326}
for slug,color in colors.items():
    game_id={'plague-armor':'plague_doctor','freddy-armor':'freddy_bear'}.get(slug,slug.removesuffix('-armor'))
    block=preview.decode().split(f'case "{game_id}" ->')[1].split('case ')[0]
    import re
    actual=re.search(r'addLeatherArmor\(entries,\s*character,\s*\d+,\s*(0x[0-9A-Fa-f]+)\)',block)
    assert actual and int(actual[1],16)==color
    dye=((color>>16)&255,(color>>8)&255,color&255)
    rgb=ImageChops.multiply(base.convert('RGB'),Image.new('RGB',base.size,dye));colored=rgb.convert('RGBA');colored.putalpha(base.getchannel('A'));colored=Image.alpha_composite(colored,top)
    save(slug,colored,base_path+'leather_chestplate.png',leather,{'dye':f'#{color:06x}','overlaySource':base_path+'leather_chestplate_overlay.png','overlaySha256':hashlib.sha256(overlay).hexdigest(),'evidence':'CharacterLoadoutPreview.java, pinned '+COMMIT})
for slug,texture in [('agent-knife','iron_sword'),('brewing-stand','brewing_stand')]:
    path=base_path+texture+'.png';b=archive.read(path);save(slug,Image.open(io.BytesIO(b)).convert('RGBA'),path,b)
for slug,game_id in [('ghost-hand','ghost_hand'),('toy-knife','toy_knife')]:
    model_path=f'src/main/resources/assets/maniacrev/models/item/{game_id}.json';model_bytes=fetch(BASE+model_path);model=json.loads(model_bytes)
    verify_source(model_path,model_bytes)
    assert model['parent'] in ['minecraft:item/generated','minecraft:item/handheld'] and 'elements' not in model
    path=f'src/main/resources/assets/maniacrev/textures/item/{game_id}.png';b=fetch(BASE+path)
    verify_source(path,b)
    save(slug,Image.open(io.BytesIO(b)).convert('RGBA'),path,b,{'modCommit':COMMIT,'modelSource':model_path,'modelSha256':hashlib.sha256(model_bytes).hexdigest()})
(OUT/'imports.json').write_text(json.dumps({'minecraftVersion':'1.20.1','clientUrl':download['url'],'clientSha1':download['sha1'],'modCommit':COMMIT,'previewSource':preview_path,'previewSha256':hashlib.sha256(preview).hexdigest(),'files':files},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
code='\n'.join(imports)+'\nimport type { EntityAsset } from "./types";\nexport const equipmentAssets: Record<string,EntityAsset> = {\n'+'\n'.join(rows)+'\n};\n'
pathlib.Path('src/app/projects/maniac/wiki/data/equipment-assets.ts').write_text(code,encoding='utf-8')
print(json.dumps({'icons':len(files),'bytes':sum(f['bytes'] for f in files)}))
