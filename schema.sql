drop table if EXISTS  myRecords ;


create table  myRecords (
    id serial  PRIMARY KEY,
    country text,
    total_confirmed_cases text,
    total_deaths_cases text,
    total_recovered_cases text,
    the_date text

)