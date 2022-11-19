import express, { Application, Request, response, Response } from 'express';
import bodyParser from 'body-parser';
import axios, {AxiosError, AxiosResponse} from 'axios'; 
import cookieParser from 'cookie-parser'
import { JsonObjectExpression } from 'typescript';
import {GameResponse} from './gameresponse'

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

app.get('/games/:gamename', (req: Request, res: Response) =>{

    var request:game_request = JSON.parse(JSON.stringify(req.body))

    var game_name:string = req.params.gamename

    console.log(game_name)

    var tokensList = JSON.parse(JSON.stringify(req.cookies))
    
    if(tokensList.hasOwnProperty('access_token')){
        axios.post(`${BASE_URL}/games`,`fields name ,id, cover, genres, summary; where name ~ "${game_name}"*; sort rating desc; limit 10;`, {
            headers:{
                'Client-ID': 'k05d397kpvmewomdscqorlsurxvj1h', 
                'Authorization' : `Bearer ${tokensList["access_token"]}`
            }
        }).then((response: AxiosResponse)=>{
            var gameresponseArray: GameResponse[] = response.data
            console.log(response.data)
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
