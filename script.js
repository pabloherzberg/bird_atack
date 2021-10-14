const canvas = document.getElementById('screen')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const collisionScreen = document.getElementById('collisionScreen')
const collisionCtx = collisionScreen.getContext('2d')
collisionScreen.width = window.innerWidth
collisionScreen.height = window.innerHeight

let score = 0
let gameOver = false
let life = 5
ctx.font = '30px Impact'

let timeToNextRave = 0
let ravenInterval = 500
let lastTime = 0

let ravens = []
let explosions = []
let particles = []

class Raven {
    constructor(){
        this.spriteWidth = 271
        this.spriteHeight = 194
        this.size = Math.random() * .4 + .2
        this.width = this.spriteWidth * this.size
        this.height = this.spriteHeight * this.size
        this.x = canvas.width
        this.y = Math.random() * (canvas.height - this.height)
        this.directionX = Math.random() * 5 + 3
        this.directionY = Math.random() * 5 - 2.5
        this.markedForDeletion = false
        this.image = raven
        this.frame = 0
        this.maxFrame = 4
        this.timeSinceFlap = 0
        this.flapVel = 50
        this.flapInterval = Math.random() * this.flapVel + 50
        this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = `rgb(${this.randomColor[0]}, ${this.randomColor[1]}, ${this.randomColor[2]})`
        this.hasTrail = Math.random() > 0.5
    }
    update(deltaTime){
        if(this.y < 0){
            this.directionY = this.directionY * -1
            this.flapVel = 100
            this.flapInterval = Math.random() * this.flapVel + 50
        }
        if(this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1
            this.flapVel = 10
            this.flapInterval = Math.random() * this.flapVel + 50
        }
        this.x -= this.directionX
        this.y += this.directionY
        this.timeSinceFlap += deltaTime
        if (this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame){
                this.frame = 0
            }else{
                this.frame++
            }
            this.timeSinceFlap = 0
            if(this.hasTrail){
                particles.push(new Particle(this.x, this.y, this.width, this.color))
            }
        }

        if (this.x < 0 -this.width){
            this.markedForDeletion = true
        }
        if (this.x < 0 - this.width){
            life--
        }
        if( life < 0){
            gameOver = true
        }

    }
    draw(){
        collisionCtx.fillStyle = this.color
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(
            this.image, 
            this.frame * this.spriteWidth , 
            0, 
            this.spriteWidth, 
            this.spriteHeight, 
            this.x, 
            this.y, 
            this.width, 
            this.height
        )
    }
}

class Explosion {
    constructor(x, y, size){
        this.image = boom
        this.spriteWidth = 200
        this.spriteHeight = 179
        this.size = size
        this.x = x
        this.y = y
        this.sound = ripsound
        this.frame = 0
        this.timeSinceLastFrame = 0
        this.frameInterval = 150
        this.markedForDeletion = false
    }
    update(deltatime){
        if(this.frame === 0 ){
            this.sound.play()
        }
        this.timeSinceLastFrame += deltatime
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++
            this.timeSinceLastFrame = 0
            if(this.frame > 5){
                this.markedForDeletion = true
            }
        }
    }
    draw(){
        ctx.drawImage(
            this.image, 
            this.frame * this.spriteWidth, 
            0, 
            this.spriteWidth, 
            this.spriteHeight, 
            this.x, 
            this.y - this.size/4, 
            this.size,
            this.size)
    }
}

class Particle {
    constructor(x, y, size, color){
        this.size = size
        this.x = x + this.size/2
        this.y = y + this.size/3
        this.radius = Math.random() * this.size/10
        this.maxRadius = Math.random() * 20 +35
        this.markedForDeletion = false
        this.speedX = Math.random() * 1 + .5
        this.color = color
    }

    update(){
        this.x += this.speedX
        this.radius += 0.8
        if(this.radius > this.maxRadius - 5){
            this.markedForDeletion = true
        }
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = 1 - this.radius/this.maxRadius
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }
}

function drawScore(){
    ctx.fillStyle = 'black'
    ctx.fillText('Placar: ' + score, canvas.width/8, 25)
    ctx.fillStyle = 'white'
    ctx.fillText('Placar: ' + score, canvas.width/8 + 5, 25 + 2)
}

function drawLife(){
    ctx.fillStyle = 'black'
    ctx.fillText('Vidas: ' + life, canvas.width/8, 60)
    ctx.fillStyle = 'white'
    ctx.fillText('Vidas: ' + life, canvas.width/8 + 5, 60 + 2)
}

function drawGameOver(){
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText('FIM DE JOGO: ' + score + ' pontos', canvas.width/2, canvas.height/2)
    ctx.fillStyle = 'white'
    ctx.fillText('FIM DE JOGO: ' + score + ' pontos', canvas.width/2 + 2, canvas.height/2 + 2)
}

window.addEventListener('click', e =>{
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    const pixelColor = detectPixelColor.data
    ravens.forEach( raven => {
        if( raven.randomColor[0] === pixelColor[0] &&
            raven.randomColor[1] === pixelColor[1] &&
            raven.randomColor[2] === pixelColor[2]  ){
                //collision detected
                explosions.push(new Explosion(raven.x, raven.y, raven.width))
                raven.markedForDeletion = true
                if(raven.hasTrail){
                    score += 5
                    life++
                }else{
                    score++
                }
            }
    })
})

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime
    lastTime = timestamp
    timeToNextRave += deltaTime
    
    drawScore()
    drawLife()

    if(timeToNextRave > ravenInterval){
        ravens.push(new Raven())
        timeToNextRave = 0
        ravens = ravens.sort((a, b) => a.width - b.width)
    }
    [...particles, ...ravens, ...explosions].forEach(item=>{
        item.update(deltaTime)
        item.draw()
    })

    ravens = ravens.filter(raven => !raven.markedForDeletion)
    explosions = explosions.filter(explosion => !explosion.markedForDeletion)
    particles = particles.filter(particle => !particle.markedForDeletion)

    if(!gameOver){
        requestAnimationFrame(animate)
    }else{
        drawGameOver()

    } 
}

animate(0)