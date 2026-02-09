# Setting Up the Project Locally:
1. Download the Source Code from this github repo.
2. Install Node.js, if not previously installed. (link: https://nodejs.org/en)
3. Ensure the following packages are downloaded:<br>
```
   npm install express
   npm install mysql2
   npm install body-parser
   npm install ollama
```
4. Download MySql (link: https://dev.mysql.com/downloads/) <br>
   Within the server.js file, update the root and password to match the setting used to set up the local MySQL environment.<br>
   Note, there is no need to create any databases. The source code will take care of that!
6. Download the Ollama LLama2 LLM Model, or any model of your choice (link: https://ollama.com/download/)<br>
   Note that models like LLama3 require GPU access to be efficient/fast. <br> When running on subsystems like WSL use the tinyllama model for faster speeds.<br>
8. Setting Up SQL and LLM<br>
   In two different terminals open MySQL and OLLAMA:<br>
     ```
     sudo mysql
     ollama run (name of model)
     ```
9. Type `npm start` in the command line to run the program on localhost:5000/

NOTE: The chosen Text To Speech API only supports transcription on the Chrome web browser.

# Updates
Last Updated: 2/9/2026
Summary:
  - Included set-up instructions
  - Updated npm packages to remove the depreciated mysql package and update with a more supported alternative (mysql2)
  - Included set-up SQL commands to make DB and Table setup easier for users wishing to download source code
