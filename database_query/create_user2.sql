CREATE USER 'user_kulsum'@'%' IDENTIFIED BY 'kulsum123';
CREATE USER 'user_arielle'@'%' IDENTIFIED BY 'arielle123';

GRANT ALL PRIVILEGES ON kirakiradb.* TO 'user_kulsum'@'%';
GRANT ALL PRIVILEGES ON kirakiradb.* TO 'user_arielle'@'%';

FLUSH PRIVILEGES;

SELECT User, Host FROM mysql.user;