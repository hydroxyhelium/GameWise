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

    return `Output a good game to play, I like ${list_of_movies_liked} and ${list_of_movies_disliked}`
}

export {GenerateMessage}