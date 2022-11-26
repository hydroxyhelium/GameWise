import express, { Application, Request, response, Response } from 'express';
import bodyParser from 'body-parser';
import axios, {AxiosError, AxiosResponse} from 'axios'; 
import cookieParser from 'cookie-parser'

var BASE_URL = "https://api.igdb.com/v4" 
import {GameResponse} from './gameresponse'
import {GamesRoute} from './gamesroute'

type game_request= { 
    'game_name': string, 
}

const GetGameInfo = (req:Request, res:Response)=>{

    console.log(req.body)

    var request:game_request = JSON.parse(JSON.stringify(req.body))
    
    var game_name:string = request.game_name

    var finalresponse:GamesRoute = {
        'status':"", 
        'url':"", 
        'summary':"", 
        "name": ""
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
                    finalresponse["name"] = perfectexample["name"]
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
}

export {GetGameInfo}