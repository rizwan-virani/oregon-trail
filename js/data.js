/* ==========================================================
   Oregon Trail: Unbroken — CONTENT
   Classes, party names, the 13 legs, shop stock, event deck.
   ========================================================== */

const DATA = (() => {

  /* ---------------- Classes ---------------- */
  const CLASSES = [
    {
      id: 'trailblazer', name: 'Trailblazer', emoji: '🤠', money: 1600,
      perk: 'Deep pockets',
      desc: 'A banker from Boston with more money than sense. Buy your way out of trouble — but you earn the fewest points.',
      scoreMult: 1
    },
    {
      id: 'carpenter', name: 'Carpenter', emoji: '🔨', money: 900,
      perk: 'Wagon +25 HP · repairs cost half',
      desc: 'You built the wagon, so you know how to keep it together when the trail tries to shake it apart.',
      scoreMult: 2
    },
    {
      id: 'hunter', name: 'Hunter', emoji: '🎯', money: 700,
      perk: 'Faster fire · +50% meat',
      desc: 'You have never missed a shot you meant to make. Food will not be your problem. Everything else might be.',
      scoreMult: 3
    },
    {
      id: 'doc', name: 'Frontier Doc', emoji: '⚕️', money: 800,
      perk: 'Medicine 2× · less sickness',
      desc: 'You can set a bone by lantern light. Your people get sick less, and heal more when they do.',
      scoreMult: 2
    }
  ];

  /* ---------------- Names ---------------- */
  const FIRST_NAMES = ['Silas','Nora','Wyatt','Etta','Josiah','Clementine','Amos','Willa','Gus','Hattie',
    'Levi','Maud','Ezra','Ruby','Otis','June','Abel','Delia','Cyrus','Opal','Jonah','Birdie','Roscoe','Iva'];

  /* ---------------- The trail: 13 legs ---------------- */
  // challenge.kind: shooter | dodger | survival | repair | null
  const LEVELS = [
    {
      id: 1, from: 'Independence, Missouri', to: 'Kansas River Crossing',
      miles: 102, terrain: 'prairie',
      blurb: 'Green grass, easy grades, and every greenhorn in Missouri on the road with you. Enjoy it. It ends.',
      challenge: {
        kind: 'dodger', boss: false, title: 'THE KANSAS RIVER',
        intro: 'The Kansas runs muddy and fast. Ferrymen want $12 a wagon. You could also just… drive in.',
        instructions: 'Steer the wagon with ← → (or A / D). Miss the rocks and logs. Reach the far bank.',
        duration: 26, hazardRate: 0.9, speed: 2.4, skin: 'river', damage: 9
      }
    },
    {
      id: 2, from: 'Kansas River Crossing', to: 'Big Blue River',
      miles: 85, terrain: 'prairie',
      blurb: 'The prairie goes on so long it stops feeling like distance and starts feeling like weather.',
      challenge: {
        kind: 'dodger', boss: false, title: 'BUFFALO STAMPEDE',
        intro: 'A herd ten thousand strong turns and comes at you like brown thunder. There is no going around it.',
        instructions: 'Thread the wagon through the herd with ← →. Every hit rattles the wagon apart.',
        duration: 30, hazardRate: 1.5, speed: 3.0, skin: 'stampede', damage: 8
      }
    },
    {
      id: 3, from: 'Big Blue River', to: 'Fort Kearny',
      miles: 120, terrain: 'prairie',
      blurb: 'Word on the trail is a gang has been hitting wagons short of the fort. Word on the trail is usually right.',
      challenge: {
        kind: 'shooter', boss: true, title: 'BOSS · THE KEARNY GANG',
        intro: "Six riders fan out around your wagon. Their leader tips his hat. \"Just the food and the money, friend.\" You reach for the rifle instead.",
        instructions: 'Aim with the mouse. Click or SPACE to fire. R to reload. Drop every rider before they empty your wagon.',
        targets: 8, targetHp: 2, targetSpeed: 1.5, spawnEvery: 70, skin: 'bandit',
        bossHp: 10, timeLimit: 60, reward: { money: 220, ammo: 15 }
      }
    },
    {
      id: 4, from: 'Fort Kearny', to: 'Chimney Rock',
      miles: 250, terrain: 'plains',
      blurb: 'The longest leg yet. Chimney Rock stands on the horizon for three straight days before you reach it.',
      challenge: {
        kind: 'shooter', boss: false, title: 'THE GREAT HUNT',
        intro: 'Antelope, deer, and a few enormous buffalo graze the flats. Your larder is watching you.',
        instructions: 'Shoot game for meat. Big animals = more meat. Do NOT shoot the wolves — they cost you.',
        targets: 14, targetHp: 1, targetSpeed: 2.0, spawnEvery: 50, skin: 'hunt',
        timeLimit: 45, huntMode: true
      }
    },
    {
      id: 5, from: 'Chimney Rock', to: 'Fort Laramie',
      miles: 86, terrain: 'rock',
      blurb: 'Red rock and rattlesnakes. Something big has been following the wagon for two days now.',
      challenge: {
        kind: 'shooter', boss: true, title: 'BOSS · THE LARAMIE GRIZZLY',
        intro: 'It steps out of the pines at dusk — nine feet of muscle and old scars, and it is not afraid of you at all.',
        instructions: 'The bear charges in waves. Hit it while it comes. Reload (R) during the gaps or it reaches the wagon.',
        targets: 1, targetHp: 18, targetSpeed: 2.6, spawnEvery: 999, skin: 'grizzly',
        bossHp: 18, timeLimit: 70, reward: { money: 180, food: 250 }
      }
    },
    {
      id: 6, from: 'Fort Laramie', to: 'Independence Rock',
      miles: 190, terrain: 'rock',
      blurb: 'You need to reach the Rock by the Fourth of July. Later than that and the mountains close on you.',
      challenge: {
        kind: 'dodger', boss: false, title: 'DUST STORM',
        intro: 'The sky turns the color of a rusted nail. The wind picks up rocks and throws them.',
        instructions: 'Keep the wagon in the clear air with ← →. Boulders and tumbleweeds come fast and blind.',
        duration: 32, hazardRate: 1.7, speed: 3.4, skin: 'dust', damage: 7
      }
    },
    {
      id: 7, from: 'Independence Rock', to: 'South Pass',
      miles: 102, terrain: 'mountain',
      blurb: 'The Continental Divide. From here, every river you meet runs toward the Pacific — if you get over it.',
      challenge: {
        kind: 'survival', boss: true, title: 'BOSS · THE SOUTH PASS BLIZZARD',
        intro: 'Snow in July. The pass fills in behind you and ahead of you at the same time. The fire is the only thing keeping five people alive tonight.',
        instructions: 'CLICK the fire to feed it. Click falling WOOD to grab more. Keep the flames alive until dawn — and do not run out.',
        duration: 60, skin: 'blizzard', reward: { money: 150 }
      }
    },
    {
      id: 8, from: 'South Pass', to: 'Green River',
      miles: 57, terrain: 'mountain',
      blurb: 'Short leg, steep grades. The wagon complains the whole way down.',
      challenge: {
        kind: 'dodger', boss: false, title: 'THE GREEN RIVER',
        intro: 'Wide, deep, and cold enough to stop a heart. The ford is somewhere in all that whitewater.',
        instructions: 'Steer with ← →. Rocks, whirlpools, and driftwood. This one is meaner than the Kansas.',
        duration: 30, hazardRate: 1.8, speed: 3.6, skin: 'river', damage: 11
      }
    },
    {
      id: 9, from: 'Green River', to: 'Fort Hall',
      miles: 143, terrain: 'plains',
      blurb: 'They have been howling every night since the Green. Tonight they sound closer.',
      challenge: {
        kind: 'shooter', boss: true, title: 'BOSS · THE WOLF PACK',
        intro: 'Eyes in the dark — a dozen pairs, then twenty. They have been eating well on this trail. They intend to keep it up.',
        instructions: 'They come in waves from both sides. Keep firing, keep reloading, keep them off the oxen.',
        targets: 16, targetHp: 2, targetSpeed: 2.4, spawnEvery: 45, skin: 'wolf',
        bossHp: 16, timeLimit: 60, reward: { money: 160, ammo: 20 }
      }
    },
    {
      id: 10, from: 'Fort Hall', to: 'Snake River',
      miles: 182, terrain: 'canyon',
      blurb: 'Lava rock and sagebrush. The Snake cuts a canyon so deep you hear it long before you see it.',
      challenge: {
        kind: 'dodger', boss: true, title: 'BOSS · SNAKE RIVER RAPIDS',
        intro: 'No ford. No ferry. Just a chute of white water and a guide who says "most wagons make it" without meeting your eye.',
        instructions: 'Steer hard with ← →. The current shoves you. Rocks come in walls. Ride it out.',
        duration: 42, hazardRate: 2.2, speed: 4.2, skin: 'rapids', damage: 13,
        drift: true, reward: { money: 200 }
      }
    },
    {
      id: 11, from: 'Snake River', to: 'Blue Mountains',
      miles: 135, terrain: 'canyon',
      blurb: 'The wagon is held together with rope, prayer, and whatever parts you have left.',
      challenge: {
        kind: 'repair', boss: false, title: 'THE AXLE SNAPS',
        intro: 'A crack like a gunshot and the wagon drops on its side at the foot of the Blues. Night is coming. So is the cold.',
        instructions: 'Time your hammer strikes. Click when the marker is in the GOLD band. Miss three and you lose parts.',
        rounds: 6, skin: 'repair'
      }
    },
    {
      id: 12, from: 'Blue Mountains', to: 'The Dalles',
      miles: 145, terrain: 'forest',
      blurb: 'Timber so thick you cut the road as you go. Every mile costs you a day and a piece of the wagon.',
      challenge: {
        kind: 'dodger', boss: false, title: 'THE BLUE MOUNTAIN DESCENT',
        intro: 'The far side of the Blues drops away in a grade so steep the oxen slide. Brakes are a suggestion here.',
        instructions: 'Runaway wagon. Steer around the pines with ← →. You cannot slow down.',
        duration: 34, hazardRate: 2.0, speed: 4.6, skin: 'forest', damage: 10
      }
    },
    {
      id: 13, from: 'The Dalles', to: 'Willamette Valley',
      miles: 100, terrain: 'river',
      blurb: 'The last hundred miles. There is no road — only the Columbia. Everything you have comes down to this.',
      challenge: {
        kind: 'dodger', boss: true, title: 'FINAL BOSS · THE COLUMBIA',
        intro: 'You break the wagon down and lash it to a raft. The Columbia takes it out of your hands immediately. Oregon is at the far end of this water, and so is everything you came for.',
        instructions: 'This is the hardest water on the continent. Steer with ← →. Do not stop. Do not hit anything.',
        duration: 55, hazardRate: 2.6, speed: 5.0, skin: 'rapids', damage: 15,
        drift: true, reward: { money: 400 }
      }
    }
  ];

  /* ---------------- Forts (shops) ---------------- */
  // Keyed by the landmark you ARRIVE at. Shop opens after the challenge.
  const FORTS = {
    'Fort Kearny':   { name: "FORT KEARNY SUTLER'S STORE", sub: 'Army prices. Army attitude. Only game for 300 miles.', markup: 1.0 },
    'Fort Laramie':  { name: 'FORT LARAMIE TRADING POST',  sub: 'Trappers, traders, and a blacksmith who works miracles for a price.', markup: 1.25 },
    'Fort Hall':     { name: 'FORT HALL OUTFITTERS',       sub: 'Last real supply on the trail. Whatever you skip here, you go without.', markup: 1.5 },
    'The Dalles':    { name: 'THE DALLES LANDING',         sub: 'End of the road — literally. Stock up before the river takes over.', markup: 1.6 }
  };

  /* ---------------- Shop stock ---------------- */
  const SUPPLIES = [
    { id:'food',  emoji:'🥓', name:'Food',        unit:50,  price:12,  desc:'50 lbs of flour, bacon, and hardtack.', stat:'food' },
    { id:'ammo',  emoji:'📦', name:'Ammunition',  unit:20,  price:10,  desc:'A box of 20 rounds.', stat:'ammo' },
    { id:'parts', emoji:'🔩', name:'Spare Parts', unit:1,   price:22,  desc:'Wheel, axle, and tongue stock. Fixes the wagon.', stat:'parts' },
    { id:'meds',  emoji:'💊', name:'Medicine',    unit:1,   price:28,  desc:'Quinine, laudanum, and clean bandages. Heals a person.', stat:'meds' },
    { id:'oxen',  emoji:'🐂', name:'Yoke of Oxen',unit:2,   price:80,  desc:'Two more oxen. Faster wagon, more to feed.', stat:'oxen' },
    { id:'clothes',emoji:'🧥',name:'Warm Clothes',unit:1,   price:16,  desc:'Wool and hides. Cold legs hurt less.', stat:'clothes' }
  ];

  const UPGRADES = [
    { id:'ironwheels', emoji:'⚙️', name:'Iron-Banded Wheels', price:130,
      desc:'Wagon takes 40% less damage from everything.' },
    { id:'axle',       emoji:'🪵', name:'Reinforced Axle',    price:110,
      desc:'Breakdowns happen far less often on rough ground.' },
    { id:'repeater',   emoji:'🔫', name:'Repeating Rifle',    price:260,
      desc:'8-round magazine and a much faster trigger. Changes every fight.' },
    { id:'scope',      emoji:'🔭', name:'Brass Scope',        price:180,
      desc:'Every shot does +1 damage. Bosses fall faster.' },
    { id:'hide',       emoji:'🛡️', name:'Hide Plating',       price:170,
      desc:'Bandits, wolves, and bears do half damage to the wagon.' },
    { id:'yoke',       emoji:'🐃', name:'Steel Ox Yoke',      price:150,
      desc:'+25% travel speed. Beat the winter.' },
    { id:'raft',       emoji:'🛶', name:'River Raft Kit',      price:190,
      desc:'Rivers and rapids do 40% less damage. Worth it before the Snake.' },
    { id:'dog',        emoji:'🐕', name:'A Dog Named Bandit',  price:80,
      desc:'Sniffs out trouble early and drags home the odd rabbit. Good boy.' },
    { id:'chest',      emoji:'🧰', name:'Medicine Chest',      price:120,
      desc:'Sickness is half as likely, and the party heals a little every night.' },
    { id:'compass',    emoji:'🧭', name:'Lucky Compass',       price:210,
      desc:'You get lost less, and good fortune finds you more often.' },
    { id:'lantern',    emoji:'🏮', name:'Storm Lantern',       price:95,
      desc:'Travel safely at night. +10% miles every single day.' },
    { id:'kettle',     emoji:'☕', name:'Coffee Kettle',       price:70,
      desc:'Morale holds. Resting heals twice as much.' }
  ];

  /* ---------------- Event deck ---------------- */
  // effects: {food, ammo, parts, meds, money, wagonHP, miles, days, oxen}
  // hurt: {n, amount} damages n random living members
  const EVENTS = [
    {
      id:'wagon-stuck', icon:'🛞', title:'Wagon Sunk in the Mud',
      text:'A spring rain turned the trail to soup and the rear wheel is buried to the hub. Nobody is going anywhere until it comes out.',
      choices:[
        { label:'Everyone push (risk a pulled back)', outcome:{ text:'Six people, one long grunt, and the wagon pops free.', effects:{ days:1 }, hurt:{ chance:.35, n:1, amount:12 } } },
        { label:'Unload the wagon first (slow but safe)', outcome:{ text:'It takes all day to unload, dig, and repack. But nobody gets hurt.', effects:{ days:2 } } },
        { label:'Cut a pole and lever it out', outcome:{ text:'The lever works — and costs you a spare part when it splinters.', effects:{ days:1, parts:-1 } } }
      ]
    },
    {
      id:'trader', icon:'🤝', title:'A Trader on the Road',
      text:'A man with a mule train and a wide smile offers a swap. His prices are terrible. His goods are real.',
      choices:[
        { label:'Trade 100 lbs of food for 3 parts', outcome:{ text:'He shakes on it and vanishes over the rise.', effects:{ food:-100, parts:3 } } },
        { label:'Trade 2 parts for medicine', outcome:{ text:'Quinine and clean bandages. Worth more than iron out here.', effects:{ parts:-2, meds:2 } } },
        { label:'Trade nothing. Ask about the road ahead.', outcome:{ text:'"River\'s low at the ford," he says. Sometimes information is the best trade.', effects:{ miles:22 } } }
      ]
    },
    {
      id:'berries', icon:'🫐', title:'A Thicket of Berries',
      text:'Acres of them, ripe and heavy. Some of the party is already eating. One bush looks… different from the others.',
      choices:[
        { label:'Pick everything — sort it later', outcome:{ text:'A haul of berries. Somebody definitely ate the wrong one.', effects:{ food:70 }, hurt:{ chance:.45, n:1, amount:15 } } },
        { label:'Pick only what you recognize', outcome:{ text:'Careful hands, smaller haul, no funerals.', effects:{ food:35 } } },
        { label:'Leave them. Push on.', outcome:{ text:'You make good miles on an empty stomach.', effects:{ miles:18 } } }
      ]
    },
    {
      id:'thief', icon:'🌑', title:'Thief in the Night',
      text:'You wake to the sound of a strap being cut. A shape is moving fast away from the wagon with something under its arm.',
      choices:[
        { label:'Chase him', outcome:{ text:'You catch him in the dark and take it all back — plus a black eye.', effects:{}, hurt:{ chance:.5, n:1, amount:10 } } },
        { label:'Fire a shot over his head', outcome:{ text:'He drops most of it and runs. Costs you two rounds and some sleep.', effects:{ ammo:-2, food:-20 } } },
        { label:'Let him go', outcome:{ text:'He takes food and a part. Everyone lives. That is a trade you can accept.', effects:{ food:-60, parts:-1 } } }
      ]
    },
    {
      id:'fever', icon:'🤒', title:'Fever in the Camp',
      text:'One of your people is burning up and shaking under three blankets. It could be nothing. Out here, it is rarely nothing.',
      choices:[
        { label:'Use medicine', outcome:{ text:'The fever breaks by morning.', effects:{ meds:-1 }, heal:{ n:1, amount:35 }, require:{ meds:1 } } },
        { label:'Rest two days and hope', outcome:{ text:'Two days lost. The fever mostly passes.', effects:{ days:2 }, heal:{ n:1, amount:15 } } },
        { label:'Press on. No time.', outcome:{ text:'You make miles. The fever makes progress too.', effects:{ miles:25 }, hurt:{ chance:1, n:1, amount:25 } } }
      ]
    },
    {
      id:'wild-fruit', icon:'🍎', title:'Abandoned Orchard',
      text:'A homestead nobody finished, and behind it a stand of apple trees gone wild and heavy with fruit.',
      choices:[
        { label:'Fill every barrel', outcome:{ text:'Apples for a hundred miles. Morale is high.', effects:{ food:90, days:1 } } },
        { label:'Grab a bushel and go', outcome:{ text:'A quick haul and back on the road.', effects:{ food:40 } } }
      ]
    },
    {
      id:'broken-wheel', icon:'☸️', title:'A Wheel Splits',
      text:'The front-left wheel cracks straight through a spoke and the wagon leans hard into the ruts.',
      choices:[
        { label:'Replace it with a spare', outcome:{ text:'An hour of work and you are rolling again.', effects:{ parts:-1, wagonHP:20 }, require:{ parts:1 } } },
        { label:'Lash it with rope and pray', outcome:{ text:'It holds. Sort of. The wagon groans every mile now.', effects:{ wagonHP:-18 } } },
        { label:'Carve a new spoke from a cottonwood', outcome:{ text:'It takes two days and the wood is soft, but it works.', effects:{ days:2, wagonHP:10 } } }
      ]
    },
    {
      id:'stranded', icon:'🆘', title:'A Stranded Family',
      text:'Three people beside a dead ox and a wagon that will never move again. The mother asks for nothing. The child looks at your food barrel.',
      choices:[
        { label:'Give them food', outcome:{ text:'She grips your hand and says a name you will remember. Something in the party lifts.', effects:{ food:-80 }, luck:8 } },
        { label:'Give them an ox', outcome:{ text:'They can reach the fort now. You are slower, but you can live with yourself.', effects:{ oxen:-1 }, luck:12 } },
        { label:'Ride on', outcome:{ text:'Nobody in your wagon says a word for two hours.', effects:{ miles:20 }, luck:-8 } }
      ]
    },
    {
      id:'shortcut', icon:'🗺️', title:'The Sublette Cutoff',
      text:'A faded sign points at a track heading north. Saves fifty miles, they say. Also no water for two days, they say.',
      choices:[
        { label:'Take the cutoff', outcome:{ text:'Fifty miles saved — and a dry, brutal crossing that costs you.', effects:{ miles:50, wagonHP:-10 }, hurt:{ chance:.5, n:2, amount:12 } } },
        { label:'Stay on the main trail', outcome:{ text:'Slower, wetter, safer. The old hands nod at you.', effects:{ days:1 } } }
      ]
    },
    {
      id:'snake', icon:'🐍', title:'Rattlesnake',
      text:'A dry buzz from under the wagon tongue, and somebody freezes mid-step with their boot six inches from it.',
      choices:[
        { label:'Shoot it', outcome:{ text:'One round, one snake, one very fine belt.', effects:{ ammo:-1, food:5 } } },
        { label:'Pin it with a shovel', outcome:{ text:'Quick work. No shot fired, no bite taken.', effects:{}, hurt:{ chance:.25, n:1, amount:20 } } },
        { label:'Back away slowly', outcome:{ text:'It leaves on its own terms. Everyone breathes again.', effects:{ days:1 } } }
      ]
    },
    {
      id:'ox-sick', icon:'🐂', title:'An Ox Goes Down',
      text:'The big brindle ox stumbles, kneels in the traces, and will not get back up.',
      choices:[
        { label:'Rest until it recovers', outcome:{ text:'Three days of grazing and it stands. Barely.', effects:{ days:3 } } },
        { label:'Cut it loose and go', outcome:{ text:'You leave it in good grass. Slower going now.', effects:{ oxen:-1 } } },
        { label:'Put it down and take the meat', outcome:{ text:'A hard, practical thing. The larder is full and the party is quiet.', effects:{ oxen:-1, food:180 }, luck:-4 } }
      ]
    },
    {
      id:'hailstorm', icon:'🌨️', title:'Hailstorm',
      text:'Ice the size of musket balls comes out of a green sky and hammers everything you own.',
      choices:[
        { label:'Shelter under the wagon', outcome:{ text:'The canvas takes a beating so your people do not.', effects:{ wagonHP:-14, days:1 } } },
        { label:'Run the oxen for the tree line', outcome:{ text:'You make it — mostly.', effects:{ wagonHP:-6 }, hurt:{ chance:.4, n:2, amount:10 } } }
      ]
    },
    {
      id:'spring', icon:'💧', title:'A Cold Spring',
      text:'Clear water coming right out of the rock, so cold it makes your teeth hurt. The first good water in a week.',
      choices:[
        { label:'Camp here a day', outcome:{ text:'Full bellies, washed clothes, and everyone stands a little straighter.', effects:{ days:1 }, heal:{ n:5, amount:18 } } },
        { label:'Fill the barrels and roll', outcome:{ text:'Good water in the barrels and good miles behind you.', effects:{ miles:15 }, heal:{ n:2, amount:8 } } }
      ]
    },
    {
      id:'lost', icon:'🧭', title:'Lost the Trail',
      text:'The ruts split three ways in a burned-over stretch and none of them look more traveled than the others.',
      choices:[
        { label:'Scout ahead on foot', outcome:{ text:'A half day burned, but you find the real trail.', effects:{ days:1 } } },
        { label:'Pick a rut and commit', outcome:{ text:'Wrong one. Miles wasted backtracking.', effects:{ miles:-30, days:1 } } },
        { label:'Wait for another wagon to pass', outcome:{ text:'A train rolls by at dusk and you fall in behind them.', effects:{ days:2 }, luck:5 } }
      ]
    },
    {
      id:'grave', icon:'🪦', title:'A Grave by the Road',
      text:'A board with a name and a date three weeks old. Beside it, a chest somebody could not carry any further.',
      choices:[
        { label:'Open the chest', outcome:{ text:'Money, powder, and a letter you decide not to read.', effects:{ money:60, ammo:10 }, luck:-5 } },
        { label:'Straighten the board and move on', outcome:{ text:'You leave it as you found it, only tidier.', effects:{}, luck:6 } }
      ]
    },
    {
      id:'fire', icon:'🔥', title:'Prairie Fire',
      text:'A line of orange on the horizon and the wind at its back, coming faster than an ox can walk.',
      choices:[
        { label:'Burn a firebreak ahead of you', outcome:{ text:'You fight fire with fire and it works. Nerves are shot.', effects:{ days:1, food:-20 } } },
        { label:'Run for the river', outcome:{ text:'You beat it to the water by minutes. The wagon is scorched.', effects:{ wagonHP:-16 } } },
        { label:'Turn back and go around', outcome:{ text:'Safe, but you give back real miles.', effects:{ miles:-40, days:1 } } }
      ]
    },
    {
      id:'wolves-night', icon:'🐺', title:'Wolves at the Edge of the Fire',
      text:'Green eyes, just past the light, patient as clocks. They are counting your oxen.',
      choices:[
        { label:'Fire into the dark', outcome:{ text:'They scatter. You do not sleep.', effects:{ ammo:-4 } } },
        { label:'Build the fire up high', outcome:{ text:'Flames hold them off till dawn. You burn through firewood and a day.', effects:{ days:1 } } },
        { label:'Let them have a haunch of meat', outcome:{ text:'They take it and go. Cheap, if you can spare it.', effects:{ food:-45 } } }
      ]
    },
    {
      id:'wagon-train', icon:'🚩', title:'Another Wagon Train',
      text:'Twelve wagons, forty people, and a captain who says you are welcome to travel with them a while.',
      choices:[
        { label:'Join them', outcome:{ text:'Safety in numbers, but you move at their pace.', effects:{ days:2 }, heal:{ n:3, amount:12 }, luck:8 } },
        { label:'Trade with them and move on', outcome:{ text:'A brisk swap and a friendly wave.', effects:{ money:-30, food:120 } } },
        { label:'Decline. You travel faster alone.', outcome:{ text:'You pull ahead by nightfall.', effects:{ miles:30 } } }
      ]
    },
    {
      id:'bad-water', icon:'🥴', title:'Bad Water',
      text:'The only water for twenty miles sits still and green in a buffalo wallow, and there is a dead thing in the far end.',
      choices:[
        { label:'Boil it first', outcome:{ text:'Tastes like a swamp. Nobody dies.', effects:{ days:1 } } },
        { label:'Drink it as-is', outcome:{ text:'Everyone regrets this within six hours.', effects:{ miles:20 }, hurt:{ chance:1, n:3, amount:18 } } },
        { label:'Push on dry', outcome:{ text:'Twenty hard, thirsty miles.', effects:{ miles:20 }, hurt:{ chance:.6, n:2, amount:10 } } }
      ]
    },
    {
      id:'guide', icon:'🪶', title:'A Guide Offers Help',
      text:'A Shoshone traveler watches you misread the ford for ten full minutes, then points, without a word, at the actual crossing forty yards upstream.',
      choices:[
        { label:'Thank them and offer trade goods', outcome:{ text:'A fair trade, freely made. They show you the next two fords as well.', effects:{ money:-25, miles:45 }, luck:10 } },
        { label:'Take the advice and go', outcome:{ text:'The ford is exactly where they said it was.', effects:{ miles:25 } } }
      ]
    },
    {
      id:'gold', icon:'💰', title:'Something in the Creek',
      text:'A glint in the gravel. Probably pyrite. Probably.',
      choices:[
        { label:'Pan the creek for a day', outcome:{ text:'Mostly fool\'s gold — but not entirely.', effects:{ days:1, money:75 } } },
        { label:'Oregon is the gold. Keep moving.', outcome:{ text:'You have your priorities in order.', effects:{ miles:22 } } }
      ]
    },
    {
      id:'axle-crack', icon:'🪚', title:'The Axle Groans',
      text:'A sound from under the bed that no wagon should make, and it gets louder on every rock.',
      choices:[
        { label:'Fix it now with a spare', outcome:{ text:'Better a day now than a wreck later.', effects:{ parts:-1, days:1, wagonHP:15 }, require:{ parts:1 } } },
        { label:'Nurse it to the next fort', outcome:{ text:'You go slow and hold your breath for eighty miles.', effects:{ wagonHP:-20, miles:-15 } } }
      ]
    },
    {
      id:'blizzard-early', icon:'❄️', title:'Early Snow',
      text:'Snow this far down the mountain in September means the passes above are already closing.',
      choices:[
        { label:'Push through the night', outcome:{ text:'Brutal cold, real miles.', effects:{ miles:40 }, hurt:{ chance:.55, n:2, amount:14 } } },
        { label:'Wait it out', outcome:{ text:'Two days in camp. Warm, safe, and behind schedule.', effects:{ days:2, food:-30 } } }
      ]
    },
    {
      id:'hunter-friend', icon:'🦌', title:'A Hunter Shares His Kill',
      text:'A lone hunter with more elk than he can carry waves you over to his fire.',
      choices:[
        { label:'Accept, and share your coffee', outcome:{ text:'Elk steaks and stories until midnight. Best night in weeks.', effects:{ food:130, days:1 }, heal:{ n:5, amount:10 } } },
        { label:'Buy a haunch and press on', outcome:{ text:'Fair price, good meat.', effects:{ money:-20, food:70 } } }
      ]
    },
    {
      id:'child-lost', icon:'🔦', title:'Someone Wandered Off',
      text:'A head count at dusk comes up one short. Their footprints go into the tall grass and do not come back.',
      choices:[
        { label:'Search all night', outcome:{ text:'You find them at 3am, scared and cold and alive.', effects:{ days:1 }, heal:{ n:1, amount:-8 } } },
        { label:'Fire the rifle every ten minutes', outcome:{ text:'They follow the sound home by moonlight. Costs a lot of powder.', effects:{ ammo:-8 } } }
      ]
    },
    {
      id:'ferry', icon:'⛴️', title:'A Ferryman',
      text:'"Twenty dollars a wagon," he says, chewing. "Or you can swim it and I\'ll fish your barrels out downstream. For twenty dollars."',
      choices:[
        { label:'Pay the man', outcome:{ text:'Dry, dull, and entirely successful.', effects:{ money:-20 }, require:{ money:20 } } },
        { label:'Ford it yourself', outcome:{ text:'You make it across. The wagon takes on water and the flour is ruined.', effects:{ wagonHP:-12, food:-50 } } },
        { label:'Caulk the wagon and float it', outcome:{ text:'It floats! Mostly. A part is lost to the current.', effects:{ parts:-1, days:1 } } }
      ]
    },
    {
      id:'sabbath', icon:'⛪', title:'Sunday on the Trail',
      text:'Half the party wants to rest and give thanks. The other half is watching the sky and thinking about the mountains.',
      choices:[
        { label:'Rest and observe it', outcome:{ text:'A quiet day. Everyone needed it more than they admitted.', effects:{ days:1 }, heal:{ n:5, amount:20 }, luck:5 } },
        { label:'Roll on', outcome:{ text:'You make miles and nobody sings.', effects:{ miles:26 }, luck:-3 } }
      ]
    },
    {
      id:'broken-tongue', icon:'🪵', title:'The Wagon Tongue Splits',
      text:'The beam that connects the oxen to everything you own cracks lengthwise.',
      choices:[
        { label:'Replace with a spare part', outcome:{ text:'Straightforward, if you have the wood.', effects:{ parts:-1 }, require:{ parts:1 } } },
        { label:'Splint it with iron and rope', outcome:{ text:'Ugly, heavy, and it holds.', effects:{ wagonHP:-12, days:1 } } }
      ]
    },
    {
      id:'stampede-cattle', icon:'🐄', title:'Loose Cattle',
      text:'Someone else\'s herd, unattended, wandering the trail. No brand, no owner in sight.',
      choices:[
        { label:'Take one', outcome:{ text:'Meat for two hundred miles. You do not look back.', effects:{ food:200 }, luck:-6 } },
        { label:'Drive them toward the last fort', outcome:{ text:'Costs you a day — and word gets ahead of you that you are honest.', effects:{ days:1, money:40 }, luck:10 } },
        { label:'Leave them be', outcome:{ text:'Not your cattle, not your problem.', effects:{} } }
      ]
    },
    {
      id:'music', icon:'🎻', title:'A Fiddle by the Fire',
      text:'Someone produces a battered fiddle nobody knew was in the wagon, and starts to play.',
      choices:[
        { label:'Dance until the fire dies', outcome:{ text:'For one night the trail is not trying to kill you, and it is glorious.', effects:{ days:1 }, heal:{ n:5, amount:22 }, luck:8 } },
        { label:'One song, then sleep', outcome:{ text:'One song is enough to remember why you came.', effects:{}, heal:{ n:5, amount:8 } } }
      ]
    }
  ];

  return { CLASSES, FIRST_NAMES, LEVELS, FORTS, SUPPLIES, UPGRADES, EVENTS };
})();
