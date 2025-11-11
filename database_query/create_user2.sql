CREATE USER 'user_kulsum'@'%' IDENTIFIED BY 'kulsum123';
CREATE USER 'user_teoh'@'%' IDENTIFIED BY 'teoh123';

GRANT ALL PRIVILEGES ON kirakiradb.* TO 'user_teoh'@'%';

FLUSH PRIVILEGES;