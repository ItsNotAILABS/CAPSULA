cmake_minimum_required(VERSION 3.22)
project(capsula_wasm_kernel LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(capsula_kernel main.cpp)

target_compile_options(capsula_kernel PRIVATE -Wall -Wextra -Wpedantic)
