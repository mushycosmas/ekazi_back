// import { diskStorage } from 'multer';
// import { extname, join } from 'path';
// import * as fs from 'fs';

// export const multerConfig = (folder: string) => ({
//   storage: diskStorage({
//     destination: (req, file, cb) => {
//       const uploadPath = join(process.cwd(), 'uploads', folder);

//       // create folder if not exists
//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//       }

//       cb(null, uploadPath);
//     },

//     filename: (req, file, cb) => {
//       const uniqueName =
//         Date.now() + '-' + Math.round(Math.random() * 1e9);

//       cb(null, uniqueName + extname(file.originalname));
//     },
//   }),
// });
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const multerConfig = (folder: string) => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads', folder);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(null, uniqueName + extname(file.originalname));
    },
  }),
});