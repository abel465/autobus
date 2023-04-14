#const num_slots = 17.
slot(0..num_slots - 1).

% sanity check input
malformed_input(C) :- hand(C), input_meld(_, C, _, _).
malformed_input(C) :- input_card(C, R1, _), input_card(C, R2, _), R1 != R2.
malformed_input(C) :- input_card(C, _, S1), input_card(C, _, S2), S1 != S2.
malformed_input(C) :- input_meld(I1, C, _, _), input_meld(I2, C, _, _), I1 != I2.
malformed_input(I) :- input_meld(I, _, _, _), { input_meld(I, _, _, _) } < 3.
input_card(C, R, S) :- input_meld(_, C, R, S).
input_card(C, R, S) :- hand(C, R, S).


play(C, R, S) :- input_meld(_, C, R, S).

%% generate
{ play(C, R, S) } :- hand(C, R, S).
{ meld(I, C, R, S): slot(I) } = 1 :- play(C, R, S).
run(I, C, R, S), set(I, C, R, S) :- meld(I, C, R, S).

%% define
connected(I, 1, R) :- connected(I, R, 13).
connected(I, R1, R2) :- run(I, _, R2, _), connected(I, R1, R2 - 1), R1 < R2.
connected(I, R, R) :- run(I, _, R, _).
meld(I, C) :- meld(I, C, _, _).
run(I, C) :- run(I, C, _, _).
set(I, C) :- set(I, C, _, _).
run(I) :- run(I, _).
set(I) :- set(I, _).
meld(I) :- meld(I, _).
play(C) :- play(C, _, _).
hand(C) :- hand(C, _, _).
lay(C) :- play(C), hand(C).
num_hand(X) :- X = { hand(_) }.
num_lay(X) :- X = { lay(_) }.
win :- { hand(_) } = X, X = { lay(_) }.

%% test
% a meld can't be both a run and a set
:- run(I, _, _, _), set(I, _, _, _).
% use meld id's sequentially
:- meld(I1), I1 > 0, not meld(I2), I2 < I1, slot(I2).
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

% prefer to lay down
:~ hand(C), not lay(C). [1@2,C]
% prefer to not change slots
:~ input_meld(I1, C, _, _), meld(I2, C), I1 != I2. [1@1,C]


#show meld/4.
#show win/0.
#show malformed_input/1.
