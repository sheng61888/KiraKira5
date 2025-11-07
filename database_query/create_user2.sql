CREATE USER 'user_kulsum'@'%' IDENTIFIED BY 'kulsum123';

GRANT ALL PRIVILEGES ON kirakiradb.* TO 'user_kulsum'@'%';

FLUSH PRIVILEGES;