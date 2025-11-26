"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  Palette,
  Atom,
  Zap,
  Network,
  Maximize,
} from 'lucide-react';
import { Separator } from './ui/separator';

type ColorScheme =
  | 'Original Blue'
  | 'Plasma'
  | 'Matrix Green'
  | 'Quantum Purple'
  | 'Sunset';
type Speed = '0.5' | '1' | '2';

const SPHERE_RADIUS = 2;
const K_NEIGHBORS = 4;
const SPARK_COUNT = 50;

export function FractalSphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>('1');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('Original Blue');
  const [intensity, setIntensity] = useState(75);
  const [nodeCount, setNodeCount] = useState(400);
  const [info, setInfo] = useState({ neurons: 0, connections: 0 });

  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const statsRef = useRef<Stats>();
  const mindStoneGroupRef = useRef<THREE.Group>();
  const sparksRef = useRef<THREE.Points>();
  const clockRef = useRef(new THREE.Clock());

  const generateGeometry = useCallback(() => {
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      points.push(new THREE.Vector3(x, y, z).multiplyScalar(SPHERE_RADIUS));
    }

    const lines = [];
    for (let i = 0; i < points.length; i++) {
      const distances = [];
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        distances.push({ index: j, dist: points[i].distanceTo(points[j]) });
      }
      distances.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < K_NEIGHBORS; k++) {
        lines.push(points[i], points[distances[k].index]);
      }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(lines);
    const neuronCount = points.length;
    const connectionCount = lines.length / 2;

    const originPositions = new Float32Array(lines.length * 3);
    const endPositions = new Float32Array(lines.length * 3);
    for (let i = 0; i < lines.length; i++) {
      lines[i].toArray(originPositions, i * 3);
      new THREE.Vector3(0, 0, 0).toArray(endPositions, i * 3);
    }
    geometry.setAttribute('originPosition', new THREE.BufferAttribute(originPositions, 3));
    geometry.setAttribute('endPosition', new THREE.BufferAttribute(endPositions, 3));
    
    return { geometry, neuronCount, connectionCount };
  }, [nodeCount]);

  const colorFunctions: Record<ColorScheme, (t: number) => THREE.Color> =
    useMemo(
      () => ({
        'Original Blue': (t: number) => new THREE.Color().setHSL(0.55 + t * 0.2, 1.0, 0.5),
        Plasma: (t: number) =>
          new THREE.Color(
            Math.sin(t * Math.PI),
            Math.sin(t * Math.PI + (2 * Math.PI) / 3),
            Math.sin(t * Math.PI + (4 * Math.PI) / 3)
          ),
        'Matrix Green': (t: number) => new THREE.Color().setHSL(0.35, 1.0, t * 0.4 + 0.3),
        'Quantum Purple': (t: number) => new THREE.Color().setHSL(0.75 + t * 0.1, 0.9, 0.6),
        Sunset: (t: number) => new THREE.Color().setHSL(t * 0.1 + 0.0, 0.9, 0.6),
      }),
      []
    );

  const updateColors = useCallback(() => {
    if (!mindStoneGroupRef.current) return;
    const line = mindStoneGroupRef.current.getObjectByName("neural-net") as THREE.LineSegments;
    if (!line || !line.geometry) return;

    const colors = [];
    const colorFunc = colorFunctions[colorScheme];
    const positions = line.geometry.attributes.position.array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const color = colorFunc(t);
      colors.push(color.r, color.g, color.b);
    }
    line.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    if (line.geometry.attributes.color) {
      line.geometry.attributes.color.needsUpdate = true;
    }

    if (sparksRef.current) {
      (sparksRef.current.material as THREE.PointsMaterial).color.set(colorFunc(0.5));
    }

  }, [colorScheme, colorFunctions]);
  
  const setupScene = useCallback(() => {
    if(!mountRef.current) return;
    // Cleanup existing scene
    if (rendererRef.current) {
      mountRef.current?.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
    if (statsRef.current) {
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer && statsRef.current.dom.parentElement) {
            statsContainer.removeChild(statsRef.current.dom);
        }
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    const stats = new Stats();
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) statsContainer.appendChild(stats.dom);
    statsRef.current = stats;

    const ambientLight = new THREE.AmbientLight(0x6600ff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x0099ff, 2, 10);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const mindStoneGroup = new THREE.Group();
    scene.add(mindStoneGroup);
    mindStoneGroupRef.current = mindStoneGroup;

    const coreSphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 0.1, 32, 32);
    const coreSphereMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, fog: false });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    mindStoneGroup.add(coreSphere);

    const wireframeGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 16);
    const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x6600ff, wireframe: true, opacity: 0.1, transparent: true });
    const wireframeSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
    mindStoneGroup.add(wireframeSphere);

    const { geometry, neuronCount, connectionCount } = generateGeometry();
    setInfo({ neurons: neuronCount, connections: connectionCount });
    const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, fog: false });
    const lineSphere = new THREE.LineSegments(geometry, material);
    lineSphere.name = "neural-net";
    mindStoneGroup.add(lineSphere);

    // Sparks
    const sparksGeometry = new THREE.BufferGeometry();
    const sparksVertices = [];
    const sparksVelocities = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
        sparksVertices.push(0, 0, 0);
        sparksVelocities.push({ 
          vector: new THREE.Vector3().randomDirection(), 
          speed: Math.random() * 2 + 1,
          life: 0
        });
    }
    sparksGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparksVertices, 3));
    sparksGeometry.userData.velocities = sparksVelocities;
    const sparksMaterial = new THREE.PointsMaterial({
        size: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        sizeAttenuation: true,
    });
    const sparks = new THREE.Points(sparksGeometry, sparksMaterial);
    sparks.name = "sparks";
    mindStoneGroup.add(sparks);
    sparksRef.current = sparks;

    updateColors();

  }, [generateGeometry, updateColors]);

  useEffect(() => {
    setupScene();
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mindStoneGroupRef.current) return;

      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();
      const timeFactor = parseFloat(speed);

      if (isPlaying) {
        mindStoneGroupRef.current.rotation.y += 0.002 * timeFactor;

        // Pulsation
        const pulseCycle = (elapsedTime * (2 * Math.PI)) / 1.5;
        const scale = 1 + Math.sin(pulseCycle) * 0.05;
        mindStoneGroupRef.current.scale.set(scale, scale, scale);

        // Neural network animation
        const line = mindStoneGroupRef.current.getObjectByName("neural-net") as THREE.LineSegments;
        if(line && line.geometry) {
            const currentPos = line.geometry.attributes.position as THREE.BufferAttribute;
            const originPos = line.geometry.attributes.originPosition as THREE.BufferAttribute;
            
            const firingRate = intensity / 100;
            const progress = (Math.sin(elapsedTime * timeFactor * firingRate * 2) + 1) / 2;
            const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);

            for (let i = 0; i < currentPos.count; i++) {
                const x = THREE.MathUtils.lerp(0, originPos.getX(i), easedProgress);
                const y = THREE.MathUtils.lerp(0, originPos.getY(i), easedProgress);
                const z = THREE.MathUtils.lerp(0, originPos.getZ(i), easedProgress);
                currentPos.setXYZ(i, x, y, z);
            }
            currentPos.needsUpdate = true;
            
            // Glow intensity
            (line.material as THREE.LineBasicMaterial).opacity = easedProgress * 0.5 + 0.2;
            const coreSphere = mindStoneGroupRef.current.children[0] as THREE.Mesh;
            (coreSphere.material as THREE.MeshBasicMaterial).color.setHSL(0.5, 1.0, easedProgress * 0.2 + 0.4);
        }

        // Sparks animation
        if (sparksRef.current) {
            const sparksGeo = sparksRef.current.geometry;
            const positions = sparksGeo.attributes.position.array as Float32Array;
            const velocities = sparksGeo.userData.velocities;

            for (let i = 0; i < SPARK_COUNT; i++) {
                const i3 = i * 3;
                if (velocities[i].life <= 0) {
                  // Reset spark
                  positions[i3] = 0;
                  positions[i3 + 1] = 0;
                  positions[i3 + 2] = 0;
                  velocities[i].vector.randomDirection();
                  velocities[i].speed = Math.random() * 2 + 1;
                  velocities[i].life = Math.random(); // Random start time
                } else {
                  const velocity = velocities[i].vector.clone().multiplyScalar(velocities[i].speed * delta * timeFactor * 5);
                  positions[i3] += velocity.x;
                  positions[i3 + 1] += velocity.y;
                  positions[i3 + 2] += velocity.z;
                  velocities[i].life -= delta * 0.5;

                  const dist = Math.sqrt(positions[i3]**2 + positions[i3+1]**2 + positions[i3+2]**2);
                  if (dist > SPHERE_RADIUS) {
                    velocities[i].life = 0;
                  }
                }
            }
            sparksGeo.attributes.position.needsUpdate = true;
        }
      }

      controlsRef.current?.update();
      statsRef.current?.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, isPlaying, intensity, nodeCount, setupScene]);
  
  useEffect(() => {
    updateColors();
  }, [colorScheme, updateColors]);

  const handleReset = useCallback(() => {
    if (!controlsRef.current || !mindStoneGroupRef.current) return;
    controlsRef.current.reset();
    mindStoneGroupRef.current.rotation.set(0, 0, 0);
    mindStoneGroupRef.current.scale.set(1, 1, 1);
    clockRef.current.start();
  }, []);
  
  const handleScreenshot = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const renderer = rendererRef.current;
    renderer.render(sceneRef.current, cameraRef.current);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'mind-stone.png';
    link.click();
    toast({
      title: 'Screenshot Saved!',
      description: 'mind-stone.png has been downloaded.',
    });
  }, [toast]);
  
  const handleFullscreen = () => {
    if (mountRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mountRef.current.requestFullscreen();
      }
    }
  };

  return (
    <>
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" />
      <div id="stats-container" className="absolute top-4 left-4 z-20" />

      <Card className="absolute bottom-4 left-4 md:left-auto md:right-4 w-80 max-w-[90vw] bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg z-10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Controls</CardTitle>
          <CardDescription className="text-xs">
            {info.neurons} neurons, {info.connections} links
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} aria-label="Reset View">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleScreenshot} aria-label="Take Screenshot">
              <Camera className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleFullscreen} aria-label="Fullscreen">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          <Separator />
          
          <div className="grid gap-2">
            <Label htmlFor="intensity-slider" className="flex items-center gap-2"><Zap className="h-4 w-4" /> Intensity: {intensity}%</Label>
            <Slider id="intensity-slider" value={[intensity]} onValueChange={(v) => setIntensity(v[0])} min={0} max={100} step={1} />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="nodes-slider" className="flex items-center gap-2"><Network className="h-4 w-4" /> Neurons: {nodeCount}</Label>
            <Slider id="nodes-slider" value={[nodeCount]} onValueChange={(v) => setNodeCount(v[0])} min={100} max={500} step={10} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="speed-select">Speed</Label>
              <Select value={speed} onValueChange={(v: Speed) => setSpeed(v)}>
                <SelectTrigger id="speed-select">
                  <SelectValue placeholder="Speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">Slow (0.5x)</SelectItem>
                  <SelectItem value="1">Normal (1x)</SelectItem>
                  <SelectItem value="2">Fast (2x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color-select">Color Scheme</Label>
              <Select value={colorScheme} onValueChange={(v: ColorScheme) => setColorScheme(v)}>
                <SelectTrigger id="color-select">
                  <SelectValue placeholder="Color Scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Original Blue">Original Blue</SelectItem>
                  <SelectItem value="Plasma">Plasma</SelectItem>
                  <SelectItem value="Matrix Green">Matrix Green</SelectItem>
                  <SelectItem value="Quantum Purple">Quantum Purple</SelectItem>
                  <SelectItem value="Sunset">Sunset</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
