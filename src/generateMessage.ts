import {OpenAiInput} from './openAIinput'

const GenerateMessage = (object:OpenAiInput)=>{
    var list_of_movies_liked:string = ""
    var list_of_movies_disliked:string = ""

    object.likes.forEach((e)=>{
        list_of_movies_liked+=` ${e},`
    })

    object.dislikes.forEach((e)=>{
        list_of_movies_disliked+= ` ${e},`
    })

    return `I like ${list_of_movies_liked} and dislike ${list_of_movies_disliked}, return a random game.`
}

export {GenerateMessage}