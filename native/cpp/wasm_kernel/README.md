# CAPSULA C++ Kernel Lane

This is a real native computation lane, not a placeholder. It gives CAPSULA a compiled systems-code surface for signal, math, simulation, and later WASM/WASI work.

## Local native smoke test

```bash
cmake -S native/cpp/wasm_kernel -B native/cpp/wasm_kernel/build
cmake --build native/cpp/wasm_kernel/build
./native/cpp/wasm_kernel/build/capsula_kernel
```

## Direct compiler path

```bash
g++ -std=c++20 -O2 native/cpp/wasm_kernel/main.cpp -o /tmp/capsula-kernel
/tmp/capsula-kernel
```

## WASM direction

When Emscripten is present:

```bash
em++ -std=c++20 -O3 native/cpp/wasm_kernel/main.cpp -s WASM=1 -o web/public/capsula_kernel.js
```

The platform must keep the distinction clear:

- native C++ compile: ready when a compiler is installed
- WASM compile: ready when Emscripten or WASI SDK exists
- browser worker integration: release-gated before user claims
