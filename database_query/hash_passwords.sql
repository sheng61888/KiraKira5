-- Hash existing passwords in usertable
UPDATE usertable
SET password = SHA2(password, 256);
