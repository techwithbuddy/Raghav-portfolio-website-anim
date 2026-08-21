/**
 * universe.js — Three.js loader for RAGHAV OS Project Universe
 * Loads Three.js as an ES module and exposes window.THREE.
 * Dispatches 'three-ready' so script.js can react without polling.
 */
import * as THREE from 'three';

window.THREE = THREE;
window.dispatchEvent(new CustomEvent('three-ready'));
