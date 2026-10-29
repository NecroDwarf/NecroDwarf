"""Pinned map registry/guide -> typed metadata, isolated articles, responsive art.
Run from website with Python/Pillow. --fetch enables missing canonical sources.
"""
import argparse,hashlib,json,pathlib,re,urllib.request
from PIL import Image
COMMIT='8692f66dc76582144be85d553d43a41f189b64e7'
ROOT=pathlib.Path('../.audit/maniac-source-8692f66')
JAVA='src/main/java/org/example/maniacrevolution/'
RES='src/main/resources/assets/maniacrev/'
DATA=pathlib.Path('src/app/projects/maniac/wiki/data')
ART=pathlib.Path('src/app/projects/maniac/assets/maps')
parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true');args=parser.parse_args()
if not (ROOT/'tree.json').exists():
 assert args.fetch,'Use --fetch to initialize pinned source tree'
 req=urllib.request.Request('https://api.github.com/repos/doflare123/Maniac-mod-evolution/git/trees/'+COMMIT+'?recursive=1',headers={'User-Agent':'NecroDwarf-map-audit'})
 with urllib.request.urlopen(req,timeout=60) as r:tree=r.read()
 ROOT.mkdir(parents=True,exist_ok=True);(ROOT/'tree.json').write_bytes(tree)
tree={row['path']:row for row in json.loads((ROOT/'tree.json').read_text())['tree'] if row['type']=='blob'}
used={}
def source(path):
 dest=ROOT/path;b=dest.read_bytes() if dest.exists() else b''
 def valid(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==tree[path]['sha']
 if not valid(b) and args.fetch:
  with urllib.request.urlopen('https://raw.githubusercontent.com/doflare123/Maniac-mod-evolution/'+COMMIT+'/'+path,timeout=60) as r:b=r.read()
  dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
 assert valid(b),path
 used[path]={'path':path,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)};return b
def write(path,value):
 path=pathlib.Path(path);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lang=json.loads(source(RES+'lang/ru_ru.json'))
registry=source(JAVA+'map/MapRegistry.java').decode()
guide=source(JAVA+'guide/MapGuideRegistry.java').decode()
registered=re.findall(r'register\(new MapData\(\s*"([^"]+)",\s*(\d+),\s*"([^"]+)",\s*"([^"]+)",\s*new ResourceLocation\(Maniacrev.MODID, "([^"]+)"\)',registry)
entries=re.findall(r'entry\("([^"]+)",\s*(\d+),\s*(\d+)\)',guide)
assert [r[0] for r in registered]==[r[0] for r in entries]
assert len({r[0] for r in registered})==len(registered)==3
assert len({r[1] for r in registered})==3
source_paths=[JAVA+p for p in ['map/MapRegistry.java','map/MapData.java','guide/MapGuideRegistry.java','gui/pages/MapsPage.java']]+[RES+'lang/ru_ru.json']
vote_paths=[JAVA+p for p in ['map/MapVotingManager.java','command/VoteMapCommand.java','client/screen/MapVotingScreen.java','item/VotingTicketItem.java','settings/GameSettings.java']]
for path in source_paths+vote_paths:source(path)
ev=[{'path':p} for p in source_paths]
catalog=[];audit=[];images=[];sizes={};image_meta={}
for reg,entry in zip(registered,entries):
 slug,numeric,registry_name,registry_description,texture=reg;_,difficulty,count=entry
 prefix='guide.maniacrev.map.'+slug+'.'
 name,description,size=[lang[prefix+k] for k in ['name','description','size']]
 details=[lang[prefix+'detail.'+str(i)] for i in range(int(count))]
 assert sum(k.startswith(prefix+'detail.') for k in lang)==int(count)
 related=['mechanic:hacking','mechanic:qte','mechanic:objectives-and-escape']
 if slug in ['mansion','pizzeria']:related.append('mechanic:map-interactions')
 feature_indexes={'mansion':[0,1,2],'pizzeria':[0,1,3],'fort':[0,1,2]}[slug]
 row={'id':'map:'+slug,'slug':slug,'name':name,'numericId':int(numeric),'description':description,'size':size,'difficulty':int(difficulty),'features':[details[i] for i in feature_indexes],'relatedIds':related,'evidence':ev}
 if slug=='fort':row['chronicle']={'version':'1.1','sectionId':'fort-map'}
 catalog.append(row)
 notes=[]
 if slug=='pizzeria':notes.append('MapRegistry описывает пиццерию как большую и длинную; локализованный справочник — как компактную, размер «Средняя». Публичные характеристики взяты из справочника.')
 if slug=='fort':notes.append('MapRegistry и хроника 1.1 называют Форт маленьким/компактным. Локализованное руководство указывает размер «Средняя». Историческая хроника не изменена.')
 article={'id':row['id'],'details':details,'notes':notes,'registryDescription':registry_description,'evidence':ev}
 write(DATA/'map-articles'/(slug+'.json'),article)
 path=RES+texture;b=source(path);im=Image.open(ROOT/path).convert('RGB');ART.mkdir(exist_ok=True)
 variants=[]
 for width in sorted(set(min(im.width,w) for w in [640,960,1600])):
  height=round(im.height*width/im.width);dest=ART/(slug+'-'+str(width)+'.webp')
  im.resize((width,height),Image.Resampling.LANCZOS).save(dest,'WEBP',quality=86,method=6)
  variants.append({'file':dest.name,'width':width,'height':height})
  images.append({'source':path,'sourceSha256':hashlib.sha256(b).hexdigest(),'sourceSize':[im.width,im.height],'sourceBytes':len(b),'local':dest.name,'size':[width,height],'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'transformation':'Full composition, no crop, proportional Lanczos resize, WebP quality 86'})
 sizes[slug]=variants;image_meta[slug]={'width':im.width,'height':im.height}
 audit.append({**row,'detailCount':len(details),'registryDescription':registry_description,'registryName':registry_name,'notes':notes,'sourceImage':path,'sourceSize':[im.width,im.height]})
write(DATA/'map-catalog.json',catalog)
(DATA.parent/'map-route-metadata.ts').write_text('export const mapRouteMeta = '+json.dumps([{k:r[k] for k in ['id','slug','name']} for r in catalog],ensure_ascii=False,indent=2)+' as const;\n',encoding='utf-8')
imports=[];values=[]
for row in catalog:
 slug=row['slug'];small=sizes[slug][:2]
 for i,variant in enumerate(small):imports.append(f'import {slug}{i} from "../../assets/maps/{variant["file"]}";')
 srcset=' + ", " + '.join(f'{slug}{i}+" {v["width"]}w"' for i,v in enumerate(small))
 values.append(f'"{slug}": {{src:{slug}0,srcSet:{srcset},width:{small[-1]["width"]},height:{small[-1]["height"]}}}')
(DATA.parent/'pages'/'map-card-images.ts').write_text('\n'.join(imports)+'\nexport const mapCardImages = {'+','.join(values)+'};\n',encoding='utf-8')
target=DATA.parent/'pages'/'maps';target.mkdir(exist_ok=True)
for row in catalog:
 slug=row['slug'];variants=sizes[slug]
 imports=''.join(f'import image{i} from "../../../assets/maps/{v["file"]}";\n' for i,v in enumerate(variants))
 srcset=' + ", " + '.join(f'image{i}+" {v["width"]}w"' for i,v in enumerate(variants))
 last=len(variants)-1
 image='const image={src:image'+str(last)+',srcSet:'+srcset+',width:'+str(variants[-1]['width'])+',height:'+str(variants[-1]['height'])+'};\n'
 (target/(slug+'.tsx')).write_text(f'import article from "../../data/map-articles/{slug}.json";\n{imports}import {{ MapArticlePage }} from "../MapArticlePage";\n'+image+f'export default function Page() {{return <MapArticlePage id="map:{slug}" article={{article}} image={{image}} />;}}\n',encoding='utf-8')
voting={'paragraphs':[
 'Перед матчем организатор может запустить голосование. Игроки выбирают карту в специальном интерфейсе; билет голосования открывает это меню.',
 'У каждого игрока хранится один текущий голос: новый выбор заменяет предыдущий. Побеждает карта с наибольшим числом голосов; при равенстве лидер выбирается случайно среди карт с максимальным результатом.',
 'Если никто не проголосовал, случайная карта выбирается из зарегистрированных. Когда количество голосов равно текущему числу игроков на сервере, оставшееся время при значении больше пяти секунд сокращается до пяти.',
 'После завершения показывается анимация результата. Сервер сохраняет выбранную карту после задержки 160 тиков (около 8 секунд). Это отдельный этап после отсчёта голосования.',
 'Если в настройках заранее выбрана конкретная зарегистрированная карта, команда использует её напрямую и обходит обычное голосование. Некорректный выбранный ID приводит к сообщению об ошибке.',
 'Команда /maniacrev votemap использует 60 секунд по умолчанию и принимает длительность от 10 до 300 секунд. Это параметры команды организатора, а не обязательное время выбора в каждом матче.'
 ],'notes':['MapVotingScreen задаёт собственный RESULT_DISPLAY_DURATION=200 тиков, тогда как MapVotingManager фиксирует результат через 160 тиков. Не приравниваем клиентскую анимацию к задержке серверной фиксации.','Содержимое миров, точные координаты и полный внешний датапак в исходном снимке отсутствуют. Превью меню не является планом уровня.'],'evidence':[{'path':p} for p in vote_paths]}
write(DATA/'map-voting.json',voting)
write(ART/'imports.json',{'commit':COMMIT,'files':images})
write('docs/maniac-3c2-maps-audit.json',{'commit':COMMIT,'maps':audit,'voting':voting,'sourceFiles':list(used.values())})
provenance=json.loads((DATA/'provenance.json').read_text());files={r['path']:r for r in provenance['files']};files.update(used);provenance['files']=list(files.values());write(DATA/'provenance.json',provenance)
print(json.dumps({'maps':len(catalog),'details':[r['detailCount'] for r in audit],'images':len(images),'sourceSizes':image_meta},ensure_ascii=False))
