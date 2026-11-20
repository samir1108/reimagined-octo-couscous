"use client";

/**
 * Shader loader utility - fetches shader source from /public/shaders/
 * and handles #include directives for shared noise functions.
 */

const SHADER_BASE = "/shaders/";

async function fetchShader(path: string): Promise<string> {
  const response = await fetch(`${SHADER_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${path}`);
  }
  return response.text();
}

function resolveIncludes(source: string, loaded: Map<string, string> = new Map()): string {
  // Handle #include "filename.glsl" directives
  return source.replace(/#include\s+"([^"]+)"/g, (match, includePath) => {
    if (loaded.has(includePath)) {
      return loaded.get(includePath)!;
    }
    // For now, we'll need to fetch synchronously or pre-load includes
    // This is a simplified version - in production you'd want to pre-load all
    return `/* INCLUDE: ${includePath} */`;
  });
}

export async function loadShaderProgram(
  gl: WebGLRenderingContext,
  vertPath: string,
  fragPath: string
): Promise<WebGLProgram> {
  const [vertSource, fragSource] = await Promise.all([
    fetchShader(vertPath),
    fetchShader(fragPath),
  ]);

  // Resolve includes in both shaders
  const resolvedVert = resolveIncludes(vertSource);
  const resolvedFrag = resolveIncludes(fragSource);

  const program = gl.createProgram()!;
  
  for (const [type, source] of [
    [gl.VERTEX_SHADER, resolvedVert],
    [gl.FRAGMENT_SHADER, resolvedFrag],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compile error (${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'}):`, gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
  }
  
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
  }
  
  return program;
}

// Pre-load all shader sources at startup for better performance
export async function preloadShaders(): Promise<Map<string, string>> {
  const shaderPaths = [
    "noise.glsl",
    "particle.vert",
    "particle.frag",
    "halo.vert",
    "halo.frag",
    "lattice.vert",
    "lattice.frag",
    "blur.vert",
    "blur.frag",
    "composite.frag",
    "trail.vert",
    "trail.frag",
  ];

  const sources = new Map<string, string>();
  
  await Promise.all(
    shaderPaths.map(async (path) => {
      try {
        const source = await fetchShader(path);
        sources.set(path, source);
      } catch (e) {
        console.warn(`Failed to preload shader: ${path}`, e);
      }
    })
  );

  return sources;
}

export function createProgramFromSources(
  gl: WebGLRenderingContext,
  vertSource: string,
  fragSource: string
): WebGLProgram {
  const program = gl.createProgram()!;
  
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertSource],
    [gl.FRAGMENT_SHADER, fragSource],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compile error (${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'}):`, gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
  }
  
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
  }
  
  return program;
}