/* 3D lagoon background (three.js r128) */
(function () {
  try {
    var dark = matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.dataset.theme === 'dark';
    var sky = new THREE.Color(dark ? 0x06222a : 0xbfe6f0);
    var R = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    var S = new THREE.Scene(); S.background = sky; S.fog = new THREE.Fog(sky, 30, 95);
    var cam = new THREE.PerspectiveCamera(55, 1, .1, 200);
    S.add(new THREE.HemisphereLight(dark ? 0x6fb7c9 : 0xffffff, 0x0b4f55, dark ? .55 : .8));
    var sun = new THREE.DirectionalLight(dark ? 0x9bb8ff : 0xfff1d0, dark ? .7 : 1.1); sun.position.set(20, 30, 10); S.add(sun);
    var sea = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 80, 80), new THREE.MeshPhongMaterial({ color: dark ? 0x127c86 : 0x1fb5b0, flatShading: true, shininess: 70, transparent: true, opacity: .93 }));
    sea.rotation.x = -Math.PI / 2; S.add(sea);
    var pos = sea.geometry.attributes.position, n0 = pos.count;
    function palm(g, x, z, s) {
      var p = new THREE.Group(), t = new THREE.Mesh(new THREE.CylinderGeometry(.08 * s, .13 * s, 2.2 * s, 6), new THREE.MeshPhongMaterial({ color: 0x8a6a45 }));
      t.position.y = 1.1 * s; t.rotation.z = .15; p.add(t);
      for (var i = 0; i < 6; i++) {
        var l = new THREE.Mesh(new THREE.ConeGeometry(.28 * s, 1.6 * s, 4), new THREE.MeshPhongMaterial({ color: 0x2f9e57, flatShading: true }));
        l.position.set(Math.cos(i) * .7 * s + .3 * s, 2.2 * s, Math.sin(i) * .7 * s); l.rotation.set(Math.sin(i) * 1.3, 0, -Math.cos(i) * 1.3); p.add(l);
      }
      p.position.set(x, .5, z); g.add(p);
    }
    function island(x, z, r) {
      var g = new THREE.Group();
      var sand = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.2, 1.4, 28), new THREE.MeshPhongMaterial({ color: 0xf3deb0, flatShading: true })); sand.position.y = .1; g.add(sand);
      var gr = new THREE.Mesh(new THREE.SphereGeometry(r * .78, 20, 12), new THREE.MeshPhongMaterial({ color: 0x3aa65f, flatShading: true })); gr.scale.y = .3; gr.position.y = .8; g.add(gr);
      for (var i = 0; i < 9; i++) { var a = i * 2.4, q = r * .6 * (.5 + (i % 3) * .25); palm(g, Math.cos(a) * q, Math.sin(a) * q, .8 + (i % 4) * .18); }
      g.position.set(x, 0, z); S.add(g);
    }
    island(-10, -8, 6); island(18, -28, 4.5); island(-30, -30, 3.5);
    var boat = new THREE.Group();
    boat.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .5, .8), new THREE.MeshPhongMaterial({ color: 0xf28c38 })));
    var sail = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.8, 3), new THREE.MeshPhongMaterial({ color: 0xffffff })); sail.position.y = 1.1; boat.add(sail); S.add(boat);
    var K = [[0, 7, 26, -6, 1, -8], [-15, 5, 6, -10, 1, -8], [-4, 4, -4, -10, 1, -8], [12, 6, -12, 18, 1, -28], [6, 13, -18, 4, 0, -18]];
    var mx = 0, my = 0, P = 0, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
    function size() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
    addEventListener('resize', size); size();
    var look = new THREE.Vector3(), tgt = new THREE.Vector3();
    function frame(ms) {
      var t = reduce ? 0 : ms / 1000, h = document.documentElement.scrollHeight - innerHeight;
      P += ((h > 0 ? scrollY / h : 0) - P) * .06;
      var f = P * (K.length - 1), i = Math.min(Math.floor(f), K.length - 2), u = f - i; u = u * u * (3 - 2 * u);
      var a = K[i], b = K[i + 1];
      cam.position.set(a[0] + (b[0] - a[0]) * u + mx * 3, a[1] + (b[1] - a[1]) * u - my * 1.5, a[2] + (b[2] - a[2]) * u);
      tgt.set(a[3] + (b[3] - a[3]) * u, a[4] + (b[4] - a[4]) * u, a[5] + (b[5] - a[5]) * u);
      look.lerp(tgt, .1); cam.lookAt(look);
      for (var k = 0; k < n0; k++) { var x = pos.getX(k), y = pos.getY(k); pos.setZ(k, Math.sin(x * .25 + t) * .3 + Math.cos(y * .2 + t * 1.3) * .25); }
      pos.needsUpdate = true;
      var s = (Math.sin(t * .12) + 1) / 2;
      boat.position.set(-10 + 28 * s, .35 + Math.sin(t * 2) * .1, -14 - 14 * s + Math.sin(s * 6) * 2); boat.rotation.y = -1.1; boat.rotation.z = Math.sin(t * 1.6) * .06;
      R.render(S, cam); requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  } catch (e) { console.error('3D scene unavailable', e); }
})();
