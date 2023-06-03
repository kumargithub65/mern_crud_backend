import { userpost,getalluser,getsingleuser, useredit  , deleteUser ,userstatus, userExport} from "../controllers/userController.js"
import express from "express"
import { upload } from "../multerconfig/storageConfig.js"
export const router = new express.Router()


router.post("/user/register",upload.single("user_profile"),userpost )
router.get("/user/details",getalluser )
router.get("/user/:id",getsingleuser )
router.put("/user/edit/:id",upload.single("user_profile"),useredit )
router.delete("/user/delete/:id",deleteUser )
router.put("/user/status/:id",userstatus )
// router.get("/userexport",userExport )





export default router








