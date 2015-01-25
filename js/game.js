window.onload = function(){
    var gameScale = 4;
    var width = 800;
    var height = 600;
    var game = new Phaser.Game(width / gameScale, height / gameScale, Phaser.CANVAS, '', { init: init, preload: preload, create: create, update: update, render: render });
    var pixel = { canvas: null, context: null }
    function init(){
        game.canvas.style['display'] = 'none';
        pixel.canvas = Phaser.Canvas.create(width, height);
        pixel.canvas.style['margin'] = '0 auto';
        pixel.context = pixel.canvas.getContext('2d');
        Phaser.Canvas.addToDOM(pixel.canvas);
        Phaser.Canvas.setSmoothingEnabled(pixel.context, false);
    }
    function preload(){
        //Load tilemap
        game.load.pack('map', 'assets/tilemap-assets.json');
        game.load.tilemap('map', 'assets/sprites/map.json', null, Phaser.Tilemap.TILED_JSON);
        //Load sprites
        game.load.spritesheet('player', 'assets/sprites/character/player.png', 18, 28, 16);

        game.load.spritesheet('ghost_no_armsSprite', 'assets/sprites/character/ghost_no_arms.png', 16, 29, 4);
        game.load.spritesheet('ghost_bowSprite', 'assets/sprites/character/ghost_bow.png', 18, 32, 4);
        game.load.spritesheet('ghost_hatSprite', 'assets/sprites/character/ghost_hat.png', 20, 31, 4);
        game.load.spritesheet('ghost_armsSprite', 'assets/sprites/character/ghost_arms.png', 23, 31, 4);
        game.load.spritesheet('sparkleSprite', 'assets/sprites/character/sparkle.png', 20, 25, 6);

        game.load.image('grass', 'assets/sprites/background/grass.png');
        game.load.image('ghost_no_arms', 'assets/sprites/character/ghost_no_arms.png');
        game.load.image('ghost_bow', 'assets/sprites/character/ghost_bow.png');
        game.load.image('ghost_hat', 'assets/sprites/character/ghost_hat.png');
        game.load.image('ghost_arms', 'assets/sprites/character/ghost_arms.png');
        game.load.image('sparkle', 'assets/sprites/character/sparkle.png');
        game.load.image('tree_stump', 'assets/sprites/collidables/tree_stump.png');
        game.load.image('House_C', 'assets/sprites/collidables/House_C.png');
        game.load.image('Bush2_full', 'assets/sprites/collidables/Bush2_full.png');
        game.load.image('tree_Jess_1', 'assets/sprites/collidables/tree_Jess_1.png');
        game.load.image('flower bush', 'assets/sprites/collidables/flower bush.png');
        game.load.image('Bush1_full', 'assets/sprites/collidables/Bush1_full.png');
        game.load.image('House_e', 'assets/sprites/collidables/House_e.png');
        game.load.image('House_D', 'assets/sprites/collidables/House_D.png');
        game.load.image('Olivia Tree', 'assets/sprites/collidables/Olivia Tree.png');
        game.load.image('houseA', 'assets/sprites/collidables/houseA.png');
        game.load.image('tree_Jess2', 'assets/sprites/collidables/tree_Jess2.png');
        game.load.image('tree_fall', 'assets/sprites/collidables/tree_fall.png');
        game.load.image('houseB', 'assets/sprites/collidables/houseB.png');
    }

    var player;
    var map;
    var layers = [];

    var sparkles;
    var ghosts;
    var collidables;
    var collidablesInfo = [
    'Bush1_full',
    'houseA',
    'Bush1_full',
    'House_C',
    'Bush2_full',
    'Olivia Tree',
    'tree_fall',
    'House_D',
    'tree_Jess_1',
    'tree_Jess2',
    'tree_stump',
    'House_e',
    'houseB',
    'flower bush'
    ];
    var collidablesOffset = 53;

    //Scaling
    var tileSize = 43;
    var walkingSpeed = 100;

    //Key Stuff
    var lastDirectional;
    var resetting;
    //
    var music = [];
    var worldNumber = 1;

    var sound = new Object();
    var noMoreWorlds;
    var lastSparkle = 0;

    function create(){
        //tilemap
        map = game.add.tilemap('map');
        //tilesets
        map.addTilesetImage('grass', 'grass');
        map.addTilesetImage('sparkle', 'sparkle');
        map.addTilesetImage('ghost_arms', 'ghost_arms');
        map.addTilesetImage('ghost_bow', 'ghost_bow');
        map.addTilesetImage('ghost_hat', 'ghost_hat');
        map.addTilesetImage('Bush1_full', 'Bush1_full');
        map.addTilesetImage('ghost_no_arms', 'ghost_no_arms');
        map.addTilesetImage('houseA', 'houseA');
        map.addTilesetImage('Bush1_full', 'Bush1_full');
        map.addTilesetImage('House_C', 'House_C');
        map.addTilesetImage('Bush2_full', 'Bush2_full');
        map.addTilesetImage('Olivia Tree', 'Olivia Tree');
        map.addTilesetImage('tree_fall', 'tree_fall');
        map.addTilesetImage('House_D', 'House_D');
        map.addTilesetImage('tree_Jess_1', 'tree_Jess_1');
        map.addTilesetImage('tree_Jess2', 'tree_Jess2');
        map.addTilesetImage('tree_stump', 'tree_stump');
        map.addTilesetImage('House_e', 'House_e');
        map.addTilesetImage('houseB', 'houseB');
        map.addTilesetImage('flower bush', 'flower bush');

        //Collisions

        //Music1
        addMusic('Layer1',1);
        addMusic('Layer2',0);
        addMusic('Layer3',0);
        addMusic('Bassline',0);

        setTimeout(function(){
            for(var i = 0; i < music.length; i++)
                music[i].play();
        }, 1000);

        //Start physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //Replace static player sprite with actual player and instantiate sound emitters.
        player = game.add.sprite(game.world.width/2, game.world.height/2, 'player');
        player.anchor.set(.5);
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.setSize(10,10,3,10);
        // player.body.collideWorldBounds = true;
        player.fr = 6;
        player.animations.add('walkDown', [0, 1, 2, 3], player.fr, true);
        player.animations.add('walkUp', [4, 5, 6, 7], player.fr, true);
        player.animations.add('walkLeft', [8, 9, 10, 11], player.fr, true);
        player.animations.add('walkRight', [12, 13, 14, 15], player.fr, true);

        game.camera.follow(player);
        game.camera.focusOnXY(0, 0);
        //Initiate sound
        sound.x = player.x;
        sound.y = player.y;

        //Layers
        loadWorldLayers();
        //Sparkles
        sparkles = game.add.group();
        sparkles.enableBody = true;

        ghosts = game.add.group();
        //Collidables
        collidables = game.add.group();
        collidables.enableBody = true;
        collidables.physicsBodyType = Phaser.Physics.ARCADE;

        createSparkle();
    }

    function update(){
        game.physics.arcade.collide(player, collidables);
        game.physics.arcade.overlap(player, sparkles, collectSparkle, null, this);
        var distance = findDistance(player, sound.x, sound.y);
        setMusicPosition(music, (sound.x - player.x)/200, (sound.y - player.y)/200);
        //console.log(music[0].pos3d());
        var volume = 0;
        if(distance < 400)
            volume = (400 - distance) / 400;
        //layer1.alpha = volume;

        //Player logic
        cursors = game.input.keyboard.createCursorKeys();
        keysOrder = ["left", "up", "right", "down"];
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        lastKey = 0;
        if(game.input.keyboard.lastKey) {
            lastKey = game.input.keyboard.lastKey.keyCode;
        }
        if(37 < lastKey < 41) {
            lastDirectional = keysOrder[lastKey-37];
        }
        if(cursors.left.isDown ||
            cursors.right.isDown ||
            cursors.up.isDown ||
            cursors.down.isDown)
        {

            switch(lastDirectional){
                case "left":
                    player.body.velocity.x = -walkingSpeed;
                    player.animations.play('walkLeft');
                    break;
                case "right":
                    player.body.velocity.x = walkingSpeed;
                    player.animations.play('walkRight');
                    break;
                case "up":
                    player.body.velocity.y = -walkingSpeed;
                    player.animations.play('walkUp');
                    break;
                case "down":
                    player.body.velocity.y = walkingSpeed;
                    player.animations.play('walkDown');
                    break;
            }
        } else {
            player.animations.stop();
            switch(lastDirectional){
                case "left":
                    player.frame = 9;
                    break;
                case "right":
                    player.frame = 14;
                    break;
                case "up":
                    player.frame = 4;
                    break;
                case "down":
                    player.frame = 0;
                    break;
                }
        }
        if(resetting)
            player.frame = 0;
    }

    function render() {
        game.debug.bodyInfo(player, 32, 320);
        pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, width, height);
    }
    function collectSparkle(player, sparkle){
        sparkle.kill();
        worldNumber++;

        setWorldLayerAlpha(1.0);

        addCollidables();
        addGhosts();
        createSparkle();

        unmute(worldNumber);
        if(worldNumber == 2)
            unmute(music.length-1);
        player.bringToTop();
    }
    function findDistance(player, x2, y2){
        return Math.sqrt(Math.pow((player.x - x2), 2) + Math.pow((player.y - y2), 2));
    }
    function setMusicPosition(music, x, y){
        for( var i = 0; i < music.length; i++){
            music[i].pos3d(x,y);
        }
    }
    function createSparkle(){

            map.createFromObjects('World_'+worldNumber+'_remove', 31, 'sparkleSprite', 0, true, false, sparkles);
            //Add sparkle animations
            sparkles.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5], 5, true);
            sparkles.callAll('animations.play', 'animations', 'spin');
            sparkles.callAll('anchor.set', 'anchor', .5);
            sparkles.callAll('body.setSize', 'body', 10, 10);
            var sparkle = sparkles.children[sparkles.children.length-1]
            var x = sparkle.x;
            var y = sparkle.y;
            var tween = TweenLite.to(sound, 2, {"x": x, "y": y});
            //sparkles.bringToTop();
            if(lastSparkle >= sparkle.z)
                restart();
            lastSparkle = sparkle.z;
    }
    function addGhosts(){
        createGhost(37, 'ghost_armsSprite');
        createGhost(41, 'ghost_bowSprite');
        createGhost(45, 'ghost_hatSprite');
        createGhost(49, 'ghost_no_armsSprite');
    }
    function createGhost(gid, name){
        map.createFromObjects('World_'+worldNumber+'_objects', gid, name, 0, true, false, ghosts);
        map.createFromObjects('World_'+worldNumber+'_remove', gid, name, 0, true, false, ghosts);
        //Add sparkle animations
        try{
            ghosts.callAll('animations.add', 'animations', 'character', [0, 1, 2, 3], 5, true);
            ghosts.callAll('animations.play', 'animations', 'character');
        }
        catch(e){

        }
    }
    function addCollidables(){
        for(var i = 0; i < collidablesInfo.length; i++){
            map.createFromObjects('World_'+worldNumber+'_remove', collidablesOffset + i, collidablesInfo[i], 0, true, false, collidables);
            map.createFromObjects('World_'+worldNumber+'_objects', collidablesOffset + i, collidablesInfo[i], 0, true, false, collidables);
        }
        collidables.setAll('body.immovable', true);
    }
    function loadWorldLayers(){
        for(var i = 1; i < 10; i++){
            if(!noMoreWorlds){
                layers.push(map.createLayer('World_' + i));
                try{
                layers[i-1].alpha = 0;
                layers[i-1].cacheAsBitmap = true;
                layers[i-1].resizeWorld();
                }
                catch(e){
                    noMoreWorlds = true;
                }
            }
        }
        noMoreWorlds = false;
    }
    function setWorldLayerAlpha(alpha){
        if(!noMoreWorlds){
            try{
                layers[worldNumber-1].alpha = alpha;
            }
            catch(e){
                noMoreWorlds = true;
            }
        }
    }
    function addMusic(song, vol){
        music.push(new Howl({
            urls: ['assets/audio/music/'+song+'.mp3'],
            loop: true,
            volume: vol,
        }));
    }
    function unmute(index){
        if(index < music.length)
            music[index].volume(1);
    }
    function restart(){
        //resetting = true;

    }

};
