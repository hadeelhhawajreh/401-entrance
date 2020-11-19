drop table if exists potter;
create table potter(
    id serial not null primary key,
    image varchar(255),
    name varchar(255),
    patronus varchar(255),
    alive varchar(255)
);
