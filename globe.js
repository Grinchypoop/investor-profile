// ===== Globe (Three.js) =====
(function () {
  const container = document.getElementById('globeContainer');
  if (!container) return;

  let initialized = false;

  const globeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !initialized) {
        initialized = true;
        initGlobe();
        globeObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  globeObserver.observe(container);

  function initGlobe() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Globe group
    const globeGroup = new THREE.Group();
    globeGroup.scale.set(0.9, 0.9, 0.9);
    scene.add(globeGroup);

    const RADIUS = 1;

    // Sphere
    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x111111, shininess: 5 })
    );
    globeGroup.add(globeMesh);

    // Country outlines
    fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(worldData => {
        const geojson = topojson.feature(worldData, worldData.objects.countries);
        geojson.features.forEach(country => {
          if (country.geometry.type === 'Polygon') {
            drawOutline(country.geometry.coordinates);
          } else if (country.geometry.type === 'MultiPolygon') {
            country.geometry.coordinates.forEach(p => drawOutline(p));
          }
        });
      });

    function drawOutline(coordinates) {
      const points = coordinates[0].map(([lng, lat]) => latLngToVec3(lat, lng, RADIUS, 0.005));
      if (points.length > 1) {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0x1a8a7d, opacity: 0.5, transparent: true });
        globeGroup.add(new THREE.Line(geo, mat));
      }
    }

    function latLngToVec3(lat, lng, radius, alt) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = radius + (alt || 0);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Pins for key education markets
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x27c39f });
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x27c39f, transparent: true, opacity: 0.25 });

    // Singapore pin (larger, brighter)
    const sgPos = latLngToVec3(1.35, 103.82, RADIUS, 0.03);
    const sgPin = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff6b9d })
    );
    sgPin.position.copy(sgPos);
    globeGroup.add(sgPin);
    const sgHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff6b9d, transparent: true, opacity: 0.2 })
    );
    sgHalo.position.copy(sgPos);
    globeGroup.add(sgHalo);

    // SEA & expansion markets
    const markets = [
      { lat: 3.14, lng: 101.69, label: 'Malaysia' },
      { lat: 13.76, lng: 100.50, label: 'Thailand' },
      { lat: -6.21, lng: 106.85, label: 'Indonesia' },
      { lat: 14.60, lng: 120.98, label: 'Philippines' },
      { lat: 21.03, lng: 105.85, label: 'Vietnam' },
      { lat: 22.32, lng: 114.17, label: 'Hong Kong' },
      { lat: 28.61, lng: 77.21, label: 'India' },
      { lat: 51.51, lng: -0.13, label: 'UK' },
      { lat: -33.87, lng: 151.21, label: 'Australia' },
      { lat: 25.20, lng: 55.27, label: 'Dubai' },
    ];

    markets.forEach(m => {
      const pos = latLngToVec3(m.lat, m.lng, RADIUS, 0.03);
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), pinMat);
      pin.position.copy(pos);
      globeGroup.add(pin);

      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), haloMat);
      halo.position.copy(pos);
      globeGroup.add(halo);
    });

    // Animate
    let lastTime = 0;
    function animate(time) {
      requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      globeGroup.rotation.y += 0.15 * delta;
      renderer.render(scene, camera);
    }
    animate(0);

    // Resize
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  }
})();
