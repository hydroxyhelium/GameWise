import express, { Application, Request, response, Response } from 'express';
import bodyParser from 'body-parser';
import axios, {AxiosError, AxiosResponse} from 'axios'; 
import cookieParser from 'cookie-parser'
import { JsonObjectExpression } from 'typescript';
import {GameResponse} from './gameresponse'
import {GamesRoute} from './gamesroute'

require('dotenv').config() 

const app: Application = express();
//const cookieParser = require('cookie-parser')

var BASE_URL = "https://api.igdb.com/v4" 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

var client_id:string = 'k05d397kpvmewomdscqorlsurxvj1h'
var client_secret:string = '5mpcxo37j8gu9wze225i6mizlueqnj'
var grant_type:string = 'client_credentials'

// we store the access token along with the timestamp on the cookie, if the cookie is expired, or does not exists,
// we generate a new cookie for the user. 

type game_request= { 
    'game_name': string, 
}

app.get('/games', (req: Request, res: Response) =>{

    var request:game_request = JSON.parse(JSON.stringify(req.body))

    var game_name:string = request.game_name

    var finalresponse:GamesRoute = {
        'status':"", 
        'url':"", 
        'summary':""
    }

    console.log(game_name)

    var tokensList = JSON.parse(JSON.stringify(req.cookies))
    
    if(tokensList.hasOwnProperty('access_token')){
        axios.post(`${BASE_URL}/games`,`fields name ,id, screenshots, genres, summary; where name ~ "${game_name}"*; sort rating desc; limit 10;`, {
            headers:{
                'Client-ID': 'k05d397kpvmewomdscqorlsurxvj1h', 
                'Authorization' : `Bearer ${tokensList["access_token"]}`
            }
        }).then((response: AxiosResponse)=>{

            var gameresponseArray:[] = response.data
            var perfectexample:GameResponse={
                'id':0, 
                'screenshots':[0], 
                'genres':[0], 
                'name':"name", 
                'summary':"name"
            };         
            if(gameresponseArray.length !== 0){

                var bool:Boolean = true; 
                var index:number = 0; 
                while(bool){
                    if(index === gameresponseArray.length-1){
                        break; 
                    }
                    else{
                        var element:any = gameresponseArray[index]

                        if(element && element.hasOwnProperty("screenshots") && element.hasOwnProperty("summary")){
                            perfectexample = element
                            bool = false; 
                        }
                    }
                    index +=1
                }

                if(bool){
                    res.send(finalresponse)
                }
                else {
                var coverstring:number = perfectexample["screenshots"][0] 

                axios.post(`${BASE_URL}/screenshots`,`fields url; where id=${coverstring}; limit 10;`, 
                {
                    headers:{
                        'Client-ID': 'k05d397kpvmewomdscqorlsurxvj1h', 
                        'Authorization' : `Bearer ${tokensList["access_token"]}`
                    }
                }
                ).then((response:AxiosResponse)=>{
                    finalresponse["status"]="found"; 
                    finalresponse["summary"]=perfectexample["summary"]
                    finalresponse["url"]="https:"+response.data[0]["url"]
                    finalresponse["url"] = finalresponse["url"].replace("t_thumb","t_cover_big")
                    res.send(finalresponse)

                }).catch((error:any)=>{
                    console.log(error)
                })
                }
            }
            else{
                res.send(finalresponse)
            }
        })
    }
})

app.get('/', (req: Request, res: Response) => {

    var tokensList = JSON.parse(JSON.stringify(req.cookies))

    if(tokensList.hasOwnProperty('access_token')){
        console.log(tokensList['access_token'])
    }
    else{
        axios.
    post(
        `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=${process.env.GRANT_TYPE}`)
        .then((response:AxiosResponse)=>{
        var access_token = response.data["access_token"]
        var expires_in = response.data["expires_in"]
        res.cookie(`access_token`, access_token, {
            maxAge: expires_in, 
            sameSite: 'lax'
        })
        res.send("token send successfully")
    }).catch((error: AxiosError)=>{
        console.log(error)
    })
    }
})


const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})
