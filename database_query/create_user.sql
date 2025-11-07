CREATE USER 'arielle'@'%' IDENTIFIED BY 'arielle';
CREATE USER 'kulsum'@'%' IDENTIFIED BY 'kulsum';
CREATE USER 'teoh'@'%' IDENTIFIED BY 'teoh';

GRANT ALL PRIVILEGES ON kirakiradb.* TO 'arielle'@'%';
GRANT ALL PRIVILEGES ON kirakiradb.* TO 'kulsum'@'%';
GRANT ALL PRIVILEGES ON kirakiradb.* TO 'teoh'@'%';

FLUSH PRIVILEGES;

SELECT User, Host FROM mysql.user;

