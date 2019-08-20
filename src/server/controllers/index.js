import express from "express"

import schools from "./schools"
import teachers from "./teachers"
import documents from "./documents"
import pond from "./pond"

const router = express.Router()

router.use("/schools", schools)
router.use("/teachers", teachers)
router.use("/documents", documents)
router.use("/pond", pond)

export default router
