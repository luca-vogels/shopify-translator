import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import next from 'next';
import {LanguageRouter} from 'lup-language';
import Config from './services/Config.service';
import Upload from "./services/Upload.service";
import routesHandler from "./routes/index";

const dev = Config.isDevMode();
const HTTP_PORT = parseInt(process.env.HTTP_PORT || "") || 80;
const HTTP_BIND = process.env.HTTP_BIND || "0.0.0.0";


// intervals
const interval = function(){
    Upload.freeStorage();
}
interval(); setInterval(interval, 3600*1000);



const nextApp = next({dev});
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async function(){

    const app = express();

    // middleware
    app.use(await LanguageRouter({
        useNextConfigLanguages: true,
        loadTranslations: false,
        redirectRoot: true
    }));
    app.use(express.urlencoded({ extended: true }));

    // all api routes
    app.use(routesHandler);
   
    // all frontend routes
    app.all('*', function(req: Request | any, res: Response){

        let idx1 = req.originalUrl.lastIndexOf("."), idx2 = req.originalUrl.lastIndexOf("/");
        req.url = (idx1 > idx2 || req.originalUrl.startsWith("/"+req.lang)) ? req.originalUrl : "/"+req.lang+req.originalUrl;

        return nextHandler(req, res);
    });

    // start server
    app.listen(HTTP_PORT, HTTP_BIND, function(){
        console.log("Server running at "+HTTP_BIND+":"+HTTP_PORT+" in "+(dev ? "development" : "production")+" mode");
    });


}).catch(function(err: any){
    console.error(err);
});