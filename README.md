Snake-cube
==========

Generating snake cubes [1] of size N x N x N, using a genetic algorithm.

Why
===

Just a bit of fun and learning.

How
===

Representation
--------------

Chromosomes are strings S of length L = N ^ 3 - 1 over the alphabet {u, d, l, r, a}: "u" for up, "d" for down, "l" and "r" for left and right, and "a" for straight ahead. The chromosome encodes a possible solution to the corresponding puzzle T(S) = {u, d, l, r} -> 1, {a} -> 0, where 1 is an angle and 0 is a straight joint.

All solutions start in the corner of the cube.

Fitness
-------

Every block outside the N x N x N cube is punished with [value] fitness and overlapping blocks in the solution are punished with [some other value]. Fitness 0 then represents a correct solution to a correct puzzle.

Links
=====

[1] http://en.wikipedia.org/wiki/Snake_cube