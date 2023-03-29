run(I, C, R, S), set(I, C, R, S) :- meld(I, C, R, S).

%% define
connected(I, 1, R) :- connected(I, R, 13).
connected(I, R1, R2) :- run(I, _, R2, _), connected(I, R1, R2 - 1), R1 < R2.
connected(I, R, R) :- run(I, _, R, _).
meld(I, C) :- meld(I, C, _, _).
meld(I) :- meld(I, _).
run(I, C) :- run(I, C, _, _).
run(I) :- run(I, _).
set(I, C) :- set(I, C, _, _).
set(I) :- set(I, _).

%% test
% a meld can't be both a run and a set
:- run(I, _, _, _), set(I, _, _, _).
% use meld id's sequentially
:- meld(I1), I1 > 1, not meld(I2), I2 < I1, slot(I2).
% a meld must have at least three cards
:- meld(I), { meld(I, _) } < 3.

% a set cannot contain two cards with the same suite
:- set(I, C1, _, S), set(I, C2, _, S), C1 != C2.
% a set cannot contain two cards with different ranks
:- set(I, _, R1, _), set(I, _, R2, _), R1 != R2.

% a run cannot contain multiple suites
:- run(I, _, _, S1), run(I, _, _, S2), S1 != S2.
% a run cannot contain multiple cards with the same rank except for an ace
:- run(I, C1, R, _), run(I, C2, R, _), C1 != C2, R != 1.
% a run cannot contain multiple aces unless its size is 14
:- run(I, C1, 1, _), run(I, C2, 1, _), C1 != C2, { meld(I, _) } != 14.
% all cards in a run must be connected
:- run(I, _, R1, _), run(I, _, R2, _), not connected(I, R1, R2), R1 < R2.

#show lay/1.
#show win/0.
