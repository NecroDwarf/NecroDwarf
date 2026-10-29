"""Pinned ModItems audit and source-reviewed item/mechanic article preparation.
Run from website. Uses canonical .audit cache, never executes Java or changes mod.
Static model renders are prepared separately by render-maniac-systems.mjs.
"""
import json,pathlib,re,hashlib,base64,argparse,urllib.request
from PIL import Image
COMMIT='8692f66dc76582144be85d553d43a41f189b64e7'
ROOT=pathlib.Path('../.audit/maniac-source-8692f66')
parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true',help='Fetch missing pinned sources into ignored audit cache');args=parser.parse_args()
JAVA='src/main/java/org/example/maniacrevolution/'
RES='src/main/resources/assets/maniacrev/'
DATA=pathlib.Path('src/app/projects/maniac/wiki/data')
ART=pathlib.Path('src/app/projects/maniac/assets/wiki/systems')
ART.mkdir(exist_ok=True)
if not (ROOT/'tree.json').exists():
 assert args.fetch,'Missing pinned tree; use --fetch'
 request=urllib.request.Request('https://api.github.com/repos/doflare123/Maniac-mod-evolution/git/trees/'+COMMIT+'?recursive=1',headers={'User-Agent':'NecroDwarf-content-audit'})
 with urllib.request.urlopen(request,timeout=60) as response:tree_bytes=response.read()
 ROOT.mkdir(parents=True,exist_ok=True);(ROOT/'tree.json').write_bytes(tree_bytes)
TREE={x['path']:x for x in json.loads((ROOT/'tree.json').read_text())['tree'] if x['type']=='blob'}
used={}
def source(path):
 dest=ROOT/path;b=dest.read_bytes() if dest.exists() else b''
 def valid(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==TREE[path]['sha']
 if not valid(b) and args.fetch:
  with urllib.request.urlopen('https://raw.githubusercontent.com/doflare123/Maniac-mod-evolution/'+COMMIT+'/'+path,timeout=60) as response:b=response.read()
  dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
 assert valid(b),path
 used[path]={'path':path,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 return b
def java(path):return source(JAVA+path).decode()
def write(path,value):
 path=pathlib.Path(path);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lang=json.loads(source(RES+'lang/ru_ru.json'))
code=java('ModItems.java')
registrations=[]
for m in re.finditer(r'RegistryObject<Item>\s+(\w+)\s*=\s*ITEMS.register\("([^"]+)"',code):
 body=code[m.end():code.index(';',m.end())]
 klass=re.search(r'new (\w+)\(|(\w+)::new',body)
 registrations.append({'field':m[1],'gameId':m[2],'class':next(v for v in klass.groups() if v) if klass else None,'statement':body.strip()})
assert len({r['gameId'] for r in registrations})==len(registrations)
classes={pathlib.PurePosixPath(p).stem:p for p in TREE if p.startswith(JAVA) and p.endswith('.java')}
old=json.loads((DATA/'character-items.json').read_text())
aliases={'necromancer_staff':'dead-staff','bandage':'bandages','medic_tablet':'medical-tablet','syringe':'adrenaline-syringe','totem_spawn_item':'ancestral-totem','nether_swap':'quantum-teleport'}
def slug(id):return aliases.get(id,id.replace('_','-'))
excluded={
 'shop_token':'Открывает интерфейс магазина, не самостоятельное игровое снаряжение.',
 'perk_token':'Открывает выбор перков; интерфейсный токен.',
 'settings_item':'Открывает настройки организатора.',
 'survivor_selection':'Кнопка выбора класса выжившего.', 'maniac_selection':'Кнопка выбора класса маньяка.',
 'pre_game_ready_item':'Служебный переключатель готовности до матча.', 'pre_game_ready_item_active':'Активное состояние переключателя готовности до матча.',
 'ready_item':'Служебный переключатель готовности.', 'ready_item_active':'Активное состояние переключателя готовности.',
 'voting_ticket':'Открывает голосование за карту; не расходник основного геймплея.'}
# Reviewed prose describes handlers, not the preview as an inventory guarantee.
# category, summary, use, confirmed owner, mechanic
specs={
 'salt':('consumable','Размещает соль-ловушку на подходящей поверхности.','ПКМ по поверхности: требуется свободное место над твёрдым основанием. Размещение расходует одну соль вне творческого режима. Наступившую цель обрабатывают SaltBlock и SaltTracker.','necromancer','traps'),
 'generator':('block','Устанавливаемый генератор, связанный с Фредди.','Используется как игровой блок. Его энергия и взаимодействие с Фредди определяются FNAFGeneratorBlockEntity; регистрация не гарантирует наличие генератора на каждой карте.','freddy','freddy-generator'),
 'clarity':('consumable','Напиток, накладывающий усиление манопотока.','Удерживайте использование 32 тика (1,6 с). После завершения накладывается Mana Flow с amplifier 1 на 120 тиков (6 с), один предмет расходуется вне творческого режима. Комментарии о 30 секундах не соответствуют константе.','','mana'),
 'hook':('weapon','Оружие Мясника с активным броском крюка.','ПКМ запускает бросок при достаточной мане и готовой перезарядке. Попадание и притягивание обрабатывает HookEntity. Подробные параметры — в статье способности.','pudge',''),
 'death_scythe':('weapon','Коса Смерти позволяет готовить телепортацию к случайному выжившему.','ПКМ с косой в основной руке запускает подготовку. Сервер проверяет доступность цели, ману и собственный cooldown; он отличается от значения getter интерфейса.','death',''),
 'necromancer_staff':('tool','Посох для выбора и воскрешения погибшего союзника.','Только Некромант может начать ритуал. Удерживайте использование 5 с при наличии 60 маны. Завершение списывает ману и 30 прочности, затем открывает выбор души. Прерывание тратит 10 прочности.','necromancer','resurrection'),
 'soul_essence':('resource','Ингредиент ремонта брони Некроманта.','Указан как repairIngredient материала NECROMANCER. Надёжный способ получения в исследованном коде не установлен; предмет не объявлен стартовой выдачей.','necromancer',''),
 'recipe_book':('reference','Открывает внутриигровой список рецептов зелий.','Используйте предмет, чтобы открыть интерфейс рецептов. Сами преобразования ингредиентов проверяются по ModBrewingRecipes, а не по названию предмета.','alchemist','alchemy'),
 'bandage':('consumable','Лечит себя или другого подходящего игрока перед собой.','Удерживайте использование и направьте взгляд на цель в пределах 3 блоков либо в сторону для самолечения. По завершении другой игрок получает 4 HP, сам пользователь — 2 HP. Предмет расходуется. Getter возвращает 90 тиков; локальная переменная 60 тиков в onUseTick не меняет длительность завершения.','medic','downed'),
 'medic_tablet':('tool','Показывает здоровье союзника и открывает медицинский интерфейс.','ПКМ по подходящему выжившему в пределах поиска 20 блоков показывает его здоровье; если цель не выбрана, открывается планшет. Отслеживание и его ограничения задаёт обработчик медицинской системы.','medic','medical-care'),
 'medical_mask':('armor','Маска активирует разделение входящего урона с союзником.','Наденьте маску и активируйте способность брони. В течение её действия обработчик ищет ближайшего союзника; без него урон не разделяется. Подробности — «Спасибо, доктор».','medic','medical-care'),
 'agent47_tablet':('tool','Открывает магазин Агента 47.','ПКМ открывает персональный интерфейс. Наличие товара, цена и доступность покупки проверяются серверным магазином; это не универсальный список стартового оружия.','agent47','agent-shop'),
 'microphone':('weapon','Предмет Фредди с активной музыкальной волной.','ПКМ расходует ману и запускает оглушение подходящих выживших в радиусе. Точные параметры приведены в статье способности.','freddy','freddy-generator'),
 'toy_knife':('weapon','Игрушечный нож включает и выключает фантомную завесу.','ПКМ переключает полную невидимость. После выхода действует запрет атаки; скрытие экипировки и возврат вещей выполняет GhostStealthManager.','ghost','ghost-states'),
 'ghost_hand':('tool','Рука для одержимости выжившим и управления его движением.','Выберите подходящую цель и активируйте предмет. Повторное применение может завершить одержимость. Серверный менеджер ограничивает состояние и возвращает управление.','ghost','ghost-states'),
 'beast_claw':('weapon','Коготь Урсы с активным прыжком вперёд.','ПКМ запускает прыжок при готовой способности. Урон по области относится к приземлению и не является постоянным уроном каждого обычного удара.','ursa','ursa-stacks'),
 'beehive_food':('consumable','Съедаемый улей Урсы запускает ярость и выпускает пчёл.','Удерживайте использование 60 тиков (3 с). Код задаёт 200 тиков ярости и выпуск пяти пчёл; предмет является расходуемой пищей.','ursa','ursa-stacks'),
 'plague_lantern':('weapon','Лампа Чумного доктора связана с чумой и броском сгустка.','ПКМ создаёт PlagueOrbEntity при достаточной мане. Пассивная аура и заражение обрабатываются отдельно от активного снаряда.','plague-doctor','plague'),
 'bong':('tool','Создаёт дымовое облако, связанное с зависимостью Мефедронщика.','Используйте предмет при готовой способности. Вход в облако и нахождение в нём обрабатываются BongCloudEntity и системой зависимости; влияние зависит от стороны и состояния игрока.','mefedronshchik','addiction'),
 'syringe':('consumable','Снижает зависимость и добавляет ускорение с убывающей эффективностью.','Используйте шприц. Длительность новой порции скорости: max(1, 8 − число предыдущих шприцев) секунд. Уровень теряется каждые три применения, длительности складываются. Передозировка проверяется сервером; исторические числа хроники не заменяют текущий код.','mefedronshchik','addiction'),
 'ancestor_soul':('consumable','Лечит пользователя с учётом погибших выживших.','Размер лечения вычисляется из базовых 2 HP и прибавки 2 HP за подходящего выжившего-наблюдателя. Число погибших — состояние матча, поэтому итог не фиксирован.','shaman','shaman-spirits'),
 'totem_spawn_item':('tool','Устанавливает тотем Шамана для обнаружения маньяков.','Примените предмет на допустимой поверхности. Предмет создаёт объект тотема, который отслеживается менеджером; условия размещения и действие не следует путать с простой иконкой в превью.','shaman','shaman-spirits'),
 'nether_swap':('tool','Устройство Учёного меняет местами с выбранным игроком.','Выберите подходящую цель в пределах дальности сканирования и используйте устройство. После успешного обмена применяется защитный эффект; стоимость и cooldown — в статье способности.','scientist',''),
 'slot_machine':('block','Казино-автомат для особого розыгрыша монеток Додеповича.','Взаимодействуйте с размещённым автоматом. Доступность ставки, выбор результата и изменения состояния контролирует DodepovichCasinoManager.','dodepovich','casino'),
 'nightmare_lighter':('tool','Переносной свет внутри кошмарных испытаний.','Переключите зажигалку и держите её в руке. Включённый предмет расходует запас топлива с интервалом 10 тиков; максимум — 1200. При исчерпании топлива предмет исчезает.','keeper-of-nightmares','nightmare-trials'),
 'awakening_needle':('tool','Инструмент спасения союзника из кошмарного кокона.','Участвуйте в проверках иглой у кокона. При наличии активного Хранителя стартовый обработчик раздаёт иглы случайным активным выжившим: ceil(число выживших / 3). Это не личное оружие Хранителя.','','nightmare-trials'),
 'paint_can':('perk-item','Личная банка перка «Краски сгущаются» создаёт лужу краски.','ПКМ по подходящему блоку создаёт лужу через PaintPuddleManager. Проверяется владелец и оставшееся количество использований. Предмет нельзя считать произвольным общим расходником.','','paint'),
 'forget_me_not':('perk-item','Личный цветок перка «Незабудка» задаёт точку возврата.','ПКМ по верхней грани подходящего блока устанавливает принадлежащий вам цветок. Возвращение запускается самим перком; подготовка может быть прервана.','','flower-return'),
 'rose_colored_glasses':('perk-item','Личные очки защищают от определённых отрицательных состояний.','Держите очки во второй руке. Защита расходует прочность по правилам RoseColoredGlassesManager; предмет привязан к владельцу, не ремонтируется и не передаётся.','','status-effects'),
 'pink_orchid':('perk-item','Многоразовая орхидея записывает маршрут для иллюзии.','ПКМ начинает или завершает запись через PinkOrchidManager. Записанный маршрут воспроизводит иллюзия; личную орхидею нельзя передать другому игроку.','','orchid-illusion'),
 'sber_sprout':('perk-item','Росток хранит долю прогресса взлома и переносит её на компьютер.','Заполненный росток применяют ПКМ к подходящему компьютеру. Сохранённый прогресс и итоговый перенос зависят от реальной сессии взлома, а не являются постоянным процентом на каждой иконе.','','hacking'),
 'guardian_head':('armor','Элемент брони для Концентрированного кошмара.','Наденьте голову Хранителя и активируйте способность брони. У подходящей цели снимается доля максимального рассудка; стоимость поиска и cooldown задаются NightmareConfig.','keeper-of-nightmares','sanity'),
}
for part in ['helmet','chestplate','leggings','boots']:
 specs['necromancer_'+part]=('armor','Элемент комплекта брони Некроманта.','Материал NECROMANCER задаёт нулевые очки защиты и repairIngredient soul_essence. Не следует приписывать ему характеристики ванильной алмазной брони по одному внешнему виду.','necromancer','resurrection')
fragment_effects={'regen':'медленной регенерации','strength':'силы','speed':'скорости','slowness':'замедления','slow_falling':'плавного падения','weakness':'слабости','healing':'лечения','blindness':'слепоты','glowing':'свечения'}
for key,effect in fragment_effects.items():
 specs['maniac_'+key+'_fragment']=('resource','Ингредиент зелья '+effect+'.','Используется в зельеварке с основой AWKWARD. ModBrewingRecipes регистрирует переход для этого ингредиента; результат может отличаться формой бутылки от входной основы.','alchemist','alchemy')
coin_effects={
 'elusiveness':'Разыгрывает положительное или отрицательное состояние, связанное с неуловимостью.',
 'insight':'Разыгрывает исход, связанный с обнаружением игроков.',
 'shackles':'Разыгрывает ограничение движения одной из сторон.',
 'health':'Разыгрывает исход, связанный со здоровьем.',
 'eagle':'Разыгрывает особый исход Монетки Орла.',
 'debt':'Разыгрывает исход долга с последствиями для состояния игрока.',
 'reroll':'Меняет розыгрыш по правилам менеджера казино.',
 'fate':'Редкая монетка с особыми исходами судьбы.'}
for key,effect in coin_effects.items():specs['coin_'+key]=('coin',effect,'Используйте монетку для броска или участвуйте в розыгрыше автомата. Точный исход выбирается сервером; успешный и неуспешный варианты приведены в статье механики казино.','dodepovich','casino')
for color in ['red','blue','green']:
 use={'red':'Выживший бросает карту для отбрасывания маньяка; маньяк использует её для показа компьютеров.','blue':'ПКМ по незавершённому компьютеру изменяет его прогресс; результат зависит от игровой стороны.','green':'Выжившему даёт лечение, маньяку — накопление дополнительного урона.'}[color]
 specs[color+'_color_card']=('perk-item','Временная личная карта Цветной рулетки.',use+' Предмет привязан к владельцу и исчезает по окончании своего времени.','','color-roulette')
assert set(specs)|set(excluded)=={r['gameId'] for r in registrations}
# Extra, already existing entities are retained as equipment groups / resource sets.
old_ids={v['id']:v for v in old}
owners=json.loads((DATA/'character-relations.json').read_text())
character_catalog=json.loads((DATA/'character-catalog.json').read_text())
owner_by_slug={c['slug']:c for c in character_catalog}
owner_by_game={c['gameId']:c for c in character_catalog}
perk_links={'paint_can':'the-paint-thickens','forget_me_not':'forget-me-not','rose_colored_glasses':'rose-colored-glasses','pink_orchid':'pink-orchid','sber_sprout':'sber-sprout','red_color_card':'color-roulette','blue_color_card':'color-roulette','green_color_card':'color-roulette','clarity':'football-fan'}
ability_by_item={}
for a in json.loads((DATA/'ability-catalog.json').read_text()):
 for i in a['itemIds']:ability_by_item.setdefault(i,[]).append(a['id'])
def evidence(paths):
 result=[]
 for p in dict.fromkeys(paths):source(p);result.append({'path':p})
 return result
extra_sources={
 'nightmare_lighter':['nightmare/NightmareConfig.java','nightmare/NightmareManager.java'],
 'awakening_needle':['game/GameManager.java','nightmare/NightmareConfig.java','nightmare/NightmareManager.java'],
 'necromancer_staff':['network/packets/ResurrectPlayerPacket.java'],
 'generator':['block/FNAFGeneratorBlock.java','block/entity/FNAFGeneratorBlockEntity.java'],
 'slot_machine':['dodepovich/DodepovichCasinoManager.java','block/SlotMachineBlock.java'],
 'paint_can':['paint/PaintPuddleManager.java','perk/perks/maniac/ThePaintThickensPerk.java'],
 'forget_me_not':['forgetmenot/ForgetMeNotManager.java','perk/perks/survivor/ForgetMeNotPerk.java'],
 'pink_orchid':['pinkorchid/PinkOrchidManager.java'],
 'sber_sprout':['sbersprout/SberSproutManager.java'],
 'rose_colored_glasses':['roseglasses/RoseColoredGlassesManager.java'],
 'syringe':['event/AddictionEventHandler.java','capability/AddictionCapability.java'],
 'medical_mask':['event/MedicActiveAbility.java'],
 'salt':['block/SaltBlock.java'],
 'plague_lantern':['event/PlagueLanternEventHandler.java'],
}
known_stats={
 'clarity':[('use','Употребление',1.6,'seconds'),('duration','Манопоток',6,'seconds')],
 'necromancer_staff':[('cast','Ритуал',5,'seconds'),('mana','Стоимость ритуала',60,'mana'),('durability','Прочность',90,'count'),('success-cost','Расход за завершение',30,'count'),('interrupt-cost','Расход за прерывание',10,'count')],
 'bandage':[('use','Завершение применения',4.5,'seconds'),('self-heal','Самолечение',2,'health'),('ally-heal','Лечение другого игрока',4,'health')],
 'nightmare_lighter':[('fuel','Запас топлива',1200,'count'),('fuel-tick','Интервал расхода',0.5,'seconds')],
 'beehive_food':[('use','Поедание',3,'seconds'),('duration','Ярость',10,'seconds'),('bees','Пчёл',5,'count')],
}
visual_records=[];render_queue=[]
def resolve_model(model_path,seen=()):
 assert model_path not in seen,'Model cycle'
 model=json.loads(source(model_path));parent=model.get('parent','')
 if parent.startswith('maniacrev:'):
  p=RES+'models/'+parent.split(':',1)[1]+'.json';base=resolve_model(p,seen+(model_path,));base={**base,**model,'textures':{**base.get('textures',{}),**model.get('textures',{})}};return base
 return model
def image_asset(name,path,entity,kind='pixel-texture'):
 b=source(path);im=Image.open(ROOT/path).convert('RGBA');im.thumbnail((320,320),Image.Resampling.LANCZOS)
 dest=ART/(name+'.webp');im.save(dest,'WEBP',lossless=True,method=4)
 visual_records.append({'key':name,'local':dest.name,'entityId':entity,'kind':kind,'width':im.width,'height':im.height,'source':path,'sourceSha256':hashlib.sha256(b).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'transformation':'RGBA, preserve proportions, max 320 px, lossless WebP'})
 return name
def visual(r,entity):
 id=r['gameId'];key='system-'+slug(id)
 if id=='nightmare_lighter':return 'nightmare-lighter',[], 'Переиспользован существующий рендер открытой оригинальной модели.'
 mp=RES+'models/item/'+id+'.json'
 if mp not in TREE:return None,[], 'Модель с точным registry ID отсутствует. Текстурный атлас не показан как иконка.'
 model=resolve_model(mp);textures=model.get('textures',{})
 if model.get('parent','').endswith('item/generated') and 'layer0' in textures:
  tex=textures['layer0'];p=RES+'textures/'+tex.split(':')[-1]+'.png'
  return image_asset(key,p,entity),[mp,p],'Оригинальная плоская layer0-текстура модели.'
 if model.get('elements'):
  texture_data={};paths=[mp]
  for k,value in textures.items():
   if value.startswith('maniacrev:'):
    p=RES+'textures/'+value.split(':')[1]+'.png';b=source(p);paths.append(p);texture_data[k]='data:image/png;base64,'+base64.b64encode(b).decode()
   elif value.startswith('#'):texture_data[k]=value
  face_refs={f['texture'].lstrip('#') for element in model['elements'] for f in element.get('faces',{}).values()}
  if face_refs<=set(texture_data):
   dest=ART/(key+'.png');render_queue.append({'key':key,'entityId':entity,'model':model,'textures':texture_data,'output':str(dest).replace('\\','/'),'paths':paths})
   if dest.exists():
    im=Image.open(dest);visual_records.append({'key':key,'local':dest.name,'entityId':entity,'kind':'item-render','width':im.width,'height':im.height,'source':mp,'sourceSha256':used[mp]['sha256'],'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'transformation':'Minecraft JSON parent/textures/elements/rotation/GUI display, static orthographic render'})
   return key,paths,'Статичный рендер оригинальных cuboid elements с GUI transform.'
 return None,[mp],'Сложный/custom renderer: корректный автоматический рендер не подтверждён. Показано текстовое представление, а не атлас.'
items=[];audit=[];articles={}
for r in registrations:
 gid=r['gameId'];name=lang.get('item.maniacrev.'+gid,lang.get('block.maniacrev.'+gid,{'generator':'Генератор Фредди','soul_essence':'Материал ремонта брони'}.get(gid,gid)))
 paths=[JAVA+'ModItems.java',RES+'lang/ru_ru.json']
 if r['class'] in classes:paths.append(classes[r['class']])
 if gid in excluded:
  audit.append({**r,'name':name,'category':'interface','purpose':excluded[gid],'publish':False,'reason':excluded[gid],'evidence':evidence(paths)});continue
 cat,summary,usage,owner,mechanic=specs[gid];id='item:'+slug(gid)
 owner={'freddy':'freddy-bear','medic':'doctor','agent47':'agent'}.get(owner,owner)
 owner_ids=[owner_by_slug[owner]['id']] if owner else []
 paths.extend(JAVA+p for p in extra_sources.get(gid,[]) if JAVA+p in TREE)
 if '_fragment' in gid:paths.append(JAVA+'brewing/ModBrewingRecipes.java')
 if gid.startswith('coin_'):paths.append(JAVA+'dodepovich/DodepovichCasinoManager.java')
 if gid.endswith('_color_card'):paths.append(JAVA+'colorroulette/ColorRouletteManager.java')
 if owner:paths.append(owner_by_slug[owner]['classPath'])
 icon,vpaths,vnote=visual(r,id);paths+=vpaths
 related=ability_by_item.get(id,[])+(['mechanic:'+mechanic] if mechanic else [])+(['perk:'+perk_links[gid]] if gid in perk_links else [])
 if gid.endswith('_color_card'):related[-1]='perk:color-roulette'
 if gid=='guardian_head' and 'ability:concentrated-nightmare' not in related:related.append('ability:concentrated-nightmare')
 ev=evidence(paths)
 row={'id':id,'slug':slug(gid),'name':old_ids.get(id,{}).get('name',name),'registryIds':['maniacrev:'+gid],'category':cat,'description':summary,'usage':'Применение и ограничения приведены в статье предмета.','characterIds':owner_ids,'relatedIds':related,'stats':[dict(zip(['key','label','value','unit'],s)) for s in known_stats.get(gid,[])],'evidence':ev}
 if icon:row['icon']=icon
 obtain='Предмет зарегистрирован в моде. Привязка к классу подтверждает назначение; универсальная стартовая выдача не заявляется.'
 if owner:obtain='Связан с персонажем '+owner_by_slug[owner]['name']+'. Настоящее наличие в инвентаре зависит от выдачи и правил конкретного матча; одно превью не является гарантией.'
 if gid in perk_links:obtain='Создаётся или выдаётся логикой связанного перка; применяются его фазовые ограничения и условия.'
 if gid=='awakening_needle':obtain='GameManager выдаёт иглы случайной трети активных выживших (с округлением вверх), только при активном Хранителе.'
 article={'id':id,'description':summary,'sections':[{'title':'Получение и доступность','paragraphs':[obtain]},{'title':'Как использовать','paragraphs':[usage]}],'notes':[vnote],'evidence':ev}
 items.append(row);articles[id]=article
 audit.append({**r,'name':name,'category':cat,'purpose':summary,'publish':True,'entityId':id,'reason':'Подтверждённый игровой ресурс с действующим использованием или специализированной ролью.','visual':vnote,'evidence':ev})
# Preserve stable pre-existing group/vanilla IDs, without pretending they are ModItems registrations.
for entry in old:
 if any(row['id']==entry['id'] for row in items):continue
 id=entry['id'];d=entry['revisions']['source:8692f66']['data'];owner_ids=[owner_by_game[g]['id'] for g,rels in owners.items() if id in rels['itemIds']]
 cat='armor' if 'armor' in entry['slug'] else 'weapon' if entry['slug'] in ['agent-pistol','agent-knife'] else 'resource' if entry['slug'] in ['alchemy-kit','dodepovich-coins'] else 'tool'
 related=[]
 if entry['slug']=='dodepovich-coins':related=['mechanic:casino']+['item:coin-'+k for k in coin_effects]
 if entry['slug'] in ['alchemy-kit','brewing-stand']:related=['mechanic:alchemy']
 notes=['Сохранённая составная запись экипировки или ванильный предмет из справочника персонажа; не отдельная регистрация ModItems.']
 if entry['slug']=='agent-pistol':notes.append('Описание класса говорит о пистолете, но превью показывает IRON_SWORD. Модель пистолета и гарантированная выдача не подтверждены; вымышленная иконка не используется.')
 ev=entry['revisions']['source:8692f66']['evidence'];evidence([e['path'] for e in ev])
 items.append({'id':id,'slug':entry['slug'],'name':entry['name'],'registryIds':[],'category':cat,'description':d['description'],'usage':'Состав и назначение описаны в справочнике связанного персонажа. Проверяйте выданный инвентарь: элементы превью не гарантируют стартовую выдачу.','characterIds':owner_ids,'relatedIds':related,'stats':d.get('stats',[]),'evidence':ev})
 articles[id]={'id':id,'description':d['description'],'sections':[{'title':'Назначение и доступность','paragraphs':[notes[0],'Связь с персонажем отражает его справочник. Стартовое количество и параметры, не подтверждённые выдачей, не заявляются.']}],'notes':notes[1:],'evidence':ev}
assert set(old_ids)<=set(r['id'] for r in items)
computer_id='item:computer'
computer_icon,computer_paths,computer_note=visual({'gameId':'computer'},computer_id)
computer_evidence=evidence([JAVA+'hack/ModHackRegistry.java',JAVA+'hack/ComputerBlock.java',JAVA+'hack/HackConfig.java']+computer_paths)
items.append({'id':computer_id,'slug':'computer','name':'Компьютер','registryIds':['maniacrev:computer'],'category':'block','description':'Предмет-блок основной задачи выживших: установленный компьютер можно взламывать.','usage':'Взлом и его ограничения описаны в отдельной механике.','characterIds':[],'relatedIds':['mechanic:hacking','mechanic:qte','item:sber-sprout','item:blue-color-card'],'stats':[],'evidence':computer_evidence,**({'icon':computer_icon} if computer_icon else {})})
articles[computer_id]={'id':computer_id,'description':items[-1]['description'],'sections':[{'title':'Получение и доступность','paragraphs':['Предмет зарегистрирован отдельно в ModHackRegistry как BlockItem. Компьютеры основной задачи размещаются на карте; это не доказательство выдачи блока в стартовый инвентарь выжившего.']},{'title':'Как использовать','paragraphs':['Взаимодействуйте с подходящим незавершённым компьютером на карте и оставайтесь в зоне сессии. Помощники, QTE и специальные предметы меняют прогресс по серверным правилам. Само наличие предмета-блока не гарантирует, что произвольно установленный объект включён в цели карты.']}],'notes':[computer_note,'Регистрация находится вне ModItems, поэтому не добавлена как 67-я строка его аудита.'],'evidence':computer_evidence}
write('docs/maniac-3c-items-audit.json',{'commit':COMMIT,'registrations':audit,'registrationCount':len(registrations),'publishedRegistrationCount':sum(r['publish'] for r in audit),'publishedEntityCount':len(items),'additionalRegistrations':[{'gameId':'computer','entityId':computer_id,'registry':'ModHackRegistry','evidence':computer_evidence}],'notes':['Preview is not proof of starting loadout.','Existing aggregate/vanilla entities retained under original IDs.']})
table=['# Аудит ModItems — этап 3C-1','',f'Commit: `{COMMIT}`. Все {len(registrations)} регистраций; не список всех PNG или Java-классов.','', '| Registry ID | Название | Категория | Назначение | Решение | Обоснование | Источники |','| --- | --- | --- | --- | --- | --- | --- |']
for record in audit:
 links=', '.join('['+pathlib.PurePosixPath(e['path']).name+'](https://github.com/doflare123/Maniac-mod-evolution/blob/'+COMMIT+'/'+e['path']+')' for e in record['evidence'] if '/models/' not in e['path'] and '/textures/' not in e['path'])
 values=['`maniacrev:'+record['gameId']+'`',record['name'],record['category'],record['purpose'],'Опубликован: `'+record.get('entityId','')+'`' if record['publish'] else 'Исключён',record['reason'],links]
 table.append('| '+' | '.join(v.replace('|','/').replace('\n',' ') for v in values)+' |')
table+=['','Дополнительная регистрация вне ModItems: `maniacrev:computer` в `hack/ModHackRegistry.java` — опубликован `item:computer` как игровой предмет-блок основной задачи. ModBlocks дополнительно проверен: generator и slot_machine уже учтены; salt_block и nightmare_cocoon не имеют самостоятельной регистрации предмета в этом реестре и объясняются в механиках.']
pathlib.Path('docs/MANIAC_3C_ITEM_REGISTRY.md').write_text('\n'.join(table)+'\n',encoding='utf-8')
write(DATA/'item-catalog.json',items)
for id,article in articles.items():write(DATA/'item-articles'/(id.split(':')[1]+'.json'),article)
write('../.audit/maniac-3c-render-queue.json',render_queue)
write(ART/'imports.json',{'commit':COMMIT,'files':visual_records})

# Mechanic articles are reviewed explanations of the live handlers and guide.
# No values are inferred from empty GamePhase/GameTimer or absent datapacks.
mechanics=[];mechanic_articles={};illustrations=[]
def mechanic(slug,name,category,summary,paths,steps,outcome,limits,related=(),pictures=(),notes=(),stats=()):
 id='mechanic:'+slug
 ev=evidence([JAVA+p for p in paths]+[RES+'lang/ru_ru.json'])
 mechanics.append({'id':id,'slug':slug,'name':name,'category':category,'description':summary,'relatedIds':list(related),'stats':[dict(zip(['key','label','value','unit'],s)) for s in stats],'evidence':ev})
 images=[]
 for filename,caption in pictures:
  path=RES+'textures/gui/'+filename;key='guide-'+slug+'-'+str(len(images));b=source(path)
  im=Image.open(ROOT/path).convert('RGBA');im.thumbnail((1120,800),Image.Resampling.LANCZOS);dest=ART/(key+'.webp');im.save(dest,'WEBP',quality=88,method=6)
  images.append({'file':dest.name,'width':im.width,'height':im.height,'caption':caption})
  illustrations.append({'source':path,'sourceSha256':hashlib.sha256(b).hexdigest(),'local':dest.name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'width':im.width,'height':im.height,'transformation':'Original guide image, preserve aspect, max 1120×800, WebP quality 88'})
 mechanic_articles[id]={'id':id,'description':summary,'sections':[{'title':'Как это работает','paragraphs':steps},{'title':'Результат и влияние на матч','paragraphs':outcome},{'title':'Условия и ограничения','paragraphs':limits}],'images':images,'notes':list(notes),'evidence':ev}
mechanic('match-preparation','Подготовка и начало матча','match','Готовность игроков, применение настроек и запуск раунда — отдельные шаги.',
 ['pregame/PreGameReadyManager.java','pregame/PreGameCountdownTask.java','game/GameManager.java','gui/pages/TutorialPage.java'],
 ['Выберите сторону и персонажа, согласуйте карту и параметры матча. Переключатель готовности сообщает о готовности организатору.','PreGameCountdownTask вызывает функцию старта датапака. GameManager.startGame сбрасывает нокдаун, применяет настройки, выставляет фазу 1, запускает таймер и уведомляет систему перков.'],
 ['Новый раунд получает длительность из сохранённых GameSettings. Старт также запускает распределение игл при активном Хранителе.'],
 ['Выдача предметов из превью не является доказательством реального содержимого стартового инвентаря.','Функция maniac:game/start_game относится к внешнему датапаку: её полный текст отсутствует в закреплённом репозитории.'],['mechanic:match-phases','mechanic:match-timer','item:awakening-needle'])
mechanic('match-phases','Фазы матча','match','Фаза определяет доступность перков и изменение правил охоты.',
 ['game/GameManager.java','perk/PerkPhase.java','perk/Perk.java','hack/HackConfig.java'],
 ['Значение 0 — матч не активен. HUNT соответствует scoreboard 1, MIDGAME — 2, REVERSAL — 3. START — отдельное событие начала для перков, а не дополнительный номер фазы.','На половине настроенного времени GameManager переводит HUNT в MIDGAME. Завершение необходимого числа компьютеров запускает WIN_COMMANDS и команду фазы 3.'],
 ['В REVERSAL выжившие могут получить возможность дать отпор; мод выполняет снятие перечисленных защитных эффектов и подсветку мест оружия через команды.','У каждого перка остаются собственные фазовые ограничения. ANY исключает состояние вне матча.'],
 ['Переход в фазу 2 разрешён только из фазы 1.','Подписи фаз в учебнике упрощены; для проверки чисел использованы PerkPhase и GameManager. GamePhase.java и GameTimer.java пусты.'],['mechanic:hacking','mechanic:match-timer'])
mechanic('match-timer','Таймер раунда','match','Обратный отсчёт синхронизируется с клиентом и управляет некоторыми переходами.',
 ['game/GameManager.java','settings/GameSettings.java'],
 ['При начале нового раунда берётся gameTime из настроек и переводится из минут в тики. Каждый серверный END tick уменьшает оставшееся время на один.','На половине максимума при фазе 1 запускается MIDGAME. Таймер можно остановить или продолжить; новый раунд отдельно начинает отсчёт из настроенного максимума.'],
 ['При достижении нуля отсчёт останавливается и вызывается maniac:game/time_end. Состояние рассылается клиентам раз в секунду.'],
 ['Инициализация 10 минут в GameManager не является обязательной длительностью всех матчей.','Итоговое правило победы в time_end не восстановлено: внешний датапак отсутствует.'],['mechanic:match-phases','mechanic:objectives-and-escape'])
mechanic('objectives-and-escape','Цели, побег и завершение','match','Выжившие выполняют компьютеры, а окончательные условия завершения зависят и от карты.',
 ['hack/HackConfig.java','hack/HackManager.java','game/GameManager.java','gui/pages/TutorialPage.java'],
 ['Счётчик законченных компьютеров сравнивается с настраиваемым порогом HackConfig.COMPUTERS_NEEDED_FOR_WIN. После достижения порога выполняются WIN_COMMANDS, включая выдачу карты доступа SecurityCraft и перевод в фазу 3.','Следуйте целям и доступным маршрутам карты. Тайные проходы не являются универсальной точкой победы.'],
 ['Завершение взломов открывает следующий этап противостояния. Истечение таймера вызывает функцию внешнего датапака.'],
 ['В этом снимке нет полного набора функций maniac:game и карт: нельзя честно описать универсальные координаты выхода или объявить каждый взлом немедленной победой.','Прогресс компьютеров и таймер — разные условия; правила конкретной публичной ZIP-сборки отдельно не проверены.'],['mechanic:hacking','mechanic:map-interactions','mechanic:match-timer'])
mechanic('hacking','Компьютеры и взлом','core','Взлом складывается из работы участников, проверок реакции и специальных модификаторов.',
 ['hack/ComputerBlock.java','hack/HackManager.java','hack/HackSession.java','hack/HackConfig.java','sbersprout/SberSproutManager.java'],
 ['Начните взаимодействие с подходящим незавершённым компьютером и оставайтесь рядом. Сессия проверяет жизнь, подключение и расстояние основного взломщика.','Помощники учитываются в отдельном радиусе. Их вклад и бонусы перков рассчитываются сервером, а QTE получают участники сессии.'],
 ['Накопление требуемого прогресса завершает компьютер и увеличивает общий счётчик. СберРосток и Цветная рулетка могут менять прогресс через отдельные обработчики.'],
 ['По исходным defaults требуется 10 очков на компьютер; базовый вклад обычного игрока — 0,1 в секунду, специалиста — 0,11. Радиусы: 1,3 блока для основного взломщика, 3 для помощников.','Это изменяемые настройки и базовые вклады, а не гарантированное время взлома с перками и QTE.'],['mechanic:qte','mechanic:match-phases','item:sber-sprout','item:blue-color-card'],[('guide/maps/active_computer.png','Активный компьютер во внутриигровом руководстве.')])
mechanic('qte','Проверки реакции','core','Во время взлома нужно вовремя подтвердить попадание индикатора в целевую область.',
 ['hack/HackSession.java','hack/HackManager.java','hack/HackConfig.java','gui/pages/TutorialPage.java'],
 ['Начните взлом и следите за индикатором. Сессия назначает проверки, а клиент отображает окно реакции.','Нажмите назначенную клавишу в нужный момент. Успешное попадание и критическая зона различаются; перки могут менять размер и поведение окна.'],
 ['Базовый успешный результат добавляет 0,4 очка, критический — 0,6. Результат обрабатывается серверной сессией, а не только анимацией HUD.'],
 ['Интервал по HackConfig — от 3 до 5 секунд. Итоговая частота и окно могут быть изменены эффектами.','Не путайте компьютерный QTE с отдельной проверкой Иглы пробуждения у кокона.'],['mechanic:hacking','perk:quick-reflexes','perk:reality-anchor','item:awakening-needle'],[('guide/mechanics/qte.png','Оригинальная иллюстрация проверки реакции.')])
mechanic('downed','Нокдаун и подъём','match','Нокдаун даёт шанс на помощь вместо немедленного окончательного выбывания.',
 ['downed/DownedData.java','downed/DownedEventHandler.java','gui/pages/TutorialPage.java'],
 ['При подходящем смертельном уроне сервер проверяет условия перехода в нокдаун. Это не гарантированный исход каждого смертельного попадания.','Союзник подходит к лежащему игроку и удерживает помощь. Сервер проверяет помощника и дистанцию; выход за допустимые условия прерывает подъём.'],
 ['Базовый подъём союзником — 6 с, Доктором — 3 с. Нокдаун имеет предельное время 60 с. Самоподъём учитывается отдельной логикой и стоимостью.'],
 ['Режим игры, состояние последнего выжившего и специальные причины урона учитываются обработчиком.','Внутренний REVIVE_HOLD_TICKS=5 с не подменяет значения NORMAL_REVIVE_TICKS и MEDIC_REVIVE_TICKS.'],['character:doctor','item:bandages','mechanic:medical-care'],[('guide/mechanics/downed.png','Нокдаун в руководстве игры.')])
mechanic('map-interactions','Двери, люки и вентиляция','core','Особые проходы карты меняют маршрут погони.',
 ['gui/pages/TutorialPage.java'],
 ['В руководстве особняк содержит тайные двери, замаскированные под стену, и скрытые люки между этажами. Ищите предусмотренные самой картой взаимодействия.','Вентиляция показана как особенность пиццерии. Используйте открывшиеся маршруты, чтобы сменить позицию.'],
 ['Проходы позволяют обойти преследование и менять этажи. Это особенности конкретных карт, а не отдельный универсальный инвентарный предмет.'],
 ['Полная реализация карт и их функций в этом репозитории отсутствует. Единая клавиша открытия, скорость прохода и обязательный набор вентиляции не подтверждены.','Публичный каталог карт остаётся следующим этапом.'],['mechanic:objectives-and-escape'],[('guide/mechanics/open_door.png','Открытая тайная дверь из руководства.'),('guide/mechanics/open_hatch.png','Открытый люк из руководства.'),('guide/mechanics/ventilation.png','Вентиляция пиццерии из руководства.')])
mechanic('mana','Мана','resource','Общий ресурс для активируемых перков и способностей с индивидуальными затратами.',
 ['mana/ManaData.java','event/ManaEvents.java','perk/Perk.java','effect/ManaFlowEffect.java'],
 ['Проверяйте запас перед применением. consumeMana выполняет действие только при достаточном количестве; setMana ограничивает запас от нуля до максимума.','Восстановление складывается из бонусной скорости и включённой базовой регенерации. Персонажи, эффекты и правила могут менять эти величины.'],
 ['Стоимость списывается логикой конкретного предмета или перка. Бонусная регенерация учитывается независимо от переключателя пассивной базовой регенерации.'],
 ['Конструктор ManaData по умолчанию задаёт максимум 100 и базовую регенерацию 0. Комментарий «1 ед/сек» противоречит коду; он не принят за правило всех персонажей.','Отсутствующая характеристика стоимости не означает подтверждённый ноль.'],['item:clarity','mechanic:status-effects'])
mechanic('sanity','Рассудок','resource','Хранитель снижает рассудок взглядом; срыв открывает путь в кошмарное испытание.',
 ['nightmare/NightmareConfig.java','nightmare/NightmareManager.java','character/maniac/KeeperOfNightmaresClass.java'],
 ['Избегайте направленного взгляда Хранителя. Менеджер проверяет подходящую цель и условия взгляда; базовая дальность — 40 блоков.','После прекращения давления восстановление начинается с задержкой. Концентрированный кошмар отдельно снимает долю максимального рассудка.'],
 ['При достижении порога срыва менеджер проверяет возможность похищения. После испытания есть защита от немедленного повторного похищения.'],
 ['NightmareConfig: максимум 100, breakpoint 0; потеря от взгляда — 1,55 за тик, задержка восстановления — 320 тиков (16 с), восстановление — 0,11 за тик.','Скорость за тик не следует безоговорочно превращать во время до срыва: действуют иммунитет, условия взгляда и эффекты.'],['character:keeper-of-nightmares','ability:abyss-gaze','ability:concentrated-nightmare','mechanic:nightmare-trials','perk:reality-anchor'])
mechanic('nightmare-trials','Кошмарные испытания','character-system','Похищенный выживший проходит отдельное испытание, пока союзники могут помочь через кокон.',
 ['nightmare/NightmareConfig.java','nightmare/NightmareManager.java','nightmare/NightmareTrialBuilder.java','character/maniac/KeeperOfNightmaresClass.java'],
 ['Срыв рассудка запускает проверку похищения. NightmareManager использует FORCED_MAZE_COUNT: первые два испытания цели принудительно являются лабиринтами; затем включается выбор других типов.','В лабиринте найдите выход, на арене переживите бой, в гонке уходите от преследователя. Союзники во внешнем мире могут взаимодействовать с коконом и Иглой пробуждения.'],
 ['Лабиринт рассчитан на 30 с; истечение времени наносит 6 HP. Арена — 45 с; гонка — 30 с, её поимка или таймаут наносят 6 HP.','После возвращения сервер восстанавливает внешнее состояние и включает защиту от нового похищения. Успех отдельного испытания не равен победе во всём матче.'],
 ['FORCED_MAZE_COUNT=2 в конфиге и действующем выборе; описание персонажа и историческая хроника говорят о трёх. История не исправлялась.','Кокон требует четыре засчитываемых удара по NightmareConfig; игольная мини-игра имеет собственные точность и урон. Не каждое нажатие гарантирует разрушение кокона.'],['mechanic:sanity','character:keeper-of-nightmares','item:nightmare-lighter','item:awakening-needle','perk:reality-anchor'],[('guide/mechanics/characters/nightmare/area.png','Оригинальная иллюстрация пространства кошмарного испытания.')],['Расхождение числа начальных лабиринтов разрешено по NightmareManager и NightmareConfig; публичный ZIP не объявлен идентичным.'])
mechanic('flower-return','Возврат к цветку','perk-system','Незабудка создаёт личную точку, к которой можно вернуться после подготовки.',
 ['perk/perks/survivor/ForgetMeNotPerk.java','forgetmenot/ForgetMeNotManager.java','item/ForgetMeNotItem.java'],
 ['Установите личный цветок на подходящей поверхности. Сохранённая точка принадлежит владельцу и используется связанным перком.','Активируйте возврат и завершите подготовку. Движение и урон могут прервать процесс, а маньяк может уничтожить цветок.'],
 ['Успешное завершение переносит игрока к своей точке. Для успешного и прерванного применения действуют разные ограничения.'],
 ['Смотрите параметры source-снимка в статье перка. Хроника Flower Cleaning сохраняет исторические значения отдельно.'],['perk:forget-me-not','item:forget-me-not'])
mechanic('addiction','Зависимость и передозировка','character-system','Мефедронщик управляет растущей зависимостью, шприцами и дымом.',
 ['capability/AddictionCapability.java','event/AddictionEventHandler.java','item/SyringeItem.java','entity/BongCloudEntity.java'],
 ['Шкала растёт каждый серверный тик; после использованных шприцев базовая скорость умножается на 1 + 0,03 × число шприцев. Дым может приостановить рост.','Шприц снижает текущую зависимость на 70%, но его ускорение становится короче и слабее с применениями. Эффект скорости добавляется к уже действующему времени.'],
 ['Стадии начинаются при 25%, 50% и 75%. В опасной стадии при не менее трёх шприцах система проверяет шанс смерти 1% каждую секунду.','SyringeItem отдельно задаёт OVERDOSE_SYRINGES=4 для последовательных применений в окне 400 тиков (20 с). Это правило исходного снимка.'],
 ['Историческая хроника указывает другие условия передозировки и вероятности; эти данные не заменены новым кодом.','Итоговая скорость и риск условны: стадия, история применений, паузы и условия серверного обработчика имеют значение.'],['character:mefedronshchik','item:adrenaline-syringe','item:bong'],[('guide/mechanics/characters/addiction.png','Шкала зависимости из игрового руководства.')],['Хроника 1.0: три шприца и 10%/с; pinned code: отдельный порог 4 и STAGE3_DEATH_CHANCE=0.01 при соблюдении условий.'])
mechanic('casino','Монетки и казино','character-system','Додепович рискует случайным исходом монетки или результатом игрового автомата.',
 ['dodepovich/DodepovichCasinoManager.java','dodepovich/DodepovichCoin.java','dodepovich/SlotMachineResult.java','item/DodepovichCoinItem.java','block/SlotMachineBlock.java'],
 ['Обычная монетка разыгрывает хороший или плохой эффект. В автомате бросок имеет отдельную таблицу результатов: отсутствие выигрыша, эффекты монетки, ресурсы, страховка, кредит, джекпот и смерть.','Неуловимость: невидимость со скоростью либо перенос к маньяку с замедлением. Прозрение: подсветка маньяка только вам либо ваша общая подсветка. Оковы: обездвиживание ближайшего маньяка либо себя.','ЗОЖ: лечение либо урон. Орёл: слепота ближайшего маньяка либо себя. Долг: блокировка следующего урона либо его удвоение. Судьба: возврат выживших-наблюдателей к маньяку либо урон союзникам и смерть пользователя. Реролл имеет собственную ветку повторного выбора.'],
 ['Результат выбирается сервером; автомат применяет его после задержки анимации. Доступность целей проверяется отдельно, поэтому положительный исход без подходящей цели не гарантирует эффект.'],
 ['Обычный бросок и таблица автомата — разные случайные процессы. У таблицы автомата нельзя объявлять каждому исходу шанс 50/50.'],['character:dodepovich','item:dodepovich-coins','item:slot-machine']+['item:coin-'+k for k in coin_effects])
mechanic('alchemy','Алхимия и рецепты','character-system','Ингредиенты Алхимика превращают зелья через зарегистрированные рецепты варки.',
 ['brewing/ModBrewingRecipes.java','potion/ModPotions.java','character/survivor/AlchemistClass.java','item/RecipeBookItem.java'],
 ['Используйте зельеварку и основу AWKWARD. Выберите один из зарегистрированных специальных ингредиентов и сверяйтесь с книгой рецептов.','Каждый рецепт задаёт входной тип бутылки и выходное зелье. Некоторые входы POTION превращаются в SPLASH_POTION, поэтому форма результата проверяется по рецепту.'],
 ['В реестре есть регенерация, сила, скорость, замедление, плавное падение, слабость, лечение, слепота и свечение.'],
 ['Набор алхимика — составная запись справочника, а не отдельный предмет ModItems. Получение случайных ингредиентов не означает гарантированное наличие каждого из них.'],['character:alchemist','item:alchemy-kit','item:brewing-stand','item:recipe-book'],[('guide/mechanics/alch.png','Оригинальная иллюстрация алхимии из руководства.')])
mechanic('resurrection','Воскрешение Некроманта','character-system','Завершённый ритуал посоха открывает выбор подходящей погибшей души.',
 ['item/NecromancerStaffItem.java','network/packets/ResurrectPlayerPacket.java'],
 ['Некромант удерживает посох 100 тиков при достаточной мане. Завершение сначала списывает 60 маны и 30 прочности и открывает интерфейс выбора.','Выберите доступного погибшего союзника. Серверный обработчик отдельно проверяет условия воскрешения и состояние выбранного игрока.'],
 ['Это возвращение игрока в матч по правилам Некроманта. Простое открытие списка не доказывает, что выбранная душа уже воскрешена.'],
 ['Прерывание каста расходует 10 прочности. Максимальная прочность посоха — 90.','Получение посоха, допустимая душа и её состояние должны быть проверены в конкретном матче.'],['character:necromancer','item:dead-staff','item:soul-essence'])
mechanic('plague','Чума','character-system','Чумной доктор заражает цели через систему чумы, ауру и сгусток.',
 ['capability/PlagueCapability.java','event/PlagueLanternEventHandler.java','entity/PlagueOrbEntity.java','item/PlagueLanternItem.java'],
 ['Избегайте давления лампы и попаданий сгустка. PlagueCapability хранит заражение, а серверный обработчик обновляет его и связанные состояния.','Активный бросок сгустка и пассивное заражение — разные действия одного набора.'],
 ['Накопление заражения влияет на состояние выжившего. Дальность и стоимость сгустка относятся к предметной способности, а не ко всем источникам чумы.'],
 ['Не выводится одно постоянное время заражения: оно зависит от состояния, источника и условий обработчика.'],['character:plague-doctor','item:plague-lantern','ability:plague-orb'],[('guide/mechanics/characters/plague.png','Система чумы во внутриигровом руководстве.')])
mechanic('ghost-states','Невидимость и одержимость','character-system','Призрак чередует скрытие себя с управлением движением чужого тела.',
 ['ghost/GhostStealthManager.java','ghost/GhostPossessionManager.java','ghost/GhostLoadoutManager.java'],
 ['Игрушечный нож переключает завесу; менеджер сохраняет и скрывает подходящие элементы экипировки.','Призрачная рука запускает одержимость подходящей целью. Движение, выход и возврат состояния контролируются отдельным менеджером.'],
 ['Полная невидимость и одержимость не являются простым обычным эффектом INVISIBILITY. После выхода из завесы есть запрет атаки.'],
 ['При завершении режима предметы и состояние возвращаются по серверным правилам. Отдельные способности имеют собственные стоимость и cooldown.'],['character:ghost','item:toy-knife','item:ghost-hand','item:ghost-armor','ability:ghost-possession','ability:phantom-veil'])
mechanic('medical-care','Лечение и медицинские устройства','character-system','Доктор сочетает расходуемое лечение, информацию планшета и разделение урона маской.',
 ['item/BandageItem.java','item/MedicTabletItem.java','event/MedicActiveAbility.java','config/MedicSystemConfig.java'],
 ['Бинт используется удержанием: можно лечить себя или выбранного игрока вблизи.','Планшет показывает здоровье выжившего под прицелом или открывает медицинский интерфейс. Маска активирует отдельное временное разделение урона с ближайшим союзником.'],
 ['Лечение, информационная функция и перенос части урона — разные действия. Они не объединены в выдуманную универсальную способность.'],
 ['Входящий урон перенаправляется только при действующей маске и подходящем союзнике; подробные параметры подтверждены в статье способности.'],['character:doctor','item:bandages','item:medical-tablet','item:medical-mask','ability:damage-transfer','mechanic:downed'],[('guide/mechanics/characters/medic_interface.png','Медицинский интерфейс из руководства.')])
mechanic('shaman-spirits','Тотемы и души предков','character-system','Шаман использует размещённый тотем для информации и души предков для лечения.',
 ['item/TotemSpawnItem.java','item/AncestorSoulItem.java','character/survivor/ShamanClass.java'],
 ['Разместите тотем на подходящей позиции. Его игровая роль — находить и подсвечивать подходящих маньяков.','Используйте душу предков для лечения. Формула учитывает погибших выживших-наблюдателей, поэтому ценность меняется по ходу матча.'],
 ['Тотем даёт информацию команде, а расходник восстанавливает здоровье по вычисляемой формуле.'],
 ['Наличие записи в наборе Шамана не гарантирует конкретное стартовое количество.'],['character:shaman','item:ancestral-totem','item:ancestor-soul'])
mechanic('paint','Лужи краски','perk-system','Банка связанного перка создаёт личные лужи с отдельными правилами действия.',
 ['paint/PaintPuddleManager.java','item/PaintCanItem.java','perk/perks/maniac/ThePaintThickensPerk.java'],
 ['Перк выдаёт личную банку. Примените её на допустимой поверхности; менеджер проверяет владельца и место размещения.','Пересечение лужи обрабатывается отдельно с учётом игровой стороны и состояния цели.'],
 ['Количество применений ограничено прочностью банки. Эффекты лужи принадлежат перку, а не любому предмету с похожей текстурой.'],
 ['Не передавайте личный предмет и не переносите характеристики исторической хроники в source-снимок без проверки.'],['item:paint-can','perk:the-paint-thickens'])
mechanic('orchid-illusion','Запись маршрута и иллюзия','perk-system','Орхидея записывает движение владельца и воспроизводит его иллюзией.',
 ['pinkorchid/PinkOrchidManager.java','pinkorchid/PinkOrchidRouteFrame.java','entity/PinkOrchidIllusionEntity.java','item/PinkOrchidItem.java'],
 ['ПКМ орхидеей начинает или завершает запись. Записываются кадры маршрута и визуальное состояние персонажа.','Система воспроизводит кадры с помощью PinkOrchidIllusionEntity; экипировка иллюзии берётся из снимка.'],
 ['Иллюзия отвлекает преследователя движением записанного персонажа; она не является новым живым союзником.'],
 ['Доступность записи зависит от владельца предмета, перка и текущего состояния менеджера.'],['item:pink-orchid','perk:pink-orchid'])
mechanic('color-roulette','Цветная рулетка','perk-system','Перк выдаёт временную цветную карту с действием, зависящим от стороны.',
 ['colorroulette/ColorRouletteManager.java','colorroulette/ColorCard.java','item/ColorCardItem.java'],
 ['Получите результат рулетки и используйте карту до истечения её времени. Карта хранит владельца и оставшееся время.','Красная карта связана с отбрасыванием или обнаружением компьютеров, синяя — с прогрессом компьютера, зелёная — с лечением или дополнительным уроном.'],
 ['Сервер выбирает подходящий вариант по стороне пользователя и проверяет цель действия. Синяя карта требует незавершённый компьютер.'],
 ['Личную карту нельзя выбросить и передать. Время и результат не являются постоянной характеристикой всех других цветочных предметов.'],['perk:color-roulette','item:red-color-card','item:blue-color-card','item:green-color-card','mechanic:hacking'])
mechanic('freddy-generator','Фредди и генератор','character-system','Генератор — отдельный игровой блок, связанный с ресурсами Фредди.',
 ['block/FNAFGeneratorBlock.java','block/entity/FNAFGeneratorBlockEntity.java','character/maniac/FreddyBearClass.java'],
 ['Найдите или установите предусмотренный генератор. Взаимодействие с его блоком и сохранёнными данными выполняется на сервере.','Фредди также использует микрофон и музыкальную волну; их стоимость и оглушение описаны в отдельной способности.'],
 ['Генератор и музыкальная способность составляют разные части набора персонажа.'],
 ['Точное наличие генераторов на карте и стартовая выдача блока не следуют из одного превью.'],['character:freddy-bear','item:generator','item:microphone','ability:musical-wave'],[('guide/mechanics/characters/generator_fnaf.png','Генератор Фредди в руководстве.')])
mechanic('traps','Соль и размещаемые ловушки','core','Размещение и наступание на соль обрабатываются разными частями системы.',
 ['item/SaltItem.java','block/SaltBlock.java','util/SaltTracker.java'],
 ['Выберите свободную позицию над прочным основанием и разместите соль. Успех расходует предмет вне creative.','SaltTracker сохраняет позицию; взаимодействие сущности с блоком запускает проверку действия ловушки.'],
 ['Соль служит контролю движения и ограничению наступившей цели, а не прямой замене оружия.'],
 ['Ловушка требует правильной поверхности; нельзя объявлять её размещаемой в воздухе или на любом блоке.'],['character:necromancer','item:salt'])
mechanic('status-effects','Статусные эффекты и ограничения','resource','Состояния меняют ресурсы, передвижение и доступность действий.',
 ['effect/ModEffects.java','perk/Perk.java','roseglasses/RoseColoredGlassesManager.java','config/GameRulesConfig.java'],
 ['Различайте ванильные эффекты, специальные эффекты мода и отдельные состояния менеджеров. Скрытый HUD-значок не означает отсутствие серверного эффекта.','При активации сервер проверяет условия конкретного перка или предмета. Отключение выбрасывания предметов также может зависеть от GameRulesConfig.'],
 ['Контроль, молчание, страх и ограничения могут препятствовать действию независимо от оставшейся маны. Защитные предметы работают только по предусмотренным правилам.'],
 ['Не каждому эффекту создана отдельная статья: здесь объясняется общее правило, а точные длительности и исключения остаются в соответствующих сущностях.'],['mechanic:mana','item:rose-colored-glasses'])
mechanic('agent-shop','Магазин Агента 47','character-system','Персональный планшет открывает покупки, проверяемые сервером.',
 ['item/Agent47TabletItem.java','character/maniac/AgentClass.java'],
 ['Откройте планшет Агента и выберите доступный товар. Интерфейс отправляет запрос серверу, где выполняется логика магазина.'],
 ['Покупка отличается от стартовой выдачи и от визуального списка CharacterLoadoutPreview.'],
 ['Не объявляется гарантированный пистолет с определённым уроном: описание класса и превью оружия расходятся, а универсальная выдача не восстановлена.'],['character:agent','item:agent47-tablet','item:agent-pistol','item:agent-knife'],[('guide/mechanics/characters/agent_shop.png','Магазин Агента из руководства.')])
mechanic('ursa-stacks','Урса: атаки и ярость','character-system','Набор Урсы сочетает коготь, прыжок и расходуемый улей.',
 ['character/maniac/UrsaClass.java','item/BeastClawItem.java','item/BeehiveItem.java'],
 ['Используйте обычные атаки и следите за состоянием цели. Особенности накопления урона описаны в справочнике Урсы.','Коготь запускает прыжок, а поедание улья отдельно активирует ярость и выпуск пчёл.'],
 ['Урон приземления и бонусы ярости не объявлены постоянными параметрами каждого обычного удара.'],
 ['Число накопленных ударов и фактическое состояние игрока динамичны; выдуманная итоговая величина урона не приводится.'],['character:ursa','item:beast-claw','item:beehive-food','ability:beast-leap'],[('guide/mechanics/characters/stack_ursa.png','Состояние Урсы из руководства.')])

write(DATA/'mechanic-catalog.json',mechanics)
for id,article in mechanic_articles.items():write(DATA/'mechanic-articles'/(id.split(':')[1]+'.json'),article)
write('docs/maniac-3c-mechanics-audit.json',{'commit':COMMIT,'mechanics':[{'id':m['id'],'evidence':m['evidence'],'notes':mechanic_articles[m['id']]['notes']} for m in mechanics],'boundaries':['GamePhase.java and GameTimer.java are empty.','External maniac:game datapack functions absent; victory and full loadout not invented.','Map guide illustrations document map-specific interactions, not a public map catalog.']})
write(ART/'guide-imports.json',{'commit':COMMIT,'files':illustrations})
for kind,rows in [('item',items),('mechanic',mechanics)]:
 section='items' if kind=='item' else 'mechanics'
 target=DATA.parent/'pages'/section;target.mkdir(exist_ok=True)
 for entry in rows:
  art=articles[entry['id']] if kind=='item' else mechanic_articles[entry['id']]
  imports='';pictures='[]'
  if kind=='mechanic' and art['images']:
   imports=''.join(f'import image{i} from "../../../assets/wiki/systems/{image["file"]}";\n' for i,image in enumerate(art['images']))
   pictures='['+','.join('{...article.images['+str(i)+'],src:image'+str(i)+'}' for i in range(len(art['images'])))+']'
  (target/(entry['slug']+'.tsx')).write_text(f'import article from "../../data/{kind}-articles/{entry["slug"]}.json";\n{imports}import {{ SystemsArticlePage }} from "../SystemsArticlePage";\nexport default function Page() {{ return <SystemsArticlePage id="{entry["id"]}" article={{article}} pictures={{{pictures}}} />; }}\n',encoding='utf-8')
 (DATA.parent/(kind+'-route-metadata.ts')).write_text('export const '+kind+'RouteMeta = '+json.dumps([{k:v for k,v in row.items() if k in ['id','slug','name']} for row in rows],ensure_ascii=False,indent=2)+' as const;\n',encoding='utf-8')
asset_lines=[];asset_values=[]
for i,r in enumerate(visual_records):
 asset_lines.append(f'import image{i} from "../../assets/wiki/systems/{r["local"]}";')
 asset_values.append('"'+r['key']+'": {src:image'+str(i)+',width:'+str(r['width'])+',height:'+str(r['height'])+',kind:"'+r['kind']+'",entityId:"'+r['entityId']+'"}')
(DATA/'system-assets.ts').write_text('\n'.join(asset_lines)+'\nimport type { EntityAsset } from "./types";\nexport const systemAssets: Record<string, EntityAsset> = {'+','.join(asset_values)+'};\n',encoding='utf-8')
asset_manifest_path=ART.parent.parent/'imports.json'
asset_manifest=json.loads(asset_manifest_path.read_text())
asset_manifest['files']=[r for r in asset_manifest['files'] if not r['local'].startswith('wiki/systems/')]
for record in visual_records:
 asset_manifest['files'].append({'source':record['source'],'local':'wiki/systems/'+record['local'],'sourceSha256':record['sourceSha256'],'sha256':record['sha256'],'bytes':(ART/record['local']).stat().st_size,'size':[record['width'],record['height']],'entityId':record['entityId'],'transformation':record['transformation']})
write(asset_manifest_path,asset_manifest)
provenance=json.loads((DATA/'provenance.json').read_text());by_path={r['path']:r for r in provenance['files']};by_path.update(used);provenance['files']=list(by_path.values());write(DATA/'provenance.json',provenance)
print(json.dumps({'registrations':len(registrations),'excluded':len(excluded),'items':len(items),'mechanics':len(mechanics),'modelRenders':len(render_queue),'visuals':len(visual_records),'guideImages':len(illustrations)},ensure_ascii=False))
