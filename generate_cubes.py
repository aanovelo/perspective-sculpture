def create_cube(size: float, x: float, y: float, z: float, name: str) -> str:
    output = [f"var {name} = ["]
    # back face
    output.append(f"{x-size/2:.1f}, {y-size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y-size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y+size/2:.1f}, {z+size/2:.1f}, 1.0,\n")
    output.append(f"{x-size/2:.1f}, {y+size/2:.1f}, {z+size/2:.1f}, 1.0,")

    # front face
    output.append(f"{x-size/2:.1f}, {y-size/2:.1f}, {z-size/2:.1f}, 1.0,")
    output.append(f"{x-size/2:.1f}, {y+size/2:.1f}, {z-size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y+size/2:.1f}, {z-size/2:.1f}, 1.0,\n")
    output.append(f"{x+size/2:.1f}, {y-size/2:.1f}, {z-size/2:.1f}, 1.0,")

    # top face
    output.append(f"{x-size/2:.1f}, {y+size/2:.1f}, {z-size/2:.1f}, 1.0,")
    output.append(f"{x-size/2:.1f}, {y+size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y+size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y+size/2:.1f}, {z-size/2:.1f}, 1.0,\n")

    # bottom face
    output.append(f"{x-size/2:.1f}, {y-size/2:.1f}, {z-size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y-size/2:.1f}, {z-size/2:.1f}, 1.0,\n")
    output.append(f"{x+size/2:.1f}, {y-size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x-size/2:.1f}, {y-size/2:.1f}, {z+size/2:.1f}, 1.0,")

    # right face
    output.append(f"{x+size/2:.1f}, {y-size/2:.1f}, {z-size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y+size/2:.1f}, {z-size/2:.1f}, 1.0,\n")
    output.append(f"{x+size/2:.1f}, {y+size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x+size/2:.1f}, {y-size/2:.1f}, {z+size/2:.1f}, 1.0,")

    # left face
    output.append(f"{x-size/2:.1f}, {y-size/2:.1f}, {z-size/2:.1f}, 1.0,")
    output.append(f"{x-size/2:.1f}, {y-size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x-size/2:.1f}, {y+size/2:.1f}, {z+size/2:.1f}, 1.0,")
    output.append(f"{x-size/2:.1f}, {y+size/2:.1f}, {z-size/2:.1f}, 1.0")

    output.append("];")
    return "\n".join(output)


def generate_cubes(
    cube_size: float, cube_spacing: float, width: int, height: int, depth: int
) -> str:
    """
    Generate a 3d array of cubes
    """
    cube_index = 0
    cube_array = []
    for x in range(width):
        for y in range(height):
            for z in range(depth):
                cube_array.append(
                    create_cube(
                        cube_size,
                        (x * (cube_size + cube_spacing)),
                        (y * (cube_size + cube_spacing)),
                        (z * (cube_size + cube_spacing)),
                        f"cube{cube_index}",
                    )
                )
                cube_index += 1
    return "\n\n".join(cube_array)


def generate_draw_calls(start: int, end: int, buffer: str) -> str:
    """
    Helper function to generate the needed draw calls
    """
    calls = []
    for i in range(start, end):
        calls.append(f"drawCubes({buffer}, cube{i});")
    return "\n".join(calls)


def main():
    # Copy cubes and draw calls into their respective parts of lighting.html
    lines = (
        generate_cubes(2, 0.1, 3, 3, 3)
        + "\n\n"
        + generate_draw_calls(0, 27, "cubeBuffer")
    )
    with open("./cubes.txt", "w") as f:
        f.writelines(lines)


if __name__ == "__main__":
    main()
