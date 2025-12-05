# H2Now-App
Welcome to the **H2Now-App** repository. This repository contains **frontend side**, **backend side**, and **database schema** of the application. This application is based on **Vite**, **React**, and **Tailwind CSS**.

## Before you start coding
1. Make sure you have **npm**, **Python**, and **XAMPP** installed

2. Head to **frontend**, install the **dependencies**, and copy frontend **.env variables**
   ```sh
   cd frontend
   npm i
   cp .env.example .env
   ```

3. Head to **backend**, copy backend **.env variables**, create and activate **virtual environment**, and install the **dependencies**
   ```sh
   cd backend
   cp .env.example .env
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   **Note:** If you installed new python dependencies, make sure to run
   ```sh
   pip freeze > requirements.txt
   ```

## Cookies Setup
For the secret key in the backend .env, just use a **random value** (it can be anything). The secret key is used to **sign off the cookies**.

## Database Setup (via XAMPP/phpMyAdmin)
1. Start **XAMPP Control Panel** → Run **Apache** and **MySQL**.

2. Open **phpMyAdmin** in your browser:  
   ```sh
   http://localhost/phpmyadmin

3. Import the **database schema**. In **phpMyAdmin**:
    - Go to the "Import" tab
    - Choose the file: db/schema.sql
    - Click "Go"

## Running
1. Make sure you imported **database schema** and **Apache** and **MySQL** are running

2. To run the **backend**, use the next command
   ```sh
   flask run
   ```

3. To run the **frontend** you have 2 options
   1. To run **without** PWA features, use:
   
        ```sh
         npm run dev
         ```
   2. To run **with** PWA features, run:
   
        ```sh
         npm run build
         npm run preview
         ```
