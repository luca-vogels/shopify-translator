import multer from 'multer';
import Upload from "../services/Upload.service";
import {Router} from 'express';
const app = Router();
const upload = multer(Upload.MULTER_SETTINGS);


app.post("/upload", upload.single("file"), async(req: any, res) => {
    await Upload.handleFiles(req.file);
    await Upload.handleFiles(req.files);
    res.redirect(303, "/"+req.lang+"/"+(req.file ? req.file.filename : ""));
});

export default app;