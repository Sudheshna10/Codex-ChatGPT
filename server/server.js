import express  from "express";
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from "openai";

// to use .env variables
dotenv.config(); 

// console.log(process.env.OPENAI_API_KEY)

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// to create instance of OpenAI
const openai = new OpenAIApi(configuration);

// Initialize express application
const app = express();
// to setup middlewares
// for cross origin requests and allow our server to be called from frontend
app.use(cors());
// allows us to pass json from frontend to backend
app.use(express.json());

// get route
// dummy root route
// status 200 - the request has successed
app.get('/', async(req,res) => {
    res.status(200).send({
        message: 'Hello from Codex',
    })
})

// post route
// with get route, we can't receive a lot of data from the frontend.
// post route, allows us to have a body or a payload
app.post('/', async(req, res) => {
    // get the data from the body of the frontend request
    try{
        const prompt = req.body.prompt;
        // to get response from OpenAI API
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0, // higher value means model will take higher risk
            max_tokens: 3000, // tokens to be generated in a completion, can give long responses.
            top_p: 1,
            frequency_penalty: 0.5, // 0 means it will not repeat the sentences very often
            presence_penalty: 0,
        });

        // to send the response back to the frontend
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch(error) {
        console.log(error);
        res.status(500).send({error}) // 500 - the server encountered an unexpected condition that prevented it from fulfilling the request
        // 401 - Unauthorized response status code indicates that the client request has not been completed
        // which means that configuration is not done properly and is not authorized with API key.
    }
})

// for our server to always listen
app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));