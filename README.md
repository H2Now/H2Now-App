# H2Now-App

Before you start coding,

go to /frontend, ```npm install``` the dependencies

Before you install python dependencies, make sure you have your venv activated
go to /backend, ```pip install -r requirements.txt```

Make sure to also do ```cp .env.example .env``` to copy the env variables.

If you installed new python dependencies, make sure to do 
```pip freeze > requirements.txt```

## Cookies Setup
For the secret key in the .env, just use a random value (can be anything). The secret key is used to sign off the cookies.

## Database Setup (via XAMPP/phpMyAdmin)
1. Start **XAMPP Control Panel** → Run **Apache** and **MySQL**.

2. Open **phpMyAdmin** in your browser:  
   ```bash
   http://localhost/phpmyadmin

3. Import the database schema:
    -- In phpMyAdmin:
    -- 1. Go to the "Import" tab
    -- 2. Choose the file: db/schema.sql
    -- 3. Click "Go"


