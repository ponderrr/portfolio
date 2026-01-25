import { useEffect, useState } from "react";
import type { VisualQuality } from "./useVisualQuality";

type BenchmarkResult = {
    quality: VisualQuality;
    fps: number;
    done: boolean;
};

/**
 * Runs a quick GPU benchmark by rendering a simple WebGL scene
 * and measuring frame times. Returns a quality recommendation.
 */
export function useGPUBenchmark(): BenchmarkResult {
    const [result, setResult] = useState<BenchmarkResult>({
        quality: "medium",
        fps: 60,
        done: false,
    });

    useEffect(() => {
        let cancelled = false;

        const runBenchmark = async () => {
            // Create offscreen canvas for benchmarking
            const canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 256;

            const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
            if (!gl) {
                // No WebGL - fallback to low quality
                if (!cancelled) {
                    setResult({ quality: "low", fps: 30, done: true });
                }
                return;
            }

            // Simple vertex shader
            const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(
                vertexShader,
                `
        attribute vec2 a_position;
        varying vec2 v_uv;
        void main() {
          v_uv = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `
            );
            gl.compileShader(vertexShader);

            // Fragment shader with some computation
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(
                fragmentShader,
                `
        precision highp float;
        varying vec2 v_uv;
        uniform float u_time;
        
        void main() {
          float d = 0.0;
          for (int i = 0; i < 50; i++) {
            d += sin(v_uv.x * float(i) + u_time) * cos(v_uv.y * float(i) - u_time);
          }
          gl_FragColor = vec4(vec3(d * 0.02 + 0.5), 1.0);
        }
      `
            );
            gl.compileShader(fragmentShader);

            const program = gl.createProgram()!;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            // Create quad
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
                gl.STATIC_DRAW
            );

            const posLoc = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            const timeLoc = gl.getUniformLocation(program, "u_time");

            // Run benchmark - 30 frames
            const frameTimes: number[] = [];
            let lastTime = performance.now();

            for (let frame = 0; frame < 30 && !cancelled; frame++) {
                gl.uniform1f(timeLoc, frame * 0.1);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                gl.finish(); // Force GPU sync

                const now = performance.now();
                frameTimes.push(now - lastTime);
                lastTime = now;

                // Small delay to not block
                await new Promise((r) => setTimeout(r, 1));
            }

            if (cancelled) return;

            // Calculate average FPS
            const avgFrameTime =
                frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const fps = 1000 / avgFrameTime;

            // Cleanup
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteProgram(program);
            gl.deleteBuffer(buffer);

            // Determine quality based on FPS
            let quality: VisualQuality;
            if (fps >= 120) {
                quality = "high";
            } else if (fps >= 45) {
                quality = "medium";
            } else {
                quality = "low";
            }

            // Also factor in hardware concurrency
            const cores = navigator.hardwareConcurrency ?? 4;
            if (cores < 4 && quality === "high") {
                quality = "medium";
            }

            setResult({ quality, fps: Math.round(fps), done: true });
        };

        runBenchmark();

        return () => {
            cancelled = true;
        };
    }, []);

    return result;
}

export default useGPUBenchmark;
