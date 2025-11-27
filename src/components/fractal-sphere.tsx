"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { Button } from '@/components/ui/button';

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

const SPHERE_RADIUS = 2;
const K_NEIGHBORS = 3; 
const SPARK_COUNT = 800;
const COMET_LENGTH = 0.01;

type CometPhase = 'random' | 'wave' | 'spiral';

export function FractalSphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isEnergized, setIsEnergized] = useState(false);

  // Static parameters
  const speed = '1';
  const colorScheme: ColorScheme = 'Quantum Purple';
  const intensity = 33;
  const nodeCount = 100;


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
  const spiralAxisRef = useRef(new THREE.Vector3(0, 1, 0).randomDirection());


  // State for energizing cycle
  const transitionProgressRef = useRef(0);

  // New ref for spiral phase timing
  const spiralPhaseProgressRef = useRef(0);


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
    for (let i = 0; i < lines.length; i++) {
        lines[i].toArray(originPositions, i * 3);
    }
    geometry.setAttribute('originPosition', new THREE.BufferAttribute(originPositions, 3));
    
    return { geometry, neuronCount, connectionCount };
  }, [nodeCount]);

  const colorFunctions: Record<ColorScheme | 'Fire', (t: number) => THREE.Color> =
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
        Fire: (t: number) => new THREE.Color().setHSL(0.05 + t * 0.1, 1.0, 0.5),
      }),
      []
    );
    
  const updateColors = useCallback((transitionProgress = 0) => {
    if (!mindStoneGroupRef.current) return;
    
    const stableColorFunc = colorFunctions[colorScheme];
    const energizedColorFunc = colorFunctions['Fire'];

    const getColor = (t: number) => {
        const stableColor = stableColorFunc(t);
        const energizedColor = energizedColorFunc(t);
        return stableColor.lerp(energizedColor, transitionProgress);
    };

    const line = mindStoneGroupRef.current.getObjectByName("neural-net") as THREE.LineSegments;
    if (line && line.geometry) {
        const colors = [];
        const positions = line.geometry.attributes.position.array;
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
          const t = i / count;
          const color = getColor(t);
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
                const color = getColor(0.5);
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
                (child.material as THREE.LineBasicMaterial).color = new THREE.Color(0x0099ff);
            }
            if (child.name === 'electron') {
                child.traverse(obj => {
                    if (obj instanceof THREE.Mesh && obj.name === 'electron-core') {
                        const electronMaterial = (obj.material as THREE.MeshStandardMaterial);
                        const color = getColor(0.5);
                        electronMaterial.color.set(color);
                        electronMaterial.emissive.set(color);
                    }
                    if (obj instanceof THREE.Sprite && obj.name === 'electron-glow') {
                        (obj.material as THREE.SpriteMaterial).color.set(getColor(0.5));
                    }
                });
            }
             if (child.name === 'nucleus' && child instanceof THREE.Mesh) {
                const nucleusColor = new THREE.Color(0x00ffff).lerp(new THREE.Color(0x111111), transitionProgress);
                (child.material as THREE.MeshBasicMaterial).color = nucleusColor;
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
    if (statsContainer) {
      stats.dom.style.position = 'absolute';
      stats.dom.style.top = '0px';
      stats.dom.style.left = '0px';
      statsContainer.appendChild(stats.dom);
    }
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
      color: 0x0099ff,
      transparent: true,
      opacity: 0.2, // Lower opacity for each line
      fog: false,
    });

    const lineCount = 15; // Number of lines to superimpose
    const radiusStep = 0.005; // Distance between each line

    for (let i = 0; i < 3; i++) {
      const orbitGroup = new THREE.Group(); // Group for each orbit axis
      const orbitRotation = new THREE.Euler(Math.PI / 2, (Math.PI / 3) * i, Math.random() * Math.PI);
      orbitGroup.rotation.copy(orbitRotation);
      atomGroup.add(orbitGroup);

      for (let j = 0; j < lineCount; j++) {
        const currentRadius = orbitRadius + (j - Math.floor(lineCount / 2)) * radiusStep;
        const curve = new THREE.EllipseCurve(
            0, 0,
            currentRadius, currentRadius,
            0, 2 * Math.PI,
            false,
            0
        );
        const points = curve.getPoints(100);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbit = new THREE.Line(orbitGeo, orbitMaterial);
        orbit.name = "orbit";
        orbitGroup.add(orbit); // Add to the specific orbit group
      }

      // Add electron for each of the 3 main orbit axes
      const electronGroup = new THREE.Group();
      electronGroup.name = "electron";
      
      const electronCoreGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 0.02, 16, 16);
      const electronCoreMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 5,
        fog: false,
      });
      const electronCore = new THREE.Mesh(electronCoreGeo, electronCoreMat);
      electronCore.name = "electron-core";
      electronGroup.add(electronCore);

      const glowSpriteMap = new THREE.CanvasTexture(createGlowTexture(128));
      const glowSpriteMaterial = new THREE.SpriteMaterial({
        map: glowSpriteMap,
        color: 0x00ffff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
      const glowSprite = new THREE.Sprite(glowSpriteMaterial);
      glowSprite.name = "electron-glow";
      glowSprite.scale.set(SPHERE_RADIUS * 0.15, SPHERE_RADIUS * 0.15, 1);
      electronGroup.add(glowSprite);

      const electronCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, 2 * Math.PI, false, 0);
      electronGroup.userData = {
          curve: electronCurve,
          orbitRotation: orbitRotation,
          progress: Math.random(),
          baseSpeed: (Math.random() * 0.05 + 0.075),
      };
      atomGroup.add(electronGroup);
    }
    

    const wireframeGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 16);
    const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x6600ff, wireframe: true, opacity: 0.1, transparent: true });
    const wireframeSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
    mindStoneGroup.add(wireframeSphere);

    const { geometry } = generateGeometry();
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
            travelOutward: i < SPARK_COUNT / 2,
            // For spiral
            phi: Math.acos(1 - 2 * Math.random()), // Latitude
            theta: Math.random() * 2 * Math.PI, // Longitude
        };
        cometsGroup.add(comet);
    }
    mindStoneGroup.add(cometsGroup);

    updateColors();

  }, [generateGeometry, updateColors]);
  
  function createGlowTexture(size: number) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return canvas;
  }

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
    let lastTransitionProgress = -1;

    // Easing function: 0 -> 1 -> 0
    const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !mindStoneGroupRef.current) return;

      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();
      const timeFactor = parseFloat(speed);
      
      const TRANSITION_SPEED = delta * 2.0;
      let needsColorUpdate = false;
      
      if (isEnergized) {
        transitionProgressRef.current = Math.min(1, transitionProgressRef.current + TRANSITION_SPEED);
      } else {
        transitionProgressRef.current = Math.max(0, transitionProgressRef.current - TRANSITION_SPEED);
      }
      
      if (Math.abs(transitionProgressRef.current - lastTransitionProgress) > 0.01) {
          needsColorUpdate = true;
          lastTransitionProgress = transitionProgressRef.current;
      }
  
      if (needsColorUpdate) {
        updateColors(transitionProgressRef.current);
      }
      

      if (isPlaying) {
        mindStoneGroupRef.current.rotation.y += 0.002 * timeFactor;

        // Neural network animation - global pulse
        const line = mindStoneGroupRef.current.getObjectByName("neural-net") as THREE.LineSegments;
        if (line && line.geometry) {
            const currentPos = line.geometry.attributes.position as THREE.BufferAttribute;
            const originPos = line.geometry.attributes.originPosition as THREE.BufferAttribute;
            
            const firingRate = intensity / 100;
            const pulseCycle = elapsedTime * timeFactor * firingRate * 2;
            const pulseAmount = (Math.sin(pulseCycle) + 1) / 2; // 0 to 1
            const easedPulse = 0.5 - 0.5 * Math.cos(pulseAmount * Math.PI); // ease in/out

            for (let i = 0; i < currentPos.count; i++) {
                const ox = originPos.getX(i);
                const oy = originPos.getY(i);
                const oz = originPos.getZ(i);

                const pulseStrength = easedPulse * 0.2; // Apply pulse uniformly
                
                const vertexVector = new THREE.Vector3(ox, oy, oz);
                // Apply pulse only if the vertex is on the sphere surface (not at the center)
                if (vertexVector.length() > 0.1) {
                  vertexVector.normalize().multiplyScalar(SPHERE_RADIUS + pulseStrength);
                }

                currentPos.setXYZ(i, vertexVector.x, vertexVector.y, vertexVector.z);
            }
            currentPos.needsUpdate = true;
            (line.material as THREE.LineBasicMaterial).opacity = easedPulse * 0.5 + 0.2;
        }

        // Atom animation
        if (atomGroupRef.current) {
            const nucleus = atomGroupRef.current.getObjectByName('nucleus') as THREE.Mesh;
            if (nucleus) {
                const baseOpacity = (Math.sin(elapsedTime * 1.5) + 1) / 2 * 0.2 + 0.6;
                (nucleus.material as THREE.MeshBasicMaterial).opacity = baseOpacity * (1 - transitionProgressRef.current);
            }

            atomGroupRef.current.children.forEach(child => {
                if (child.name === 'electron') {
                    const electron = child as THREE.Group;
                    const { userData } = electron;
                    
                    const energizedSpeedMultiplier = 4;
                    const currentSpeed = userData.baseSpeed * (1 + (energizedSpeedMultiplier - 1) * transitionProgressRef.current);

                    userData.progress += delta * currentSpeed * timeFactor;
                    if(userData.progress > 1) userData.progress -= 1;
                    
                    const point2D = userData.curve.getPointAt(userData.progress);
                    const point = new THREE.Vector3(point2D.x, point2D.y, 0);
                    
                    // Apply the same rotation as the reference orbit
                    const q = new THREE.Quaternion().setFromEuler(userData.orbitRotation);
                    point.applyQuaternion(q);

                    electron.position.copy(point);
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

                let head, tail;

                if (phaseRef.current === 'spiral') {
                    // Use an easing function for the speed multiplier
                    const easedSpeedMultiplier = easeInOutSine(spiralPhaseProgressRef.current);

                    userData.progress += userData.speed * delta * timeFactor * 0.5 * (1 + easedSpeedMultiplier * 2);

                    const spiralProgress = (userData.progress % 1.0);
                    const turns = 4.0;
                    const currentTheta = userData.theta + spiralProgress * Math.PI * 2 * turns;
                    const currentPhi = userData.phi;
                     
                    const radiusMultiplier = Math.sin(spiralProgress * Math.PI); // In and out pulse

                    head = new THREE.Vector3();
                    head.setFromSphericalCoords(SPHERE_RADIUS * radiusMultiplier, currentPhi, currentTheta);
                    
                    const tailTheta = currentTheta - COMET_LENGTH * 20;
                    tail = new THREE.Vector3();
                    tail.setFromSphericalCoords(SPHERE_RADIUS * radiusMultiplier, currentPhi, tailTheta);

                    head.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), spiralAxisRef.current));
                    tail.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), spiralAxisRef.current));

                } else {
                    let effectiveSpeed = userData.speed;
                    if (phaseRef.current === 'wave') {
                        const dot = userData.direction.dot(waveAxisRef.current);
                        effectiveSpeed = userData.speed * 1.5;
                        const waveDelay = (1 - dot) * 2.5; 
                        userData.progress += (effectiveSpeed * delta * timeFactor) - (waveDelay * 0.001);
                    } else {
                        userData.progress += effectiveSpeed * delta * timeFactor;
                    }

                    let headProgress = userData.travelOutward ? userData.progress : 1 - userData.progress;
                    headProgress = Math.max(0, Math.min(1, headProgress));

                    const tailProgress = userData.travelOutward 
                        ? Math.max(0, headProgress - COMET_LENGTH) 
                        : Math.min(1, headProgress + COMET_LENGTH);

                    head = userData.direction.clone().multiplyScalar(SPHERE_RADIUS * headProgress);
                    tail = userData.direction.clone().multiplyScalar(SPHERE_RADIUS * tailProgress);
                }

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
                       // Reset for other modes
                       userData.delay = 0;
                       if (phaseRef.current === 'spiral') {
                          userData.theta = Math.random() * 2 * Math.PI;
                       }
                    }
                }
            });

             // Phase transition logic
            const SPIRAL_PHASE_LENGTH = 15; // seconds
            if (phaseRef.current === 'spiral') {
                spiralPhaseProgressRef.current += delta / SPIRAL_PHASE_LENGTH;
                if (spiralPhaseProgressRef.current > 1) {
                    spiralPhaseProgressRef.current = 1;
                }
            }


            if (completedComets >= SPARK_COUNT) {
                completedComets = 0;
                iterationCycleRef.current++;
                
                if (iterationCycleRef.current > 2 && iterationCycleRef.current <= 5) {
                    phaseRef.current = 'wave';
                    if (iterationCycleRef.current === 3) {
                        waveAxisRef.current.randomDirection();
                    }
                } else if (iterationCycleRef.current > 5 && iterationCycleRef.current <= 10) {
                    if (phaseRef.current !== 'spiral') {
                       phaseRef.current = 'spiral';
                       spiralPhaseProgressRef.current = 0; // Reset spiral timer
                       if (iterationCycleRef.current === 6) {
                          spiralAxisRef.current.randomDirection();
                       }
                    }
                } else if (iterationCycleRef.current > 10) {
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
  }, [speed, isPlaying, intensity, nodeCount, setupScene, updateColors, isEnergized]);
  
  useEffect(() => {
    updateColors(transitionProgressRef.current);
  }, [colorScheme, updateColors]);

  return (
    <>
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full" />
      <div id="stats-container" className="absolute top-0 left-0 z-20" />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Button
          variant={isEnergized ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEnergized(!isEnergized)}
          className="bg-card/60 backdrop-blur-sm border-primary/20 shadow-lg"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isEnergized ? 'Stabilize' : 'Energize'}
        </Button>
      </div>
    </>
  );
}

    