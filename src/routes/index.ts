import uploadHandler from "./upload";
import {Router} from 'express';
const app = Router();

app.use(uploadHandler);

export default app;