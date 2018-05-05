const cnv = document.getElementById('cnv'),
      c   = cnv.getContext('2d'),
      res = 16,
      w   = cnv.width  = innerWidth  + res * 2,
      h   = cnv.height = innerHeight + res * 2;

cnv.style.position = 'relative';
cnv.style.left     = -res + 'px';
cnv.style.top      = -res + 'px';

const sign = Math.random() < 0.5 ? -1 : 1;

let field = [];

for (let x = 0; x < Math.ceil(w / res); ++x) {
    field[x] = [];
    for (let y = 0; y < Math.ceil(h / res); ++y) {
        field[x][y] = vecPolar(Math.random() * Math.PI * 2, Math.random() * 2);
    }
}

console.log('Field generated');

function average(times) {
    for (let t = 0; t < times; ++t) {
        let avg = [];

        for (let x = 0; x < field.length; ++x) {
            avg[x] = [];

            for (let y = 0; y < field[x].length; ++y) {

                const sum = new Vector();
                let count = 0;
                for (let dx = -1; dx <= 1; ++dx) {
                    const nx = x + dx;
                    for (let dy = -1; dy <= 1; ++dy) {
                        const ny = y + dy;
                        if (!(nx < 0 || nx >= field.length || ny < 0 || ny >= field[x].length)) {
                            sum.add(field[nx][ny]);
                            count++;
                        }
                    }
                }
                sum.div(count);
                avg[x][y] = sum;

            }
        }

        field = avg;
    }
}

average(100);

console.log('Averaged');

let max = 0;
for (let x = 0, lenx = field.length; x < lenx; ++x) {
    for (let y = 0, leny = field[x].length; y < leny; ++y) {
        max = Math.max(max, field[x][y].mag());
    }
}

for (let x = 0, lenx = field.length; x < lenx; ++x) {
    for (let y = 0, leny = field[x].length; y < leny; ++y) {
        c.fillStyle = `hsl(${Math.floor(field[x][y].angle())}, 100%, ${field[x][y].mag() / max * 50}%)`;
        c.fillRect(x * res, y * res, res, res);
    }
}

const start = Math.random() * 360;

function Part(x, y) {
    this.pos = new Vector((x || Math.random() * w), (y || Math.random() * h));
    this.vel = new Vector();
    this.acc = new Vector();

    this.age = 0;
    this.dead = false;

    this.push = function(force) {
        this.acc.add(force);
    }

    this.move = function() {
        if (!this.dead) {
            this.age++;

            this.push( field[Math.floor(this.pos.x / res)][Math.floor(this.pos.y / res)] );

            this.vel.mult(0.9);

            this.vel.add(this.acc);
            this.pos.add(this.vel);

            this.acc.x = 0;
            this.acc.y = 0;

            if (this.pos.x < 0 || this.pos.x >= w || this.pos.y < 0 || this.pos.y >= h) {
                this.dead = true;
            } else if (this.age > 10 && this.vel.mag() < 0.001) {
                this.dead = true;
            }
        }
    }

    this.draw = function() {
        if (!this.dead) {
            // c.globalAlpha = Math.min(1 / Math.pow(this.age, this.age / 64), 0.1);
            c.globalAlpha = Math.random() * Math.random();

            // if (c.globalAlpha < 1/256) {
            //     this.dead = true;
            // }

            //c.fillStyle = `hsl(${Math.floor(start + this.vel.mag() * sign * 360 / 3)}, 100%, 60%)`;
            c.beginPath();
            c.arc(this.pos.x, this.pos.y, Math.sqrt(2) / 2, 0, Math.PI * 2);
            c.fill();
        }
    }

    this.updt = function() {
        this.move();
        this.draw();
    }
}

c.fillStyle = '#fff';

let parts = [];
let frame = 0;

function draw() {
    frame += 1;

    for (let i = 0; i < 3; ++i) {
        parts.push(new Part());
    }

    parts.forEach(p => p.updt());
    parts = parts.filter(p => !p.dead);

    requestAnimationFrame(draw);
}

draw();
