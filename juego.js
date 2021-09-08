// Inicializo la libreria

kaboom({
    global:true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1]
})

const velocidadMov = 120

// Cargando Sprites

// Ruta dinamica para cargar las direcciones
loadRoot('https://i.imgur.com/')

// Sprites de Link
loadSprite('mov-left', 'v3Vi5mN.png')
loadSprite('mov-right', 'Gf0svus.png')
loadSprite('mov-up', 'jKv9dUN.png')
loadSprite('mov-down', 'smc5jmy.png')

// Sprites de enemigo
loadSprite('enem-stand', '7Z6Tmny.png')

// Sprites de paredes
loadSprite('left-wall', 'rfDoaa1.png')
loadSprite('top-wall', 'QA257Bj.png')
loadSprite('bottom-wall', 'vWJWmvb.png')
loadSprite('right-wall', 'SmHhgUn.png')
loadSprite('bottom-left-wall', 'awnTfNC.png')
loadSprite('bottom-right-wall', '84oyTFy.png')
loadSprite('top-left-wall', 'xlpUxIm.png')
loadSprite('top-right-wall', 'z0OmBd1.jpg')
loadSprite('top-door', 'U9nre4n.png')

// Sprites para otros
loadSprite('fire-pot', 'I7xSp7w.png')
loadSprite('left-door', 'okdJNls.png')
loadSprite('lanterns', 'wiSiY09.png')
loadSprite('slicer', 'c6JFi5Z.png')
loadSprite('skeletor', 'Ei1VnX8.png')
loadSprite('kaboom', 'o9WizfI.png')
loadSprite('stairs', 'VghkL08.png')
loadSprite('bg', 'u4DVsx6.png')

// Cargando Escena

scene("game", ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const mapa = [
        [
        'ycc)cc^ccw',
        'a        b',
        'a      * b',
        'a    (   b',
        '%        b',
        'a    (   b',
        'a   *    b',
        'a        b',
        'xdd)dd)ddz',
    ],
    [
        'yccccccccw',
        'a        b',
        ')        )',
        'a     }  b',
        'a        b',
        'a    $   b',
        ')   }    )',
        'a        b',
        'xddddddddz',
    ]
    ]

    const nivelConfig = {
        width: 48,
        height: 48,
        'a': [sprite('left-wall'), solid(), 'wall'],
        'b': [sprite('right-wall'), solid(), 'wall'],
        'c': [sprite('top-wall'), solid(), 'wall'],
        'd': [sprite('bottom-wall'), solid(), 'wall'],
        'w': [sprite('top-right-wall'), solid(), 'wall'],
        'x': [sprite('bottom-left-wall'), solid(), 'wall'],
        'y': [sprite('top-left-wall'), solid(), 'wall'],
        'z': [sprite('bottom-right-wall'), solid(), 'wall'],
        '%': [sprite('left-door'), solid()],
        '^': [sprite('top-door'), 'next-level'],
        '$': [sprite('stairs'), 'next-level'],
        '*': [sprite('slicer'), 'slicer', {dir: -1}, 'dangerous'],
        '}': [sprite('enem-stand'), 'dangerous', 'skeletor', {dir: -1, timer: 0} ],
        ')': [sprite('lanterns'), solid()],
        '(': [sprite('fire-pot'), solid()],
    }

    addLevel(mapa[level], nivelConfig)

    add([sprite('bg'), layer('bg')])

    const scoreLabel = add([
        text('0'),
        pos(400, 450),
        layer('ui'),
        {
            value: score,
        },
        scale(2)
    ])

    add([text('level' + parseInt(level + 1)), pos(400,485), scale(2)])

    // Añadiendo al player: dentro de la constante añadimos por metodo
    // cargando el sprite (a la derecha), la posición, un objero para 
    // definir la dirección.

    const player = add([
        sprite('mov-right'),
        pos(5, 190),
        {
          // Inicia por defecto a la derecha
          dir: vec2(1, 0),
        },
      ])

      // Añadimos el sprite del personaje 
      // al escenario.

      player.action(() => {
          player.resolve()
      })

      // Condicionamos las flechas del teclado para
      // darle movimiento al sprite.

      keyDown('left', () => {
          player.changeSprite('mov-left')
          player.move(-velocidadMov, 0)
          player.dir = vec2(-1, 0)
      })

      keyDown('right', () => {
        player.changeSprite('mov-right')
        player.move(velocidadMov, 0)
        player.dir = vec2(1, 0)
      })
    
      keyDown('up', () => {
        player.changeSprite('mov-up')
        player.move(0, -velocidadMov)
        player.dir = vec2(0, -1)
      })
    
      keyDown('down', () => {
        player.changeSprite('mov-down')
        player.move(0, velocidadMov)
        player.dir = vec2(0, 1)
      })


      player.overlaps('next-level', () => {
        go("game", {
            level: (level + 1) % mapa.length,
            score: scoreLabel.value
        })
      })

      function atacar(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom'])
        wait(1, () => {
          destroy(obj)
        })
      }

      collides ('kaboom', 'skeletor', (k, s) => {
        camShake(4)
        wait(1, () => {
          destroy(k)
        })
        destroy(s)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
      })

      keyPress('space', () => {
        atacar(player.pos.add(player.dir.scale(50)))
      })

      const slicerSpeed = 100

      action('slicer', (s) => {
        s.move(s.dir * slicerSpeed, 0)
      })

      collides('slicer', 'wall', (s) => {
        s.dir = -s.dir
      })

      const skeletorSpeed = 70

      action('skeletor', (s) => {
        s.move(0, s.dir * skeletorSpeed)
        s.timer -= dt()

        if (s.timer <= 0) {
          s.dir = -s.dir
          s.timer = rand(5)
        }
      })

      collides('skeletor', 'wall', (s) => {
        s.dir = -s.dir
      })

      player.overlaps('dangerous', () => {
        go('lose', {score: scoreLabel.value})
      })

})

scene("lose", ({score}) => {
  add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
})

// Inicializo juego por parametro

start ("game", {level:0, score:0})