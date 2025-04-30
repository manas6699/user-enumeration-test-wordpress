
#  WordPress – Chained Attack Detection




## step-by-step guide

1 . At first spin-up the docker : 




```bash
  docker-compose up -d

```




2 . Install my-project with npm

```bash
  cd user-enumeration-test-wordpress
  npm install 
```

3 . Run the script

```
    node astra-assignment.js \
  --target http://localhost:8000/wp-login.php \
  --usernames usernames.txt \
  --passwords passwords.txt
```

Although I have passed the values by default, you can customize the parameters. 
## Sample Output

```
{
 "target": "http://localhost:8000/wp-login.php",
 "vulnerabilities": [
  {
   "type": "User Enumeration",
   "detected": true,
   "vector": "/wp-login.php",
   "confidence": "medium"
  },
  {
   "type": "Brute-force Login",
   "detected": true,
   "vector": "/wp-login.php",
   "usernames_tested": [
    "admin",
    "user1"
   ],
   "credentials_found": [
    {
     "username": "admin",
     "password": "admin"
    }
   ],
   "confidence": "high"
  }
 ]
}

```

