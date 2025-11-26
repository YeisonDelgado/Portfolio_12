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
const SPARK_COUNT = 1000;
const COMET_LENGTH = 0.01;

type CometPhase = 'random' | 'wave';

export function FractalSphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>('1');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('Original Blue');
  const [intensity, setIntensity] = useState(75);
  const [nodeCount, setNodeCount] = useState(400);
  const [info, setInfo] = useState({ neurons: 0, connections: 0 });

  // Refs for Three.js objects
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const statsRef = useRef<Stats>();
  const mindStoneGroupRef = useRef<THREE.Group>();
  const cometsRef = useRef<THREE.Group>();
  const atomGroupRef = useRef<THREE.Group>();
  const clockRef = useRef(new THREE.Clock());

  // Refs for animation logic state
  const iterationCycleRef = useRef(0);
  const phaseRef = useRef<CometPhase>('random');
  const waveAxisRef = useRef(new THREE.Vector3().randomDirection());


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
    const colorFunc = colorFunctions[colorScheme];

    const line = mindStoneGroupRef.current.getObjectByName("neural-net") as THREE.LineSegments;
    if (line && line.geometry) {
        const colors = [];
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
    }


    if (cometsRef.current) {
        cometsRef.current.children.forEach(child => {
            const comet = child as THREE.Line;
            if (comet.material instanceof THREE.LineBasicMaterial) {
                const colors = [];
                const color = colorFunc(0.5);
                colors.push(color.r * 0.2, color.g * 0.2, color.b * 0.2); // Tail color
                colors.push(color.r, color.g, color.b); // Head color
                (comet.geometry as THREE.BufferGeometry).setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                ((comet.geometry as THREE.BufferGeometry).attributes.color as THREE.BufferAttribute).needsUpdate = true;
            }
        });
    }

    if (atomGroupRef.current) {
        atomGroupRef.current.children.forEach(child => {
            if (child.name === 'orbit' && child instanceof THREE.Line) {
                (child.material as THREE.LineBasicMaterial).color = colorFunc(0.5).multiplyScalar(0.5);
            }
            if (child.name === 'electron' && child instanceof THREE.Mesh) {
                (child.material as THREE.MeshBasicMaterial).color = colorFunc(0.5);
            }
             if (child.name === 'nucleus' && child instanceof THREE.Mesh) {
                (child.material as THREE.MeshBasicMaterial).color = colorFunc(0.5);
            }
        });
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
    
    // Atom Core
    const atomGroup = new THREE.Group();
    atomGroupRef.current = atomGroup;
    mindStoneGroup.add(atomGroup);
    
    const nucleusGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 0.1, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, fog: false, transparent: true, opacity: 0.8 });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleus.name = "nucleus";
    atomGroup.add(nucleus);
    
    const orbitRadius = SPHERE_RADIUS * 0.25;
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      fog: false,
      linewidth: 3,
    });

    for (let i = 0; i < 3; i++) {
        const curve = new THREE.EllipseCurve(
            0, 0,
            orbitRadius, orbitRadius,
            0, 2 * Math.PI,
            false,
            0
        );
        const points = curve.getPoints(100);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbit = new THREE.Line(orbitGeo, orbitMaterial);
        orbit.name = "orbit";
        orbit.rotation.x = Math.PI / 2;
        orbit.rotation.y = (Math.PI / 3) * i;
        orbit.rotation.z = 0;
        atomGroup.add(orbit);

        const electronGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 0.02, 16, 16);
        const electronMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, fog: false });
        const electron = new THREE.Mesh(electronGeo, electronMat);
        electron.name = "electron";
        electron.userData = {
            curve: curve,
            orbit: orbit,
            progress: Math.random(),
            speed: (Math.random() * 0.2 + 0.3)
        };
        atomGroup.add(electron);
    }
    

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

    // Comets
    const cometsGroup = new THREE.Group();
    cometsGroup.name = "comets";
    cometsRef.current = cometsGroup;

    for (let i = 0; i < SPARK_COUNT; i++) {
        const cometGeo = new THREE.BufferGeometry();
        cometGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));

        const cometMat = new THREE.LineBasicMaterial({ 
            vertexColors: true, 
            linewidth: 2,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const comet = new THREE.Line(cometGeo, cometMat);
        comet.userData = {
            direction: new THREE.Vector3().randomDirection(),
            progress: Math.random(),
            speed: (Math.random() * 0.2 + 0.25),
            delay: Math.random() * 5,
            travelOutward: i < SPARK_COUNT / 2 
        };
        cometsGroup.add(comet);
    }
    mindStoneGroup.add(cometsGroup);

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
    let completedComets = 0;

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
        }

        // Atom animation
        if (atomGroupRef.current) {
            const nucleus = atomGroupRef.current.getObjectByName('nucleus') as THREE.Mesh;
            if (nucleus) {
                const coreGlow = (Math.sin(elapsedTime * 2) + 1) / 2 * 0.3 + 0.7; // 0.7 to 1.0
                (nucleus.material as THREE.MeshBasicMaterial).color.setHSL(0.5, 1.0, coreGlow * 0.5);
                (nucleus.material as THREE.MeshBasicMaterial).opacity = (Math.sin(elapsedTime * 1.5) + 1) / 2 * 0.2 + 0.8;
            }

            atomGroupRef.current.children.forEach(child => {
                if (child.name === 'electron') {
                    const electron = child as THREE.Mesh;
                    const { userData } = electron;
                    
                    userData.progress += delta * userData.speed * timeFactor;
                    if(userData.progress > 1) userData.progress -= 1;
                    
                    const point = userData.curve.getPointAt(userData.progress);
                    electron.position.copy(point);
                    electron.position.applyQuaternion(userData.orbit.quaternion);
                }
            });
        }


        // Comets animation
        if (cometsRef.current) {
            cometsRef.current.children.forEach(child => {
                const comet = child as THREE.Line;
                const { userData } = comet;
                
                userData.delay -= delta;
                if (userData.delay > 0) {
                    (comet.material as THREE.Material).opacity = 0;
                    return;
                }
                
                (comet.material as THREE.Material).opacity = 1;

                let effectiveSpeed = userData.speed;
                if (phaseRef.current === 'wave') {
                    const dot = userData.direction.dot(waveAxisRef.current); // -1 to 1
                    // Make comets travel faster as part of the wave front
                    effectiveSpeed = userData.speed * 1.5;
                    // Delay comets based on their position relative to the wave axis
                    const waveDelay = (1 - dot) * 2.5; // Comets opposite to axis are delayed most
                    userData.progress += (effectiveSpeed * delta * timeFactor) - (waveDelay * 0.001);
                } else {
                    userData.progress += effectiveSpeed * delta * timeFactor;
                }

                let headProgress = userData.travelOutward ? userData.progress : 1 - userData.progress;
                headProgress = Math.max(0, Math.min(1, headProgress));

                const tailProgress = userData.travelOutward 
                    ? Math.max(0, headProgress - COMET_LENGTH) 
                    : Math.min(1, headProgress + COMET_LENGTH);

                const head = userData.direction.clone().multiplyScalar(SPHERE_RADIUS * headProgress);
                const tail = userData.direction.clone().multiplyScalar(SPHERE_RADIUS * tailProgress);

                const positions = (comet.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
                tail.toArray(positions, 0);
                head.toArray(positions, 3);
                (comet.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

                if (userData.progress >= 1.0) {
                    userData.progress = 0;
                    completedComets++;

                    if (phaseRef.current === 'random') {
                       userData.direction.randomDirection();
                       userData.delay = Math.random() * 5 + 2;
                    } else {
                       // In wave mode, they just reset progress and wait for the wave
                       userData.delay = 0;
                    }
                }
            });

             // Phase transition logic
            if (completedComets >= SPARK_COUNT) {
                completedComets = 0;
                iterationCycleRef.current++;
                
                if (iterationCycleRef.current > 2 && iterationCycleRef.current <= 8) {
                    phaseRef.current = 'wave';
                    if (iterationCycleRef.current === 3) { // New wave starts
                        waveAxisRef.current.randomDirection();
                    }
                } else if (iterationCycleRef.current > 8) {
                    phaseRef.current = 'random';
                    iterationCycleRef.current = 0; // Reset cycle
                } else {
                    phaseRef.current = 'random';
                }
            }
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
