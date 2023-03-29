vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R1) :-
  { meld(I, _) } = 14,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S), run(I, _, R9, S), run(I, _, R10, S), run(I, _, R11, S), run(I, _, R12, S), run(I, _, R13, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8, R8 < R9, R9 < R10, R10 < R11, R11 < R12, R12 < R13.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13) :-
  { meld(I, _) } = 13,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S), run(I, _, R9, S), run(I, _, R10, S), run(I, _, R11, S), run(I, _, R12, S), run(I, _, R13, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8, R8 < R9, R9 < R10, R10 < R11, R11 < R12, R12 < R13.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12) :-
  { meld(I, _) } = 12,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S), run(I, _, R9, S), run(I, _, R10, S), run(I, _, R11, S), run(I, _, R12, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8, R8 < R9, R9 < R10, R10 < R11, R11 < R12.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11) :-
  { meld(I, _) } = 11,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S), run(I, _, R9, S), run(I, _, R10, S), run(I, _, R11, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8, R8 < R9, R9 < R10, R10 < R11.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10) :-
  { meld(I, _) } = 10,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S), run(I, _, R9, S), run(I, _, R10, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8, R8 < R9, R9 < R10.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8, R9) :-
  { meld(I, _) } = 9,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S), run(I, _, R9, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8, R8 < R9.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7, R8) :-
  { meld(I, _) } = 8,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S), run(I, _, R8, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7, R7 < R8.

vrun(I, S, R1, R2, R3, R4, R5, R6, R7) :-
  { meld(I, _) } = 7,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S), run(I, _, R7, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6, R6 < R7.

vrun(I, S, R1, R2, R3, R4, R5, R6) :-
  { meld(I, _) } = 6,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S), run(I, _, R6, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5, R5 < R6.

vrun(I, S, R1, R2, R3, R4, R5) :-
  { meld(I, _) } = 5,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S), run(I, _, R5, S),
  R1 < R2, R2 < R3, R3 < R4, R4 < R5.

vrun(I, S, R1, R2, R3, R4) :-
  { meld(I, _) } = 4,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S), run(I, _, R4, S),
  R1 < R2, R2 < R3, R3 < R4.

vrun(I, S, R1, R2, R3) :-
  { meld(I, _) } = 3,
  run(I, _, R1, S), run(I, _, R2, S), run(I, _, R3, S),
  R1 < R2, R2 < R3.

vset(I, R, S1, S2, S3, S4) :-
  { meld(I, _) } = 4,
  set(I, _, R, S1), set(I, _, R, S2), set(I, _, R, S3), set(I, _, R, S4),
  S1 < S2, S2 < S3, S3 < S4.
vset(I, R, S1, S2, S3) :-
  { meld(I, _) } = 3,
  set(I, _, R, S1), set(I, _, R, S2), set(I, _, R, S3),
  S1 < S2, S2 < S3.

#show vrun/5.
#show vrun/6.
#show vrun/7.
#show vrun/8.
#show vrun/9.
#show vrun/10.
#show vrun/11.
#show vrun/12.
#show vrun/13.
#show vrun/14.
#show vrun/15.
#show vrun/16.
#show vset/5.
#show vset/6.
