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
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  RotateCcw,
  Camera,
  Palette,
  ZoomIn,
  ZoomOut,
  Atom,
} from 'lucide-react';
import { Separator } from './ui/separator';

type ColorScheme = 'Rainbow' | 'Plasma' | 'Monochrome' | 'Sunset';
type Speed = '0.5' | '1' | '2';

const NUM_POINTS = 500;
const K_NEIGHBORS = 4;
const SPHERE_RADIUS = 2;

const generateGeometry = () => {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  for (let i = 0; i < NUM_POINTS; i++) {
    const y = 1 - (i / (NUM_POINTS - 1)) * 2; // y goes from 1 to -1
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
  const vertexCount = points.length;
  const lineCount = lines.length / 2;

  const originPositions = new Float32Array(lines.length * 3);
  const endPositions = new Float32Array(lines.length * 3);
  for (let i = 0; i < lines.length; i++) {
    lines[i].toArray(originPositions, i * 3);
    new THREE.Vector3(0, 0, 0).toArray(endPositions, i * 3);
  }
  geometry.setAttribute('originPosition', new THREE.BufferAttribute(originPositions, 3));
  geometry.setAttribute('endPosition', new THREE.BufferAttribute(endPositions, 3));

  return { geometry, vertexCount, lineCount };
};

export function FractalSphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>('1');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('Rainbow');
  const [info, setInfo] = useState({ vertices: 0, lines: 0 });

  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const statsRef = useRef<Stats>();
  const sphereGroupRef = useRef<THREE.Group>();
  const clockRef = useRef(new THREE.Clock());

  const colorFunctions: Record<ColorScheme, (t: number) => THREE.Color> = useMemo(() => ({
    Rainbow: (t: number) => new THREE.Color().setHSL(t, 1.0, 0.6),
    Plasma: (t: number) => new THREE.Color(Math.sin(t * Math.PI), Math.sin(t * Math.PI + (2 * Math.PI / 3)), Math.sin(t * Math.PI + (4 * Math.PI / 3))),
    Monochrome: (t: number) => new THREE.Color().setHSL(207 / 360, 0.7, t * 0.5 + 0.2),
    Sunset: (t: number) => new THREE.Color().setHSL(t * 0.1 + 0.55, 0.8, 0.5),
  }), []);

  const updateColors = useCallback(() => {
    if (!sphereGroupRef.current) return;
    const line = sphereGroupRef.current.children[0] as THREE.LineSegments;
    if (!line || !line.geometry) return;

    const colors = [];
    const colorFunc = colorFunctions[colorScheme];
    const positions = line.geometry.attributes.position.array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const t = (i / count);
      const color = colorFunc(t);
      colors.push(color.r, color.g, color.b);
    }
    line.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    if(line.geometry.attributes.color) {
      line.geometry.attributes.color.needsUpdate = true;
    }
  }, [colorScheme, colorFunctions]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
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

    // --- Controls & Stats ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    const stats = new Stats();
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) statsContainer.appendChild(stats.dom);
    statsRef.current = stats;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // --- Geometry ---
    const { geometry, vertexCount, lineCount } = generateGeometry();
    setInfo({ vertices: vertexCount, lines: lineCount });
    const material = new THREE.LineBasicMaterial({ vertexColors: true });
    const lineSphere = new THREE.LineSegments(geometry, material);
    
    const sphereGroup = new THREE.Group();
    sphereGroup.add(lineSphere);
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;
    updateColors();
    
    // --- Animation Loop ---
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !sphereGroupRef.current) return;
      
      const elapsedTime = clockRef.current.getElapsedTime();
      
      if (isPlaying) {
        const timeFactor = parseFloat(speed);
        // Rotation
        sphereGroupRef.current.rotation.x += 0.005 * timeFactor;
        sphereGroupRef.current.rotation.y += 0.005 * timeFactor;
        sphereGroupRef.current.rotation.z += 0.005 * timeFactor;
        
        // Convergence/Expansion (3s cycle)
        const convergenceProgress = (Math.sin(elapsedTime * timeFactor * (Math.PI * 2 / 3)) + 1) / 2;
        const easedProgress = 0.5 - 0.5 * Math.cos(convergenceProgress * Math.PI);
        
        // Pulse effect
        const pulse = 1 + (Math.sin(convergenceProgress * Math.PI * 2) * 0.05);
        sphereGroupRef.current.scale.set(pulse, pulse, pulse);

        // Animate vertices
        const line = sphereGroupRef.current.children[0] as THREE.LineSegments;
        const currentPos = line.geometry.attributes.position as THREE.BufferAttribute;
        const originPos = line.geometry.attributes.originPosition as THREE.BufferAttribute;
        const endPos = line.geometry.attributes.endPosition as THREE.BufferAttribute;
        
        for (let i = 0; i < currentPos.count; i++) {
          const x = THREE.MathUtils.lerp(endPos.getX(i), originPos.getX(i), easedProgress);
          const y = THREE.MathUtils.lerp(endPos.getY(i), originPos.getY(i), easedProgress);
          const z = THREE.MathUtils.lerp(endPos.getZ(i), originPos.getZ(i), easedProgress);
          currentPos.setXYZ(i, x, y, z);
        }
        currentPos.needsUpdate = true;
      }
      
      controlsRef.current?.update();
      statsRef.current?.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      statsContainer?.removeChild(stats.dom);
    };
  }, [updateColors, isPlaying, speed]);


  useEffect(() => {
    updateColors();
  }, [colorScheme, updateColors]);


  const handleScreenshot = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const renderer = rendererRef.current;
    renderer.render(sceneRef.current, cameraRef.current);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'fractal-sphere.png';
    link.click();
    toast({
      title: 'Screenshot Saved!',
      description: 'fractal-sphere.png has been downloaded.',
    });
  }, [toast]);
  
  const handleReset = useCallback(() => {
    if (!controlsRef.current || !sphereGroupRef.current) return;
    controlsRef.current.reset();
    sphereGroupRef.current.rotation.set(0, 0, 0);
    sphereGroupRef.current.scale.set(1, 1, 1);
    clockRef.current.start();
  }, []);

  return (
    <>
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" />
      <div id="stats-container" className="absolute top-4 left-4 z-20" />

      <Card className="absolute bottom-4 left-4 md:left-auto md:right-4 w-80 max-w-[90vw] bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg z-10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Controls</CardTitle>
          <CardDescription className="text-xs">{info.vertices} vertices, {info.lines} lines</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
          </div>

          <Separator />
          
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
                <SelectItem value="Rainbow">Rainbow</SelectItem>
                <SelectItem value="Plasma">Plasma</SelectItem>
                <SelectItem value="Monochrome">Monochrome</SelectItem>
                <SelectItem value="Sunset">Sunset</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
