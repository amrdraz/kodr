# Kodr

# Auth

## Login [/token]

### POST 
+ Request
    
    +  Header
        
            X-Auth-Token: <auth-token>
    + Body

            "username": <username|email>
            "password": <password>

+ Response 200 (application/json)

    + Body
            
            {
                access_token:"kjljadslas788hiy98u34asdas"
                user_id:"h3y1yihi13ku34891893467frcdd89"
            }

+ Response 403 (application/json)

    + Body
            
            {
                message: "Incorrect username or password."
            }
+ Response 400 (application/json)

    + Body
            {
                message: 'This account is not Verified',
                id: user.id,
                email: user.email
            }

## Logout [/logout]

+ Request
    
    +  Header
        
            X-Auth-Token: <auth-token>

### DELETE

+ Response 200



# User

## CRUD [/users]

### GET 


+ Request
    
    +  Header
        
            X-Auth-Token: <auth-token>
