#defined input_run/4.
#defined input_set/4.
#defined hand/3.

% hand/3.
% hand(card_id, rank, suite)
% hand("5h", 5, h).
% hand("5c+", 5, c).
% hand("6h", 6, h).
% hand("6c+", 6, c).
% hand("7h", 7, h).
% hand("7c+", 7, c).
% hand("8c+", 8, c).
% hand("8h", 8, h).
% hand("9h", 8, h).
hand("2h+", 2, h).
hand("2c", 2, c).
hand("2c+", 2, c).
hand("3c", 3, c).
hand("4c", 4, c).
% hand("9h", 9, h).

% % input_run/4.
% % input_run(run_id, card_id, rank, suite)
input_run(1, "2h", 2, h).
input_run(1, "3h", 3, h).
input_run(1, "4h", 4, h).
% % input_run(1, "5h", 5, h).
% % input_run(2, "5h+", 5, h).
% input_run(2, "6h+", 6, h).
% input_run(2, "7h+", 7, h).
% input_run(2, "8h+", 8, h).
input_run(2, "2d", 2, d).
input_run(2, "3d", 3, d).
input_run(2, "4d", 4, d).
% input_run(2, "9d", 9, d).
% % input_run(1, "5d", 5, d).
% input_run(1, "6d", 6, d).
% input_run(1, "7d", 7, d).
% input_run(1, "8d", 8, d).
% % input_run(3, "5s", 5, s).
% input_run(3, "6s", 6, s).
% input_run(3, "7s", 7, s).
% input_run(3, "8s", 8, s).
% % input_run(1, "8d", 8, d).
% % input_run(1, "9d", 9, d).
% input_run(4, "5c", 5, c).
% input_run(4, "6c", 6, c).
% input_run(4, "7c", 7, c).
% input_run(4, "8c", 8, c).
% % input_run(2, "9c", 9, c).
% % input_run(2, "10c", 10, c).
% % input_run(2, "11c", 11, c).

% input_set/4.
% % input_set(set_id, card_id, rank, suite)
%
% % % hand/3.
% % % hand(card_id, rank, suite)
% % hand("5h", 5, h).
% % hand("5c", 5, c).
% % % hand("5s", 5,s).
% % % hand("6h", 6, h).
% % % hand("6c", 6, c).
% % % hand("7h", 7, h).
% % % hand("7c", 7, c).
% % % hand("8d", 8, d).
% %
% % % input_run/4.
% % % input_run(run_id, card_id, rank, suite)
% % input_run(1, "5d", 5, d).
% % input_run(1, "6d", 6, d).
% % input_run(1, "7d", 7, d).
% % input_run(1, "8d", 8, d).
% %
% % % input_set/4.
% % % input_set(set_id, card_id, rank, suite)
%
% % % hand/3.
% % % hand(card_id, rank, suite)
% % hand("1d+", 1, d).
% % hand("2d+", 2, d).
% % hand("3d+", 3, d).
% % hand("4d+", 4, d).
% % hand("5d+", 5, d).
% % hand("6d+", 6, d).
% % hand("7d+", 7, d).
% % % hand("8d+", 8, d).
% % % hand("9d+", 9, d).
% % % hand("10d+", 10, d).
% %
% % % input_run/4.
% % % input_run(run_id, card_id, rank, suite)
% % % input_run(1, "3d", 3, d).
% % % input_run(1, "4d", 4, d).
% % input_run(1, "2d", 2, d).
% % input_run(1, "3d", 3, d).
% % input_run(1, "4d", 4, d).
% % input_run(1, "5d", 5, d).
% % % input_run(1, "8d", 8, d).
% %
% % % input_set/4.
% % % input_set(set_id, card_id, rank, suite)
%
% hand("9h", 2, h).
% hand("9h", 3, h).
% hand("9h", 4, h).
% hand("9h", 5, h).
% hand("9h", 6, h).
% hand("9h", 7, h).
% hand("9h", 8, h).
% hand("9h", 9, h).
% hand("10h", 10, h).
% hand("11h", 11, h).
% hand("12h", 12, h).
% hand("13h", 13, h).
% hand("1h+", 1, h).
% % input_set(1, "ah", 1, h).
% % input_set(1, "ad", 1, d).
% % input_set(1, "ac", 1, c).
% % input_set(1, "as", 1, s).
% input_run(1, "1d", 1, d).
% input_run(1, "2d", 2, d).
% input_run(1, "3d", 3, d).
% input_run(1, "4d", 4, d).
% input_run(1, "5d", 5, d).
% input_run(1, "6d", 6, d).
% input_run(1, "7d", 7, d).
% input_run(1, "8d", 8, d).
% % input_run(1, "9d", 9, d).
% input_run(1, "10d", 10, d).
% input_run(1, "11d", 11, d).
% input_run(1, "12d", 12, d).
% input_run(1, "13d", 13, d).
% input_run(1, "1d+", 1, d).
% % input_run(2, "1h", 1, h).
% % input_run(2, "2h", 2, h).
% % input_run(2, "3h", 3, h).
% % input_run(2, "4h", 4, h).
% % input_run(2, "5h", 5, h).
% % input_run(2, "6h", 6, h).
% % input_run(2, "7h", 7, h).
% % input_run(2, "8h", 8, h).
% % input_run(2, "9h", 9, h).
% % input_run(2, "10h", 10, h).
% % input_run(2, "11h", 11, h).
% % input_run(2, "12h", 12, h).
% % input_run(2, "13h", 13, h).
% % input_run(2, "1h+", 1, h).
