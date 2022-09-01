

var socket = io()
const mids = [99999, 88888, 11111, 00000]
let randomIndex = Math.floor(Math.random() * mids.length)
console.log("random mid is " + mids[randomIndex])
socket.emit("ZACtx", {
    mid: mids[randomIndex]
})
socket.on("Sp", (evt) => {
    if (evt["player"] == mids[randomIndex]) {
        startGame(evt["spy"])
    }
})


function startGame(mapType){
    var cursors;
    var player;
    var vision;
    const SPEED = 60
    function ItemSceneCreateCallback(){
        map = this.make.tilemap({ key: 'map'});
        var BGtileset = map.addTilesetImage('Env');
        var bglayer = map.createLayer('Background', BGtileset);
        var treeLayer = map.createLayer('Trees', BGtileset);
        treeLayer.setCollisionByProperty({ CanCollide: true })
        var pickupLayer = map.createLayer('Pickups', BGtileset);
        player = this.physics.add.sprite(0,0, 'player')
    }
    
    function ExitSceneCreateCallback(){
        map = this.make.tilemap({ key: 'map'});
        var BGtileset = map.addTilesetImage('Env');
        var bglayer = map.createLayer('Background', BGtileset);
        var treeLayer = map.createLayer('Trees', BGtileset);
        treeLayer.setCollisionByProperty({ CanCollide: true })
        var exitLayer = map.createLayer("Exits", BGtileset)
        player = this.physics.add.sprite(0,0, 'player')
    }
    
    function PlayerCreateCallback(){
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player',{start: 0, end:0 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'player_down',
            frames: this.anims.generateFrameNumbers('player',{start: 0, end:2 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'player_left',
            frames: this.anims.generateFrameNumbers('player',{start: 3, end:5 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'player_right',
            frames: this.anims.generateFrameNumbers('player',{start: 6, end:8 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'player_up',
            frames: this.anims.generateFrameNumbers('player',{start: 9, end:11 }),
            frameRate: 10,
            repeat: -1
        })
        map = this.make.tilemap({ key: 'map'});
        var BGtileset = map.addTilesetImage('Env');
        var bglayer = map.createLayer('Background', BGtileset);
        var treeLayer = map.createLayer('Trees', BGtileset);
        treeLayer.setCollisionByProperty({ CanCollide: true })
        var pickupLayer = map.createLayer('Pickups', BGtileset);
        var exitLayer = map.createLayer("Exits", BGtileset)
        const WIDTH = 800;
        const HEIGHT = 400;
        const rt = this.add.renderTexture(0,0, 800, 400)
        // fill it with black
        rt.fill(0x000000)
    
        // draw the floorLayer into it
        rt.draw(bglayer)
    
        // set a dark blue tint
        rt.setTint(0x0a2948)
        
        player = this.physics.add.sprite(0,0, 'player')
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, treeLayer)
        cursors = this.input.keyboard.createCursorKeys();
        vision = this.make.sprite({
            x: player.x,
            y: player.y,
            key: 'vision',
            add: false
        })
        vision.scale = 1
        rt.mask = new Phaser.Display.Masks.BitmapMask(this, vision)
        rt.mask.invertAlpha = true   
    }
    
    function PlayerMoveUpdate(){
        player.setVelocity(0)
            if (cursors.right.isDown)
            {
                player.setVelocityX(SPEED)
                player.play('player_right', true);
    
            }
            if (cursors.left.isDown)
            {
                player.setVelocityX(-SPEED)
                player.play('player_left', true)
    
            }
            if (cursors.up.isDown)
            {
                player.setVelocityY(-SPEED)
                player.play('player_up', true)
            }
            if (cursors.down.isDown)
            {
                player.setVelocityY(SPEED)
                player.play('player_down', true)
            }
    
            if (vision)
            {
                vision.x = player.x
                vision.y = player.y
            }
            socket.emit("playerMoved", {x: player.x, y: player.y})

    }
    function PlayerTrackingUpdate(){
        var self = this
        socket.on("playerTrack", function(pos){
            player.x = pos.x
            player.y = pos.y
        })
    }
    
    function HostSceneCallback(){
        map = this.make.tilemap({ key: 'map'});
        var BGtileset = map.addTilesetImage('Env');
        var bglayer = map.createLayer('Background', BGtileset);
        var treeLayer = map.createLayer('Trees', BGtileset);
        treeLayer.setCollisionByProperty({ CanCollide: true })
        var pickupLayer = map.createLayer('Pickups', BGtileset);
        var exitLayer = map.createLayer("Exits", BGtileset)
        player = this.physics.add.sprite(0,0, 'player')
    }



    
  
    function preload(){
        this.load.setBaseURL('http://localhost:8080')
        this.load.tilemapTiledJSON('map', 'playground.json');
        this.load.image('Env', 'assets/BaseChip_pipo.png'); 
        this.load.image('Enemy', 'assets/Enemy 16-6.png');
        this.load.image('vision', 'assets/mask1.png');
        this.load.spritesheet('player', 'assets/Male 02-4.png', { frameWidth: 32, frameHeight: 32})
    }

    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 400,
        backgroundColor: '#ffffff',
        parent: 'main',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                debug: true
            }
        }
    };
    if (mapType == "Player"){
        config.scene = {
            preload: preload,
            create: PlayerCreateCallback,
            update: PlayerMoveUpdate
        }
    } else if (mapType == "Items") {
        config.scene = {
            preload: preload,
            create: ItemSceneCreateCallback,
            update: PlayerTrackingUpdate
        }
    } else if (mapType == "Exits") {
        config.scene = {
            preload: preload,
            create: ExitSceneCreateCallback,
            update: PlayerTrackingUpdate
        }
    } else if(mapType == "Host") {
        config.scene = {
            preload: preload,
            create: HostSceneCallback,
            update: PlayerTrackingUpdate
        }
    }

    var game = new Phaser.Game(config)

    // function create(){
        
    //     this.anims.create({
    //         key: 'player_idle',
    //         frames: this.anims.generateFrameNumbers('player',{start: 0, end:0 }),
    //         frameRate: 10,
    //         repeat: -1
    //     })
    //     this.anims.create({
    //         key: 'player_down',
    //         frames: this.anims.generateFrameNumbers('player',{start: 0, end:2 }),
    //         frameRate: 10,
    //         repeat: -1
    //     })
    //     this.anims.create({
    //         key: 'player_left',
    //         frames: this.anims.generateFrameNumbers('player',{start: 3, end:5 }),
    //         frameRate: 10,
    //         repeat: -1
    //     })
    //     this.anims.create({
    //         key: 'player_right',
    //         frames: this.anims.generateFrameNumbers('player',{start: 6, end:8 }),
    //         frameRate: 10,
    //         repeat: -1
    //     })
    //     this.anims.create({
    //         key: 'player_up',
    //         frames: this.anims.generateFrameNumbers('player',{start: 9, end:11 }),
    //         frameRate: 10,
    //         repeat: -1
    //     })
    //     map = this.make.tilemap({ key: 'map'});
    //     var BGtileset = map.addTilesetImage('Env');
    //     var bglayer = map.createLayer('Background', BGtileset);
    //     var treeLayer = map.createLayer('Trees', BGtileset);
    //     treeLayer.setCollisionByProperty({ CanCollide: true })
    //     var pickupLayer = map.createLayer('Pickups', BGtileset);
    //     var exitLayer = map.createLayer("Exits", BGtileset)
    //     if (mapType == "Items"){
    //         exitLayer.visible = false
    //     }

    //     if (mapType == "Exits") {
    //         pickupLayer.visible = false
    //     }
    //     const WIDTH = 800;
    //     const HEIGHT = 400;
    //     const rt = this.add.renderTexture(0,0, 800, 400)
    //     // fill it with black
    //     rt.fill(0x000000)

    //     // draw the floorLayer into it
    //     rt.draw(bglayer)

    //     // set a dark blue tint
    //     rt.setTint(0x0a2948)
        
    //     player = this.physics.add.sprite(0,0, 'player')
    //     player.setCollideWorldBounds(true);
    //     this.physics.add.collider(player, treeLayer)
    //     cursors = this.input.keyboard.createCursorKeys();
    //     vision = this.make.sprite({
    //         x: player.x,
    //         y: player.y,
    //         key: 'vision',
    //         add: false
    //     })
    //     vision.scale = 1
    //     rt.mask = new Phaser.Display.Masks.BitmapMask(this, vision)
	//     rt.mask.invertAlpha = true
    // }

    // function update(time, delta){
    //     player.setVelocity(0)
    //     if (cursors.right.isDown)
    //     {
    //         player.setVelocityX(SPEED)
    //         player.play('player_right', true);

    //     }
    //     if (cursors.left.isDown)
    //     {
    //         player.setVelocityX(-SPEED)
    //         player.play('player_left', true)

    //     }
    //     if (cursors.up.isDown)
    //     {
    //         player.setVelocityY(-SPEED)
    //         player.play('player_up', true)
    //     }
    //     if (cursors.down.isDown)
    //     {
    //         player.setVelocityY(SPEED)
    //         player.play('player_down', true)
    //     }

    //     if (vision)
	//     {
	// 	    vision.x = player.x
	// 	    vision.y = player.y
	//     }

    //     socket.emit("playerMove", {x: player.x, y: player.y})
    // }
}