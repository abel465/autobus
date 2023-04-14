#defined meld/4.
#defined input_meld/4.

% turns
{ number_of_moves(0..max_num_moves) } = 1.
#minimize {X: number_of_moves(X)}.

{
  tmove(N, I1, I2, C): meld(I2, _, _, _), input_meld(I1, C, _, _), I1 != I2;
  hmove(N, I, C): hand(C, _, _), meld(I, _, _, _)
} = 1 :- N = 1..X, number_of_moves(X).

% state the table at each step 
final_meld(I, C) :- tmove(_, _, I, C).
final_meld(I, C) :- hmove(_, I, C).
final_meld(I, C) :- not hmove(_, _, C), not tmove(_, _, _, C), input_meld(I, C, _, _).

% cannot have a card be in a meld at the end and not be on the table
:- not final_meld(I, C), meld(I, C, _, _).
% cannot be on the table at the end and not be part of a meld
:- final_meld(I, C), not meld(I, C, _, _).

% dont move the same card more than once
:- hmove(N1, _, C), hmove(N2, _, C), N1 != N2.
:- hmove(_, _, C), tmove(_, _, _, C).
:- tmove(N1, _, _, C), tmove(N2, _, _, C), N1 != N2.

% play the earlier slots first
:- hmove(N1, I1, _), hmove(N2,I2, _), N2 > N1, I1 > I2.
% play from hand last
:- hmove(N1, _, _), tmove(N2, _, _, _), N1 < N2.

% play cards in a meld in a consistent order
hmove(N, I, C, R, S) :- hmove(N, I, C), meld(_, C, R, S).
:- hmove(N1, I, C1, R1, S1), hmove(N2, I, C2, R2, S2), N2 > N1, R1 < R2.

#show tmove/4.
#show hmove/3.
