window.onload = () => {
    const cnv = document.getElementById('cnv'),
          c   = cnv.getContext('2d'),
          res = 16,
          w   = cnv.width  = innerWidth  + res * 10,
          h   = cnv.height = innerHeight + res * 10;

    cnv.style.position = 'relative';
    cnv.style.left     = -res * 5 + 'px';
    cnv.style.top      = -res * 5 + 'px';

    const debug = false;
    const old = location.hash == '#old';

    let field = [];
    for (let x = 0; x < Math.ceil(w / res); ++x) {
        field[x] = [];
        for (let y = 0; y < Math.ceil(h / res); ++y) {
            field[x][y] = vecPolar(Math.random() * Math.PI * 2, Math.random());
        }
    }

    function lerp(a, b, c) {
        return (b - a) * c + a;
    }

    function bilinear(vec) {
        const x = vec.x, y = vec.y;
        if (Math.ceil(x / res) >= Math.ceil(w / res) || Math.ceil(y / res) >= Math.ceil(h / res)) {
            return field[Math.floor(x / res)][Math.floor(y / res)];
        } else {
            const cx = (x / res) % 1;
            const cy = (y / res) % 1;

            // order: 12
            //        34
            const { x: x1, y: y1 } = field[Math.floor(x / res)][Math.floor(y / res)] || new Vector();
            const { x: x2, y: y2 } = field[Math.ceil (x / res)][Math.floor(y / res)] || new Vector();
            const { x: x3, y: y3 } = field[Math.floor(x / res)][Math.ceil (y / res)] || new Vector();
            const { x: x4, y: y4 } = field[Math.ceil (x / res)][Math.ceil (y / res)] || new Vector();

            const nx1 = lerp(x1, x2, cx);
            const ny1 = lerp(y1, y2, cx);
            const nx2 = lerp(x3, x4, cx);
            const ny2 = lerp(y3, y4, cx);

            const nx = lerp(nx1, nx2, cy);
            const ny = lerp(ny1, ny2, cy);

            return new Vector(nx, ny);
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
                    for (let dx = -1; dx <= 1; ++dx) {
                        const nx = x + dx;
                        for (let dy = -1; dy <= 1; ++dy) {
                            const ny = y + dy;
                            if (!(nx < 0 || nx >= field.length || ny < 0 || ny >= field[x].length)) {
                                sum.add(field[nx][ny]);
                            }
                        }
                    }
                    sum.div(9);
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
            c.fillStyle = `hsl(${Math.floor(field[x][y].angle()) + 90}, 100%, ${(field[x][y].mag() / max)**1.2 * 40}%)`;
            c.fillRect(x * res, y * res, res, res);
        }
    }

    console.log('Field drawn');

    if (location.hash == '#circle') {
        const r1 = Math.min(w, h) / 4;
        const r2 = Math.min(w, h) / 5;

        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(w/2, h/2, r1, 0, Math.PI * 2);
        c.fill();

        for (let x = w/2 - r1; x < w/2 + r1; x += 1) {
            for (let y = h/2 - r1; y < h/2 + r1; y += 1) {
                const dist = Math.hypot(x - w/2, y - h/2)
                if (dist <= r2) {
                    c.fillStyle = `hsl(${Math.floor(Math.atan2(y - h/2, x - w/2) / Math.PI * 180 + 90)}, 100%, ${(dist / r2)**1.5 * 50}%)`;
                    c.fillRect(x, y, 1, 1);
                }
            }
        }

        c.fillStyle = '#fff';
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(w, 0);
        c.lineTo(w, h/2);
        c.arc(w/2, h/2, r2, 0, Math.PI * 2, true);
        c.lineTo(w, h/2);
        c.lineTo(w, h);
        c.lineTo(0, h);
        c.clip();
    }

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

                if (old) {
                    this.push( field[Math.floor(this.pos.x / res)][Math.floor(this.pos.y / res)] );
                } else {
                    this.push(bilinear(this.pos));
                }

                this.vel.mult(0.9);

                this.vel.add(this.acc);
                this.pos.add(this.vel);

                this.acc.x = 0;
                this.acc.y = 0;

                if (this.pos.x < 0 || this.pos.x >= w || this.pos.y < 0 || this.pos.y >= h) {
                    this.dead = true;
                } else if (this.age > 256 && this.vel.mag() < 1/256) {
                    this.dead = true;
                }
            }
        }

        this.draw = function() {
            if (debug && this.dead) {
                c.globalAlpha = 1;
                c.fillStyle = '#f00';
                c.beginPath();
                c.arc(this.pos.x, this.pos.y, 5, 0, Math.PI * 2);
                c.fill();
            } else {
                c.fillStyle = '#fff';
                c.globalAlpha = Math.random() * Math.random() * this.vel.mag();

                // if (c.globalAlpha < 1/256) {
                //     this.dead = true;
                // }

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

        if (parts.length < w + h && Math.random() < 100 / frame**0.5) {
            parts.push(new Part());
        }

        parts.forEach(p => p.updt());
        parts = parts.filter(p => !p.dead);

        requestAnimationFrame(draw);
    }

    draw();
}
